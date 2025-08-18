// components/food-card.tsx - Fixed version with better error handling

'use client';

import { formatScore, getScoreColor } from '../lib/utils';
import { MapPin, Utensils } from 'lucide-react';

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
  // Validate the food data - now properly typed
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header with rank and score */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
            {rank}
          </span>
          <span className="text-sm text-gray-500">Rank #{rank}</span>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${scoreColor}`}>
            {formattedScore}% match
          </div>
          {/* Show quality indicator */}
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
      </div>

      {/* Food description */}
      <p className="text-gray-800 text-base leading-relaxed mb-4">
        {text}
      </p>

      {/* Food metadata */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-500">
          Raw score: {validScore.toFixed(4)}
        </div>
      )}
    </div>
  );
}