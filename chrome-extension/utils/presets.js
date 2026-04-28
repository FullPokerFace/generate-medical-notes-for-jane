const PRESETS_KEY = 'ain_comment_presets';

function getPresets() {
    return new Promise(resolve => {
        chrome.storage.sync.get(PRESETS_KEY, data => {
            resolve(data[PRESETS_KEY] || []);
        });
    });
}

function savePresets(presets) {
    return new Promise(resolve => {
        chrome.storage.sync.set({ [PRESETS_KEY]: presets }, resolve);
    });
}

async function addPreset(text) {
    const presets = await getPresets();
    if (presets.includes(text)) return presets;
    const updated = [...presets, text];
    await savePresets(updated);
    return updated;
}

async function deletePreset(text) {
    const presets = await getPresets();
    const updated = presets.filter(p => p !== text);
    await savePresets(updated);
    return updated;
}
