import FeatureRange from "./FeatureRange";
import FeatureLabel from "./FeatureLabel";
import { DataSummary, Pattern } from "../types/data.types";

interface PatternInformationProps {
  title: string;
  pattern: Pattern | null;
  globalAttributeSummary: DataSummary;
}

const PatternInformation = ({
  title,
  pattern,
  globalAttributeSummary,
}: PatternInformationProps) => {
  if (pattern === null) {
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

  const chartWidth = 400;
  const labelWidth = 110;
  const rowHeight = 55;
  const barHeight = 12;
  const offsetTop = 20;
  const padding = 0;

  const constraintNames = Object.keys(pattern.constraints);

  return (
    <div className="flex flex-col w-full h-full bg-white p-4">
      {/* Header */}
      <h2 className="text-md font-semibold text-gray-800">
        {title}
      </h2>

      {/* Legend */}
      <div className="flex flex-row justify-center gap-8 mt-3 mb-2 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <p>U.S. Range</p>
          <div className="w-4 h-3 bg-gray-300 rounded-sm" />
        </div>
        <div className="flex items-center gap-2">
          <p>Pattern Range</p>
          <div className="w-4 h-3 bg-blue-400 rounded-sm" />
        </div>
      </div>

      {/* Attribute ranges list */}
      <div className="overflow-y-auto overflow-x-hidden w-full flex-grow">
        <svg width="100%" height={rowHeight * constraintNames.length} className="overflow-visible ml-4">
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
                width={chartWidth - labelWidth}
                rowHeight={rowHeight}
                barHeight={barHeight}
                histoHeight={0}
                offsetTop={offsetTop}
                offsetLeft={labelWidth + padding}
                showMeans={false}
                attrType={globalAttributeSummary[attrName].type}
                localRange={pattern.summary[attrName]}
                globalRange={globalAttributeSummary[attrName]}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default PatternInformation;
