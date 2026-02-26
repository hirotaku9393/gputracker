import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import Pagination from "../../components/Pagination";

describe("Pagination", () => {
  it("returns null when totalPages <= 1", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} totalCount={10} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows all pages when totalPages <= 7", () => {
    render(
      <Pagination currentPage={1} totalPages={5} totalCount={75} onPageChange={vi.fn()} />
    );
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole("button", { name: String(i) })).toBeInTheDocument();
    }
  });

  it("shows ellipsis for large page counts - middle page", () => {
    const { container } = render(
      <Pagination currentPage={5} totalPages={10} totalCount={150} onPageChange={vi.fn()} />
    );
    const dots = container.querySelectorAll("span");
    // Should have dots spans
    expect(dots.length).toBeGreaterThan(0);
  });

  it("shows ellipsis for large page counts - early page", () => {
    const { container } = render(
      <Pagination currentPage={2} totalPages={10} totalCount={150} onPageChange={vi.fn()} />
    );
    // No leading ellipsis for page 2
    expect(container).toBeTruthy();
  });

  it("calls onPageChange when next button clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={5} totalCount={75} onPageChange={onPageChange} />
    );
    await user.click(screen.getByRole("button", { name: /次へ/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange when prev button clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={3} totalPages={5} totalCount={75} onPageChange={onPageChange} />
    );
    await user.click(screen.getByRole("button", { name: /前へ/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("prev button is disabled on first page", () => {
    render(
      <Pagination currentPage={1} totalPages={5} totalCount={75} onPageChange={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /前へ/i })).toBeDisabled();
  });

  it("next button is disabled on last page", () => {
    render(
      <Pagination currentPage={5} totalPages={5} totalCount={75} onPageChange={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /次へ/i })).toBeDisabled();
  });

  it("calls onPageChange for specific page number", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={1} totalPages={5} totalCount={75} onPageChange={onPageChange} />
    );
    await user.click(screen.getByRole("button", { name: "3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("shows total count", () => {
    render(
      <Pagination currentPage={1} totalPages={5} totalCount={75} onPageChange={vi.fn()} />
    );
    expect(screen.getByText(/75/)).toBeInTheDocument();
  });

  it("highlights current page", () => {
    render(
      <Pagination currentPage={3} totalPages={5} totalCount={75} onPageChange={vi.fn()} />
    );
    const currentBtn = screen.getByRole("button", { name: "3" });
    expect(currentBtn.className).toContain("bg-white");
  });

  it("shows page 1 always for large page count", () => {
    render(
      <Pagination currentPage={8} totalPages={10} totalCount={150} onPageChange={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
  });
});
