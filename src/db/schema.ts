import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: varchar({ length: 255 }).notNull().unique(),
    email: varchar({ length: 255 }).notNull(),
    created_at: timestamp({ withTimezone: true }),
    nickname: varchar({ length: 255 }),
    avatar_url: varchar({ length: 255 }),
    locale: varchar({ length: 50 }),
    signin_type: varchar({ length: 50 }),
    signin_ip: varchar({ length: 255 }),
    signin_provider: varchar({ length: 50 }),
    signin_openid: varchar({ length: 255 }),
    invite_code: varchar({ length: 255 }).notNull().default(""),
    updated_at: timestamp({ withTimezone: true }),
    invited_by: varchar({ length: 255 }).notNull().default(""),
    is_affiliate: boolean().notNull().default(false),
  },
  (table) => [
    uniqueIndex("email_provider_unique_idx").on(
      table.email,
      table.signin_provider
    ),
  ]
);

// Orders table
export const orders = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  order_no: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp({ withTimezone: true }),
  user_uuid: varchar({ length: 255 }).notNull().default(""),
  user_email: varchar({ length: 255 }).notNull().default(""),
  amount: integer().notNull(),
  interval: varchar({ length: 50 }),
  expired_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }).notNull(),
  stripe_session_id: varchar({ length: 255 }),
  credits: integer().notNull(),
  currency: varchar({ length: 50 }),
  sub_id: varchar({ length: 255 }),
  sub_interval_count: integer(),
  sub_cycle_anchor: integer(),
  sub_period_end: integer(),
  sub_period_start: integer(),
  sub_times: integer(),
  product_id: varchar({ length: 255 }),
  product_name: varchar({ length: 255 }),
  valid_months: integer(),
  order_detail: text(),
  paid_at: timestamp({ withTimezone: true }),
  paid_email: varchar({ length: 255 }),
  paid_detail: text(),
});

// API Keys table
export const apikeys = pgTable("apikeys", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  api_key: varchar({ length: 255 }).notNull().unique(),
  title: varchar({ length: 100 }),
  user_uuid: varchar({ length: 255 }).notNull(),
  created_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }),
});

// Credits table
export const credits = pgTable("credits", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  trans_no: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp({ withTimezone: true }),
  user_uuid: varchar({ length: 255 }).notNull(),
  trans_type: varchar({ length: 50 }).notNull(),
  credits: integer().notNull(),
  order_no: varchar({ length: 255 }),
  expired_at: timestamp({ withTimezone: true }),
});

// Posts table
export const posts = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  slug: varchar({ length: 255 }),
  title: varchar({ length: 255 }),
  description: text(),
  content: text(),
  created_at: timestamp({ withTimezone: true }),
  updated_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }),
  cover_url: varchar({ length: 255 }),
  author_name: varchar({ length: 255 }),
  author_avatar_url: varchar({ length: 255 }),
  locale: varchar({ length: 50 }),
});

// Affiliates table
export const affiliates = pgTable("affiliates", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_uuid: varchar({ length: 255 }).notNull(),
  created_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }).notNull().default(""),
  invited_by: varchar({ length: 255 }).notNull(),
  paid_order_no: varchar({ length: 255 }).notNull().default(""),
  paid_amount: integer().notNull().default(0),
  reward_percent: integer().notNull().default(0),
  reward_amount: integer().notNull().default(0),
});

// Feedbacks table
export const feedbacks = pgTable("feedbacks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }),
  user_uuid: varchar({ length: 255 }),
  content: text(),
  rating: integer(),
});

// Nano Banana Tasks table
export const nanoBananaTasks = pgTable("nano_banana_tasks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  task_id: varchar({ length: 255 }).notNull().unique(),
  request_id: varchar({ length: 255 }).notNull().unique(),
  user_uuid: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 50 }).notNull(), // 'text-to-image' | 'image-to-image'
  provider: varchar({ length: 20 }).notNull().default('fal'), // 'fal' | 'kie'
  prompt: text().notNull(),
  image_urls: text(), // JSON array for image-to-image mode
  num_images: integer().notNull().default(1),
  status: varchar({ length: 50 }).notNull().default('pending'), // pending | processing | completed | failed
  result: text(), // JSON storage for result
  credits_used: integer().notNull().default(0),
  credits_refunded: integer().notNull().default(0),
  error_message: text(),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }).defaultNow(),
});

// Verification Tokens table for email authentication
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    identifier: varchar({ length: 255 }).notNull(),
    token: varchar({ length: 255 }).notNull().unique(),
    expires: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("identifier_token_idx").on(table.identifier, table.token),
  ]
);

// Upscaler Tasks table
export const upscalerTasks = pgTable("upscaler_tasks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  task_id: varchar({ length: 255 }).notNull().unique(),
  request_id: varchar({ length: 255 }).notNull().unique(),
  user_uuid: varchar({ length: 255 }).notNull(),
  input: text().notNull(), // JSON storage for input parameters (image, scale, face_enhance)
  provider: varchar({ length: 20 }).notNull().default('kie'),
  status: varchar({ length: 50 }).notNull().default('pending'), // pending | processing | completed | failed
  result: text(), // JSON storage for result
  credits_used: integer().notNull().default(0),
  credits_refunded: integer().notNull().default(0),
  error_message: text(),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }).defaultNow(),
});

// Veo3 Video Tasks table
export const veo3Tasks = pgTable("veo3_tasks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  task_id: varchar({ length: 255 }).notNull().unique(),
  request_id: varchar({ length: 255 }).notNull().unique(),
  user_uuid: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 50 }).notNull(), // 'text-to-video' | 'image-to-video'
  model: varchar({ length: 50 }).notNull(), // 'veo3' | 'veo3_fast'
  input: text().notNull(), // JSON storage for {prompt, imageUrls, aspectRatio, watermark, seeds, etc}
  status: varchar({ length: 50 }).notNull().default('pending'), // pending | processing | completed | failed
  result: text(), // JSON storage for result from Veo3 API
  video_720p_url: text(), // R2 stored 720p video URL
  video_1080p_url: text(), // R2 stored 1080p video URL (only for 16:9)
  has_1080p: boolean().notNull().default(false),
  credits_used: integer().notNull().default(0),
  credits_refunded: integer().notNull().default(0),
  error_message: text(),
  error_code: varchar({ length: 50 }),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }).defaultNow(),
  completed_at: timestamp({ withTimezone: true }),
});

// Sora 2 Video Tasks table
export const sora2Tasks = pgTable("sora2_tasks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  task_id: varchar({ length: 255 }).notNull().unique(),
  request_id: varchar({ length: 255 }).notNull().unique(), // KIE Jobs API taskId
  user_uuid: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 50 }).notNull(), // 'text-to-video' | 'image-to-video'
  input: text().notNull(), // JSON storage for {prompt, image_urls?, aspect_ratio, remove_watermark}
  status: varchar({ length: 50 }).notNull().default('waiting'), // waiting | success | fail (KIE Jobs API states)
  result: text(), // JSON storage for complete resultJson from KIE Jobs API
  video_url: text(), // R2 stored video URL
  credits_used: integer().notNull().default(0),
  credits_refunded: integer().notNull().default(0),
  error_message: text(),
  error_code: varchar({ length: 50 }),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }).defaultNow(),
  completed_at: timestamp({ withTimezone: true }),
});
