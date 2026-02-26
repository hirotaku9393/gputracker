import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import React from "react";
import { ToastProvider, useToast } from "../../contexts/ToastContext";

function ToastTrigger({ type }: { type?: "error" | "success" | "info" }) {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast("Test message", type)}>
      Show Toast
    </button>
  );
}

describe("ToastContext", () => {
  it("shows error toast", () => {
    render(
      <ToastProvider>
        <ToastTrigger type="error" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByText("Test message").className).toContain("bg-red-500");
  });

  it("shows success toast", () => {
    render(
      <ToastProvider>
        <ToastTrigger type="success" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByText("Test message").className).toContain("bg-green-500");
  });

  it("shows info toast", () => {
    render(
      <ToastProvider>
        <ToastTrigger type="info" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByText("Test message").className).toContain("bg-blue-500");
  });

  it("defaults to error type when no type specified", () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByText("Test message").className).toContain("bg-red-500");
  });

  it("removes toast after 4 seconds", async () => {
    vi.useFakeTimers();
    try {
      render(
        <ToastProvider>
          <ToastTrigger type="info" />
        </ToastProvider>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByText("Test message")).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(4001);
      });

      expect(screen.queryByText("Test message")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("default context showToast is callable without errors", () => {
    // Render outside of ToastProvider to get the default context value
    let capturedShowToast: ((msg: string) => void) | undefined;
    function Capturer() {
      capturedShowToast = useToast().showToast;
      return null;
    }
    render(<Capturer />);
    // The default context showToast should not throw
    expect(() => capturedShowToast?.("test")).not.toThrow();
  });

  it("useToast returns context", () => {
    let captured: ReturnType<typeof useToast> | undefined;
    function Capturer() {
      captured = useToast();
      return null;
    }
    render(
      <ToastProvider>
        <Capturer />
      </ToastProvider>
    );
    expect(captured?.showToast).toBeTypeOf("function");
  });
});
