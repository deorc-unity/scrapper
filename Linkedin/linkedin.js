// Whenever a tab gets reloaded the extension is called
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log(changeInfo.status+'\n'+tab.url);

    if (changeInfo.status === 'complete') { 
        scrapeFunction();
        loaded = false;
    }
});

// Fetching Value between the suffix & prefix
// The pattern is present in LinkedIn's contact-info page's
// view page source. <If not hidden by LinkedIn>
function extractString(content, prefix, suffix = "&quot;,&quot;") {
    const escapedPrefix = prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const escapedSuffix = suffix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`${escapedPrefix}(.*?)(?=${escapedSuffix})`, 'g');
    const matches = content.match(regex) || [];

    return matches.map(match => match.substring(prefix.length));
}



// The main scrapping function.
// Fetch function returns the content present in "view-page-source"
// Works only if the active open tab is linkedin.com & if the url 
// of the page matches linkedin's profile url i.e. "linkedin.com/in/"
function scrapeFunction() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Getting the current tab
        const activeTab = tabs[0];

        // Get the current URL of the active tab
        const currentUrl = activeTab.url;

        if (currentUrl.includes("linkedin.com/in/")) {
            // Getting the username of the profile
            const username = currentUrl.split("linkedin.com/in/")[1].split("/")[0];

            // Structuring the contact URL
            const contactUrl = `https://www.linkedin.com/in/${username}/overlay/contact-info`;

            // Fetching the details in contact URL's page source
            response = fetch(contactUrl).then(result => result.text()).then(data => {
                // Email Prefix pattern
                const emailprefix = "emailAddress&quot;:{&quot;emailAddress&quot;:&quot;";

                // Phone Prefix pattern 
                const phoneprefix = "&quot;phoneNumber&quot;:{&quot;number&quot;:&quot;";

                // Twitter Prefix pattern 
                const twitterprefix = "&quot;twitterHandles&quot;:[{&quot;name&quot;:&quot;";

                // Name prefix pattern
                const nameprefix = "&quot;profilePicture&quot;:{&quot;a11yText&quot;:&quot;";

                // Websites prefix pattern 
                const websiteprefix_company = "url&quot;:&quot;http://";
                const websiteprefix_personal = "&quot;url&quot;:&quot;https://";
                
                fullname = extractString(data, nameprefix ); 
                if(fullname=="") {
                    fullname = extractString(data, ".voyager.dash.identity.profile.Profile&quot;,&quot;firstName&quot;:&quot;")[0] + " " + extractString(data, "multiLocaleLastName&quot;:{&quot;en_US&quot;:&quot;", "&quot;},&quot;")
                }
                email = extractString(data, emailprefix); 
                phone = extractString(data, phoneprefix); 
                twitter = extractString(data,twitterprefix); 
                website_company = extractString(data, websiteprefix_company); 
                website_personal = extractString(data, websiteprefix_personal); 
                website = website_company + "," + website_personal; 
                if(website==",") {
                    website="";
                }
                
                console.log(website_personal);
                console.log(website_company);
                console.log(website);

                console.log(fullname=="");

                // Structuring the data in a single object
                const scrapedData = {
                    name: fullname,
                    username: username,
                    email: email,
                    phone: phone,
                    twitter: twitter,
                    website: website
                };

                // The storage function
                storeScrapedData(scrapedData);
                
            });
        }
    });
}

// Storage function the connects the extension to a google sheet, where
// the data gets stored
function storeScrapedData(data) {
    chrome.storage.local.get("scrapedData", function() {
        // let url = "https://script.google.com/a/macros/whatfix.com/s/AKfycbxqVZsshA6zbfv1Wxm2M8Elfoa3DrhsyGEHyfI8hjLIUZCejA7s3EwWznZvFzL7J_2t/exec";
        let url = "https://script.google.com/a/macros/whatfix.com/s/AKfycbypkn3iFxQ1AxLEoAZPrmE_vI9KJiSx525hGDIbU6rUi6wSCK3VNcQaAjMbHpZmtWH0/exec";
        url += "?name=" + data.name + "&username=" + data.username + "&email=" + data.email + "&phone=" + data.phone + "&twitter=" + data.twitter + "&website=" + data.website;

        response = fetch(url, {
            method: "GET",
            mode: "no-cors"
        });
    });
}

  