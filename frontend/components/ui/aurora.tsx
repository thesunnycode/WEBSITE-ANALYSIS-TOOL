import { useEffect, useRef } from "react";

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      time += 0.001;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create multiple aurora layers with adjusted parameters
      createAuroraLayer(ctx, time, canvas.width, canvas.height, "#FF6B2C", 0.4);
      createAuroraLayer(
        ctx,
        time * 1.2,
        canvas.width,
        canvas.height,
        "#FF8F5D",
        0.2
      );
      createAuroraLayer(
        ctx,
        time * 0.8,
        canvas.width,
        canvas.height,
        "#FF6B2C",
        0.3
      );

      animationFrameId = requestAnimationFrame(animate);
    };

    const createAuroraLayer = (
      ctx: CanvasRenderingContext2D,
      time: number,
      width: number,
      height: number,
      color: string,
      alpha: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x < width; x++) {
        const y =
          height / 2 +
          Math.sin(x * 0.005 + time) * 80 +
          Math.sin(x * 0.01 + time * 1.5) * 40 +
          Math.sin(x * 0.002 + time * 0.8) * 120;

        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, height / 2, 0, height);
      gradient.addColorStop(0, `${color}00`);
      gradient.addColorStop(
        0.6,
        `${color}${Math.floor(alpha * 255)
          .toString(16)
          .padStart(2, "0")}`
      );
      gradient.addColorStop(1, `${color}00`);

      ctx.fillStyle = gradient;
      ctx.fill();
    };

    resize();
    animate();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ background: "#000000" }}
    />
  );
}
