export function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute -top-32 -left-24 size-80 rounded-full bg-primary/25 blur-[100px]" />
      <div className="absolute top-1/3 -right-24 size-72 rounded-full bg-sky-500/15 blur-[110px]" />
      <div className="absolute -bottom-32 left-1/4 size-96 rounded-full bg-emerald-500/10 blur-[120px]" />
    </div>
  );
}
