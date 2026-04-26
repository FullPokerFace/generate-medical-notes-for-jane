function getSoapFields() {
    const fields = ['Subjective', 'Objective', 'Assessment', 'Plan'];
    const result = {};

    fields.forEach(label => {
        const el = document.querySelector(`.ql-editor[aria-label="${label}"]`);
        if (el) {
            result[label.toLowerCase()] = el.innerText.trim();
            console.log(`[AI Notes for Jane] ${label}:`, result[label]);
        } else {
            result[label.toLowerCase()] = '';
            console.warn(`[AI Notes for Jane] ${label} field not found.`);
        }
    });

    return result;
}

function fillSoapField(label, text) {
    const el = document.querySelector(`.ql-editor[aria-label="${label}"]`);
    if (!el) {
        console.warn(`[AI Notes for Jane] Cannot fill — ${label} field not found.`);
        return false;
    }

    el.focus();
    el.innerHTML = `<div>${text}</div>`;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    console.log(`[AI Notes for Jane] Filled ${label}:`, text);
    return true;
}

function fillAllSoapFields(soap) {
    console.log('[AI Notes for Jane] fillAllSoapFields called with:', soap);
    fillSoapField('Subjective', soap.Subjective || soap.subjective);
    fillSoapField('Objective', soap.Objective || soap.objective);
    fillSoapField('Assessment', soap.Assessment || soap.assessment);
    fillSoapField('Plan', soap.Plan || soap.plan);
}
