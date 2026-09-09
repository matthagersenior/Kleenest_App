import { useState } from 'react';
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  QrCode,
  RotateCcw,
  Route,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import './FounderDemoPage.css';

const STEPS = [
  {
    key: 'find',
    time: '0:00–0:45',
    title: 'Find the need, not just the place',
    cue: 'Search for a specific real-world need: family restroom + changing table.',
  },
  {
    key: 'compare',
    time: '0:45–1:30',
    title: 'Compare confidence and freshness',
    cue: 'Show why Kleenest is different from a generic map result.',
  },
  {
    key: 'decide',
    time: '1:30–2:15',
    title: 'Make the destination decision',
    cue: 'Select a location because the needed amenity is supported by evidence.',
  },
  {
    key: 'verify',
    time: '2:15–3:10',
    title: 'Turn the visit into better data',
    cue: 'Check in and confirm what is actually there. QR is optional, not required.',
  },
  {
    key: 'network',
    time: '3:10–4:05',
    title: 'Improve the network for the next person',
    cue: 'The observation increases freshness and gives the contributor progress.',
  },
  {
    key: 'business',
    time: '4:05–5:00',
    title: 'Close the loop for the business',
    cue: 'Businesses correct information and see what customers are actually looking for.',
  },
];

const RESULTS = [
  {
    name: 'Riverfront Market',
    category: 'Market · Demo fixture',
    distance: '0.7 mi',
    confidence: 'High',
    freshness: 'Updated 2 days ago',
    amenities: ['Family restroom', 'Changing table', 'Accessible entry'],
    verified: true,
  },
  {
    name: 'Gateway Coffee Hall',
    category: 'Cafe · Demo fixture',
    distance: '0.4 mi',
    confidence: 'Medium',
    freshness: 'Updated 43 days ago',
    amenities: ['Restroom', 'Wi-Fi'],
    verified: false,
  },
  {
    name: 'Market Street Pharmacy',
    category: 'Pharmacy · Demo fixture',
    distance: '1.1 mi',
    confidence: 'Medium',
    freshness: 'Updated 18 days ago',
    amenities: ['Restroom', 'Accessible entry'],
    verified: false,
  },
];

function StatusPill({ children, strong = false }) {
  return <span className={strong ? 'founder-demo-pill strong' : 'founder-demo-pill'}>{children}</span>;
}

function DemoMap({ activeStep }) {
  const selected = activeStep >= 2;
  const verified = activeStep >= 3;
  const improved = activeStep >= 4;

  return (
    <div className="founder-demo-map" aria-label="Deterministic demo map">
      <div className="founder-demo-map-grid" />
      <div className="founder-demo-route-line" />
      <div className="founder-demo-you">You</div>
      <div className="founder-demo-pin pin-a">☕</div>
      <div className={selected ? 'founder-demo-pin pin-b selected' : 'founder-demo-pin pin-b'}>✦</div>
      <div className="founder-demo-pin pin-c">✚</div>
      {selected && (
        <div className="founder-demo-selected-card">
          <div className="founder-demo-selected-head">
            <div>
              <small>Selected destination</small>
              <strong>Riverfront Market</strong>
            </div>
            <BadgeCheck size={22} />
          </div>
          <div className="founder-demo-chip-row">
            <StatusPill strong>Family restroom</StatusPill>
            <StatusPill strong>Changing table</StatusPill>
            <StatusPill>0.7 mi</StatusPill>
          </div>
          <div className="founder-demo-trust-row">
            <span><CheckCircle2 size={15} /> High confidence</span>
            <span><Clock3 size={15} /> {improved ? 'Fresh now' : '2 days fresh'}</span>
          </div>
          {verified && <div className="founder-demo-verified-banner"><QrCode size={17} /> Visit confirmed · amenity observation captured</div>}
        </div>
      )}
    </div>
  );
}

