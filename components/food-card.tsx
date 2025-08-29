'use client';

import { useState, useRef } from 'react';
import { formatScore, getScoreColor } from '@/lib/utils';
import { MapPin, Utensils, Loader2, Sparkles, X, StopCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface FoodItem {
  id: string;
  text: string;
  region: string;
  type: string;
  score: number;
}

interface FoodCardProps {
  food: FoodItem;
  rank: number;
}

export function FoodCard({ food, rank }: FoodCardProps) {
  const [showContext, setShowContext] = useState(false);
  const [context, setContext] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamComplete, setStreamComplete] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Validate the food data
  if (!food || typeof food !== 'object') {
    console.warn('Invalid food data received:', food);
    return null;
  }

  const {
    text = 'Unknown dish',
    region = 'Unknown region',
    type = 'Unknown type',
    score = 0
  } = food;

  // Ensure score is a valid number
  const validScore = typeof score === 'number' && !isNaN(score) && isFinite(score) ? score : 0;
  const formattedScore = formatScore(validScore);
  const scoreColor = getScoreColor(validScore);

  const handleGetStreamingContext = async () => {
    // If context already exists and panel is closed, just show it
    if (context && !showContext) {
      setShowContext(true);
      return;
    }

    // If currently streaming, stop it
    if (isStreaming) {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
      return;
    }

    // Start streaming
    setShowContext(true);
    setIsStreaming(true);
    setStreamComplete(false);
    setContext(''); // Clear previous content

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/groq/context-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodItem: { text, region, type }
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch streaming context');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

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
                setContext(prev => prev + data.content);
              } else if (data.done) {
                setStreamComplete(true);
                setIsStreaming(false);
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Parse error:', parseError);
            }
          }
        }
      }

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Streaming error:', error);
        setContext('Unable to fetch cultural context at this time. Please try again.');
      }
      setIsStreaming(false);
      setStreamComplete(true);
    }
  };

  const handleStopStream = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setStreamComplete(true);
  };

  // Get quality rating based on score (without stars)
  const getQualityRating = (score: number) => {
    if (score >= 0.7) return { text: 'Excellent', color: 'text-green-600' };
    if (score >= 0.4) return { text: 'Very Good', color: 'text-yellow-600' };
    if (score >= 0.1) return { text: 'Good', color: 'text-orange-600' };
    return { text: 'Fair', color: 'text-red-600' };
  };

  const qualityRating = getQualityRating(validScore);

  return (
    <Card className="group overflow-hidden rounded-3xl bg-card/90 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      <CardContent className="p-6">
        {/* Header with rank and score */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-bold rounded-full shadow-md">
              {rank}
            </div>
            <div>
              <div className="text-sm text-muted-foreground font-medium">Rank #{rank}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`text-sm font-semibold ${scoreColor}`}>
                {formattedScore}% match
              </div>
              <div className={`text-xs font-medium ${qualityRating.color}`}>
                {qualityRating.text}
              </div>
            </div>
            
            {/* AI Context Button */}
            <Button
              onClick={handleGetStreamingContext}
              variant="outline"
              size="sm"
              className={`rounded-full border-2 transition-all duration-200 ${
                isStreaming 
                  ? 'border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive' 
                  : 'border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary'
              }`}
              title={isStreaming ? "Stop streaming" : "Get AI-powered cultural context"}
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </Button>

            {/* Stop button when streaming */}
            {isStreaming && (
              <Button
                onClick={handleStopStream}
                variant="outline"
                size="sm"
                className="rounded-full border-2 border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive"
                title="Stop streaming"
              >
                <StopCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Food description */}
        <p className="text-foreground text-base leading-relaxed mb-6">
          {text}
        </p>

        {/* Food metadata */}
        <div className="flex flex-wrap gap-4 text-sm mb-6">
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-2xl border border-primary/20">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">Region:</span>
            <span className="text-primary font-semibold">
              {region}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-accent/10 px-3 py-2 rounded-2xl border border-accent/20">
            <Utensils className="w-4 h-4 text-accent" />
            <span className="font-medium text-accent">Type:</span>
            <span className="text-accent font-semibold">
              {type}
            </span>
          </div>
        </div>

        {/* AI Context Panel with Streaming */}
        {showContext && (
          <Card className="border border-primary/30 bg-primary/5 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-serif font-semibold text-primary">Cultural Context</h4>
                  {isStreaming && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full animate-pulse">
                      Streaming...
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => setShowContext(false)}
                  variant="ghost"
                  size="sm"
                  className="rounded-full w-6 h-6 p-0 hover:bg-primary/10 text-primary/60 hover:text-primary"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-4 border border-primary/20">
                {context ? (
                  <div className="space-y-3">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {context}
                      {isStreaming && (
                        <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                      )}
                    </p>
                    {streamComplete && (
                      <div className="text-xs text-primary font-medium flex items-center gap-1 pt-2 border-t border-primary/20">
                        <Sparkles className="w-3 h-3" />
                        Powered by Groq AI
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-primary text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading cultural insights...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 p-2 bg-muted/50 rounded-xl text-xs text-muted-foreground">
            Raw score: {validScore.toFixed(4)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}