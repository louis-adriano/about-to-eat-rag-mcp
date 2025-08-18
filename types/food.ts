export interface FoodItem {
  id: string;
  text: string;
  region: string;
  type: string;
}

export interface SearchResult extends FoodItem {
  score: number;
}

export interface VectorData {
  id: string;
  vector: number[];
  metadata: {
    text: string;
    region: string;
    type: string;
  };
}