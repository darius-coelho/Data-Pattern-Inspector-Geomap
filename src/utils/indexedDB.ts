import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ComputeResult } from '../types/data.types';

interface AppDB extends DBSchema {
  results: {
    key: string;
    value: ComputeResult;
  };
  fileMetadata: {
    key: string;
    value: {
      datasetFile: {
        name: string;
        size: number;
        type: string;
        lastModified: number;
      };
      patternFile: {
        name: string;
        size: number;
        type: string;
        lastModified: number;
      };
    };
  };
}

const DB_NAME = 'DataPatternInspector';
const DB_VERSION = 1;
const RESULTS_STORE = 'results';
const METADATA_STORE = 'fileMetadata';

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create results store
        if (!db.objectStoreNames.contains(RESULTS_STORE)) {
          db.createObjectStore(RESULTS_STORE);
        }
        
        // Create file metadata store
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE);
        }
      },
    });
  }
  return dbPromise;
}

export async function saveResult(result: ComputeResult): Promise<void> {
  try {
    const db = await getDB();
    await db.put(RESULTS_STORE, result, 'latest');
    
    // Also save file metadata separately for quick access
    await db.put(METADATA_STORE, result.fileMetadata, 'latest');
  } catch (error) {
    console.error('Failed to save result to IndexedDB:', error);
    throw error;
  }
}

export async function getResult(): Promise<ComputeResult | null> {
  try {
    const db = await getDB();
    const result = await db.get(RESULTS_STORE, 'latest');
    return result || null;
  } catch (error) {
    console.error('Failed to get result from IndexedDB:', error);
    return null;
  }
}

export async function getFileMetadata(): Promise<ComputeResult['fileMetadata'] | null> {
  try {
    const db = await getDB();
    const metadata = await db.get(METADATA_STORE, 'latest');
    return metadata || null;
  } catch (error) {
    console.error('Failed to get file metadata from IndexedDB:', error);
    return null;
  }
}

export async function clearData(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(RESULTS_STORE);
    await db.clear(METADATA_STORE);
  } catch (error) {
    console.error('Failed to clear data from IndexedDB:', error);
    throw error;
  }
}

export async function hasStoredData(): Promise<boolean> {
  try {
    const db = await getDB();
    const result = await db.get(RESULTS_STORE, 'latest');
    return !!result;
  } catch (error) {
    console.error('Failed to check for stored data:', error);
    return false;
  }
}

// Local storage utilities for layout preference
export const LayoutStorage = {
  getLayoutMode: (): 'MP' | 'PM' => {
    try {
      const stored = localStorage.getItem('layoutMode');
      return (stored === 'PM') ? 'PM' : 'MP';
    } catch {
      return 'MP';
    }
  },
  
  setLayoutMode: (mode: 'MP' | 'PM'): void => {
    try {
      localStorage.setItem('layoutMode', mode);
    } catch (error) {
      console.warn('Failed to save layout mode:', error);
    }
  }
};
