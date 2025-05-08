export type ComponentSize = "sm" | "md" | "lg";

export interface BaseComponentProps {
  size?: ComponentSize;
  className?: string;
}

export const sizeClasses: Record<ComponentSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 rounded-xl",
  lg: "px-6 py-3 text-lg rounded-xl",
};

export type ButtonVariant = "primary" | "secondary" | "outline";

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary/80 hover:bg-primary/90 text-white border border-white/10",
  secondary:
    "bg-dark-lighter/30 hover:bg-dark-lighter/40 text-white border border-white/5",
  outline: "bg-transparent hover:bg-white/5 text-white border border-white/10",
};
