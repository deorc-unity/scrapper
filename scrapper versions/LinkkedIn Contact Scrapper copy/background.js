chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "storeScrapedData") {
      storeScrapedData(message.data);
    }
  });
  
  function storeScrapedData(data) {
     chrome.storage.local.get("scrapedData", (result) => {
         let url = "https://script.google.com/a/macros/whatfix.com/s/AKfycbwHDPG2-9v3Ur_U5fZynnP0k_5-kZrEnHbgHr_ZucOfxe5DnLLd9TDBnc1rFomK8n8rJQ/exec"
         url += "?name=" + data.name + "&username=" + data.username + "&email=" + data.email + "&phone=" + data.phone + "&twitter=" + data.twitter + "&website=" + data.website;

         response = fetch(url, {
             method: "GET",
             mode: "no-cors"
         });

         console.log(response)
     });
 }

