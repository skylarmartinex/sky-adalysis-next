export function formatUsd(v: number): string {
  if (v >= 1000) return "$" + (v / 1000).toFixed(1) + "k";
  return "$" + v.toFixed(0);
}

export function formatUsdFull(v: number): string {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatPct(v: number): string {
  return v.toFixed(1) + "%";
}

export function formatNum(v: number): string {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
  if (v >= 1000) return (v / 1000).toFixed(1) + "k";
  return v.toFixed(0);
}

export function formatRoas(v: number): string {
  return v.toFixed(2) + "x";
}

export function formatDec2(v: number): string {
  return v.toFixed(2);
}

export function pctDelta(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function formatDelta(value: number, invert = false): {
  text: string;
  positive: boolean;
} {
  const isUp = value > 0;
  const positive = invert ? !isUp : isUp;
  const arrow = isUp ? "\u2191" : "\u2193";
  return {
    text: `${arrow}${Math.abs(value).toFixed(1)}%`,
    positive,
  };
}
