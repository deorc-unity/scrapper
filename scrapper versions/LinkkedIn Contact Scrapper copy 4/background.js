chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
    console.log("Page Load Detected");
    // chrome.tabs.sendMessage(tabId, { message: 'tabUpdated' });
    console.log("Function Performed");
  }
});

document.addEventListener("DOMContentLoaded", function() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'tabUpdated') {
      alert("Something");
      scrapeFunction();
    }
  });
});

function scrapeFunction() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    const currentUrl = activeTab.url;

    function extractString(content, prefix, suffix = "&quot;,&quot;"){
        const escapedPrefix = prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const escapedSuffix = suffix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`${escapedPrefix}(.*?)(?=${escapedSuffix})`, 'g');
        const matches = content.match(regex) || [];

        return matches.map(match => match.substring(prefix.length));
      }

    if (currentUrl.includes("linkedin.com/in/")) {
        const username = currentUrl.split("linkedin.com/in/")[1].split("/")[0];

        const contactUrl = `https://www.linkedin.com/in/${username}/overlay/contact-info`;

        response = fetch(contactUrl).then(result => result.text()).then(data => {
          const emailprefix = "emailAddress&quot;:{&quot;emailAddress&quot;:&quot;";
          const phoneprefix = "&quot;phoneNumber&quot;:{&quot;number&quot;:&quot;";
          const twitterprefix = "&quot;twitterHandles&quot;:[{&quot;name&quot;:&quot;";
          const nameprefix = "&quot;profilePicture&quot;:{&quot;a11yText&quot;:&quot;";
          const websiteprefix = "url&quot;:&quot;http://";
          
          fullname = extractString(data, nameprefix );
          email = extractString(data, emailprefix);
          phone = extractString(data, phoneprefix);
          twitter = extractString(data,twitterprefix);
          website = extractString(data, websiteprefix);

          alert(fullname+" "+email+" "+phone+" "+twitter+" "+website);

          const scrapedData = {
            name: fullname,
            username: username,
            email: email,
            phone: phone,
            twitter: twitter,
            website: website
          };

          chrome.runtime.sendMessage({ action: "storeScrapedData", data: scrapedData });
        });
    }
});
}


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


