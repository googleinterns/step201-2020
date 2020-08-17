let currentPage;
let PUBLIC_LINK_TOTAL_PAGE;
const PUBLIC_LINKS_PER_PAGE = 10;

/** Initializes the display functionality.
    Gets the total pages from the datastore */
async function init() {
  // Fetch the size of the public links in the datastore
  const response = await fetch('/display-public-link');
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

/** Displays the first page of links */
function showFirstPage() {
  currentPage = 0;
  showPublicLinksInCurrentPage();
}

/** Displays the last page of links */
function showLastPage() {
  currentPage = PUBLIC_LINK_TOTAL_PAGE - 1;
  showPublicLinksInCurrentPage()
}

/** Retrieves the public links from the datastore and displays it */
function showPublicLinksInCurrentPage() {
  const params = new URLSearchParams();
  params.append('offset', currentPage * PUBLIC_LINKS_PER_PAGE);
  params.append('numLinksToShow', PUBLIC_LINKS_PER_PAGE);

  fetch('/display-public-link', {method: 'POST', body: params})
    .then(response => response.json()).then((links) => {
      let tableElement = document.getElementById('link-container-body');
      tableElement.innerHTML = '';
      links.forEach((link) => {
        let row = tableElement.insertRow();
        row.insertCell(0).innerHTML = link.key.id;
        row.insertCell(1).innerHTML = link.propertyMap.shortcut;
        addWordBreakToCell(row.insertCell(2), link.propertyMap.url);
        row.insertCell(3).innerHTML = createMailtoString(link.propertyMap.creator);
        row.insertCell(4).innerHTML = "<button onclick='goPrivate(this)'>Go private</button>";
      });
      $("tr td:first-child, th:eq(0)").hide();
    });

  const pageElement = document.getElementById('pageNumber');
  pageElement.innerHTML = ` Page ${currentPage + 1}/${PUBLIC_LINK_TOTAL_PAGE} `;
}

function goPrivate(btn) {
  var message = "Are you sure you want to make this link private?";
  if (window.confirm(message)) {
    const params = new URLSearchParams();
    params.append('id', $(btn).closest("tr").find("td:first").text());
    params.append('action', 'go-private');
    fetch('/~manage', {method: 'POST', body: params}).then(res => res.text())
        .then(stats => {
          if (stats.trim() === "Wrong user.") {
            window.alert("Only the creator can modify this status.");
          } else if (stats.trim() === "Repeated shortcut.") {
            window.alert("The shortcut already exists. Consider changing it.");
          } else {
            $(btn).closest('tr').remove();
          }
        });
  }
}

/** Adds the word-break rule to the cell */
function addWordBreakToCell(cell, content) {
  cell.innerHTML = content;
  cell.classList.add('break');
}

/** Creates and returns an mailto html text string */
function createMailtoString(email) {
  return `<a href="mailto:${email}">${email}</a>`
}
