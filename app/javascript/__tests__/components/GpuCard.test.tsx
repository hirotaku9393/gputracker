import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import GpuCard from "../../components/GpuCard";
import type { Gpu } from "../../types";

const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../../api/client", () => ({
  addFavorite: (...args: unknown[]) => mockAddFavorite(...args),
  removeFavorite: (...args: unknown[]) => mockRemoveFavorite(...args),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUseAuth = vi.fn();
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const gpu: Gpu = {
  id: 1,
  name: "ASUS ROG STRIX RTX 4090",
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

function renderCard(gpuOverrides: Partial<Gpu> = {}, user: object | null = null) {
  mockUseAuth.mockReturnValue({ user });
  return render(
    <MemoryRouter>
      <GpuCard gpu={{ ...gpu, ...gpuOverrides }} onFavoriteToggle={vi.fn()} />
    </MemoryRouter>
  );
}

describe("GpuCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.open = vi.fn();
  });

  it("renders gpu name and series", () => {
    renderCard();
    expect(screen.getByText(gpu.name)).toBeInTheDocument();
    expect(screen.getByText(`${gpu.series} / VRAM ${gpu.vram}GB`)).toBeInTheDocument();
  });

  it("renders formatted price", () => {
    renderCard();
    expect(screen.getByText("¥320,000")).toBeInTheDocument();
  });

  it("shows 価格未取得 when price is 0", () => {
    renderCard({ current_price: 0 });
    expect(screen.getByText("価格未取得")).toBeInTheDocument();
  });

  it("shows benchmark score", () => {
    renderCard();
    expect(screen.getByText(`Score: ${gpu.benchmark_score.toLocaleString()}`)).toBeInTheDocument();
  });

  it("shows - for benchmark when score is null", () => {
    renderCard({ benchmark_score: null as unknown as number });
    expect(screen.getByText("Score: -")).toBeInTheDocument();
  });

  it("shows cost_performance when > 0", () => {
    renderCard({ cost_performance: 16.25 });
    expect(screen.getByText("16.3")).toBeInTheDocument();
  });

  it("hides cost_performance when 0", () => {
    renderCard({ cost_performance: 0 });
    expect(screen.queryByText(/コスパ/)).not.toBeInTheDocument();
  });

  it("shows NVIDIA manufacturer badge", () => {
    renderCard({ manufacturer: "NVIDIA" });
    expect(screen.getByText("NVIDIA")).toBeInTheDocument();
  });

  it("shows AMD badge with correct class", () => {
    renderCard({ manufacturer: "AMD" });
    const badge = screen.getByText("AMD");
    expect(badge.className).toContain("badge-amd");
  });

  it("shows Intel badge", () => {
    renderCard({ manufacturer: "Intel" });
    expect(screen.getByText("Intel")).toBeInTheDocument();
  });

  it("shows default badge for unknown manufacturer", () => {
    renderCard({ manufacturer: "Unknown" });
    const badge = screen.getByText("Unknown");
    expect(badge.className).toContain("bg-gray-600");
  });

  it("does not show favorite button when not logged in", () => {
    renderCard({}, null);
    expect(screen.queryByRole("button", { name: /★|☆/ })).not.toBeInTheDocument();
  });

  it("shows unfavorited star when logged in and not favorited", () => {
    renderCard({ favorited: false }, { id: 1, name: "User" });
    // The star button should show ☆ (outline star)
    expect(screen.getByRole("button", { name: "☆" })).toBeInTheDocument();
  });

  it("shows favorited star when favorited", () => {
    renderCard({ favorited: true }, { id: 1, name: "User" });
    expect(screen.getByRole("button", { name: "★" })).toBeInTheDocument();
  });

  it("calls addFavorite when unfavorited star clicked", async () => {
    const user = userEvent.setup();
    const onFavoriteToggle = vi.fn();
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "User" } });
    mockAddFavorite.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <GpuCard gpu={{ ...gpu, favorited: false }} onFavoriteToggle={onFavoriteToggle} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "☆" }));
    await waitFor(() => expect(mockAddFavorite).toHaveBeenCalledWith(gpu.id));
    expect(onFavoriteToggle).toHaveBeenCalled();
  });

  it("calls removeFavorite when favorited star clicked", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "User" } });
    mockRemoveFavorite.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <GpuCard gpu={{ ...gpu, favorited: true }} onFavoriteToggle={vi.fn()} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "★" }));
    await waitFor(() => expect(mockRemoveFavorite).toHaveBeenCalledWith(gpu.id));
  });

  it("handles favorite error gracefully", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({ user: { id: 1, name: "User" } });
    mockAddFavorite.mockRejectedValueOnce(new Error("Network error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <GpuCard gpu={{ ...gpu, favorited: false }} onFavoriteToggle={vi.fn()} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "☆" }));
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });

  it("navigates to gpu detail on card click", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByRole("article"));
    expect(mockNavigate).toHaveBeenCalledWith(`/gpus/${gpu.id}`);
  });

  it("navigates on Enter key press", async () => {
    const user = userEvent.setup();
    renderCard();
    const article = screen.getByRole("article");
    await user.type(article, "{enter}");
    expect(mockNavigate).toHaveBeenCalledWith(`/gpus/${gpu.id}`);
  });

  it("navigates on Space key press", async () => {
    const user = userEvent.setup();
    renderCard();
    const article = screen.getByRole("article");
    await user.type(article, " ");
    expect(mockNavigate).toHaveBeenCalledWith(`/gpus/${gpu.id}`);
  });

  it("does not navigate on other key presses", () => {
    renderCard();
    const article = screen.getByRole("article");
    fireEvent.keyDown(article, { key: "a", code: "KeyA" });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("opens Amazon link on button click", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByRole("button", { name: "Amazon" }));
    expect(window.open).toHaveBeenCalled();
  });

  it("opens Rakuten link on button click", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByRole("button", { name: "楽天" }));
    expect(window.open).toHaveBeenCalled();
  });

  it("does nothing when favorite clicked without user", async () => {
    // GpuCard only renders favorite button when user exists, so this is a no-op case
    renderCard({}, null);
    expect(screen.queryByRole("button", { name: /★|☆/ })).not.toBeInTheDocument();
  });
});
