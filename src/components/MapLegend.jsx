const CATEGORIES=[
  ['✦','All locations','Every discovered place on the network','all'],
  ['🚻','Bathrooms','Restroom locations and bathroom intelligence','restroom'],
  ['🍽','Restaurants','Restaurants and fast-food brands','restaurant'],
  ['☕','Cafes','Coffee shops and cafes','cafe'],
  ['⛽','Gas stations','Fuel and roadside stops','gas_station'],
  ['🛍','Shopping','Retail, supermarkets and major brands','shopping'],
  ['🌳','Parks','Parks, recreation and outdoor locations','park'],
  ['✦','Services','Libraries, transit, lodging and other services','service'],
  ['⚕','Healthcare','Healthcare and pharmacy locations','health'],
  ['🛡','Public safety','Police, fire and civic safety locations','public_safety'],
];

const STATUS=[
  ['✓','Verified','Kleenest has verified evidence for the location or relevant bathroom data','verified'],
  ['•','Unverified','The location exists in the network but has not yet been verified by Kleenest','unverified'],
  ['★','Favorite','Saved by you; favorites are personal and do not change network verification','favorite'],
  ['⌁','Community signal','Reviews, check-ins, arrivals, observations or other network evidence','signal'],
];

export default function MapLegend(){
  return <aside className="kleenest-map-legend" aria-label="Kleenest map legend">
    <div className="map-legend-heading">
      <div><span className="eyebrow">KLEENEST NETWORK</span><strong>Map legend</strong></div>
      <span>Categories and trust signals work together.</span>
    </div>
    <div className="map-legend-section">
      <span className="map-legend-section-title">Place categories</span>
      <div className="map-legend-grid">
        {CATEGORIES.map(([glyph,title,description,key])=><div className={`map-legend-item category ${key}`} key={key}>
          <span className="map-legend-glyph" aria-hidden="true">{glyph}</span>
          <span><strong>{title}</strong><small>{description}</small></span>
        </div>)}
      </div>
    </div>
    <div className="map-legend-section">
      <span className="map-legend-section-title">Network status</span>
      <div className="map-legend-status-grid">
        {STATUS.map(([glyph,title,description,key])=><div className={`map-legend-item status ${key}`} key={key}>
          <span className="map-legend-glyph" aria-hidden="true">{glyph}</span>
          <span><strong>{title}</strong><small>{description}</small></span>
        </div>)}
      </div>
    </div>
    <div className="map-legend-note">A Taco Bell, Walmart, local restaurant, gas station or other discovered brand is a normal map location. Verification, favorites and community evidence are signals layered onto that location—not separate categories.</div>
  </aside>;
}
