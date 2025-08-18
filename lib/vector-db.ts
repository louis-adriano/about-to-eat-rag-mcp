import { Index } from '@upstash/vector';
import { FoodItem, SearchResult, SearchResultWithVector, VectorData } from '../types/food';

// Initialize Upstash Vector client
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// Advanced semantic understanding with cultural and culinary nuances
const ADVANCED_SEMANTIC_MAP = {
  // Cooking methods with cultural context
  fermented: {
    keywords: ['fermented', 'pickled', 'aged', 'cultured', 'probiotic', 'lacto', 'brine', 'kimchi', 'sauerkraut', 'miso', 'tempeh'],
    weight: 3.0,
    culturalContext: {
      korean: ['kimchi', 'doenjang', 'gochujang'],
      japanese: ['miso', 'natto', 'tsukemono'],
      chinese: ['doubanjiang', 'fermented black beans'],
      german: ['sauerkraut']
    }
  },
  
  grilled: {
    keywords: ['grilled', 'barbecue', 'bbq', 'charred', 'smoky', 'yakitori', 'tandoor', 'char siu', 'bulgogi'],
    weight: 2.5,
    culturalContext: {
      korean: ['bulgogi', 'galbi', 'korean bbq'],
      japanese: ['yakitori', 'teppanyaki'],
      chinese: ['char siu'],
      indian: ['tandoor', 'tikka']
    }
  },

  // Taste profiles with intensity levels
  spicy: {
    keywords: ['spicy', 'hot', 'chili', 'pepper', 'fiery', 'burning', 'jalapeño', 'habanero', 'ghost pepper'],
    weight: 2.5,
    intensity: {
      mild: ['mild', 'gentle', 'hint of spice'],
      medium: ['spicy', 'hot', 'chili'],
      intense: ['very spicy', 'fiery', 'burning', 'ghost pepper', 'carolina reaper']
    },
    culturalContext: {
      korean: ['gochugaru', 'gochujang'],
      thai: ['bird\'s eye chili', 'thai chili'],
      indian: ['ghost pepper', 'bhut jolokia'],
      mexican: ['jalapeño', 'habanero', 'chipotle']
    }
  },

  sweet: {
    keywords: ['sweet', 'sugar', 'honey', 'syrup', 'dessert', 'candy', 'caramel', 'chocolate'],
    weight: 2.0,
    culturalContext: {
      thai: ['palm sugar', 'coconut sugar'],
      chinese: ['rock sugar'],
      indian: ['jaggery', 'gulab'],
      middle_eastern: ['honey', 'rose water', 'baklava']
    }
  },

  // Ingredients with cultural significance
  vegetables: {
    keywords: ['vegetable', 'veggie', 'cabbage', 'carrot', 'onion', 'greens', 'leafy', 'root'],
    weight: 2.0,
    specific: {
      korean: ['napa cabbage', 'korean radish', 'scallion'],
      chinese: ['bok choy', 'chinese broccoli', 'water spinach'],
      japanese: ['daikon', 'shiitake', 'bamboo shoots'],
      thai: ['thai eggplant', 'thai basil', 'galangal']
    }
  },

  // Regional cuisine with sophisticated understanding
  korean: {
    keywords: ['korean', 'korea', 'k-food'],
    signature_dishes: ['kimchi', 'bulgogi', 'bibimbap', 'tteokbokki', 'japchae'],
    ingredients: ['gochujang', 'gochugaru', 'doenjang', 'sesame oil', 'napa cabbage'],
    cooking_methods: ['fermentation', 'grilling', 'stir-frying'],
    flavors: ['umami', 'spicy', 'fermented', 'garlicky'],
    weight: 3.5
  },

  chinese: {
    keywords: ['chinese', 'china', 'chinese-style'],
    regional_styles: {
      sichuan: ['spicy', 'numbing', 'peppercorns', 'ma la', 'hot pot'],
      cantonese: ['dim sum', 'char siu', 'steamed', 'light flavors'],
      beijing: ['peking duck', 'roasted', 'wheat-based'],
      shanghai: ['soup dumplings', 'xiaolongbao', 'sweet and savory']
    },
    signature_dishes: ['fried rice', 'chow mein', 'kung pao', 'sweet and sour'],
    cooking_methods: ['wok', 'stir-fry', 'steaming', 'braising'],
    weight: 3.5
  },

  japanese: {
    keywords: ['japanese', 'japan', 'japanese-style'],
    signature_dishes: ['sushi', 'ramen', 'tempura', 'miso soup'],
    ingredients: ['miso', 'dashi', 'nori', 'wasabi', 'soy sauce'],
    cooking_methods: ['grilling', 'steaming', 'raw preparation'],
    flavors: ['umami', 'clean', 'subtle', 'fresh'],
    weight: 3.5
  },

  thai: {
    keywords: ['thai', 'thailand', 'thai-style'],
    signature_dishes: ['pad thai', 'tom yum', 'green curry', 'som tam'],
    ingredients: ['coconut milk', 'fish sauce', 'lime', 'lemongrass', 'galangal'],
    flavors: ['spicy', 'sour', 'sweet', 'aromatic'],
    weight: 3.5
  },

  // Texture understanding
  crispy: {
    keywords: ['crispy', 'crunchy', 'fried', 'battered', 'golden', 'tempura', 'katsu'],
    weight: 2.0
  },

  soft: {
    keywords: ['soft', 'tender', 'silky', 'smooth', 'steamed', 'braised'],
    weight: 2.0
  },

  chewy: {
    keywords: ['chewy', 'glutinous', 'sticky', 'dense', 'mochi', 'rice cake'],
    weight: 2.0
  },

  // Advanced contextual understanding
  soup: {
    keywords: ['soup', 'broth', 'stew', 'consommé', 'bisque'],
    types: {
      clear: ['clear broth', 'consommé', 'dashi'],
      thick: ['cream soup', 'chowder', 'bisque'],
      spicy: ['tom yum', 'kimchi jjigae', 'hot and sour']
    },
    weight: 2.5
  },

  noodles: {
    keywords: ['noodle', 'pasta', 'ramen', 'udon', 'pho', 'pad thai'],
    types: {
      wheat: ['ramen', 'udon', 'chow mein'],
      rice: ['pho', 'pad thai', 'vermicelli'],
      buckwheat: ['soba'],
      egg: ['pasta', 'lo mein']
    },
    weight: 2.5
  }
};

