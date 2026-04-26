function clickExpandButton() {
    const btn = document.querySelector('.btn-invisible.dropdown-toggle.btn.btn-default');
    if (btn) {
        console.log('[AI Notes for Jane] Expand button found:', btn);
        btn.click();
        console.log('[AI Notes for Jane] Expand button clicked.');
    } else {
        console.warn('[AI Notes for Jane] Expand button not found.');
    }
}
