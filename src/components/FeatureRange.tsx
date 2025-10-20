import { scaleLinear } from "d3";
import { abbreviateNumber } from "../lib/utilities";
import { AttributeSummary, NominalAttributeStats, NumericAttributeStats } from "../types/data.types";

const createScale = (width: number, padding: number, min: number, max: number) =>
  scaleLinear().domain([min, max]).range([padding, width + padding]).clamp(true);

interface FeatureRangeProps {
  rowIdx: number;
  width: number;
  rowHeight: number;
  barHeight: number;
  histoHeight: number;
  offsetTop: number;
  offsetLeft: number;
  showMeans: boolean;
  attrType: 0 | 1;
  localRange: AttributeSummary;
  globalRange: AttributeSummary;
  markerValue?: number;
}

/** Renders a numerical range bar with a global (gray) and pattern (blue) overlay */
const NumericalFeatureRange = ({
  rowIdx,
  width,
  rowHeight,
  barHeight,
  histoHeight,
  offsetTop,
  offsetLeft,
  showMeans,
  localRange,
  globalRange,
  markerValue
}: Omit<FeatureRangeProps, "localRange" | "globalRange"> & { localRange: [number, number]; globalRange: [number, number];}) => {
  const scale = createScale(width, offsetLeft, +globalRange[0], +globalRange[1]);
  const y = offsetTop + histoHeight + rowIdx * rowHeight;

  const globalMin = scale(+globalRange[0]);
  const globalMax = scale(+globalRange[1]);
  const patternMin = scale(+localRange[0]);
  const patternMax = scale(+localRange[1]);

  const patterMarkerY = showMeans ? y : y-4;
  const patternMarkerLabelY = showMeans ? y + barHeight + 14 : y - 6;

  return (
    <g>
      {/* Global range (gray) */}
       <rect
        x={globalMin}
        y={y}
        width={3}
        height={barHeight+4}
        fill="#dadada" // gray-200
      />

      <rect
        x={globalMax - 3}
        y={y}
        width={3}
        height={barHeight+4}
        fill="#dadada" // gray-200
      />

      <rect
        x={globalMin}
        y={y}
        width={globalMax - globalMin}
        height={barHeight}
        fill="#dadada" // gray-200
      >
        <title>
          {`Global Range: ${abbreviateNumber(globalRange[0], 3)} to ${abbreviateNumber(globalRange[1], 3)}`}
        </title>
      </rect>

      {/*Global Min/Max labels */}
      <text
        x={globalMin}
        y={y + barHeight + 14}
        fontSize={10}
        textAnchor="start"
        fill="#dadada" // gray-800
      >
        {abbreviateNumber(globalRange[0], 1)}
      </text>

      <text
        x={globalMax}
        y={y + barHeight + 14}
        fontSize={10}
        textAnchor="end"
        fill="#dadada"
      >
        {abbreviateNumber(globalRange[1], 1)}
      </text>

      {/* Pattern range (blue) */}
      <rect
        x={patternMin}
        y={patterMarkerY}
        width={3}
        height={barHeight+4}
        fill="#91b4ed" 
      />

      <rect
        x={patternMax - 3}
        y={patterMarkerY}
        width={3}
        height={barHeight+4}
        fill="#91b4ed" 
      />

      <rect
        x={patternMin}
        y={y}
        width={patternMax - patternMin}
        height={barHeight}
        fill="#91b4ed" 
      >
        <title>
          {`Pattern Range: ${abbreviateNumber(localRange[0], 3)} to ${abbreviateNumber(localRange[1], 3)}`}
        </title>
      </rect>


      {/*Pattern Min/Max labels */}
      <text
        x={patternMin}
        y={patternMarkerLabelY}
        fontSize={10}
        textAnchor={patternMax-patternMin < 35 ? "end" : "start"}
        fill="#1f2937" // gray-800
      >
        {abbreviateNumber(localRange[0], 1)}
      </text>
      <text
        x={patternMax}
        y={patternMarkerLabelY}
        fontSize={10}
        textAnchor={patternMax-patternMin < 35 ? "start" : "end"}
        fill="#1f2937"
      >
        {abbreviateNumber(localRange[1], 1)}
      </text>

      {/* Global mean */}
      {showMeans && markerValue !== undefined && (
        <>
        <line
          x1={scale(markerValue)}  
          y1={y-4}
          x2={scale(markerValue)}
          y2={y+barHeight}
          stroke="#1f2937"
          strokeWidth={2}
        />
        <text
          x={scale(markerValue)}
          y={y - 6}
          fontSize={10}
          textAnchor="middle"
          fill="#1f2937"
        >
          {abbreviateNumber(markerValue, 1)}
        </text>
        </>
      )}
    </g>
  );
};

/** Renders a categorical range bar with colored segments */
const NominalFeatureRange = ({
  rowIdx,
  width,
  rowHeight,
  barHeight,
  histoHeight,
  offsetTop,
  offsetLeft,
  localRange,
  globalRange,
}: Omit<FeatureRangeProps, "localRange" | "globalRange"> & { localRange: string[]; globalRange: string[] }) => {
  const y = offsetTop + histoHeight + rowIdx * rowHeight;
  const segmentWidth = width / globalRange.length;

  return (
    <g>
      {/* Global categories (gray) */}
      {globalRange.map((cat, i) => (
        <rect
          key={cat}
          x={offsetLeft + i * segmentWidth}
          y={y}
          width={Math.max(segmentWidth - 3, 0.3)}
          height={barHeight}
          fill="#dadada"
        >
          <title>{cat}</title>
        </rect>
      ))}

      {/* Pattern categories (blue) */}
      {localRange.map((cat) => {
        const idx = globalRange.indexOf(cat);
        if (idx === -1) return null;
        return (
          <rect
            key={`pattern-${cat}`}
            x={offsetLeft + idx * segmentWidth}
            y={y}
            width={Math.max(segmentWidth - 3, 0.3)}
            height={barHeight}
            fill="#91b4ed"
          >
            <title>{cat}</title>
          </rect>
        );
      })}
    </g>
  );
};

/** Main FeatureRange wrapper */
export default function FeatureRange(props: FeatureRangeProps) {
  if(props.attrType === 1){
    const localRange = (props.localRange as NominalAttributeStats).categories.map((v) => v.value) as string[]
    const globalRange = (props.globalRange as NominalAttributeStats).categories.map((v) => v.value) as string[]

    return (
      <NominalFeatureRange
        {...props}
        localRange={localRange}
        globalRange={globalRange}
      />
    )
  }
 
  const localRange = props.localRange as NumericAttributeStats
  const globalRange = props.globalRange as NumericAttributeStats

  return (
    <NumericalFeatureRange
      {...props}
      localRange={[localRange.min, localRange.max]}
      globalRange={[globalRange.min, globalRange.max]}
      markerValue={props.markerValue}
    />
  );
}
