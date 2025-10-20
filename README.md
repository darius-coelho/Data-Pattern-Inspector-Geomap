# Data Pattern Inspector Geomap

A client-only React application for visual analytics for exploring patterns mined with the AK Analyst.

It handles large local files, performs heavy computations in Web Workers, stores intermediate results in IndexedDB, and renders interactive visualizations on a dashboard.


## Tech Stack

- **React 18** with TypeScript
- **Vite**
- **Tailwind CSS** for styling
- **Web Workers** for background processing
- **IndexedDB** (via idb library) for local storage

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Data-Pattern-Inspector-Geomap
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to Vercel, GitHub Pages, or any static hosting service.

## Usage

### Upload Page
1. Upload a dataset CSV file (up to 50MB)
2. Upload a patterns CSV file (up to 1MB)  
3. Files are automatically checked for file formats and require columns
4. Click "Load Dashbaord" to begin processing data for the dashboard.
5. You will be forwared ed to the dashboard after computation completes (progress bar will show status).

### Dashboard Page
The dashboard automatically loads after successful computation with two layout options:

**Layout Map -> Pattern (Default)**:
- Left: Pattern List (searchable, sortable)
- Center: Pattern Details (statistics and records)
- Right: Geographic Map (top) + Location Summary (bottom)

**Pattern -> Map (Alternative)**:
- Left: Geographic Map (top) + Location Summary (bottom)
- Center: Pattern List  
- Right: Pattern Details  

### Features
- **Pattern List**: View patterns in order in which they were mined. Shows the amount of data, number of constraints and mean target value for that pattern.
- **Pattern Details**: View statistics and individual records for selected patterns
- **Geographic Map**: Interactive canvas-based US map with clickable counties
- **Location Summary**: Key metrics, categories, and data quality indicators

## File Formats

### Dataset CSV
Must have the columns:
- `fips`: FIPS code
- `county`: County name  
- `state`: State name

### Patterns CSV
Should be generated with the AK analyst and have the columns:
- `keys`: Pattern IDs
- `description`: Pattern description in JSON format and includes constraints
- `target`: name of target - should be identical for all patterns
- `count`: number of data points in the pattern
- `mean`: mean target value for the pattern

