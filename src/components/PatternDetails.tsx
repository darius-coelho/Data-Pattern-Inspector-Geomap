import React, { useEffect, useState } from 'react';
import { Pattern, DataRow, NumericAttributeStats, DataSummary } from '../types/data.types';
import { PatternMetricsBar } from './PatternMetricsBar';
import PatternAttributePanel from './PatternAttributePanel';
import { ScatterPlot } from './Scatterplot';

interface PatternDetailsProps {
  data: DataRow[],
  pattern: Pattern | null;
  targetAttributeName: string | null;
  globalTargetSummary: NumericAttributeStats;
  globalAttributes: DataSummary;
}

export const PatternDetails: React.FC<PatternDetailsProps> = ({
  data, pattern, targetAttributeName, globalTargetSummary, globalAttributes
}) => {

  if (!pattern) {
    return (
      <div className="p-3 text-sm">
        <div className="text-xs text-gray-600">No pattern selected</div>
      </div>
    );
  }
  if (pattern == null || pattern.summary == null || targetAttributeName == null) {
    return (
      <div className="p-3 text-sm">
        <div className="text-xs text-gray-600">No pattern selected</div>
      </div>
    );
  }

  useEffect(() => {
    setXKey(Object.keys(pattern.constraints)[0]);
  }, [pattern]);

  const [xKey, setXKey] = useState<string>(Object.keys(pattern.constraints)[0]);

  const patternAttributeSummary = pattern.summary[targetAttributeName] as NumericAttributeStats;

  const metrics = [
    { name: 'Data Count', value: pattern.rowCount || 0, reference: data.length || 0 },
    { name: 'Target Value', value: pattern.targetMean || 0, reference: globalTargetSummary.mean || 0 },
    { name: 'Target Min', value: patternAttributeSummary.min || 0, reference: globalTargetSummary.min || 0 },
    { name: 'Target Max', value: patternAttributeSummary.max || 0, reference: globalTargetSummary.max || 0 }
  ];

  return (
    <div className="p-3 text-sm">
      <PatternMetricsBar metrics={metrics} />

      <ScatterPlot
        data={data}
        constraints={pattern.constraints}
        xKey={xKey}
        isNumericX={globalAttributes[xKey] != null ? globalAttributes[xKey].type === 0 : false}
        yKey={targetAttributeName as string}
        onXChange={setXKey}
        xOptions={Object.keys(data[0]).filter((k) => k !== targetAttributeName)}
      />

      <div className="flex-grow mt-4">
        <PatternAttributePanel
          title="Pattern Constraints"
          pattern={pattern}
          globalAttributeSummary={globalAttributes}
        />
      </div>
    </div>
  );
};
