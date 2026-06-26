"use client";

import React from "react";
import { WHEEL_NUMBERS, getNumberColor } from "@/lib/roulette";

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 148;
const INNER_R = 78;
const TEXT_R = 115;
const SEG_COUNT = WHEEL_NUMBERS.length;
const SEG_ANGLE = 360 / SEG_COUNT;

const COLOR_MAP = {
  red: "#dc2626",
  black: "#111827",
  green: "#15803d",
};

function toRad(deg: number) {
  return ((deg - 90) * Math.PI) / 180;
}

function r4(n: number) {
  return Math.round(n * 10000) / 10000;
}

function donutSlice(
  cx: number, cy: number,
  innerR: number, outerR: number,
  startAngle: number, endAngle: number
) {
  const osx = r4(cx + outerR * Math.cos(toRad(startAngle)));
  const osy = r4(cy + outerR * Math.sin(toRad(startAngle)));
  const oex = r4(cx + outerR * Math.cos(toRad(endAngle)));
  const oey = r4(cy + outerR * Math.sin(toRad(endAngle)));
  const isx = r4(cx + innerR * Math.cos(toRad(endAngle)));
  const isy = r4(cy + innerR * Math.sin(toRad(endAngle)));
  const iex = r4(cx + innerR * Math.cos(toRad(startAngle)));
  const iey = r4(cy + innerR * Math.sin(toRad(startAngle)));
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${osx} ${osy} A ${outerR} ${outerR} 0 ${large} 1 ${oex} ${oey} L ${isx} ${isy} A ${innerR} ${innerR} 0 ${large} 0 ${iex} ${iey} Z`;
}

interface RouletteWheelProps {
  rotation: number;
  isSpinning: boolean;
}

export default function RouletteWheel({ rotation, isSpinning }: RouletteWheelProps) {
  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Pointer arrow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20" style={{ marginTop: -2 }}>
        <svg width="24" height="28" viewBox="0 0 24 28">
          <polygon points="12,26 2,4 22,4" fill="#fbbf24" stroke="#92400e" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Outer decorative ring */}
      <div
        className="rounded-full shadow-2xl"
        style={{
          width: SIZE + 24,
          height: SIZE + 24,
          background: "radial-gradient(circle at 40% 35%, #b45309, #78350f 60%, #451a03)",
          padding: 12,
          boxShadow: "0 0 40px rgba(251,191,36,0.3), inset 0 0 20px rgba(0,0,0,0.5)",
        }}
      >
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
              : "none",
            transformOrigin: "center",
            display: "block",
          }}
        >
          {/* Ball track ring */}
          <circle cx={CX} cy={CY} r={OUTER_R + 8} fill="#78350f" />
          <circle cx={CX} cy={CY} r={OUTER_R + 4} fill="none" stroke="#fbbf24" strokeWidth="1" />

          {/* Colored segments */}
          {WHEEL_NUMBERS.map((num, i) => {
            const startAngle = i * SEG_ANGLE;
            const endAngle = (i + 1) * SEG_ANGLE;
            const midAngle = startAngle + SEG_ANGLE / 2;
            const color = getNumberColor(num);
            const tx = r4(CX + TEXT_R * Math.cos(toRad(midAngle)));
            const ty = r4(CY + TEXT_R * Math.sin(toRad(midAngle)));

            return (
              <g key={i}>
                <path
                  d={donutSlice(CX, CY, INNER_R, OUTER_R, startAngle, endAngle)}
                  fill={COLOR_MAP[color]}
                  stroke="#fbbf24"
                  strokeWidth="0.6"
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                  transform={`rotate(${midAngle}, ${tx}, ${ty})`}
                >
                  {num}
                </text>
              </g>
            );
          })}

          {/* Inner decorative circles */}
          <circle cx={CX} cy={CY} r={INNER_R - 1} fill="#0f172a" />
          <circle cx={CX} cy={CY} r={INNER_R - 6} fill="#1e293b" />
          <circle cx={CX} cy={CY} r={INNER_R - 12} fill="#0f172a" />

          {/* Diamond accents */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = i * 45;
            const rx = CX + (INNER_R - 4) * Math.cos(toRad(angle));
            const ry = CY + (INNER_R - 4) * Math.sin(toRad(angle));
            return (
              <circle key={i} cx={rx} cy={ry} r={2.5} fill="#fbbf24" />
            );
          })}

          {/* Center hub */}
          <circle cx={CX} cy={CY} r={22} fill="#b45309" />
          <circle cx={CX} cy={CY} r={16} fill="#78350f" />
          <circle cx={CX} cy={CY} r={10} fill="#fbbf24" />
          <circle cx={CX} cy={CY} r={5} fill="#92400e" />
        </svg>
      </div>
    </div>
  );
}
