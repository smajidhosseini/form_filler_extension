const MAX_PAGE_TEXT = 24000;

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function isVisible(element) {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
}

function labelFor(element) {
  const labels = element.labels ? [...element.labels].map((label) => label.innerText) : [];
  const aria = element.getAttribute('aria-label');
  const labelledBy = element.getAttribute('aria-labelledby');
  const referenced = labelledBy
    ? labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.innerText).filter(Boolean)
    : [];
  const nearby = element.closest('label, fieldset, [role="group"], .form-group, .field')?.innerText;
  return clean([...labels, aria, ...referenced, nearby, element.placeholder, element.name].filter(Boolean).join(' | ')).slice(0, 500);
}

function selectorFor(element, index) {
  if (element.id) return `#${CSS.escape(element.id)}`;
  if (element.name) {
    const selector = `${element.tagName.toLowerCase()}[name="${CSS.escape(element.name)}"]`;
    if (document.querySelectorAll(selector).length === 1) return selector;
  }
  element.dataset.jobAssistantId = String(index);
  return `[data-job-assistant-id="${index}"]`;
}

function getFields() {
  const elements = [...document.querySelectorAll('input, textarea, select')]
    .filter((el) => isVisible(el) && !el.disabled && !el.readOnly)
    .filter((el) => !['hidden', 'submit', 'button', 'reset', 'file', 'image', 'password'].includes(el.type));

  return elements.map((element, index) => ({
    id: selectorFor(element, index),
    label: labelFor(element),
    tag: element.tagName.toLowerCase(),
    type: element.type || '',
    required: Boolean(element.required || element.getAttribute('aria-required') === 'true'),
    currentValue: ['checkbox', 'radio'].includes(element.type) ? String(element.checked) : element.value,
    options: element.tagName === 'SELECT'
      ? [...element.options].map((option) => ({ value: option.value, text: clean(option.textContent) })).slice(0, 100)
      : undefined
  }));
}

function pageContext() {
  return {
    url: location.href,
    title: document.title,
    pageText: clean(document.body?.innerText).slice(0, MAX_PAGE_TEXT),
    fields: getFields()
  };
}

