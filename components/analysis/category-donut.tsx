"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface CategoryAmount {
  name: string;
  amount: number;
}

const SLOT_COLORS = [
  "var(--chart-cat-1)",
  "var(--chart-cat-2)",
  "var(--chart-cat-3)",
  "var(--chart-cat-4)",
];
const OTHER_COLOR = "var(--muted-foreground)";
const MAX_SLICES = 4;

const SIZE = 160;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3;

export function CategoryDonut({ items }: { items: CategoryAmount[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const top = items.slice(0, MAX_SLICES);
  const rest = items.slice(MAX_SLICES);
  const otherAmount = rest.reduce((sum, item) => sum + item.amount, 0);

  const slices = [
    ...top.map((item, i) => ({ name: item.name, amount: item.amount, color: SLOT_COLORS[i] })),
    ...(otherAmount > 0 ? [{ name: "Other", amount: otherAmount, color: OTHER_COLOR }] : []),
  ];
  const total = slices.reduce((sum, s) => sum + s.amount, 0);

  let cumulative = 0;
  const arcs = slices.map((slice) => {
    const fraction = total > 0 ? slice.amount / total : 0;
    const length = Math.max(fraction * CIRCUMFERENCE - GAP, 0);
    const offset = -(cumulative * CIRCUMFERENCE) - GAP / 2;
    cumulative += fraction;
    return { ...slice, fraction, length, offset };
  });

  const active = activeIndex !== null ? arcs[activeIndex] : null;

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
        >
          {arcs.map((arc, i) => (
            <circle
              key={arc.name}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={activeIndex === i ? STROKE + 4 : STROKE}
              strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
              strokeDashoffset={arc.offset}
              tabIndex={0}
              role="img"
              aria-label={`${arc.name}: ${formatCurrency(arc.amount)}`}
              className="cursor-pointer outline-none transition-[stroke-width] duration-150"
              onPointerEnter={() => setActiveIndex(i)}
              onPointerLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(i)}
              onBlur={() => setActiveIndex(null)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">{active ? active.name : "Total"}</span>
          <span className="text-sm font-semibold tabular-nums">
            {formatCurrency(active ? active.amount : total)}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {arcs.map((arc, i) => (
          <div
            key={arc.name}
            className="flex items-center gap-2 text-sm"
            onPointerEnter={() => setActiveIndex(i)}
            onPointerLeave={() => setActiveIndex(null)}
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: arc.color }}
            />
            <span className="flex-1 truncate text-muted-foreground">{arc.name}</span>
            <span className="font-medium tabular-nums">{formatCurrency(arc.amount)}</span>
            <span className="w-9 shrink-0 text-right text-xs text-muted-foreground">
              {Math.round(arc.fraction * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
