export function LoadingSpinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div
      className={`flex justify-center items-center min-h-screen ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-2 border-orange/20 border-t-orange ${sizeClasses[size]}`}
      />
    </div>
  );
}
