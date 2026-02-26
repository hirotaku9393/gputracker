import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import GpuDetailPage from "../../pages/GpuDetailPage";

const mockFetchGpu = vi.fn();
const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();

vi.mock("../../api/client", () => ({
  fetchGpu: (...args: unknown[]) => mockFetchGpu(...args),
  addFavorite: (...args: unknown[]) => mockAddFavorite(...args),
  removeFavorite: (...args: unknown[]) => mockRemoveFavorite(...args),
}));

const mockShowToast = vi.fn();
vi.mock("../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const mockUseAuth = vi.fn();
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../components/PriceChart", () => ({
  default: ({ gpuId }: { gpuId: number }) => (
    <div data-testid="price-chart" data-gpu-id={gpuId} />
  ),
}));

vi.mock("../../components/GpuImage", () => ({
  default: () => <img data-testid="gpu-image" alt="gpu" />,
}));

const mockGpu = {
  id: 1,
  name: "RTX 4090",
  manufacturer: "NVIDIA",
  series: "RTX 4090 Series",
  vram: 24,
  benchmark_score: 5200,
  image_url: null,
  current_price: 320000,
  popularity: 10,
  cost_performance: 16.25,
  favorited: false,
  amazon_asin: "B0TEST1234",
};

function renderPage(path = "/gpus/1") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/gpus/:id" element={<GpuDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("GpuDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null });
  });

  it("shows loading state initially", () => {
    mockFetchGpu.mockReturnValueOnce(new Promise(() => {}));
    renderPage();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("shows not found message when fetch fails", async () => {
    mockFetchGpu.mockRejectedValueOnce(new Error("Not found"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("GPUが見つかりませんでした")).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  it("renders gpu name after loading", async () => {
    mockFetchGpu.mockResolvedValueOnce(mockGpu);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("RTX 4090")).toBeInTheDocument();
    });
  });

  it("renders manufacturer, series, vram, benchmark", async () => {
    mockFetchGpu.mockResolvedValueOnce(mockGpu);
    renderPage();
    await waitFor(() => screen.getByText("RTX 4090"));
    expect(screen.getByText("NVIDIA")).toBeInTheDocument();
    expect(screen.getByText("RTX 4090 Series")).toBeInTheDocument();
    expect(screen.getByText("24 GB")).toBeInTheDocument();
    expect(screen.getByText("5,200")).toBeInTheDocument();
  });

  it("renders formatted price", async () => {
    mockFetchGpu.mockResolvedValueOnce(mockGpu);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("¥320,000")).toBeInTheDocument();
    });
  });

  it("shows 未取得 when price is 0", async () => {
    mockFetchGpu.mockResolvedValueOnce({ ...mockGpu, current_price: 0 });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("未取得")).toBeInTheDocument();
    });
  });

  it("shows formatted cost_performance when > 0", async () => {
    mockFetchGpu.mockResolvedValueOnce(mockGpu);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("16.3")).toBeInTheDocument();
    });
  });

  it("handles missing id gracefully", () => {
    render(
      <MemoryRouter initialEntries={["/gpus"]}>
        <Routes>
          <Route path="/gpus" element={<GpuDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    // id is undefined → loadGpu returns early → stays in loading state
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    expect(mockFetchGpu).not.toHaveBeenCalled();
  });

  it("shows - when benchmark_score is null", async () => {
    mockFetchGpu.mockResolvedValueOnce({
      ...mockGpu,
      benchmark_score: null as unknown as number,
    });
    renderPage();
    await waitFor(() => screen.getByText("RTX 4090"));
    expect(screen.getAllByText("-")[0]).toBeInTheDocument();
  });

  it("shows - for cost_performance when 0", async () => {
    mockFetchGpu.mockResolvedValueOnce({ ...mockGpu, cost_performance: 0 });
    renderPage();
    await waitFor(() => screen.getByText("RTX 4090"));
    expect(screen.getAllByText("-")[0]).toBeInTheDocument();
  });

  it("renders popularity", async () => {
    mockFetchGpu.mockResolvedValueOnce(mockGpu);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument();
    });
  });

  it("does not show favorite button when not logged in", async () => {
    mockFetchGpu.mockResolvedValueOnce(mockGpu);
    renderPage();
    await waitFor(() => screen.getByText("RTX 4090"));
    expect(screen.queryByRole("button", { name: /★|☆/ })).not.toBeInTheDocument();
  });

  it("shows unfavorited star when logged in and not favorited", async () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "Alice" } });
    mockFetchGpu.mockResolvedValueOnce(mockGpu);
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "☆" })).toBeInTheDocument();
    });
  });

  it("shows filled star when favorited", async () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "Alice" } });
    mockFetchGpu.mockResolvedValueOnce({ ...mockGpu, favorited: true });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "★" })).toBeInTheDocument();
    });
  });

  it("calls addFavorite when unfavorited star clicked", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "Alice" } });
    mockFetchGpu.mockResolvedValue(mockGpu);
    mockAddFavorite.mockResolvedValueOnce(undefined);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: "☆" }));
    await user.click(screen.getByRole("button", { name: "☆" }));
    await waitFor(() => expect(mockAddFavorite).toHaveBeenCalledWith(1));
  });

  it("calls removeFavorite when favorited star clicked", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "Alice" } });
    mockFetchGpu.mockResolvedValue({ ...mockGpu, favorited: true });
    mockRemoveFavorite.mockResolvedValueOnce(undefined);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: "★" }));
    await user.click(screen.getByRole("button", { name: "★" }));
    await waitFor(() => expect(mockRemoveFavorite).toHaveBeenCalledWith(1));
  });

  it("shows error toast on favorite operation failure", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "Alice" } });
    mockFetchGpu.mockResolvedValue(mockGpu);
    mockAddFavorite.mockRejectedValueOnce(new Error("Favorite error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: "☆" }));
    await user.click(screen.getByRole("button", { name: "☆" }));
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        "お気に入りの操作に失敗しました",
        "error"
      )
    );
    consoleSpy.mockRestore();
  });

  it("shows error toast on fetch failure", async () => {
    mockFetchGpu.mockRejectedValueOnce(new Error("Network error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderPage();
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        "GPU情報の取得に失敗しました",
        "error"
      )
    );
    consoleSpy.mockRestore();
  });

  it("renders back button and navigates on click", async () => {
    const user = userEvent.setup();
    mockFetchGpu.mockResolvedValueOnce(mockGpu);
    renderPage();
    await waitFor(() => screen.getByText("RTX 4090"));
    const backButton = screen.getAllByText("GPU一覧に戻る")[0];
    await user.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("renders PriceChart with correct gpuId", async () => {
    mockFetchGpu.mockResolvedValueOnce(mockGpu);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("price-chart")).toBeInTheDocument();
    });
    expect(screen.getByTestId("price-chart").getAttribute("data-gpu-id")).toBe("1");
  });

  it("Amazon link uses ASIN when exactly 10 chars", async () => {
    mockFetchGpu.mockResolvedValueOnce({ ...mockGpu, amazon_asin: "B0TEST1234" });
    renderPage();
    await waitFor(() => screen.getByText("RTX 4090"));
    const amazonLink = screen.getByText("Amazon.co.jp").closest("a");
    expect(amazonLink?.href).toContain("/dp/B0TEST1234");
  });

  it("Amazon link uses search URL when ASIN is null", async () => {
    mockFetchGpu.mockResolvedValueOnce({ ...mockGpu, amazon_asin: null });
    renderPage();
    await waitFor(() => screen.getByText("RTX 4090"));
    const amazonLink = screen.getByText("Amazon.co.jp").closest("a");
    expect(amazonLink?.href).toContain("amazon.co.jp/s?k=");
  });

  it("Amazon link uses search URL when ASIN is not 10 chars", async () => {
    mockFetchGpu.mockResolvedValueOnce({ ...mockGpu, amazon_asin: "SHORT" });
    renderPage();
    await waitFor(() => screen.getByText("RTX 4090"));
    const amazonLink = screen.getByText("Amazon.co.jp").closest("a");
    expect(amazonLink?.href).toContain("amazon.co.jp/s?k=");
  });

  it("Rakuten link uses search URL", async () => {
    mockFetchGpu.mockResolvedValueOnce(mockGpu);
    renderPage();
    await waitFor(() => screen.getByText("RTX 4090"));
    const rakutenLink = screen.getByText("楽天市場").closest("a");
    expect(rakutenLink?.href).toContain("rakuten.co.jp");
  });

  it("renders second back button at bottom of page", async () => {
    const user = userEvent.setup();
    mockFetchGpu.mockResolvedValueOnce(mockGpu);
    renderPage();
    await waitFor(() => screen.getByText("RTX 4090"));
    const backButtons = screen.getAllByText("GPU一覧に戻る");
    expect(backButtons.length).toBe(2);
    await user.click(backButtons[1]);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
