import { UnifiedFoodSearch } from '../components/unified-food-search';
import { Search, Globe, Utensils, Sparkles, ChefHat, Heart, Brain, Star } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - White */}
      <section className="relative overflow-hidden py-20 bg-white">
        {/* Elegant background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl float-animation"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl float-animation"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          {/* Elegant Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative">
                <div className="p-6 bg-primary rounded-3xl shadow-xl">
                  <ChefHat className="w-16 h-16 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 text-2xl">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-serif font-bold text-foreground mb-4 text-balance">
              About
              <span className="text-primary"> To Eat</span>
            </h1>

            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-lg text-muted-foreground font-medium">
              Find your next favorite dish. Easily.
              </span>
            </div>

            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12 text-pretty">
              Discover hidden culinary treasures with our intelligent food discovery platform. Simply describe your
              cravings and let us guide you to authentic flavors and time-honored traditions from around the world.
            </p>

            {/* Elegant stats */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground mb-12">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span>75+ Global Dishes</span>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-primary" />
                <span>15+ Cuisines</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Authentic Recipes</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span>AI-Powered</span>
              </div>
            </div>
          </div>

          {/* Unified Search Section */}
          <div className="mb-20">
            <UnifiedFoodSearch />
          </div>
        </div>
      </section>

      {/* Features Section - Turquoise */}
      <section className="py-20 bg-primary/8 border-t border-primary/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Culinary Excellence</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Our artificial intelligence understands the subtleties of world cuisine to offer you an 
              authentic gastronomic experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-3xl bg-white/90 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Utensils className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-4">Authentic Tradition</h3>
              <p className="text-muted-foreground leading-relaxed">
                Discover recipes passed down through generations, preserving authenticity and the secrets 
                of culinary heritage from around the world.
              </p>
            </div>

            <div className="group text-center p-8 rounded-3xl bg-white/90 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-4">Intuitive Search</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI understands your most subtle cravings and guides you to dishes that perfectly match your 
                desires and dietary preferences.
              </p>
            </div>

            <div className="group text-center p-8 rounded-3xl bg-white/90 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-4">Culinary Journey</h3>
              <p className="text-muted-foreground leading-relaxed">
                Explore gastronomic treasures from every corner of the world, from Mediterranean delights to Asian
                specialties and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section - White */}
      <section className="py-20 bg-white border-t border-primary/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of food discovery with AI that truly understands your cravings
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="group p-8 rounded-3xl bg-card/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-serif font-semibold text-foreground">Real-time Analysis</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Watch as our AI analyzes your craving in real-time, providing insights about flavors, 
                textures, and cultural backgrounds while finding the perfect food matches.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-card/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-serif font-semibold text-foreground">Smart Translation</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Our AI translates your natural language descriptions into optimized search terms, 
                ensuring you find exactly what you&apos;re looking for even with vague descriptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Turquoise */}
      <footer className="bg-primary/10 border-t border-primary/30">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-primary rounded-2xl shadow-lg">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-semibold text-foreground">About To Eat</h3>
                <p className="text-sm text-muted-foreground">Discover Culinary Excellence</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              &copy; 2025 About To Eat. Created with passion by{" "}
              <a
                href="https://linkedin.com/in/louisadriano"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
              >
                Louis Adriano
              </a>
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}