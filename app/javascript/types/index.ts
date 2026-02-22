export interface Gpu {
  id: number;
  name: string;
  manufacturer: string;
  series: string;
  vram: number;
  benchmark_score: number;
  image_url: string | null;
  current_price: number;
  popularity: number;
  cost_performance: number;
  favorited: boolean;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url: string | null;
}

export type SortOption =
  | "popularity"
  | "price_asc"
  | "price_desc"
  | "performance"
  | "cost_performance"
  | "name";

export interface SavedSearch {
  id: string;
  label: string;
  sort: SortOption;
  manufacturer: string;
  priceMin: string;
  priceMax: string;
  savedAt: string;
}
