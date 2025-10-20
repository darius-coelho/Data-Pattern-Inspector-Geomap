// Web Worker for file validation
// This worker validates uploaded CSV files before processing

self.onmessage = async (e: MessageEvent) => {
  try {
    const { datasetFile, patternsFile } = e.data;
    
    // Basic validation checks
    const errors: string[] = [];
    
    // Check if both files are provided
    if (!datasetFile) {
      errors.push('Dataset file is required');
    }
    
    if (!patternsFile) {
      errors.push('Pattern file is required');
    }
    
    // If we have files, perform additional validation
    if (datasetFile && patternsFile) {
      // Check file types
      if (!datasetFile.type.includes('csv') && !datasetFile.name.endsWith('.csv')) {
        errors.push('Dataset file must be a CSV file');
      }
      
      if (!patternsFile.type.includes('csv') && !patternsFile.name.endsWith('.csv')) {
        errors.push('Pattern file must be a CSV file');
      }
      
      // Check file sizes (basic limits)
      const maxDatasetSize = 50 * 1024 * 1024; // 50MB
      const maxPatternSize = 1024 * 1024; // 1MB
      
      if (datasetFile.size > maxDatasetSize) {
        errors.push('Dataset file is too large (max 50MB)');
      }
      
      if (patternsFile.size > maxPatternSize) {
        errors.push('Pattern file is too large (max 1MB)');
      }
      
      // Simulate reading file headers for validation
      if (errors.length === 0) {
        try {
          const datasetText = await datasetFile.text();
          const patternText = await patternsFile.text();
          
          // Basic CSV structure validation
          const datasetLines = datasetText.split('\n').filter((line: string) => line.trim());
          const patternLines = patternText.split('\n').filter((line: string) => line.trim());
          
          if (datasetLines.length < 2) {
            errors.push('Dataset file must contain at least a header and one data row');
          }
          
          if (patternLines.length < 2) {
            errors.push('Pattern file must contain at least a header and one data row');
          }
          
          // Check for basic CSV structure (commas)
          if (datasetLines.length > 0 && !datasetLines[0].includes(',')) {
            errors.push('Dataset file does not appear to be a valid CSV format');
          }
          
          if (patternLines.length > 0 && !patternLines[0].includes(',')) {
            errors.push('Pattern file does not appear to be a valid CSV format');
          }

          const datasetHeaders = datasetLines[0].split(',');
          const requiredDataColumns = ['fips', 'county', 'state'];
          const missingDataColumns = requiredDataColumns.filter((col) => !datasetHeaders.includes(col));
          
          if (missingDataColumns.length > 0) {
            const missingColumnsString = missingDataColumns.map((col) => `"${col}"`).join(', ');
            errors.push(`Dataset file is missing required columns: ${missingColumnsString}`);
          }

          const patternHeaders = patternLines[0].split(',');
          const requiredPatternColumns = ['keys','description','target','count','mean','std','min','max'];
          const missingPatternColumns = requiredPatternColumns.filter((col) => !patternHeaders.includes(col));
          
          if (missingPatternColumns.length > 0) {
            const missingColumnsString = missingPatternColumns.map((col) => `"${col}"`).join(', ');
            errors.push(`Pattern file is missing required columns: ${missingColumnsString}`);
          }
          
        } catch (readError) {
          errors.push('Failed to read file contents for validation');
        }
      }
    }
    
    const success = errors.length === 0;
    
    // Post validation result
    self.postMessage({
      type: 'validation-complete',
      success,
      errors: success ? undefined : errors
    });
    
  } catch (error) {
    // Handle unexpected errors
    self.postMessage({
      type: 'validation-complete',
      success: false,
      errors: ['An unexpected error occurred during validation']
    });
  }
};
