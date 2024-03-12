chrome.commands.onCommand.addListener(function(command) {
  if(command === "perform_action") {
    scrapeFunction();
  }
})

document.getElementById("scrapeButton").addEventListener("click", () => {
    scrapeFunction();
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