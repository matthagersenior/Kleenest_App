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

const BRAND_EXAMPLES=[
  ['🏪','Branded locations','Taco Bell, Walmart and other recognizable operators remain ordinary map locations.','brand'],
  ['⌖','Brand + category','A brand is shown on its pin while the pin glyph communicates the location category.','brand-category'],
  ['✓','Trust layered on top','Verification, favorites and community evidence modify the same location instead of creating duplicate map categories.','brand-trust'],
];

export default function MapLegend(){
  return <aside className="kleenest-map-legend" aria-label="Kleenest map legend">
    <div className="map-legend-heading">
      <div><span className="eyebrow">KLEENEST NETWORK</span><strong>Map legend</strong></div>
      <span>One location can have a brand, category, trust state and community signals at the same time.</span>
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
      <span className="map-legend-section-title">Brand identity</span>
      <div className="map-legend-status-grid">
        {BRAND_EXAMPLES.map(([glyph,title,description,key])=><div className={`map-legend-item status ${key}`} key={key}>
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
    <div className="map-legend-note">Taco Bell, Walmart, local restaurants, gas stations and other discovered brands are map locations—not separate trust categories. Their brand identity, business relationship, bathroom intelligence, verification state, favorite state and community evidence all travel with the same location record.</div>
  </aside>;
}
