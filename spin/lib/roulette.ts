// European roulette wheel order (clockwise from 0)
export const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36,
  11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9,
  22, 18, 29, 7, 28, 12, 35, 3, 26,
];

export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export type NumberColor = "red" | "black" | "green";

export function getNumberColor(n: number): NumberColor {
  if (n === 0) return "green";
  return RED_NUMBERS.has(n) ? "red" : "black";
}

export const CHIP_VALUES = [1, 5, 10, 25, 100];

export const CHIP_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: "#f1f5f9", text: "#1e293b" },
  5: { bg: "#ef4444", text: "#ffffff" },
  10: { bg: "#3b82f6", text: "#ffffff" },
  25: { bg: "#22c55e", text: "#ffffff" },
  100: { bg: "#f59e0b", text: "#1e293b" },
};

export type BetType = string;

export function getBetPayout(betType: BetType): number {
  if (/^\d+$/.test(betType)) return 35;
  if (["red", "black", "odd", "even", "1-18", "19-36"].includes(betType)) return 1;
  if (["1st12", "2nd12", "3rd12", "col1", "col2", "col3"].includes(betType)) return 2;
  return 0;
}

export function isWinningBet(betType: BetType, result: number): boolean {
  const color = getNumberColor(result);
  switch (betType) {
    case "red": return color === "red";
    case "black": return color === "black";
    case "odd": return result !== 0 && result % 2 === 1;
    case "even": return result !== 0 && result % 2 === 0;
    case "1-18": return result >= 1 && result <= 18;
    case "19-36": return result >= 19 && result <= 36;
    case "1st12": return result >= 1 && result <= 12;
    case "2nd12": return result >= 13 && result <= 24;
    case "3rd12": return result >= 25 && result <= 36;
    case "col1": return result !== 0 && result % 3 === 1;
    case "col2": return result !== 0 && result % 3 === 2;
    case "col3": return result !== 0 && result % 3 === 0;
    default: return betType === String(result);
  }
}

export function calculateWinnings(bets: Record<string, number>, result: number): number {
  let total = 0;
  for (const [betType, amount] of Object.entries(bets)) {
    if (isWinningBet(betType, result)) {
      total += amount * (getBetPayout(betType) + 1);
    }
  }
  return total;
}

export function totalBetAmount(bets: Record<string, number>): number {
  return Object.values(bets).reduce((sum, v) => sum + v, 0);
}
