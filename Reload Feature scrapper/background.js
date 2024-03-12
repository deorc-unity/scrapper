// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "storeScrapedData") {
      storeScrapedData(message.data);
    }
  });

//username is the name and name is the username
function storeScrapedData(data) {

  chrome.storage.local.get("scrapedData", function() {
      let url = "https://script.google.com/a/macros/whatfix.com/s/AKfycbypkn3iFxQ1AxLEoAZPrmE_vI9KJiSx525hGDIbU6rUi6wSCK3VNcQaAjMbHpZmtWH0/exec"
      url += "?name=" + data.name + "&username=" + data.username + "&email=" + data.email + "&phone=" + data.phone + "&twitter=" + data.twitter + "&website=" + data.website;

      response = fetch(url, {
          method: "GET",
          mode: "no-cors"
      });

      console.log(response);
  });
}



