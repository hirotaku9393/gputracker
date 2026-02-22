import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Gpu } from "../types";
import { fetchGpu, addFavorite, removeFavorite } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import PriceChart from "../components/PriceChart";
import GpuImage from "../components/GpuImage";

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

function buildSearchUrl(store: "amazon" | "rakuten", gpuName: string): string {
  const query = encodeURIComponent(gpuName);
  switch (store) {
    case "amazon":
      return `https://www.amazon.co.jp/s?k=${query}`;
    case "rakuten":
      return `https://search.rakuten.co.jp/search/mall/${query}/`;
  }
}

export default function GpuDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [gpu, setGpu] = useState<Gpu | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadGpu = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchGpu(Number(id));
      setGpu(data);
    } catch (err) {
      console.error("GPU詳細の取得に失敗しました", err);
      showToast("GPU情報の取得に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGpu();
  }, [id]);

  const handleFavorite = async () => {
    if (!gpu || !user) return;
    try {
      if (gpu.favorited) {
        await removeFavorite(gpu.id);
      } else {
        await addFavorite(gpu.id);
      }
      loadGpu();
    } catch (err) {
      console.error("お気に入り操作に失敗しました", err);
      showToast("お気に入りの操作に失敗しました", "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">
        読み込み中...
      </div>
    );
  }

  if (!gpu) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">
        GPUが見つかりませんでした
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm mb-4 transition bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        GPU一覧に戻る
      </button>

      <div className="card-glass rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="rounded-lg overflow-hidden">
              <GpuImage
                name={gpu.name}
                series={gpu.series}
                manufacturer={gpu.manufacturer}
                vram={gpu.vram}
                imageUrl={gpu.image_url}
                className="h-64"
              />
            </div>
          </div>
          <div className="md:w-2/3">
            <div className="flex items-start justify-between">
              <h1 className="text-lg sm:text-2xl font-bold text-white mb-2">{gpu.name}</h1>
              {user && (
                <button
                  onClick={handleFavorite}
                  className={`text-3xl transition ${
                    gpu.favorited
                      ? "text-yellow-400"
                      : "text-gray-400 hover:text-yellow-400"
                  }`}
                >
                  {gpu.favorited ? "\u2605" : "\u2606"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-gray-400 text-sm">メーカー</span>
                <p className="text-white">{gpu.manufacturer}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">シリーズ</span>
                <p className="text-white">{gpu.series}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">VRAM</span>
                <p className="text-white">{gpu.vram} GB</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">ベンチマークスコア</span>
                <p className="text-white">
                  {gpu.benchmark_score?.toLocaleString() ?? "-"}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">現在価格</span>
                <p className="text-white text-xl sm:text-2xl font-bold">
                  {gpu.current_price > 0 ? formatPrice(gpu.current_price) : "未取得"}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">コスパ</span>
                <p className="text-amber-400 font-bold text-lg sm:text-xl">
                  {gpu.cost_performance > 0 ? gpu.cost_performance.toFixed(1) : "-"}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">お気に入り数</span>
                <p className="text-white">{gpu.popularity}</p>
              </div>
            </div>

            {/* 購入リンク */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-gray-400 text-xs mb-3">ショップで探す</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={buildSearchUrl("amazon", gpu.series)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition bg-amber-600 hover:bg-amber-500 text-white shadow-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M.045 18.02c.07-.116.36-.37.87-.756C3.26 15.405 6.09 13.1 8.37 11.96c.27-.13.53-.2.76-.2.39 0 .67.2.67.59 0 .33-.2.72-.54 1.05-1.33 1.3-3.04 2.7-4.87 3.82-.34.21-.5.39-.5.54 0 .21.23.37.67.37.73 0 2.04-.48 3.81-1.43 2.34-1.26 4.32-2.88 5.74-4.56.34-.4.7-.59 1.05-.59.34 0 .59.18.59.52 0 .26-.13.57-.4.93-1.59 2.07-3.87 3.97-6.39 5.35-1.98 1.09-3.73 1.63-5.11 1.63-1.14 0-1.9-.37-2.3-1.03-.14-.24-.21-.5-.21-.76 0-.17.02-.33.07-.49zm13.11-9.47c-.2 0-.38.08-.55.24l-1.44 1.44c-.18.18-.26.36-.26.55 0 .4.32.72.72.72.2 0 .38-.08.55-.26l1.44-1.44c.18-.17.26-.35.26-.55 0-.4-.32-.7-.72-.7zm7.84 3.17c0-.55-.14-1-.42-1.34-.28-.34-.64-.51-1.08-.51-.44 0-.85.19-1.21.56l-4.05 4.05c-.54.54-.81 1.09-.81 1.65 0 .55.14 1 .42 1.34.28.34.64.51 1.08.51.44 0 .85-.19 1.21-.56l4.05-4.05c.54-.54.81-1.09.81-1.65z"/></svg>
                  Amazon.co.jp
                </a>
                <a
                  href={buildSearchUrl("rakuten", gpu.series)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition bg-red-600 hover:bg-red-500 text-white shadow-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  楽天市場
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PriceChart gpuId={gpu.id} />

      <div className="flex justify-center mt-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm transition bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        GPU一覧に戻る
      </button>
      </div>
    </div>
  );
}
