export function SummaryStats({ stats }: { stats: Record<string, number> }) {
  return (
    <div className="p-3 text-sm">
      <div className="text-xs text-gray-600">Summary statistics</div>
      <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded border">{JSON.stringify(stats, null, 2)}</pre>
    </div>
  );
}



