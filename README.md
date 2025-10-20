# Data Pattern Inspector Geomap

A client-only React application for visual analytics that handles large local files, performs heavy computations in Web Workers, stores intermediate results in IndexedDB, and renders interactive visualizations on a dashboard.

## Features

- **File Upload & Validation**: Upload CSV files (dataset ~20MB, patterns ~100KB) with client-side validation
- **Web Worker Processing**: Heavy computations performed in background workers to keep UI responsive
- **IndexedDB Storage**: Intermediate results stored locally for persistence and performance
- **Interactive Dashboard**: Dual layout modes with pattern lists, details, geographic maps, and summary statistics
- **Responsive Design**: Clean, modern UI built with Tailwind CSS

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Web Workers** for background processing
- **IndexedDB** (via idb library) for local storage
- **Canvas API** for custom geographic map rendering

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
3. Click "Validate Files" to check file formats and structure
4. Click "Start Analysis" to begin processing
5. Wait for computation to complete (progress bar will show status)

### Dashboard Page
The dashboard automatically loads after successful computation with two layout options:

**Layout A (Default)**:
- Left: Pattern List (searchable, sortable)
- Center: Pattern Details (statistics and records)
- Right: Geographic Map (top) + Summary Stats (bottom)

**Layout B (Alternative)**:
- Left: Geographic Map
- Center: Pattern List  
- Right: Pattern Details (top) + Summary Stats (bottom)

### Features
- **Pattern List**: Search, sort by name/confidence/frequency
- **Pattern Details**: View statistics and individual records for selected patterns
- **Geographic Map**: Interactive canvas-based map with clickable points
- **Summary Stats**: Key metrics, categories, and data quality indicators
- **Layout Toggle**: Switch between Layout A and B (preference saved in localStorage)

## File Formats

### Dataset CSV
Expected columns (flexible naming):
- `latitude`/`lat`: Geographic latitude
- `longitude`/`lon`/`lng`: Geographic longitude  
- `value`/`amount`: Numeric value for the record
- `timestamp`/`date`: Date/time information
- Additional metadata columns are preserved

### Patterns CSV
Expected columns (flexible naming):
- `name`/`pattern_name`: Pattern identifier
- `description`: Pattern description
- `category`: Pattern category
- `confidence`: Confidence score (0-1)
- `frequency`: Occurrence frequency

## Architecture

### Web Workers
- **validateWorker.ts**: File validation and format checking
- **computeWorker.ts**: Heavy data processing and pattern analysis

### Components
- **FileUploader**: Drag-and-drop file upload with validation
- **PatternList**: Searchable, sortable pattern listing
- **PatternDetails**: Detailed view of selected pattern data
- **GeoMap**: Canvas-based interactive geographic visualization
- **SummaryStats**: Key metrics and data quality indicators

### Utilities
- **indexedDB.ts**: Local storage management with idb library
- **types.ts**: TypeScript type definitions

## Deployment

The application is built as a static site and can be deployed to:

- **Vercel**: `vercel --prod`
- **GitHub Pages**: Build and push `dist` contents to gh-pages branch
- **Netlify**: Drag and drop the `dist` folder
- **Any static hosting**: Upload the `dist` folder contents

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

Web Workers and IndexedDB support required.

## Development

### Project Structure
```
src/
├── components/          # React components
├── pages/              # Page-level components  
├── workers/            # Web Worker scripts
├── utils/              # Utility functions and types
├── App.tsx             # Main app component
└── main.tsx            # Application entry point
```

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## License

MIT License - see LICENSE file for details.
