import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchFavorites } from "../api/client";
import type { Gpu } from "../types";
import GpuCard from "../components/GpuCard";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [gpus, setGpus] = useState<Gpu[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await fetchFavorites();
      setGpus(data.map((fav) => fav.gpu));
    } catch (err) {
      console.error("お気に入りの取得に失敗しました", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadFavorites();
    else setLoading(false);
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">
        お気に入り機能を使うにはログインしてください
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">お気に入り</h1>
      {loading ? (
        <div className="text-center text-gray-400 py-12">読み込み中...</div>
      ) : gpus.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          お気に入りに登録されたGPUはありません
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gpus.map((gpu) => (
            <GpuCard key={gpu.id} gpu={gpu} onFavoriteToggle={loadFavorites} />
          ))}
        </div>
      )}
    </div>
  );
}
