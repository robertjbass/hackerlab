import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import User from '@/collections/User'
import Media from '@/collections/Media'
import { migrations } from '@/migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// DEV_DB_PUSH=true in .env enables push mode (auto-sync schema, no migrations)
// This is independent of NODE_ENV so local builds work against push-mode databases
const devDbPush = process.env.DEV_DB_PUSH === 'true'
const runMigrations = !devDbPush

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is required. Set a PostgreSQL connection string.',
  )
}

if (!process.env.PAYLOAD_SECRET) {
  throw new Error(
    'PAYLOAD_SECRET environment variable is required. Generate one with: openssl rand -base64 32',
  )
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error(
    'BLOB_READ_WRITE_TOKEN environment variable is required. Create a Vercel Blob store and copy the token.',
  )
}

if (!process.env.BLOB_PREFIX) {
  throw new Error(
    'BLOB_PREFIX environment variable is required (e.g., hackerlab_local, hackerlab_dev, hackerlab_prod).',
  )
}

export default buildConfig({
  serverURL: process.env.AUTH_URL || 'http://localhost:3000',
  admin: {
    user: User.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        login: {
          Component: '@/components/admin/custom-login-form.tsx#CustomLoginForm',
        },
      },
    },
  },
  collections: [User, Media],
  plugins: [
    vercelBlobStorage({
      collections: {
        media: {
          prefix: process.env.BLOB_PREFIX,
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    push: devDbPush,
    prodMigrations: runMigrations ? migrations : undefined,
  }),
  sharp,
})
