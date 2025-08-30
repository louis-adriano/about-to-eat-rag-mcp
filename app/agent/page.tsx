import { AgentChatInterface } from '../../components/agent-chat-interface';
import { Bot, Sparkles, MessageCircle, Search } from 'lucide-react';

export default function AgentPage() {
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
            Chat with Curate, your personal culinary curator, to discover dishes, get cultural insights, and find your perfect meal through natural conversation.
          </p>

          {/* Features */}
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              <span>Smart Food Search</span>
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

      {/* Tips Section */}
      <section className="py-16 bg-primary/5 border-t border-primary/20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">How to Chat with Curate</h2>
            <p className="text-muted-foreground">Get the most out of your conversation with these tips</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
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
                  <Sparkles className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-serif font-semibold text-foreground">Get Deep Insights</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Ask for cultural background</li>
                <li>• Request cooking tips and methods</li>
                <li>• Learn about ingredient origins</li>
                <li>• Discover regional variations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}