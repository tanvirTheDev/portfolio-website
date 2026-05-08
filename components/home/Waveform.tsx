"use client";

import { useEffect, useRef } from "react";

interface WaveformProps {
  height?: number;
}

export default function Waveform({ height = 36 }: WaveformProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!c || !ctx) return;
      c.width = c.offsetWidth * dpr;
      c.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    const BARS = 64;
    let raf: number;
    let t = 0;

    function draw() {
      if (!c || !ctx) return;
      t += 0.08;
      const W = c.offsetWidth;
      ctx.clearRect(0, 0, W, height);
      const bw = W / BARS - 2;

      for (let i = 0; i < BARS; i++) {
        const x = i * (bw + 2);
        const seed = Math.sin(i * 0.8 + t) * 0.5 + Math.sin(i * 0.31 + t * 1.6) * 0.5;
        const h = (seed * 0.5 + 0.5) * (height - 6) + 4;
        ctx.fillStyle = i % 7 === 0 ? "#E8FF00" : "#F2F0E9";
        ctx.globalAlpha = i % 7 === 0 ? 0.95 : 0.35;
        ctx.fillRect(x, height / 2 - h / 2, bw, h);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [height]);

  return <canvas ref={ref} style={{ width: "100%", height: `${height}px`, display: "block" }} />;
}
