"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionTemplate, useSpring } from "framer-motion";

export const SpotlightCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useSpring(0);
  const mouseY = useSpring(0);

  const [isHovered, setIsHovered] = useState(false);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    mouseX.set(x - width / 2);
    mouseY.set(y - height / 2);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        mouseX.set(0);
        mouseY.set(0);
      }}
      onMouseMove={onMouseMove}
      className={cn("relative group/spotlight", className)}
    >
      <motion.div
        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-primary-light/20 opacity-0 group-hover/spotlight:opacity-100 blur-xl transition duration-500"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${isHovered ? mouseX : 0}px ${
            isHovered ? mouseY : 0
          }px,
              rgba(255,107,44,0.15),
              transparent 80%
            )
          `,
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover/spotlight:opacity-100 transition duration-500"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${isHovered ? mouseX : 0}px ${
            isHovered ? mouseY : 0
          }px,
              rgba(255,107,44,0.1),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  );
};
