// File: lib/memory-service.ts
import { ConversationMessage, ConversationContext } from '../types/conversation';

export class MemoryService {
  /**
   * Extract conversation context from message history
   */
  static extractConversationContext(history: ConversationMessage[]): ConversationContext {
    const preferences: string[] = [];
    const mentionedCuisines: string[] = [];
    const previousQueries: string[] = [];
    const discussedTopics: string[] = [];

    // Known cuisines to detect
    const cuisines = [
      'korean', 'chinese', 'japanese', 'thai', 'vietnamese', 'indian', 
      'italian', 'french', 'mexican', 'mediterranean', 'greek', 'spanish',
      'american', 'british', 'german', 'brazilian', 'argentine', 'peruvian',
      'ethiopian', 'moroccan', 'jamaican', 'caribbean'
    ];

    // Food preferences and characteristics
    const preferenceKeywords = [
      'spicy', 'mild', 'sweet', 'sour', 'salty', 'umami', 'savory',
      'crispy', 'creamy', 'crunchy', 'soft', 'chewy', 'tender',
      'fermented', 'grilled', 'fried', 'steamed', 'baked', 'raw',
      'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
      'comfort food', 'healthy', 'light', 'heavy', 'rich'
    ];

    // Food topics
    const topicKeywords = [
      'soup', 'noodles', 'rice', 'pasta', 'bread', 'dessert', 'appetizer',
      'main course', 'snack', 'drink', 'curry', 'stew', 'salad', 'seafood',
      'meat', 'chicken', 'beef', 'pork', 'vegetables', 'tofu'
    ];

    history.forEach(message => {
      const content = message.content.toLowerCase();
      
      // Extract user queries
      if (message.role === 'user') {
        previousQueries.push(message.content);
      }

      // Extract mentioned cuisines
      cuisines.forEach(cuisine => {
        if (content.includes(cuisine) && !mentionedCuisines.includes(cuisine)) {
          mentionedCuisines.push(cuisine);
        }
      });

      // Extract preferences
      preferenceKeywords.forEach(pref => {
        if (content.includes(pref) && !preferences.includes(pref)) {
          preferences.push(pref);
        }
      });

      // Extract discussed topics
      topicKeywords.forEach(topic => {
        if (content.includes(topic) && !discussedTopics.includes(topic)) {
          discussedTopics.push(topic);
        }
      });
    });

    return {
      preferences: preferences.slice(-10), // Keep last 10 preferences
      mentionedCuisines: mentionedCuisines.slice(-8), // Keep last 8 cuisines
      previousQueries: previousQueries.slice(-5), // Keep last 5 queries
      discussedTopics: discussedTopics.slice(-12) // Keep last 12 topics
    };
  }

  /**
   * Generate context summary for AI
   */
  static generateContextSummary(context: ConversationContext): string {
    const parts: string[] = [];

    if (context.mentionedCuisines.length > 0) {
      parts.push(`Cuisines discussed: ${context.mentionedCuisines.join(', ')}`);
    }

    if (context.preferences.length > 0) {
      parts.push(`Food preferences shown: ${context.preferences.join(', ')}`);
    }

    if (context.discussedTopics.length > 0) {
      parts.push(`Topics covered: ${context.discussedTopics.join(', ')}`);
    }

    if (context.previousQueries.length > 0) {
      parts.push(`Recent questions: ${context.previousQueries.slice(-2).join('; ')}`);
    }

    return parts.length > 0 ? `Conversation context: ${parts.join('. ')}.` : '';
  }

