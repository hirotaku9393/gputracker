import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import FavoritesPage from "../../pages/FavoritesPage";

const mockFetchFavorites = vi.fn();
vi.mock("../../api/client", () => ({
  fetchFavorites: (...args: unknown[]) => mockFetchFavorites(...args),
}));

const mockShowToast = vi.fn();
vi.mock("../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const mockUseAuth = vi.fn();
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../../components/GpuCard", () => ({
  default: ({ gpu }: { gpu: { name: string } }) => (
    <div data-testid="gpu-card">{gpu.name}</div>
  ),
}));

const mockGpu = {
  id: 1,
  name: "RTX 4090",
  manufacturer: "NVIDIA",
  series: "RTX 4090",
  vram: 24,
  benchmark_score: 5200,
  image_url: null,
  current_price: 320000,
  popularity: 10,
  cost_performance: 16.25,
  favorited: true,
  amazon_asin: null,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <FavoritesPage />
    </MemoryRouter>
  );
}

describe("FavoritesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows login message when not logged in", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    renderPage();
    await waitFor(() => {
      expect(
        screen.getByText("お気に入り機能を使うにはログインしてください")
      ).toBeInTheDocument();
    });
  });

  it("shows loading state when user is logged in", () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "Alice" } });
    mockFetchFavorites.mockReturnValueOnce(new Promise(() => {}));
    renderPage();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("shows empty message when no favorites", async () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "Alice" } });
    mockFetchFavorites.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => {
      expect(
        screen.getByText("お気に入りに登録されたGPUはありません")
      ).toBeInTheDocument();
    });
  });

  it("renders GPU cards for each favorite", async () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "Alice" } });
    mockFetchFavorites.mockResolvedValueOnce([{ gpu: mockGpu }]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("gpu-card")).toBeInTheDocument();
      expect(screen.getByText("RTX 4090")).toBeInTheDocument();
    });
  });

  it("renders multiple GPU cards", async () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "Alice" } });
    const gpu2 = { ...mockGpu, id: 2, name: "RX 7900 XTX" };
    mockFetchFavorites.mockResolvedValueOnce([
      { gpu: mockGpu },
      { gpu: gpu2 },
    ]);
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByTestId("gpu-card")).toHaveLength(2);
    });
  });

  it("shows error toast on fetch failure", async () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "Alice" } });
    mockFetchFavorites.mockRejectedValueOnce(new Error("Network error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderPage();
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        "お気に入りの取得に失敗しました",
        "error"
      )
    );
    consoleSpy.mockRestore();
  });

  it("renders page title when logged in", async () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "Alice" } });
    mockFetchFavorites.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("お気に入り")).toBeInTheDocument();
    });
  });
});
