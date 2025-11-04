"use client";

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { useEffect, useRef, useState } from 'react';
import { useMqtt } from './MqttProvider';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export function EnergyChart() {
  const { subscribe } = useMqtt();
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    const off = subscribe('home/energy/power', (payload) => {
      const val = Number(payload);
      setDataPoints((prev) => {
        const next = [...prev, isNaN(val) ? 0 : val].slice(-30);
        return next;
      });
      setLabels((prev) => {
        const i = (counter.current += 1);
        const next = [...prev, `${i}`].slice(-30);
        return next;
      });
    });
    return off;
  }, [subscribe]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Consumo (kW)',
        data: dataPoints,
        fill: true,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { beginAtZero: true },
    },
  } as const;

  return (
    <div className="card">
      <div className="text-slate-500 text-sm">Energ?a</div>
      <div className="mt-2">
        <Line data={chartData} options={options} height={120} />
      </div>
    </div>
  );
}