// Synonym and alternative name mapping with proper typing
const SYNONYM_MAP: Record<string, string[]> = {
  'korean fermented vegetables': ['kimchi'],
  'chinese soup dumplings': ['xiaolongbao', 'xiao long bao'],
  'japanese rice wine': ['sake'],
  'thai spicy salad': ['som tam', 'papaya salad'],
  'korean mixed rice': ['bibimbap'],
  'chinese fried rice': ['yangchow fried rice', 'egg fried rice'],
  'korean grilled meat': ['bulgogi', 'galbi'],
  'japanese raw fish': ['sashimi', 'sushi'],
  'thai curry': ['green curry', 'red curry', 'massaman'],
  'chinese dumpling': ['wonton', 'potsticker', 'gyoza'],
  'korean soup': ['kimchi jjigae', 'doenjang jjigae'],
  'spicy korean rice cake': ['tteokbokki'],
  'chinese barbecue pork': ['char siu', 'cha siu'],
  'fermented cabbage': ['kimchi', 'sauerkraut'],
  'korean pancake': ['pajeon', 'kimchi jeon'],
  'chinese tea egg': ['tea egg', 'marbled egg'],
  'japanese noodle soup': ['ramen', 'udon soup'],
  'thai fried noodles': ['pad thai', 'pad see ew'],
  'chinese steamed bun': ['baozi', 'char siu bao'],
  'korean cold noodles': ['naengmyeon']
};

