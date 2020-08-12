let currentPage;
let PUBLIC_LINK_TOTAL_PAGE;
const PUBLIC_LINKS_PER_PAGE = 20;

/** Initializes the diplay functionality.
    Gets the total pages from the datastore */
async function init() {
  // Fetch the size of the public links in the datastore
  const response = await fetch('/diplay-public-link');
  const content = await response.text();
  // compute the total pages
  const totalLinks = parseInt(content);
  PUBLIC_LINK_TOTAL_PAGE = Math.ceil(totalLinks / PUBLIC_LINKS_PER_PAGE);
  currentPage = 0;

  showPublicLinksInCurrentPage();
}

/** Displays the previous page of links.
    If the current page is the first page, wrap it up to the last page */
function showPrevPage() {
  currentPage = (currentPage - 1 + PUBLIC_LINK_TOTAL_PAGE) % PUBLIC_LINK_TOTAL_PAGE;
  showPublicLinksInCurrentPage();
}

/** Displays the next page of links.
    If the current page is the last page, wrap it up to the first page */
function showNextPage() {
  currentPage = (currentPage + 1) % PUBLIC_LINK_TOTAL_PAGE;
  showPublicLinksInCurrentPage();
}

/** Diplays the first page of links */
function showFirstPage() {
  currentPage = 0;
  showPublicLinksInCurrentPage();
}

/** Diplays the last page of links */
function showLastPage() {
  currentPage = PUBLIC_LINK_TOTAL_PAGE - 1;
  showPublicLinksInCurrentPage()
}

/** Retrives the public links from the datastore and display it */
function showPublicLinksInCurrentPage() {
  const params = new URLSearchParams();
  params.append('offset', currentPage * PUBLIC_LINKS_PER_PAGE);
  params.append('numLinksToShow', PUBLIC_LINKS_PER_PAGE);

  fetch('/diplay-public-link', {method: 'POST', body: params})
    .then(response => response.json()).then((links) => {
      let tableElement = document.getElementById('link-container');
      clearLinkTable(tableElement);
      links.forEach((link) => {
      let row = tableElement.insertRow();
      row.insertCell(0).innerHTML = link.propertyMap.shortcut;
      row.insertCell(1).innerHTML = link.propertyMap.url;
      row.insertCell(2).innerHTML = createMailtoString(link.propertyMap.creator);
      });
    });

  const pageElement = document.getElementById('pageNumber');
  pageElement.innerHTML = ` Page ${currentPage + 1}/${PUBLIC_LINK_TOTAL_PAGE} `;
}

/** Diplays each link in the list in a table */
function clearLinkTable(tableElement) {
  // Clear the current content in the table
  tableElement.getElementsByTagName('tbody')[0].innerHTML = '';

  // Clear the tr list except the 1st one, which is the title
  const trList = Array.prototype.slice.call(
                    tableElement.getElementsByTagName('tr'), 1);
  trList.forEach(tr => tr.innerHTML = '');
}

/** Creates and returns an mailto html text string */
function createMailtoString(email) {
  return `<a href="mailto:${email}">${email}</a>`
}