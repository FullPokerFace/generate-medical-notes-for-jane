function clickDuplicateMenuItem() {
    const item = findByText('li[role="presentation"] a', 'Duplicate');
    if (item) {
        item.click();
        console.log('[AI Notes for Jane] Duplicate menu item clicked.');
    } else {
        console.warn('[AI Notes for Jane] Duplicate menu item not found.');
    }
}
