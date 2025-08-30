// File: app/agent/page.tsx (Updated with memory features)
'use client';

import { AgentChatInterface } from '../../components/agent-chat-interface';
import { Bot, Sparkles, MessageCircle, Search, Brain, Archive } from 'lucide-react';

export default function AgentPage() {
  // REMOVED: useEffect that was calling window.scrollTo(0, 0)
  // This was likely causing the page to jump to top!
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Hero Section */}
      <section className="relative py-12 bg-white/50 backdrop-blur-sm border-b border-primary/20">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <MessageCircle className="w-6 h-6 text-primary animate-bounce" />
          </div>
          
          <h1 className="text-5xl font-serif font-bold text-foreground mb-4">
            Meet
            <span className="text-primary"> Curate</span>
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
            Chat with Curate, your personal culinary curator with memory. I remember our conversations and build on your preferences to discover dishes, provide cultural insights, and curate perfect meal experiences through natural conversation.
          </p>

          {/* Enhanced Features */}
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              <span>Smart Food Search</span>
            </div>
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-primary" />
              <span>Conversation Memory</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Cultural Insights</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <span>AI-Powered Chat</span>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Interface */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <AgentChatInterface />
        </div>
      </section>

      {/* Enhanced Tips Section */}
      <section className="py-16 bg-primary/5 border-t border-primary/20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">How to Chat with Curate</h2>
            <p className="text-muted-foreground">Get the most out of your conversation with these tips</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-foreground">Ask Naturally</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• &quot;I&apos;m craving something spicy and Korean&quot;</li>
                <li>• &quot;What&apos;s a good comfort food for winter?&quot;</li>
                <li>• &quot;Tell me about Italian pasta dishes&quot;</li>
                <li>• &quot;Find me something fermented and healthy&quot;</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <Brain className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-serif font-semibold text-foreground">Build Conversations</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Reference previous dishes we discussed</li>
                <li>• Ask for similar recommendations</li>
                <li>• Build on your stated preferences</li>
                <li>• Compare different cuisines</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Archive className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-serif font-semibold text-foreground">Memory Features</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• I remember your food preferences</li>
                <li>• I recall cuisines you&apos;ve explored</li>
                <li>• I build on our conversation history</li>
                <li>• I suggest based on your interests</li>
              </ul>
            </div>
          </div>

          {/* Memory Examples */}
          <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Archive className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-serif font-bold text-foreground">Conversation Memory in Action</h3>
              </div>
              <p className="text-muted-foreground">See how Curate remembers and builds on your preferences</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                <h4 className="font-medium text-primary mb-3">🗣️ Example Conversation Flow</h4>
                <div className="space-y-3 text-sm">
                  <div className="bg-white/50 p-3 rounded-lg">
                    <strong className="text-foreground">You:</strong> &quot;I love spicy Korean food&quot;
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <strong className="text-primary">Curate:</strong> Tells you about kimchi and bulgogi
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <strong className="text-foreground">You:</strong> &quot;What about something similar but from Japan?&quot;
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <strong className="text-primary">Curate:</strong> Remembers your spice preference and suggests spicy miso ramen or Japanese curry
                  </div>
                </div>
              </div>

              <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/20">
                <h4 className="font-medium text-secondary mb-3">🧠 Memory Capabilities</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span><strong>Preference Tracking:</strong> Remembers spice levels, textures, and flavors you enjoy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span><strong>Cuisine Exploration:</strong> Tracks which cuisines you&apos;ve discussed and suggests related ones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span><strong>Context Building:</strong> References previous dishes when making new recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span><strong>Pattern Recognition:</strong> Notices your food patterns and suggests accordingly</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Advanced Memory Features */}
            <div className="mt-8 pt-6 border-t border-primary/20">
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <h5 className="font-medium text-foreground mb-2">Smart Context</h5>
                  <p className="text-muted-foreground">Understands conversation flow and builds meaningful connections</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-secondary" />
                  </div>
                  <h5 className="font-medium text-foreground mb-2">Personalized Insights</h5>
                  <p className="text-muted-foreground">Cultural information tailored to your expressed interests</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Archive className="w-6 h-6 text-accent" />
                  </div>
                  <h5 className="font-medium text-foreground mb-2">Continuous Learning</h5>
                  <p className="text-muted-foreground">Gets better at helping you with each conversation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}