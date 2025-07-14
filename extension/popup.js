document.addEventListener('DOMContentLoaded', () => {
    const autofillButton = document.getElementById('autofill');
    const statusDiv = document.getElementById('status');
    if (!autofillButton || !statusDiv) {
        console.error('Autofill button or status div not found');
        if (statusDiv) {
            statusDiv.textContent = 'Error: UI elements not found';
            statusDiv.style.color = 'red';
        }
        return;
    }

    autofillButton.addEventListener('click', () => {
        statusDiv.textContent = 'Autofilling...';
        statusDiv.style.color = 'black';
        chrome.runtime.sendMessage({ action: 'autofill' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Runtime Error:', chrome.runtime.lastError);
                statusDiv.textContent = `Error: ${chrome.runtime.lastError.message}`;
                statusDiv.style.color = 'red';
                return;
            }
            if (response.success) {
                statusDiv.textContent = `Successfully filled ${response.filledFields} fields`;
                statusDiv.style.color = 'green';
            } else {
                statusDiv.textContent = `Error: ${response.error || 'Unknown error'}`;
                statusDiv.style.color = 'red';
            }
        });
    });
});