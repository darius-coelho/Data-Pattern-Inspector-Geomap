import React, { useCallback, useState } from 'react';

interface FileUploaderProps {
  label: string;
  accept: string;
  maxSize: number;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isLoading?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  accept,
  maxSize,
  onFileSelect,
  selectedFile,
  isLoading = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!accept.includes(extension || '')) {
      return 'Please select a CSV file';
    }
    
    return null;
  }, [maxSize, accept]);

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const removeFile = useCallback(() => {
    onFileSelect(null as any);
    setError(null);
  }, [onFileSelect]);

  return (
    <div className="w-full">
      <label className="block text-md font-semibold  text-gray-700 mb-2">
        {label}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : selectedFile
            ? 'border-green-500 bg-green-50'
            : error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        <div className="text-center">
          {selectedFile ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-700">
                {selectedFile.name}
              </div>
              <div className="text-xs text-green-600">
                {formatFileSize(selectedFile.size)}
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-xs text-red-600 hover:text-red-800 underline"
                disabled={isLoading}
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-primary-600 hover:text-primary-500">
                  Click to upload
                </span>
                {' '}or drag and drop
              </div>
              <div className="text-xs text-gray-500">
                CSV files up to {formatFileSize(maxSize)}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};
