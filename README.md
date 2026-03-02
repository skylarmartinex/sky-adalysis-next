# Adalysis Next.js — PPC Analytics Dashboard

A Next.js 16 port of the Adalysis-style PPC analytics dashboard, built for Adobe Stock campaign analysis at WPP. Powered by Google Sheets live data with mock data fallback.

---

## Quick Start

```bash
cd ~/ScaleSearch/sky-adalysis-next
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Features

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | KPI tiles, trend chart, alerts, opportunities |
| Campaigns | `/campaigns` | Sortable/filterable campaign table with metrics |
| Keywords | `/keywords` | Keyword-level data: QS, match type, CPA, CTR |
| Opportunities | `/opportunities` | Actionable recommendations with estimated impact |
| Reporting | `/reporting` | Weekly performance report with wins/challenges |
| Sheets Setup | `/setup` | Google Sheets connection status and instructions |

---

## Google Sheets Integration

The dashboard fetches live data from three Google Sheets published as CSV. If sheets are unavailable, it falls back to mock data automatically.

### Sheet IDs (Pre-configured)

| Sheet | ID |
|-------|----|
| Campaigns | `1DDvUi5RAOpRlJ_VvgVJptAg_3vrqG0mNc_IBeZ7Vj14` |
| Search Terms | `1TzVdwRarnEvMuiMH59qfbdtruue9T9-EWBBAEiSYSik` |
| Keywords | `1KLFvJbV3_kpOBmx6CsCVYKiKpuGTdh4gnV_xZFQAm5A` |

### How to Activate Live Data

1. **Export from Google Ads** → Campaigns, Search Terms, or Keywords report → Download → Google Sheets

2. **Publish each sheet as CSV:**
   - Open the sheet → File → Share → Publish to web
   - Choose **Entire Document** and **CSV** format
   - Click Publish and copy the Sheet ID from the URL

3. **Check connection status** at `/setup` — green badges = connected

### Custom Sheet IDs (Optional)

Create `.env.local` in the project root:

```env
SHEETS_CAMPAIGNS_ID=your_campaigns_sheet_id_here
SHEETS_SEARCH_TERMS_ID=your_search_terms_sheet_id_here
SHEETS_KEYWORDS_ID=your_keywords_sheet_id_here
```

The importer auto-maps Google Ads standard column names (e.g., `Campaign`, `Cost`, `Conversions`, `Search Impr. share`, etc.) — standard Google Ads CSV exports work out of the box.

---

## Expected Sheet Columns

### Campaigns Sheet
`Campaign`, `Campaign Status`, `Budget`, `Cost`, `Clicks`, `Impressions`, `Conversions`, `Conv. value`, `CTR`, `Search Impr. share`, `Search Lost IS (budget)`, `Search Lost IS (rank)`, `Bid Strategy Type`, `Target CPA`, `Target ROAS`

### Search Terms Sheet  
`Search term`, `Campaign`, `Ad group`, `Match type`, `Cost`, `Clicks`, `Impressions`, `Conversions`, `Campaign ID`

### Keywords Sheet
`Keyword`, `Campaign`, `Ad group`, `Match type`, `Status`, `Cost`, `Clicks`, `Impressions`, `Conversions`, `Quality Score`, `Avg. CPC`, `Max CPC`, `Campaign ID`

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Dashboard
│   ├── campaigns/page.tsx          # Campaigns list
│   ├── keywords/page.tsx           # Keywords analysis
│   ├── opportunities/page.tsx      # Opportunities
│   ├── reporting/page.tsx          # Weekly report
│   ├── setup/page.tsx              # Sheets setup
│   └── api/
│       ├── data/route.ts           # Full data endpoint
│       ├── sheets/route.ts         # Sheets status check
│       └── refresh/route.ts        # Cache invalidation (POST)
├── data/
│   ├── types.ts                    # All TypeScript types
│   ├── sheets-loader.ts            # Google Sheets CSV fetch + parse (server-only)
│   ├── data-repository.ts          # Cached data access layer (server-only)
│   └── mock-data.ts                # Fallback data
├── features/
│   ├── dashboard/                  # KPIs, trend chart, alerts, opportunities
│   ├── campaigns/                  # Campaigns table
│   ├── keywords/                   # Keywords table
│   ├── opportunities/              # Opportunities view
│   └── reporting/                  # Weekly report view
├── components/
│   ├── layout/                     # Sidebar, topbar, data source banner
│   ├── shared/                     # KPI tile, sparkline
│   ├── charts/                     # Recharts wrappers
│   ├── ui/                         # shadcn/ui components
│   └── sheets-setup.tsx            # Sheets connection UI
└── lib/
    ├── formatters.ts               # USD, %, number formatters
    ├── constants.ts                # Colors, nav items
    └── utils.ts                    # cn() utility
```

### Data Flow

```
Google Sheets (CSV) ──▶ sheets-loader.ts ──▶ data-repository.ts (cached 60s)
                                                        │
              mock-data.ts (fallback) ─────────────────▶
                                                        │
                                              Server Components
                                                        │
                                            Client Components (interactive)
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/data` | GET | Full app data (live + mock merged) |
| `/api/sheets` | GET | Sheet connection status |
| `/api/refresh` | POST | Invalidate server-side cache |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data**: Google Sheets CSV (server-side fetch)
- **Fonts**: Inter (Google Fonts via next/font)

---

## Development

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

---

## Deployment

Deploy to Vercel with zero config:

```bash
npx vercel
```

Set environment variables in Vercel dashboard if using custom Sheet IDs.

---

## Migration Notes (from Vite/Hono version)

| Vite version | Next.js version |
|---|---|
| `src/index.tsx` (Hono routes) | `src/app/api/*/route.ts` (Next.js API routes) |
| `src/data/sheetsLoader.ts` | `src/data/sheets-loader.ts` (+ `server-only`) |
| `src/data/mockData.ts` | `src/data/mock-data.ts` (same data, renamed) |
| Hono `loadFromSheets()` | Same logic, Next.js `fetch()` with `next: { revalidate: 60 }` |
| Inline HTML template | `src/app/layout.tsx` + `globals.css` |
| No routing | Next.js App Router pages |

### Key Changes
- **`server-only`** package prevents sheets-loader and data-repository from accidentally being bundled client-side
- **60-second in-memory cache** in `data-repository.ts` avoids hitting Google Sheets on every request
- **Keyword types** are now strongly typed (`Keyword` interface) instead of `any`
- **Sheet IDs** can now be overridden via env vars (falls back to hardcoded defaults)
- **Keywords page** added — was missing from the Vite version's frontend (API existed, UI didn't)

### Known Gotchas
- Google Sheets CSV fetch can be slow (up to 8 seconds timeout) — the 60s cache mitigates this
- If sheets aren't published, mock data is used silently — check `/setup` to verify
- `keywords` array is empty by default (mock data has no keywords) — publish the Keywords sheet to see live data
