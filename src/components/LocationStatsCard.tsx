import React from "react";

interface LocationStatsCardProps {
  targetName: string;
  countyTargetValue: number;
  stateTargetMean: number;
  countryTargetMean: number;
}

export const LocationStatsCard: React.FC<LocationStatsCardProps> = ({
  targetName,
  countyTargetValue,
  stateTargetMean,
  countryTargetMean
}) => {
  return (
    <div className="flex flex-col h-full p-4 pt-2 gap-2 rounded-xl bg-gray-50">
      <h3 className="text-sm font-medium text-blue-800 mb-2">{targetName}</h3>
      <div>
        <p className="text-xs text-gray-500">County</p>
        <p className="text-lg font-semibold">{countyTargetValue.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">State Mean</p>
        <p className="text-lg font-semibold">{stateTargetMean.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Country Mean</p>
        <p className="text-lg font-semibold">{countryTargetMean.toFixed(2)}</p>
      </div>
    </div>
  );
};
