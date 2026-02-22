# Architecture Decisions

## Junction Tables vs Payload's Default `_rels` Pattern

### Problem with Payload's Default `hasMany` Pattern

When you define a `hasMany` relationship in Payload CMS, it creates a polymorphic `_rels` table for the collection. For example, a `post` collection with `hasMany` relationships to `tag` would result in a `post_rels` table.

The `_rels` table structure looks like this:

```
post_rels
├── id              (PK)
├── parent_id       (FK → post.id)
├── path            (string — disambiguates which field this relationship belongs to)
├── tag_id          (FK → tag.id, nullable)
├── category_id     (FK → category.id, nullable)
├── author_id       (FK → user.id, nullable)
└── ...             (one nullable FK column per relationship target)
```

Problems with this approach:

- **Sparse matrix**: Every relationship target gets its own nullable FK column. If a post has relationships to 5 different collections, each row in `post_rels` has 4 NULL columns and 1 populated column. This wastes storage and index space.
- **Unintuitive raw data**: When viewing the database directly (common during debugging or data migrations), the table is difficult to interpret. You must check the `path` column to understand what each row represents.
- **Non-standard query syntax**: Payload's `.where` syntax for querying through `_rels` tables uses a non-standard dot-path format that does not map cleanly to SQL.
- **Incompatible with `populate`**: Payload's `populate` parameter (used to control which related fields are returned) does not work well with deeply nested `_rels` relationships, leading to either over-fetching or incomplete data.

### Decision: Custom Junction Tables for Important Data

For relationships that are frequently queried, displayed in the admin UI, or central to the application's data model, Hackerlab uses **custom junction collections** with Payload's `join` field type instead of `hasMany`.

#### How It Works

A junction collection is a standard Payload collection with two `relationship` fields. The parent collections reference it using `join` fields.

**Junction collection** (`user_role`):

```ts
// src/collections/UserRole/index.ts
const UserRoleCollection: CollectionConfig<'user_role'> = {
  slug: 'user_role',
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'user',
      required: true,
      index: true,
    },
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'role',
      required: true,
      index: true,
    },
  ],
}
```

**Parent collection** references via `join`:

```ts
// In the User collection
{
  name: 'roles',
  type: 'join',
  collection: 'user_role',
  on: 'user',
}

// In the Role collection
{
  name: 'users',
  type: 'join',
  collection: 'user_role',
  on: 'role',
}
```

#### Resulting Database Table

```
user_role
├── id         (PK)
├── user_id    (FK → user.id, indexed, NOT NULL)
├── role_id    (FK → role.id, indexed, NOT NULL)
├── created_at
└── updated_at
```

Every column is meaningful. Every row represents exactly one user-role assignment. No NULLs, no ambiguity.

#### Benefits

- **Clean, self-documenting tables**: The `user_role` table has exactly the columns it needs. No sparse matrix, no `path` disambiguation.
- **Full admin UI support**: Payload's `join` field renders the relationship in both directions in the admin panel. Users see their roles; roles see their users.
- **Standard query patterns**: Querying the junction table uses standard Payload `.where` syntax with no special dot-path conventions.
- **Extensible**: Junction collections can have additional fields. For example, you could add `assignedAt`, `assignedBy`, or `expiresAt` to track metadata about the relationship.
- **Duplicate prevention**: A `beforeChange` hook on the junction collection can enforce uniqueness, preventing the same role from being assigned to the same user twice.

#### Where This Pattern Is Used

| Junction Collection | Connects | Purpose |
|---|---|---|
| `user_role` | `user` and `role` | Role-based access control |
| `post_category` | `post` and `category` | Post categorization |

### Exception: Payload's `hasMany` for Low-Importance Data

Not every relationship needs a junction table. For simple, infrequently-queried relationships where convenience outweighs data clarity, Hackerlab uses Payload's standard `hasMany`.

**Example**: Tags on blog posts:

```ts
// In the Post collection
{
  name: 'tags',
  type: 'relationship',
  relationTo: 'tag',
  hasMany: true,
}
```

This creates rows in the `post_rels` table. For tagging, this is acceptable because:

- Tags are rarely queried independently ("find all posts with tag X" is uncommon compared to "show this post's tags")
- No additional metadata is needed on the relationship
- The convenience of Payload's built-in UI for selecting multiple tags is worth the tradeoff

### Side-by-Side Comparison

**Junction table** (`user_role`):

```
user_role
| id | user_id | role_id | created_at          |
|----|---------|---------|---------------------|
| 1  | 1       | 1       | 2026-01-15 10:00:00 |
| 2  | 1       | 3       | 2026-01-15 10:00:00 |
| 3  | 2       | 3       | 2026-01-16 14:30:00 |
```

Every row is meaningful. Reading the table tells you exactly which users have which roles.

**`_rels` table** (`post_rels`):

```
post_rels
| id | parent_id | path | tag_id | media_id | user_id | order |
|----|-----------|------|--------|----------|---------|-------|
| 1  | 1         | tags | 5      | NULL     | NULL    | 0     |
| 2  | 1         | tags | 8      | NULL     | NULL    | 1     |
| 3  | 1         | tags | 12     | NULL     | NULL    | 2     |
```

Most columns are NULL. You must check the `path` column to understand what each row represents. As more relationship fields are added to the collection, more NULL columns appear.

### When to Choose Which

Use a **custom junction table** (junction collection + `join` fields) when:

- The relationship is frequently queried from both sides
- You need additional fields on the relationship (timestamps, metadata, permissions)
- The data appears in admin views or reports
- Data integrity matters (uniqueness constraints, cascade behavior)
- You need to query the relationships using standard patterns

Use **`hasMany` / `_rels`** when:

- The relationship is simple tagging or categorization that is rarely queried independently
- No metadata is needed on the relationship itself
- Convenience of Payload's built-in multi-select UI is the priority
- The relationship is low-importance or supplementary data
