import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
      delete: mockDelete,
    })),
  },
}));

// Import after mock is set up
const { fetchGpus, fetchGpu, fetchPriceHistories, fetchMe, fetchFavorites, addFavorite, removeFavorite } =
  await import("../../api/client");

const mockGpu = {
  id: 1,
  name: "Test GPU",
  manufacturer: "NVIDIA",
  series: "RTX 4090",
  vram: 24,
  benchmark_score: 5200,
  image_url: null,
  current_price: 320000,
  popularity: 10,
  cost_performance: 16.25,
  favorited: false,
  amazon_asin: "B0TEST1234",
};

describe("API client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchGpus", () => {
    it("returns paginated gpus", async () => {
      const data = {
        gpus: [mockGpu],
        meta: { current_page: 1, total_pages: 5, total_count: 70, per_page: 15 },
      };
      mockGet.mockResolvedValueOnce({ data });
      const result = await fetchGpus({ q: "RTX", sort: "price_asc", page: 1 });
      expect(mockGet).toHaveBeenCalledWith("/gpus", expect.objectContaining({ params: expect.any(Object) }));
      expect(result.gpus).toHaveLength(1);
      expect(result.meta.per_page).toBe(15);
    });
  });

  describe("fetchGpu", () => {
    it("returns a single gpu", async () => {
      mockGet.mockResolvedValueOnce({ data: mockGpu });
      const result = await fetchGpu(1);
      expect(mockGet).toHaveBeenCalledWith("/gpus/1");
      expect(result.id).toBe(1);
    });
  });

  describe("fetchPriceHistories", () => {
    it("returns price history array", async () => {
      const histories = [{ date: "2026-02-01", price: 310000 }];
      mockGet.mockResolvedValueOnce({ data: histories });
      const result = await fetchPriceHistories(1, 30);
      expect(mockGet).toHaveBeenCalledWith("/gpus/1/price_histories", { params: { days: 30 } });
      expect(result[0].price).toBe(310000);
    });
  });

  describe("fetchMe", () => {
    it("returns user when logged in", async () => {
      const user = { id: 1, email: "test@example.com", name: "Test", avatar_url: null };
      mockGet.mockResolvedValueOnce({ data: user });
      const result = await fetchMe();
      expect(result?.email).toBe("test@example.com");
    });

    it("returns null when not logged in", async () => {
      mockGet.mockResolvedValueOnce({ data: null });
      const result = await fetchMe();
      expect(result).toBeNull();
    });
  });

  describe("fetchFavorites", () => {
    it("returns favorites list", async () => {
      const favorites = [{ id: 1, gpu: { ...mockGpu, favorited: true } }];
      mockGet.mockResolvedValueOnce({ data: favorites });
      const result = await fetchFavorites();
      expect(result).toHaveLength(1);
    });
  });

  describe("addFavorite", () => {
    it("posts to add a favorite", async () => {
      mockPost.mockResolvedValueOnce({ data: { id: 1, gpu_id: 1 } });
      await expect(addFavorite(1)).resolves.toBeUndefined();
      expect(mockPost).toHaveBeenCalledWith("/favorites", { gpu_id: 1 });
    });
  });

  describe("removeFavorite", () => {
    it("deletes a favorite by gpu id", async () => {
      mockDelete.mockResolvedValueOnce({ data: null });
      await expect(removeFavorite(1)).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith("/favorites/by_gpu/1");
    });
  });
});
