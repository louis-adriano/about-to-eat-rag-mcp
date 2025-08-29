import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

export const foodItems = pgTable('food_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  externalId: text('external_id').unique().notNull(), // Maps to your current food data IDs
  text: text('text').notNull(),
  region: text('region').notNull(),
  type: text('type').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
});

export const vectorSyncStatus = pgTable('vector_sync_status', {
  id: uuid('id').defaultRandom().primaryKey(),
  foodItemId: uuid('food_item_id').references(() => foodItems.id).notNull(),
  lastSyncedAt: timestamp('last_synced_at'),
  syncStatus: text('sync_status').notNull(), // 'pending', 'synced', 'failed'
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').unique().notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(), // 'super_admin', 'admin', 'viewer'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type FoodItem = typeof foodItems.$inferSelect;
export type NewFoodItem = typeof foodItems.$inferInsert;
export type VectorSyncStatus = typeof vectorSyncStatus.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;