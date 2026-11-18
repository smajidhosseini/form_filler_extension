# Job Application Assistant

Fill applications from your resume, draft cover letters, and see your job match as a percentage ring. Includes Workday work experience support.

## [⬇ Download the extension](https://github.com/smajidhosseini/form_filler_extension/releases/latest/download/Job-Application-Assistant.zip)

**No coding, Terminal, or GitHub account needed to download.** Works on Windows and Mac with Chrome or Edge. This is a manual installation, not a browser-store installation.

## 1. Unzip and keep the folder

- **Windows:** Right-click the downloaded ZIP → **Extract All** → **Extract**.
- **Mac:** Double-click the downloaded ZIP.

Move the extracted **Job-Application-Assistant** folder to Documents or another permanent location. Keep it there after installing; your browser uses these files.

## 2. Add your resume

Copy your PDF resume into that folder and name it **cv.pdf**. It should be beside **manifest.json**.

If your computer hides file extensions, rename only the visible name to **cv** so it does not become `cv.pdf.pdf`. LaTeX users can use `cv.tex` instead; PDF is recommended.

## 3. Install in Chrome or Edge

1. Open your browser.
2. Copy the matching address into the address bar and press Enter:

   | Browser | Address to paste |
   | --- | --- |
   | Chrome | `chrome://extensions` |
   | Edge | `edge://extensions` |

3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the extracted **Job-Application-Assistant** folder containing `manifest.json`. Do not select the ZIP.
6. Open the browser's **Extensions** menu beside the address bar and pin **Job Application Assistant — Workday**. Edge may call this **Show in toolbar**.

## 4. Add your OpenAI API key

1. Visit [OpenAI API keys](https://platform.openai.com/api-keys) and sign in.
2. Create and copy a secret API key. Keep it private.
3. Open the extension → **Update API key** → paste your key → **Save**.

Use an API key, not your ChatGPT password. Check your API account's [billing settings](https://platform.openai.com/settings/organization/billing/overview) before use; API requests may incur charges.

## 5. Use it on a job application

Refresh your job page after installation, open the extension, and choose a button. Keep the popup open while it works.

| Button | What it does |
| --- | --- |
| **Fill forms** | Fills supported fields from your resume. |
| **Add work experience** | Adds and fills Workday employment entries. First open **My Experience → Work Experience**. |
| **Upload resume** | Attaches your resume to an upload field. |
| **Generate cover letter** | Creates a draft to edit, copy, or download. |
| **Check job match** | Shows a fit percentage, strengths, gaps, and recommendation. This is not a hiring probability. |
| **Update API key** | Saves or replaces your API key. |

Review answers, dates, and attachments before submitting. The extension does not click Submit for you.

## Troubleshooting

| Problem | What to try |
| --- | --- |
| No **Load unpacked** button | Turn on Developer mode. If a managed work/school computer blocks installation, contact its administrator. |
| Manifest missing | Choose the extracted folder containing `manifest.json`, not its parent folder or the ZIP. |
| Resume missing | Check that `cv.pdf` sits beside `manifest.json` and is not named `cv.pdf.pdf`. Reload the extension. |
| Connection error or no response | Refresh the job page after installing/reloading, then reopen the popup. Browser settings pages cannot be filled. |
| API error | Check your key, API account access, billing, and usage limits. |
| Model unavailable | This version uses `gpt-6-luna`; report the error if your API account cannot access it. |
| Some fields stay blank | Fill them manually. Missing resume facts and custom controls may be unsupported. |
| Workday does not fill | Open My Experience and expand Work Experience. Employer-specific layouts may need manual completion. |
| Two installed copies | Disable the older extension on the extensions page. |

[Report a problem](https://github.com/smajidhosseini/form_filler_extension/issues) with your browser, the button you clicked, and the error text. Never post your API key or personal resume.

## Updating

Download and unzip the newest release. Copy its application files into the **same folder you originally installed**, keeping your own `cv.pdf` or `cv.tex`. Click **Reload** on the browser's extensions page, then refresh the job page. Keep using the same folder to retain the existing installation.

## Privacy and limitations

Your API key is stored locally in your browser profile. AI features send your resume and relevant webpage information to OpenAI; work-history extraction sends the resume. Temporary uploaded resume files are deleted on a best-effort basis. The release download contains no personal resume or API key.

Supports common form fields and selected English Workday layouts in the main page. Embedded forms and custom controls may require manual completion. Workday behavior was tested on a simulated form; every employer layout has not been verified. Existing work-history values are preserved, and matching entries are reused where recognized.
