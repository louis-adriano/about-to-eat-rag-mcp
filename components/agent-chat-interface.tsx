'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ChefHat, Sparkles, MessageCircle, X, RefreshCw, Archive } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FoodCard } from './food-card';
import { SearchResult } from '../types/food';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  searchResults?: SearchResult[];
  isTyping?: boolean;
  type?: 'text' | 'search_results' | 'analysis' | 'error';
}

interface ConversationHistory {
  role: 'user' | 'assistant';
  content: string;
}

interface StreamingResponse {
  type: 'chat_response' | 'search_results' | 'done' | 'error';
  content?: string;
  results?: SearchResult[];
  error?: string;
}

export function AgentChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-initial',
      role: 'agent',
      content: "Hi! I'm Curate, your personal culinary curator. I can help you discover amazing dishes from around the world, provide cultural insights, and curate the perfect food experiences for you. What culinary adventure are you ready for today?",
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // New state for conversation memory
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  
  const messageCounterRef = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // State to track if user is near bottom of chat
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [userScrolled, setUserScrolled] = useState(false);

  const scrollToBottom = (smooth: boolean = true) => {
    if (smooth) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      messagesEndRef.current?.scrollIntoView({ block: 'end' });
    }
  };

  // Check if user is near bottom of chat container
  const checkIfNearBottom = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 100; // Within 100px of bottom
      setShouldAutoScroll(nearBottom);
      return nearBottom;
    }
    return true;
  };

  // Handle manual scrolling by user
  const handleScroll = () => {
    setUserScrolled(true);
    checkIfNearBottom();
    
    // Reset user scrolled flag after a delay
    setTimeout(() => setUserScrolled(false), 1000);
  };

  // Only auto-scroll if user hasn't manually scrolled and is near bottom
  useEffect(() => {
    if (shouldAutoScroll && !userScrolled) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, shouldAutoScroll, userScrolled]);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    messageCounterRef.current += 1;
          const messageId = `msg-${messageCounterRef.current}-${Math.random().toString(36).substring(2, 11)}`;
    
    const newMessage: ChatMessage = {
      ...message,
      id: messageId,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (messageId: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    ));
  };

  // Enhanced clear chat that also resets conversation history
  const clearChat = () => {
    messageCounterRef.current = 1;
    setConversationHistory([]); // Clear conversation memory
    setMessages([
      {
        id: 'welcome-cleared',
        role: 'agent',
        content: "Chat cleared! Curate is ready to help you discover and curate more amazing food experiences. What would you like to explore?",
        timestamp: new Date(),
        type: 'text'
      }
    ]);
  };

  // Helper function to build conversation history for API
  const buildConversationHistory = (newUserMessage: string): ConversationHistory[] => {
    // Get the last 10 meaningful exchanges (excluding typing messages and system messages)
    const meaningfulMessages = messages.filter(msg => 
      !msg.isTyping && 
      msg.type === 'text' && 
      !msg.id.includes('welcome') &&
      msg.content.trim().length > 0
    ).slice(-20); // Last 20 messages = ~10 exchanges

    // Convert to conversation history format
    const history: ConversationHistory[] = meaningfulMessages.map(msg => ({
      role: msg.role === 'agent' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Add the new user message
    history.push({
      role: 'user',
      content: newUserMessage
    });

    return history;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    // Prevent any form submission behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    
    // Preserve scroll position and viewport
    const scrollContainer = chatContainerRef.current;
    const currentScrollTop = scrollContainer?.scrollTop || 0;
    const currentScrollLeft = scrollContainer?.scrollLeft || 0;
    
    // Clear input without losing focus
    setInput('');
    
    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
      type: 'text'
    });

    // Build conversation history including the new message
    const newConversationHistory = buildConversationHistory(userMessage);
    setConversationHistory(newConversationHistory);

    // Add initial agent typing message
    const agentMessageId = addMessage({
      role: 'agent',
      content: '',
      isTyping: true,
      type: 'analysis'
    });

    setIsLoading(true);

    // Force restore scroll position multiple times to ensure it sticks
    const restoreScrollPosition = () => {
      if (scrollContainer) {
        scrollContainer.scrollTop = currentScrollTop;
        scrollContainer.scrollLeft = currentScrollLeft;
      }
    };

    // Restore immediately and after each frame
    restoreScrollPosition();
    requestAnimationFrame(restoreScrollPosition);
    setTimeout(restoreScrollPosition, 10);
    setTimeout(restoreScrollPosition, 50);
    setTimeout(restoreScrollPosition, 100);

    try {
      // Start conversational agent chat with memory
      const response = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userMessage,
          conversationHistory: newConversationHistory // Include conversation history
        }),
      });

      if (!response.ok) {
        throw new Error('Chat failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let searchResults: SearchResult[] | null = null;
      let agentResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamingResponse = JSON.parse(line.slice(6));
              
              if (data.type === 'chat_response') {
                agentResponse += data.content || '';
                updateMessage(agentMessageId, {
                  content: agentResponse,
                  isTyping: false,
                  type: 'text'
                });
                
              } else if (data.type === 'search_results') {
                searchResults = data.results || [];
                
                // If we have search results, add them as a separate message
                if (searchResults.length > 0) {
                  addMessage({
                    role: 'agent',
                    content: '', // No text content, just results
                    searchResults: searchResults,
                    type: 'search_results'
                  });
                }
                
              } else if (data.type === 'done') {
                // Update conversation history with the final agent response
                if (agentResponse) {
                  setConversationHistory(prev => [
                    ...prev.slice(0, -1), // Remove the user message we added earlier
                    { role: 'user', content: userMessage },
                    { role: 'assistant', content: agentResponse }
                  ]);
                }
                
                // If no streaming content was received, provide a fallback response
                if (!agentResponse && !searchResults?.length) {
                  const fallbackResponse = "I'd be happy to help you discover some amazing food! Could you tell me more about what you're looking for? For example, a specific cuisine, flavor profile, or type of dish? 😊";
                  updateMessage(agentMessageId, {
                    content: fallbackResponse,
                    isTyping: false,
                    type: 'text'
                  });
                  
                  // Update conversation history with fallback
                  setConversationHistory(prev => [
                    ...prev.slice(0, -1),
                    { role: 'user', content: userMessage },
                    { role: 'assistant', content: fallbackResponse }
                  ]);
                }
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Unknown error');
              }
            } catch (parseError) {
              console.error('Parse error:', parseError);
            }
          }
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse = "I'm sorry, I encountered an error while searching for food recommendations. Please try again or rephrase your request! I'm here to help. 😊";
      updateMessage(agentMessageId, {
        content: errorResponse,
        isTyping: false,
        type: 'error'
      });
      
      // Update conversation history with error response
      setConversationHistory(prev => [
        ...prev.slice(0, -1),
        { role: 'user', content: userMessage },
        { role: 'assistant', content: errorResponse }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage(e);
    }
  };

  const suggestedPrompts = [
    "I'm craving something spicy and Korean",
    "What's a good comfort food for winter?",
    "Tell me about fermented foods",
    "Show me some Thai curry dishes",
    "I want something sweet for dessert",
    "What's popular in Japanese cuisine?"
  ];

  return (
    <div className="max-w-4xl mx-auto h-[600px] sm:h-[700px] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-xl border">
      {/* Chat Header - Mobile Optimized */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-2xl sm:rounded-t-3xl">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="p-1.5 sm:p-2 bg-primary rounded-lg sm:rounded-xl shadow-md">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif font-semibold text-foreground text-sm sm:text-base">Meet Curate</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              Your personal culinary curator • {conversationHistory.length > 0 ? `${Math.floor(conversationHistory.length / 2)} exchanges` : 'Ready to chat'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Memory indicator */}
          {conversationHistory.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
              <Archive className="w-3 h-3" />
              <span>Remembering context</span>
            </div>
          )}
          
          <Button
            onClick={clearChat}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground text-xs sm:text-sm p-1 sm:p-2"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        </div>
      </div>

      {/* Messages Area - Mobile Optimized */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-transparent to-primary/5"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 sm:gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar - Mobile Sized */}
            <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center ${
              message.role === 'user' 
                ? 'bg-secondary text-secondary-foreground' 
                : 'bg-primary text-primary-foreground'
            }`}>
              {message.role === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>

            {/* Message Content - Mobile Layout */}
            <div className={`max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1 sm:gap-2`}>
              {/* Text Message */}
              {message.content && (
                <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl sm:rounded-3xl shadow-sm border ${
                  message.role === 'user' 
                    ? 'bg-secondary text-secondary-foreground ml-auto rounded-br-lg' 
                    : 'bg-white text-foreground mr-auto rounded-bl-lg'
                } ${message.type === 'error' ? 'bg-destructive/10 border-destructive/20 text-destructive' : ''}`}>
                  <div className="flex items-start gap-1 sm:gap-2">
                    {message.type === 'analysis' && (
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary mt-0.5 flex-shrink-0" />
                    )}
                    {message.type === 'error' && (
                      <X className="w-3 h-3 sm:w-4 sm:h-4 text-destructive mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      {message.isTyping ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                          <span className="text-xs sm:text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results - Mobile Optimized */}
              {message.searchResults && message.searchResults.length > 0 && (
                <div className="space-y-3 sm:space-y-4 w-full max-w-2xl">
                  {message.searchResults.slice(0, 3).map((food, index) => (
                    <div key={food.id} className="transform scale-95">
                      <FoodCard food={food} rank={index + 1} />
                    </div>
                  ))}
                  {message.searchResults.length > 3 && (
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        + {message.searchResults.length - 3} more results
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp - Mobile Text Size */}
              <p className={`text-xs text-muted-foreground ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                {isClient ? message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : ''}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts - Mobile Grid */}
      {messages.length <= 1 && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t bg-muted/30">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 font-medium">Try asking:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {suggestedPrompts.slice(0, 3).map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(prompt)}
                className="text-xs bg-white/80 hover:bg-primary/10 hover:border-primary/30 border-border/50 text-left justify-start h-auto py-2 px-3"
              >
                <span className="truncate">{prompt}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area - Mobile Optimized */}
      <div className="p-3 sm:p-6 border-t bg-white rounded-b-2xl sm:rounded-b-3xl">
        <form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSendMessage(e);
        }} className="flex gap-2 sm:gap-3">
          <div className="flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Curate about any food or cuisine..."
              disabled={isLoading}
              className="h-10 sm:h-12 bg-muted/30 border-border/50 rounded-xl sm:rounded-2xl px-3 sm:px-4 text-sm focus:bg-white transition-colors"
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="lg"
            className="h-10 sm:h-12 px-3 sm:px-6 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 shadow-md"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>
        </form>
        
        {/* Feature Icons - Mobile Layout */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ChefHat className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Food Discovery</span>
            <span className="sm:hidden">Discovery</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Cultural Insights</span>
            <span className="sm:hidden">Insights</span>
          </div>
          <div className="flex items-center gap-1">
            <Archive className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Contextual Memory</span>
            <span className="sm:hidden">Memory</span>
          </div>
        </div>
      </div>
    </div>
  );
}