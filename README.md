# AI Notes for Jane — Project Overview

A Google Chrome extension that injects a UI panel directly into the janeapp.com webpage, duplicates a SOAP note, and rewrites it using AI based on doctor comments.

---

## Project Structure

```
generate-medical-notes-for-jane/
├── chrome-extension/
│   ├── manifest.json                  Chrome extension config (MV3)
│   ├── background.js                  Service worker — handles extension lifecycle
│   ├── content.js                     Injected into janeapp.com — builds and mounts the overlay panel
│   ├── styles.css                     All styles for the injected overlay panel
│   ├── popup.html                     Toolbar popup (secondary UI, via extension icon)
│   ├── popup.js                       Sends messages to the content script from the popup
│   ├── noteUtils.js                   Shared note utility helpers
│   ├── utils.js                       General utility helpers
│   ├── utils/
│   │   ├── waitForElement.js          Polls DOM until a selector appears (MutationObserver)
│   │   ├── setNativeValue.js          Sets field values in a React/Vue-friendly way
│   │   ├── findByText.js              Finds any element by selector + text content match
│   │   ├── clickExpandButton.js       Clicks the dropdown toggle on the notes section
│   │   ├── clickDuplicateMenuItem.js  Clicks the "Duplicate" item in the dropdown menu
│   │   ├── fillSoapFields.js          Reads and writes Subjective/Objective/Assessment/Plan fields
│   │   └── createDuplicateNote.js     Orchestrates the full duplicate + AI fill flow
│   └── images/
│       ├── icon16.png
│       ├── icon32.png
│       ├── icon48.png
│       └── icon128.png
├── server/
│   ├── app.js                         Express server — receives SOAP, calls OpenAI, returns new SOAP
│   ├── package.json
│   ├── .env.example                   Contains OPENAI_API_KEY — gitignored, never commit
│   └── node_modules/
└── .gitignore                         Ignores node_modules, .env, .env.example
```

---

## How It Works

### 1. Manifest (`manifest.json`)
- Manifest Version 3 (MV3)
- Permissions: `activeTab`, `scripting`, `storage`, `tabs`
- Host permissions locked to `https://*.janeapp.com/*` — extension only activates on Jane
- Content scripts load in order: all `utils/` files → `content.js`, plus `styles.css`
- `background.js` runs as a service worker

### 2. Overlay Panel (`content.js` + `styles.css`)
- On page load, `content.js` creates `<div id="ain-overlay">` and appends it to `document.documentElement` so it sits on top of all page content
- Panel is `position: fixed`, anchored top-right at `right: 350px` to avoid overlapping Jane's own UI
- Panel contains:
  - Header bar: title + **collapse/expand toggle** (`−` / `+`)
  - **Generate Notes** button — triggers the full flow
  - Status line for feedback
- Clicking `−` collapses to just the header bar; `+` expands again
- Light theme: `#f1f5f9` background, `#1e293b` text, `#259ECA` accent

### 3. Full Generate Notes Flow (`utils/createDuplicateNote.js`)
Clicking **Generate Notes** runs `createDuplicateNote()`:

| Step | What happens |
|------|-------------|
| 1 | `clickExpandButton()` — opens the notes dropdown |
| 2 | Wait 500ms → `clickDuplicateMenuItem()` — clicks Duplicate |
| 3 | Wait 1500ms for the duplicated note to render |
| 4 | `getSoapFields()` — reads current Subjective, Objective, Assessment, Plan from the page |
| 5 | `fetch POST /generate-soap` — sends SOAP to local server |
| 6 | Server calls OpenAI GPT-4o, returns rewritten SOAP |
| 7 | `fillAllSoapFields()` — writes AI content into each Quill editor field |

### 4. SOAP Field Reading & Writing (`utils/fillSoapFields.js`)
- **`getSoapFields()`** — queries `.ql-editor[aria-label="Subjective"]` etc., reads `innerText`, returns lowercase keys (`subjective`, `objective`, `assessment`, `plan`)
- **`fillSoapField(label, text)`** — focuses the Quill editor, sets `innerHTML`, fires an `input` event so Jane registers the change
- **`fillAllSoapFields(soap)`** — accepts both sentence-case and lowercase keys (handles whatever GPT returns)

### 5. Utility Functions (`utils/`)

| File | Function | Purpose |
|------|----------|---------|
| `waitForElement.js` | `waitForElement(selector, timeout)` | MutationObserver DOM polling |
| `setNativeValue.js` | `setNativeValue(element, value)` | React/Vue-safe field setter |
| `findByText.js` | `findByText(selector, text)` | Finds element by selector + text content (case-insensitive) |
| `clickExpandButton.js` | `clickExpandButton()` | Clicks `.btn-invisible.dropdown-toggle.btn.btn-default` |
| `clickDuplicateMenuItem.js` | `clickDuplicateMenuItem()` | Uses `findByText` to click the Duplicate menu item |
| `fillSoapFields.js` | `getSoapFields()` / `fillAllSoapFields()` | Read and write all 4 SOAP fields |
| `createDuplicateNote.js` | `createDuplicateNote()` | Full orchestration of all steps |

### 6. Server (`server/app.js`)
- Express server on `http://localhost:3009`
- `dotenv` loads `OPENAI_API_KEY` from `server/.env.example`
- **`POST /generate-soap`** — accepts `{ subjective, objective, assessment, plan }`, injects doctor comment *"patient has ~10% improvement"*, sends to GPT-4o with `response_format: json_object`, normalizes response keys to lowercase, returns new SOAP JSON
- CORS open to all origins so the Chrome extension can reach it
- Unhandled errors surface as a 500 in the server terminal

### 7. Git Setup
- Repo initialized with `git init`
- `.gitignore` excludes `server/node_modules`, `server/.env`, `server/.env.example` — API key never committed

---

## Running the Server

```bash
cd server
npm run dev
# Server starts at http://localhost:3009
```

API key lives in `server/.env.example` and is loaded automatically via `dotenv`.

---

## Loading the Extension in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (toggle, top-right)
3. Click **Load unpacked**
4. Select the `chrome-extension/` folder inside `generate-medical-notes-for-jane`
5. Navigate to any `janeapp.com` page — the panel appears automatically top-right

To reload after code changes: click the refresh icon on the extension card in `chrome://extensions`, then hard-refresh the janeapp.com tab.

---

## Next Steps

- [ ] Replace hardcoded doctor comment with a text input in the overlay panel
- [ ] Add patient context detection (read appointment/patient data from the Jane page)
- [ ] Persist state in `chrome.storage.local` across page navigations
