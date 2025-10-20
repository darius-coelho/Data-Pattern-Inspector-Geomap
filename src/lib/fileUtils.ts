import * as Papa from 'papaparse';

import { DataRow } from "../types/data.types";

/**
 * Parse CSV content into an array of objects
 */
export function parseCSV(content: string): DataRow[] {
  const results = Papa.parse(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim().toLowerCase(),
  });
  return results.data as DataRow[];

}