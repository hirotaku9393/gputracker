import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import ScrollToTopButton from "../../components/ScrollToTopButton";

describe("ScrollToTopButton", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", { writable: true, value: 0 });
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is hidden on initial render (scrollY = 0)", () => {
    render(<ScrollToTopButton />);
    const btn = screen.getByRole("button", { name: "ページトップへ戻る" });
    expect(btn).toHaveClass("opacity-0");
    expect(btn).toHaveClass("pointer-events-none");
  });

  it("becomes visible when scrollY > 300", () => {
    render(<ScrollToTopButton />);
    act(() => {
      window.scrollY = 301;
      window.dispatchEvent(new Event("scroll"));
    });
    const btn = screen.getByRole("button", { name: "ページトップへ戻る" });
    expect(btn).toHaveClass("opacity-100");
    expect(btn).not.toHaveClass("pointer-events-none");
  });

  it("hides again when scrollY drops to 0", () => {
    render(<ScrollToTopButton />);
    act(() => {
      window.scrollY = 400;
      window.dispatchEvent(new Event("scroll"));
    });
    act(() => {
      window.scrollY = 0;
      window.dispatchEvent(new Event("scroll"));
    });
    const btn = screen.getByRole("button", { name: "ページトップへ戻る" });
    expect(btn).toHaveClass("opacity-0");
  });

  it("calls window.scrollTo on click", () => {
    render(<ScrollToTopButton />);
    act(() => {
      window.scrollY = 500;
      window.dispatchEvent(new Event("scroll"));
    });
    fireEvent.click(screen.getByRole("button", { name: "ページトップへ戻る" }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("removes scroll listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<ScrollToTopButton />);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });
});
