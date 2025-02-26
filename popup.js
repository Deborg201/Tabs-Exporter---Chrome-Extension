document.addEventListener('DOMContentLoaded', function () {
    const collectUrlsButton = document.getElementById('collectUrlsButton');
    
    if (collectUrlsButton) {
        collectUrlsButton.addEventListener('click', () => {
            // Send message to background script (service worker)
            chrome.runtime.sendMessage({ action: 'collectUrls' }, (response) => {
                if (response && response.status === 'success') {
                    alert('URLs collected and Excel file generated!');
                } else {
                    alert('Something went wrong: ' + (response ? response.message : 'No response'));
                }
            });
        });
    }
});
