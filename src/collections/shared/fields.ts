import type { Field, FieldHook } from 'payload'

function formatSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function createSlugHook(sourceField: string): FieldHook {
  return ({ data, value, operation }) => {
    if (operation === 'create' || !value) {
      const sourceValue = data?.[sourceField]
      if (typeof sourceValue === 'string' && sourceValue.length > 0) {
        return formatSlug(sourceValue)
      }
    }
    return typeof value === 'string' ? formatSlug(value) : value
  }
}

export function slugField(sourceField: string): Field {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: `Auto-generated from "${sourceField}". Edit to override.`,
    },
    hooks: {
      beforeValidate: [createSlugHook(sourceField)],
    },
  }
}

export function seoFields(): Field {
  return {
    name: 'seo',
    type: 'group',
    label: 'SEO',
    admin: {
      description: 'Search engine optimization fields',
    },
    fields: [
      {
        name: 'metaTitle',
        label: 'Meta Title',
        type: 'text',
        admin: {
          description:
            'Overrides the page title in search results (50-60 chars ideal)',
        },
      },
      {
        name: 'metaDescription',
        label: 'Meta Description',
        type: 'textarea',
        admin: {
          description: 'Shown in search result snippets (150-160 chars ideal)',
        },
      },
      {
        name: 'ogImage',
        label: 'Social Share Image',
        type: 'upload',
        relationTo: 'media',
        admin: {
          description:
            'Image shown when shared on social media (1200x630 ideal)',
        },
      },
    ],
  }
}
