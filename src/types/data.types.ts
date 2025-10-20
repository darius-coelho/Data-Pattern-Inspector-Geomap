export type DataRow = Record<string, string | number>;

export type NumericAttributeStats = {
  type: 0;
  mean: number;
  min: number;
  max: number;
};

export type NominalAttributeStats = {
  type: 1;
  categories: { value: string; count: number }[];
};

export type AttributeSummary = NumericAttributeStats | NominalAttributeStats;

export interface DataSummary {
  [attributeName: string]: AttributeSummary;
}

export interface ParentLocationSummary {
  [location: string]: DataSummary
}

export type NumericConstraint = {
  lb?: number | "-inf";
  ub?: number | "inf";
};

export type NominalConstraint = {
  in: string[];
};

export type Constraints = Record<string, NumericConstraint | NominalConstraint>;
export type LocationConstraints = Record<string, {count: number, constraint: NumericConstraint | NominalConstraint}>;

export type PatternInternal = {
  id: number;
  constraints: Constraints;
  target: string;
  targetMean: number;
};

export type Pattern = {
  id: number;
  constraints: Constraints;
  target: string;
  targetMean: number;
  rowCount: number;
  summary: DataSummary;
  locations: number[]
};

export type LocationSummary = {
  name: string;
  parent: string
  targetValue: number;
  patterns: number[];
  constraints: LocationConstraints;
}

export type LocationSummaries = {
  [locationId: number]: LocationSummary
};

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export type ComputeResult = {
  data: DataRow[],
  dataSummary: DataSummary;
  parentLocationSummary: ParentLocationSummary;
  patterns: Pattern[];
  locations: LocationSummaries;
  target: string;
  fileMetadata: {
    datasetFile: FileMetadata;
    patternFile: FileMetadata;
  };
  computedAt: string;
}