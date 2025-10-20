interface FeatureLabelProps {
  attribute: string;
  rowIdx: number;
  width: number;
  rowHeight: number;
  offsetTop: number;
  offsetLeft: number;
}

/** Displays a feature/attribute label within the SVG layout */
export default function FeatureLabel({
  attribute,
  rowIdx,
  width,
  rowHeight,
  offsetTop,
  offsetLeft,
}: FeatureLabelProps) {
  const labelPos = {
    x: offsetLeft,
    y: offsetTop + rowIdx * rowHeight,
    width,
    height: rowHeight,
  };

  return (
    <g>
      <foreignObject {...labelPos}>
        <div
          className="truncate text-[12px] font-medium text-gray-700 leading-none"
          title={attribute}
        >
          {attribute}
        </div>
      </foreignObject>
    </g>
  );
}
