// Web Worker for heavy computation tasks
// This worker processes CSV files and generates analysis results
import { parseCSV } from '../lib/fileUtils';
import { processPatternData, analyzePatterns, getDataSummary, getParentLocationSummary } from '../lib/computeUtils';

import { ComputeResult, DataRow, NominalAttributeStats } from '../types/data.types';

self.onmessage = async (e: MessageEvent) => {
  try {
    const { datasetFile, patternsFile } = e.data;
    
    // Post initial progress
    self.postMessage({ type: 'progress', value: 0.1 });

    let [datasetFileContent, patternsFileContent] = await Promise.all([
      datasetFile.text(),
      patternsFile.text(),
    ]);

    self.postMessage({ type: 'progress', value: 0.2 });

    // Parse the CSV files
    const datasetRows = parseCSV(datasetFileContent) as DataRow[];
    const patternsRows = parseCSV(patternsFileContent) as DataRow[];

    self.postMessage({ type: 'progress', value: 0.3 });
    
    const patternsIntermediate = processPatternData(patternsRows);

    self.postMessage({ type: 'progress', value: 0.4});

    const dataSummary = await getDataSummary(datasetRows);

    const parentLocationSummary = await getParentLocationSummary(datasetRows, (dataSummary['state'] as NominalAttributeStats).categories.map(c => c.value), 'state');

    self.postMessage({ type: 'progress', value: 0.5 });

    const {patterns, locationSummary, target } = await analyzePatterns(datasetRows, patternsIntermediate);

    self.postMessage({ type: 'progress', value: 0.9 });
    
    // Create final result
    const result: ComputeResult = {
      data: datasetRows,
      patterns: patterns,
      dataSummary: dataSummary,
      parentLocationSummary: parentLocationSummary,
      locations: locationSummary,
      target: target,
      fileMetadata: {
        datasetFile: {
          name: datasetFile.name,
          size: datasetFile.size,
          type: datasetFile.type,
          lastModified: datasetFile.lastModified
        },
        patternFile: {
          name: patternsFile.name,
          size: patternsFile.size,
          type: patternsFile.type,
          lastModified: patternsFile.lastModified
        }
      },
      computedAt: new Date().toISOString()
    };
    
    self.postMessage({ type: 'progress', value: 1.0 });
    
    // Post final result
    self.postMessage({ type: 'done', data: result });
    
  } catch (error) {
    console.error('Compute worker error:', error);
    self.postMessage({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
};
