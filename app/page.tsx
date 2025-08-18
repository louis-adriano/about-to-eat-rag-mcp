import { FoodSearch } from '../components/food-search';
import { Search, Globe, Utensils } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">About To Eat</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover delicious foods from around the world using AI-powered semantic search. 
              Describe what you&apos;re craving and we&apos;ll find the perfect match!
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-12">
        <FoodSearch />
      </div>

      {/* Features Section */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Search</h3>
            <p className="text-gray-600 text-sm">
              Describe flavors, ingredients, or cooking methods and we&apos;ll find matching dishes using AI.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Cuisine</h3>
            <p className="text-gray-600 text-sm">
              Explore dishes from Asia, Europe, Americas, Africa, and the Pacific islands.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Info</h3>
            <p className="text-gray-600 text-sm">
              Get information about ingredients, cooking methods, and regional origins.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 About To Eat. Powered by AI and a love for global cuisine.</p>
          <p className="text-sm mt-2">
            Built with Next.js, TypeScript, and Upstash Vector Database
          </p>
        </div>
      </footer>
    </main>
  );
}