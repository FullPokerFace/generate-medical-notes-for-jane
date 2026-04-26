# CLAUDE.md — AI Notes for Jane

## What this project is
A Google Chrome extension that injects a UI panel into janeapp.com. When the user clicks **Generate Notes**, it duplicates the current SOAP note, reads the existing field values, sends them to a local Express server, which calls OpenAI GPT-4o to rewrite the note, and fills the result back into the page.

## Tech stack
- Chrome Extension — Manifest V3, plain JS (no bundler), content scripts, lives in `chrome-extension/`
- Express server — Node.js, `server/app.js`, port 3009
- OpenAI — GPT-4o via `openai` npm package, key loaded from `server/.env.example` via dotenv

## Key files
- `chrome-extension/content.js` — injects the overlay panel into janeapp.com on page load
- `chrome-extension/utils/createDuplicateNote.js` — orchestrates the full flow (expand → duplicate → read → AI → fill)
- `chrome-extension/utils/fillSoapFields.js` — reads/writes the 4 Quill editor fields (Subjective, Objective, Assessment, Plan) using `aria-label` selectors
- `chrome-extension/utils/clickExpandButton.js` — clicks `.btn-invisible.dropdown-toggle.btn.btn-default`
- `chrome-extension/utils/clickDuplicateMenuItem.js` — uses `findByText()` to click the Duplicate menu item
- `chrome-extension/utils/findByText.js` — reusable helper: finds any element by selector + text content
- `server/app.js` — `POST /generate-soap` endpoint, calls OpenAI, returns new SOAP JSON
- `chrome-extension/styles.css` — overlay panel styles (light theme, fixed top-right at `right: 350px`)
- `chrome-extension/manifest.json` — MV3, host permissions locked to `https://*.janeapp.com/*`

## How to run
```bash
# Start the server
cd server
npm run dev

# Load the extension
# chrome://extensions → Developer mode → Load unpacked → select the chrome-extension/ folder
```

## Important notes
- The SOAP fields in Jane are Quill editors — fill them via `el.innerHTML` + dispatch `input` event, NOT via `setNativeValue`
- `getSoapFields()` returns lowercase keys; `fillAllSoapFields()` accepts both lowercase and sentence-case to handle GPT response variation
- `server/.env.example` contains the real OpenAI API key — it is gitignored, never commit it
- The overlay is appended to `document.documentElement` (not `document.body`) so it renders on top of everything
- Content scripts load in this order: `utils/waitForElement.js` → `utils/setNativeValue.js` → `utils/findByText.js` → `utils/clickExpandButton.js` → `utils/clickDuplicateMenuItem.js` → `utils/fillSoapFields.js` → `utils/createDuplicateNote.js` → `content.js`

## Next steps
- Replace hardcoded doctor comment with a text input in the overlay panel
- Add patient context detection from the Jane page
- Persist state in `chrome.storage.local` across navigations