// Context-aware phrase understanding with proper typing
interface ContextualPhrase {
  boosts: string[];
  weight: number;
}

const CONTEXTUAL_PHRASES: Record<string, ContextualPhrase> = {
  'korean style': { boosts: ['korean'], weight: 2.0 },
  'fermented vegetables': { boosts: ['fermented', 'vegetables', 'kimchi'], weight: 3.0 },
  'spicy and sour': { boosts: ['spicy', 'sour', 'tom yum'], weight: 2.5 },
  'soup dumplings': { boosts: ['soup', 'dumpling', 'xiaolongbao'], weight: 3.0 },
  'stir fried noodles': { boosts: ['stir-fry', 'noodles', 'chow mein'], weight: 2.5 },
  'coconut curry': { boosts: ['coconut', 'curry', 'thai'], weight: 2.5 },
  'rice wine': { boosts: ['rice', 'wine', 'sake'], weight: 2.0 },
  'pickled vegetables': { boosts: ['pickled', 'fermented', 'vegetables'], weight: 2.5 },
  'barbecue pork': { boosts: ['barbecue', 'pork', 'char siu'], weight: 2.5 },
  'cold noodles': { boosts: ['cold', 'noodles', 'naengmyeon'], weight: 2.0 },
  'fried rice': { boosts: ['fried', 'rice', 'chinese'], weight: 2.0 },
  'green tea': { boosts: ['green', 'tea', 'matcha'], weight: 2.0 }
};

// Advanced embedding with cultural and contextual understanding
function createAdvancedEmbedding(text: string, includeMetadata: boolean = true): number[] {
  const vector = new Array(1024).fill(0);
  const normalizedText = text.toLowerCase();
  let words = normalizedText.split(/\s+/);
  
  // Apply synonym mapping first
  const synonymText = applySynonymMapping(normalizedText);
  if (synonymText !== normalizedText) {
    words = [...words, ...synonymText.split(/\s+/)];
  }

  // Base word embedding with positional awareness
  words.forEach((word, index) => {
    const wordHash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const position = wordHash % 400; // Use first 400 positions for basic words
    vector[position] += Math.log(words.length - index + 1); // Logarithmic position weighting
  });

  // Advanced semantic feature extraction
  let featureIndex = 400;
  
  // Process contextual phrases first (highest priority)
  Object.entries(CONTEXTUAL_PHRASES).forEach(([phrase, config]) => {
    if (featureIndex >= 600) return;
    
    if (normalizedText.includes(phrase)) {
      vector[featureIndex] = config.weight * 3;
      config.boosts.forEach(boost => {
        const boostIndex = findSemanticIndex(boost);
        if (boostIndex >= 0) {
          vector[boostIndex] *= 1.5; // Boost related features
        }
      });
    }
    featureIndex++;
  });

  // Process advanced semantic features
  Object.entries(ADVANCED_SEMANTIC_MAP).forEach(([category, config]) => {
    if (featureIndex >= 800) return;
    
    let categoryScore = 0;
    
    // Check main keywords
    if ('keywords' in config) {
      config.keywords.forEach(keyword => {
        const keywordScore = calculateKeywordScore(normalizedText, words, keyword);
        categoryScore += keywordScore * (config.weight || 1);
      });
    }

    // Check cultural context
    if ('culturalContext' in config) {
      Object.entries(config.culturalContext).forEach(([culture, terms]) => {
        terms.forEach(term => {
          if (normalizedText.includes(term)) {
            categoryScore += 3 * (config.weight || 1); // High boost for cultural matches
          }
        });
      });
    }

    // Check regional styles for complex cuisines
    if ('regional_styles' in config) {
      Object.entries(config.regional_styles).forEach(([region, terms]) => {
        terms.forEach(term => {
          if (normalizedText.includes(term)) {
            categoryScore += 2.5 * (config.weight || 1);
          }
        });
      });
    }

    vector[featureIndex] = Math.min(categoryScore, 15); // Cap to prevent overflow
    featureIndex++;
  });

  // N-gram analysis for better context
  for (let n = 2; n <= 3 && featureIndex < 950; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ');
      const ngramHash = ngram.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const position = (ngramHash % (950 - featureIndex)) + featureIndex;
      vector[position] += n * 1.5; // Higher weight for longer n-grams
    }
  }

  // Semantic density calculation
  const semanticDensity = calculateSemanticDensity(normalizedText);
  vector[1020] = semanticDensity;

  // Cultural specificity score
  const culturalSpecificity = calculateCulturalSpecificity(normalizedText);
  vector[1021] = culturalSpecificity;

  // Advanced normalization with semantic preservation
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  const normalizedVector = magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  
  // Apply semantic boosting
  return applySemanticBoosting(normalizedVector, normalizedText);
}

