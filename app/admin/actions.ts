'use server';

import { db, foodItems, adminUsers, vectorSyncStatus } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { eq, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { populateVectorDB, searchSimilarFoods } from '@/lib/vector-db';
import { FOOD_DATA } from '@/lib/food-data';
import { Index } from '@upstash/vector';

const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL || '',
  token: process.env.UPSTASH_VECTOR_REST_TOKEN || '',
});

async function requireAdminAccess() {
  const user = await currentUser();
  
  if (!user) {
    throw new Error('Unauthorized: Please sign in');
  }

  try {
    const adminUser = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.clerkUserId, user.id))
      .limit(1);

    if (!adminUser[0] || !adminUser[0].isActive) {
      throw new Error('Unauthorized: Admin access required');
    }

    return { user, adminUser: adminUser[0] };
  } catch {
    throw new Error('Unauthorized: Admin access required');
  }
}

export async function getFoodItems() {
  await requireAdminAccess();
  
  try {
    const items = await db
      .select()
      .from(foodItems)
      .orderBy(desc(foodItems.createdAt))
      .limit(100);
    
    return { success: true, data: items };
  } catch (error) {
    console.error('Get food items error:', error);
    return { success: false, error: 'Failed to fetch food items' };
  }
}

export async function createFoodItem(data: {
  externalId: string;
  text: string;
  region: string;
  type: string;
}) {
  const { adminUser } = await requireAdminAccess();
  
  try {
    const newItem = await db
      .insert(foodItems)
      .values({
        ...data,
        createdBy: adminUser.clerkUserId,
        updatedBy: adminUser.clerkUserId,
      })
      .returning();
    
    // Mark for vector sync
    await db.insert(vectorSyncStatus).values({
      foodItemId: newItem[0].id,
      syncStatus: 'pending',
    });
    
    revalidatePath('/admin');
    return { success: true, data: newItem[0] };
  } catch (error) {
    console.error('Create food item error:', error);
    return { success: false, error: 'Failed to create food item' };
  }
}

export async function updateFoodItem(id: string, data: {
  text: string;
  region: string;
  type: string;
  isActive: boolean;
}) {
  const { adminUser } = await requireAdminAccess();
  
  try {
    const updatedItem = await db
      .update(foodItems)
      .set({
        ...data,
        updatedBy: adminUser.clerkUserId,
        updatedAt: new Date(),
      })
      .where(eq(foodItems.id, id))
      .returning();
    
    if (updatedItem.length === 0) {
      return { success: false, error: 'Food item not found' };
    }
    
    // Mark for vector sync
    await db.insert(vectorSyncStatus).values({
      foodItemId: updatedItem[0].id,
      syncStatus: 'pending',
    });
    
    revalidatePath('/admin');
    return { success: true, data: updatedItem[0] };
  } catch (error) {
    console.error('Update food item error:', error);
    return { success: false, error: 'Failed to update food item' };
  }
}

// FIXED DELETE FUNCTION - This is the main fix
export async function deleteFoodItem(id: string) {
  const { adminUser } = await requireAdminAccess();
  
  if (adminUser.role !== 'super_admin') {
    return { success: false, error: 'Super admin access required for deletion' };
  }
  
  try {
    // Get the item first to find its external ID
    const item = await db.select().from(foodItems).where(eq(foodItems.id, id)).limit(1);
    
    if (!item[0]) {
      return { success: false, error: 'Food item not found' };
    }
    
    // DELETE CHILD RECORDS FIRST - This fixes the foreign key constraint error
    await db.delete(vectorSyncStatus).where(eq(vectorSyncStatus.foodItemId, id));
    
    // Remove from vector database
    try {
      await vectorIndex.delete(item[0].externalId);
    } catch (vectorError) {
      console.warn('Vector deletion failed (item may not exist in vector DB):', vectorError);
    }
    
    // Delete from PostgreSQL (parent record last)
    await db.delete(foodItems).where(eq(foodItems.id, id));
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Delete food item error:', error);
    return { success: false, error: 'Failed to delete food item' };
  }
}

