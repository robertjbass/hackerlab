import type { Adapter, AdapterUser, AdapterAccount } from '@auth/core/adapters'
import type { Payload } from 'payload'
import type { User } from '@/payload-types'
import { randomBytes, createHmac } from 'crypto'
import { UserRole, AuthProvider } from '@/collections/User/constants'
import { getProviderIdField } from '@/lib/auth/provider-helpers'
import { resolveUserImage } from '@/lib/resolve-user-image'

function toAdapterUser(user: User): AdapterUser {
  return {
    id: String(user.id),
    email: user.email,
    emailVerified: null,
    name: user.name ?? null,
    image: resolveUserImage(user),
  }
}

function generateRandomPassword(): string {
  return randomBytes(32).toString('base64')
}

const AUTH_SECRET = process.env.AUTH_SECRET
if (!AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for token hashing')
}

function hashToken(token: string): string {
  return createHmac('sha256', AUTH_SECRET!).update(token).digest('hex')
}

export function PayloadAdapter(payload: Payload): Adapter {
  return {
    async createUser(data) {
      const user = await payload.create({
        collection: 'user',
        draft: false,
        data: {
          email: data.email.toLowerCase(),
          name: data.name ?? undefined,
          role: UserRole.User,
          password: generateRandomPassword(),
        },
      })
      return toAdapterUser(user)
    },

    async getUser(id) {
      const numericId = parseInt(id, 10)
      if (!Number.isInteger(numericId)) return null
      try {
        const user = await payload.findByID({ collection: 'user', id: numericId })
        if (!user) return null
        return toAdapterUser(user)
      } catch (error) {
        console.error('[PayloadAdapter] Error getting user by ID:', error)
        return null
      }
    },

    async getUserByEmail(email) {
      try {
        const { docs } = await payload.find({
          collection: 'user',
          where: { email: { equals: email.toLowerCase() } },
          limit: 1,
        })
        if (docs.length === 0) return null
        return toAdapterUser(docs[0])
      } catch (error) {
        console.error('[PayloadAdapter] Error getting user by email:', error)
        return null
      }
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const idField = getProviderIdField(provider)
      if (!idField) return null
      try {
        const { docs } = await payload.find({
          collection: 'user',
          where: { [idField]: { equals: providerAccountId } },
          limit: 1,
        })
        if (docs.length > 0) return toAdapterUser(docs[0])
        return null
      } catch (error) {
        console.error('[PayloadAdapter] Error getting user by account:', error)
        return null
      }
    },

    async updateUser(data) {
      const numericId = parseInt(data.id, 10)
      if (!Number.isInteger(numericId)) return null as unknown as AdapterUser
      try {
        const user = await payload.update({
          collection: 'user',
          id: numericId,
          data: { ...(data.name && { name: data.name }) },
        })
        return toAdapterUser(user)
      } catch (error) {
        console.error('[PayloadAdapter] Error updating user:', error)
        return null as unknown as AdapterUser
      }
    },

    async linkAccount(account: AdapterAccount) {
      const idField = getProviderIdField(account.provider)
      if (!idField) return
      const numericId = parseInt(account.userId, 10)
      if (!Number.isInteger(numericId)) return
      try {
        await payload.update({
          collection: 'user',
          id: numericId,
          data: { [idField]: account.providerAccountId },
        })
      } catch (error) {
        console.error('[PayloadAdapter] Error linking account:', error)
      }
    },

    async createSession() {
      throw new Error('createSession not implemented - using JWT strategy')
    },
    async getSessionAndUser() {
      throw new Error('getSessionAndUser not implemented - using JWT strategy')
    },
    async updateSession() {
      throw new Error('updateSession not implemented - using JWT strategy')
    },
    async deleteSession() {
      // No-op for JWT strategy
    },

    async createVerificationToken(data) {
      const hashedToken = hashToken(data.token)
      const normalizedEmail = data.identifier.toLowerCase()
      try {
        const { docs } = await payload.find({
          collection: 'user',
          where: { email: { equals: normalizedEmail } },
          limit: 1,
        })
        if (docs.length === 0) {
          await payload.create({
            collection: 'user',
            draft: false,
            data: {
              email: normalizedEmail,
              emailLoginToken: hashedToken,
              emailLoginTokenExpires: data.expires.toISOString(),
              password: generateRandomPassword(),
              role: UserRole.User,
              authProvider: AuthProvider.Email,
            },
          })
        } else {
          await payload.update({
            collection: 'user',
            id: docs[0].id,
            data: {
              emailLoginToken: hashedToken,
              emailLoginTokenExpires: data.expires.toISOString(),
            },
          })
        }
        return { identifier: data.identifier, token: data.token, expires: data.expires }
      } catch (error) {
        console.error('[PayloadAdapter] Error creating verification token:', error)
        throw error
      }
    },

    async useVerificationToken({ identifier, token }) {
      const hashedToken = hashToken(token)
      const normalizedEmail = identifier.toLowerCase()
      try {
        const { docs } = await payload.find({
          collection: 'user',
          where: {
            email: { equals: normalizedEmail },
            emailLoginToken: { equals: hashedToken },
            emailLoginTokenExpires: { greater_than: new Date().toISOString() },
          },
          limit: 1,
        })
        if (docs.length === 0) return null
        const user = docs[0]
        if (!user.emailLoginTokenExpires) return null
        const expires = new Date(user.emailLoginTokenExpires)
        await payload.update({
          collection: 'user',
          id: user.id,
          data: { emailLoginToken: null, emailLoginTokenExpires: null },
        })
        return { identifier, token, expires }
      } catch (error) {
        console.error('[PayloadAdapter] Error using verification token:', error)
        return null
      }
    },

    async deleteUser(id) {
      const numericId = parseInt(id, 10)
      if (!Number.isInteger(numericId)) return
      try {
        await payload.delete({ collection: 'user', id: numericId })
      } catch (error) {
        console.error('[PayloadAdapter] Error deleting user:', error)
      }
    },

    async unlinkAccount({ provider, providerAccountId }) {
      const idField = getProviderIdField(provider)
      if (!idField) return
      try {
        const { docs } = await payload.find({
          collection: 'user',
          where: { [idField]: { equals: providerAccountId } },
          limit: 1,
        })
        if (docs.length > 0) {
          await payload.update({
            collection: 'user',
            id: docs[0].id,
            data: { [idField]: null },
          })
        }
      } catch (error) {
        console.error('[PayloadAdapter] Error unlinking account:', error)
      }
    },
  }
}
