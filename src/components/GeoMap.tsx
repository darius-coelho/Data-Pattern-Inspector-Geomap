export type GeoPoint = { lat: number; lng: number; value: number; id?: string };

export function GeoMap({ data }: { data: GeoPoint[] }) {
  return (
    <div className="p-3 text-sm">
      <div className="text-xs text-gray-600">Geomap placeholder</div>
      <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded border">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}