  /**
   * Suggest follow-up questions based on conversation history
   */
  static generateFollowUpSuggestions(context: ConversationContext): string[] {
    const suggestions: string[] = [];

    // Suggest related cuisines
    if (context.mentionedCuisines.includes('korean')) {
      suggestions.push("Tell me about Japanese fermented foods");
      suggestions.push("What's similar to kimchi in other cuisines?");
    }

    if (context.mentionedCuisines.includes('thai')) {
      suggestions.push("Vietnamese dishes with similar flavors");
      suggestions.push("Other Southeast Asian curries");
    }

    if (context.mentionedCuisines.includes('italian')) {
      suggestions.push("Mediterranean pasta alternatives");
      suggestions.push("French dishes with similar techniques");
    }

    // Suggest based on preferences
    if (context.preferences.includes('spicy')) {
      suggestions.push("Spicy dishes from different regions");
      suggestions.push("How to balance heat in cooking");
    }

    if (context.preferences.includes('fermented')) {
      suggestions.push("Fermented foods for gut health");
      suggestions.push("Traditional fermentation techniques");
    }

    // Suggest based on topics
    if (context.discussedTopics.includes('soup')) {
      suggestions.push("Cold soups for summer");
      suggestions.push("Soup traditions around the world");
    }

    if (context.discussedTopics.includes('noodles')) {
      suggestions.push("Regional noodle variations");
      suggestions.push("Noodle making techniques");
    }

    // Return unique suggestions, limit to 6
    return Array.from(new Set(suggestions)).slice(0, 6);
  }

  /**
   * Determine if a query is asking for personalized recommendations
   */
  static isPersonalizationQuery(query: string): boolean {
    const personalizationKeywords = [
      'recommend', 'suggest', 'what should i', 'what would you',
      'for me', 'my favorite', 'i like', 'i love', 'i prefer',
      'similar to', 'like the', 'based on', 'considering'
    ];

    const lowerQuery = query.toLowerCase();
    return personalizationKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Generate personalized recommendations based on conversation history
   */
  static generatePersonalizedContext(
    query: string, 
    context: ConversationContext
  ): string {
    const parts: string[] = [];

    if (this.isPersonalizationQuery(query)) {
      if (context.mentionedCuisines.length > 0) {
        parts.push(`Based on your interest in ${context.mentionedCuisines.join(' and ')} cuisine`);
      }

      if (context.preferences.length > 0) {
        const recentPrefs = context.preferences.slice(-3);
        parts.push(`considering your preference for ${recentPrefs.join(', ')} foods`);
      }

      if (context.discussedTopics.length > 0) {
        const recentTopics = context.discussedTopics.slice(-2);
        parts.push(`and your interest in ${recentTopics.join(' and ')}`);
      }
    }

    return parts.length > 0 ? parts.join(', ') + ', ' : '';
  }

  /**
   * Clean and optimize conversation history for API calls
   */
  static optimizeConversationHistory(
    history: ConversationMessage[],
    maxMessages: number = 20
  ): ConversationMessage[] {
    // Take the most recent messages
    const recentHistory = history.slice(-maxMessages);

    // Clean up messages - remove very short or repetitive content
    return recentHistory.filter(msg => {
      const content = msg.content.trim();
      return content.length > 5 && // Minimum length
             !content.match(/^(hi|hello|hey|ok|thanks|thank you)$/i); // Filter out very basic responses
    });
  }

  /**
   * Generate conversation summary for long conversations
   */
  static generateConversationSummary(history: ConversationMessage[]): string {
    if (history.length < 6) return '';

    const context = this.extractConversationContext(history);
    const summary = [];

    if (context.mentionedCuisines.length > 0) {
      summary.push(`Explored ${context.mentionedCuisines.length} cuisines: ${context.mentionedCuisines.slice(0, 3).join(', ')}`);
    }

    if (context.preferences.length > 0) {
      summary.push(`Preferences: ${context.preferences.slice(0, 4).join(', ')}`);
    }

    if (context.discussedTopics.length > 0) {
      summary.push(`Topics: ${context.discussedTopics.slice(0, 3).join(', ')}`);
    }

    return summary.length > 0 ? `Conversation so far - ${summary.join('. ')}.` : '';
  }
}