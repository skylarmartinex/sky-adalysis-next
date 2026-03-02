# Google Apps Script Mini-Apps — Setup Guide

All 5 mini-apps live in `gas-apps/`. Each app is independent and runs in its own Google Sheet.

---

## Folder Structure

```
gas-apps/
├── _shared/
│   ├── Utils.gs.js            ← Copy into every mini-app
│   └── DataLakeSetup.gs.js    ← Only for the Data Lake sheet
├── 01-campaign-dashboard/
│   ├── Code.gs.js             ← Main script
│   └── Sidebar.html           ← Dashboard UI panel
├── 02-search-term-auditor/
│   └── Code.gs.js
├── 03-keyword-analyzer/
│   └── Code.gs.js
├── 04-weekly-report/
│   └── Code.gs.js
└── 05-account-audit/
    └── Code.gs.js
```

---

## Step-by-Step Setup

### 1. Create the Data Lake Sheet

1. Create a new Google Sheet → name it **"Ads Data Lake"**
2. Open **Extensions → Apps Script**
3. Paste the contents of `_shared/DataLakeSetup.gs.js` and `_shared/Utils.gs.js`
4. Run **Adalysis → Setup Data Lake Tabs**
5. Copy the Sheet ID (shown via menu, or from the URL)
6. Export data from Google Ads and paste into the matching tabs

### 2. Set Up Each Mini-App

For each mini-app (01 through 05):

1. Create a new Google Sheet → name it (e.g., **"Campaign Dashboard"**)
2. Open **Extensions → Apps Script**
3. Paste `_shared/Utils.gs.js` as a new file named `Utils.gs`
4. Paste the app's `Code.gs.js` into `Code.gs`
5. For app 01, also add `Sidebar.html` as an HTML file
6. Reload the sheet → click **Adalysis → Setup → Set Data Lake Sheet ID**
7. Paste the Data Lake Sheet ID

### 3. Quick Reference

| App | Menu Items |
|-----|-----------|
| **01 Campaign Dashboard** | Open Dashboard, Refresh Campaign Data, Refresh Daily Metrics |
| **02 Search Term Auditor** | Refresh Search Terms, Flag Waste Terms, Generate Negative List, Estimate Savings |
| **03 Keyword Analyzer** | Refresh Keywords, Analyze QS, Find Exact Match Harvest, Flag Underperformers |
| **04 Weekly Report** | Generate Weekly Report, Email Report as PDF |
| **05 Account Audit** | Run Full Audit, Show Audit Score |

---

## Tips

- **If something breaks**, only that one sheet is affected — the others keep working
- **Share a tool** by sharing the Google Sheet (Viewer = read-only, Editor = full access)
- **Update data** by re-exporting from Google Ads and pasting into the Data Lake
- **Customize thresholds** by editing the constants in each `Code.gs` (e.g., CPA > $100 = red)
