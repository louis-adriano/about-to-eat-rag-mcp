export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  searchResults?: SearchResult[];
  isTyping?: boolean;
  type?: 'text' | 'search_results' | 'analysis' | 'error';
}

export interface ConversationContext {
  preferences: string[];
  mentionedCuisines: string[];
  previousQueries: string[];
  discussedTopics: string[];
}

export interface StreamingResponse {
  type: 'chat_response' | 'search_results' | 'done' | 'error';
  content?: string;
  results?: SearchResult[];
  error?: string;
}

import { SearchResult } from './food';