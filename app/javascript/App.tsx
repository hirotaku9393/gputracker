import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import Navbar from "./components/Navbar";
import GpuListPage from "./pages/GpuListPage";
import GpuDetailPage from "./pages/GpuDetailPage";
import FavoritesPage from "./pages/FavoritesPage";

function AuthErrorHandler() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    if (searchParams.get("error") === "login_failed") {
      showToast("Googleログインに失敗しました。再度お試しください。", "error");
      const next = new URLSearchParams(searchParams);
      next.delete("error");
      setSearchParams(next, { replace: true });
    }
  }, []);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthErrorHandler />
          <div className="app-bg">
            <Navbar />
            <Routes>
              <Route path="/" element={<GpuListPage />} />
              <Route path="/gpus/:id" element={<GpuDetailPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
