import React from "react";
import { Link } from "react-router-dom";
import type { Gpu } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { addFavorite, removeFavorite } from "../api/client";
import GpuImage from "./GpuImage";

interface Props {
  gpu: Gpu;
  onFavoriteToggle?: () => void;
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

function manufacturerBadge(manufacturer: string): string {
  switch (manufacturer) {
    case "NVIDIA":
      return "badge-nvidia";
    case "AMD":
      return "badge-amd";
    case "Intel":
      return "badge-intel";
    default:
      return "bg-gray-600";
  }
}

export default function GpuCard({ gpu, onFavoriteToggle }: Props) {
  const { user } = useAuth();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      if (gpu.favorited) {
        await removeFavorite(gpu.id);
      } else {
        await addFavorite(gpu.id);
      }
      onFavoriteToggle?.();
    } catch (err) {
      console.error("お気に入り操作に失敗しました", err);
    }
  };

  return (
    <Link
      to={`/gpus/${gpu.id}`}
      className="block card-glass rounded-xl shadow-md card-glow overflow-hidden"
    >
      <div className="relative">
        <GpuImage
          name={gpu.name}
          series={gpu.series}
          manufacturer={gpu.manufacturer}
          vram={gpu.vram}
          imageUrl={gpu.image_url}
        />
        <span
          className={`absolute top-2 left-2 text-xs text-white px-2.5 py-1 rounded-md font-medium shadow-lg ${manufacturerBadge(gpu.manufacturer)}`}
        >
          {gpu.manufacturer}
        </span>
        {user && (
          <button
            onClick={handleFavorite}
            className={`absolute top-2 right-2 text-2xl transition ${
              gpu.favorited
                ? "text-yellow-400"
                : "text-gray-400 hover:text-yellow-400"
            }`}
          >
            {gpu.favorited ? "\u2605" : "\u2606"}
          </button>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 truncate">
          {gpu.name}
        </h3>
        <p className="text-gray-400 text-[10px] sm:text-xs mb-2 truncate">
          {gpu.series} / VRAM {gpu.vram}GB
        </p>
        <div className="flex items-center justify-between gap-1">
          <span className="text-white font-bold text-sm sm:text-lg">
            {gpu.current_price > 0 ? formatPrice(gpu.current_price) : "価格未取得"}
          </span>
          <span className="text-gray-400 text-[10px] sm:text-xs shrink-0">
            Score: {gpu.benchmark_score?.toLocaleString() ?? "-"}
          </span>
        </div>
        {gpu.cost_performance > 0 && (
          <div className="mt-1 sm:mt-1.5 flex items-center gap-1.5">
            <span className="text-gray-500 text-[10px] sm:text-xs">コスパ</span>
            <span className="text-amber-400 font-semibold text-xs sm:text-sm">{gpu.cost_performance.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
