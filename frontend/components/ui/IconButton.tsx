import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  badge?: boolean;
  variant?: "default" | "ghost";
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, badge, variant = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
          variant === "default" && "bg-white/5 hover:bg-white/10",
          variant === "ghost" && "hover:bg-white/5",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {children}
        {badge && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
