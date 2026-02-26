import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import React from "react";
import FilterBar from "../../components/FilterBar";
import type { SortOption } from "../../types";

const defaultProps = {
  query: "",
  onQueryChange: vi.fn(),
  sort: "popularity" as SortOption,
  onSortChange: vi.fn(),
  manufacturer: "",
  onManufacturerChange: vi.fn(),
  priceMin: "",
  onPriceMinChange: vi.fn(),
  priceMax: "",
  onPriceMaxChange: vi.fn(),
};

describe("FilterBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders keyword search input", () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByPlaceholderText(/GPU名・シリーズ名で検索/i)).toBeInTheDocument();
  });

  it("renders sort select with options", () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "人気順" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "価格が安い順" })).toBeInTheDocument();
  });

  it("renders manufacturer buttons", () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByRole("button", { name: "NVIDIA" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AMD" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Intel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
  });

  it("calls onQueryChange after debounce", () => {
    vi.useFakeTimers();
    try {
      render(<FilterBar {...defaultProps} />);
      const input = screen.getByPlaceholderText(/GPU名・シリーズ名で検索/i);
      fireEvent.change(input, { target: { value: "RTX" } });
      act(() => { vi.advanceTimersByTime(400); });
      expect(defaultProps.onQueryChange).toHaveBeenCalledWith("RTX");
    } finally {
      vi.useRealTimers();
    }
  });

  it("calls onSortChange when sort changed", () => {
    render(<FilterBar {...defaultProps} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "price_asc" } });
    expect(defaultProps.onSortChange).toHaveBeenCalledWith("price_asc");
  });

  it("calls onManufacturerChange when manufacturer button clicked", () => {
    render(<FilterBar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "NVIDIA" }));
    expect(defaultProps.onManufacturerChange).toHaveBeenCalledWith("NVIDIA");
  });

  it("calls onManufacturerChange with empty string for すべて", () => {
    render(<FilterBar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "すべて" }));
    expect(defaultProps.onManufacturerChange).toHaveBeenCalledWith("");
  });

  it("syncs localQuery when parent query prop changes", () => {
    const { rerender } = render(<FilterBar {...defaultProps} query="" />);
    rerender(<FilterBar {...defaultProps} query="RTX" />);
    const input = screen.getByPlaceholderText(/GPU名・シリーズ名で検索/i) as HTMLInputElement;
    expect(input.value).toBe("RTX");
  });

  it("calls onPriceMinChange with value string when min slider changes above min", () => {
    render(<FilterBar {...defaultProps} priceMax="300000" />);
    const [minSlider] = screen.getAllByRole("slider");
    fireEvent.change(minSlider, { target: { value: "100000" } });
    expect(defaultProps.onPriceMinChange).toHaveBeenCalledWith("100000");
  });

  it("calls onPriceMinChange with empty string when min slider reaches minimum", () => {
    // Start with priceMin set so the slider is not already at min
    render(<FilterBar {...defaultProps} priceMin="5000" priceMax="300000" />);
    const [minSlider] = screen.getAllByRole("slider");
    fireEvent.change(minSlider, { target: { value: "0" } });
    expect(defaultProps.onPriceMinChange).toHaveBeenCalledWith("");
  });

  it("renders with priceMin set showing correct minVal", () => {
    render(<FilterBar {...defaultProps} priceMin="100000" priceMax="300000" />);
    const [minSlider] = screen.getAllByRole("slider") as HTMLInputElement[];
    expect(minSlider.value).toBe("100000");
  });

  it("calls onPriceMaxChange with value string when max slider changes below max", () => {
    render(<FilterBar {...defaultProps} />);
    const sliders = screen.getAllByRole("slider");
    const maxSlider = sliders[1];
    fireEvent.change(maxSlider, { target: { value: "200000" } });
    expect(defaultProps.onPriceMaxChange).toHaveBeenCalledWith("200000");
  });

  it("calls onPriceMaxChange with empty string when max slider reaches maximum", () => {
    // Start with priceMax set so the slider is not already at max
    render(<FilterBar {...defaultProps} priceMax="300000" />);
    const sliders = screen.getAllByRole("slider");
    const maxSlider = sliders[1];
    // Simulate dragging the max slider to PRICE_MAX (500000)
    fireEvent.change(maxSlider, { target: { value: "500000" } });
    expect(defaultProps.onPriceMaxChange).toHaveBeenCalledWith("");
  });

  it("shows upper limit label when priceMax is at max", () => {
    render(<FilterBar {...defaultProps} priceMax="" />);
    expect(screen.getByText("上限なし")).toBeInTheDocument();
  });

  it("shows formatted price when priceMax is set", () => {
    render(<FilterBar {...defaultProps} priceMax="200000" />);
    expect(screen.getByText("¥200,000")).toBeInTheDocument();
  });

  it("selected manufacturer button has active styling", () => {
    render(<FilterBar {...defaultProps} manufacturer="AMD" />);
    const amdBtn = screen.getByRole("button", { name: "AMD" });
    expect(amdBtn.className).toContain("bg-white");
  });
});
