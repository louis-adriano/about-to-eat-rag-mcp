'use client';

import { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { SearchResult } from '@/types/food';
import { FoodCard } from './food-card';

export function FoodSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
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
    'Indian dishes with chickpeas',
    'Korean fermented vegetables', 
    'Chinese soup dumplings',
    'Spicy Thai noodles',
    'Japanese rice dishes',
    'Middle Eastern appetizers'
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you're looking for... (e.g., 'spicy Indian curry with chickpeas')"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
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
                onClick={() => setQuery(sample)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
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

      {/* Results */}
      {searchPerformed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results
              {results.length > 0 && (
                <span className="text-gray-500 font-normal ml-2">
                  ({results.length} found)
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
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No foods found matching your search.</p>
              <p className="text-gray-500 text-sm mt-2">
                Try different keywords or check the sample queries above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}