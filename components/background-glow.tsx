export function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Light mode washes these out against a white surface, so it gets a
          stronger tint than dark mode to read as an equally "mild" glow. */}
      <div className="absolute -top-32 -left-24 size-80 rounded-full bg-primary/40 blur-[100px] dark:bg-primary/25" />
      <div className="absolute top-1/3 -right-24 size-72 rounded-full bg-sky-500/25 blur-[110px] dark:bg-sky-500/15" />
      <div className="absolute -bottom-32 left-1/4 size-96 rounded-full bg-emerald-500/20 blur-[120px] dark:bg-emerald-500/10" />
    </div>
  );
}
