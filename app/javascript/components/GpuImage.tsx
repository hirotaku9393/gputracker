import React from "react";

interface Props {
  name: string;
  series: string;
  manufacturer: string;
  vram: number;
  imageUrl: string | null;
  className?: string;
}

const BRAND_CONFIGS: Record<string, { bg: string; accent: string; accentRgb: string; logo: string }> = {
  NVIDIA: {
    bg: "#1a1d1a",
    accent: "#76b900",
    accentRgb: "118, 185, 0",
    logo: "GEFORCE",
  },
  AMD: {
    bg: "#1d1a1a",
    accent: "#ed1c24",
    accentRgb: "237, 28, 36",
    logo: "RADEON",
  },
  Intel: {
    bg: "#1a1a1d",
    accent: "#0071c5",
    accentRgb: "0, 113, 197",
    logo: "ARC",
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
    <div
      className={`w-full h-48 flex flex-col items-center justify-center relative overflow-hidden ${className}`}
      style={{ background: config.bg }}
    >
      {/* 背景グラデーション */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(${config.accentRgb}, 0.12) 0%, transparent 60%),
                       radial-gradient(ellipse at 70% 80%, rgba(${config.accentRgb}, 0.06) 0%, transparent 50%)`,
        }}
      />

      {/* グラフィックボードSVG */}
      <svg className="relative w-36 h-24 mb-2" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* カード本体 */}
        <rect x="5" y="8" width="170" height="75" rx="8" fill={config.accent} fillOpacity="0.08" stroke={config.accent} strokeWidth="1.5" strokeOpacity="0.4" />
        {/* バックプレート上部ライン */}
        <line x1="5" y1="18" x2="175" y2="18" stroke={config.accent} strokeWidth="0.5" strokeOpacity="0.2" />

        {/* ファン1 */}
        <circle cx="55" cy="46" r="26" fill="none" stroke={config.accent} strokeWidth="1.2" strokeOpacity="0.3" />
        <circle cx="55" cy="46" r="18" fill="none" stroke={config.accent} strokeWidth="0.8" strokeOpacity="0.2" />
        <circle cx="55" cy="46" r="5" fill={config.accent} fillOpacity="0.3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={`f1-${angle}`}
            x1="55"
            y1="46"
            x2={55 + 24 * Math.cos((angle * Math.PI) / 180)}
            y2={46 + 24 * Math.sin((angle * Math.PI) / 180)}
            stroke={config.accent}
            strokeWidth="0.6"
            strokeOpacity="0.15"
          />
        ))}

        {/* ファン2 */}
        <circle cx="120" cy="46" r="26" fill="none" stroke={config.accent} strokeWidth="1.2" strokeOpacity="0.3" />
        <circle cx="120" cy="46" r="18" fill="none" stroke={config.accent} strokeWidth="0.8" strokeOpacity="0.2" />
        <circle cx="120" cy="46" r="5" fill={config.accent} fillOpacity="0.3" />
        {[22, 67, 112, 157, 202, 247, 292, 337].map((angle) => (
          <line
            key={`f2-${angle}`}
            x1="120"
            y1="46"
            x2={120 + 24 * Math.cos((angle * Math.PI) / 180)}
            y2={46 + 24 * Math.sin((angle * Math.PI) / 180)}
            stroke={config.accent}
            strokeWidth="0.6"
            strokeOpacity="0.15"
          />
        ))}

        {/* ヒートシンクフィン */}
        {Array.from({ length: 12 }, (_, i) => 10 + i * 14).map((x) => (
          <rect key={`hs-${x}`} x={x} y="85" width="6" height="10" rx="1.5" fill={config.accent} fillOpacity="0.1" />
        ))}

        {/* PCIeコネクタ */}
        <rect x="30" y="86" width="120" height="8" rx="3" fill={config.accent} fillOpacity="0.06" stroke={config.accent} strokeWidth="0.5" strokeOpacity="0.15" />

        {/* 電源コネクタ */}
        <rect x="155" y="15" width="14" height="24" rx="3" fill={config.accent} fillOpacity="0.1" stroke={config.accent} strokeWidth="0.5" strokeOpacity="0.25" />

        {/* IO端子 */}
        {[14, 26, 38].map((y) => (
          <rect key={`io-${y}`} x="0" y={y} width="5" height="8" rx="1" fill={config.accent} fillOpacity="0.15" />
        ))}
      </svg>

      {/* テキスト情報 */}
      <div className="relative text-center z-10">
        <p
          className="text-[10px] font-bold tracking-[0.2em] mb-0.5"
          style={{ color: config.accent, opacity: 0.5 }}
        >
          {config.logo}
        </p>
        <p className="text-sm font-bold text-white/80 tracking-wide">
          {series}
        </p>
        <p className="text-[9px] text-white/30 mt-0.5 tracking-wider">
          {vram}GB
        </p>
      </div>

      {/* コーナーアクセント */}
      <div
        className="absolute top-0 right-0 w-20 h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${config.accent}40)` }}
      />
      <div
        className="absolute bottom-0 left-0 w-20 h-1"
        style={{ background: `linear-gradient(90deg, ${config.accent}40, transparent)` }}
      />
    </div>
  );
}
