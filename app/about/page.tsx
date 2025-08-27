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
      icon: <Search className="w-6 h-6" />,
      title: "Semantic Search",
      description: "Advanced AI-powered search that understands context, flavors, and cooking methods. Describe what you're craving in natural language."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Cuisine Database",
      description: "75+ authentic dishes from Asia, Europe, Americas, Africa, and Pacific regions with detailed cultural context."
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Enhancement",
      description: "Groq-powered query enhancement that improves search terms and provides intelligent recommendations."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Real-time Streaming",
      description: "Live AI-generated cultural insights and recommendations streamed directly to your browser."
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Vector Similarity",
      description: "Upstash Vector database with advanced embeddings for precise semantic matching and relevance scoring."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Blazing Fast",
      description: "Optimized with Next.js 14 App Router, TypeScript, and edge computing for instant search results."
    }
  ];

  const techStack = [
    {
      category: "Frontend",
      icon: <Monitor className="w-5 h-5" />,
      technologies: [
        { name: "Next.js 14", description: "App Router, Server Components" },
        { name: "TypeScript", description: "Type-safe development" },
        { name: "Tailwind CSS", description: "Utility-first styling" },
        { name: "Lucide React", description: "Beautiful icons" }
      ]
    },
    {
      category: "Backend & APIs",
      icon: <Server className="w-5 h-5" />,
      technologies: [
        { name: "Next.js API Routes", description: "Serverless endpoints" },
        { name: "Groq SDK", description: "Fast LLM inference" },
        { name: "Zod", description: "Runtime type validation" }
      ]
    },
    {
      category: "Database & AI",
      icon: <Cpu className="w-5 h-5" />,
      technologies: [
        { name: "Upstash Vector", description: "Semantic search database" },
        { name: "Custom Embeddings", description: "Advanced food semantics" },
        { name: "Llama 3.1", description: "AI enhancements via Groq" }
      ]
    },
    {
      category: "Infrastructure",
      icon: <Cloud className="w-5 h-5" />,
      technologies: [
        { name: "Vercel", description: "Edge deployment" },
        { name: "Streaming APIs", description: "Real-time responses" },
        { name: "Environment Config", description: "Secure API keys" }
      ]
    }
  ];

  const searchModes = [
    {
      title: "Vector Search",
      icon: <Zap className="w-5 h-5 text-blue-600" />,
      description: "Lightning-fast semantic search using advanced vector embeddings",
      features: [
        "1024-dimensional custom food embeddings",
        "Cultural context mapping",
        "Ingredient and cuisine understanding", 
        "Advanced similarity scoring"
      ],
      color: "blue"
    },
    {
      title: "AI Search", 
      icon: <Brain className="w-5 h-5 text-purple-600" />,
      description: "Enhanced search with AI query understanding and personalized recommendations",
      features: [
        "Natural language query enhancement",
        "Real-time search suggestions",
        "Streaming cultural insights",
        "Personalized food recommendations"
      ],
      color: "purple"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-orange-600/5"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl shadow-lg">
              <Utensils className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            (About){' '}
            <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
              To Eat
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            A next-generation food discovery platform that combines advanced AI with cultural knowledge to help you explore the world&apos;s cuisines. Because sometimes you need to learn (about) what you&apos;re about to eat!
          </p>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-white/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover what makes About To Eat the most intelligent food discovery platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Modes */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Search Modes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose between lightning-fast vector search or AI-enhanced discovery
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {searchModes.map((mode, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className={`p-6 bg-gradient-to-r ${mode.color === 'blue' ? 'from-blue-50 to-blue-100' : 'from-purple-50 to-purple-100'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 bg-white rounded-lg shadow-sm`}>
                      {mode.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{mode.title}</h3>
                  </div>
                  <p className="text-gray-700">{mode.description}</p>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-3">
                    {mode.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${mode.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'} mt-2 flex-shrink-0`}></div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Technology Stack</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge technologies for performance, scalability, and user experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-gray-900">{category.category}</h3>
                </div>
                
                <div className="space-y-3">
                  {category.technologies.map((tech, tIndex) => (
                    <div key={tIndex} className="border-l-2 border-blue-200 pl-3">
                      <h4 className="font-medium text-gray-900 text-sm">{tech.name}</h4>
                      <p className="text-xs text-gray-600">{tech.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Under the hood: the sophisticated technology powering your food discovery journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Code className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Query Processing</h3>
              <p className="text-gray-600 leading-relaxed">
                Your search is analyzed for cuisine types, cooking methods, ingredients, and cultural context using advanced NLP techniques.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Vector Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                Custom 1024-dimensional embeddings capture food semantics, cultural relationships, and flavor profiles for precise matching.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. AI Enhancement</h3>
              <p className="text-gray-600 leading-relaxed">
                Results are enriched with cultural insights, cooking tips, and personalized recommendations using state-of-the-art LLMs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Info */}
      <section className="py-16 bg-gradient-to-r from-blue-600/5 to-orange-600/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <ChefHat className="w-8 h-8 text-orange-600" />
              <Heart className="w-6 h-6 text-red-500 fill-current" />
              <Code className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Built with Passion</h2>
            <p className="text-gray-600 leading-relaxed mb-6 max-w-2xl mx-auto">
              About To Eat combines my love for technology, food, and cultural exploration. 
              This project showcases modern web development practices, AI integration, and thoughtful UX design.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://linkedin.com/in/louisadriano"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Monitor className="w-4 h-4" />
                Connect on LinkedIn
              </a>
              <a
                href="https://github.com/louis-adriano/about-to-eat-rag-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
              >
                <Code className="w-4 h-4" />
                View Source Code
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Technical Architecture</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A deep dive into the sophisticated systems powering About To Eat
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Vector Database Design
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p><strong>Custom Embeddings:</strong> 1024-dimensional vectors capturing food semantics, cultural context, and ingredient relationships</p>
                  <p><strong>Semantic Mapping:</strong> Advanced keyword categorization with cultural context and cooking method understanding</p>
                  <p><strong>Hybrid Scoring:</strong> Combination of vector similarity (30%) and text similarity (70%) for optimal relevance</p>
                  <p><strong>Diversity Filtering:</strong> Ensures varied results across regions and cuisine types</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Integration
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p><strong>Query Enhancement:</strong> Llama 3.1-70B analyzes and improves search queries for better results</p>
                  <p><strong>Streaming Responses:</strong> Real-time AI-generated cultural insights and recommendations</p>
                  <p><strong>Smart Suggestions:</strong> Context-aware autocomplete using Llama 3.1-8B for speed</p>
                  <p><strong>Cultural Context:</strong> AI-powered historical and cultural information about each dish</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Performance & Security
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Optimized Performance</h4>
                  <p>Edge computing, streaming responses, optimized embeddings, and efficient caching strategies</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Type Safety</h4>
                  <p>Full TypeScript coverage, Zod validation, and runtime type checking for reliability</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Scalable Architecture</h4>
                  <p>Serverless functions, vector database, and stateless design for horizontal scaling</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </main>
  );
}