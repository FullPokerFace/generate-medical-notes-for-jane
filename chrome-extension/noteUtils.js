// Note-filling utilities for AI Notes for Jane

async function fillNoteField(selector, noteText) {
  try {
    const field = await waitForElement(selector);
    setNativeValue(field, noteText);
    console.log(`[AI Notes for Jane] Filled field: ${selector}`);
    return true;
  } catch (err) {
    console.warn(`[AI Notes for Jane] Could not fill field ${selector}:`, err.message);
    return false;
  }
}

async function clickButton(selector) {
  try {
    const btn = await waitForElement(selector);
    btn.click();
    console.log(`[AI Notes for Jane] Clicked: ${selector}`);
    return true;
  } catch (err) {
    console.warn(`[AI Notes for Jane] Could not click ${selector}:`, err.message);
    return false;
  }
}

async function fillAllNoteFields(noteText) {
  // TODO: add real selectors for the target EHR / form fields
  const fieldSelectors = [];
  const results = await Promise.all(fieldSelectors.map(sel => fillNoteField(sel, noteText)));
  return results.every(Boolean);
}
