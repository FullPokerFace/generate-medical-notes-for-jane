// Content script for AI Notes for Jane

// Chrome can't match on URL fragments, so guard here.
// Activate only on patient chart pages: #patients/<id>/charts
function onPatientChartsPage() {
    return /^#patients\/\d+\/charts/.test(window.location.hash);
}

function removeOverlay() {
    const existing = document.getElementById('ain-overlay');
    if (existing) existing.remove();
}

function tryInject() {
    if (onPatientChartsPage()) {
        injectOverlay();
    } else {
        removeOverlay();
    }
}

// Handle initial load and SPA-style hash navigation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInject);
} else {
    tryInject();
}
window.addEventListener('hashchange', tryInject);

function injectOverlay() {
    if (document.getElementById('ain-overlay')) return;

    const iconUrl = chrome.runtime.getURL('icon.png');

    const overlay = document.createElement('div');
    overlay.id = 'ain-overlay';
    overlay.className = 'ain-overlay-class';

    overlay.innerHTML = `
        <div class="ain-header">
            <span><img src="${iconUrl}" alt="AI Notes for Jane"/> AI Notes for Jane</span>
            <button id="ain-toggle" class="ain-toggle" title="Collapse">−</button>
        </div>
        <div id="ain-body" class="ain-body">
            <label class="ain-label" for="ain-therapist-comments">Therapist comments</label>
            <textarea id="ain-therapist-comments" class="ain-textarea" placeholder="Enter comments for the AI..."></textarea>
            <button id="ain-generate" class="ain-button ain-button-secondary">
                <span class="ain-spinner" id="ain-spinner"></span>
                <span id="ain-generate-label">Generate Notes</span>
            </button>
            <div id="ain-status" class="ain-status"></div>
        </div>
    `;

    document.documentElement.appendChild(overlay);

    let collapsed = false;
    document.getElementById('ain-toggle').addEventListener('click', () => {
        collapsed = !collapsed;
        document.getElementById('ain-body').style.display = collapsed ? 'none' : 'flex';
        document.getElementById('ain-toggle').textContent = collapsed ? '+' : '−';
        overlay.style.padding = collapsed ? '14px 24px' : '24px';
    });

    document.getElementById('ain-generate').addEventListener('click', () => {
        createDuplicateNote();
    });

}
