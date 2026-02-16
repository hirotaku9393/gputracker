import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <nav className="nav-glass text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xl font-bold text-white">
              GPU Tracker
            </Link>
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition"
            >
              GPU一覧
            </Link>
            {user && (
              <Link
                to="/favorites"
                className="text-gray-300 hover:text-white transition"
              >
                お気に入り
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {loading ? null : user ? (
              <div className="flex items-center space-x-3">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-300">{user.name}</span>
                <a
                  href="/logout"
                  data-method="delete"
                  className="text-sm text-red-400 hover:text-red-300"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/logout";
                  }}
                >
                  ログアウト
                </a>
              </div>
            ) : (
              <a
                href="/auth/google_oauth2"
                className="bg-white text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition shadow-md"
              >
                Googleでログイン
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