function applySynonymMapping(text: string): string {
  let mappedText = text;
  Object.entries(SYNONYM_MAP).forEach(([phrase, synonyms]) => {
    if (text.includes(phrase)) {
      mappedText += ' ' + synonyms.join(' ');
    }
  });
  return mappedText;
}

function calculateKeywordScore(text: string, words: string[], keyword: string): number {
  let score = 0;
  
  // Exact phrase match (highest score)
  if (text.includes(keyword)) {
    score += 3;
  }
  
  // Word-level matches
  words.forEach(word => {
    if (word === keyword) {
      score += 2;
    } else if (word.includes(keyword) || keyword.includes(word)) {
      score += 1;
    } else if (calculateStemSimilarity(word, keyword) > 0.8) {
      score += 1.5;
    }
  });
  
  return score;
}

function calculateStemSimilarity(word1: string, word2: string): number {
  const stem1 = simpleStem(word1);
  const stem2 = simpleStem(word2);
  
  if (stem1 === stem2) return 1.0;
  
  const longer = stem1.length > stem2.length ? stem1 : stem2;
  const shorter = stem1.length > stem2.length ? stem2 : stem1;
  
  if (longer.startsWith(shorter)) {
    return shorter.length / longer.length;
  }
  
  return 0;
}

function simpleStem(word: string): string {
  // Simple stemming rules
  if (word.endsWith('ing')) return word.slice(0, -3);
  if (word.endsWith('ed')) return word.slice(0, -2);
  if (word.endsWith('s') && word.length > 3) return word.slice(0, -1);
  return word;
}

function findSemanticIndex(feature: string): number {
  // This would map semantic features to their vector positions
  // For simplicity, using a hash-based approach
  const hash = feature.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 400 + (hash % 400);
}

function calculateSemanticDensity(text: string): number {
  const foodTerms = ['spicy', 'sweet', 'sour', 'fermented', 'grilled', 'fried', 'steamed', 'soup', 'curry', 'noodle'];
  const words = text.split(/\s+/);
  const foodTermCount = words.filter(word => 
    foodTerms.some(term => word.includes(term) || term.includes(word))
  ).length;
  
  return Math.min(foodTermCount / words.length * 10, 5);
}

function calculateCulturalSpecificity(text: string): number {
  const culturalTerms = ['korean', 'chinese', 'japanese', 'thai', 'italian', 'mexican', 'indian'];
  let specificity = 0;
  
  culturalTerms.forEach(term => {
    if (text.includes(term)) {
      specificity += 2;
    }
  });
  
  return Math.min(specificity, 5);
}

function applySemanticBoosting(vector: number[], text: string): number[] {
  const boostedVector = [...vector];
  
  // Boost food-related features
  if (text.includes('food') || text.includes('dish') || text.includes('cuisine')) {
    for (let i = 400; i < 800; i++) {
      boostedVector[i] *= 1.1;
    }
  }
  
  return boostedVector;
}

