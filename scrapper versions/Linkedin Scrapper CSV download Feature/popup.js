document.getElementById("scrapeButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    //Getting the link of the active URL
    const currentUrl = activeTab.url;

    if (currentUrl.includes("linkedin.com/in/")) {

      //Getting the username of the opened profile
      //works only when the link of the active current page is linkedin.com/in/
      const username = currentUrl.split("linkedin.com/in/")[1].split("/")[0];

      //The URL for the contact-info
      const overlayUrl = `https://www.linkedin.com/in/${username}/overlay/contact-info`;

      //Setting a 2s time and wait untill the new page gets loaded
      chrome.tabs.update({ url: overlayUrl }, async (tab) => {
        //Wait for the overlay page to load max time out time is 1s
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        //The main function to scrape
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: scrapeLinkedIn
        });

        //Reloading back to the previous page but need to find a way to escape the reload and functions happen smoothly
        //if possible
        setTimeout(() => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: goBack
          });
        }, 1000);
      });
    }
  });
});

function goBack() {
  window.history.back();
}

function scrapeLinkedin() {
  //Extracting the name
  const fullname = [];
  const nameElements = document.querySelectorAll("h1#pv-contact-info");

  for (const element of nameElements) {
    fullname.push(element.textContent.trim());
  }

  //Extracting the websites
  const website = [];
  const websiteElements = document.querySelectorAll(".pv-contact-info__contact-type.ci-websites a");

  for (const element of websiteElements) {
    website.push(element.textContent.trim());
  }

  //Extracting emails
  const email = [];
  const emailsElements = document.querySelectorAll(".pv-contact-info__contact-type.ci-email a");

  for (const element of emailsElements) {
    email.push(element.textContent.trim());
  }

  //Extracting phone numbers 
  const phone = [];
  const phoneElements = document.querySelectorAll(".pv-contact-info__contact-type.ci-phone span");

  for (const element of phoneElements) {
    phone.push(element.textContent.trim());
  }

  //Extracting twitter
  const twitter = [];
  const twitterElements = document.querySelectorAll(".pv-contact-info__contact-type.ci-twitter a");

  for (const element of twitterElements) {
    twitter.push(element.textContent.trim());
  }

  //Extracting linkedin URL
  const username = [];
  const linkedinElements = document.querySelectorAll(".pv-contact-info__contact-type.ci-vanity-url a");

  for (const element of linkedinElements) {
    username.push(element.textContent.trim());
  }

  const scrapedData = {
      name: fullname,
      username: username,
      email: email,
      phone: phone,
      twitter: twitter,
      website: website
  };

  storeScrapedData(scrapedData);
}