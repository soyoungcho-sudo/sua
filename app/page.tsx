"use client";

import { useState, useCallback } from "react";
import RouletteWheel from "@/components/RouletteWheel";
import BettingBoard from "@/components/BettingBoard";
import {
  WHEEL_NUMBERS,
  CHIP_VALUES,
  CHIP_COLORS,
  getNumberColor,
  calculateWinnings,
  totalBetAmount,
} from "@/lib/roulette";

const SEG_ANGLE = 360 / WHEEL_NUMBERS.length;
const SPIN_DURATION = 4500;

function getResultColor(n: number) {
  const c = getNumberColor(n);
  if (c === "red") return "text-red-400";
  if (c === "black") return "text-gray-300";
  return "text-green-400";
}

export default function RoulettePage() {
  const [balance, setBalance] = useState(1000);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [selectedChip, setSelectedChip] = useState(10);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const totalBet = totalBetAmount(bets);

  const handleBet = useCallback(
    (betType: string) => {
      if (isSpinning) return;
      if (balance - totalBet < selectedChip) return;
      setBets((prev) => ({
        ...prev,
        [betType]: (prev[betType] || 0) + selectedChip,
      }));
    },
    [isSpinning, balance, totalBet, selectedChip]
  );

  const clearBets = () => {
    if (isSpinning) return;
    setBets({});
  };

  const doubleBets = () => {
    if (isSpinning) return;
    const doubled = Object.fromEntries(
      Object.entries(bets).map(([k, v]) => [k, v * 2])
    );
    if (totalBetAmount(doubled) > balance) return;
    setBets(doubled);
  };

  const spin = () => {
    if (isSpinning || totalBet === 0) return;

    setBalance((b) => b - totalBet);
    setResult(null);
    setWinAmount(null);
    setIsSpinning(true);

    const resultNumber = Math.floor(Math.random() * 37);
    const wheelIndex = WHEEL_NUMBERS.indexOf(resultNumber);

    const segCenter = wheelIndex * SEG_ANGLE + SEG_ANGLE / 2;
    const targetR = (360 - segCenter + 360) % 360;
    const currentMod = wheelRotation % 360;
    const delta = (targetR - currentMod + 360) % 360;
    const newRotation = wheelRotation + 5 * 360 + delta;

    setWheelRotation(newRotation);

    setTimeout(() => {
      const winnings = calculateWinnings(bets, resultNumber);
      setBalance((b) => b + winnings);
      setResult(resultNumber);
      setWinAmount(winnings);
      setIsSpinning(false);
      setHistory((h) => [resultNumber, ...h].slice(0, 15));
      setBets({});
    }, SPIN_DURATION);
  };

  const canSpin = totalBet > 0 && !isSpinning && balance >= totalBet;

  return (
    <div
      className="min-h-screen text-white flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at top, #064e3b 0%, #022c22 50%, #0a0a0a 100%)",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-green-900">
        <h1 className="text-2xl font-bold tracking-widest text-amber-400">
          ♠ ROULETTE ♠
        </h1>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-gray-400">
            BET:{" "}
            <span className="text-amber-300 font-bold">
              ${totalBet.toLocaleString()}
            </span>
          </div>
          <div className="bg-black/40 border border-amber-700 rounded-lg px-4 py-2">
            <span className="text-gray-400 text-xs">BALANCE</span>
            <div className="text-amber-400 font-bold text-lg leading-none">
              ${balance.toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col xl:flex-row gap-6 p-6 items-start justify-center">
        {/* Left: Wheel + Controls */}
        <div className="flex flex-col items-center gap-4 w-full xl:w-auto">
          {/* Result display */}
          <div className="h-16 flex items-center justify-center">
            {isSpinning ? (
              <div className="text-gray-400 animate-pulse text-lg tracking-widest">
                SPINNING...
              </div>
            ) : result !== null ? (
              <div className="text-center">
                <div
                  className={`text-5xl font-black ${getResultColor(result)}`}
                >
                  {result}
                </div>
                {winAmount !== null && (
                  <div
                    className={`text-sm font-bold mt-1 ${
                      winAmount > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {winAmount > 0
                      ? `+$${winAmount.toLocaleString()} WIN!`
                      : "NO WIN"}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-600 text-sm">Place your bets</div>
            )}
          </div>

          {/* Wheel */}
          <RouletteWheel rotation={wheelRotation} isSpinning={isSpinning} />

          {/* Chip selector */}
          <div className="flex items-center gap-2 mt-2">
            {CHIP_VALUES.map((val) => {
              const c = CHIP_COLORS[val];
              const active = selectedChip === val;
              return (
                <button
                  key={val}
                  onClick={() => setSelectedChip(val)}
                  className="rounded-full font-bold text-xs transition-all duration-150 flex items-center justify-center"
                  style={{
                    background: c.bg,
                    color: c.text,
                    width: 44,
                    height: 44,
                    border: active ? "3px solid #fbbf24" : "2px solid transparent",
                    outline: active
                      ? "2px solid rgba(251,191,36,0.4)"
                      : "none",
                    transform: active ? "scale(1.15)" : "scale(1)",
                    boxShadow: active
                      ? "0 0 12px rgba(251,191,36,0.5)"
                      : "0 2px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  ${val}
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-1">
            <button
              onClick={clearBets}
              disabled={isSpinning || totalBet === 0}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
            <button
              onClick={doubleBets}
              disabled={
                isSpinning || totalBet === 0 || totalBet * 2 > balance
              }
              className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-700 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              2x
            </button>
            <button
              onClick={spin}
              disabled={!canSpin}
              className="px-8 py-2 rounded-lg font-black text-sm tracking-widest transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canSpin
                  ? "linear-gradient(135deg, #d97706, #f59e0b, #d97706)"
                  : "#6b7280",
                color: canSpin ? "#1c1917" : "#9ca3af",
                boxShadow: canSpin
                  ? "0 0 20px rgba(251,191,36,0.4), 0 4px 12px rgba(0,0,0,0.4)"
                  : "none",
              }}
            >
              SPIN
            </button>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap justify-center max-w-[360px]">
              {history.map((n, i) => {
                const c = getNumberColor(n);
                const bg =
                  c === "red"
                    ? "#dc2626"
                    : c === "black"
                    ? "#374151"
                    : "#15803d";
                return (
                  <span
                    key={i}
                    className="rounded-full font-bold flex items-center justify-center"
                    style={{
                      background: bg,
                      width: 22,
                      height: 22,
                      fontSize: 9,
                      color: "white",
                    }}
                  >
                    {n}
                  </span>
                );
              })}
            </div>
          )}

          {/* Low balance reset */}
          {balance < 10 && !isSpinning && (
            <button
              onClick={() => {
                setBalance(1000);
                setHistory([]);
                setResult(null);
                setWinAmount(null);
              }}
              className="mt-2 px-6 py-2 rounded-lg text-sm font-bold text-white bg-purple-700 hover:bg-purple-600 transition-colors"
            >
              ↺ Refill $1,000
            </button>
          )}
        </div>

        {/* Right: Betting board */}
        <div className="w-full xl:w-auto xl:flex-1 max-w-[680px]">
          <div
            className="rounded-xl p-4 border border-green-800"
            style={{
              background:
                "radial-gradient(ellipse at center, #14532d 0%, #052e16 100%)",
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.4)",
            }}
          >
            <div className="text-center text-xs text-green-500 mb-3 tracking-widest font-semibold">
              PLACE YOUR BETS
            </div>
            <BettingBoard
              bets={bets}
              selectedChip={selectedChip}
              isSpinning={isSpinning}
              onBet={handleBet}
              result={result}
            />
          </div>

          {/* Payout legend */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-500 text-center">
            <div className="bg-black/20 rounded p-2">
              <div className="text-amber-500 font-bold">35:1</div>
              <div>Single number</div>
            </div>
            <div className="bg-black/20 rounded p-2">
              <div className="text-amber-500 font-bold">2:1</div>
              <div>Dozen / Column</div>
            </div>
            <div className="bg-black/20 rounded p-2">
              <div className="text-amber-500 font-bold">1:1</div>
              <div>Red / Black / etc.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
