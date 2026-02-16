import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import GpuListPage from "./pages/GpuListPage";
import GpuDetailPage from "./pages/GpuDetailPage";
import FavoritesPage from "./pages/FavoritesPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-bg">
          <Navbar />
          <Routes>
            <Route path="/" element={<GpuListPage />} />
            <Route path="/gpus/:id" element={<GpuDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
