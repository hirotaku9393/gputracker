import React from "react";

interface Props {
  name: string;
  series: string;
  manufacturer: string;
  vram: number;
  imageUrl: string | null;
  className?: string;
}

const BRAND_CONFIGS: Record<string, { gradient: string; accent: string; logo: string }> = {
  NVIDIA: {
    gradient: "from-gray-900 via-gray-800 to-green-950",
    accent: "#76b900",
    logo: "NVIDIA",
  },
  AMD: {
    gradient: "from-gray-900 via-gray-800 to-red-950",
    accent: "#ed1c24",
    logo: "AMD",
  },
  Intel: {
    gradient: "from-gray-900 via-gray-800 to-blue-950",
    accent: "#0071c5",
    logo: "INTEL",
  },
};

export default function GpuImage({ name, series, manufacturer, vram, imageUrl, className = "" }: Props) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`w-full h-48 object-contain bg-white p-2 ${className}`}
      />
    );
  }

  const config = BRAND_CONFIGS[manufacturer] || BRAND_CONFIGS.NVIDIA;

  return (
    <div className={`w-full h-48 bg-gradient-to-br ${config.gradient} flex flex-col items-center justify-center relative overflow-hidden ${className}`}>
      {/* 背景パターン */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`grid-${series.replace(/\s/g, "")}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={config.accent} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${series.replace(/\s/g, "")})`} />
      </svg>

      {/* グラフィックボード風のシルエット */}
      <svg className="relative w-32 h-20 mb-2 drop-shadow-lg" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* カード本体 */}
        <rect x="5" y="10" width="150" height="70" rx="6" fill={config.accent} fillOpacity="0.15" stroke={config.accent} strokeWidth="1.5" />
        {/* ファン1 */}
        <circle cx="50" cy="45" r="22" fill="none" stroke={config.accent} strokeWidth="1" strokeOpacity="0.6" />
        <circle cx="50" cy="45" r="14" fill="none" stroke={config.accent} strokeWidth="0.8" strokeOpacity="0.4" />
        <circle cx="50" cy="45" r="4" fill={config.accent} fillOpacity="0.5" />
        {/* ファンブレード1 */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <line
            key={`f1-${angle}`}
            x1="50"
            y1="45"
            x2={50 + 20 * Math.cos((angle * Math.PI) / 180)}
            y2={45 + 20 * Math.sin((angle * Math.PI) / 180)}
            stroke={config.accent}
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />
        ))}
        {/* ファン2 */}
        <circle cx="110" cy="45" r="22" fill="none" stroke={config.accent} strokeWidth="1" strokeOpacity="0.6" />
        <circle cx="110" cy="45" r="14" fill="none" stroke={config.accent} strokeWidth="0.8" strokeOpacity="0.4" />
        <circle cx="110" cy="45" r="4" fill={config.accent} fillOpacity="0.5" />
        {/* ファンブレード2 */}
        {[30, 90, 150, 210, 270, 330].map((angle) => (
          <line
            key={`f2-${angle}`}
            x1="110"
            y1="45"
            x2={110 + 20 * Math.cos((angle * Math.PI) / 180)}
            y2={45 + 20 * Math.sin((angle * Math.PI) / 180)}
            stroke={config.accent}
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />
        ))}
        {/* ヒートシンク */}
        {[15, 22, 29, 131, 138, 145].map((x) => (
          <rect key={`hs-${x}`} x={x} y="82" width="4" height="8" rx="1" fill={config.accent} fillOpacity="0.2" />
        ))}
        {/* PCIeコネクタ */}
        <rect x="30" y="82" width="100" height="6" rx="2" fill={config.accent} fillOpacity="0.1" stroke={config.accent} strokeWidth="0.5" strokeOpacity="0.3" />
        {/* 電源コネクタ */}
        <rect x="140" y="18" width="12" height="20" rx="2" fill={config.accent} fillOpacity="0.15" stroke={config.accent} strokeWidth="0.5" strokeOpacity="0.4" />
      </svg>

      {/* モデル名 */}
      <div className="relative text-center z-10">
        <p className="text-xs font-bold tracking-widest opacity-40" style={{ color: config.accent }}>
          {config.logo}
        </p>
        <p className="text-sm font-bold text-white/90 tracking-wide">
          {series}
        </p>
        <p className="text-[10px] text-white/40 mt-0.5">
          {vram}GB GDDR6X
        </p>
      </div>

      {/* コーナーアクセント */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
        <div
          className="absolute -top-8 -right-8 w-16 h-16 rotate-45"
          style={{ background: `linear-gradient(135deg, transparent 50%, ${config.accent}20 50%)` }}
        />
      </div>
    </div>
  );
}
