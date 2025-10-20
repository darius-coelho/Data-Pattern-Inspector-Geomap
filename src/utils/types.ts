
export interface ValidationResult {
  success: boolean;
  errors?: string[];
  warnings?: string[];
}

export type LayoutMode = 'PM' | 'MP';

export interface WorkerMessage {
  type: 'validation-complete' | 'progress' | 'done' | 'error';
  success?: boolean;
  value?: number;
  data?: any;
  error?: string;
}
