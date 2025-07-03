chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.action === 'requestFill') {
    const { formStructure } = message;
    const { openaiApiKey: apiKey } = await chrome.storage.local.get('openaiApiKey');
    if (!apiKey) return chrome.tabs.sendMessage(sender.tab.id, { action: 'fillForm', values: {} });

    // Load CV text from bundled file
    let cvText = '';
    try {
      const url = chrome.runtime.getURL('cv.tex');
      cvText = await fetch(url).then(r => r.text());
    } catch (e) {
      console.error('Error loading CV:', e);
    }

    const prompt = `You are a form-filling assistant. Using this CV (LaTeX) as source, extract matching values for each field in the schema:

${cvText}

Form Schema:
${JSON.stringify(formStructure)}

Respond with only a JSON object mapping each field key to its value.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type':'application/json','Authorization':`Bearer ${apiKey}` },
      body: JSON.stringify({ model:'gpt-4o-mini', messages:[{role:'user',content:prompt}] })
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    let values = {};
    try {
      const clean = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      values = JSON.parse(clean);
    } catch (e) {
      console.error('Parsing error:', e, raw);
    }
    chrome.tabs.sendMessage(sender.tab.id, { action: 'fillForm', values });
  }
  return true;
});