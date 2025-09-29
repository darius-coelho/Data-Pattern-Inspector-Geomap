"use client";

import { useEffect, useMemo, useState } from "react";
import { PatternList } from "@/components/PatternList";
import { PatternDetails } from "@/components/PatternDetails";
import { GeoMap } from "@/components/GeoMap";
import { SummaryStats } from "@/components/SummaryStats";

type ComputeResponse = {
  patterns: Array<{ id: string; label: string; criteria: Record<string, string> }>;
  results: Array<Record<string, unknown>>;
  geoData: Array<{ lat: number; lng: number; value: number; id?: string }>;
  summaryStats: Record<string, number>;
};

type LayoutOption = "A" | "B";


export default function AnalyticsPage() {
  const [data, setData] = useState<ComputeResponse | null>(null);
  const [layout, setLayout] = useState<LayoutOption>("A");

  useEffect(() => {
    const raw = sessionStorage.getItem("computeResults");
    if (raw) setData(JSON.parse(raw));
  }, []);

  const content = useMemo(() => {
    if (!data) return null;
    if (layout === "A") {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_1fr] gap-3 h-full">
          <div className="rounded drop-shadow-sm h-full bg-white">
            <div className="p-2 text-sm font-medium bg-gray-100">Patterns</div>
            <PatternList patterns={data.patterns} />
          </div>
          <div className="rounded drop-shadow-sm h-full flex flex-col bg-white">
            <div className="p-2 text-sm font-medium bg-gray-100">Pattern Details</div>
            <PatternDetails results={data.results} />
          </div>
          <div className="rounded drop-shadow-sm h-full grid grid-rows-2 gap-4">
            <div className="rounded drop-shadow-sm h-full bg-white">
              <div className="p-2 text-sm font-medium bg-gray-100">Geomap</div>
              <GeoMap data={data.geoData} />
            </div>
            <div className="rounded drop-shadow-sm h-full bg-white">
              <div className="p-2 text-sm font-medium bg-gray-100">Summary</div>
              <SummaryStats stats={data.summaryStats} />
            </div>
          </div>
        </div>
      );
    }

    // Layout B
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px_500px] gap-4 h-full">
        <div className="rounded drop-shadow-sm h-full flex flex-col bg-white">
          <div className="p-2 text-sm font-medium bg-gray-100">Geomap</div>
          <GeoMap data={data.geoData} />
        </div>
        <div className="rounded drop-shadow-sm h-full flex flex-col bg-white">
          <div className="p-2 text-sm font-medium bg-gray-100">Patterns</div>
          <PatternList patterns={data.patterns} />
        </div>
        <div className="rounded drop-shadow-sm h-full flex flex-col bg-white">
          <div className="p-2 text-sm font-medium bg-gray-100">Pattern Details</div>
          <PatternDetails results={data.results} />
        </div>
      </div>
    );
  }, [data, layout]);

  return (
    <div className="h-screen w-screen grid grid-rows-[50px_1fr]">
      <div className="bg-blue-950 text-white px-3 py-1 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Geo Pattern Inspector</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm opacity-90">Layout</label>
          <select
            value={layout}
            onChange={(e) => setLayout(e.target.value as LayoutOption)}
            className="text-sm rounded px-2 py-1 bg-white text-black"
          >
            <option value="A">Layout A</option>
            <option value="B">Layout B</option>
          </select>
        </div>
      </div>
      <div className="overflow-hidden">
        {!data ? (
          <div className="h-full w-full p-4 text-sm text-gray-600">No compute results found. Go back to Upload.</div>
        ) : (
          <div className="h-full w-full p-4">{content}</div>
        )}
      </div>
    </div>
  );
}