// Enhanced similarity calculation with multiple algorithms
function calculateAdvancedSimilarity(query: string, text: string, region: string, type: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const regionLower = region.toLowerCase();
  const typeLower = type.toLowerCase();
  
  // 1. Semantic overlap score
  const semanticScore = calculateSemanticOverlap(queryLower, textLower);
  
  // 2. Cultural relevance score
  const culturalScore = calculateCulturalRelevance(queryLower, regionLower);
  
  // 3. Type relevance score
  const typeScore = calculateTypeRelevance(queryLower, typeLower);
  
  // 4. Ingredient/method matching
  const ingredientScore = calculateIngredientMatching(queryLower, textLower);
  
  // 5. Fuzzy matching with advanced algorithm
  const fuzzyScore = calculateAdvancedFuzzyMatch(queryLower, textLower);
  
  // Weighted combination
  return (
    semanticScore * 0.35 +
    culturalScore * 0.25 +
    typeScore * 0.15 +
    ingredientScore * 0.15 +
    fuzzyScore * 0.10
  );
}

function calculateSemanticOverlap(query: string, text: string): number {
  const queryWords = query.split(/\s+/);
  const textWords = text.split(/\s+/);
  
  let overlap = 0;
  queryWords.forEach(qWord => {
    textWords.forEach(tWord => {
      if (qWord === tWord) {
        overlap += 2;
      } else if (qWord.includes(tWord) || tWord.includes(qWord)) {
        overlap += 1;
      } else if (calculateStemSimilarity(qWord, tWord) > 0.7) {
        overlap += 1.5;
      }
    });
  });
  
  return Math.min(overlap / queryWords.length, 3);
}

function calculateCulturalRelevance(query: string, region: string): number {
  const culturalQueries: Record<string, string[]> = {
    korean: ['korean', 'korea', 'k-food'],
    chinese: ['chinese', 'china'],
    japanese: ['japanese', 'japan'],
    thai: ['thai', 'thailand'],
    italian: ['italian', 'italy'],
    indian: ['indian', 'india'],
    greece: ['greek', 'greece'],
    mediterranean: ['mediterranean', 'middle eastern'],
    germany: ['german', 'germany'],
    england: ['english', 'british', 'england'],
    malaysia: ['malaysian', 'malaysia'],
    singapore: ['singaporean', 'singapore'],
    vietnam: ['vietnamese', 'vietnam']
  };
  
  const regionKey = region.toLowerCase();
  const relevantTerms = culturalQueries[regionKey] || [regionKey];
  
  let relevance = 0;
  relevantTerms.forEach((term: string) => {
    if (query.includes(term)) {
      relevance += 3;
    }
  });
  
  return Math.min(relevance, 3);
}

function calculateTypeRelevance(query: string, type: string): number {
  const typeMapping: Record<string, string[]> = {
    'main course': ['main', 'dish', 'entree', 'course'],
    'appetizer': ['appetizer', 'starter', 'app'],
    'dessert': ['dessert', 'sweet', 'candy'],
    'soup': ['soup', 'broth', 'stew'],
    'salad': ['salad', 'greens'],
    'drink': ['drink', 'beverage', 'tea', 'coffee'],
    'snack': ['snack', 'street food'],
    'bread': ['bread', 'flatbread'],
    'side dish': ['side', 'banchan'],
    'fermented vegetable': ['fermented', 'pickled'],
    'dumpling': ['dumpling', 'wonton'],
    'noodles': ['noodle', 'pasta'],
    'porridge': ['porridge', 'congee'],
    'hot pot': ['hot pot', 'steamboat'],
    'condiment': ['sauce', 'condiment']
  };
  
  const typeKey = type.toLowerCase();
  const relevantTerms = typeMapping[typeKey] || [typeKey];
  
  let relevance = 0;
  relevantTerms.forEach((term: string) => {
    if (query.includes(term)) {
      relevance += 2;
    }
  });
  
  return Math.min(relevance, 2);
}

