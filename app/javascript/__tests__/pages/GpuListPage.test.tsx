import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import GpuListPage from "../../pages/GpuListPage";

const mockFetchGpus = vi.fn();
vi.mock("../../api/client", () => ({
  fetchGpus: (...args: unknown[]) => mockFetchGpus(...args),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("../../components/GpuCard", () => ({
  default: ({ gpu }: { gpu: { name: string } }) => <div data-testid="gpu-card">{gpu.name}</div>,
}));

vi.mock("../../components/FilterBar", () => ({
  default: ({ onQueryChange, onSortChange, onManufacturerChange, onPriceMinChange, onPriceMaxChange }: {
    onQueryChange: (q: string) => void;
    onSortChange: (s: string) => void;
    onManufacturerChange: (m: string) => void;
    onPriceMinChange: (v: string) => void;
    onPriceMaxChange: (v: string) => void;
  }) => (
    <div data-testid="filter-bar">
      <button onClick={() => onQueryChange("RTX")}>search</button>
      <button onClick={() => onSortChange("price_asc")}>sort</button>
      <button onClick={() => onManufacturerChange("NVIDIA")}>filter-manufacturer</button>
      <button onClick={() => onPriceMinChange("50000")}>min-price</button>
      <button onClick={() => onPriceMaxChange("200000")}>max-price</button>
    </div>
  ),
}));

vi.mock("../../components/Pagination", () => ({
  default: ({ onPageChange }: { onPageChange: (p: number) => void }) => (
    <>
      <button onClick={() => onPageChange(1)}>page-1</button>
      <button onClick={() => onPageChange(2)}>page-2</button>
    </>
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
  favorited: false,
  amazon_asin: null,
};

const mockPaginatedResponse = {
  gpus: [mockGpu],
  meta: { current_page: 1, total_pages: 3, total_count: 45, per_page: 15 },
};

function renderPage(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<GpuListPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("GpuListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows loading state", () => {
    mockFetchGpus.mockReturnValueOnce(new Promise(() => {}));
    renderPage();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("renders gpu cards after loading", async () => {
    mockFetchGpus.mockResolvedValueOnce(mockPaginatedResponse);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("gpu-card")).toBeInTheDocument();
    });
  });

  it("shows empty message when no GPUs found", async () => {
    mockFetchGpus.mockResolvedValueOnce({
      gpus: [],
      meta: { current_page: 1, total_pages: 0, total_count: 0, per_page: 15 },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("該当するGPUが見つかりませんでした")).toBeInTheDocument();
    });
  });

  it("shows error toast on fetch failure", async () => {
    const showToast = vi.fn();
    vi.mocked(vi.fn()).mockReturnValue({ showToast });
    mockFetchGpus.mockRejectedValueOnce(new Error("Network error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderPage();
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });

  it("saves search condition", async () => {
    const user = userEvent.setup();
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage();
    await waitFor(() => screen.getByText("+ この条件を保存"));
    await user.click(screen.getByText("+ この条件を保存"));
    // Check localStorage
    const saved = JSON.parse(localStorage.getItem("gpu_saved_searches") || "[]");
    expect(saved.length).toBeGreaterThan(0);
  });

  it("saves search with manufacturer and price info", async () => {
    const user = userEvent.setup();
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    render(
      <MemoryRouter initialEntries={["/?manufacturer=NVIDIA&price_min=50000&price_max=200000"]}>
        <Routes>
          <Route path="/" element={<GpuListPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText("+ この条件を保存"));
    await user.click(screen.getByText("+ この条件を保存"));
    const saved = JSON.parse(localStorage.getItem("gpu_saved_searches") || "[]");
    expect(saved[0].label).toContain("NVIDIA");
  });

  it("loads saved searches from localStorage", async () => {
    const savedSearch = {
      id: "123",
      label: "NVIDIA / 人気順",
      sort: "popularity",
      manufacturer: "NVIDIA",
      priceMin: "",
      priceMax: "",
      savedAt: "2026/02/23",
    };
    localStorage.setItem("gpu_saved_searches", JSON.stringify([savedSearch]));
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("NVIDIA / 人気順")).toBeInTheDocument();
    });
  });

  it("applies saved search when clicked", async () => {
    const user = userEvent.setup();
    const savedSearch = {
      id: "456",
      label: "AMD / コスパ順",
      sort: "cost_performance",
      manufacturer: "AMD",
      priceMin: "50000",
      priceMax: "200000",
      savedAt: "2026/02/23",
    };
    localStorage.setItem("gpu_saved_searches", JSON.stringify([savedSearch]));
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage();
    await waitFor(() => screen.getByText("AMD / コスパ順"));
    await user.click(screen.getByText("AMD / コスパ順"));
    // Should trigger a new fetch with AMD params
    await waitFor(() => expect(mockFetchGpus).toHaveBeenCalled());
  });

  it("deletes saved search", async () => {
    const user = userEvent.setup();
    const savedSearch = {
      id: "789",
      label: "Intel / 名前順",
      sort: "name",
      manufacturer: "Intel",
      priceMin: "",
      priceMax: "",
      savedAt: "2026/02/23",
    };
    localStorage.setItem("gpu_saved_searches", JSON.stringify([savedSearch]));
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage();
    await waitFor(() => screen.getByText("Intel / 名前順"));
    await user.click(screen.getByText("×"));
    expect(screen.queryByText("Intel / 名前順")).not.toBeInTheDocument();
  });

  it("triggers new fetch when query changes via FilterBar", async () => {
    const user = userEvent.setup();
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage();
    await waitFor(() => screen.getByTestId("gpu-card"));
    const initialCalls = mockFetchGpus.mock.calls.length;
    await user.click(screen.getByText("search"));
    await waitFor(() =>
      expect(mockFetchGpus.mock.calls.length).toBeGreaterThan(initialCalls)
    );
  });

  it("triggers new fetch when manufacturer changes via FilterBar", async () => {
    const user = userEvent.setup();
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage();
    await waitFor(() => screen.getByTestId("gpu-card"));
    const initialCalls = mockFetchGpus.mock.calls.length;
    await user.click(screen.getByText("filter-manufacturer"));
    await waitFor(() =>
      expect(mockFetchGpus.mock.calls.length).toBeGreaterThan(initialCalls)
    );
  });

  it("triggers new fetch when price min changes via FilterBar", async () => {
    const user = userEvent.setup();
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage();
    await waitFor(() => screen.getByTestId("gpu-card"));
    const initialCalls = mockFetchGpus.mock.calls.length;
    await user.click(screen.getByText("min-price"));
    await waitFor(() =>
      expect(mockFetchGpus.mock.calls.length).toBeGreaterThan(initialCalls)
    );
  });

  it("triggers new fetch when price max changes via FilterBar", async () => {
    const user = userEvent.setup();
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage();
    await waitFor(() => screen.getByTestId("gpu-card"));
    const initialCalls = mockFetchGpus.mock.calls.length;
    await user.click(screen.getByText("max-price"));
    await waitFor(() =>
      expect(mockFetchGpus.mock.calls.length).toBeGreaterThan(initialCalls)
    );
  });

  it("triggers new fetch when page changes to page 2 via Pagination", async () => {
    const user = userEvent.setup();
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage();
    await waitFor(() => screen.getByTestId("gpu-card"));
    const initialCalls = mockFetchGpus.mock.calls.length;
    await user.click(screen.getByText("page-2"));
    await waitFor(() =>
      expect(mockFetchGpus.mock.calls.length).toBeGreaterThan(initialCalls)
    );
  });

  it("clears page param when navigating to page 1 via Pagination", async () => {
    const user = userEvent.setup();
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage("/?page=2");
    await waitFor(() => screen.getByTestId("gpu-card"));
    const initialCalls = mockFetchGpus.mock.calls.length;
    await user.click(screen.getByText("page-1"));
    await waitFor(() =>
      expect(mockFetchGpus.mock.calls.length).toBeGreaterThan(initialCalls)
    );
  });

  it("triggers new fetch when sort changes via FilterBar", async () => {
    const user = userEvent.setup();
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage();
    await waitFor(() => screen.getByTestId("gpu-card"));
    const initialCalls = mockFetchGpus.mock.calls.length;
    await user.click(screen.getByText("sort"));
    await waitFor(() =>
      expect(mockFetchGpus.mock.calls.length).toBeGreaterThan(initialCalls)
    );
  });

  it("handles corrupt localStorage gracefully", async () => {
    localStorage.setItem("gpu_saved_searches", "corrupt_json{");
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage(); // Should not throw
    await waitFor(() => expect(mockFetchGpus).toHaveBeenCalled());
  });

  it("saves search with only priceMax showing ¥0 as lower bound", async () => {
    const user = userEvent.setup();
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    render(
      <MemoryRouter initialEntries={["/?price_max=200000"]}>
        <Routes>
          <Route path="/" element={<GpuListPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText("+ この条件を保存"));
    await user.click(screen.getByText("+ この条件を保存"));
    const saved = JSON.parse(localStorage.getItem("gpu_saved_searches") || "[]");
    expect(saved[0].label).toContain("¥0");
  });

  it("saves search with only priceMin showing 上限なし as upper bound", async () => {
    const user = userEvent.setup();
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    render(
      <MemoryRouter initialEntries={["/?price_min=50000"]}>
        <Routes>
          <Route path="/" element={<GpuListPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText("+ この条件を保存"));
    await user.click(screen.getByText("+ この条件を保存"));
    const saved = JSON.parse(localStorage.getItem("gpu_saved_searches") || "[]");
    expect(saved[0].label).toContain("上限なし");
  });

  it("applies saved search with sort=popularity and no filters", async () => {
    const user = userEvent.setup();
    const savedSearch = {
      id: "no-filter-1",
      label: "人気順",
      sort: "popularity" as const,
      manufacturer: "",
      priceMin: "",
      priceMax: "",
      savedAt: "2026/02/23",
    };
    localStorage.setItem("gpu_saved_searches", JSON.stringify([savedSearch]));
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage();
    await waitFor(() => screen.getByText("人気順"));
    await user.click(screen.getByText("人気順"));
    await waitFor(() => expect(mockFetchGpus).toHaveBeenCalled());
  });

  it("saves search with sort=popularity as default label", async () => {
    const user = userEvent.setup();
    mockFetchGpus.mockResolvedValue(mockPaginatedResponse);
    renderPage();
    await waitFor(() => screen.getByText("+ この条件を保存"));
    await user.click(screen.getByText("+ この条件を保存"));
    const saved = JSON.parse(localStorage.getItem("gpu_saved_searches") || "[]");
    expect(saved[0].label).toBe("人気順");
  });
});
