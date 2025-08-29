import { currentUser } from '@clerk/nextjs/server';
import { db, adminUsers } from './db';
import { eq } from 'drizzle-orm';

export async function checkAdminAccess() {
  const user = await currentUser();
  
  if (!user) {
    return { authorized: false, user: null, role: null };
  }

  try {
    const adminUser = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.clerkUserId, user.id))
      .limit(1);

    if (!adminUser[0] || !adminUser[0].isActive) {
      return { authorized: false, user, role: null };
    }

    return { 
      authorized: true, 
      user, 
      role: adminUser[0].role,
      adminUser: adminUser[0]
    };
  } catch (error) {
    console.error('Admin access check failed:', error);
    return { authorized: false, user, role: null };
  }
}

export async function requireAdminAccess() {
  const { authorized, user, role, adminUser } = await checkAdminAccess();
  
  if (!authorized) {
    throw new Error('Unauthorized: Admin access required');
  }

  return { user, role, adminUser };
}