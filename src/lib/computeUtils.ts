
import { DataRow, NumericAttributeStats, NominalAttributeStats, DataSummary, PatternInternal, Pattern, Constraints, NominalConstraint, NumericConstraint, LocationSummaries, ParentLocationSummary } from '../types/data.types';

import * as aq from "arquero";
import * as d3 from "d3";

/**
 * Detects whether a column is numeric or nominal (string-based)
 */
function isNumericColumn(values: any[]): boolean {
  const numericCount = values.filter(
    (v) => v !== null && v !== "" && !isNaN(Number(v))
  ).length;
  return numericCount / values.length > 0; // at least 80% numeric
}

/**
 * Computes statistics for a numeric column
 */
function computeNumericStats(values: any[]): NumericAttributeStats {
  const nums = values
    .map((v) => (v === "" || v == null ? NaN : Number(v)))
    .filter((v) => !isNaN(v));

  const mean = d3.mean(nums) ?? NaN;
  const min = d3.min(nums) ?? NaN;
  const max = d3.max(nums) ?? NaN;

  return { type: 0, mean, min, max };
}

/**
 * Computes category stats for a nominal column
 */
function computeNominalStats(values: any[]): NominalAttributeStats {
  const filtered = values.filter((v) => v != null && v !== "");
  const counts = d3.rollup(
    filtered,
    (v) => v.length,
    (v) => String(v)
  );

  const categories = Array.from(counts, ([value, count]) => ({ value, count }));
  categories.sort((a, b) => b.count - a.count);

  return { type: 1, categories };
}

/**
 * Load and analyze a CSV data file.
 * Works both on client (File upload) and server (path).
 */
export async function getDataSummary(data: DataRow[] | aq.Table): Promise<DataSummary> {

  const df = Array.isArray(data) ? aq.from(data) : data;
  const summary: DataSummary = {};

  for (const col of df.columnNames()) {
    const values = df.array(col) as any[];
    const numeric = isNumericColumn(values);

    summary[col] = numeric
      ? computeNumericStats(values)
      : computeNominalStats(values);
  }

  return summary;
}


export async function getParentLocationSummary(data: DataRow[], locations: string[], parentLocAttr: string): Promise<ParentLocationSummary> {
  const locSummary: ParentLocationSummary = {};
  for(const loc of locations) {
    const locData = data.filter(row => row[parentLocAttr] == loc);
    locSummary[loc] = await getDataSummary(locData);
  }
  return locSummary;
}


/**
 * Process pattern data.
 * This function will take in a DataRow[] argument, iterate over the rows,
 * and return a DataRow[] and some metadata about it.
 */
export function processPatternData(patternsRaw: DataRow[]): PatternInternal[] {
  const processedPatterns: PatternInternal[] = [];

  for (const pattern of patternsRaw) {
    const desc = JSON.parse(pattern.description.toString().replace(/: -inf/g, ": '-inf'").replace(/: inf/g, ": 'inf'").replace(/'/g, '"'));
    processedPatterns.push({id: desc.ID, constraints: desc.constraints, targetMean: +pattern.mean, target: pattern.target as string});
  }

  return processedPatterns;
}

/**
 * Filters an array of records based on constraints.
 */
export function applyConstraints(data: DataRow[], constraints: Constraints): DataRow[] {
  return data.filter((row) => {
    for (const [col, rule] of Object.entries(constraints)) {
      if (!rule) continue;

      const val = row[col];

      // numeric constraint
      if ("lb" in rule || "ub" in rule) {
        const lb = rule.lb === "-inf" || rule.lb == null ? -Infinity : Number(rule.lb);
        const ub = rule.ub === "inf" || rule.ub == null ? Infinity : Number(rule.ub);
        const numVal = Number(val);

        if (val == null || isNaN(numVal) || numVal < lb || numVal > ub) return false;
      }

      // nominal constraint
      else if ("in" in rule && Array.isArray(rule.in)) {
        const allowed = new Set(rule.in.map(String));
        if (!allowed.has(String(val))) return false;
      }
    }
    return true;
  });
}

function mergeNumericConstraints(c1: NumericConstraint, c2: NumericConstraint): NumericConstraint {
  return ({
    lb: c1.lb === "-inf" || c2.lb === "-inf" 
        ? "-inf"
        : c1.lb == undefined || c2.lb == undefined ? c1.lb || c2.lb : Math.min(c1.lb ||0, c2.lb ),
    ub: c1.ub === "inf" || c2.ub === "inf" 
        ? "inf" 
        : c1.ub == undefined || c2.ub == undefined ? c1.ub || c2.ub : Math.max(c1.ub ||0, c2.ub )
  })
}

function mergeNominalConstraints(c1: NominalConstraint, c2: NominalConstraint): NominalConstraint {
  return ({
    in: [...new Set([...c1.in, ...c2.in])]
  })
}


function mergeConstraints(c1: NumericConstraint | NominalConstraint, c2: NumericConstraint | NominalConstraint): NumericConstraint | NominalConstraint {
  if(c1.hasOwnProperty('in') && c2.hasOwnProperty('in')) {
    return mergeNominalConstraints(c1 as NominalConstraint, c2 as NominalConstraint)
  }
  if (c1.hasOwnProperty('lb') && c2.hasOwnProperty('lb')) {
    return mergeNumericConstraints(c1 as NumericConstraint, c2 as NumericConstraint)
  }
  return c1
}

/**
 * Compute descriptive stats for all patterns
 */
export async function analyzePatterns(data: DataRow[], patterns: PatternInternal[]): Promise<{patterns: Pattern[], locationSummary: LocationSummaries, target: string}> {
  const results: Pattern[] = [];
  let target: string = '';
  const locSummary: LocationSummaries = data.reduce((acc, row) => {
    const loc = +row['fips'];
    acc[loc] = { 
      name: row['county'] as string,
      parent: row['state'] as string,
      targetValue: 0,
      patterns: [],
      constraints: {}
    };
    return acc;
  }, {} as LocationSummaries);

  for (const p of patterns) {
    const subset = applyConstraints(data, p.constraints)
    
    const rowCount = subset.length;
    if (rowCount === 0) {
      results.push({ ...p, rowCount: 0, summary: {}, locations: []});
      continue;
    }

    const locations: number[] = []

    for(const row of subset) {
      const loc = +row['fips'];
      locSummary[loc].patterns.push(p.id);
      locSummary[loc].targetValue += row[p.target] as number
      locations.push(+loc);

      for(const constraint of Object.keys(p.constraints)) {
        if(locSummary[loc].constraints.hasOwnProperty(constraint)){
          locSummary[loc].constraints[constraint].count += 1;
          locSummary[loc].constraints[constraint].constraint = mergeConstraints(locSummary[loc].constraints[constraint].constraint, p.constraints[constraint])
          continue;
        } 

        locSummary[loc].constraints[constraint] = {
          count: 1,
          constraint: p.constraints[constraint]
        }
      }
    }

    target = String(p.target)

    // Use the same logic from csvAnalyzer
    const summary: DataSummary = await getDataSummary(subset);

    results.push({ ...p, rowCount, summary, locations });
  }

  return { patterns: results, locationSummary: locSummary, target: target };
}





