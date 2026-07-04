"use client";

import { useEffect, useRef } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

const CONEXIONES: Array<[number, number]> = [
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

export function PoseCanvas({
  imagenUrl,
  landmarks,
}: {
  imagenUrl: string;
  landmarks: NormalizedLandmark[] | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      if (landmarks) {
        ctx.strokeStyle = "#84CC16";
        ctx.lineWidth = Math.max(2, canvas.width / 200);
        for (const [a, b] of CONEXIONES) {
          const pa = landmarks[a];
          const pb = landmarks[b];
          if (!pa || !pb) continue;
          ctx.beginPath();
          ctx.moveTo(pa.x * canvas.width, pa.y * canvas.height);
          ctx.lineTo(pb.x * canvas.width, pb.y * canvas.height);
          ctx.stroke();
        }
        ctx.fillStyle = "#0D9488";
        const radio = Math.max(3, canvas.width / 150);
        for (const lm of landmarks) {
          ctx.beginPath();
          ctx.arc(lm.x * canvas.width, lm.y * canvas.height, radio, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    img.src = imagenUrl;
  }, [imagenUrl, landmarks]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg border border-border bg-muted"
    />
  );
}
