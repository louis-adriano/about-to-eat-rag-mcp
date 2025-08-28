'use client';

import { useState } from 'react';
import { Search, Loader2, AlertCircle, Sparkles, Brain, ChefHat, Utensils, Lightbulb, XCircle } from 'lucide-react';
import { SearchResult } from '../types/food';
import { FoodCard } from './food-card';

interface UnifiedSearchResults {
  vectorResults: SearchResult[];
  originalQuery: string;
  translatedQuery?: string;
  top3Results?: SearchResult[];
  hasMatches: boolean;
}

export function UnifiedFoodSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UnifiedSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Streaming states
  const [streamingAnalysis, setStreamingAnalysis] = useState(false);
  const [streamingSummary, setStreamingSummary] = useState(false);
  const [analysisContent, setAnalysisContent] = useState('');
  const [summaryContent, setSummaryContent] = useState('');
  const [noResultsContent, setNoResultsContent] = useState('');
  const [streamingNoResults, setStreamingNoResults] = useState(false);

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
    setResults(null);
    setAnalysisContent('');
    setSummaryContent('');
    setNoResultsContent('');
    setStreamingAnalysis(true);
    setStreamingSummary(false);
    setStreamingNoResults(false);

    try {
      // Start the enhanced unified search
      const response = await fetch('/api/unified-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToSearch }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let searchResults: UnifiedSearchResults | null = null;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'analysis') {
                setAnalysisContent(data.content);
                setStreamingAnalysis(false);
                setStreamingSummary(true);
              } else if (data.type === 'ai_summary') {
                setSummaryContent(prev => prev + data.content);
              } else if (data.type === 'ai_no_results') {
                setStreamingAnalysis(false);
                setStreamingSummary(false);
                setStreamingNoResults(true);
                setNoResultsContent(prev => prev + data.content);
              } else if (data.type === 'search_results') {
                searchResults = data.results;
                setStreamingSummary(false);
                setStreamingNoResults(false);
              } else if (data.type === 'done') {
                setStreamingAnalysis(false);
                setStreamingSummary(false);
                setStreamingNoResults(false);
                if (searchResults) {
                  setResults(searchResults);
                }
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Parse error:', parseError);
            }
          }
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStreamingAnalysis(false);
      setStreamingSummary(false);
      setStreamingNoResults(false);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'Korean fermented vegetables',
    'Spicy Thai noodles with coconut',
    'Japanese comfort food for winter',
    'Mediterranean appetizers with cheese',
    'Chinese soup dumplings',
    'Indian curry with chickpeas'
  ];

  const handleSampleClick = (sample: string) => {
    setQuery(sample);
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(fakeEvent, sample);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          AI-Powered Food Discovery
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Describe what you&apos;re craving and get intelligent recommendations with cultural insights!
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you're craving... (e.g., 'spicy fermented Korean side dish')"
              className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 placeholder-gray-500 text-lg"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Search with AI
              </>
            )}
          </button>
        </form>

        {/* Sample Queries */}
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3 font-medium">Try these sample searches:</p>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sample, index) => (
              <button
                key={index}
                onClick={() => handleSampleClick(sample)}
                className="px-3 py-2 text-sm bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200 border border-gray-200 hover:border-gray-300 disabled:opacity-50"
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

      {/* Results Dashboard */}
      {searchPerformed && (
        <div className="space-y-6">
          {/* AI Analysis Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900">Understanding Your Craving</h3>
              {streamingAnalysis && (
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full animate-pulse">
                  Analyzing...
                </span>
              )}
            </div>
            
            <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm">
              {analysisContent ? (
                <p className="text-blue-800 leading-relaxed text-base">
                  {analysisContent}
                </p>
              ) : streamingAnalysis ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing your food craving...</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* AI Summary with Top 3 (for successful matches) */}
          {(summaryContent || streamingSummary) && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-purple-900">AI Recommendations</h3>
                {streamingSummary && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full animate-pulse">
                    Generating...
                  </span>
                )}
              </div>
              
              <div className="bg-white rounded-lg p-5 border border-purple-100 shadow-sm">
                {summaryContent ? (
                  <div className="space-y-3">
                    <div className="text-purple-800 leading-relaxed text-base whitespace-pre-wrap">
                      {summaryContent}
                      {streamingSummary && (
                        <span className="inline-block w-2 h-5 bg-purple-600 ml-1 animate-pulse" />
                      )}
                    </div>
                    
                    {!streamingSummary && summaryContent && (
                      <div className="mt-4 pt-3 border-t border-purple-100">
                        <div className="text-xs text-purple-600 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Powered by Advanced AI Analysis
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-purple-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating personalized recommendations...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI "No Results" Explanation */}
          {(noResultsContent || streamingNoResults) && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-orange-900">Search Results</h3>
                {streamingNoResults && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full animate-pulse">
                    Analyzing...
                  </span>
                )}
              </div>
              
              <div className="bg-white rounded-lg p-5 border border-orange-100 shadow-sm">
                {noResultsContent ? (
                  <div className="space-y-3">
                    <div className="text-orange-800 leading-relaxed text-base whitespace-pre-wrap">
                      {noResultsContent}
                      {streamingNoResults && (
                        <span className="inline-block w-2 h-5 bg-orange-600 ml-1 animate-pulse" />
                      )}
                    </div>
                    
                    {!streamingNoResults && noResultsContent && (
                      <div className="mt-4 pt-3 border-t border-orange-100">
                        <div className="text-xs text-orange-600 font-medium flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          AI-Powered Search Analysis
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing search results...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Results (only show if we have matches) */}
          {results?.vectorResults && results.vectorResults.length > 0 && results.hasMatches && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Utensils className="w-6 h-6" />
                  All Matching Dishes
                  <span className="text-gray-500 font-normal text-lg">
                    ({results.vectorResults.length} found for &quot;{results.originalQuery}&quot;)
                  </span>
                </h3>
                {results.translatedQuery && results.translatedQuery !== results.originalQuery && (
                  <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                    Optimized to: &quot;{results.translatedQuery}&quot;
                  </div>
                )}
              </div>

              <div className="grid gap-4">
                {results.vectorResults.map((food, index) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    rank={index + 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Traditional No Results Fallback (only if AI explanation fails) */}
          {results && !results.hasMatches && !noResultsContent && !streamingNoResults && (
            <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="flex justify-center mb-4">
                  <ChefHat className="w-16 h-16 text-gray-300" />
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No matching foods found
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  We couldn&apos;t find any dishes matching your search. Try describing flavors, ingredients, or cooking methods.
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">💡 Search Tips:</p>
                  <ul className="text-sm text-blue-700 text-left space-y-1">
                    <li>• Use descriptive terms (e.g., &quot;spicy&quot;, &quot;fermented&quot;, &quot;creamy&quot;)</li>
                    <li>• Mention cuisines (e.g., &quot;Korean&quot;, &quot;Thai&quot;, &quot;Italian&quot;)</li>
                    <li>• Describe cooking methods (e.g., &quot;grilled&quot;, &quot;steamed&quot;, &quot;fried&quot;)</li>
                    <li>• Include main ingredients (e.g., &quot;rice&quot;, &quot;noodles&quot;, &quot;vegetables&quot;)</li>
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