const fillBtn = document.getElementById("fillBtn");
const noteText = document.getElementById("noteText");
const status = document.getElementById("status");

fillBtn.addEventListener("click", async () => {
  const text = noteText.value.trim();
  if (!text) {
    status.textContent = "Please enter a note first.";
    return;
  }

  fillBtn.disabled = true;
  status.textContent = "Filling fields…";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "FILL_NOTES",
      noteText: text,
    });

    status.textContent = response?.success ? "Done!" : "Could not fill all fields.";
  } catch (err) {
    status.textContent = "Error: " + err.message;
  } finally {
    fillBtn.disabled = false;
  }
});
