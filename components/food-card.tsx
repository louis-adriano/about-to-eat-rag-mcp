'use client';

import { useState, useRef } from 'react';
import { formatScore, getScoreColor } from '../lib/utils';
import { MapPin, Utensils, Loader2, Sparkles, X, StopCircle } from 'lucide-react';

interface FoodCardProps {
  food: {
    id: string;
    text: string;
    region: string;
    type: string;
    score: number;
  };
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

    } catch (error: any) {
      if (error.name === 'AbortError') {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 relative">
      {/* Header with rank and score */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
            {rank}
          </span>
          <span className="text-sm text-gray-500">Rank #{rank}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className={`text-sm font-medium ${scoreColor}`}>
              {formattedScore}% match
            </div>
            {/* Quality indicator */}
            {validScore >= 0.7 && (
              <div className="text-xs text-green-600 font-medium">Excellent</div>
            )}
            {validScore >= 0.4 && validScore < 0.7 && (
              <div className="text-xs text-yellow-600 font-medium">Good</div>
            )}
            {validScore >= 0.1 && validScore < 0.4 && (
              <div className="text-xs text-orange-600 font-medium">Fair</div>
            )}
            {validScore < 0.1 && validScore > 0 && (
              <div className="text-xs text-red-600 font-medium">Low</div>
            )}
          </div>
          
          {/* AI Context Button */}
          <button
            onClick={handleGetStreamingContext}
            disabled={false}
            className={`p-2 rounded-full transition-colors ${
              isStreaming 
                ? 'bg-red-50 hover:bg-red-100 text-red-600' 
                : 'bg-purple-50 hover:bg-purple-100 text-purple-600'
            }`}
            title={isStreaming ? "Stop streaming" : "Get AI-powered cultural context"}
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>

          {/* Stop button when streaming */}
          {isStreaming && (
            <button
              onClick={handleStopStream}
              className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
              title="Stop streaming"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Food description */}
      <p className="text-gray-800 text-base leading-relaxed mb-4">
        {text}
      </p>

      {/* Food metadata */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">Region:</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
            {region}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Utensils className="w-4 h-4" />
          <span className="font-medium">Type:</span>
          <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium">
            {type}
          </span>
        </div>
      </div>

      {/* AI Context Panel with Streaming */}
      {showContext && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-semibold text-purple-900">Cultural Context</h4>
              {isStreaming && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded animate-pulse">
                  Streaming...
                </span>
              )}
            </div>
            <button
              onClick={() => setShowContext(false)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            {context ? (
              <div className="space-y-2">
                <p className="text-sm text-purple-800 leading-relaxed whitespace-pre-wrap">
                  {context}
                  {isStreaming && (
                    <span className="inline-block w-2 h-4 bg-purple-600 ml-1 animate-pulse" />
                  )}
                </p>
                {streamComplete && (
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
          </div>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-500">
          Raw score: {validScore.toFixed(4)}
        </div>
      )}
    </div>
  );
}