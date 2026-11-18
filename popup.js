const $ = (selector) => document.querySelector(selector);
const status = $('#status');
const actionButtons = [...document.querySelectorAll('.actions button')];

function setStatus(message, type = '') {
  status.textContent = message;
  status.className = type;
}

function setBusy(busy) {
  actionButtons.forEach((button) => { button.disabled = busy; });
}

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !/^https?:/.test(tab.url || '')) throw new Error('Open a job application webpage first.');
  return tab;
}

async function sendToPage(type, payload = {}) {
  const tab = await activeTab();
  return chrome.tabs.sendMessage(tab.id, { type, ...payload }, { frameId: 0 });
}

async function run(action, busyMessage) {
  setBusy(true);
  setStatus(busyMessage);
  try {
    await action();
  } catch (error) {
    setStatus(error.message || String(error), 'error');
  } finally {
    setBusy(false);
  }
}

$('#fill').addEventListener('click', () => run(async () => {
  const page = await sendToPage('GET_PAGE_CONTEXT');
  if (!page?.fields?.length) throw new Error('No fillable fields were found on this page.');
  const response = await chrome.runtime.sendMessage({ type: 'GENERATE_FORM_ANSWERS', page });
  if (!response?.ok) throw new Error(response?.error || 'Could not generate answers.');
  const applied = await sendToPage('APPLY_FORM_ANSWERS', { answers: response.answers });
  setStatus(`Filled ${applied.filled} field${applied.filled === 1 ? '' : 's'}. Review everything before submitting.`, 'success');
}, 'Reading the page and preparing answers…'));

$('#experience').addEventListener('click', () => run(async () => {
  const tab = await activeTab();
  const check = await chrome.tabs.sendMessage(tab.id, { type: 'CHECK_EXPERIENCE' }, { frameId: 0 });
  if (!check?.ok) throw new Error(check?.error || 'Open the Workday My Experience page first.');
  const data = await chrome.runtime.sendMessage({ type: 'EXTRACT_EXPERIENCE' });
  if (!data?.ok) throw new Error(data?.error || 'Could not read experience.');
  setStatus('Adding and filling work experience entries…');
  const result = await chrome.tabs.sendMessage(tab.id, { type: 'FILL_EXPERIENCE', jobs: data.jobs }, { frameId: 0 });
  if (!result?.ok) throw new Error(result?.error || 'Could not fill experience.');
  setStatus(result.summary, 'success');
}, 'Reading work history from your resume…'));

$('#upload').addEventListener('click', () => run(async () => {
  const resume = await chrome.runtime.sendMessage({ type: 'GET_RESUME_BYTES' });
  if (!resume?.ok) throw new Error(resume?.error || 'Resume not found.');
  const result = await sendToPage('UPLOAD_RESUME', resume);
  if (!result?.ok) throw new Error(result?.error || 'No resume upload field found.');
  setStatus(`Attached ${resume.filename}. Review the upload before submitting.`, 'success');
}, 'Finding the resume upload field…'));

$('#cover').addEventListener('click', () => run(async () => {
  const page = await sendToPage('GET_PAGE_CONTEXT');
  const response = await chrome.runtime.sendMessage({ type: 'GENERATE_COVER_LETTER', page });
  if (!response?.ok) throw new Error(response?.error || 'Could not generate a cover letter.');
  $('#resultLabel').textContent = 'Cover letter';
  $('#result').value = response.text;
  $('#matchPanel').classList.add('hidden');
  $('#resultPanel').classList.remove('hidden');
  setStatus('Cover letter generated. Review and personalize it before use.', 'success');
}, 'Drafting a cover letter from this job page…'));

$('#match').addEventListener('click', () => run(async () => {
  const page = await sendToPage('GET_PAGE_CONTEXT');
  const response = await chrome.runtime.sendMessage({ type: 'GENERATE_JOB_MATCH', page });
  if (!response?.ok) throw new Error(response?.error || 'Could not assess this job.');
  const review = response.review;
  const score = Math.max(0, Math.min(100, Number(review.fit_score) || 0));
  $('#matchRing').style.setProperty('--score', score);
  $('#matchRing').style.setProperty('--ring-color', score >= 75 ? '#27885b' : score >= 50 ? '#d39327' : '#c95454');
  $('#matchScore').textContent = `${score}%`;
  $('#matchLevel').textContent = `${review.fit_level} match`;
  $('#matchVerdict').textContent = review.verdict;
  $('#matchStrengths').replaceChildren(...listItems(review.strengths, 'No clear strengths found.'));
  $('#matchGaps').replaceChildren(...listItems(review.gaps, 'No material gaps found.'));
  $('#matchRecommendation').textContent = review.recommendation;
  $('#resultPanel').classList.add('hidden');
  $('#matchPanel').classList.remove('hidden');
  setStatus('Match review generated. The score is an evidence-based estimate, not a hiring probability.', 'success');
}, 'Comparing your resume with this job…'));

function listItems(items, fallback) {
  const values = Array.isArray(items) && items.length ? items : [fallback];
  return values.map((value) => Object.assign(document.createElement('li'), { textContent: value }));
}

$('#api').addEventListener('click', async () => {
  $('#apiPanel').classList.toggle('hidden');
  if (!$('#apiPanel').classList.contains('hidden')) {
    const { openaiApiKey = '' } = await chrome.storage.local.get('openaiApiKey');
    $('#apiKey').value = openaiApiKey;
    $('#apiKey').focus();
  }
});

$('#saveKey').addEventListener('click', async () => {
  const value = $('#apiKey').value.trim();
  if (!value) return setStatus('Enter an API key first.', 'error');
  await chrome.storage.local.set({ openaiApiKey: value });
  $('#apiPanel').classList.add('hidden');
  setStatus('API key saved locally.', 'success');
});

$('#copy').addEventListener('click', async () => {
  await navigator.clipboard.writeText($('#result').value);
  setStatus('Cover letter copied.', 'success');
});

$('#download').addEventListener('click', async () => {
  const url = URL.createObjectURL(new Blob([$('#result').value], { type: 'text/plain' }));
  await chrome.downloads.download({ url, filename: 'cover-letter.txt', saveAs: true });
  setTimeout(() => URL.revokeObjectURL(url), 2000);
});
