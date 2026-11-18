# Job Application Assistant

## Version 2 — Workday work experience

Load this `form_filler_extension` folder as an unpacked extension. Disable any older installed copy to avoid duplicate content scripts. Add your own resume as `cv.pdf` (recommended) or `cv.tex`; personal resumes and API keys are not included. Enter your API key through the extension popup.

On a Workday application's **My Experience** step, expand **Work Experience**, then click **Add work experience**. Keep the popup open while your resume is processed. The extension adds rows with the section's Add button and fills title, employer, location, description, month/year dates, and explicit current-employment status. Review the results before continuing. Use **Fill forms** for the remaining ordinary fields.

Existing values are preserved. Matching employer/title/start-year entries are reused on repeat runs. Unknown months remain blank. Unsupported controls are reported for manual review. This adapter targets English Workday forms in the main page; tenant-specific layouts, custom dropdowns, and embedded frames may require manual completion. It does not click Next or Submit.

The work-history extraction sends the resume to OpenAI. Browser fixture tests cover adding rows, filling dates, and repeat-run duplicate prevention; live tenant compatibility is not yet verified.

A personal Chrome extension that reads the current job page, uses your resume with the OpenAI Responses API, fills supported form fields, attaches your resume, drafts a cover letter, and gives a candid resume-to-job match review.

## Install

1. Copy your resume into this folder as `cv.pdf` (recommended) or `cv.tex`.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select this `form_filler_extension` folder.
5. Pin the extension, open it, and use **Update API key** to save your OpenAI API key.

If you replace the resume later, return to `chrome://extensions` and click the extension's reload button.

## Use

- **Fill forms** reads visible fields and asks the model for resume-supported answers.
- **Upload resume** attaches `cv.pdf` or `cv.tex` to the first resume/CV file input it finds.
- **Generate cover letter** drafts a letter using the page's job description and displays it for copying or download.
- **Check job match** gives a concise review, a resume-to-requirements fit score, the strongest matches, important gaps, and an apply/don't-prioritize recommendation. The score is not a hiring probability.
- **Update API key** changes the key saved in Chrome local storage.

The extension never submits an application. Always review every answer, attachment, and generated letter before submitting.

## Privacy and limitations

- Your API key is stored in `chrome.storage.local`. This is convenient for a personal unpacked extension, but a production extension should call a backend so the key is not distributed to clients.
- The current page text, field descriptions, and resume are sent to the OpenAI API when generating answers or a cover letter.
- The temporary resume file uploaded to OpenAI is deleted after each request on a best-effort basis.
- Browser security prevents automatic file uploads on some sites, and custom/iframe-based forms may need site-specific support.
- The assistant skips unsupported, sensitive, demographic, legal-attestation, password, CAPTCHA, and signature answers rather than guessing.
