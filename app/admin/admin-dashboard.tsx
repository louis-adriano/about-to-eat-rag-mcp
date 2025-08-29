'use client';

import { useState, useTransition } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Play, 
  RotateCcw, 
  Upload,
  X
} from 'lucide-react';
import { FoodItem, AdminDashboardProps, SearchResult, Message } from './types';
import {
  getFoodItems,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  syncAllToVector,
  flushVectorDB,
  migrateLegacyData,
  testVectorSearch,
} from './actions';

export function AdminDashboard({ initialItems, stats, userRole }: AdminDashboardProps) {
  const [items, setItems] = useState<FoodItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<SearchResult[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<Message | null>(null);

  const canEdit = userRole === 'super_admin' || userRole === 'admin';
  const canDelete = userRole === 'super_admin';

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleRefresh = () => {
    startTransition(async () => {
      const result = await getFoodItems();
      if (result.success && result.data) {
        setItems(result.data as FoodItem[]);
      }
    });
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await createFoodItem({
        externalId: formData.get('externalId') as string,
        text: formData.get('text') as string,
        region: formData.get('region') as string,
        type: formData.get('type') as string,
      });
      
      if (result.success) {
        setShowCreateForm(false);
        handleRefresh();
        showMessage('success', 'Food item created successfully');
        (e.target as HTMLFormElement).reset();
      } else {
        showMessage('error', result.error || 'Failed to create item');
      }
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await updateFoodItem(editingItem.id, {
        text: formData.get('text') as string,
        region: formData.get('region') as string,
        type: formData.get('type') as string,
        isActive: formData.get('isActive') === 'on',
      });
      
      if (result.success) {
        setEditingItem(null);
        handleRefresh();
        showMessage('success', 'Food item updated successfully');
      } else {
        showMessage('error', result.error || 'Failed to update item');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure? This will permanently delete the item from both databases.')) return;
    
    startTransition(async () => {
      const result = await deleteFoodItem(id);
      if (result.success) {
        handleRefresh();
        showMessage('success', 'Food item deleted successfully');
      } else {
        showMessage('error', result.error || 'Failed to delete item');
      }
    });
  };

  const handleVectorSync = () => {
    if (!confirm('This will sync all active items to the vector database. Continue?')) return;
    
    startTransition(async () => {
      const result = await syncAllToVector();
      if (result.success && result.data) {
        const { syncedCount } = result.data as { syncedCount: number };
        showMessage('success', `Synced ${syncedCount} items to vector database`);
      } else {
        showMessage('error', result.error || 'Vector sync failed');
      }
    });
  };

  const handleFlushVector = () => {
    if (!confirm('This will delete ALL data from the vector database. Are you sure?')) return;
    
    startTransition(async () => {
      const result = await flushVectorDB();
      if (result.success) {
        showMessage('success', 'Vector database flushed successfully');
      } else {
        showMessage('error', result.error || 'Failed to flush vector database');
      }
    });
  };

  const handleMigrateLegacy = () => {
    if (!confirm('This will import legacy food data into the PostgreSQL database. Continue?')) return;
    
    startTransition(async () => {
      const result = await migrateLegacyData();
      if (result.success && result.data) {
        const { migratedCount } = result.data as { migratedCount: number };
        handleRefresh();
        showMessage('success', `Migrated ${migratedCount} legacy items`);
      } else {
        showMessage('error', result.error || 'Migration failed');
      }
    });
  };

  const handleTestSearch = () => {
    if (!testQuery.trim()) return;
    
    startTransition(async () => {
      const result = await testVectorSearch(testQuery);
      if (result.success && result.data) {
        const results = result.data as SearchResult[];
        setTestResults(results);
        showMessage('success', `Found ${results.length} results`);
      } else {
        showMessage('error', result.error || 'Search test failed');
        setTestResults([]);
      }
    });
  };

  const filteredItems = items.filter(item =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center justify-between ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            className="text-current hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Database className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vector Database Actions */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vector Database Management</h3>
        <div className="flex flex-wrap gap-4 mb-6">
          {canEdit && (
            <button
              onClick={handleVectorSync}
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync All to Vector DB
            </button>
          )}
          
          {canDelete && (
            <>
              <button
                onClick={handleMigrateLegacy}
                disabled={isPending}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Legacy Data
              </button>
              
              <button
                onClick={handleFlushVector}
                disabled={isPending}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Flush Vector DB
              </button>
            </>
          )}
        </div>

        {/* Vector Search Test */}
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">Test Vector Search</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter search query (e.g., 'Korean fermented vegetables')..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleTestSearch}
              disabled={isPending || !testQuery.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4" />
            </button>
          </div>

          {testResults && testResults.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h5 className="font-medium text-gray-900 mb-3">Search Results:</h5>
              <div className="space-y-3">
                {testResults.map((result: SearchResult, index: number) => (
                  <div key={result.id} className="p-3 bg-white rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">#{index + 1}</span>
                      <span className="text-sm text-gray-500">
                        {(result.score * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{result.text.substring(0, 100)}...</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Region: {result.region}</span>
                      <span>Type: {result.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Food Items Management */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-medium text-gray-900">Food Items ({items.length})</h3>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={isPending}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              {canEdit && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h4 className="text-md font-medium text-gray-900 mb-4">Add New Food Item</h4>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">External ID</label>
                  <input
                    name="externalId"
                    type="text"
                    required
                    placeholder="e.g., 300"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input
                    name="region"
                    type="text"
                    required
                    placeholder="e.g., Korea"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  name="type"
                  type="text"
                  required
                  placeholder="e.g., Main Course"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="text"
                  required
                  rows={3}
                  placeholder="Detailed description of the food item..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Create Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                {canEdit && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Database className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium">No food items found</p>
                      <p className="text-sm">
                        {searchQuery ? 'No items match your search.' : 'Get started by importing legacy data or adding your first item.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-md">
                        <div className="truncate">{item.text}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {item.externalId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.updatedAt.toLocaleDateString()}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Food Item</h3>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input
                    name="region"
                    type="text"
                    defaultValue={editingItem.region}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <input
                    name="type"
                    type="text"
                    defaultValue={editingItem.type}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="text"
                  defaultValue={editingItem.text}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  defaultChecked={editingItem.isActive}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Update Item
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-900">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}