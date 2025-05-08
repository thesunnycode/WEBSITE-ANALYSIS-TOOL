"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 20, className }: MeteorsProps) {
  const [meteorStyles, setMeteorStyles] = useState<
    Array<{
      top: string;
      left: string;
      animationDelay: string;
      animationDuration: string;
    }>
  >([]);

  useEffect(() => {
    const styles = [...Array(number)].map(() => ({
      top: Math.floor(Math.random() * 100) + "%",
      left: Math.floor(Math.random() * 100) + "%",
      animationDelay: Math.random() * 2 + "s",
      animationDuration: Math.random() * 1 + 0.5 + "s",
    }));
    setMeteorStyles(styles);
  }, [number]);

  return (
    <div className={cn("fixed inset-0 overflow-hidden -z-10", className)}>
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          className="absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-white shadow-[0_0_0_1px_#ffffff10] before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-[50%] before:transform before:bg-gradient-to-r before:from-[#fff8] before:to-transparent"
          style={{
            top: style.top,
            left: style.left,
            animationDelay: style.animationDelay,
            animationDuration: style.animationDuration,
          }}
        />
      ))}
    </div>
  );
}
