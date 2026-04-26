async function createDuplicateNote() {
    console.log('[AI Notes for Jane] Starting createDuplicateNote…');

    // Step 1: open the dropdown
    clickExpandButton();

    // Step 2: wait for dropdown to render, then click Duplicate
    await new Promise(resolve => setTimeout(resolve, 500));
    clickDuplicateMenuItem();

    // Step 3: wait for duplicated note to render
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 4: read current SOAP values
    console.log('[AI Notes for Jane] Reading current SOAP field values…');
    const currentSoap = getSoapFields();

    // Step 5: send to server, get AI-generated SOAP back
    console.log('[AI Notes for Jane] Sending to server for AI generation…');
    let newSoap;
    try {
        const response = await fetch(`${AIN_SERVER_URL}/generate-soap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentSoap),
        });
        const raw = await response.json();
        // Normalize keys to lowercase
        newSoap = Object.fromEntries(
            Object.entries(raw).map(([k, v]) => [k.toLowerCase(), v])
        );
        console.log('[AI Notes for Jane] Received new SOAP from server:', newSoap);
    } catch (err) {
        console.error('[AI Notes for Jane] Server request failed:', err.message);
        return;
    }

    // Step 6: fill fields with AI-generated content
    fillAllSoapFields(newSoap);

    console.log('[AI Notes for Jane] createDuplicateNote complete.');
}
