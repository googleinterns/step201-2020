let offset = 0;
const numLinksToShow = 20;

/** Retrives the public links from the datastore and display it */
function showPublicLinks() {
  const params = new URLSearchParams();
  params.append('offset', offset);
  params.append('numLinksToShow', numLinksToShow);
  
  fetch('/diplay-public-link', {method: 'POST', body: params})
    .then(response => response.json()).then((links) => {
      console.log(links);
      let tableElement = document.getElementById('link-container');
      tableElement.getElementsByTagName("tbody")[0].innerHTML = '';
      if (links) {
        links.forEach((link) => {
          let row = tableElement.insertRow();
          row.insertCell(0).innerHTML = link.propertyMap.shortcut;
          row.insertCell(1).innerHTML = link.propertyMap.url;
          row.insertCell(2).innerHTML = createMailtoString(link.propertyMap.creator);
        });
      }
    });

  offset += numLinksToShow;
}

/** Creates and returns an mailto html text string */
function createMailtoString(email) {
  return `<a href="mailto:${email}">${email}</a>`
}
