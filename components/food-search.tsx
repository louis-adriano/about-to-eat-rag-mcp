'use client';

import { useState } from 'react';
import { Search, Loader2, AlertCircle, ChefHat, Utensils } from 'lucide-react';
import { SearchResult } from '../types/food';
import { FoodCard } from './food-card';

export function FoodSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  // Updated handleSearch to accept an optional query parameter
  const handleSearch = async (e: React.FormEvent, searchQuery?: string) => {
    e.preventDefault();
    
    // Use the provided searchQuery or fall back to the current query state
    const queryToSearch = searchQuery || query.trim();
    
    if (!queryToSearch) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchPerformed(true);
    setLastQuery(queryToSearch);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryToSearch,
          limit: 8
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'Korean fermented vegetables',
    'Chinese soup dumplings', 
    'Spicy Thai noodles',
    'Japanese rice dishes',
    'Italian pasta with cheese',
    'Middle Eastern appetizers',
    'Vietnamese noodle soup',
    'Indian curry with chickpeas'
  ];

  // Fixed handleSampleClick to pass the sample directly to handleSearch
  const handleSampleClick = (sample: string) => {
    setQuery(sample);
    // Create a fake event and pass the sample query directly
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(fakeEvent, sample);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={(e) => handleSearch(e)} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you're looking for... (e.g., 'Korean fermented vegetables', 'spicy Thai soup')"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search Foods
              </>
            )}
          </button>
        </form>

        {/* Sample Queries */}
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3">Try these sample searches:</p>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sample, index) => (
              <button
                key={index}
                onClick={() => handleSampleClick(sample)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Search Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {searchPerformed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results
              {results.length > 0 && (
                <span className="text-gray-500 font-normal ml-2">
                  ({results.length} found for &quot;{lastQuery}&quot;)
                </span>
              )}
            </h2>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((food, index) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  rank={index + 1}
                />
              ))}
            </div>
          ) : !loading && (
            <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <ChefHat className="w-16 h-16 text-gray-300" />
                    <Utensils className="w-6 h-6 text-gray-400 absolute -bottom-1 -right-1" />
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No matching foods found
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  We couldn&apos;t find any dishes matching <strong>&quot;{lastQuery}&quot;</strong>. 
                  This could mean your search was too specific or outside our current food database.
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">💡 Search Tips:</p>
                  <ul className="text-sm text-blue-700 text-left space-y-1">
                    <li>• Try broader terms (e.g., &quot;Korean vegetables&quot; instead of &quot;Korean fermented cabbage&quot;)</li>
                    <li>• Use cuisine names (e.g., &quot;Thai&quot;, &quot;Chinese&quot;, &quot;Japanese&quot;)</li>
                    <li>• Describe cooking methods (e.g., &quot;fried&quot;, &quot;grilled&quot;, &quot;steamed&quot;)</li>
                    <li>• Search by main ingredients (e.g., &quot;rice&quot;, &quot;noodles&quot;, &quot;chicken&quot;)</li>
                  </ul>
                </div>
                
                <button
                  onClick={() => {
                    setQuery('');
                    setSearchPerformed(false);
                    setResults([]);
                    setLastQuery('');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Search className="w-4 h-4" />
                  Try a new search
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}