# 🍽️ About To Eat - AI-Powered Food Discovery Platform

A sophisticated Next.js application that revolutionizes food discovery through AI-powered semantic search, conversational AI, and advanced vector database technology. Discover authentic dishes from around the world by simply describing your cravings.

![About To Eat Preview](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)
![Upstash](https://img.shields.io/badge/Upstash-Vector-00e6cc?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-AI-ff6b6b?style=for-the-badge)

## ✨ Features

### 🔍 **Intelligent Search System**
- **Semantic Search**: Advanced vector similarity matching with 1024-dimensional food embeddings
- **AI Query Translation**: Natural language queries optimized for database search
- **Hybrid Scoring**: Combines vector similarity (30%) with text matching (70%) for optimal relevance
- **Cultural Context Awareness**: Understands cuisine relationships and cultural food connections
- **Strict Filtering**: Respects user requirements (spice levels, dietary restrictions, cuisine preferences)

### 🤖 **Conversational AI Agent - "Curate"**
- **Memory-Powered Conversations**: Remembers preferences, cuisines discussed, and conversation history
- **Contextual Recommendations**: Builds on previous discussions for personalized suggestions
- **Cultural Insights**: Provides historical context, cooking methods, and cultural significance
- **Real-time Streaming**: Live AI responses with visual typing indicators
- **Natural Language Understanding**: Interprets complex food cravings and preferences

### 🌍 **Global Food Database**
- **240+ Authentic Dishes** from 25+ regions and countries
- **Detailed Food Profiles**: Comprehensive descriptions including spice levels, textures, and cooking methods
- **Cultural Categorization**: Organized by region, cuisine type, and cooking techniques
- **Enhanced Metadata**: Semantic keywords, ingredients, and cultural context for each dish

### 🎨 **Modern User Experience**
- **Responsive Design**: Beautiful UI that works seamlessly across all devices
- **Real-time Search**: Instant results with streaming AI analysis
- **Interactive Food Cards**: Expandable cards with AI-generated cultural context
- **Elegant French-inspired Design**: Sophisticated color scheme and typography
- **Dark/Light Mode Support**: Adaptive theming with CSS custom properties

### 🛠 **Admin Dashboard**
- **Database Management**: Full CRUD operations for food items
- **Vector Synchronization**: Real-time sync between PostgreSQL and vector database
- **Model Health Monitoring**: AI model status tracking and automatic failover
- **User Role Management**: Granular permissions (super_admin, admin, viewer)
- **Legacy Data Migration**: Import tools for existing food databases

## 🏗️ Architecture & Technology Stack

### **Frontend**
- **Next.js 15** - App Router with Server Components
- **TypeScript 5** - Full type safety and intellisense
- **Tailwind CSS 3** - Utility-first styling with custom design system
- **Lucide React** - Beautiful, consistent iconography
- **React 19** - Latest React features with concurrent rendering

### **Backend & APIs**
- **Next.js API Routes** - Serverless backend endpoints
- **Groq SDK** - Ultra-fast AI inference with Llama models
- **Streaming APIs** - Real-time data streaming for chat and search
- **Zod** - Runtime type validation and schema parsing

### **Database & AI**
- **Upstash Vector** - Serverless vector database for semantic search
- **Neon PostgreSQL** - Serverless SQL database for structured data
- **Drizzle ORM** - Type-safe database operations
- **Custom Embeddings** - 1024-dimensional vectors with cultural context
- **Llama 3.3 70B** - Advanced conversational AI via Groq
- **Llama 3.1 8B** - Fast query analysis and translation

### **Authentication & Security**
- **Clerk** - Complete authentication and user management
- **Middleware Protection** - Route-level security for admin features
- **Environment-based Config** - Secure API key management
- **Input Validation** - Comprehensive request validation with Zod

### **Infrastructure**
- **Vercel** - Edge deployment with global CDN
- **GitHub Actions** - Automated model health monitoring
- **TypeScript Config** - Optimized build and development settings

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Upstash Vector Database account
- Groq API key
- Neon PostgreSQL database
- Clerk authentication setup (optional)

### 1. Clone and Install
```bash
git clone https://github.com/louis-adriano/about-to-eat-rag-mcp.git
cd about-to-eat-rag-mcp
npm install
```

### 2. Environment Configuration
Create `.env.local` with the following variables:

```bash
# Upstash Vector Database (Required)
UPSTASH_VECTOR_REST_URL=https://your-vector-db-url.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token

# Groq AI API (Required)
GROQ_API_KEY=your_groq_api_key_here

# Neon PostgreSQL (Required for admin features)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Clerk Authentication (Optional - for admin dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
```

### 3. Database Setup
```bash
# Push database schema to Neon
npm run db:push

# Populate vector database with food data
curl http://localhost:3000/api/populate
```

### 4. Development
```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### 5. Admin Setup (Optional)
To access the admin dashboard, add yourself as an admin user in your Neon database:

```sql
INSERT INTO admin_users (clerk_user_id, email, role, is_active) 
VALUES ('your_clerk_user_id', 'your_email@example.com', 'super_admin', true);
```

## 🔧 Key API Endpoints

### Search & AI
- `POST /api/unified-search` - Intelligent food search with AI analysis
- `POST /api/agent-chat` - Conversational AI with memory
- `POST /api/groq/context-stream` - Streaming cultural context

### Database Management
- `GET /api/populate` - Initialize vector database
- `GET /api/health/models` - AI model health monitoring

### Admin Operations
- Food item CRUD operations
- Vector database synchronization
- User management and permissions

## 🎯 Usage Examples

### Search Examples
```typescript
// Natural language search
"Korean fermented vegetables" // → Finds kimchi and related dishes
"Spicy Thai noodles with coconut" // → Discovers authentic Thai curries
"Comfort food for winter" // → Suggests hearty, warming dishes
"Japanese raw fish" // → Returns sushi and sashimi options
```

### Conversational AI Examples
```typescript
// Memory-powered conversations
User: "I love spicy Korean food"
Curate: *Discusses kimchi, bulgogi, explains Korean spice culture*

User: "What about something similar but from Japan?"
Curate: *References previous Korean interest, suggests spicy miso ramen*
```

## 🏃‍♂️ Model Health Monitoring

The application includes automated AI model health monitoring:

```bash
# Check model availability
npm run check-models

# Validate codebase for deprecated models
npm run validate-models

# Run comprehensive health check
npm run test-models
```

## 📊 Performance Features

- **Vector Search Optimization**: Custom embeddings with cultural semantic mapping
- **Hybrid Scoring**: Balanced relevance scoring for optimal results
- **Diversity Filtering**: Ensures varied results across cuisines and regions
- **Streaming Responses**: Real-time AI content delivery
- **Edge Deployment**: Global CDN for minimal latency
- **Efficient Caching**: Optimized database queries and API responses

## 🔍 Search Algorithm Deep Dive

### Semantic Understanding
The search system uses sophisticated semantic mapping to understand food contexts:

```typescript
// Cultural context awareness
"Korean fermented vegetables" → Enhanced with kimchi-specific keywords
"Chinese soup dumplings" → Mapped to xiaolongbao and regional variations
"Thai spicy salad" → Connected to som tam and preparation methods
```

### Vector Embedding Process
1. **Text Processing**: Advanced tokenization with cultural context
2. **Semantic Mapping**: 1024-dimensional vectors with food-specific features
3. **Cultural Enhancement**: Cuisine-specific keyword boosting
4. **Hybrid Scoring**: Combines vector similarity with text matching

## 🛡️ Security & Privacy

- **Input Validation**: All user inputs validated with Zod schemas
- **Authentication**: Secure user management with Clerk
- **Environment Variables**: Sensitive data protection
- **Admin Controls**: Role-based access control for admin features
- **API Rate Limiting**: Protection against abuse

## 📈 Monitoring & Analytics

- **Model Health**: Automated monitoring of AI model availability
- **Performance Tracking**: Search relevance and response times
- **Error Handling**: Comprehensive error logging and recovery
- **GitHub Actions**: Automated health checks and notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain comprehensive type safety
- Add tests for new features
- Update documentation for API changes
- Test across different screen sizes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Upstash** - Serverless vector database infrastructure
- **Groq** - Ultra-fast AI inference platform
- **Neon** - Serverless PostgreSQL database
- **Vercel** - Deployment and hosting platform
- **Clerk** - Authentication and user management
- **The Open Source Community** - For amazing tools and libraries

## 🔗 Links

- **Live Demo**: [about-to-eat.vercel.app](https://about-to-eat.vercel.app)
- **Developer**: [Louis Adriano](https://linkedin.com/in/louisadriano)
- **GitHub**: [louis-adriano/about-to-eat-rag-mcp](https://github.com/louis-adriano/about-to-eat-rag-mcp)
- **Documentation**: [Anthropic Docs](https://docs.anthropic.com)

---

**Built with ❤️ by Louis Adriano** - Combining cutting-edge technology with culinary passion to help you discover your next favorite dish.
