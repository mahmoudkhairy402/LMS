type Props = {
  value: number; // 0–100
  className?: string;
};

export function Progress({ value, className = "" }: Props) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full overflow-hidden rounded-full border border-border bg-surface-raised ${className}`}
    >
      <div
        className="h-full rounded-full bg-primary-500 transition-all duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}