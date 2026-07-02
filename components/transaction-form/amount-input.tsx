"use client";

export function AmountInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 py-3">
      <p className="text-xs text-muted-foreground">Amount</p>
      <div className="flex items-center gap-2">
        <span className="text-3xl font-semibold text-muted-foreground">₹</span>
        <input
          inputMode="decimal"
          placeholder="0"
          value={value}
          onChange={(e) => {
            const next = e.target.value.replace(/[^0-9.]/g, "");
            onChange(next);
          }}
          className="w-full border-none bg-transparent text-3xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  );
}
