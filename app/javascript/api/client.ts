import axios from "axios";
import type { Gpu, PriceHistoryPoint, User } from "../types";

const api = axios.create({
  baseURL: "/api",
  headers: { Accept: "application/json" },
});

export interface PaginatedGpus {
  gpus: Gpu[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export async function fetchGpus(params: {
  q?: string;
  sort?: string;
  manufacturer?: string;
  price_min?: string;
  price_max?: string;
  page?: number;
}): Promise<PaginatedGpus> {
  const { data } = await api.get("/gpus", { params });
  return data;
}

export async function fetchGpu(id: number): Promise<Gpu> {
  const { data } = await api.get(`/gpus/${id}`);
  return data;
}

export async function fetchPriceHistories(
  gpuId: number,
  days: number
): Promise<PriceHistoryPoint[]> {
  const { data } = await api.get(`/gpus/${gpuId}/price_histories`, {
    params: { days },
  });
  return data;
}

export async function fetchMe(): Promise<User | null> {
  const { data } = await api.get("/me");
  return data;
}

export async function fetchFavorites(): Promise<
  { id: number; gpu: Gpu }[]
> {
  const { data } = await api.get("/favorites");
  return data;
}

export async function addFavorite(gpuId: number): Promise<void> {
  await api.post("/favorites", { gpu_id: gpuId });
}

export async function removeFavorite(gpuId: number): Promise<void> {
  await api.delete(`/favorites/by_gpu/${gpuId}`);
}
