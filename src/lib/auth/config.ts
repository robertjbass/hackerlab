import type { NextAuthConfig } from 'next-auth'
import type { Provider } from 'next-auth/providers'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import { randomBytes } from 'crypto'
import { UserRole, AuthProvider } from '@/collections/User/constants'
import {
  getProviderIdField,
  getImageFieldForProvider,
  getProviderImageUrl,
} from '@/lib/auth/provider-helpers'

function buildProviders(): Provider[] {
  const providers: Provider[] = []

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            scope: 'openid email profile',
            prompt: 'select_account',
          },
        },
        allowDangerousEmailAccountLinking: true,
      }),
    )
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    )
  }

  return providers
}

export const authConfig: NextAuthConfig = {
  providers: buildProviders(),
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      try {
        if (account && user?.id) {
          token.userId = user.id
          token.provider = account.provider
        }
        if (profile) {
          const provider = (token.provider as string) ?? ''
          token.name =
            (profile.name as string | undefined) ||
            ((profile as Record<string, unknown>).login as string | undefined) ||
            token.name
          token.picture =
            getProviderImageUrl(provider, profile as Record<string, unknown>) ??
            token.picture
        }
        return token
      } catch (error) {
        console.error('[Auth] jwt callback error:', error)
        return token
      }
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (!account) return true
      if (!user.id || !user.email) {
        console.error('[Auth] signIn: rejecting — missing user.id or email')
        return false
      }

      const idField = getProviderIdField(account.provider)
      const imageField = getImageFieldForProvider(account.provider)
      if (!idField || !imageField) return true

      try {
        const payload = await getPayload({ config: payloadConfig })
        const normalizedEmail = user.email.toLowerCase()
        const profileRecord = (profile ?? {}) as Record<string, unknown>
        const imageUrl = getProviderImageUrl(account.provider, profileRecord)
        const profileName =
          (profileRecord.name as string) ||
          (profileRecord.login as string) ||
          undefined

        const { docs } = await payload.find({
          collection: 'user',
          where: { email: { equals: normalizedEmail } },
          limit: 1,
        })

        if (docs.length > 0) {
          const existingUser = docs[0]
          await payload.update({
            collection: 'user',
            id: existingUser.id,
            data: {
              [idField]: account.providerAccountId,
              lastAuthMethod: account.provider as AuthProvider,
              name: profileName || existingUser.name,
              [imageField]: imageUrl || existingUser[imageField],
            },
          })
          user.id = String(existingUser.id)
        } else {
          const newUser = await payload.create({
            collection: 'user',
            draft: false,
            data: {
              email: normalizedEmail,
              name: profileName ?? user.name ?? undefined,
              role: UserRole.User,
              authProvider: account.provider as AuthProvider,
              lastAuthMethod: account.provider as AuthProvider,
              [idField]: account.providerAccountId,
              [imageField]: imageUrl ?? undefined,
              password: randomBytes(32).toString('base64'),
            },
          })
          user.id = String(newUser.id)
        }

        // First user to sign up becomes admin — atomic claim via serializable transaction
        const userId = parseInt(user.id, 10)
        const txID = await payload.db.beginTransaction({
          isolationLevel: 'serializable',
        })
        try {
          const req = { payload, transactionID: txID! }
          const { docs: admins } = await payload.find({
            collection: 'user',
            where: { role: { equals: UserRole.Admin } },
            limit: 1,
            req,
          })
          if (admins.length === 0) {
            await payload.update({
              collection: 'user',
              id: userId,
              data: { role: UserRole.Admin },
              req,
            })
          }
          await payload.db.commitTransaction(txID!)
        } catch {
          // Serialization failure means another signup won the race — that's fine
          if (txID) await payload.db.rollbackTransaction(txID)
        }

        return true
      } catch (error) {
        console.error('[Auth] signIn callback error:', error)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      const loginPath = '/admin/login'
      if (
        url === `${baseUrl}${loginPath}` ||
        url === loginPath ||
        url.startsWith(`${baseUrl}${loginPath}?`) ||
        url.startsWith(`${loginPath}?`)
      ) {
        return `${baseUrl}/admin`
      }
      if (url.startsWith('/')) return `${baseUrl}${url}`
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url
      } catch {
        // malformed URL
      }
      return baseUrl
    },
  },
}
