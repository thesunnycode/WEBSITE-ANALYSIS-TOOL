"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const GlowingStarsBackgroundCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "relative min-h-screen bg-black flex flex-col items-center justify-center antialiased",
        className
      )}
    >
      {mounted && (
        <div className="absolute inset-0">
          <div className="absolute h-full w-full">
            {/* Large glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="h-[300px] w-[300px] rounded-full bg-primary/20 blur-[100px]" />
            </div>

            {/* Stars */}
            <div className="absolute inset-0">
              <div className="h-full w-full">
                {Array.from({ length: 100 }).map((_, i) => {
                  // Use a deterministic seed for random values
                  const top = ((i * 7) % 100) + ((i * 3) % 17);
                  const left = ((i * 13) % 100) + ((i * 5) % 23);
                  const opacity = (((i * 11) % 75) + 25) / 100;
                  const animationDelay = `${(i * 0.7) % 5}s`;

                  return (
                    <div
                      key={i}
                      className="absolute h-0.5 w-0.5 rounded-full bg-white animate-twinkle"
                      style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        opacity,
                        animationDelay,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
