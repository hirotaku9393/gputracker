import React from "react";
import type { SortOption } from "../types";

interface Props {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  manufacturer: string;
  onManufacturerChange: (m: string) => void;
  priceMin: string;
  onPriceMinChange: (v: string) => void;
  priceMax: string;
  onPriceMaxChange: (v: string) => void;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "人気順", value: "popularity" },
  { label: "価格が安い順", value: "price_asc" },
  { label: "価格が高い順", value: "price_desc" },
  { label: "性能順", value: "performance" },
  { label: "名前順", value: "name" },
];

const MANUFACTURERS = [
  { label: "すべて", value: "" },
  { label: "NVIDIA", value: "NVIDIA" },
  { label: "AMD", value: "AMD" },
  { label: "Intel", value: "Intel" },
];

const PRICE_MIN = 0;
const PRICE_MAX = 500000;
const PRICE_STEP = 5000;

function formatPrice(price: number): string {
  if (price >= 10000) {
    return `${(price / 10000).toFixed(price % 10000 === 0 ? 0 : 1)}万`;
  }
  return `¥${price.toLocaleString()}`;
}

export default function FilterBar({
  sort,
  onSortChange,
  manufacturer,
  onManufacturerChange,
  priceMin,
  onPriceMinChange,
  priceMax,
  onPriceMaxChange,
}: Props) {
  const minVal = priceMin ? Number(priceMin) : PRICE_MIN;
  const maxVal = priceMax ? Number(priceMax) : PRICE_MAX;

  const minPercent = ((minVal - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPercent = ((maxVal - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div className="filter-glass rounded-xl p-5 mb-6">
      <div className="flex flex-wrap gap-5 items-end">
        {/* 並び替え */}
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1.5 tracking-wide">
            並び替え
          </label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-900">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* メーカー */}
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1.5 tracking-wide">
            メーカー
          </label>
          <div className="flex gap-1">
            {MANUFACTURERS.map((m) => (
              <button
                key={m.value}
                onClick={() => onManufacturerChange(m.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  manufacturer === m.value
                    ? "bg-white text-gray-900 shadow-md"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 価格帯スライダー */}
        <div className="flex-1 min-w-64">
          <label className="block text-gray-400 text-xs font-medium mb-1.5 tracking-wide">
            価格帯
          </label>
          <div className="px-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold text-sm">
                ¥{minVal.toLocaleString()}
              </span>
              <span className="text-gray-500 text-xs">〜</span>
              <span className="text-white font-bold text-sm">
                {maxVal >= PRICE_MAX ? "上限なし" : `¥${maxVal.toLocaleString()}`}
              </span>
            </div>

            {/* デュアルスライダー */}
            <div className="relative h-6 flex items-center">
              {/* トラック背景 */}
              <div className="absolute w-full h-1.5 rounded-full bg-white/5" />
              {/* アクティブ範囲 */}
              <div
                className="absolute h-1.5 rounded-full"
                style={{
                  left: `${minPercent}%`,
                  width: `${maxPercent - minPercent}%`,
                  background: "linear-gradient(90deg, #a3a3a3, #ffffff)",
                }}
              />
              {/* 最低価格スライダー */}
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={minVal}
                onChange={(e) => {
                  const v = Math.min(Number(e.target.value), maxVal - PRICE_STEP);
                  onPriceMinChange(v <= PRICE_MIN ? "" : String(v));
                }}
                className="price-slider absolute w-full z-10"
                style={{ pointerEvents: "auto" }}
              />
              {/* 最高価格スライダー */}
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={maxVal}
                onChange={(e) => {
                  const v = Math.max(Number(e.target.value), minVal + PRICE_STEP);
                  onPriceMaxChange(v >= PRICE_MAX ? "" : String(v));
                }}
                className="price-slider absolute w-full z-20"
                style={{ pointerEvents: "auto" }}
              />
            </div>

            {/* 目盛り */}
            <div className="flex justify-between mt-1 text-[10px] text-gray-600">
              <span>¥0</span>
              <span>10万</span>
              <span>20万</span>
              <span>30万</span>
              <span>40万</span>
              <span>50万</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
