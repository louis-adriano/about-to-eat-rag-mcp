import { UnifiedFoodSearch } from '../components/unified-food-search';
import { Search, Globe, Utensils, Sparkles, ChefHat, Heart, Brain, Star } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Mobile Optimized */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 bg-white">
        {/* Elegant background decoration - Responsive sizes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-32 sm:w-48 md:w-72 h-32 sm:h-48 md:h-72 bg-primary/10 rounded-full blur-2xl sm:blur-3xl float-animation"></div>
          <div
            className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-40 sm:w-64 md:w-96 h-40 sm:h-64 md:h-96 bg-secondary/10 rounded-full blur-2xl sm:blur-3xl float-animation"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* Elegant Header - Mobile Responsive */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground mb-3 sm:mb-4 text-balance leading-tight">
              About
              <span className="text-primary"> To Eat</span>
            </h1>

            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <span className="text-base sm:text-lg text-muted-foreground font-medium">
                Find your next favorite dish. Easily.
              </span>
            </div>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8 sm:mb-10 md:mb-12 text-pretty px-2">
              Discover hidden culinary treasures with our intelligent food discovery platform. Simply describe your
              cravings and let us guide you to authentic flavors and time-honored traditions from around the world.
            </p>

            {/* Elegant stats - Mobile Responsive Grid */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground mb-8 sm:mb-10 md:mb-12">
              <div className="flex items-center gap-1 sm:gap-2 justify-center sm:justify-start">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="text-center sm:text-left">75+ Global Dishes</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 justify-center sm:justify-start">
                <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="text-center sm:text-left">15+ Cuisines</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 justify-center sm:justify-start">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="text-center sm:text-left">Authentic Recipes</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 justify-center sm:justify-start">
                <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="text-center sm:text-left">AI-Powered</span>
              </div>
            </div>
          </div>

          {/* Unified Search Section - Mobile Optimized */}
          <div className="mb-12 sm:mb-16 md:mb-20">
            <UnifiedFoodSearch />
          </div>
        </div>
      </section>

      {/* Features Section - Mobile Grid Layout */}
      <section className="py-12 sm:py-16 md:py-20 bg-primary/8 border-t border-primary/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 sm:mb-4">
              Why Choose About To Eat?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty px-2">
              We&apos;ve reimagined food discovery by combining cultural knowledge with intelligent search, 
              making it easier than ever to find your perfect dish
            </p>
          </div>

          {/* Mobile-First Grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="group text-center p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Utensils className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-3 sm:mb-4">Authentic Tradition</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Discover recipes passed down through generations, preserving authenticity and the secrets 
                of culinary heritage from around the world.
              </p>
            </div>

            <div className="group text-center p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-3 sm:mb-4">Intuitive Search</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Our AI understands your most subtle cravings and guides you to dishes that perfectly match your 
                desires and dietary preferences.
              </p>
            </div>

            <div className="group text-center p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-3 sm:mb-4">Culinary Journey</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Explore gastronomic treasures from every corner of the world, from Mediterranean delights to Asian
                specialties and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section - Recipe Builder Mode */}
      <section className="py-12 sm:py-16 md:py-20 bg-white border-t border-primary/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              Coming Soon
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3">Recipe Builder Mode</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Turn discovered dishes into step-by-step recipes with AI assistance
            </p>
          </div>

          {/* Mini Interface Preview */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl border overflow-hidden">
              {/* Mock Header */}
              <div className="flex items-center justify-between p-4 border-b bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <ChefHat className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-serif font-semibold text-foreground">Butternut Squash Soup</h3>
                </div>
                <div className="text-xs text-muted-foreground bg-white px-2 py-1 rounded-full">
                  AI Generated
                </div>
              </div>

              {/* Mock Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Ingredients Section */}
                <div className="space-y-4">
                  <h4 className="font-serif font-semibold text-foreground flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-primary" />
                    Ingredients
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-xl text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">1 large butternut squash</span>
                      <button className="ml-auto text-xs text-primary hover:text-primary/80">substitute</button>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-xl text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">1 yellow onion, diced</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-xl text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">1 cup coconut milk</span>
                      <button className="ml-auto text-xs text-primary hover:text-primary/80">substitute</button>
                    </div>
                    <div className="text-center py-2">
                      <div className="text-xs text-muted-foreground">+ 5 more ingredients</div>
                    </div>
                  </div>
                </div>

                {/* Steps Section */}
                <div className="space-y-4">
                  <h4 className="font-serif font-semibold text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    Cooking Steps
                  </h4>
                  <div className="space-y-3">
                    <div className="flex gap-3 p-3 bg-primary/5 rounded-xl">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Roast squash at 400°F until tender</p>
                        <p className="text-xs text-muted-foreground mt-1">⏱️ 45 mins</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-muted/20 rounded-xl opacity-70">
                      <div className="w-6 h-6 bg-muted-foreground text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Sauté onions until golden...</p>
                        <p className="text-xs text-muted-foreground mt-1">⏱️ 8 mins</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-muted/20 rounded-xl opacity-50">
                      <div className="w-6 h-6 bg-muted-foreground text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Blend with broth until smooth...</p>
                      </div>
                    </div>
                    <div className="text-center py-2">
                      <div className="text-xs text-muted-foreground">+ 3 more steps</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Footer */}
              <div className="p-4 bg-muted/20 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Estimated time: 1 hour 15 mins</span>
                  <span>Difficulty: Easy</span>
                  <span>Serves: 6</span>
                </div>
              </div>
            </div>

            {/* Subtle Call to Action */}
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                Recipe Builder Mode will transform any discovered dish into personalized, step-by-step cooking instructions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Mobile Optimized */}
      <footer className="bg-primary/10 border-t border-primary/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-primary rounded-2xl shadow-lg">
                <ChefHat className="w-5 sm:w-6 h-5 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-semibold text-foreground">About To Eat</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Discover Culinary Excellence</p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-2">
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
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
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