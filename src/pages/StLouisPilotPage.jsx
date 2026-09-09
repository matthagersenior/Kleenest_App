import { useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, Clipboard, Handshake, MapPin, QrCode, Route, Sparkles, UsersRound } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import './StLouisPilotPage.css';

const pilotMetrics = [
  { label: 'Pilot target', value: '10–25', detail: 'St. Louis businesses and community locations' },
  { label: 'Launch focus', value: 'STL', detail: 'Dense, useful validation before broader expansion' },
  { label: 'Core loop', value: 'Verify', detail: 'QR check-ins, evidence, freshness and confidence' },
];

const partnerTypes = [
  {
    icon: Building2,
    title: 'Businesses',
    copy: 'Manage location details, verify amenities, test QR engagement and learn what brings people in.',
  },
  {
    icon: UsersRound,
    title: 'Community validators',
    copy: 'Help confirm whether the places people rely on are accurate, usable and current.',
  },
  {
    icon: Handshake,
    title: 'Ecosystem partners',
    copy: 'Introduce Kleenest to neighborhood groups, visitor-facing businesses, mentors and capital.',
  },
];

const proofLoop = [
  { icon: MapPin, title: 'Find', copy: 'Search for nearby or route-aware places with the amenity someone actually needs.' },
  { icon: QrCode, title: 'Check in', copy: 'Use QR interactions to confirm real-world visits and create a business engagement point.' },
  { icon: BadgeCheck, title: 'Verify', copy: 'Capture source, observation, evidence, confidence, freshness and contradictions.' },
  { icon: Sparkles, title: 'Improve', copy: 'Turn each visit into cleaner data, better discovery and measurable business value.' },
];

const initialForm = {
  name: '',
  organization: '',
  email: '',
  phone: '',
  role: 'business',
  message: '',
};

function buildPilotSummary(form) {
  return [
    'Kleenest St. Louis Pilot Interest',
    `Name: ${form.name}`,
    `Organization: ${form.organization || 'Not provided'}`,
    `Email: ${form.email}`,
    `Phone: ${form.phone || 'Not provided'}`,
    `Role: ${form.role}`,
    `Message: ${form.message || 'Not provided'}`,
  ].join('\n');
}

