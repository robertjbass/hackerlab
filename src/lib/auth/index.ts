import NextAuth from 'next-auth'
import payloadConfig from '@payload-config'
import { getPayload } from 'payload'
import { authConfig } from '@/lib/auth/config'
import { PayloadAdapter } from '@/lib/auth/payload-adapter'

const payload = await getPayload({ config: payloadConfig })

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PayloadAdapter(payload),
})
