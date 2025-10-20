import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { Feature, FeatureCollection, Geometry } from "geojson";
import { Topology } from "topojson-specification";
import { ZoomBehavior } from "d3";
import { LocationSummaries } from "../types/data.types";

// --- (No changes to Type Definitions or Component Props) ---
interface USAtlas extends Topology {
  objects: {
    counties: {
      type: "GeometryCollection";
      geometries: {
        id: string;
        properties: { name: string };
        type: "Polygon" | "MultiPolygon";
        arcs: any;
      }[];
    };
    states: {
      type: "GeometryCollection";
      geometries: any[];
    };
  };
}
type CountyFeature = Feature<Geometry, { name: string }> & { id: string };
interface USChoroplethMapProps {
  target: string;
  highlightedFips: number[];
  locationSummary: LocationSummaries;
  selectedFips: number | null;
  onSelectFips: (fips: number ) => void;
  values: number[];
}


export const USChoroplethMap: React.FC<USChoroplethMapProps> = ({
  target,
  locationSummary,
  highlightedFips,
  selectedFips,
  onSelectFips,
  values,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown>>();

  const [usAtlas, setUsAtlas] = useState<USAtlas | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  // --- Data Fetching and ResizeObserver Effects (No changes here) ---
  useEffect(() => {
    d3.json<USAtlas>("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
      .then(data => setUsAtlas(data || null));
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver(() => {
      const { width, height } = wrapperRef.current!.getBoundingClientRect();
      setDimensions({ width, height });
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // --- Effect 1: Initial Setup (No changes here) ---
  useEffect(() => {
    if (!usAtlas || !dimensions) return;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const projection = d3.geoAlbersUsa().fitSize(
      [width, height],
      topojson.feature(usAtlas, usAtlas.objects.counties)
    );
    const path = d3.geoPath(projection);
    const g = svg.append("g");

    const counties = (
      topojson.feature(usAtlas, usAtlas.objects.counties) as FeatureCollection<
        Geometry,
        { name: string }
      >
    ).features as CountyFeature[];

    let lastClickTime = 0;

    g.selectAll<SVGPathElement, CountyFeature>("path.county")
      .data(counties)
      .join("path")
      .attr("class", "county")
      .attr("d", path)
      .style("cursor", "pointer")
      .on("click", (_event, d) => {
        const now = Date.now();
        // Prevent double-click from triggering click handler
        if (now - lastClickTime < 250) return;
        lastClickTime = now;
        onSelectFips(+d.id);
      })
      .append("title");

    g.append("path")
      .datum(topojson.mesh(usAtlas, usAtlas.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("class", "state-border")
      .attr("d", path);

    // --- Zoom Setup ---
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    // Disable double-click zoom behavior
    svg.call(zoom).on("dblclick.zoom", null);

    // Restore previous zoom transform if available
    if (zoomRef.current && (svg.node() as any).__zoom) {
      const previousTransform = (svg.node() as any).__zoom;
      svg.call(zoom.transform, previousTransform);
    }

    zoomRef.current = zoom;
  }, [usAtlas, dimensions, onSelectFips]);


  // --- Effect 2: Prop-based Updates ---
  useEffect(() => {
    if (!usAtlas || !dimensions) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>("g");

    const projection = d3.geoAlbersUsa().fitSize([width, height], topojson.feature(usAtlas, usAtlas.objects.counties));
    const path = d3.geoPath(projection);
    
    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain(d3.extent(values) as [number, number]);
    
    svg.selectAll<SVGPathElement, CountyFeature>("path.county")
      .attr("fill", (d) => {
        const val = locationSummary.hasOwnProperty(+d.id) 
                    ? locationSummary[+d.id].targetValue
                    : null;
        if(highlightedFips.length > 0 && !highlightedFips.includes(+d.id)){
          return "#f1f1f1";
        }
        return val != null && val != undefined ? colorScale(val) : "#ffc8b4";
      })
     
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5 / (d3.zoomTransform(svg.node()!).k || 1))
      .select("title")
      .text(d => {
        if(!locationSummary.hasOwnProperty(+d.id)){
          return "";
        }
        const val = locationSummary[+d.id].targetValue
        const valueString = val !== undefined && val !== null ? `${val.toFixed(2)}` : "N/A";
        const name = locationSummary[+d.id].name;
        const partent = locationSummary[+d.id].parent;
        return `${name}, ${partent}\n${target}: ${valueString}`;
      });

    const counties = (topojson.feature(usAtlas, usAtlas.objects.counties) as FeatureCollection<Geometry, { name: string }>).features as CountyFeature[];
    const selectedCountyFeature = selectedFips ? counties.find(c => +c.id === selectedFips) : undefined;
    const selectedData = selectedCountyFeature ? [selectedCountyFeature] : [];

    g.selectAll<SVGPathElement, CountyFeature>("path.selection-highlight")
      .data(selectedData, d => d.id)
      .join("path")
      .attr("class", "selection-highlight")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("pointer-events", "none")
      .attr("stroke-width", 1.5 / (d3.zoomTransform(svg.node()!).k || 1));
    

    svg.select("path.state-border")
      .attr("stroke-width", 1 / (d3.zoomTransform(svg.node()!).k || 1));

  }, [highlightedFips, selectedFips, values, usAtlas, dimensions]);

  return (
    <div ref={wrapperRef} className="w-full h-full relative">
      <svg
        ref={svgRef}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};