const LEGEND=[
  ['🚻','Bathroom verified','A bathroom is verified by Kleenest observations.','verified'],
  ['🚻','Bathroom reported','Bathroom information exists but is not yet verified.','reported'],
  ['✦','Place / amenity','A discovered location that is not currently known to have a bathroom.','unknown'],
  ['✓','Community signal','Reviews, check-ins, observations or other network evidence exists.','signal']
];

export default function MapLegend(){
  return <aside className="kleenest-map-legend" aria-label="Map legend">
    <div className="map-legend-heading"><strong>Map legend</strong><span>Every discovered place can be a pin.</span></div>
    <div className="map-legend-items">
      {LEGEND.map(([glyph,title,description,key])=><div className={`map-legend-item ${key}`} key={key}>
        <span className="map-legend-glyph" aria-hidden="true">{glyph}</span>
        <span><strong>{title}</strong><small>{description}</small></span>
      </div>)}
    </div>
  </aside>;
}
