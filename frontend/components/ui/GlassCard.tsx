import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/[0.05] bg-white/[0.02]",
        "before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gradient-to-b before:from-white/[0.02] before:to-transparent",
        hover && [
          "transition-all duration-300",
          "hover:bg-white/[0.04]",
          "hover:border-white/[0.08]",
          "hover:shadow-lg hover:shadow-black/5",
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
