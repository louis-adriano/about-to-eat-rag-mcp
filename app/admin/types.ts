export interface FoodItem {
  id: string;
  externalId: string;
  text: string;
  region: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface AdminUser {
  id: string;
  clerkUserId: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export interface SearchResult {
  id: string;
  text: string;
  region: string;
  type: string;
  score: number;
}

export interface AdminStats {
  total: number;
  active: number;
  inactive: number;
}

export interface AdminDashboardProps {
  initialItems: FoodItem[];
  stats: AdminStats;
  userRole: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface CreateFoodItemData {
  externalId: string;
  text: string;
  region: string;
  type: string;
}

export interface UpdateFoodItemData {
  text: string;
  region: string;
  type: string;
  isActive: boolean;
}

export type MessageType = 'success' | 'error';

export interface Message {
  type: MessageType;
  text: string;
}