// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "storeScrapedData") {
      storeScrapedData(message.data);
    }
  });
  
  function storeScrapedData(data) {
    // Get existing stored data or initialize as an empty array
    chrome.storage.local.get("scrapedData", (result) => {
      const existingData = result.scrapedData || [];
  
      // Append the new data to the existing data
      existingData.push(data);
  
      // Update the local storage with the appended data
      chrome.storage.local.set({ scrapedData: existingData }, () => {
        console.log("Data appended to local storage:", data);
      });
    });
  }


