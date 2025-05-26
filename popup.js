// popup.js
document.addEventListener('DOMContentLoaded', function () {
    const fillFormButton = document.getElementById('fill-form');
    const saveApiKeyButton = document.getElementById('save-api-key');
    const apiKeyInput = document.getElementById('gemini-api-key');
    const statusMessage = document.getElementById('status-message');

    // Load saved API key
    chrome.storage.local.get(['geminiApiKey'], function (result) {
        if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
            statusMessage.textContent = 'API key is saved';
        }
    });

    // Save API key
    saveApiKeyButton.addEventListener('click', function () {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.local.set({ geminiApiKey: apiKey }, function () {
                statusMessage.textContent = 'API key saved successfully!';
                setTimeout(() => {
                    statusMessage.textContent = '';
                }, 3000);
            });
        } else {
            statusMessage.textContent = 'Please enter a valid API key';
        }
    });

    // Fill form action
    fillFormButton.addEventListener('click', function () {
        chrome.storage.local.get(['geminiApiKey'], function (result) {
            if (!result.geminiApiKey) {
                statusMessage.textContent = 'Please save your Gemini API key first';
                return;
            }

            statusMessage.textContent = 'Filling form...';

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: 'fillForm', apiKey: result.geminiApiKey },
                    function (response) {
                        if (response && response.success) {
                            statusMessage.textContent = `Form filled with ${response.fieldCount} fields!`;
                        } else {
                            statusMessage.textContent = response ? response.message : 'Error filling form';
                        }
                    }
                );
            });
        });
    });
});