function ConsumerStage({ step }) {
  const searchVisible = step <= 1;
  const selected = step >= 2;
  const verified = step >= 3;
  const improved = step >= 4;

  return (
    <div className="founder-demo-phone">
      <header className="founder-demo-appbar">
        <div className="founder-demo-brandmark">K</div>
        <div>
          <strong>Kleenest</strong>
          <small>Verified local discovery</small>
        </div>
        <span className="founder-demo-live-dot">DEMO</span>
      </header>

      {searchVisible && (
        <div className="founder-demo-search">
          <Search size={18} />
          <span>family restroom + changing table</span>
        </div>
      )}

      {step === 0 && (
        <div className="founder-demo-intent-card">
          <small>Intent understood</small>
          <strong>Must include</strong>
          <div className="founder-demo-chip-row">
            <StatusPill strong>Family restroom</StatusPill>
            <StatusPill strong>Changing table</StatusPill>
          </div>
          <p>Instead of returning the nearest place, Kleenest searches for a destination that can satisfy the need.</p>
        </div>
      )}

      {step === 1 && (
        <div className="founder-demo-results">
          {RESULTS.map((result) => (
            <article key={result.name} className={result.verified ? 'founder-demo-result best' : 'founder-demo-result'}>
              <div className="founder-demo-result-top">
                <div>
                  <small>{result.category}</small>
                  <strong>{result.name}</strong>
                </div>
                <b>{result.distance}</b>
              </div>
              <div className="founder-demo-chip-row">
                {result.amenities.map((amenity) => <StatusPill key={amenity} strong={result.verified}>{amenity}</StatusPill>)}
              </div>
              <div className="founder-demo-result-meta">
                <span>{result.confidence} confidence</span>
                <span>{result.freshness}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && step <= 4 && <DemoMap activeStep={step} />}

      {step === 3 && (
        <div className="founder-demo-action-sheet">
          <small>At the destination</small>
          <strong>Confirm what you actually found</strong>
          <div className="founder-demo-checks">
            <span><CheckCircle2 size={18} /> Family restroom present</span>
            <span><CheckCircle2 size={18} /> Changing table present</span>
            <span><CheckCircle2 size={18} /> Public access confirmed</span>
          </div>
          <button type="button"><QrCode size={17} /> QR check-in optional</button>
        </div>
      )}

      {improved && step === 4 && (
        <div className="founder-demo-network-card">
          <Sparkles size={24} />
          <div>
            <small>Network improved</small>
            <strong>Freshness increased for the next visitor</strong>
            <p>Your observation is stored as evidence instead of silently overwriting other sources.</p>
          </div>
          <div className="founder-demo-points">+25 verification XP</div>
        </div>
      )}

      {step === 5 && (
        <div className="founder-demo-business-panel">
          <div className="founder-demo-business-title">
            <Building2 size={22} />
            <div>
              <small>Business view · Demo fixture</small>
              <strong>Riverfront Market</strong>
            </div>
          </div>
          <div className="founder-demo-stat-grid">
            <div><b>42</b><span>search matches</span></div>
            <div><b>18</b><span>verified visits</span></div>
            <div><b>6</b><span>amenity confirmations</span></div>
            <div><b>2</b><span>facts corrected</span></div>
          </div>
          <div className="founder-demo-business-value">
            <span><Users size={17} /> See what visitors need</span>
            <span><Route size={17} /> Measure discovery-to-visit behavior</span>
            <span><BadgeCheck size={17} /> Keep amenity information current</span>
          </div>
          <p className="founder-demo-disclaimer">Illustrative fixture metrics only — not live traction or a partner claim.</p>
        </div>
      )}
    </div>
  );
}

export default function FounderDemoPage() {
  const [step, setStep] = useState(0);
  const active = STEPS[step];

  return (
    <main className="founder-demo-page">
      <section className="founder-demo-shell">
        <header className="founder-demo-header">
          <div>
            <span className="founder-demo-eyebrow">SQ1 / partner presentation mode</span>
            <h1>Deterministic 5-minute Kleenest demo</h1>
            <p>Fixture data only. This route never represents a business as a live partner and never uses seeded coverage as customer traction.</p>
          </div>
          <div className="founder-demo-step-count">{step + 1} / {STEPS.length}</div>
        </header>

        <div className="founder-demo-layout">
          <ConsumerStage step={step} />

          <aside className="founder-demo-presenter">
            <div className="founder-demo-presenter-head">
              <span>{active.time}</span>
              <h2>{active.title}</h2>
              <p>{active.cue}</p>
            </div>

            <ol className="founder-demo-timeline">
              {STEPS.map((item, index) => (
                <li key={item.key} className={index === step ? 'active' : index < step ? 'done' : ''}>
                  <button type="button" onClick={() => setStep(index)}>
                    <b>{index + 1}</b>
                    <span><small>{item.time}</small>{item.title}</span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="founder-demo-talktrack">
              <strong>Say this</strong>
              {step === 0 && <p>“Kleenest starts with intent. The question is not ‘what is nearby?’ It is ‘where can I go that actually has what I need?’”</p>}
              {step === 1 && <p>“The trust layer matters as much as the pin. We separate confidence, freshness and evidence so people can judge whether a result is worth acting on.”</p>}
              {step === 2 && <p>“Now the user can make a destination decision with context — not just a name, star rating and distance.”</p>}
              {step === 3 && <p>“When the person arrives, a check-in or observation closes the loop. QR can strengthen attribution, but a partner does not need signage to participate.”</p>}
              {step === 4 && <p>“Each real-world observation improves freshness for the next person and can reward the contributor without pretending one report is absolute truth.”</p>}
              {step === 5 && <p>“The business side completes the network: businesses can correct facts, understand demand and eventually measure discovery-to-visit value. That is the commercial loop we are validating in St. Louis.”</p>}
            </div>

            <div className="founder-demo-controls">
              <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}><ChevronLeft size={17} /> Back</button>
              <button type="button" className="reset" onClick={() => setStep(0)}><RotateCcw size={16} /> Reset</button>
              <button type="button" className="primary" onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1}>Next <ChevronRight size={17} /></button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
