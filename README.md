# Kleenest App

A clean rebuild of Kleenest using a modular React architecture and Supabase as the data boundary.

## Architecture

- `src/App.jsx` — application shell and route surfaces
- `src/styles.css` — shared design system and responsive layout
- `src/lib/supabase.js` — single client boundary for Supabase
- `src/features/` — feature modules as they are implemented
- `src/domain/` — domain contracts and pure business rules
- `src/services/` — server/data adapters

## Product surfaces

The rebuild starts with canonical surfaces for:

- Home and local discovery
- Map and category filters
- Place details
- Consumer profile
- Business workspace
- Reviews and replies
- QR check-ins
- Rewards and gamification
- Promotions, campaigns, contests, and events
- Analytics
- Platform administration

The previous `KleenestApp` repository, especially `refactor/monolith-removal`, is a reference source for recovering proven product behavior. Legacy bridge files are not copied into this repository by default.

## Local development

```bash
npm install
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local` before connecting live data.
