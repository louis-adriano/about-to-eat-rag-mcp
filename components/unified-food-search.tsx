'use client';

import { useState } from 'react';
import { Search, Loader2, AlertCircle, Sparkles, Brain, ChefHat, Utensils, Lightbulb, XCircle } from 'lucide-react';
import { SearchResult } from '../types/food';
import { FoodCard } from './food-card';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
    'Spicy Thai coconut noodles',
    'Japanese winter comfort food',
    'Mediterranean cheese appetizers',
    'Chinese soup dumplings',
    'Indian chickpea curry'
  ];

  const handleSampleClick = (sample: string) => {
    setQuery(sample);
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(fakeEvent, sample);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Mobile-First Search Section */}
      <div className="max-w-2xl mx-auto">
        <Card className="p-4 sm:p-6 md:p-8 shadow-2xl border bg-card/90 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-2">
                What would you like to taste?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground px-2">
                Describe your cravings, we&apos;ll guide you to the perfect dish
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
              <div className="relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex: A comforting dish with melted cheese..."
                  className="h-12 sm:h-14 pl-4 sm:pl-6 pr-14 sm:pr-16 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 border-border focus:border-primary bg-background"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || !query.trim()}
                  className="absolute right-1 sm:right-2 top-1 sm:top-2 h-10 sm:h-10 px-4 sm:px-6 rounded-lg sm:rounded-xl bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                      <span className="hidden sm:inline">Discover</span>
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Mobile-Optimized Sample Queries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 sm:mt-4">
              {sampleQueries.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSampleClick(suggestion)}
                  disabled={loading}
                  className="rounded-full text-xs sm:text-sm hover:bg-primary hover:text-primary-foreground bg-transparent text-left justify-start p-2 sm:p-3 h-auto"
                >
                  <span className="truncate">{suggestion}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message - Mobile Optimized */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3 mx-2 sm:mx-0">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-destructive font-medium text-sm sm:text-base">Search Error</p>
            <p className="text-destructive/80 text-xs sm:text-sm break-words">{error}</p>
          </div>
        </div>
      )}

      {/* Results Dashboard - Mobile Optimized */}
      {searchPerformed && (
        <div className="space-y-4 sm:space-y-6">
          {/* AI Analysis Section - Mobile Layout */}
          <Card className="border bg-primary/5 shadow-lg mx-2 sm:mx-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-primary/20 rounded-lg">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-semibold text-foreground">Understanding Your Craving</h3>
                {streamingAnalysis && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full animate-pulse">
                    Analyzing...
                  </span>
                )}
              </div>
              
              <div className="bg-background/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-primary/30 shadow-sm">
                {analysisContent ? (
                  <p className="text-foreground leading-relaxed text-sm sm:text-base">
                    {analysisContent}
                    {streamingAnalysis && (
                      <span className="inline-block w-0.5 h-4 sm:h-5 bg-primary ml-1 animate-pulse" />
                    )}
                  </p>
                ) : streamingAnalysis ? (
                  <div className="flex items-center gap-2 text-primary">
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span className="text-xs sm:text-sm">Analyzing your food craving...</span>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* AI Summary - Mobile Layout */}
          {(summaryContent || streamingSummary) && (
            <Card className="border bg-secondary/5 shadow-lg mx-2 sm:mx-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-secondary/20 rounded-lg">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-foreground">AI Recommendations</h3>
                  {streamingSummary && (
                    <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full animate-pulse">
                      Generating...
                    </span>
                  )}
                </div>
                
                <div className="bg-background/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-secondary/30 shadow-sm">
                  {summaryContent ? (
                    <div className="space-y-3">
                      <div className="text-foreground leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                        {summaryContent}
                        {streamingSummary && (
                          <span className="inline-block w-0.5 h-4 sm:h-5 bg-secondary ml-1 animate-pulse" />
                        )}
                      </div>
                      
                      {!streamingSummary && summaryContent && (
                        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-secondary/20">
                          <div className="text-xs text-secondary font-medium flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            Powered by Advanced AI Analysis
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-secondary">
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      <span className="text-xs sm:text-sm">Generating personalized recommendations...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI "No Results" Explanation - Mobile Layout */}
          {(noResultsContent || streamingNoResults) && (
            <Card className="border bg-muted shadow-lg mx-2 sm:mx-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-muted-foreground/20 rounded-lg">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-foreground">Search Results</h3>
                  {streamingNoResults && (
                    <span className="text-xs bg-muted-foreground/20 text-muted-foreground px-2 py-1 rounded-full animate-pulse">
                      Analyzing...
                    </span>
                  )}
                </div>
                
                <div className="bg-background/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-muted-foreground/30 shadow-sm">
                  {noResultsContent ? (
                    <div className="space-y-3">
                      <div className="text-foreground leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                        {noResultsContent}
                        {streamingNoResults && (
                          <span className="inline-block w-0.5 h-4 sm:h-5 bg-muted-foreground ml-1 animate-pulse" />
                        )}
                      </div>
                      
                      {!streamingNoResults && noResultsContent && (
                        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-muted-foreground/20">
                          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <Brain className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            AI-Powered Search Analysis
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      <span className="text-xs sm:text-sm">Analyzing search results...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Results - Mobile Optimized Grid */}
          {results?.vectorResults && results.vectorResults.length > 0 && results.hasMatches && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-2 sm:px-0">
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground flex items-center gap-2 sm:gap-3 mb-2">
                    <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
                    <span>Matching Dishes</span>
                  </h3>
                  <p className="text-sm sm:text-xl text-muted-foreground font-normal">
                    {results.vectorResults.length} found for &quot;{results.originalQuery}&quot;
                  </p>
                </div>
                {results.translatedQuery && results.translatedQuery !== results.originalQuery && (
                  <div className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 sm:px-3 py-1 sm:py-2 rounded-xl sm:rounded-2xl border border-border">
                    Optimized to: &quot;{results.translatedQuery}&quot;
                  </div>
                )}
              </div>

              {/* Mobile-First Grid Layout for Food Cards */}
              <div className="grid gap-4 sm:gap-6">
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

          {/* Traditional No Results Fallback - Mobile Layout */}
          {results && !results.hasMatches && !noResultsContent && !streamingNoResults && (
            <Card className="border-2 border-dashed border-border bg-background mx-2 sm:mx-0">
              <CardContent className="text-center py-12 sm:py-16">
                <div className="max-w-md mx-auto px-4">
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 bg-muted rounded-2xl sm:rounded-3xl">
                      <ChefHat className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-3 sm:mb-4">
                    No matching foods found
                  </h3>
                  
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    We couldn&apos;t find any dishes matching your search. Try describing flavors, ingredients, or cooking methods.
                  </p>
                  
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-3 sm:p-4">
                      <p className="text-sm font-semibold mb-2 sm:mb-3 text-primary">💡 Search Tips:</p>
                      <ul className="text-xs sm:text-sm text-primary/80 text-left space-y-1 sm:space-y-2">
                        <li>• Use descriptive terms (e.g., &quot;spicy&quot;, &quot;fermented&quot;, &quot;creamy&quot;)</li>
                        <li>• Mention cuisines (e.g., &quot;Korean&quot;, &quot;Thai&quot;, &quot;Italian&quot;)</li>
                        <li>• Describe cooking methods (e.g., &quot;grilled&quot;, &quot;steamed&quot;, &quot;fried&quot;)</li>
                        <li>• Include main ingredients (e.g., &quot;rice&quot;, &quot;noodles&quot;, &quot;vegetables&quot;)</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}