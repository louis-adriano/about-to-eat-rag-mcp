import { 
  Search, 
  Globe, 
  Utensils, 
  Sparkles, 
  ChefHat, 
  Heart,
  Database,
  Zap,
  Brain,
  Code,
  Palette,
  Server,
  Shield,
  Cpu,
  Monitor,
  Cloud
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: <Search className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Semantic Search",
      description: "Advanced AI-powered search that understands context, flavors, and cooking methods. Describe what you're craving in natural language."
    },
    {
      icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Global Cuisine Database",
      description: "75+ authentic dishes from Asia, Europe, Americas, Africa, and Pacific regions with detailed cultural context."
    },
    {
      icon: <Brain className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "AI Enhancement",
      description: "Groq-powered query enhancement that improves search terms and provides intelligent recommendations."
    },
    {
      icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Real-time Streaming",
      description: "Live AI-generated cultural insights and recommendations streamed directly to your browser."
    },
    {
      icon: <Database className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Vector Similarity",
      description: "Upstash Vector database with advanced embeddings for precise semantic matching and relevance scoring."
    },
    {
      icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Blazing Fast",
      description: "Optimized with Next.js 14 App Router, TypeScript, and edge computing for instant search results."
    }
  ];

  const techStack = [
    {
      category: "Frontend",
      icon: <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />,
      technologies: [
        { name: "Next.js 14", description: "App Router, Server Components" },
        { name: "TypeScript", description: "Type-safe development" },
        { name: "Tailwind CSS", description: "Utility-first styling" },
        { name: "Lucide React", description: "Beautiful icons" }
      ]
    },
    {
      category: "Backend & APIs",
      icon: <Server className="w-4 h-4 sm:w-5 sm:h-5" />,
      technologies: [
        { name: "Next.js API Routes", description: "Serverless endpoints" },
        { name: "Groq SDK", description: "Fast LLM inference" },
        { name: "Zod", description: "Runtime type validation" }
      ]
    },
    {
      category: "Database & AI",
      icon: <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />,
      technologies: [
        { name: "Upstash Vector", description: "Semantic search database" },
        { name: "Custom Embeddings", description: "Advanced food semantics" },
        { name: "Llama 3.1", description: "AI enhancements via Groq" }
      ]
    },
    {
      category: "Infrastructure",
      icon: <Cloud className="w-4 h-4 sm:w-5 sm:h-5" />,
      technologies: [
        { name: "Vercel", description: "Edge deployment" },
        { name: "Streaming APIs", description: "Real-time responses" },
        { name: "Environment Config", description: "Secure API keys" }
      ]
    }
  ];

  const searchModes = [
    {
      title: "Unified AI Search",
      icon: <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
      description: "Intelligent search that combines AI query translation with advanced vector matching",
      features: [
        "AI-powered query analysis and enhancement",
        "Real-time natural language understanding",
        "Optimized translation for vector database",
        "Streaming results with cultural insights"
      ],
      color: "primary"
    },
    {
      title: "Vector Processing", 
      icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
      description: "Advanced semantic matching using 1024-dimensional food embeddings",
      features: [
        "Custom food semantics encoding",
        "Cultural context mapping",
        "Hybrid similarity scoring (30% vector + 70% text)",
        "Diversity filtering across cuisines"
      ],
      color: "primary"
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Mobile Optimized */}
      <section className="relative py-12 sm:py-16 md:py-20">
        <div className="absolute inset-0">
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-2xl sm:blur-3xl float-animation"></div>
          <div
            className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-2xl sm:blur-3xl float-animation"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-primary rounded-xl sm:rounded-2xl shadow-lg">
              <Utensils className="w-8 h-8 sm:w-12 sm:h-12 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 sm:mb-6">
            (About){' '}
            <span className="text-primary">
              To Eat
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto px-2">
            A next-generation food discovery platform that combines advanced AI with cultural knowledge to help you explore the world&apos;s cuisines. Because sometimes you need to learn (about) what you&apos;re about to eat!
          </p>
        </div>
      </section>

      {/* Key Features - Mobile Grid */}
      <section className="py-12 sm:py-16 bg-primary/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3 sm:mb-4">Key Features</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Discover what makes About To Eat the most intelligent food discovery platform
            </p>
          </div>

          {/* Mobile-First Grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl shadow-lg border hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg font-serif font-semibold text-foreground mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unified Search Process - Mobile Layout */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3 sm:mb-4">Unified Search Process</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Our intelligent search pipeline seamlessly combines AI understanding with advanced vector similarity matching
            </p>
          </div>

          {/* Stack on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {searchModes.map((mode, index) => (
              <div key={index} className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border overflow-hidden">
                <div className="p-4 sm:p-6 bg-primary/10">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                      {mode.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground">{mode.title}</h3>
                  </div>
                  <p className="text-sm sm:text-base text-foreground/80">{mode.description}</p>
                </div>
                
                <div className="p-4 sm:p-6">
                  <ul className="space-y-2 sm:space-y-3">
                    {mode.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 sm:mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground text-xs sm:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Mobile Process Flow */}
      <section className="py-12 sm:py-16 bg-primary/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3 sm:mb-4">How Unified Search Works</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
              Our sophisticated pipeline combines AI understanding, vector mathematics, and cultural knowledge for perfect food discovery
            </p>
          </div>

          {/* Mobile-Optimized Process Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-6">
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-sm sm:text-lg font-serif font-semibold text-foreground mb-2 sm:mb-4">1. AI Analysis</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Llama 3.1 analyzes your query to understand cuisine preferences, cooking methods, and cultural context.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-6">
                <Code className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-sm sm:text-lg font-serif font-semibold text-foreground mb-2 sm:mb-4">2. Query Translation</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your natural language is translated into optimized search terms that work best with our vector database.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-6">
                <Database className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-sm sm:text-lg font-serif font-semibold text-foreground mb-2 sm:mb-4">3. Vector Matching</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                1024-dimensional embeddings find semantic matches based on flavor profiles, cooking methods, and cultural relationships.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-6">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-sm sm:text-lg font-serif font-semibold text-foreground mb-2 sm:mb-4">4. AI Enhancement</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Results are enriched with streaming cultural insights, cooking tips, and personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack - Mobile Grid */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3 sm:mb-4">Technology Stack & Architecture</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
              Built with cutting-edge technologies for performance, scalability, and intelligent food discovery
            </p>
          </div>

          {/* Tech Stack - Mobile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {techStack.map((category, index) => (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-primary/20 rounded-lg">
                    {category.icon}
                  </div>
                  <h3 className="font-serif font-bold text-foreground text-sm sm:text-base">{category.category}</h3>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  {category.technologies.map((tech, tIndex) => (
                    <div key={tIndex} className="border-l-2 border-primary/30 pl-2 sm:pl-3">
                      <h4 className="font-medium text-foreground text-xs sm:text-sm">{tech.name}</h4>
                      <p className="text-xs text-muted-foreground">{tech.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Technical Architecture - Mobile Layout */}
          <div className="bg-primary/5 rounded-2xl sm:rounded-3xl shadow-lg border p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Vector Database Design
                </h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Custom Embeddings:</strong> 1024-dimensional vectors capturing food semantics, cultural context, and ingredient relationships</p>
                  <p><strong className="text-foreground">Semantic Mapping:</strong> Advanced keyword categorization with cultural context and cooking method understanding</p>
                  <p><strong className="text-foreground">Hybrid Scoring:</strong> Combination of vector similarity (30%) and text similarity (70%) for optimal relevance</p>
                  <p><strong className="text-foreground">Diversity Filtering:</strong> Ensures varied results across regions and cuisine types</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  AI Integration
                </h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Query Enhancement:</strong> Llama 3.1-70B analyzes and improves search queries for better results</p>
                  <p><strong className="text-foreground">Streaming Responses:</strong> Real-time AI-generated cultural insights and recommendations</p>
                  <p><strong className="text-foreground">Smart Suggestions:</strong> Context-aware autocomplete using Llama 3.1-8B for speed</p>
                  <p><strong className="text-foreground">Cultural Context:</strong> AI-powered historical and cultural information about each dish</p>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-8 border-t border-primary/20">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Performance & Security
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-1 sm:mb-2">Optimized Performance</h4>
                  <p>Edge computing, streaming responses, optimized embeddings, and efficient caching strategies</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1 sm:mb-2">Type Safety</h4>
                  <p>Full TypeScript coverage, Zod validation, and runtime type checking for reliability</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1 sm:mb-2">Scalable Architecture</h4>
                  <p>Serverless functions, vector database, and stateless design for horizontal scaling</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Info - Mobile Layout */}
      <section className="py-12 sm:py-16 bg-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-current" />
              <Code className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-3 sm:mb-4">Built with Passion</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6 max-w-2xl mx-auto">
              About To Eat combines my love for technology, food, and cultural exploration. 
              This project showcases modern web development practices, AI integration, and thoughtful UX design.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <a
                href="https://linkedin.com/in/louisadriano"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-xl sm:rounded-2xl hover:bg-primary/90 transition-colors font-medium text-sm sm:text-base"
              >
                <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
                Connect on LinkedIn
              </a>
              <a
                href="https://github.com/louis-adriano/about-to-eat-rag-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-foreground text-background rounded-xl sm:rounded-2xl hover:bg-foreground/90 transition-colors font-medium text-sm sm:text-base"
              >
                <Code className="w-3 h-3 sm:w-4 sm:h-4" />
                View Source Code
              </a>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}