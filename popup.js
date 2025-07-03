document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('openaiApiKey', ({ openaiApiKey }) => {
    if (openaiApiKey) document.getElementById('apiKey').value = openaiApiKey;
  });

  document.getElementById('saveKey').addEventListener('click', () => {
    const key = document.getElementById('apiKey').value.trim();
    chrome.storage.local.set({ openaiApiKey: key }, () => alert('API Key saved.'));
  });

  document.getElementById('fill').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return alert('No active tab found.');
    if (!/^https?:/.test(tab.url)) return alert('Navigate to an HTTP/HTTPS page with a form.');
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
      chrome.tabs.sendMessage(tab.id, { action: 'generateAndFill' });
    } catch (e) {
      console.error('Injection/sendMessage failed', e);
      alert('Could not inject script.');
    }
  });
});