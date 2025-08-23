'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, AlertCircle, ChefHat, Utensils, Sparkles, Brain, Lightbulb, Zap } from 'lucide-react';
import { SearchResult } from '../types/food';
import { FoodCard } from './food-card';

interface QueryEnhancement {
  enhancedQuery: string;
  searchTerms: string[];
  cuisine: string | null;
  cookingMethod: string | null;
  ingredients: string[];
  confidence: number;
}

type SearchMode = 'vector' | 'ai';

export function FoodSearch() {
  const [searchMode, setSearchMode] = useState<SearchMode>('ai'); // Changed default to 'ai'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  
  // AI Search specific states
  const [enhancement, setEnhancement] = useState<QueryEnhancement | null>(null);
  const [recommendationsText, setRecommendationsText] = useState<string>('');
  const [streamingRecommendations, setStreamingRecommendations] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [enhancingQuery, setEnhancingQuery] = useState(false);
  const [showEnhanced, setShowEnhanced] = useState(false);

  // Real-time search suggestions (only for AI mode)
  const getSuggestions = useCallback(async (partialQuery: string) => {
    if (partialQuery.length < 3 || searchMode !== 'ai') {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch('/api/groq/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partialQuery }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  }, [searchMode]);

  // Debounce suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && !searchPerformed && searchMode === 'ai') {
        getSuggestions(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchPerformed, searchMode, getSuggestions]);

  // Clear AI-specific states when switching to vector mode
  useEffect(() => {
    if (searchMode === 'vector') {
      setSuggestions([]);
      setEnhancement(null);
      setRecommendationsText('');
      setShowEnhanced(false);
    }
  }, [searchMode]);

  // Main search function
  const handleSearch = async (e: React.FormEvent, searchQuery?: string) => {
    e.preventDefault();
    
    const queryToSearch = searchQuery || query.trim();
    
    if (!queryToSearch) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchPerformed(true);
    setLastQuery(queryToSearch);
    setSuggestions([]);
    setRecommendationsText('');
    setStreamingRecommendations(false);
    setEnhancement(null);
    setShowEnhanced(false);

    try {
      let finalQuery = queryToSearch;
      
      // Step 1: AI Enhancement (only for AI search mode)
      if (searchMode === 'ai' && !searchQuery) {
        setEnhancingQuery(true);
        try {
          const enhanceResponse = await fetch('/api/groq/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: queryToSearch }),
          });

          if (enhanceResponse.ok) {
            const enhanceData = await enhanceResponse.json();
            setEnhancement(enhanceData.enhancement);
            finalQuery = enhanceData.enhancement.enhancedQuery;
            setShowEnhanced(true);
          }
        } catch (enhanceError) {
          console.error('Query enhancement failed:', enhanceError);
        } finally {
          setEnhancingQuery(false);
        }
      }

      // Step 2: Vector search (both modes use this)
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: finalQuery,
          limit: 8
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      const searchResults = data.results || [];
      setResults(searchResults);

      // Step 3: AI Recommendations (only for AI search mode)
      if (searchMode === 'ai' && searchResults.length > 0) {
        setStreamingRecommendations(true);
        setRecommendationsText('');
        
        try {
          const recommendResponse = await fetch('/api/groq/recommendations-stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: queryToSearch,
              searchResults: searchResults.slice(0, 3),
            }),
          });

          if (recommendResponse.ok) {
            const reader = recommendResponse.body?.getReader();
            if (reader) {
              const decoder = new TextDecoder();
              
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      if (data.content) {
                        setRecommendationsText(prev => prev + data.content);
                      } else if (data.done) {
                        setStreamingRecommendations(false);
                      }
                    } catch (parseError) {
                      console.error('Parse error:', parseError);
                    }
                  }
                }
              }
            }
          }
        } catch (recommendError) {
          console.error('Streaming recommendations failed:', recommendError);
          setStreamingRecommendations(false);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sample: string) => {
    setQuery(sample);
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(fakeEvent, sample);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(fakeEvent, suggestion);
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

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Search Mode Tabs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setSearchMode('ai')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                searchMode === 'ai'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Brain className="w-4 h-4" />
              AI Search
            </button>
            <button
              onClick={() => setSearchMode('vector')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                searchMode === 'vector'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              Vector Search
            </button>
          </div>
        </div>

        {/* Mode Description */}
        <div className="text-center mb-6">
          {searchMode === 'ai' ? (
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">AI Search</h3>
              </div>
              <p className="text-purple-700 text-sm">
                Enhanced with AI query understanding, real-time suggestions, and personalized recommendations.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Vector Search</h3>
              </div>
              <p className="text-blue-700 text-sm">
                Fast semantic search using vector embeddings. Finds foods based on meaning and similarity.
              </p>
            </div>
          )}
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchMode === 'ai'
                  ? "Describe what you're craving... (AI will enhance your query)"
                  : "Describe what you're looking for... (e.g., 'Korean fermented vegetables')"
              }
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500"
              disabled={loading}
            />
            
            {/* AI Suggestions Dropdown (only for AI mode) */}
            {searchMode === 'ai' && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="p-2 text-xs text-gray-500 border-b flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                searchMode === 'ai'
                  ? 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
              } disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {enhancingQuery ? 'Enhancing...' : 'Searching...'}
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  {searchMode === 'ai' ? 'AI Search' : 'Vector Search'}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Query Enhancement Display (AI mode only) */}
        {searchMode === 'ai' && showEnhanced && enhancement && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">AI Enhanced Query</span>
              <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded">
                {Math.round(enhancement.confidence * 100)}% confidence
              </span>
            </div>
            <p className="text-sm text-purple-700 mb-2">&ldquo;{enhancement.enhancedQuery}&rdquo;</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {enhancement.cuisine && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Cuisine: {enhancement.cuisine}</span>
              )}
              {enhancement.cookingMethod && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Method: {enhancement.cookingMethod}</span>
              )}
              {enhancement.ingredients.length > 0 && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                  Ingredients: {enhancement.ingredients.join(', ')}
                </span>
              )}
            </div>
          </div>
        )}

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

      {/* AI Recommendations (AI mode only) */}
      {searchMode === 'ai' && (recommendationsText || streamingRecommendations) && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">AI Recommendations</h3>
            {streamingRecommendations && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded animate-pulse">
                Streaming...
              </span>
            )}
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            {recommendationsText ? (
              <div className="space-y-2">
                <p className="text-sm text-purple-800 leading-relaxed whitespace-pre-wrap">
                  {recommendationsText}
                  {streamingRecommendations && (
                    <span className="inline-block w-2 h-4 bg-purple-600 ml-1 animate-pulse" />
                  )}
                </p>
                {streamingRecommendations && (
                  <div className="text-xs text-purple-600 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Powered by Groq AI
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-purple-600 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading cultural insights...</span>
              </div>
            )}
            
            {!streamingRecommendations && recommendationsText && (
              <div className="mt-3 text-xs text-purple-600 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Powered by Groq AI
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchPerformed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results
              {results.length > 0 && (
                <span className="text-gray-500 font-normal ml-2">
                  ({results.length} found {searchMode === 'ai' ? 'with AI' : 'with vector search'} for &ldquo;{lastQuery}&rdquo;)
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
                  We couldn&apos;t find any dishes matching <strong>&ldquo;{lastQuery}&rdquo;</strong>
                  {searchMode === 'vector' && '. Try the AI Search for enhanced results!'}
                </p>
                
                {searchMode === 'vector' && (
                  <button
                    onClick={() => setSearchMode('ai')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium mb-4"
                  >
                    <Brain className="w-4 h-4" />
                    Try AI Search
                  </button>
                )}
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">💡 Search Tips:</p>
                  <ul className="text-sm text-blue-700 text-left space-y-1">
                    <li>• Try broader terms (e.g., &ldquo;Korean vegetables&rdquo; instead of &ldquo;Korean fermented cabbage&rdquo;)</li>
                    <li>• Use cuisine names (e.g., &ldquo;Thai&rdquo;, &ldquo;Chinese&rdquo;, &ldquo;Japanese&rdquo;)</li>
                    <li>• Describe cooking methods (e.g., &ldquo;fried&rdquo;, &ldquo;grilled&rdquo;, &ldquo;steamed&rdquo;)</li>
                    <li>• Search by main ingredients (e.g., &ldquo;rice&rdquo;, &ldquo;noodles&rdquo;, &ldquo;chicken&rdquo;)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}