export async function syncAllToVector() {
  const { adminUser } = await requireAdminAccess();
  
  if (adminUser.role !== 'super_admin' && adminUser.role !== 'admin') {
    return { success: false, error: 'Admin access required for vector sync' };
  }
  
  try {
    const items = await db
      .select()
      .from(foodItems)
      .where(eq(foodItems.isActive, true));
    
    // Convert to your existing format
    const foodData = items.map(item => ({
      id: item.externalId,
      text: item.text,
      region: item.region,
      type: item.type,
    }));
    
    // Sync to vector database using your existing function
    await populateVectorDB(foodData);
    
    // Update sync status for all items
    for (const item of items) {
      try {
        // Update or insert sync status
        const existingSync = await db
          .select()
          .from(vectorSyncStatus)
          .where(eq(vectorSyncStatus.foodItemId, item.id))
          .limit(1);

        if (existingSync.length > 0) {
          await db
            .update(vectorSyncStatus)
            .set({
              lastSyncedAt: new Date(),
              syncStatus: 'synced',
              errorMessage: null,
            })
            .where(eq(vectorSyncStatus.foodItemId, item.id));
        } else {
          await db.insert(vectorSyncStatus).values({
            foodItemId: item.id,
            lastSyncedAt: new Date(),
            syncStatus: 'synced',
          });
        }
      } catch (syncError) {
        console.error(`Failed to update sync status for item ${item.id}:`, syncError);
      }
    }
    
    revalidatePath('/admin');
    return { success: true, data: { syncedCount: items.length } };
  } catch (error) {
    console.error('Vector sync error:', error);
    return { success: false, error: 'Failed to sync to vector database' };
  }
}

export async function flushVectorDB() {
  const { adminUser } = await requireAdminAccess();
  
  if (adminUser.role !== 'super_admin') {
    return { success: false, error: 'Super admin access required' };
  }
  
  try {
    // Get all items to delete from vector DB
    const items = await db.select({ externalId: foodItems.externalId }).from(foodItems);
    
    // Delete each item from vector DB
    for (const item of items) {
      try {
        await vectorIndex.delete(item.externalId);
      } catch (deleteError) {
        console.warn(`Failed to delete vector ${item.externalId}:`, deleteError);
      }
    }
    
    // Reset all sync statuses
    await db
      .update(vectorSyncStatus)
      .set({
        syncStatus: 'pending',
        lastSyncedAt: null,
        errorMessage: null,
      });
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Flush vector DB error:', error);
    return { success: false, error: 'Failed to flush vector database' };
  }
}

export async function migrateLegacyData() {
  const { adminUser } = await requireAdminAccess();
  
  if (adminUser.role !== 'super_admin') {
    return { success: false, error: 'Super admin access required for migration' };
  }
  
  try {
    let migratedCount = 0;
    
    for (const item of FOOD_DATA) {
      // Check if item already exists
      const existing = await db
        .select()
        .from(foodItems)
        .where(eq(foodItems.externalId, item.id))
        .limit(1);
      
      if (existing.length === 0) {
        // Insert new item
        const newItem = await db.insert(foodItems).values({
          externalId: item.id,
          text: item.text,
          region: item.region,
          type: item.type,
          createdBy: adminUser.clerkUserId,
          updatedBy: adminUser.clerkUserId,
        }).returning();

        // Add sync status
        await db.insert(vectorSyncStatus).values({
          foodItemId: newItem[0].id,
          syncStatus: 'pending',
        });

        migratedCount++;
      }
    }
    
    revalidatePath('/admin');
    return { success: true, data: { migratedCount } };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error: 'Failed to migrate legacy data' };
  }
}

export async function testVectorSearch(query: string) {
  await requireAdminAccess();
  
  if (!query.trim()) {
    return { success: false, error: 'Query is required' };
  }
  
  try {
    const results = await searchSimilarFoods(query, 5);
    return { success: true, data: results };
  } catch (error) {
    console.error('Vector search test error:', error);
    return { success: false, error: 'Vector search test failed' };
  }
}

export async function getSyncStatus() {
  await requireAdminAccess();
  
  try {
    const syncStats = await db
      .select({
        status: vectorSyncStatus.syncStatus,
        count: sql`count(*)`.as('count')
      })
      .from(vectorSyncStatus)
      .groupBy(vectorSyncStatus.syncStatus);
    
    return { success: true, data: syncStats };
  } catch (error) {
    console.error('Sync status error:', error);
    return { success: false, error: 'Failed to get sync status' };
  }
}