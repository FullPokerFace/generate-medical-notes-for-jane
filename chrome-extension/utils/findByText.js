// Finds the first element matching `selector` whose text content contains `text` (case-insensitive)
function findByText(selector, text) {
    const elements = document.querySelectorAll(selector);
    const match = Array.from(elements).find(el =>
        el.textContent.trim().toLowerCase().includes(text.toLowerCase())
    );
    if (match) {
        console.log(`[AI Notes for Jane] findByText("${selector}", "${text}") found:`, match);
    } else {
        console.warn(`[AI Notes for Jane] findByText("${selector}", "${text}") — no match found.`);
    }
    return match || null;
}
