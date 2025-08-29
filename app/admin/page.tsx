import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db, foodItems, adminUsers } from '@/lib/db';
import { eq, desc, count } from 'drizzle-orm';
import { AdminDashboard } from './admin-dashboard';

export default async function AdminPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Check if user is admin
  let adminUser;
  try {
    const adminUserResult = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.clerkUserId, user.id))
      .limit(1);
    
    adminUser = adminUserResult[0];
    
    if (!adminUser || !adminUser.isActive) {
      // Show instructions to become admin
      return (
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
              <p className="text-gray-600 mb-6">
                Welcome {user.emailAddresses[0]?.emailAddress}! To access the admin dashboard, 
                you need to be added as an admin user.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-medium text-yellow-800 mb-2">Add Yourself as Admin:</h3>
                <p className="text-yellow-700 text-sm mb-3">
                  Run this SQL command in your Neon database console:
                </p>
                <div className="bg-yellow-100 p-4 rounded border font-mono text-sm text-yellow-800 overflow-x-auto">
                  <pre>{`INSERT INTO admin_users (clerk_user_id, email, role, is_active) 
VALUES ('${user.id}', '${user.emailAddresses[0]?.emailAddress}', 'super_admin', true);`}</pre>
                </div>
                <p className="text-yellow-700 text-xs mt-3">
                  After running this command, refresh this page to access the admin dashboard.
                </p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800">Your Details:</h4>
                <p className="text-blue-700 text-sm">
                  <strong>User ID:</strong> <code className="bg-blue-100 px-1 rounded">{user.id}</code><br/>
                  <strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          </div>
        </main>
      );
    }
  } catch (error) {
    console.error('Admin check error:', error);
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Database Error</h1>
            <p className="text-gray-600 mb-4">
              There was an error connecting to the database. Please check your configuration.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm font-medium">Error Details:</p>
              <p className="text-red-700 text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Get food items and stats
  let items: typeof foodItems.$inferSelect[] = [];
  let stats = { total: 0, active: 0, inactive: 0 };

  try {
    const [itemsResult, totalCount] = await Promise.all([
      db.select().from(foodItems).orderBy(desc(foodItems.createdAt)).limit(50),
      db.select({ count: count() }).from(foodItems),
    ]);

    items = itemsResult;
    stats = {
      total: totalCount[0]?.count || 0,
      active: items.filter(item => item.isActive).length,
      inactive: items.filter(item => !item.isActive).length,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    // Continue with empty data rather than crashing
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Food Database Admin</h1>
          <p className="text-gray-600 mt-2">
            Manage food items and synchronize with vector database
          </p>
          <div className="mt-2 text-sm text-gray-500 flex items-center gap-4">
            <span>Role: <span className="font-medium capitalize">{adminUser.role}</span></span>
            <span>User: {user.emailAddresses[0]?.emailAddress}</span>
            <span className="text-green-600">● Connected</span>
          </div>
        </div>

        <AdminDashboard 
          initialItems={items}
          stats={stats}
          userRole={adminUser.role}
        />
      </div>
    </main>
  );
}