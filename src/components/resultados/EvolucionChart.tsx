"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PuntoEvolucion = {
  fecha: string;
  peso: number | null;
  imc: number | null;
  porcentajeGrasa: number | null;
};

export function EvolucionChart({ datos }: { datos: PuntoEvolucion[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={datos} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="peso"
          name="Peso (kg)"
          stroke="#0D9488"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="imc"
          name="IMC"
          stroke="#134E4A"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="porcentajeGrasa"
          name="% Grasa"
          stroke="#84CC16"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
