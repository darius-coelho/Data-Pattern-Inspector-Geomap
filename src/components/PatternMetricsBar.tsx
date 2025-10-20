import React from "react";

type Metric = {
  name: string;
  value: number;
  reference: number;
  format?: (val: number) => string;
};

type PatternMetricsBarProps = {
  metrics: Metric[];
};

export const PatternMetricsBar: React.FC<PatternMetricsBarProps> = ({ metrics }) => {
  return (
    <div className="bg-white p-3 mb-4">
      <div className="flex flex-col">
        {/* Row 1: Metric Names */}
        <div className="flex flex-row justify-between text-xs text-gray-500 font-medium pb-1">
          {metrics.map((m, i) => (
            <div key={i} className="flex-1 text-center">
              {m.name}
            </div>
          ))}
        </div>

        {/* Row 2: Metric Values */}
        <div className="flex flex-row justify-between text-lg font-semibold text-gray-800 pt-0">
          {metrics.map((m, i) => (
            <div key={i} className="flex-1 text-center">
              {m.format ? m.format(m.value) : m.value.toLocaleString()}
            </div>
          ))}
        </div>

        {/* Row 3: Differences */}
        <div className="flex flex-row justify-between text-xs font-medium pt-0 ">
          {metrics.map((m, i) => {
            const diff = m.value - m.reference;
            const diffPct = (diff / m.reference) * 100;
            const isPositive = diff >= 0;

            return (
              <div
                key={i}
                className={`flex-1 text-center ${isPositive ? "text-green-600" : "text-red-500" }`}
                title={`${m.name}: ${m.reference.toLocaleString()} \n(Full Dataset)`}
              >
                {
                  m.name === "Data Count" || m.name === "Target Value"
                  ? `${isPositive ? "+" : ""}${diffPct.toFixed(1)}%`
                  : ""
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
