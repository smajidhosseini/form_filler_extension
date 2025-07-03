chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'generateAndFill') {
    const schema = Array.from(document.querySelectorAll('input, textarea, select')).map(el => ({
      key: el.name || el.id || null,
      type: el.type || el.tagName.toLowerCase(),
      label: el.labels?.[0]?.innerText || null
    }));
    chrome.runtime.sendMessage({ action: 'requestFill', formStructure: schema });
  }
  if (msg.action === 'fillForm') {
    const values = msg.values || {};
    Object.entries(values).forEach(([key, val]) => {
      const el = document.querySelector(`[name='${key}'], #${key}`);
      if (el) el.value = val;
    });
  }
});