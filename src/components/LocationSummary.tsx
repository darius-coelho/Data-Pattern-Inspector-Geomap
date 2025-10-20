import React from 'react';
import { DataRow, DataSummary, LocationSummary, NumericAttributeStats } from '../types/data.types';
import LocationAttributePanel from './LocationAttributePanel';
import { LocationStatsCard } from './LocationStatsCard';

interface LocationSummaryPanelProps {
  targetName: string;
  locationSummary: LocationSummary | null;
  locationData: DataRow | null;
  parentLocationSummary: DataSummary;
  globalAttributes: DataSummary;
}

export const LocationSummaryPanel: React.FC<LocationSummaryPanelProps> = ({
  targetName,
  locationSummary,
  locationData,
  parentLocationSummary,
  globalAttributes
}) => {

  if (locationSummary == null || locationData == null) {
    return (
      <div className="p-3 text-sm">
        <div className="text-xs text-gray-600">No location selected</div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-3 h-full min-h-0 min-w-0 p-2">
      <LocationStatsCard
        targetName={targetName}
        countyTargetValue={locationSummary.targetValue}
        stateTargetMean={(parentLocationSummary[targetName] as NumericAttributeStats).mean}
        countryTargetMean={(globalAttributes[targetName] as NumericAttributeStats).mean}
      />

      <div className="min-h-0 min-w-0 flex flex-col">
        <LocationAttributePanel
          title={`Risk Factors (${Object.keys(locationSummary.constraints).length})`}
          constraintNames={Object.keys(locationSummary.constraints)}
          locationData={locationData}
          parentLocationSummary={parentLocationSummary}
          globalAttributeSummary={globalAttributes}
        />
      </div>
    </div>
  );
};
