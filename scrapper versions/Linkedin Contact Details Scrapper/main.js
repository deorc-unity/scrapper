chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log(changeInfo.status+'\n'+tab.url);

    if (changeInfo.status === 'complete') { 
        scrapeFunction();
        loaded = false;
    }
});

function extractString(content, prefix, suffix = "&quot;,&quot;") {
    const escapedPrefix = prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const escapedSuffix = suffix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`${escapedPrefix}(.*?)(?=${escapedSuffix})`, 'g');
    const matches = content.match(regex) || [];

    return matches.map(match => match.substring(prefix.length));
}

function scrapeFunction() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        const currentUrl = activeTab.url;

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

                const scrapedData = {
                    name: fullname,
                    username: username,
                    email: email,
                    phone: phone,
                    twitter: twitter,
                    website: website
                };

                storeScrapedData(scrapedData);
            });
        }
    });
}

//username is the name and name is the username
function storeScrapedData(data) {
    chrome.storage.local.get("scrapedData", function() {
        let url = "https://script.google.com/a/macros/whatfix.com/s/AKfycbwHDPG2-9v3Ur_U5fZynnP0k_5-kZrEnHbgHr_ZucOfxe5DnLLd9TDBnc1rFomK8n8rJQ/exec"
        url += "?name=" + data.username + "&username=" + data.name + "&email=" + data.email + "&phone=" + data.phone + "&twitter=" + data.twitter + "&website=" + data.website;

        response = fetch(url, {
            method: "GET",
            mode: "no-cors"
        });

        console.log(response);
    });
}
  