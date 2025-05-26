// content.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'fillForm') {
        fillFormWithFakeData(request.apiKey)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, message: error.toString() }));
        return true; // Required for async sendResponse
    }
});

async function fillFormWithFakeData(apiKey) {
    try {
        // Find all input fields on the page
        const inputFields = document.querySelectorAll('input, textarea, select');

        if (inputFields.length === 0) {
            return { success: false, message: 'No form fields found on this page' };
        }

        const fieldData = [];

        // Collect information about each field
        inputFields.forEach(field => {
            if (isVisible(field) && !field.disabled && !field.readOnly) {
                const fieldInfo = {
                    id: field.id || '',
                    name: field.name || '',
                    type: field.type || 'text',
                    placeholder: field.placeholder || '',
                    tagName: field.tagName.toLowerCase(),
                    label: findLabelText(field)
                };

                fieldData.push(fieldInfo);
            }
        });

        if (fieldData.length === 0) {
            return { success: false, message: 'No fillable fields found on this page' };
        }

        // Generate fake data for all fields using Gemini API
        const fakeData = await generateFakeDataWithGemini(fieldData, apiKey);

        // Fill each field with the generated data
        let filledCount = 0;

        fieldData.forEach((fieldInfo, index) => {
            if (fakeData[index] && fakeData[index].value) {
                const field = findFieldByInfo(fieldInfo);
                if (field) {
                    fillField(field, fakeData[index].value);
                    filledCount++;
                }
            }
        });

        return {
            success: true,
            fieldCount: filledCount,
            message: `Successfully filled ${filledCount} fields`
        };
    } catch (error) {
        console.error('Error filling form:', error);
        return { success: false, message: 'Error: ' + error.message };
    }
}

function isVisible(element) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

function findLabelText(field) {
    // Try to find a label by the 'for' attribute
    if (field.id) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        if (label && label.textContent) {
            return label.textContent.trim();
        }
    }

    // Try to find a parent label
    const parentLabel = field.closest('label');
    if (parentLabel && parentLabel.textContent) {
        // Remove the field's own text value from the label text
        let labelText = parentLabel.textContent.trim();
        if (field.value) {
            labelText = labelText.replace(field.value, '').trim();
        }
        return labelText;
    }

    // Look for preceding text node or label-like elements
    const previousElement = field.previousElementSibling;
    if (previousElement &&
        (previousElement.tagName === 'LABEL' ||
            previousElement.tagName === 'SPAN' ||
            previousElement.tagName === 'DIV')) {
        return previousElement.textContent.trim();
    }

    return '';
}

function findFieldByInfo(fieldInfo) {
    // Try to find by ID first
    if (fieldInfo.id) {
        const element = document.getElementById(fieldInfo.id);
        if (element) return element;
    }

    // Then try by name
    if (fieldInfo.name) {
        const elements = document.getElementsByName(fieldInfo.name);
        if (elements.length > 0) return elements[0];
    }

    return null;
}

function fillField(field, value) {
    const tagName = field.tagName.toLowerCase();
    const type = field.type ? field.type.toLowerCase() : '';

    // Handle different input types
    if (tagName === 'input') {
        if (type === 'checkbox' || type === 'radio') {
            // Convert string "true"/"false" to boolean
            const shouldCheck = (value === true || value === 'true');
            field.checked = shouldCheck;
        } else if (type === 'date') {
            field.value = value;
        } else if (type === 'file') {
            // Can't programmatically set file inputs for security reasons
            // Just skip this
        } else {
            field.value = value;
        }
    } else if (tagName === 'textarea') {
        field.value = value;
    } else if (tagName === 'select') {
        // For select elements, find option with matching text or value
        const options = Array.from(field.options);
        const matchingOption = options.find(option =>
            option.text.toLowerCase().includes(value.toLowerCase()) ||
            option.value.toLowerCase() === value.toLowerCase()
        );

        if (matchingOption) {
            field.value = matchingOption.value;
        } else if (options.length > 0) {
            // If no match found, select a random option (excluding the first if it's empty/placeholder)
            const startIndex = (options[0].value === '' || options[0].disabled) ? 1 : 0;
            if (startIndex < options.length) {
                const randomIndex = Math.floor(Math.random() * (options.length - startIndex)) + startIndex;
                field.value = options[randomIndex].value;
            }
        }
    }

    // Trigger change event to activate any listeners
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
}

async function generateFakeDataWithGemini(fieldData, apiKey) {
    const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    const prompt = {
        contents: [
            {
                parts: [
                    {
                        text: `Generate fake but realistic data for the following form fields. For each field, provide ONLY the value, not explanations.
              
  Format your response as a valid JSON array with one object per field, where each object has a 'value' property containing the generated data.
  
  Here are the fields:
  ${JSON.stringify(fieldData, null, 2)}
  
  For each field, consider:
  1. If the field appears to collect personal information (name, email, phone), generate believable fake data
  2. If it's an address field, generate a plausible fake address
  3. For dates, provide dates in the correct format
  4. For selections, suggest a plausible option
  
  Return ONLY the JSON array with no explanation. Example:
  [
    {"value": "John Smith"},
    {"value": "john.smith@example.com"},
    {"value": "555-123-4567"}
  ]`
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(prompt)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const generatedText = data.candidates[0]?.content?.parts[0]?.text;

        if (!generatedText) {
            throw new Error('No data generated from Gemini API');
        }

        // Extract JSON from response text (in case there's any extra text)
        const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Could not parse JSON response from Gemini');
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error(`Failed to generate data: ${error.message}`);
    }
}