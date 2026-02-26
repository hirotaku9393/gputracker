import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import GpuImage from "../../components/GpuImage";

const baseProps = {
  name: "ASUS ROG STRIX RTX 4090",
  series: "RTX 4090",
  manufacturer: "NVIDIA",
  vram: 24,
  imageUrl: null,
};

describe("GpuImage", () => {
  it("renders an img tag when imageUrl is provided", () => {
    render(<GpuImage {...baseProps} imageUrl="https://example.com/gpu.jpg" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/gpu.jpg");
    expect(img).toHaveAttribute("alt", baseProps.name);
  });

  it("renders SVG placeholder for NVIDIA when no imageUrl", () => {
    const { container } = render(<GpuImage {...baseProps} manufacturer="NVIDIA" />);
    expect(container.querySelector("svg")).toBeTruthy();
    expect(screen.getByText("RTX 4090")).toBeInTheDocument();
    expect(screen.getByText("24GB")).toBeInTheDocument();
    expect(screen.getByText("GEFORCE")).toBeInTheDocument();
  });

  it("renders SVG placeholder for AMD", () => {
    const { container } = render(
      <GpuImage {...baseProps} manufacturer="AMD" series="RX 7900 XTX" />
    );
    expect(container.querySelector("svg")).toBeTruthy();
    expect(screen.getByText("RADEON")).toBeInTheDocument();
  });

  it("renders SVG placeholder for Intel", () => {
    const { container } = render(
      <GpuImage {...baseProps} manufacturer="Intel" series="Arc B580" />
    );
    expect(container.querySelector("svg")).toBeTruthy();
    expect(screen.getByText("ARC")).toBeInTheDocument();
  });

  it("falls back to NVIDIA config for unknown manufacturer", () => {
    const { container } = render(
      <GpuImage {...baseProps} manufacturer="Unknown" />
    );
    expect(container.querySelector("svg")).toBeTruthy();
    expect(screen.getByText("GEFORCE")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<GpuImage {...baseProps} className="custom-class" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("custom-class");
  });
});
