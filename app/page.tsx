// app/page.tsx
import { UnifiedFoodSearch } from '../components/unified-food-search';
import { Search, Globe, Utensils, Sparkles, ChefHat, Heart, Brain } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 rounded-2xl shadow-lg">
                  <Utensils className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Brain className="w-6 h-6 text-purple-400 fill-current" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                  About To Eat
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Heart className="w-4 h-4 text-red-400 fill-current" />
                  <span className="text-sm text-gray-500 font-medium">AI-Powered Food Discovery</span>
                  <Heart className="w-4 h-4 text-red-400 fill-current" />
                </div>
              </div>
            </div>
            
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Discover amazing dishes from around the world with our intelligent AI system. 
              Just describe what you&apos;re craving and get personalized recommendations with cultural insights!
            </p>
            
            {/* Enhanced stats */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-8">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>75+ Global Dishes</span>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                <span>15+ Cuisines</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span>AI-Enhanced</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Smart Search</span>
              </div>
            </div>
          </div>

          {/* Unified Search Section */}
          <div className="mb-16">
            <UnifiedFoodSearch />
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="relative py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Our AI Discovery Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Advanced AI technology combined with semantic search to understand your cravings and find perfect matches
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI analyzes your craving, understands context, and provides cultural insights while optimizing your search terms for better results.
              </p>
            </div>
            
            <div className="group text-center p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced semantic search finds dishes based on flavors, textures, ingredients, and cooking methods you describe.
              </p>
            </div>
            
            <div className="group text-center p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cultural Discovery</h3>
              <p className="text-gray-600 leading-relaxed">
                Explore authentic dishes with rich cultural context, regional origins, and detailed preparation insights from around the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New AI Features Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the next generation of food discovery with AI that truly understands your cravings
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Real-time Analysis</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Watch as our AI analyzes your craving in real-time, providing insights about flavors, 
                textures, and cultural backgrounds while finding the perfect food matches.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Query Translation</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Our AI translates your natural language descriptions into optimized search terms, 
                ensuring you find exactly what you&apos;re looking for even with vague descriptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600 font-medium">About To Eat</span>
          </div>
          <p className="text-gray-500">
            &copy; 2025 About To Eat. Developed by{' '}
            <a 
              href="https://linkedin.com/in/louisadriano" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Louis Adriano
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}