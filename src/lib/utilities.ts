/**
 * Abbreviates a number by adding K M B T etx
 * @param value - Number to be abbreviated
 * @param fixed - The maximum number of numbers after the decimal point
 * 
 * @returns Number abbreviated by appending letter for power up to trillion e.g. '1.5K', '1.5M', '1.5B', '1.5T'
 */
export function abbreviateNumber(value: number|string|null, fixed: number): string {
    if (value === null) {  // terminate early
        return "NaN";
    }
    if (value === 0) {
        return '0'; // terminate early
    }
    if (value === '-inf' || value === 'inf') {
        return value; // terminate early
    }
    const num = +value
    fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
    const b = (num).toPrecision(2).split("e"), // get power
        k = b.length === 1 ? 0 : Math.floor(Math.min(+b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
        c = k < 1 ? +num.toFixed(fixed) : +(num / Math.pow(10, k * 3) ).toFixed(fixed), // divide by power
        d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
        e = d + ['',  'K', 'M', 'B', 'T'][k]; // append power
    return e;
}


/**
 * Abbreviates a string by adding ellipsis
 * @param text - The string to be abbreviated
 * @param maxLen - The maximum number of characters desired before adding ellipsis
 * 
 * @returns text abbreviated to maxLen with additional characters replaced with ellipsis
 */
export function abbreviateText(text: string, maxLen: number): string {
    let newText = text
    if(newText.length > maxLen){
        newText = newText.slice(0, maxLen) + "..."
    }
    return newText
}


/**
 * Returns a color string from a grayscale discrete color map for css style
 * @param idx - An index for the grayscale value in the map
 * 
 * @returns an rgb string for a gray value to be used in css
 */
export function grayScheme(idx:number): string {
    const start = 220
    const end = 40
    const step = (start-end) / 8

    const grayVal = start - step*(idx%9)

    return `rgb(${grayVal}, ${grayVal}, ${grayVal})`
}


/**
 * Test if a value is within a range
 * @param val - The value to be tested
 * @param min - The range's lower bound
 * @param max - The range's upper bound
 * @param bounds - string indicating if min and max should be included or excluded in the range
 * 
 * @returns a boolean indicating if the value is within the specified range
 */
export function isInRange(val: number, min: number|"-inf" ='-inf', max: number|string='inf', bounds: "include"|"exclude" ="include"): boolean {
    const minTest = min === '-inf' || (bounds === "include" ? val >= +min : val > +min)
    const maxTest = max === 'inf' || (bounds === "include" ? val <= +max : val < +max)
    return minTest && maxTest
}


/**
 * Test if a value is and integer and is within a range
 * @param val - The value to be tested
 * @param min - The range's lower bound
 * @param max - The range's upper bound
 * @param bounds - string indicating if min and max should be included or excluded in the range
 * 
 * @returns a boolean indicating if the value is an integer and within the specified range
 */
export function isInRangeInt(val:number, min: number|"-inf" ='-inf', max: number|string='inf', bounds: "include"|"exclude"="include"): boolean {    
    return Number.isInteger(+val)
            ? isInRange(val, min, max, bounds)
            : false
}


export function mergeRanges(range1: (string|number)[], range2: (string|number)[]): (string|number)[] {
    
    if(range1[0] === range2[0] && range1[1] === range2[1]) return range1

    // Destructure the ranges
    let [start1, end1] = [range1[0], range1[1]];
    let [start2, end2] = [range1[0], range1[1]];;

    start1 = start1 === '-inf' ? -Infinity : +start1;
    end1 = end1 === 'inf' ? Infinity : +end1;
    start2 = start2 === '-inf' ? -Infinity : +start2;
    end2 = end2 === 'inf' ? Infinity : +end2;
    
    // Check if ranges overlap or are adjacent
    if (Math.max(start1, start2) <= Math.min(end1, end2) + 1) {
      return [
        Math.min(start1, start2),
        Math.max(end1, end2)
      ];
    }
    
    // Return ranges in order if they don't overlap
    return start1 < start2 
      ? [...range1, ...range2] 
      : [...range2, ...range1];
};

/** 
 * Converts units in rem to pixels.
 * @param rem - Number of rem units to convert to pixels.
 * @returns Number of pixels corresponding to number of rems.
 */
export function convertRemToPixels(rem: number) {    
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

/**
 * Checks if the array is sorted based on the a comparator.
 * @param array - Array to check if sorted.
 * @param comparator - Sort comparator function.
 */
export function isSorted(array: Array<any>, comparator: (a: string, b:string)=>number) {
  for (let i = 0; i < array.length - 1; ++i) {
    if (comparator(array[i], array[i+1]) > 0)
      return false;
  } // end for i

  return true;
} 

/**
 * Returns true if value is can be converted to a finite number. 
 * @param value - Value to test.
 */
export function isFiniteNumber(value: string | number) {
  const v = ""+value;  // convert to string for simplicity
  if (v.trim() === "")  return false;
  return !isNaN(+v) && isFinite(+v);
}
