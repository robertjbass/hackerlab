import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_post_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__post_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "role" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "user_role" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"role_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "post" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"featured_image_id" integer,
  	"content" jsonb,
  	"author_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_post_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "post_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tag_id" integer
  );
  
  CREATE TABLE "_post_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_featured_image_id" integer,
  	"version_content" jsonb,
  	"version_author_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__post_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_post_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tag_id" integer
  );
  
  CREATE TABLE "category" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tag" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "post_category" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"post_id" integer NOT NULL,
  	"category_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "user" ADD COLUMN "bio" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_large_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_large_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_large_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_large_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_large_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_large_filename" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "role_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_role_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "post_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "category_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tag_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "post_category_id" integer;
  ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post" ADD CONSTRAINT "post_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post" ADD CONSTRAINT "post_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post" ADD CONSTRAINT "post_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post_rels" ADD CONSTRAINT "post_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_rels" ADD CONSTRAINT "post_rels_tag_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_post_v" ADD CONSTRAINT "_post_v_parent_id_post_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."post"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_v" ADD CONSTRAINT "_post_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_v" ADD CONSTRAINT "_post_v_version_author_id_user_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_v" ADD CONSTRAINT "_post_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_v_rels" ADD CONSTRAINT "_post_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_post_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_post_v_rels" ADD CONSTRAINT "_post_v_rels_tag_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_category" ADD CONSTRAINT "post_category_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post_category" ADD CONSTRAINT "post_category_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "role_name_idx" ON "role" USING btree ("name");
  CREATE INDEX "role_updated_at_idx" ON "role" USING btree ("updated_at");
  CREATE INDEX "role_created_at_idx" ON "role" USING btree ("created_at");
  CREATE INDEX "user_role_user_idx" ON "user_role" USING btree ("user_id");
  CREATE INDEX "user_role_role_idx" ON "user_role" USING btree ("role_id");
  CREATE INDEX "user_role_updated_at_idx" ON "user_role" USING btree ("updated_at");
  CREATE INDEX "user_role_created_at_idx" ON "user_role" USING btree ("created_at");
  CREATE UNIQUE INDEX "user_role_idx" ON "user_role" USING btree ("user_id","role_id");
  CREATE UNIQUE INDEX "post_slug_idx" ON "post" USING btree ("slug");
  CREATE INDEX "post_featured_image_idx" ON "post" USING btree ("featured_image_id");
  CREATE INDEX "post_author_idx" ON "post" USING btree ("author_id");
  CREATE INDEX "post_seo_seo_og_image_idx" ON "post" USING btree ("seo_og_image_id");
  CREATE INDEX "post_updated_at_idx" ON "post" USING btree ("updated_at");
  CREATE INDEX "post_created_at_idx" ON "post" USING btree ("created_at");
  CREATE INDEX "post__status_idx" ON "post" USING btree ("_status");
  CREATE INDEX "post_rels_order_idx" ON "post_rels" USING btree ("order");
  CREATE INDEX "post_rels_parent_idx" ON "post_rels" USING btree ("parent_id");
  CREATE INDEX "post_rels_path_idx" ON "post_rels" USING btree ("path");
  CREATE INDEX "post_rels_tag_id_idx" ON "post_rels" USING btree ("tag_id");
  CREATE INDEX "_post_v_parent_idx" ON "_post_v" USING btree ("parent_id");
  CREATE INDEX "_post_v_version_version_slug_idx" ON "_post_v" USING btree ("version_slug");
  CREATE INDEX "_post_v_version_version_featured_image_idx" ON "_post_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_post_v_version_version_author_idx" ON "_post_v" USING btree ("version_author_id");
  CREATE INDEX "_post_v_version_seo_version_seo_og_image_idx" ON "_post_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_post_v_version_version_updated_at_idx" ON "_post_v" USING btree ("version_updated_at");
  CREATE INDEX "_post_v_version_version_created_at_idx" ON "_post_v" USING btree ("version_created_at");
  CREATE INDEX "_post_v_version_version__status_idx" ON "_post_v" USING btree ("version__status");
  CREATE INDEX "_post_v_created_at_idx" ON "_post_v" USING btree ("created_at");
  CREATE INDEX "_post_v_updated_at_idx" ON "_post_v" USING btree ("updated_at");
  CREATE INDEX "_post_v_latest_idx" ON "_post_v" USING btree ("latest");
  CREATE INDEX "_post_v_autosave_idx" ON "_post_v" USING btree ("autosave");
  CREATE INDEX "_post_v_rels_order_idx" ON "_post_v_rels" USING btree ("order");
  CREATE INDEX "_post_v_rels_parent_idx" ON "_post_v_rels" USING btree ("parent_id");
  CREATE INDEX "_post_v_rels_path_idx" ON "_post_v_rels" USING btree ("path");
  CREATE INDEX "_post_v_rels_tag_id_idx" ON "_post_v_rels" USING btree ("tag_id");
  CREATE UNIQUE INDEX "category_name_idx" ON "category" USING btree ("name");
  CREATE UNIQUE INDEX "category_slug_idx" ON "category" USING btree ("slug");
  CREATE INDEX "category_updated_at_idx" ON "category" USING btree ("updated_at");
  CREATE INDEX "category_created_at_idx" ON "category" USING btree ("created_at");
  CREATE UNIQUE INDEX "tag_name_idx" ON "tag" USING btree ("name");
  CREATE UNIQUE INDEX "tag_slug_idx" ON "tag" USING btree ("slug");
  CREATE INDEX "tag_updated_at_idx" ON "tag" USING btree ("updated_at");
  CREATE INDEX "tag_created_at_idx" ON "tag" USING btree ("created_at");
  CREATE INDEX "post_category_post_idx" ON "post_category" USING btree ("post_id");
  CREATE INDEX "post_category_category_idx" ON "post_category" USING btree ("category_id");
  CREATE INDEX "post_category_updated_at_idx" ON "post_category" USING btree ("updated_at");
  CREATE INDEX "post_category_created_at_idx" ON "post_category" USING btree ("created_at");
  CREATE UNIQUE INDEX "post_category_idx" ON "post_category" USING btree ("post_id","category_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_role_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_role_fk" FOREIGN KEY ("user_role_id") REFERENCES "public"."user_role"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_post_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_category_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tag_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_post_category_fk" FOREIGN KEY ("post_category_id") REFERENCES "public"."post_category"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "payload_locked_documents_rels_role_id_idx" ON "payload_locked_documents_rels" USING btree ("role_id");
  CREATE INDEX "payload_locked_documents_rels_user_role_id_idx" ON "payload_locked_documents_rels" USING btree ("user_role_id");
  CREATE INDEX "payload_locked_documents_rels_post_id_idx" ON "payload_locked_documents_rels" USING btree ("post_id");
  CREATE INDEX "payload_locked_documents_rels_category_id_idx" ON "payload_locked_documents_rels" USING btree ("category_id");
  CREATE INDEX "payload_locked_documents_rels_tag_id_idx" ON "payload_locked_documents_rels" USING btree ("tag_id");
  CREATE INDEX "payload_locked_documents_rels_post_category_id_idx" ON "payload_locked_documents_rels" USING btree ("post_category_id");
  ALTER TABLE "user" DROP COLUMN "role";
  DROP TYPE "public"."enum_user_role";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_user_role" AS ENUM('admin', 'user');
  ALTER TABLE "role" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "user_role" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "post" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "post_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_post_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_post_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "category" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tag" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "post_category" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "role" CASCADE;
  DROP TABLE "user_role" CASCADE;
  DROP TABLE "post" CASCADE;
  DROP TABLE "post_rels" CASCADE;
  DROP TABLE "_post_v" CASCADE;
  DROP TABLE "_post_v_rels" CASCADE;
  DROP TABLE "category" CASCADE;
  DROP TABLE "tag" CASCADE;
  DROP TABLE "post_category" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_role_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_role_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_post_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_category_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tag_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_post_category_fk";
  
  DROP INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx";
  DROP INDEX "media_sizes_medium_sizes_medium_filename_idx";
  DROP INDEX "media_sizes_large_sizes_large_filename_idx";
  DROP INDEX "payload_locked_documents_rels_role_id_idx";
  DROP INDEX "payload_locked_documents_rels_user_role_id_idx";
  DROP INDEX "payload_locked_documents_rels_post_id_idx";
  DROP INDEX "payload_locked_documents_rels_category_id_idx";
  DROP INDEX "payload_locked_documents_rels_tag_id_idx";
  DROP INDEX "payload_locked_documents_rels_post_category_id_idx";
  ALTER TABLE "user" ADD COLUMN "role" "enum_user_role" DEFAULT 'user' NOT NULL;
  ALTER TABLE "user" DROP COLUMN "bio";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_url";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_width";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_height";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_url";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_width";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_height";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_large_url";
  ALTER TABLE "media" DROP COLUMN "sizes_large_width";
  ALTER TABLE "media" DROP COLUMN "sizes_large_height";
  ALTER TABLE "media" DROP COLUMN "sizes_large_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_large_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_large_filename";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "role_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "user_role_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "post_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "category_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tag_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "post_category_id";
  DROP TYPE "public"."enum_post_status";
  DROP TYPE "public"."enum__post_v_version_status";`)
}
