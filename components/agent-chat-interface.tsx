'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ChefHat, Sparkles, MessageCircle, X, RefreshCw } from 'lucide-react';
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
  const messageCounterRef = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    messageCounterRef.current += 1;
    const messageId = `msg-${messageCounterRef.current}-${Math.random().toString(36).substr(2, 9)}`;
    
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

  const clearChat = () => {
    messageCounterRef.current = 1;
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

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
      type: 'text'
    });

    // Add initial agent typing message
    const agentMessageId = addMessage({
      role: 'agent',
      content: '',
      isTyping: true,
      type: 'analysis'
    });

    setIsLoading(true);

    try {
      // Start conversational agent chat
      const response = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage }),
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
                // If no streaming content was received, provide a fallback response
                if (!agentResponse && !searchResults?.length) {
                  updateMessage(agentMessageId, {
                    content: "I'd be happy to help you discover some amazing food! Could you tell me more about what you're looking for? For example, a specific cuisine, flavor profile, or type of dish? 😊",
                    isTyping: false,
                    type: 'text'
                  });
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
      updateMessage(agentMessageId, {
        content: "I'm sorry, I encountered an error while searching for food recommendations. Please try again or rephrase your request! I'm here to help. 😊",
        isTyping: false,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
    <div className="max-w-4xl mx-auto h-[700px] flex flex-col bg-white rounded-3xl shadow-xl border">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl shadow-md">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-foreground">Meet Curate</h3>
            <p className="text-sm text-muted-foreground">Your personal culinary curator</p>
          </div>
        </div>
        
        <Button
          onClick={clearChat}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Clear Chat
        </Button>
      </div>

      {/* Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-primary/5"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
              message.role === 'user' 
                ? 'bg-secondary text-secondary-foreground' 
                : 'bg-primary text-primary-foreground'
            }`}>
              {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            {/* Message Content */}
            <div className={`max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
              {/* Text Message */}
              {message.content && (
                <div className={`px-4 py-3 rounded-3xl shadow-sm border ${
                  message.role === 'user' 
                    ? 'bg-secondary text-secondary-foreground ml-auto rounded-br-lg' 
                    : 'bg-white text-foreground mr-auto rounded-bl-lg'
                } ${message.type === 'error' ? 'bg-destructive/10 border-destructive/20 text-destructive' : ''}`}>
                  <div className="flex items-start gap-2">
                    {message.type === 'analysis' && (
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    )}
                    {message.type === 'error' && (
                      <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      {message.isTyping ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results */}
              {message.searchResults && message.searchResults.length > 0 && (
                <div className="space-y-4 w-full max-w-2xl">
                  {message.searchResults.slice(0, 3).map((food, index) => (
                    <div key={food.id} className="transform scale-95">
                      <FoodCard food={food} rank={index + 1} />
                    </div>
                  ))}
                  {message.searchResults.length > 3 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        + {message.searchResults.length - 3} more results
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp */}
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

      {/* Suggested Prompts (show when chat is empty or after welcome message) */}
      {messages.length <= 1 && (
        <div className="px-6 py-4 border-t bg-muted/30">
          <p className="text-sm text-muted-foreground mb-3 font-medium">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.slice(0, 3).map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(prompt)}
                className="text-xs bg-white/80 hover:bg-primary/10 hover:border-primary/30 border-border/50"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t bg-white rounded-b-3xl">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Curate about any food or cuisine..."
              disabled={isLoading}
              className="h-12 bg-muted/30 border-border/50 rounded-2xl px-4 text-sm focus:bg-white transition-colors"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="lg"
            className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 shadow-md"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ChefHat className="w-3 h-3" />
            <span>Food Discovery</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Cultural Insights</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>Natural Conversation</span>
          </div>
        </div>
      </div>
    </div>
  );
}