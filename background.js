importScripts('libs/xlsx.full.min.js');

// Listen for messages from popup
chrome.runtime.onInstalled.addListener(() => {
    console.log("Tab URL Collector Extension Installed!");
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'collectUrls') {
        collectAndDownloadUrls(sendResponse);
        return true; // Keep the message channel open
    }
});

function collectAndDownloadUrls(sendResponse) {
    chrome.tabs.query({}, (tabs) => {
        const urls = tabs.map(tab => tab.url);
        const currentDate = new Date().toLocaleString();
        const data = urls.map(url => ({
            URL: url,
            Date: currentDate
        }));

        generateExcel(data, sendResponse);
    });
}

function generateExcel(data, sendResponse) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "URLs");

    const excelFile = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelFile], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    // Convert the Blob to a base64 string
    const reader = new FileReader();
    reader.onloadend = function () {
        // Get the base64 string from the reader's result
        const base64data = reader.result.split(',')[1]; // Removing the 'data:*/*;base64,' part

        // Create a Data URL using the base64 string
        const dataUrl = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + base64data;

        // Use chrome.downloads.download to trigger the file download
        chrome.downloads.download({
            url: dataUrl,  // Use the base64 Data URL
            filename: `tab_urls_${Date.now()}.xlsx`,  // Custom filename for download
            saveAs: true  // Prompt the user to choose the download location
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error("Download error: " + chrome.runtime.lastError.message);
                sendResponse({ status: 'error', message: chrome.runtime.lastError.message });
            } else {
                sendResponse({ status: 'success', message: 'URLs collected and Excel generated.' });
            }
        });
    };

    // Read the Blob as base64
    reader.readAsDataURL(blob);
}
