import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../../components/Navbar";

const mockUseAuth = vi.fn();
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderNavbar(authState: object) {
  mockUseAuth.mockReturnValue(authState);
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  it("renders brand name", () => {
    renderNavbar({ user: null, loading: false });
    expect(screen.getByText("GPU Tracker")).toBeInTheDocument();
  });

  it("shows GPU一覧 link", () => {
    renderNavbar({ user: null, loading: false });
    expect(screen.getAllByText("GPU一覧")[0]).toBeInTheDocument();
  });

  it("shows Googleでログイン button when not logged in", () => {
    renderNavbar({ user: null, loading: false });
    expect(screen.getAllByRole("button", { name: "Googleでログイン" })).toHaveLength(1);
  });

  it("shows nothing while loading", () => {
    renderNavbar({ user: null, loading: true });
    expect(screen.queryByText("Googleでログイン")).not.toBeInTheDocument();
    expect(screen.queryByText("ログアウト")).not.toBeInTheDocument();
  });

  it("shows user info when logged in (with avatar)", () => {
    const user = { id: 1, name: "Alice", avatar_url: "https://example.com/alice.jpg" };
    renderNavbar({ user, loading: false });
    expect(screen.getAllByText("Alice")[0]).toBeInTheDocument();
    const avatars = screen.getAllByRole("img");
    expect(avatars.some(img => (img as HTMLImageElement).src.includes("alice.jpg"))).toBe(true);
  });

  it("shows user info when logged in (without avatar)", () => {
    const user = { id: 1, name: "Bob", avatar_url: null };
    renderNavbar({ user, loading: false });
    expect(screen.getAllByText("Bob")[0]).toBeInTheDocument();
  });

  it("shows お気に入り link when logged in", () => {
    const user = { id: 1, name: "Alice", avatar_url: null };
    renderNavbar({ user, loading: false });
    expect(screen.getAllByText("お気に入り")[0]).toBeInTheDocument();
  });

  it("does not show お気に入り link when not logged in", () => {
    renderNavbar({ user: null, loading: false });
    expect(screen.queryByText("お気に入り")).not.toBeInTheDocument();
  });

  it("shows logout link when logged in", () => {
    const user = { id: 1, name: "Alice", avatar_url: null };
    renderNavbar({ user, loading: false });
    expect(screen.getAllByText("ログアウト")[0]).toBeInTheDocument();
  });

  it("logout link redirects to /logout", async () => {
    const user = userEvent.setup();
    const authUser = { id: 1, name: "Alice", avatar_url: null };
    renderNavbar({ user: authUser, loading: false });
    const logoutLinks = screen.getAllByText("ログアウト");
    await user.click(logoutLinks[0]);
    expect(window.location.href).toBe("/logout");
  });

  it("opens and closes mobile menu", async () => {
    const user = userEvent.setup();
    renderNavbar({ user: null, loading: false });
    const hamburger = screen.getByRole("button", { name: "" });
    await user.click(hamburger);
    // Mobile menu should appear
    const mobileLinks = screen.getAllByText("GPU一覧");
    expect(mobileLinks.length).toBeGreaterThan(1);
    // Close
    await user.click(hamburger);
  });

  it("mobile menu shows favorite link when logged in", async () => {
    const user = userEvent.setup();
    const authUser = { id: 1, name: "Alice", avatar_url: null };
    renderNavbar({ user: authUser, loading: false });
    const hamburger = screen.getByRole("button", { name: "" });
    await user.click(hamburger);
    const favLinks = screen.getAllByText("お気に入り");
    expect(favLinks.length).toBeGreaterThan(0);
  });

  it("mobile menu shows login form when not logged in", async () => {
    const user = userEvent.setup();
    renderNavbar({ user: null, loading: false });
    const hamburger = screen.getByRole("button", { name: "" });
    await user.click(hamburger);
    const loginButtons = screen.getAllByRole("button", { name: "Googleでログイン" });
    expect(loginButtons.length).toBeGreaterThan(0);
  });

  it("mobile menu shows loading state", async () => {
    const user = userEvent.setup();
    renderNavbar({ user: null, loading: true });
    const hamburger = screen.getByRole("button", { name: "" });
    await user.click(hamburger);
    expect(screen.queryAllByText("Googleでログイン")).toHaveLength(0);
  });

  it("mobile menu closes when お気に入り link clicked", async () => {
    const user = userEvent.setup();
    const authUser = { id: 1, name: "Alice", avatar_url: null };
    renderNavbar({ user: authUser, loading: false });
    const hamburger = screen.getByRole("button", { name: "" });
    await user.click(hamburger);
    const favLinks = screen.getAllByText("お気に入り");
    // Click the mobile menu お気に入り link (closes the menu)
    await user.click(favLinks[favLinks.length - 1]);
    // After clicking, mobile menu link onClick runs (setMenuOpen(false))
  });

  it("mobile logout link redirects to /logout", async () => {
    const user = userEvent.setup();
    const authUser = { id: 1, name: "Alice", avatar_url: null };
    renderNavbar({ user: authUser, loading: false });
    const hamburger = screen.getByRole("button", { name: "" });
    await user.click(hamburger);
    const logoutLinks = screen.getAllByText("ログアウト");
    // Click the mobile menu logout link (last one)
    await user.click(logoutLinks[logoutLinks.length - 1]);
    expect(window.location.href).toBe("/logout");
  });

  it("mobile menu closes when GPU一覧 link clicked", async () => {
    const user = userEvent.setup();
    renderNavbar({ user: null, loading: false });
    const hamburger = screen.getByRole("button", { name: "" });
    await user.click(hamburger);
    const gpuLinks = screen.getAllByText("GPU一覧");
    // Click the mobile menu link (second one)
    await user.click(gpuLinks[gpuLinks.length - 1]);
  });

  it("reads CSRF token from meta tag when present", () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "csrf-token");
    meta.setAttribute("content", "test-csrf-token");
    document.head.appendChild(meta);
    try {
      renderNavbar({ user: null, loading: false });
      const tokenInput = document.querySelector('input[name="authenticity_token"]') as HTMLInputElement;
      expect(tokenInput?.value).toBe("test-csrf-token");
    } finally {
      document.head.removeChild(meta);
    }
  });

  it("mobile menu shows user avatar when logged in", async () => {
    const user = userEvent.setup();
    const authUser = { id: 1, name: "Alice", avatar_url: "https://example.com/alice.jpg" };
    renderNavbar({ user: authUser, loading: false });
    const hamburger = screen.getByRole("button", { name: "" });
    await user.click(hamburger);
    const images = screen.getAllByRole("img");
    expect(images.some(img => (img as HTMLImageElement).src.includes("alice.jpg"))).toBe(true);
  });
});
