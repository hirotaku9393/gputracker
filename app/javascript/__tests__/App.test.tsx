import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

const mockShowToast = vi.fn();
vi.mock("../contexts/ToastContext", () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock("../contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../components/Navbar", () => ({
  default: () => <nav data-testid="navbar" />,
}));

vi.mock("../pages/GpuListPage", () => ({
  default: () => <div data-testid="gpu-list-page" />,
}));

vi.mock("../pages/GpuDetailPage", () => ({
  default: () => <div data-testid="gpu-detail-page" />,
}));

vi.mock("../pages/FavoritesPage", () => ({
  default: () => <div data-testid="favorites-page" />,
}));

import App from "../App";

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, "", "/");
  });

  it("renders navbar and gpu list page at root", () => {
    render(<App />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("gpu-list-page")).toBeInTheDocument();
  });

  it("shows error toast when ?error=login_failed in URL", async () => {
    window.history.pushState({}, "", "/?error=login_failed");
    render(<App />);
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "Googleログインに失敗しました。再度お試しください。",
        "error"
      );
    });
  });

  it("does not show error toast when no error param", async () => {
    render(<App />);
    await new Promise((r) => setTimeout(r, 50));
    expect(mockShowToast).not.toHaveBeenCalled();
  });
});
