"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ParticleProps {
  id: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
}

export const SparklesCore = ({
  id,
  className,
  background,
  minSize = 0.4,
  maxSize = 1,
  speed = 1,
  particleColor = "#FFFFFF",
  particleDensity = 100,
}: ParticleProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [particles, setParticles] = useState<any[]>([]);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    setContext(ctx);

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const particleCount = Math.floor(
      (window.innerWidth * particleDensity) / 1000
    );
    const initialParticles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * (maxSize - minSize) + minSize,
      speedX: (Math.random() - 0.5) * speed,
      speedY: (Math.random() - 0.5) * speed,
    }));

    setParticles(initialParticles);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animationFrameId]);

  useEffect(() => {
    if (!context || !canvasRef.current) return;

    const animate = () => {
      if (!context || !canvasRef.current) return;

      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const updatedParticles = particles.map((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = window.innerWidth;
        if (particle.x > window.innerWidth) particle.x = 0;
        if (particle.y < 0) particle.y = window.innerHeight;
        if (particle.y > window.innerHeight) particle.y = 0;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = particleColor;
        context.fill();

        return particle;
      });

      setParticles(updatedParticles);
      setAnimationFrameId(requestAnimationFrame(animate));
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [context, particles, particleColor]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={cn("pointer-events-none", className)}
      style={{
        background: background || "transparent",
      }}
    ></canvas>
  );
};
