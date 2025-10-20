import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PatternList } from '../components/PatternList';
import { PatternDetails } from '../components/PatternDetails';
import { USChoroplethMap } from '../components/USChoroplethMap';
import { LocationSummaryPanel } from '../components/LocationSummary';
import { LayoutMode } from '../utils/types';
import { LayoutStorage } from '../utils/indexedDB';
import { ComputeResult, NumericAttributeStats } from '../types/data.types';

interface DashboardPageProps {
  onNavigateToUpload: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToUpload }) => {
  const [computeResult, setComputeResult] = useState<ComputeResult | null>(null);
  const [selectedPatternId, setSelectedPatternId] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('MP');

  // Load layout + data once on mount
  useEffect(() => {
    setLayoutMode(LayoutStorage.getLayoutMode());
    loadData();
  }, []);


  //Use useCallback to avoid re-renders in child components
  const loadData = useCallback(async () => {
    try {
      const { getResult } = await import('../utils/indexedDB');
      const result = await getResult();

      if (result && result.patterns.length && result.target.length > 0) {
        setComputeResult(result);
        setSelectedPatternId(result.patterns[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, []);

  const handleSelectPattern = useCallback(
    (patternId: number) => {
      setSelectedPatternId(prev => (prev === patternId ? null : patternId));
    },
    []
  );

  const handleSelectLocation = useCallback(
    (locationId: number) => {
      setSelectedLocation(prev => (prev === locationId ? null : locationId));
    },
    []
  );

  const handleLayoutChange = useCallback((newLayout: LayoutMode) => {
      setLayoutMode(newLayout);
      LayoutStorage.setLayoutMode(newLayout);
    }, []
  );
  
  const handleClearData = useCallback(async () => {
      if (window.confirm('Clear all data? This cannot be undone.')) {
        try {
          const { clearData } = await import('../utils/indexedDB');
          await clearData();
          onNavigateToUpload();
        } catch (error) {
          console.error('Failed to clear data:', error);
          alert('Failed to clear data. Please try again.');
        }
      }
    }, 
    [onNavigateToUpload]
  );

  // Memoize expensive computations
  const pattern = useMemo(() => {
    if (!computeResult || selectedPatternId === null) return null;
    return computeResult.patterns.find(p => p.id === selectedPatternId) ?? null;
  }, [computeResult, selectedPatternId]);

  const locationData = useMemo(() => {
    if (computeResult === null || selectedLocation === null) return null;
    return computeResult.data.find(d => d.fips === selectedLocation) ?? null;
  }, [pattern, selectedLocation]);

  // Derived content layout
  const content = useMemo(() => {
    
    if (!computeResult || computeResult.target.length < 1) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center p-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Data Available
            </h2>
            <p className="text-gray-600 mb-6">
              Upload and process your files to view the dashboard.
            </p>
            <button
              onClick={onNavigateToUpload}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Upload Files
            </button>
          </div>
        </div>
      );
    }

    const targetAttributeName = computeResult.target

    const sharedMapProps = {
      target: targetAttributeName,
      locationSummary: computeResult.locations,
      highlightedFips: pattern?.locations ?? [],
      selectedFips: selectedLocation,
      onSelectFips: handleSelectLocation,
      values: computeResult.data.map(d => d[targetAttributeName] as number),
    };

    const sharedLocationSummaryPanelProps = {
      targetName: targetAttributeName,
      locationSummary:
        selectedLocation !== null
          ? computeResult.locations[selectedLocation]
          : null,
      locationData: locationData === undefined ? {} : locationData,
      parentLocationSummary: locationData === undefined || locationData === null ? {} : computeResult.parentLocationSummary[locationData['state']],
      globalAttributes: computeResult.dataSummary,
    };

    const sharedPatternDetailsProps = {
      data: computeResult.data,
      pattern,
      targetAttributeName,
      globalTargetSummary: computeResult.dataSummary[
        targetAttributeName
      ] as NumericAttributeStats,
      globalAttributes: computeResult.dataSummary,
    };

    const countSummaryTitle = selectedLocation === null || locationData === null 
                              ? "County Summary" 
                              : `${computeResult.locations[selectedLocation].name}, ${locationData['state']}`;
    
    if (layoutMode === 'PM') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_500px_1fr] gap-3 h-full min-h-0 min-w-0">
          {/* Patterns */}
          <div className="flex flex-col bg-white rounded drop-shadow-sm h-full min-h-0 min-w-0">
            <div className="p-2 text-sm font-medium bg-gray-100 shrink-0">Patterns</div>
            <div className="flex-1 min-h-0 min-w-0 overflow-auto p-1">
              <PatternList
                patterns={computeResult.patterns}
                globalTargetValue={(computeResult.dataSummary[targetAttributeName] as NumericAttributeStats).mean}
                selectedPatternId={selectedPatternId}
                onSelectPattern={handleSelectPattern}
              />
            </div>
          </div>

          {/* Pattern Details */}
          <div className="flex flex-col bg-white rounded drop-shadow-sm h-full min-h-0 min-w-0">
            <div className="p-2 text-sm font-medium bg-gray-100 shrink-0">Pattern Details</div>
            <div className="flex-1 min-h-0 min-w-0 overflow-auto p-2">
              <PatternDetails {...sharedPatternDetailsProps} />
            </div>
          </div>

          {/* Geo + Summary */}
          <div className="grid grid-rows-[3fr_2fr] gap-3 h-full min-h-0 min-w-0">
            <div className="flex flex-col bg-white rounded drop-shadow-sm min-h-0 min-w-0">
              <div className="p-2 text-sm font-medium bg-gray-100 shrink-0">Geomap</div>
              <div className="flex-1 min-h-0 min-w-0 overflow-hidden p-2">
                <USChoroplethMap {...sharedMapProps} />
              </div>
            </div>

            <div className="flex flex-col bg-white rounded drop-shadow-sm min-h-0 min-w-0 h-full">
              <div className="p-2 text-sm font-medium bg-gray-100 shrink-0">{countSummaryTitle}</div>
              <div className="flex-1 min-h-0 min-w-0 p-2">
                <LocationSummaryPanel {...sharedLocationSummaryPanelProps} />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Layout Map -> Pattern
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px_500px] gap-3 h-full min-h-0 min-w-0">
        <div className="grid grid-rows-[3fr_2fr] gap-3 min-h-0 min-w-0">
          <div className="flex flex-col bg-white rounded drop-shadow-sm min-h-0 min-w-0">
            <div className="p-2 text-sm font-medium bg-gray-100 shrink-0">Geomap</div>
            <div className="flex-1 min-h-0 min-w-0 overflow-hidden p-2">
              <USChoroplethMap {...sharedMapProps} />
            </div>
          </div>

          <div className="flex flex-col bg-white rounded drop-shadow-sm min-h-0 min-w-0">
            <div className="p-2 text-sm font-medium bg-gray-100 shrink-0">Summary</div>
            <div className="flex-1 min-h-0 min-w-0 overflow-auto p-2">
              <LocationSummaryPanel {...sharedLocationSummaryPanelProps} />
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-white rounded drop-shadow-sm min-h-0 min-w-0">
          <div className="p-2 text-sm font-medium bg-gray-100 shrink-0">Patterns</div>
          <div className="flex-1 min-h-0 min-w-0 overflow-auto p-1">
            <PatternList
              patterns={computeResult.patterns}
              globalTargetValue={(computeResult.dataSummary[targetAttributeName] as NumericAttributeStats).mean}
              selectedPatternId={selectedPatternId}
              onSelectPattern={handleSelectPattern}
            />
          </div>
        </div>

        <div className="flex flex-col bg-white rounded drop-shadow-sm min-h-0 min-w-0">
          <div className="p-2 text-sm font-medium bg-gray-100 shrink-0">Pattern Details</div>
          <div className="flex-1 min-h-0 min-w-0 overflow-auto p-2">
            <PatternDetails {...sharedPatternDetailsProps} />
          </div>
        </div>
      </div>
    );
  }, [
    computeResult,
    selectedPatternId,
    selectedLocation,
    layoutMode,
    handleSelectPattern,
    handleSelectLocation,
    onNavigateToUpload,
  ]);

  // ✅ Loading screen (no full page scroll)
  if (!computeResult) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Dashboard
          </h2>
          <p className="text-gray-600">Preparing Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen grid grid-rows-[50px_minmax(0,1fr)] overflow-hidden">
      {/* Header */}
      <div className="bg-blue-950 text-white px-3 py-1 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold">Geo Pattern Inspector</h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-90">Layout</label>
            <select
              value={layoutMode}
              onChange={e => handleLayoutChange(e.target.value as LayoutMode)}
              className="text-sm rounded px-2 py-1 bg-white text-black"
            >
              <option value="MP">{`Map -> Pattern`}</option>
              <option value="PM">{`Pattern -> Map`}</option>
            </select>
          </div>

          <button
            onClick={handleClearData}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
          >
            Upload
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-0 overflow-hidden p-3 bg-gray-50">{content}</div>
    </div>
  );
};

export default DashboardPage;
