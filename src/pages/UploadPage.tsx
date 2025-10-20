import React, { useState, useRef, useEffect } from 'react';
import { FileUploader } from '../components/FileUploader';
import { ValidationResult } from '../utils/types';
import { ComputeResult } from '../types/data.types';
import { saveResult } from '../utils/indexedDB';

// --- Helper Icon Components ---
const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

const ExclamationCircleIcon = () => (
  <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5 mr-2 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


// --- Main Upload Page Component ---
interface UploadPageProps {
  onNavigateToDashboard: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onNavigateToDashboard }) => {
  const [datasetFile, setDatasetFile] = useState<File | null>(null);
  const [patternsFile, setPatternsFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [computationProgress, setComputationProgress] = useState(0);
  const [computationError, setComputationError] = useState<string | null>(null);
  
  const validateWorkerRef = useRef<Worker | null>(null);
  const computeWorkerRef = useRef<Worker | null>(null);

  // --- Automatic Validation Logic ---
  useEffect(() => {
    validateWorkerRef.current?.terminate();
    
    if (datasetFile && patternsFile) {
      validateFiles();
    }
    
    return () => {
        validateWorkerRef.current?.terminate();
        computeWorkerRef.current?.terminate();
    }
  }, [datasetFile, patternsFile]);


  const validateFiles = async () => {
    setIsValidating(true);
    setValidationResult(null);
    setComputationError(null);
    
    validateWorkerRef.current = new Worker(new URL('../workers/validateWorker.ts', import.meta.url), { type: 'module' });
    
    validateWorkerRef.current.onmessage = (e) => {
      const { type, success, errors } = e.data;
      if (type === 'validation-complete') {
        setValidationResult({ success, errors });
        setIsValidating(false);
      }
    };
    
    validateWorkerRef.current.onerror = (error) => {
      console.error('Validation worker error:', error);
      setValidationResult({ success: false, errors: ['Validation failed due to a worker error.'] });
      setIsValidating(false);
    };
    
    validateWorkerRef.current.postMessage({ datasetFile, patternsFile });
  };

  const startComputation = async () => {
    if (!datasetFile || !patternsFile || !validationResult?.success) return;
    
    setIsComputing(true);
    setComputationProgress(0);
    setComputationError(null);
    
    computeWorkerRef.current = new Worker(new URL('../workers/computeWorker.ts', import.meta.url), { type: 'module' });
    
    computeWorkerRef.current.onmessage = (e) => {
      const { type, value, data, error } = e.data;
      
      if (type === 'progress') {
        setComputationProgress(value * 100);
      } else if (type === 'done' && data) {
        saveResult(data as ComputeResult)
          .then(() => onNavigateToDashboard())
          .catch((saveError) => {
            console.error('Failed to save result:', saveError);
            setComputationError('Failed to save computation results.');
          })
          .finally(() => setIsComputing(false));
      } else if (type === 'error') {
        setComputationError(error || 'An unknown computation error occurred.');
        setIsComputing(false);
      }
    };
    
    computeWorkerRef.current.onerror = (error) => {
      console.error('Compute worker error:', error);
      setComputationError('Computation failed due to a worker error.');
      setIsComputing(false);
    };
    
    computeWorkerRef.current.postMessage({ datasetFile, patternsFile });
  };
  
  const handleFileSelect = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (file: File | null) => {
    setValidationResult(null);
    setter(file);
  }

  const renderStatusMessage = () => {
    if (isValidating) {
        return (
            <div className="flex items-center text-gray-600">
                <SpinnerIcon />
                <span>Validating files...</span>
            </div>
        );
    }

    if (validationResult) {
        if (validationResult.success) {
            return (
                <div className="flex items-center text-green-700">
                    <CheckCircleIcon />
                    <span>Files are valid and ready to load.</span>
                </div>
            );
        }
        return (
            <div className="flex items-start text-red-700">
                <ExclamationCircleIcon />
                <div>
                    <span className="font-semibold">Validation Failed</span>
                    <ul className="list-disc list-inside mt-1 text-sm">
                        {validationResult.errors?.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <p className="text-gray-500">Please upload both a dataset and a pattern file to continue.</p>
    );
  }

  return (
    <div className="relative min-h-screen font-sans antialiased">
      {/* Background Image and Overlay */}
       <div
        className="pointer-events-none absolute inset-0 bg-no-repeat bg-cover bg-center opacity-10 bg-zoom"
        style={{ backgroundImage: "url('/kindpng_619182.png')" }}
      />

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-700">Geo-Data Pattern Inspector</h1>
            <p className="text-lg text-gray-600 mt-2">View pattern data mined with the AK analyst on a geomap dashboard.</p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl">
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploader
                  label="Dataset File (CSV, up to 50MB)"
                  accept=".csv,text/csv"
                  maxSize={50 * 1024 * 1024}
                  onFileSelect={handleFileSelect(setDatasetFile)}
                  selectedFile={datasetFile}
                  isLoading={isComputing}
                />
                <FileUploader
                  label="Pattern File (CSV, up to 1MB)"
                  accept=".csv,text/csv"
                  maxSize={1024 * 1024}
                  onFileSelect={handleFileSelect(setPatternsFile)}
                  selectedFile={patternsFile}
                  isLoading={isComputing}
                />
              </div>
            </div>

            <div className="bg-gray-50/80 px-8 py-6 border-t border-gray-200 rounded-b-xl">
              {isComputing ? (
                <div className="space-y-3">
                  <div className="bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-width duration-300"
                      style={{ width: `${computationProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-center text-indigo-700 font-medium">
                    Loading dashboard... {Math.round(computationProgress)}%
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="min-h-[2.5rem] flex-grow flex items-center">
                      {computationError ? (
                          <div className="flex items-start text-red-700">
                              <ExclamationCircleIcon />
                              <div>
                                  <span className="font-semibold">Processing Error</span>
                                  <p className="text-sm">{computationError}</p>
                              </div>
                          </div>
                      ) : (
                          renderStatusMessage()
                      )}
                  </div>
                  <button
                    onClick={startComputation}
                    disabled={!validationResult?.success || isComputing}
                    className="w-full sm:w-auto flex-shrink-0 px-6 py-2.5 rounded-md font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700"
                  >
                    Load Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};