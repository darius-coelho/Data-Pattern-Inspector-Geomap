# **Data Pattern Inspector Geomap**

A **client-only React application** for **interactive visual analytics** of patterns mined over geo-location data using the **AK Analyst**.  

The application supports **large local datasets**, performs **heavy computations in Web Workers**, stores **intermediate results in IndexedDB**, and provides an **interactive dashboard** for geographic and statistical exploration.

This tool is a **research product** developed as part of ongoing work on pattern-based data exploration and visualization, associated with the following paper:  
> **D. Coelho, N. Gupta, E. Papenhausen, and K. Mueller**,  
> *"Interactive Visual Analysis of Pattern-based Data Mining Results,"*  
> Workshop on Visual Analytics in Healthcare (VAHC), 2022.  
> [https://ieeexplore.ieee.org/document/10108527](https://ieeexplore.ieee.org/document/10108527)

If you use or reference this tool in your research, please cite the following publication:

```bibtex
@inproceedings{coelho2022patterns,
  title={Patterns of social vulnerability-an interactive dashboard to explore risks to public health on the us county level},
  author={Coelho, Darius and Gupta, Nikita and Papenhausen, Eric and Mueller, Klaus},
  booktitle={2022 Workshop on Visual Analytics in Healthcare (VAHC)},
  pages={01--09},
  year={2022},
  organization={IEEE}
}
```

### **Demo**

**Live Demo:** [https://data-pattern-inspector-geomap-fi3wgso4y.vercel.app/](https://data-pattern-inspector-geomap-fi3wgso4y.vercel.app/)

---

## **Tech Stack**

- **React 18** with TypeScript  
- **Vite** for fast builds and hot reloading  
- **Tailwind CSS** for responsive, modern UI design  
- **Web Workers** for background computation and responsiveness  
- **IndexedDB** (via `idb`) for efficient local data storage  

---

## **Getting Started**

### **Prerequisites**

- **Node.js** ≥ 16  
- **npm** or **yarn**

### **Installation**

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

The built files will be in the `dist` directory, ready for deployment.

## Usage

### Upload Page
1. Upload a dataset CSV file (up to 50MB)
2. Upload a patterns CSV file (up to 1MB)  
3. The files are automatically validated for format and required columns
4. Click “Load Dashboard” to process data
5. A progress bar shows computation progress; you’ll be automatically redirected to the dashboard upon completion.

### Dashboard Page
After data processing, the dashboard loads automatically with two layout options:

**Layout Map -> Pattern (Default)**:
- Left: Pattern List
- Center: Pattern Details
- Right: Geographic Map (top) + Location Summary (bottom)

**Pattern -> Map (Alternative)**:
- Left: Geographic Map (top) + Location Summary (bottom)
- Center: Pattern List  
- Right: Pattern Details  

### Features
- **Pattern List**: Browse mined patterns with info on data volume, constraints, and mean target values
- **Pattern Details**: Inspect pattern-level statistics and individual records
- **Geographic Map**: Interactive, canvas-based US map with zoom and click support for county-level exploration
- **Location Summary**: Displays metrics, risk categories, and data quality indicators for selected regions

## File Formats

### Dataset CSV
Required columns:
- `fips`: FIPS code
- `county`: County name  
- `state`: State name

### Patterns CSV
Typically generated using the AK Analyst tool.

Required columns:
- `keys`: Pattern IDs
- `description`: Pattern description in JSON format and includes constraints
- `target`: name of target - should be identical for all patterns
- `count`: number of data points in the pattern
- `mean`: mean target value for the pattern

## Notes
- All computations and storage occur entirely in the browser — no backend services required.
- Designed to handle large datasets efficiently using Web Workers.
- Ideal for offline visual exploration of geographically indexed pattern data.
- Developed as part of academic research into visual pattern mining and analytics.
