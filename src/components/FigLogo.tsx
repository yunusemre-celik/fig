import React from "react";

interface FigLogoProps {
  size?: number;
  small?: boolean;
  className?: string;
  glow?: boolean;
}

export const FigLogo: React.FC<FigLogoProps> = ({
  size = 32,
  small = false,
  className = "",
  glow = true,
}) => {
  const actualSize = small ? 24 : size;

  return (
    <div
      className={`inline-flex items-center justify-center relative select-none shrink-0 ${className}`}
      style={{
        width: actualSize,
        height: actualSize,
      }}
    >
      <svg
        width={actualSize}
        height={actualSize}
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="figBg" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#202A4B" />
            <stop offset="65%" stopColor="#0F1324" />
          </linearGradient>
          <linearGradient id="figFruit" x1="0" y1="0" x2="22" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8493FF" />
            <stop offset="55%" stopColor="#5257DC" />
            <stop offset="100%" stopColor="#3539A1" />
          </linearGradient>
          <linearGradient id="figGlow" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
          </linearGradient>
          <filter id="fruitShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366F1" floodOpacity="0.65" />
          </filter>
        </defs>

        {/* Outer Squircle Box with Border */}
        <rect
          x="1"
          y="1"
          width="36"
          height="36"
          rx="11"
          fill="url(#figBg)"
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth="1.2"
        />

        {/* Inner Highlight Rims */}
        <rect
          x="3"
          y="3"
          width="32"
          height="32"
          rx="9"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="1"
          fill="none"
        />

        {/* Organic Fig Fruit Shape (Rotated -4deg around center 19, 19) */}
        <g transform="rotate(-4 19 19)" filter={glow ? "url(#fruitShadow)" : undefined}>
          {/* Main Fruit Body */}
          <path
            d="M19 10C14.5 10 10.5 13.5 10.5 19C10.5 24.5 14 28 19 28C24 28 27.5 24.5 27.5 19C27.5 13.5 23.5 10 19 10Z"
            fill="url(#figFruit)"
          />

          {/* Stem & Leaf */}
          <path
            d="M19 10.5C20 8 23 7 25 7C25.5 8.5 24.5 10 22 10.8"
            fill="#9BB0FF"
          />

          {/* Glowing Fig Seeds */}
          <circle cx="16" cy="18" r="1.2" fill="white" fillOpacity="0.85" />
          <circle cx="21" cy="19.5" r="1.2" fill="white" fillOpacity="0.85" />
          <circle cx="17.5" cy="22.5" r="1.2" fill="white" fillOpacity="0.85" />
        </g>
      </svg>
    </div>
  );
};
