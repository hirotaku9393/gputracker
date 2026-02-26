import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import PriceChart from "../../components/PriceChart";

const mockFetchPriceHistories = vi.fn();
vi.mock("../../api/client", () => ({
  fetchPriceHistories: (...args: unknown[]) => mockFetchPriceHistories(...args),
}));

// Mock recharts components to avoid SVG rendering issues in jsdom
vi.mock("recharts", () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: ({ tickFormatter }: { tickFormatter?: (v: number) => string }) => {
    tickFormatter?.(100000);
    return null;
  },
  CartesianGrid: () => null,
  Tooltip: ({ formatter }: { formatter?: (v: number) => [string, string] }) => {
    formatter?.(200000);
    return null;
  },
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe("PriceChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    mockFetchPriceHistories.mockReturnValueOnce(new Promise(() => {}));
    render(<PriceChart gpuId={1} />);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("shows empty message when no data", async () => {
    mockFetchPriceHistories.mockResolvedValueOnce([]);
    render(<PriceChart gpuId={1} />);
    await waitFor(() => {
      expect(screen.getByText("価格データがありません")).toBeInTheDocument();
    });
  });

  it("renders chart when data is available", async () => {
    const data = [{ date: "2026-02-01", price: 310000 }];
    mockFetchPriceHistories.mockResolvedValueOnce(data);
    render(<PriceChart gpuId={1} />);
    await waitFor(() => {
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });
  });

  it("renders period selection buttons", async () => {
    mockFetchPriceHistories.mockResolvedValueOnce([]);
    render(<PriceChart gpuId={1} />);
    expect(screen.getByRole("button", { name: "7日" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30日" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "90日" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1年" })).toBeInTheDocument();
  });

  it("fetches data with default 30 days", async () => {
    mockFetchPriceHistories.mockResolvedValueOnce([]);
    render(<PriceChart gpuId={1} />);
    await waitFor(() => {
      expect(mockFetchPriceHistories).toHaveBeenCalledWith(1, 30);
    });
  });

  it("changes period when button clicked", async () => {
    const user = userEvent.setup();
    mockFetchPriceHistories
      .mockResolvedValueOnce([]) // initial 30 days
      .mockResolvedValueOnce([]); // after clicking 7日

    render(<PriceChart gpuId={1} />);
    await waitFor(() => expect(mockFetchPriceHistories).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "7日" }));
    await waitFor(() => {
      expect(mockFetchPriceHistories).toHaveBeenCalledWith(1, 7);
    });
  });

  it("refetches when gpuId changes", async () => {
    mockFetchPriceHistories
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const { rerender } = render(<PriceChart gpuId={1} />);
    await waitFor(() => expect(mockFetchPriceHistories).toHaveBeenCalledWith(1, 30));

    rerender(<PriceChart gpuId={2} />);
    await waitFor(() => expect(mockFetchPriceHistories).toHaveBeenCalledWith(2, 30));
  });

  it("highlights selected period button", async () => {
    mockFetchPriceHistories.mockResolvedValueOnce([]);
    render(<PriceChart gpuId={1} />);
    const btn30 = screen.getByRole("button", { name: "30日" });
    expect(btn30.className).toContain("bg-green-600");
  });

  it("shows title", () => {
    mockFetchPriceHistories.mockReturnValueOnce(new Promise(() => {}));
    render(<PriceChart gpuId={1} />);
    expect(screen.getByText("価格推移")).toBeInTheDocument();
  });
});
