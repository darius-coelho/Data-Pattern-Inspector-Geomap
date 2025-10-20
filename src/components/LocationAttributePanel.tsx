import { useRef, useEffect, useState } from "react";
import FeatureRange from "./FeatureRange";
import FeatureLabel from "./FeatureLabel";
import { DataRow, DataSummary } from "../types/data.types";

interface PatternInformationProps {
  title: string;
  constraintNames: string[];
  locationData: DataRow | null;
  parentLocationSummary: DataSummary;
  globalAttributeSummary: DataSummary;
}

/**
 * PatternInformation:
 * Displays a list of attribute ranges for the selected pattern.
 */
const PatternInformation = ({
  title,
  constraintNames,
  locationData,
  parentLocationSummary,
  globalAttributeSummary,
}: PatternInformationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setSvgWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!parentLocationSummary || !locationData) {
    return (
      <div className="flex flex-col w-full h-full bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-800 tracking-wide uppercase">
          {title}
        </h2>
        <p className="text-sm text-gray-500 mt-3 ml-2">
          Select a pattern from those listed below in the pattern browser.
        </p>
      </div>
    );
  }

  const labelWidth = 120;
  const rowHeight = 55;
  const barHeight = 12;
  const offsetTop = 20;
  const padding = 0;

  const rangeWidth = Math.max(svgWidth - labelWidth - 25, 0);

  return (
    <div className="flex flex-col w-full h-full bg-white p-2">
      {/* Fixed Header + Legend */}
      <div className="sticky top-0 z-10 bg-white pb-1">
        {/* Header */}
        <h2 className="text-sm font-semibold text-gray-800">
          {title}
        </h2>
        {/* Legend */}
        <div className="flex flex-row justify-center gap-8 mt-3 mb-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <p>U.S. Range</p>
            <div className="w-4 h-3 bg-gray-300 rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
            <p>State Range</p>
            <div className="w-4 h-3 bg-blue-400 rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
            <p>County Value</p>
            <div className="h-4 w-0.5 bg-black"></div>
          </div>
        </div>
      </div>

      {/* Scrollable SVG section */}
      <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <svg
          width="100%"
          height={rowHeight * constraintNames.length - 8}
          className="overflow-visible"
        >
          {constraintNames.map((attrName, i) => (
            <g key={attrName}>
              <FeatureLabel
                rowIdx={i}
                width={labelWidth}
                rowHeight={rowHeight}
                offsetTop={offsetTop - 2}
                offsetLeft={0}
                attribute={attrName}
              />
              <FeatureRange
                rowIdx={i}
                width={rangeWidth}
                rowHeight={rowHeight}
                barHeight={barHeight}
                histoHeight={0}
                offsetTop={offsetTop}
                offsetLeft={labelWidth + padding}
                showMeans={true}
                attrType={globalAttributeSummary[attrName].type}
                localRange={parentLocationSummary[attrName]}
                globalRange={globalAttributeSummary[attrName]}
                markerValue={locationData[attrName] as number}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default PatternInformation;
