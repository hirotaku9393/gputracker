import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { Accept: "application/json" },
});

export async function fetchGpus(params) {
  const { data } = await api.get("/gpus", { params });
  return data;
}

export async function fetchGpu(id) {
  const { data } = await api.get(`/gpus/${id}`);
  return data;
}

export async function fetchPriceHistories(gpuId, days) {
  const { data } = await api.get(`/gpus/${gpuId}/price_histories`, {
    params: { days },
  });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get("/me");
  return data;
}

export async function fetchFavorites() {
  const { data } = await api.get("/favorites");
  return data;
}

export async function addFavorite(gpuId) {
  await api.post("/favorites", { gpu_id: gpuId });
}

export async function removeFavorite(gpuId) {
  await api.delete(`/favorites/by_gpu/${gpuId}`);
}
