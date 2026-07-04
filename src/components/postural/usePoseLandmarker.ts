"use client";

import { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

export function usePoseLandmarker() {
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "IMAGE",
          numPoses: 1,
        });
        if (!cancelado) {
          landmarkerRef.current = landmarker;
          setListo(true);
        } else {
          landmarker.close();
        }
      } catch (e) {
        if (!cancelado) {
          setError(
            e instanceof Error ? e.message : "Error cargando el modelo de pose",
          );
        }
      }
    }

    cargar();
    return () => {
      cancelado = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  function detectar(imagen: HTMLImageElement): NormalizedLandmark[] | null {
    if (!landmarkerRef.current) return null;
    const resultado = landmarkerRef.current.detect(imagen);
    return resultado.landmarks[0] ?? null;
  }

  return { listo, error, detectar };
}
