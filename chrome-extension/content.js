// Content script for AI Notes for Jane

// Chrome can't match on URL fragments, so guard here.
// Activate only on patient chart pages: #patients/<id>/charts
function onPatientChartsPage() {
    return /^#patients\/\d+\/charts/.test(window.location.hash);
}

function removeOverlay() {
    const existing = document.getElementById('ain-overlay');
    if (existing) existing.remove();
    const modal = document.getElementById('ain-modal');
    if (modal) modal.remove();
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
    // Clean up any stale modal from a previous inject cycle
    const staleModal = document.getElementById('ain-modal');
    if (staleModal) staleModal.remove();

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
            <div class="ain-select-row">
                <select id="ain-presets" class="ain-select">
                    <option value="">Saved comments</option>
                </select>
                <button id="ain-manage-comments" class="ain-icon-btn" title="Manage comments">&#9881;</button>
            </div>
            <textarea id="ain-therapist-comments" class="ain-textarea" placeholder="Enter comments for the AI..."></textarea>
            <button id="ain-generate" class="ain-button ain-button-secondary">
                <span class="ain-spinner" id="ain-spinner"></span>
                <span id="ain-generate-label">Generate Notes</span>
            </button>
            <div id="ain-status" class="ain-status"></div>
        </div>
    `;

    document.documentElement.appendChild(overlay);

    // --- Collapse toggle ---
    let collapsed = false;
    document.getElementById('ain-toggle').addEventListener('click', () => {
        collapsed = !collapsed;
        document.getElementById('ain-body').style.display = collapsed ? 'none' : 'flex';
        document.getElementById('ain-toggle').textContent = collapsed ? '+' : '−';
        overlay.style.padding = collapsed ? '14px 24px' : '24px';
    });

    // --- Comments select ---
    const select = document.getElementById('ain-presets');
    const textarea = document.getElementById('ain-therapist-comments');

    function renderSelect(presets) {
        select.innerHTML = '<option value="">Saved comments</option>';
        presets.forEach(text => {
            const opt = document.createElement('option');
            opt.value = text;
            opt.textContent = text.length > 50 ? text.slice(0, 50) + '…' : text;
            opt.title = text;
            select.appendChild(opt);
        });
    }

    getPresets().then(renderSelect);

    select.addEventListener('change', () => {
        if (select.value) textarea.value = select.value;
    });

    // --- Manage comments modal ---
    const modal = document.createElement('div');
    modal.id = 'ain-modal';
    modal.className = 'ain-modal-backdrop';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="ain-modal">
            <div class="ain-modal-header">
                <span>Saved comments</span>
                <button id="ain-modal-close" class="ain-toggle" title="Close">&#x2715;</button>
            </div>
            <ul id="ain-modal-list" class="ain-modal-list"></ul>
            <div class="ain-modal-add">
                <textarea id="ain-modal-new" class="ain-textarea" placeholder="New comment…" rows="3"></textarea>
                <button id="ain-modal-save" class="ain-button">Add comment</button>
            </div>
        </div>
    `;
    document.documentElement.appendChild(modal);

    function renderModalList(presets) {
        const list = document.getElementById('ain-modal-list');
        list.innerHTML = '';
        if (presets.length === 0) {
            list.innerHTML = '<li class="ain-modal-empty">No saved comments yet.</li>';
            return;
        }
        presets.forEach(text => {
            const li = document.createElement('li');
            li.className = 'ain-modal-item';
            li.innerHTML = `
                <span class="ain-modal-item-text" title="${text.replace(/"/g, '&quot;')}">${text}</span>
                <button class="ain-modal-delete ain-button-ghost ain-button-ghost-danger" data-value="${text.replace(/"/g, '&quot;')}">Delete</button>
            `;
            list.appendChild(li);
        });
    }

    async function refreshBoth() {
        const presets = await getPresets();
        renderSelect(presets);
        renderModalList(presets);
    }

    document.getElementById('ain-manage-comments').addEventListener('click', async () => {
        const presets = await getPresets();
        renderModalList(presets);
        modal.style.display = 'flex';
    });

    document.getElementById('ain-modal-close').addEventListener('click', () => {
        modal.style.display = 'none';
        document.getElementById('ain-modal-new').value = '';
    });

    modal.addEventListener('click', e => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.getElementById('ain-modal-new').value = '';
        }
    });

    document.getElementById('ain-modal-list').addEventListener('click', async e => {
        const btn = e.target.closest('.ain-modal-delete');
        if (!btn) return;
        const text = btn.dataset.value;
        const updated = await deletePreset(text);
        renderModalList(updated);
        renderSelect(updated);
        if (textarea.value === text) textarea.value = '';
    });

    document.getElementById('ain-modal-save').addEventListener('click', async () => {
        const input = document.getElementById('ain-modal-new');
        const text = input.value.trim();
        if (!text) return;
        const updated = await addPreset(text);
        renderModalList(updated);
        renderSelect(updated);
        input.value = '';
    });

    // --- Generate ---
    document.getElementById('ain-generate').addEventListener('click', () => {
        createDuplicateNote();
    });

}
