"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const MovingBorder = ({
  children,
  duration = 2000,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  containerClassName?: string;
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 0",
    },
    animate: {
      backgroundPosition: ["0 0", "100% 100%"],
      transition: {
        duration: duration / 1000,
        ease: "linear",
        repeat: Infinity,
      },
    },
  };

  return (
    <div className={cn("relative p-[1px] group", containerClassName)}>
      <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        className={cn(
          "absolute inset-0 rounded-lg bg-gradient-to-r from-primary via-primary-light to-primary opacity-60",
          className
        )}
      />
      <div className="relative bg-black rounded-lg">{children}</div>
    </div>
  );
};
