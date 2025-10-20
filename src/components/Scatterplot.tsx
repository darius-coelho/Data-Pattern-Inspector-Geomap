import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import { applyConstraints } from "../lib/computeUtils"; // Assuming the util is in the same folder
import { DataRow, Constraints } from "../types/data.types";

ChartJS.register(PointElement, LinearScale, CategoryScale, Tooltip, Legend);


type ScatterPlotProps = {
  data: DataRow[];
  xKey: string;
  isNumericX: boolean;
  yKey: string;
  onXChange: (newX: string) => void;
  xOptions: string[];
  constraints: Constraints;
};

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  xKey,
  isNumericX,
  yKey,
  onXChange,
  xOptions,
  constraints,
}) => {
  const { inPoints, outPoints, categories, isNumeric } = useMemo(() => {
   
    const inDataSet = new Set(applyConstraints(data, constraints));

    const categories: string[] = [];
    const inPoints: { x: number; y: number }[] = [];
    const outPoints: { x: number; y: number }[] = [];

    data.forEach((d) => {
      const rawX = d[xKey];
      const rawY = d[yKey];

      if (rawX == null || rawY == null || rawX === "" || rawY === "") {
        return;
      }

      const yVal = Number(rawY);
      let xVal: number;

      if (isNumericX) {
        xVal = Number(rawX);
      } else {
        const cat = String(rawX);
        if (!categories.includes(cat)) categories.push(cat);
        const index = categories.indexOf(cat);
        const jitter = (Math.random() - 0.5) * 0.4;
        xVal = index + jitter;
      }
      
      if (isNaN(xVal) || isNaN(yVal)) {
          return;
      }

      const point = { x: xVal, y: yVal };

      if (inDataSet.has(d)) {
        inPoints.push(point);
      } else {
        outPoints.push(point);
      }
    });

    return { inPoints, outPoints, categories, isNumeric: isNumericX };
  }, [data, xKey, yKey, constraints]);

  const chartData = {
    datasets: [
      {
        label: "Outside Filter",
        data: outPoints,
        backgroundColor: "rgba(156, 163, 175, 0.2)", // Gray
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Inside Filter",
        data: inPoints,
        backgroundColor: "rgba(37, 99, 235, 0.7)", // Blue
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<"scatter"> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.75,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"scatter">) => {
            const point = context.raw as { x: number; y: number };
            const xLabel = isNumeric ? point.x.toFixed(2) : categories[Math.round(point.x)];
            const yLabel = point.y.toFixed(2);
            return `${xKey}: ${xLabel}, ${yKey}: ${yLabel}`;
          },
        },
      },
    },
    scales: {
      x: isNumeric
        ? {
            type: "linear",
            grid: { color: "rgba(0,0,0,0.05)" },
            title: { display: false },
            ticks: {
              callback: function(value) {
                const num = Number(value);
                // Use compact notation for numbers >= 1000 (e.g., 1.5k)
                if (Math.abs(num) >= 1000) {
                  return new Intl.NumberFormat('en-US', {
                    notation: 'compact',
                    compactDisplay: 'short',
                    maximumFractionDigits: 1
                  }).format(num);
                }
                // For floats, limit to 2 decimal places. Otherwise, show integer.
                return num % 1 !== 0 ? num.toFixed(2) : num.toFixed(2);
              }
            }
          }
        : {
            type: "linear",
            ticks: {
              callback: (val) => { return categories[Math.round(Number(val))] || ""},
              maxRotation: 0,
              autoSkip: false,
            },
            grid: { color: "rgba(0,0,0,0.05)" },
            title: { display: false },
          },
      y: {
        type: "linear",
        grid: { color: "rgba(0,0,0,0.05)" },
        title: { display: true, text: yKey, color: "#555", font: { size: 12 } },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return (
    <div className="relative w-full h-full bg-white p-2flex flex-col">
      <div className="flex-grow relative">
        <Scatter data={chartData} options={options} />
      </div>

      <div className="flex justify-center mt-1">
        <select
          value={xKey}
          onChange={(e) => onXChange(e.target.value)}
          className="text-xs border border-gray-300 rounded-md px-1.5 py-0.5 
                     focus:outline-none focus:ring-1 focus:ring-blue-400 
                     w-auto max-w-[120px] truncate"
        >
          {xOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};