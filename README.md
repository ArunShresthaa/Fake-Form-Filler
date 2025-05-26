# Smart Form Auto-Filler

A Chrome extension that intelligently fills web forms with realistic fake data using the Gemini AI API.

![Smart Form Auto-Filler](images/icon128.png)

## Overview

Smart Form Auto-Filler is a productivity tool designed to save time when testing web forms. It analyzes form fields on any webpage and automatically generates contextually appropriate fake data based on field labels, types, and attributes. The extension uses Google's Gemini API to intelligently determine what kind of data each field should contain.

## Features

- **Intelligent Form Analysis**: Automatically detects and analyzes form fields including inputs, textareas, and select dropdowns
- **Context-Aware Data Generation**: Uses Gemini AI to generate appropriate fake data based on field context
- **Smart Field Detection**: Identifies fields by examining labels, placeholders, and HTML attributes
- **Support for Various Input Types**: Handles text inputs, checkboxes, radio buttons, date fields, select dropdowns, and more
- **User-Friendly Interface**: Simple popup with clear controls for generating form data

## Installation

### From Chrome Web Store

1. Visit the Chrome Web Store (link to be added)
2. Click "Add to Chrome"
3. Confirm the installation when prompted

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your Chrome toolbar

## Setup

Before using the extension, you need to obtain a Gemini API key:

1. Visit the [Google AI Studio](https://aistudio.google.com/) and sign in with your Google account
2. Navigate to the API keys section
3. Create a new API key
4. Copy the API key to your clipboard

Then, in the extension:

1. Click the extension icon in your Chrome toolbar
2. Paste your Gemini API key into the designated field
3. Click "Save API Key"

## Usage

1. Navigate to any webpage with a form you want to fill
2. Click the extension icon in the Chrome toolbar
3. Click the "Auto-Fill Current Form" button
4. Watch as the form is filled with realistic fake data

## How It Works

1. When activated, the extension scans the current webpage for form fields
2. For each field, it collects information like:
   - Field type (text, email, checkbox, etc.)
   - Field ID and name
   - Associated label text
   - Placeholder text
3. This information is sent to the Gemini API with a prompt to generate appropriate fake data
4. The extension then fills each form field with the generated data
5. Events are triggered to ensure form validation scripts recognize the changes

## Privacy & Security

- **Your API Key**: Your Gemini API key is stored locally in your browser and is never sent to any server except Google's API servers
- **Form Data**: The extension only sends field metadata to the Gemini API, not the actual values or content of the forms
- **No Data Collection**: The extension does not collect any usage data or personal information

## Technical Details

- Built with JavaScript using Chrome Extension Manifest V3
- Uses the Gemini API for generating contextually appropriate fake data
- Content script architecture for accessing and modifying web page content
- Background service worker for handling extension lifecycle events

## Limitations

- Cannot fill file input fields (browser security restriction)
- Some dynamically generated forms may not be fully compatible
- Forms with complex validation might require manual adjustments after auto-filling

## Troubleshooting

**The extension doesn't fill any fields**

- Ensure you've provided a valid Gemini API key
- Check if the page has any fillable form fields
- Some websites with strict Content Security Policies may block the extension

**Form validation errors after filling**

- The generated data may not meet specific validation requirements
- Try running the auto-fill again for new values or manually adjust the problematic fields

**API key errors**

- Verify your API key is correct
- Check that you haven't exceeded your Gemini API usage limits
- Ensure you have billing enabled if required by Google

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Google's Gemini API for providing the AI capabilities
- Icon designed using resources from [source]

## Contact

If you have any questions or feedback, please open an issue on GitHub.

---

_Note: This extension is not affiliated with or endorsed by Google. Gemini is a trademark of Google LLC._
