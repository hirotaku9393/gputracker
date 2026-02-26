import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import React from "react";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";

const mockFetchMe = vi.fn();
vi.mock("../../api/client", () => ({
  fetchMe: (...args: unknown[]) => mockFetchMe(...args),
}));

function TestConsumer() {
  const { user, loading, refresh } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : "null"}</span>
      <button onClick={refresh}>refresh</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts loading and then resolves user", async () => {
    const user = { id: 1, email: "test@example.com", name: "Test", avatar_url: null };
    mockFetchMe.mockResolvedValueOnce(user);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("loading").textContent).toBe("true");

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
      expect(screen.getByTestId("user").textContent).toBe("test@example.com");
    });
  });

  it("sets user to null when fetchMe returns null", async () => {
    mockFetchMe.mockResolvedValueOnce(null);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("null");
    });
  });

  it("sets user to null on fetch error", async () => {
    mockFetchMe.mockRejectedValueOnce(new Error("Network error"));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
      expect(screen.getByTestId("user").textContent).toBe("null");
    });
  });

  it("refresh re-fetches user", async () => {
    const user = { id: 1, email: "test@example.com", name: "Test", avatar_url: null };
    mockFetchMe.mockResolvedValueOnce(null).mockResolvedValueOnce(user);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    await act(async () => {
      screen.getByRole("button", { name: "refresh" }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("test@example.com");
    });
  });

  it("default context refresh is a no-op callable function", async () => {
    // Render outside of AuthProvider to get the default context value
    let capturedRefresh: (() => Promise<void>) | undefined;
    function Capturer() {
      const { refresh } = useAuth();
      capturedRefresh = refresh;
      return null;
    }
    render(<Capturer />);
    // The default context refresh should be callable without errors
    await capturedRefresh?.();
  });

  it("useAuth returns context values", async () => {
    mockFetchMe.mockResolvedValueOnce(null);
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
  });
});
