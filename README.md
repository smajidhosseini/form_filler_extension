# Microsot Edge Froms Filler Extension

Edge Form Filler is a Chrome/Edge extension that automatically fills web forms using data extracted from your LaTeX CV (`cv.tex`) and the OpenAI API.

## Features

- **Automatic Form Detection**: Scans all `<input>`, `<textarea>`, and `<select>` elements on any web page to build a form schema.
- **CV-Based Data Source**: Bundles your CV in LaTeX format (`cv.tex`) to provide consistent personal data.
- **AI-Powered Mapping**: Uses OpenAI’s Chat Completions API (`gpt-4o-mini`) to extract and match CV data to each form field.
- **Privacy-Focused**: Stores your API key locally in Chrome storage; no data is logged externally except API requests you initiate.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/smajidhosseini/edge-form-filler.git
   cd edge-form-filler
   ```
2. **Load as an unpacked extension**:
   - Open Edge (or Chrome) and go to `edge://extensions/` (or `chrome://extensions/`).
   - Enable **Developer mode**.
   - Click **Load unpacked** and select the project folder.

## Configuration

1. Click the **Edge Form Filler** icon in the browser toolbar.
2. In the popup, paste your OpenAI API key and click **Save API Key**.
3. Ensure you have network access to `https://api.openai.com`.

## Usage

1. Navigate to any webpage containing a form (login, contact, application, etc.).
2. Click the **Edge Form Filler** extension icon.
3. Click **Fill Current Form**.
4. The extension will:
   - Extract the form structure via `content.js`.
   - Request matching values from the OpenAI API in `background.js`.
   - Populate the form fields with the returned data.

## File Structure

```
├── background.js    # Service worker handling OpenAI API calls
├── content.js       # Content script to read and fill form fields
├── popup.html       # Popup UI for API key entry and action buttons
├── popup.js         # Popup logic for saving API key and triggering form fill
├── cv.tex           # LaTeX CV file used as the data source
└── manifest.json    # Extension metadata and permissions
```

## Development & Debugging

- The extension uses **Manifest V3** and a service worker (`background.js`).
- Model and endpoint are configurable in `background.js` (default: `gpt-4o-mini`).
- Permissions required: `storage`, `activeTab`, `scripting`, and `<all_urls>` host permission.
- To debug:
  - Check **Service Worker** logs in the **Extensions** page.
  - Check **Console** logs on the active tab for `content.js` messages.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/YourFeature`.
3. Commit your changes: `git commit -m "Add YourFeature"`.
4. Push to your fork: `git push origin feature/YourFeature`.
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
