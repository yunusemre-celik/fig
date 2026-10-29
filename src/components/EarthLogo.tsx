import React from "react";

interface EarthLogoProps {
  size?: number;
  className?: string;
}

export const EarthLogo: React.FC<EarthLogoProps> = ({ size = 28, className = "" }) => {
  // 6 radial segments around center (50, 50)
  // Radius = 44, Inner Core Radius = 14
  // 60 degrees each: angles [0, 60], [60, 120], [120, 180], [180, 240], [240, 300], [300, 360]
  const segments = [
    { start: 0, end: 60, fill: "#1D4ED8", stroke: "#38BDF8", label: "Atlantic" }, // Ocean Royal Cobalt
    { start: 60, end: 120, fill: "#10B981", stroke: "#34D399", label: "Eurasia" }, // Land Emerald
    { start: 120, end: 180, fill: "#0284C7", stroke: "#38BDF8", label: "Indian" }, // Ocean Cerulean
    { start: 180, end: 240, fill: "#059669", stroke: "#10B981", label: "Americas" }, // Land Forest
    { start: 240, end: 300, fill: "#2563EB", stroke: "#60A5FA", label: "Pacific" }, // Ocean Sapphire
    { start: 300, end: 360, fill: "#F8FAFC", stroke: "#BAE6FD", label: "Polar" }, // Polar Ice White
  ];

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, rOut: number, rIn: number, startAngle: number, endAngle: number) => {
    const startOut = polarToCartesian(x, y, rOut, endAngle);
    const endOut = polarToCartesian(x, y, rOut, startAngle);
    const startIn = polarToCartesian(x, y, rIn, endAngle);
    const endIn = polarToCartesian(x, y, rIn, startAngle);

    return [
      `M ${endOut.x} ${endOut.y}`,
      `A ${rOut} ${rOut} 0 0 1 ${startOut.x} ${startOut.y}`,
      `L ${startIn.x} ${startIn.y}`,
      `A ${rIn} ${rIn} 0 0 0 ${endIn.x} ${endIn.y}`,
      "Z",
    ].join(" ");
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 select-none ${className}`}
      style={{ filter: "drop-shadow(0 2px 8px rgba(10, 132, 255, 0.35))" }}
    >
      <defs>
        {/* Atmosphere glow filter */}
        <filter id="earthAtmosphere" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38BDF8" floodOpacity="0.5" />
        </filter>
        {/* Core radial gradient */}
        <radialGradient id="earthCoreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0A0B10" />
        </radialGradient>
      </defs>

      {/* Atmospheric outer aura ring */}
      <circle
        cx="50"
        cy="50"
        r="47"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="1"
        strokeOpacity="0.4"
      />

      {/* 6 Earth Planetary Segments */}
      {segments.map((seg, idx) => (
        <path
          key={idx}
          d={describeArc(50, 50, 44, 15, seg.start, seg.end)}
          fill={seg.fill}
          stroke="rgba(10, 11, 16, 0.75)"
          strokeWidth="1.8"
        />
      ))}

      {/* Planetary Latitude/Equator curve lines for globe realism */}
      <ellipse
        cx="50"
        cy="50"
        rx="44"
        ry="18"
        fill="none"
        stroke="rgba(255, 255, 255, 0.35)"
        strokeWidth="0.8"
        strokeDasharray="2 2"
        className="pointer-events-none"
      />

      {/* Central Core (Hub) */}
      <circle
        cx="50"
        cy="50"
        r="14"
        fill="url(#earthCoreGrad)"
        stroke="#38BDF8"
        strokeWidth="1.5"
      />

      {/* Center pinpoint coordinate light */}
      <circle cx="50" cy="50" r="3.5" fill="#38BDF8" />
    </svg>
  );
};

export default EarthLogo;
