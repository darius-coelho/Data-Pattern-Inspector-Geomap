import React from "react";

interface PatternListItemProps {
  title: string;
  dataCount: number;
  nConstraints: number;
  targetValue: number;
  targetDiff: number;
  selected?: boolean;
  onSelect?: () => void;
}

export const PatternListItem: React.FC<PatternListItemProps> = ({
  title,
  dataCount,
  nConstraints,
  targetValue,
  targetDiff,
  selected = false,
  onSelect,
}) => {
  return (
    <button
      onClick={onSelect}
      className={`
        w-full text-left rounded-xl border transition-all duration-200 overflow-hidden
        ${selected ? "border-blue-400 bg-blue-50 shadow-md" : "border-gray-200 bg-white shadow-sm hover:shadow-md"}
      `}
    >
      {/* Title Bar */}
      <div
        className={`
          px-4 py-2 
          ${selected ? "bg-blue-100" : "bg-gray-100"}
        `}
      >
        <h3 className="text-sm font-semibold text-gray-800 truncate">{title}</h3>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 lg:grid-cols-[2fr_3fr_2fr] gap-2 text-center p-3">
        {/* Data Count */}
        <div className="flex flex-col items-center">
          <div className="text-blue-500 text-lg font-bold leading-tight">
            {dataCount.toLocaleString()}
          </div>
          <div className="text-gray-500 text-[10px] uppercase tracking-wide mt-0.5">
            # Data
          </div>
        </div>

        {/* Constraints */}
        <div className="flex flex-col items-center">
          <div className="text-gray-400 text-lg font-bold leading-tight">
            {nConstraints}
          </div>
          <div className="text-gray-500 text-[10px] uppercase tracking-wide mt-0.5">
            # Constraints
          </div>
        </div>

        {/* Target Value */}
        <div className="flex flex-col items-center">
          <div className={`${targetDiff >= 0 ? "text-green-500" : "text-red-500"}  text-lg font-bold leading-tight`}>
            {targetValue}
          </div>
          <div className="text-gray-500 text-[10px] uppercase tracking-wide mt-0.5">
            Target
          </div>
        </div>
      </div>
    </button>
  );
};

export default PatternListItem;
