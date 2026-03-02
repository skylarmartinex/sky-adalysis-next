# Google Apps Script Mini-Apps — Setup Guide

5 independent mini-apps, each in its own Google Sheet. They read data directly from your existing automated Google Sheets.

---

## Your Data Sources (already set up — no action needed)

| Sheet | ID | Auto-populated |
|-------|----|----------------|
| Adobe Stock - Automated Campaign Data | `1ngxoTvo11Og9w71zWJdBdEikVTeokIEQgeUUQjHBWsM` | ✅ Daily |
| Adobe Stock - Automated Keyword Data | `1vUc7bOmU-_MKctbqYQ0Zm28x_bQ_LGoKEW2mbzdTOBc` | ✅ Daily |
| Adobe Stock - Automated Search Term Data | `1YNhDFgtak0Yf00mq849GvtIA3E3h74iPHX99toIJA0w` | ✅ Daily |

These IDs are **already hardcoded** in `Utils.gs`. No Data Lake setup needed.

---

## How to Set Up a Mini-App

Same process for all 5 apps:

### 1. Create a new Google Sheet
Name it something like `Campaign Dashboard`, `Search Term Auditor`, etc.

### 2. Open the Apps Script editor
Go to **Extensions → Apps Script**

### 3. Add the files

You'll see one default file (`Code.gs`) in the left sidebar. Here's what to do:

| Step | Action | What to paste |
|------|--------|---------------|
| **A** | Select `Code.gs` (already exists) | Delete everything → paste the app's `Code.gs.js` |
| **B** | Click **+** next to "Files" → **Script** → name it `Utils` | Paste `_shared/Utils.gs.js` |
| **C** | *(App 01 only)* Click **+** → **HTML** → name it `Sidebar` | Paste `01-campaign-dashboard/Sidebar.html` |

Your file panel should look like:
```
Files
├── Code.gs       ← the app's main code
├── Utils.gs      ← shared utilities (same for all apps)
└── Sidebar.html  ← only for Campaign Dashboard
```

### 4. Save and reload
- Click **💾 Save** (Ctrl+S / Cmd+S)
- Go back to your Google Sheet tab
- **Reload the page** (Ctrl+R / Cmd+R)
- The **⚡ Adalysis** menu will appear in the menu bar

### 5. Use the app
Click **⚡ Adalysis** and use the menu items. That's it!

---

## File Reference

```
gas-apps/
├── _shared/
│   └── Utils.gs.js              ← REQUIRED: copy into every app as "Utils.gs"
├── 01-campaign-dashboard/
│   ├── Code.gs.js               ← KPI dashboard + campaign table
│   └── Sidebar.html             ← Dark-themed sidebar panel
├── 02-search-term-auditor/
│   └── Code.gs.js               ← Waste flagging + neg keyword generator
├── 03-keyword-analyzer/
│   └── Code.gs.js               ← QS analysis + exact match harvest
├── 04-weekly-report/
│   └── Code.gs.js               ← Auto-generate Google Doc report
└── 05-account-audit/
    └── Code.gs.js               ← 18-point audit with auto-checks
```

---

## Menu Items Per App

| # | App | ⚡ Adalysis Menu Items |
|---|-----|----------------------|
| 01 | **Campaign Dashboard** | 📊 Open Dashboard · 🔄 Refresh Campaign Data |
| 02 | **Search Term Auditor** | 🔄 Refresh · 🚩 Flag Waste · 📋 Generate Negatives · 💰 Estimate Savings |
| 03 | **Keyword Analyzer** | 🔄 Refresh · 📊 Analyze QS · 🎯 Exact Match Harvest · ⏸️ Flag Underperformers |
| 04 | **Weekly Report** | 📝 Generate Report · 📧 Email as PDF |
| 05 | **Account Audit** | 🔄 Run Audit · 📊 Show Score |

---

## FAQ

**Q: The ⚡ Adalysis menu doesn't appear.**
A: Reload the sheet page. The menu is created by `onOpen()` which runs when the sheet loads.

**Q: I get "Exception: You do not have permission"**
A: First run requires authorization. Click ▶ Run in the script editor → review permissions → allow.

**Q: Can I change the data source sheet IDs?**
A: Yes — edit the `SHEET_IDS` object at the top of `Utils.gs`.

**Q: If one app breaks, do the others break too?**
A: No. Each app is a completely separate Google Sheet with its own script. They're independent.