export default function StLouisPilotPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const pilotSummary = useMemo(() => buildPilotSummary(form), [form]);
  const canSubmit = form.name.trim() && form.email.trim();

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(pilotSummary);
      setStatus({ type: 'success', message: 'Pilot interest summary copied. Send it to Matthew or paste it into your email.' });
    } catch {
      setStatus({ type: 'error', message: 'Copy was blocked by the browser. Select the form details manually and send them to Matthew.' });
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      setStatus({ type: 'error', message: 'Please add at least a name and email so Matthew can follow up.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      if (!supabase) throw new Error('Supabase is not configured for pilot submissions.');
      const { error } = await supabase.from('pilot_leads').insert({
        name: form.name.trim(),
        organization: form.organization.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        lead_type: form.role,
        message: form.message.trim() || null,
        source: 'stl-pilot-page',
      });
      if (error) throw error;
      setForm(initialForm);
      setStatus({ type: 'success', message: 'Thanks — your Kleenest pilot interest was received.' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: `${error.message || 'The pilot form could not be saved yet.'} Use Copy summary so Matthew still gets the details.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="pilot-page">
      <section className="pilot-hero" aria-labelledby="pilot-title">
        <div className="pilot-hero-copy">
          <span className="pilot-eyebrow">St. Louis launch pilot</span>
          <h1 id="pilot-title">Help prove Kleenest in the city where it is being built.</h1>
          <p>
            Kleenest is a verified local-discovery platform for the practical location information people actually need:
            clean and accessible restrooms, useful amenities, current evidence, QR check-ins, business participation and
            route-aware discovery.
          </p>
          <div className="pilot-actions">
            <a className="pilot-primary" href="#join-pilot">Join the pilot <ArrowRight size={18} /></a>
            <a className="pilot-secondary" href="#how-it-works">See how it works</a>
          </div>
        </div>
        <div className="pilot-hero-visual" aria-label="Kleenest St. Louis pilot concept">
          <div className="phone-frame">
            <div className="phone-map">
              <span className="pin pin-a"><CheckCircle2 size={16} /></span>
              <span className="pin pin-b"><QrCode size={16} /></span>
              <span className="pin pin-c"><BadgeCheck size={16} /></span>
              <div className="route-line" />
            </div>
            <div className="phone-card">
              <strong>Verified restroom nearby</strong>
              <span>Freshness: today · Confidence: high</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pilot-metrics" aria-label="Pilot goals">
        {pilotMetrics.map((metric) => (
          <article key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="pilot-section pilot-problem">
        <div>
          <span className="pilot-eyebrow">The problem</span>
          <h2>Maps can find places. They do not always answer whether a place works for the moment someone is in.</h2>
        </div>
        <p>
          Kleenest is built around source, observation, evidence, verification, confidence, freshness and contradiction.
          That turns local discovery into a continuously improving data network instead of a static business listing.
        </p>
      </section>

      <section id="how-it-works" className="pilot-loop" aria-label="Kleenest pilot loop">
        {proofLoop.map((step) => {
          const Icon = step.icon;
          return (
            <article key={step.title}>
              <Icon size={24} />
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          );
        })}
      </section>

      <section className="pilot-section">
        <div>
          <span className="pilot-eyebrow">Who should join</span>
          <h2>We need businesses, validators and connectors who can help make St. Louis the first useful Kleenest market.</h2>
        </div>
        <div className="pilot-partners">
          {partnerTypes.map((partner) => {
            const Icon = partner.icon;
            return (
              <article key={partner.title}>
                <Icon size={26} />
                <h3>{partner.title}</h3>
                <p>{partner.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="pilot-section pilot-value">
        <div>
          <span className="pilot-eyebrow">Pilot offer</span>
          <h2>What an early St. Louis pilot partner gets</h2>
        </div>
        <ul>
          <li><CheckCircle2 size={18} /> Early location profile and amenity verification support.</li>
          <li><CheckCircle2 size={18} /> QR-based check-in and customer engagement testing.</li>
          <li><CheckCircle2 size={18} /> Feedback loop into the business dashboard, analytics and promotion tools.</li>
          <li><CheckCircle2 size={18} /> Direct founder access while the product is still flexible.</li>
        </ul>
      </section>

      <section id="join-pilot" className="pilot-form-section" aria-labelledby="pilot-form-title">
        <div>
          <span className="pilot-eyebrow">Get involved</span>
          <h2 id="pilot-form-title">Join the St. Louis pilot</h2>
          <p>
            Use this form for a business, community organization, tourism/hospitality partner, investor introduction,
            mentor referral or early-user validator.
          </p>
        </div>
        <form className="pilot-form" onSubmit={submit}>
          <label>Name<input name="name" value={form.name} onChange={update} autoComplete="name" required /></label>
          <label>Organization<input name="organization" value={form.organization} onChange={update} autoComplete="organization" /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></label>
          <label>Phone<input name="phone" value={form.phone} onChange={update} autoComplete="tel" /></label>
          <label>How you can help
            <select name="role" value={form.role} onChange={update}>
              <option value="business">Business pilot location</option>
              <option value="validator">Community validator / early user</option>
              <option value="mentor">Startup mentor / advisor</option>
              <option value="intro">I can make introductions</option>
              <option value="investor">Investor / capital connection</option>
            </select>
          </label>
          <label className="full-span">Message<textarea name="message" value={form.message} onChange={update} rows="4" placeholder="Tell Matthew what location, organization or introduction you have in mind." /></label>
          {status.message && <p className={`pilot-status ${status.type}`}>{status.message}</p>}
          <div className="pilot-form-actions">
            <button className="pilot-primary" type="submit" disabled={submitting || !canSubmit}>{submitting ? 'Sending…' : 'Submit interest'}</button>
            <button className="pilot-secondary" type="button" onClick={copySummary}><Clipboard size={17} /> Copy summary</button>
          </div>
        </form>
      </section>

      <section className="pilot-next-step">
        <Route size={26} />
        <div>
          <h2>The immediate goal</h2>
          <p>
            Activate 10–25 St. Louis locations, collect real check-ins and amenity evidence, measure repeat usage,
            then use that proof for partner conversations, Arch Grants readiness and investor meetings.
          </p>
        </div>
      </section>
    </main>
  );
}
