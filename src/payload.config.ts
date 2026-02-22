import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import {
  lexicalEditor,
  HeadingFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
  LinkFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import User from '@/collections/User'
import Media from '@/collections/Media'
import Role from '@/collections/Role'
import UserRoleCollection from '@/collections/UserRole'
import Post from '@/collections/Post'
import Category from '@/collections/Category'
import Tag from '@/collections/Tag'
import PostCategory from '@/collections/PostCategory'
import { RoleName } from '@/collections/User/constants'
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
        theme: {
          Component: '@/components/admin/theme-preview.tsx#ThemePreview',
          path: '/theme',
        },
      },
    },
  },
  collections: [
    User,
    Media,
    Role,
    UserRoleCollection,
    Post,
    Category,
    Tag,
    PostCategory,
  ],
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
  editor: lexicalEditor({
    features: () => [
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      BlockquoteFeature(),
      HorizontalRuleFeature(),
      LinkFeature({
        enabledCollections: [],
        fields: [
          {
            name: 'rel',
            label: 'Rel Attribute',
            type: 'select',
            options: ['nofollow', 'noreferrer', 'noopener'],
            hasMany: true,
          },
        ],
      }),
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: 'caption',
                type: 'text',
              },
            ],
          },
        },
      }),
    ],
  }),
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
  onInit: async (payload) => {
    // Seed default roles — wrapped in try/catch for first run before tables exist
    try {
      const defaultRoles = [RoleName.Admin, RoleName.Editor, RoleName.User]
      for (const roleName of defaultRoles) {
        const { totalDocs } = await payload.count({
          collection: 'role',
          where: { name: { equals: roleName } },
        })
        if (totalDocs === 0) {
          await payload.create({
            collection: 'role',
            draft: false,
            data: { name: roleName },
          })
        }
      }
    } catch {
      // Tables may not exist yet during first build — roles will be seeded on next start
    }
  },
})
