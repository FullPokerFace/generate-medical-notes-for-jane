// Background service worker for AI Notes for Jane

chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Notes for Jane installed.');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GENERATE_NOTE') {
        // Placeholder: will call AI API and return generated note
        sendResponse({ success: true, note: 'AI note placeholder' });
    }
    return true;
});
