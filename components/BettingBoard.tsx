"use client";

import React from "react";
import { getNumberColor, CHIP_COLORS } from "@/lib/roulette";

// Standard roulette grid: rows are top(3n) mid(3n-1) bottom(3n-2)
const NUMBER_ROWS = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
];

const NUM_COLOR_MAP = {
  red: "bg-red-600 hover:bg-red-500",
  black: "bg-gray-900 hover:bg-gray-800",
  green: "bg-green-700 hover:bg-green-600",
};

interface BettingBoardProps {
  bets: Record<string, number>;
  selectedChip: number;
  isSpinning: boolean;
  onBet: (betType: string) => void;
  result: number | null;
}

function BetChip({ amount, chipVal }: { amount: number; chipVal: number }) {
  if (!amount) return null;
  const color = CHIP_COLORS[chipVal] || CHIP_COLORS[1];
  return (
    <div
      className="absolute top-0 right-0 w-5 h-5 rounded-full text-[8px] font-bold flex items-center justify-center border border-white z-10 shadow"
      style={{ background: color.bg, color: color.text, transform: "translate(30%, -30%)" }}
    >
      {amount >= 1000 ? `${Math.floor(amount / 1000)}k` : amount}
    </div>
  );
}

export default function BettingBoard({
  bets, selectedChip, isSpinning, onBet, result,
}: BettingBoardProps) {
  const highlight = (betType: string) => {
    if (result === null) return "";
    const winning =
      betType === String(result) ? "ring-2 ring-yellow-400 brightness-125" : "";
    return winning;
  };

  const cellBase =
    "relative flex items-center justify-center font-bold text-white cursor-pointer select-none transition-all duration-150 text-xs border border-green-800 active:scale-95";

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[360px]">
        {/* Zero + number grid */}
        <div className="flex gap-[1px]">
          {/* Zero */}
          <button
            onClick={() => !isSpinning && onBet("0")}
            disabled={isSpinning}
            className={`${cellBase} bg-green-700 hover:bg-green-600 rounded-sm`}
            style={{ width: 32, minHeight: 90, writingMode: "vertical-rl" }}
          >
            <div className="relative">
              0
              <BetChip amount={bets["0"] || 0} chipVal={selectedChip} />
            </div>
          </button>

          {/* Number grid (3 rows x 12 cols) */}
          <div className="flex-1 grid grid-rows-3 gap-[1px]">
            {NUMBER_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-[1px]">
                {row.map((num) => {
                  const color = getNumberColor(num);
                  return (
                    <button
                      key={num}
                      onClick={() => !isSpinning && onBet(String(num))}
                      disabled={isSpinning}
                      className={`${cellBase} ${NUM_COLOR_MAP[color]} flex-1 h-[29px] rounded-sm ${highlight(String(num))}`}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        {num}
                        {bets[String(num)] > 0 && (
                          <BetChip amount={bets[String(num)]} chipVal={selectedChip} />
                        )}
                      </div>
                    </button>
                  );
                })}
                {/* Column bet */}
                <button
                  onClick={() => !isSpinning && onBet(`col${3 - rowIdx}`)}
                  disabled={isSpinning}
                  className={`${cellBase} bg-green-900 hover:bg-green-800 w-8 h-[29px] rounded-sm text-[10px]`}
                >
                  <div className="relative">
                    2:1
                    {bets[`col${3 - rowIdx}`] > 0 && (
                      <BetChip amount={bets[`col${3 - rowIdx}`]} chipVal={selectedChip} />
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dozens */}
        <div className="flex gap-[1px] mt-[1px]">
          <div style={{ width: 33 }} />
          {(["1st12", "2nd12", "3rd12"] as const).map((d) => {
            const label = { "1st12": "1st 12", "2nd12": "2nd 12", "3rd12": "3rd 12" }[d];
            return (
              <button
                key={d}
                onClick={() => !isSpinning && onBet(d)}
                disabled={isSpinning}
                className={`${cellBase} bg-green-900 hover:bg-green-800 flex-1 h-7 rounded-sm`}
              >
                <div className="relative">
                  {label}
                  {bets[d] > 0 && <BetChip amount={bets[d]} chipVal={selectedChip} />}
                </div>
              </button>
            );
          })}
          <div style={{ width: 33 }} />
        </div>

        {/* Outside bets */}
        <div className="flex gap-[1px] mt-[1px]">
          <div style={{ width: 33 }} />
          {(
            [
              { key: "1-18", label: "1-18" },
              { key: "even", label: "EVEN" },
              { key: "red", label: "RED", cls: "bg-red-700 hover:bg-red-600" },
              { key: "black", label: "BLACK", cls: "bg-gray-900 hover:bg-gray-800" },
              { key: "odd", label: "ODD" },
              { key: "19-36", label: "19-36" },
            ] as { key: string; label: string; cls?: string }[]
          ).map(({ key, label, cls }) => (
            <button
              key={key}
              onClick={() => !isSpinning && onBet(key)}
              disabled={isSpinning}
              className={`${cellBase} ${cls || "bg-green-900 hover:bg-green-800"} flex-1 h-7 rounded-sm`}
            >
              <div className="relative">
                {label}
                {bets[key] > 0 && <BetChip amount={bets[key]} chipVal={selectedChip} />}
              </div>
            </button>
          ))}
          <div style={{ width: 33 }} />
        </div>
      </div>
    </div>
  );
}
