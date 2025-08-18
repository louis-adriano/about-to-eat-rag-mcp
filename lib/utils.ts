
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type * as FoodTypes from '../types/food';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  // Ensure score is a valid number
  if (typeof score !== 'number' || isNaN(score)) {
    return '0.0';
  }
  
  // Ensure score is between 0 and 1
  const normalizedScore = Math.max(0, Math.min(1, score));
  
  // Convert to percentage and format with 1 decimal place
  const percentage = normalizedScore * 100;
  
  // Format with 1 decimal place, ensuring at least 0.1% for any positive score
  if (percentage > 0 && percentage < 0.1) {
    return '0.1';
  }
  
  // Round to 1 decimal place
  return Math.round(percentage * 10) / 10 + '';
}

export function getScoreColor(score: number): string {
  // Ensure score is a valid number
  if (typeof score !== 'number' || isNaN(score)) {
    return "text-gray-500";
  }
  
  const normalizedScore = Math.max(0, Math.min(1, score));
  
  if (normalizedScore >= 0.7) return "text-green-600";
  if (normalizedScore >= 0.4) return "text-yellow-600";
  if (normalizedScore >= 0.1) return "text-orange-600";
  return "text-red-600";
}

export function truncateText(text: string, maxLength: number = 150): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Helper function to validate search results
export function validateSearchResult(result: unknown): result is FoodTypes.SearchResult {
  return (
    result != null &&
    typeof result === 'object' &&
    'id' in result &&
    'text' in result &&
    'region' in result &&
    'type' in result &&
    'score' in result &&
    typeof (result as Record<string, unknown>).id === 'string' &&
    typeof (result as Record<string, unknown>).text === 'string' &&
    typeof (result as Record<string, unknown>).region === 'string' &&
    typeof (result as Record<string, unknown>).type === 'string' &&
    typeof (result as Record<string, unknown>).score === 'number' &&
    !isNaN((result as Record<string, unknown>).score as number)
  );
}

// Import the SearchResult type
import { SearchResult } from '../types/food';