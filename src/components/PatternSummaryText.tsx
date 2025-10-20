interface PatternSummaryTextProps {
  locationCount: number;
  targetMean: number;
  target: string;
}

/**
 * PatternSummaryText:
 * Displays a short text summary about the selected pattern.
 */
export default function PatternSummaryText({ locationCount, targetMean, target }: PatternSummaryTextProps) {
  return (
    <div className="flex flex-col text-center">
      <p className="text-sm text-gray-600 mt-1">
        {`This pattern appears in `}
        <strong>{locationCount}</strong>
        {` locations which have an avg. `}
        <strong>{target}</strong>
        {` of `}
        <strong>{parseFloat(String(targetMean)).toFixed(1)}</strong>
      </p>
    </div>
  );
}
