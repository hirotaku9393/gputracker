import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function getCsrfToken(): string {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";
}

function GoogleLoginForm({ className }: { className?: string }) {
  return (
    <form action="/auth/google_oauth2" method="post">
      <input type="hidden" name="authenticity_token" value={getCsrfToken()} />
      <button
        type="submit"
        className={className ?? "bg-white text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition shadow-md"}
      >
        Googleでログイン
      </button>
    </form>
  );
}

export default function Navbar() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="nav-glass text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link to="/" className="text-lg sm:text-xl font-bold text-white">
              GPU Tracker
            </Link>
            <div className="hidden sm:flex items-center space-x-4">
              <Link to="/" className="text-gray-300 hover:text-white transition text-sm">
                GPU一覧
              </Link>
              {user && (
                <Link to="/favorites" className="text-gray-300 hover:text-white transition text-sm">
                  お気に入り
                </Link>
              )}
            </div>
          </div>

          {/* デスクトップ: ログイン */}
          <div className="hidden sm:flex items-center space-x-4">
            {loading ? null : user ? (
              <div className="flex items-center space-x-3">
                {user.avatar_url && (
                  <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm text-gray-300">{user.name}</span>
                <a
                  href="/logout"
                  className="text-sm text-red-400 hover:text-red-300"
                  onClick={(e) => { e.preventDefault(); window.location.href = "/logout"; }}
                >
                  ログアウト
                </a>
              </div>
            ) : (
              <GoogleLoginForm />
            )}
          </div>

          {/* モバイル: ハンバーガー */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 text-gray-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/6 px-4 py-3 space-y-2">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2 text-sm">
            GPU一覧
          </Link>
          {user && (
            <Link to="/favorites" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2 text-sm">
              お気に入り
            </Link>
          )}
          <div className="pt-2 border-t border-white/6">
            {loading ? null : user ? (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  {user.avatar_url && (
                    <img src={user.avatar_url} alt={user.name} className="w-7 h-7 rounded-full" />
                  )}
                  <span className="text-sm text-gray-300">{user.name}</span>
                </div>
                <a
                  href="/logout"
                  className="text-sm text-red-400 hover:text-red-300"
                  onClick={(e) => { e.preventDefault(); window.location.href = "/logout"; }}
                >
                  ログアウト
                </a>
              </div>
            ) : (
              <GoogleLoginForm className="block w-full text-center bg-white text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition shadow-md" />
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
