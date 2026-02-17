export interface Product {
  id: number;
  name: string;
  category: "meal" | "snack" | "drink";
  price: number;
  description: string;
  ingredients: string;
  nutritional_info: {
    energy_kcal: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber: number;
    salt: number;
    per: string;
  };
  origin_info: string;
  certifications: string[];
  allergen_free: string[];
  image_emoji: string;
  image_url: string;
  color_from: string;
  color_to: string;
  is_vegan: boolean;
  is_vegetarian: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Participant {
  id: number;
  name?: string;
  age_range: string;
  gender: string;
  allergies: string[];
  dietary_prefs: string[];
  vending_freq: string;
  would_seek: string;
}

export interface Session {
  id: number;
  participant_id: number;
  budget_set: number;
  total_spent: number;
  items_purchased: number;
  session_start: string;
  session_end?: string;
  completed: boolean;
}

export type EventType =
  | "page_view"
  | "product_view"
  | "product_detail_open"
  | "product_detail_close"
  | "add_to_cart"
  | "remove_from_cart"
  | "update_quantity"
  | "category_switch"
  | "cart_open"
  | "cart_close"
  | "cart_abandon"
  | "purchase_confirm"
  | "budget_set"
  | "hesitation"
  | "session_start"
  | "session_end"
  | "feedback_submit";

export interface TrackedEvent {
  session_id: number;
  event_type: EventType;
  product_id?: number;
  category?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}