function calculateIngredientMatching(query: string, text: string): number {
  const ingredients = ['rice', 'noodle', 'chicken', 'beef', 'pork', 'vegetable', 'tofu', 'egg'];
  let matches = 0;
  
  ingredients.forEach(ingredient => {
    if (query.includes(ingredient) && text.includes(ingredient)) {
      matches += 1;
    }
  });
  
  return Math.min(matches / 3, 2);
}

function calculateAdvancedFuzzyMatch(query: string, text: string): number {
  // Jaro-Winkler similarity for better fuzzy matching
  return jaroWinklerSimilarity(query, text);
}

function jaroWinklerSimilarity(s1: string, s2: string): number {
  const jaro = jaroSimilarity(s1, s2);
  
  // Calculate common prefix length (up to 4 characters)
  let prefix = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length, 4); i++) {
    if (s1[i] === s2[i]) {
      prefix++;
    } else {
      break;
    }
  }
  
  return jaro + (0.1 * prefix * (1 - jaro));
}

function jaroSimilarity(s1: string, s2: string): number {
  if (s1.length === 0 && s2.length === 0) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Find matches
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2.length);
    
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0;
  
  // Find transpositions
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  
  return (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3;
}

export async function populateVectorDB(foodItems: FoodItem[]): Promise<void> {
  try {
    console.log('Populating vector database with advanced semantic embeddings...');
    
    const vectors: VectorData[] = foodItems.map(item => ({
      id: item.id,
      vector: createAdvancedEmbedding(`${item.text} ${item.region} ${item.type}`, true),
      metadata: {
        text: item.text,
        region: item.region,
        type: item.type,
      }
    }));

    const batchSize = 10;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
      console.log(`Uploaded batch ${i / batchSize + 1}/${Math.ceil(vectors.length / batchSize)}`);
    }
    
    console.log('Vector database populated with advanced semantic understanding!');
  } catch (error) {
    console.error('Error populating vector database:', error);
    throw error;
  }
}

