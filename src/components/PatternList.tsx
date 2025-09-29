export type Pattern = { id: string; label: string; criteria: Record<string, string> };

export function PatternList({ patterns }: { patterns: Pattern[] }) {
  return (
    <div className="p-3 text-sm space-y-2">
      {patterns.map((p) => (
        <div key={p.id} className="rounded border p-2">
          <div className="font-medium">{p.label}</div>
          <div className="text-xs text-gray-600">{JSON.stringify(p.criteria)}</div>
        </div>
      ))}
    </div>
  );
}



