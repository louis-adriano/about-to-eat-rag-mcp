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
  X,
  Activity,
  ExternalLink,
  Sparkles,
  ChefHat,
  Settings
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
        isActive: true, // Always set to true since we're removing the toggle
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
    if (!confirm('This will sync all items to the vector database. Continue?')) return;
    
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
    <div className="space-y-8">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          message.type === 'success' 
            ? 'bg-primary/10 text-primary border-primary/20' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <span className="font-medium">{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            className="text-current hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group p-6 bg-white rounded-3xl shadow-lg border hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-3xl font-serif font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="group p-6 bg-white rounded-3xl shadow-lg border hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <ChefHat className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Items</p>
              <p className="text-3xl font-serif font-bold text-foreground">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="group p-6 bg-white rounded-3xl shadow-lg border hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ready for Search</p>
              <p className="text-3xl font-serif font-bold text-foreground">{items.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & System Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Management */}
        <div className="bg-white rounded-3xl shadow-lg border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-foreground">System Management</h3>
          </div>
          
          <div className="space-y-4">
            <a
              href="/admin/models"
              className="group w-full flex items-center justify-between p-4 bg-primary/10 rounded-2xl border border-primary/20 hover:bg-primary/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-serif font-semibold text-foreground">Model Health Dashboard</div>
                  <div className="text-sm text-muted-foreground">Monitor AI model status and performance</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform duration-300" />
            </a>

            {canEdit && (
              <div className="pt-4 border-t border-primary/20">
                <h4 className="font-serif font-semibold text-foreground mb-4">Database Operations</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleVectorSync}
                    disabled={isPending}
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Vector DB
                  </button>
                  
                  {canDelete && (
                    <>
                      <button
                        onClick={handleMigrateLegacy}
                        disabled={isPending}
                        className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-2xl hover:bg-secondary/90 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Import Legacy
                      </button>
                      
                      <button
                        onClick={handleFlushVector}
                        disabled={isPending}
                        className="inline-flex items-center px-4 py-2 bg-destructive text-destructive-foreground rounded-2xl hover:bg-destructive/90 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Flush Vector DB
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vector Search Test */}
        <div className="bg-white rounded-3xl shadow-lg border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent/20 rounded-xl">
              <Search className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-foreground">Test Vector Search</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Try searching for 'Korean fermented vegetables'..."
                className="flex-1 px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={handleTestSearch}
                disabled={isPending || !testQuery.trim()}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-2xl hover:bg-accent/90 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>

            {testResults && testResults.length > 0 && (
              <div className="p-4 bg-muted/30 rounded-2xl border border-border max-h-80 overflow-y-auto">
                <h5 className="font-serif font-semibold text-foreground mb-4">Search Results:</h5>
                <div className="space-y-3">
                  {testResults.map((result: SearchResult, index: number) => (
                    <div key={result.id} className="p-4 bg-background rounded-2xl border border-border shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">#{index + 1}</span>
                        <span className="text-sm font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {(result.score * 100).toFixed(1)}% match
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{result.text.substring(0, 120)}...</p>
                      <div className="flex gap-4 text-xs">
                        <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-full font-medium">
                          {result.region}
                        </span>
                        <span className="px-2 py-1 bg-accent/10 text-accent rounded-full font-medium">
                          {result.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Food Items Management */}
      <div className="bg-white rounded-3xl shadow-lg border overflow-hidden">
        <div className="p-8 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h3 className="text-3xl font-serif font-bold text-foreground mb-2">Food Items</h3>
              <p className="text-muted-foreground">Manage your culinary database ({items.length} items)</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background w-64"
                />
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={isPending}
                className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl transition-all duration-300"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              {canEdit && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
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
          <div className="p-8 border-b border-border bg-primary/5">
            <h4 className="text-xl font-serif font-semibold text-foreground mb-6">Add New Food Item</h4>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">External ID</label>
                  <input
                    name="externalId"
                    type="text"
                    required
                    placeholder="e.g., 300"
                    className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Region</label>
                  <input
                    name="region"
                    type="text"
                    required
                    placeholder="e.g., Korea"
                    className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Type</label>
                <input
                  name="type"
                  type="text"
                  required
                  placeholder="e.g., Main Course"
                  className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea
                  name="text"
                  required
                  rows={4}
                  placeholder="Detailed description of the food item..."
                  className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background resize-none"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  Create Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-muted text-muted-foreground rounded-2xl hover:bg-muted/80 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Item
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Region
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Updated
                </th>
                {canEdit && (
                  <th className="px-8 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 5 : 4} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center mb-4">
                        <Database className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h4 className="text-xl font-serif font-semibold text-foreground mb-2">No food items found</h4>
                      <p className="text-muted-foreground max-w-md">
                        {searchQuery ? 'No items match your search criteria.' : 'Get started by importing legacy data or adding your first delicious item.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors duration-200">
                    <td className="px-8 py-6">
                      <div className="max-w-md">
                        <div className="font-medium text-foreground leading-relaxed">{item.text}</div>
                        <div className="text-xs text-muted-foreground mt-1 font-medium">ID: {item.externalId}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                        {item.region}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-muted-foreground font-medium">
                      {item.updatedAt.toLocaleDateString()}
                    </td>
                    {canEdit && (
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all duration-300"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-8">
              <h3 className="text-2xl font-serif font-bold text-foreground mb-6">Edit Food Item</h3>
              
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Region</label>
                    <input
                      name="region"
                      type="text"
                      defaultValue={editingItem.region}
                      required
                      className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Type</label>
                    <input
                      name="type"
                      type="text"
                      defaultValue={editingItem.type}
                      required
                      className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                  <textarea
                    name="text"
                    defaultValue={editingItem.text}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background resize-none"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  >
                    Update Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-6 py-3 bg-muted text-muted-foreground rounded-2xl hover:bg-muted/80 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white p-8 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
              <span className="text-foreground font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}