'use client';

import { SearchResult } from '../types/food';
import { formatScore, getScoreColor } from '../lib/utils';
import { MapPin, Utensils } from 'lucide-react';

interface FoodCardProps {
  food: SearchResult;
  rank: number;
}

export function FoodCard({ food, rank }: FoodCardProps) {
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
          <div className={`text-sm font-medium ${getScoreColor(food.score)}`}>
            {formatScore(food.score)}% match
          </div>
        </div>
      </div>

      {/* Food description */}
      <p className="text-gray-800 text-base leading-relaxed mb-4">
        {food.text}
      </p>

      {/* Food metadata */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">Region:</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
            {food.region}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Utensils className="w-4 h-4" />
          <span className="font-medium">Type:</span>
          <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium">
            {food.type}
          </span>
        </div>
      </div>
    </div>
  );
}