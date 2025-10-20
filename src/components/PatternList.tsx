import React from 'react';
import PatternListItem from './pattern/PatternListItem';
import { Pattern } from '../types/data.types';

interface PatternListProps {
  patterns: Pattern[];
  globalTargetValue: number;
  selectedPatternId: number | null;
  onSelectPattern: (patternId: number) => void;
}

export const PatternList: React.FC<PatternListProps> = ({
  patterns,
  globalTargetValue,
  selectedPatternId,
  onSelectPattern
}) => {
  return (
    // h-full + min-h-0 so this container can be measured inside flex parent; overflow-y-auto to scroll
    <div className="h-full min-h-0 overflow-y-auto p-2 text-sm space-y-2">
      {patterns.map((p) => (
        <PatternListItem
           key={p.id} 
           title={`Pattern ${p.id}`} 
           dataCount={p.rowCount ? +p.rowCount.toFixed(2) : 0}
           nConstraints={Object.keys(p.constraints || {}).length}
           targetValue={+p.targetMean.toFixed(2)}
           targetDiff={+p.targetMean - globalTargetValue}
           selected={selectedPatternId !== null ? +p.id === +selectedPatternId : false}
           onSelect={() => onSelectPattern(p.id)}
        />
      ))}
    </div>     
  );
};

export default PatternList;
