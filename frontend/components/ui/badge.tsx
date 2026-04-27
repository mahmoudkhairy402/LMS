type BadgeVariant = "default" | "secondary" | "success" | "destructive";

const variantStyles: Record<BadgeVariant, string> = {
  default:   "border-primary-500/50 bg-primary-500/20 text-primary-500",
  secondary: "border-border bg-surface-raised text-muted-foreground",
  success:   "border-green-500/50 bg-green-500/20 text-green-500",
  destructive: "border-red-500/50 bg-red-500/20 text-red-500",
};

type Props = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({ children, variant = "default", className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}