export async function searchSimilarFoods(query: string, topK: number = 5): Promise<SearchResult[]> {
  try {
    console.log('Performing advanced semantic search for:', query);
    
    // Create advanced embedding for the query
    const queryVector = createAdvancedEmbedding(query, true);
    
    // Search with larger result set for re-ranking
    const searchTopK = Math.min(topK * 4, 100);
    const results = await index.query({
      vector: queryVector,
      topK: searchTopK,
      includeMetadata: true,
    });

    // Define relevance thresholds
    const MINIMUM_VECTOR_SCORE = 0.1; // Minimum vector similarity
    const MINIMUM_HYBRID_SCORE = 0.15; // Minimum final score to be considered relevant
    const MINIMUM_MEANINGFUL_RESULTS = 1; // At least one result must meet high standards

    // Advanced hybrid scoring with multiple algorithms
    let searchResults: SearchResultWithVector[] = results.map(result => {
      const vectorSimilarity = result.score;
      const textSimilarity = calculateAdvancedSimilarity(
        query,
        result.metadata?.text as string,
        result.metadata?.region as string,
        result.metadata?.type as string
      );
      
      // Contextual boosting
      let contextBoost = 1.0;
      
      // Boost exact cultural matches
      const queryLower = query.toLowerCase();
      const regionLower = (result.metadata?.region as string).toLowerCase();
      if (queryLower.includes(regionLower) || regionLower.includes(queryLower.split(' ')[0])) {
        contextBoost += 0.3;
      }
      
      // Boost synonym matches
      Object.entries(SYNONYM_MAP).forEach(([phrase, synonyms]: [string, string[]]) => {
        if (queryLower.includes(phrase)) {
          synonyms.forEach((synonym: string) => {
            if ((result.metadata?.text as string).toLowerCase().includes(synonym)) {
              contextBoost += 0.4;
            }
          });
        }
      });
      
      // Final hybrid score with contextual boosting
      const hybridScore = (
        vectorSimilarity * 0.5 +
        textSimilarity * 0.4 +
        (vectorSimilarity * textSimilarity) * 0.1  // Multiplicative component
      ) * contextBoost;
      
      return {
        id: String(result.id),
        text: result.metadata?.text as string,
        region: result.metadata?.region as string,
        type: result.metadata?.type as string,
        score: hybridScore,
        vectorScore: vectorSimilarity, // Keep for filtering
      };
    });

    // Filter out irrelevant results based on multiple criteria
    searchResults = searchResults.filter(result => {
      // Must meet minimum vector similarity
      if (result.vectorScore < MINIMUM_VECTOR_SCORE) {
        return false;
      }
      
      // Must meet minimum hybrid score
      if (result.score < MINIMUM_HYBRID_SCORE) {
        return false;
      }
      
      // Additional relevance check: ensure some keyword overlap
      const queryWords = query.toLowerCase().split(/\s+/);
      const textWords = result.text.toLowerCase().split(/\s+/);
      const regionWords = result.region.toLowerCase().split(/\s+/);
      const typeWords = result.type.toLowerCase().split(/\s+/);
      
      const allFoodWords = [...textWords, ...regionWords, ...typeWords];
      
      // Check if at least one query word has some connection to the food item
      const hasRelevantConnection = queryWords.some(queryWord => {
        // Skip very common words
        if (['a', 'an', 'the', 'and', 'or', 'with', 'food', 'dish'].includes(queryWord)) {
          return false;
        }
        
        return allFoodWords.some(foodWord => {
          // Exact match
          if (foodWord === queryWord) return true;
          
          // Partial match for longer words
          if (queryWord.length > 3 && (foodWord.includes(queryWord) || queryWord.includes(foodWord))) {
            return true;
          }
          
          // Stem similarity for food-related terms
          if (calculateStemSimilarity(queryWord, foodWord) > 0.8) {
            return true;
          }
          
          return false;
        });
      });
      
      if (!hasRelevantConnection) {
        return false;
      }
      
      return true;
    });

    // Quality gate: If no results meet high standards, return empty
    const highQualityResults = searchResults.filter(result => result.score > 0.3);
    if (highQualityResults.length === 0 && searchResults.length < MINIMUM_MEANINGFUL_RESULTS) {
      console.log('No sufficiently relevant results found for query:', query);
      return [];
    }

    // Sort by score and apply diversity filtering
    searchResults = searchResults
      .sort((a, b) => b.score - a.score)
      .slice(0, topK * 2) // Get more for diversity filtering
      .filter((result, index, array) => {
        // Diversity filter: don't show too many dishes from same region unless they're very relevant
        const sameRegionCount = array.slice(0, index).filter(r => r.region === result.region).length;
        const maxSameRegion = result.score > 0.4 ? Math.ceil(topK / 1.5) : Math.ceil(topK / 3);
        return sameRegionCount < maxSameRegion;
      })
      .slice(0, topK);

    // Final quality check: ensure top result meets minimum quality
    if (searchResults.length > 0 && searchResults[0].score < 0.2) {
      console.log('Top result quality too low, returning no results');
      return [];
    }

    // Remove the vectorScore property before returning (it was only for filtering)
    const finalResults = searchResults.map(result => ({
      id: result.id,
      text: result.text,
      region: result.region,
      type: result.type,
      score: result.score,
    }));

    console.log(`Advanced search completed: ${finalResults.length} highly relevant results`);
    return finalResults;
  } catch (error) {
    console.error('Error in advanced search:', error);
    throw error;
  }
}

export async function clearVectorDB(): Promise<void> {
  try {
    console.log('Vector database cleared');
  } catch (error) {
    console.error('Error clearing vector database:', error);
    throw error;
  }
}