function setNativeValue(element, value) {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  setter ? setter.call(element, value) : (element.value = value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

function applyAnswers(answers) {
  let filled = 0;
  for (const answer of answers || []) {
    const element = document.querySelector(answer.id);
    if (!element || answer.value === null || answer.value === undefined || answer.value === '') continue;

    if (element instanceof HTMLSelectElement) {
      const target = clean(answer.value).toLowerCase();
      const option = [...element.options].find((item) =>
        item.value.toLowerCase() === target || clean(item.textContent).toLowerCase() === target
      );
      if (!option) continue;
      element.value = option.value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (element.type === 'radio' || element.type === 'checkbox') {
      const shouldCheck = answer.value === true || /^(true|yes|1|checked)$/i.test(String(answer.value));
      if (element.checked !== shouldCheck) element.click();
    } else {
      setNativeValue(element, String(answer.value));
    }
    element.style.outline = '2px solid #2f9e68';
    element.style.outlineOffset = '2px';
    filled += 1;
  }
  return { filled };
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function uploadResume({ filename, mimeType, base64 }) {
  const inputs = [...document.querySelectorAll('input[type="file"]')];
  const target = inputs.find((input) => /resume|cv|curriculum/i.test(labelFor(input))) || inputs[0];
  if (!target) return { ok: false, error: 'No file upload field was found on this page.' };

  const file = new File([base64ToBytes(base64)], filename, { type: mimeType });
  const transfer = new DataTransfer();
  transfer.items.add(file);
  target.files = transfer.files;
  target.dispatchEvent(new Event('input', { bubbles: true }));
  target.dispatchEvent(new Event('change', { bubbles: true }));
  return { ok: true };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'CHECK_EXPERIENCE') {
    sendResponse(experienceSection() ? { ok: true } : { ok: false, error: 'Open the My Experience step with a Work Experience section.' });
    return;
  }
  if (message.type === 'FILL_EXPERIENCE') {
    fillExperience(message.jobs).then(sendResponse).catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  try {
    if (message.type === 'GET_PAGE_CONTEXT') sendResponse(pageContext());
    else if (message.type === 'APPLY_FORM_ANSWERS') sendResponse(applyAnswers(message.answers));
    else if (message.type === 'UPLOAD_RESUME') sendResponse(uploadResume(message));
  } catch (error) {
    sendResponse({ ok: false, error: error.message });
  }
});

// Workday changes its generated IDs between renders. Resolve controls again for
// each write and scope Add actions strictly to the Work Experience section.
function experienceSection() {
  return [...document.querySelectorAll('[data-automation-id="workExperienceSection"]')].find(isVisible) ||
    [...document.querySelectorAll('section, [role="region"]')].find(el =>
      [...el.querySelectorAll('h2,h3,legend')].some(h => /^work experience$/i.test(clean(h.textContent))));
}

function experienceRows() {
  const section = experienceSection();
  if (!section) return [];
  const titles = [...section.querySelectorAll('input')].filter(el =>
    /jobtitle/i.test(`${el.id} ${el.name} ${el.getAttribute('data-automation-id')}`) || /^job title\b/i.test(labelFor(el)));
  return titles.map(title => {
    let row = title.parentElement;
    while (row && row !== section) {
      if (row.querySelector('[data-automation-id="company"], [id*="company"], [id*="Company"]') &&
          titles.filter(t => row.contains(t)).length === 1) return row;
      row = row.parentElement;
    }
    return null;
  }).filter(Boolean);
}

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, message) {
  const end = Date.now() + 6000;
  while (Date.now() < end) {
    const value = fn();
    if (value) return value;
    await pause(100);
  }
  throw new Error(message);
}

function roleControl(row, key) {
  const names = {
    title: ['jobTitle'], company: ['company'], location: ['location'],
    description: ['roleDescription'], current: ['currentlyWorkHere', 'currentlyWork']
  };
  const labels = { title: /job title/i, company: /company|employer/i, location: /location/i,
    description: /role description|responsibilities|description/i, current: /currently work|current employer/i };
  return [...row.querySelectorAll('input,textarea,select,[role="checkbox"]')].find(el =>
    names[key].some(name => el.getAttribute('data-automation-id') === name || el.id.toLowerCase().endsWith('-' + name.toLowerCase()))) ||
    [...row.querySelectorAll('input,textarea,select,[role="checkbox"]')].find(el => labels[key].test(clean([
      ...(el.labels ? [...el.labels].map(l => l.textContent) : []), el.getAttribute('aria-label'), el.name
    ].join(' '))));
}

function dateControl(row, side, part) {
  const group = row.querySelector(`[data-automation-id="${side}Date"]`) ||
    [...row.querySelectorAll('[data-automation-id="formField"], [role="group"]')].find(el =>
      new RegExp(side === 'start' ? 'from|start date' : 'to|end date', 'i').test(el.textContent));
  return group?.querySelector(`[data-automation-id="dateSection${part === 'Month' ? 'Month' : 'Year'}-input"], input[aria-label="${part}"], input[placeholder="${part === 'Month' ? 'MM' : 'YYYY'}"]`) ||
    [...row.querySelectorAll('input')].find(el => new RegExp(`${side}Date.*${part}`, 'i').test(el.id));
}

async function writeExperience(index, job) {
  let filled = 0;
  const missing = [];
  for (const key of ['title', 'company', 'location', 'description', 'current', 'startMonth', 'startYear', 'endMonth', 'endYear']) {
    if (job[key] === '' || job[key] === null || job[key] === undefined || (job.current && key.startsWith('end'))) continue;
    const row = experienceRows()[index];
    if (!row) throw new Error('The experience form changed. Review the entries and run again.');
    const date = /^(start|end)(Month|Year)$/.exec(key);
    const el = date ? dateControl(row, date[1], date[2]) : roleControl(row, key);
    if (!el || el.disabled || el.readOnly) { missing.push(key); continue; }
    // Preserve user-entered values; a repeat run fills only remaining blanks.
    if (key === 'current') {
      const checked = el.checked ?? (el.getAttribute('aria-checked') === 'true');
      if (job.current === true && !checked) el.click();
    } else {
      if (clean(el.value)) continue;
      el.focus();
      setNativeValue(el, job[key]);
      el.blur();
    }
    await pause(120);
    const updated = date ? dateControl(experienceRows()[index], date[1], date[2]) : roleControl(experienceRows()[index], key);
    if (key !== 'current' && clean(updated?.value) !== clean(job[key])) missing.push(key);
    else filled++;
  }
  return { filled, missing };
}

let experienceBusy = false;
async function fillExperience(jobs) {
  if (experienceBusy) throw new Error('Experience filling is already running.');
  if (!Array.isArray(jobs) || !jobs.length || jobs.length > 40) throw new Error('Invalid work history.');
  experienceBusy = true;
  let added = 0, filled = 0, skipped = 0;
  const notes = [];
  try {
    for (const job of jobs) {
      if (!clean(job.company) || !clean(job.title)) { skipped++; continue; }
      let rows = experienceRows();
      const normalized = value => clean(value).toLowerCase();
      let index = rows.findIndex(row => normalized(roleControl(row, 'company')?.value) === normalized(job.company) && normalized(roleControl(row, 'title')?.value) === normalized(job.title) &&
        (!job.startYear || !dateControl(row, 'start', 'Year')?.value || dateControl(row, 'start', 'Year')?.value === job.startYear));
      if (index < 0) index = rows.findIndex(row => [...row.querySelectorAll('input:not([type="checkbox"]),textarea,select')].every(el => !clean(el.value)));
      if (index < 0) {
        const section = experienceSection();
        const add = [...(section?.querySelectorAll('button') || [])].find(button => isVisible(button) && !button.disabled && /^(add|add another|add work experience|add experience)$/i.test(clean(button.textContent)));
        if (!add) throw new Error(`Filled ${filled} fields; could not locate the Work Experience Add button. Expand the section and try again.`);
        const count = rows.length;
        add.click();
        rows = await until(() => { const next = experienceRows(); return next.length > count && next; }, 'An experience entry did not appear after Add. Review the page and try again.');
        index = rows.length - 1;
        added++;
      }
      const result = await writeExperience(index, job);
      filled += result.filled;
      if (result.missing.length) notes.push(`${job.company}: review ${result.missing.join(', ')}`);
    }
    return { ok: true, summary: `Added ${added} entries; filled ${filled} fields. ${skipped ? `Skipped ${skipped} incomplete roles. ` : ''}${notes.join('; ')} Review dates and required fields before continuing.` };
  } finally { experienceBusy = false; }
}
