/** Script code for the EasyLink project */

var links = [];
var offset = 0;
var TOTAL_PAGES = 0;
const ROWS_PER_PAGE = 10;

/**
 * Checks user authentication. 
 * If user is not logged in and on the management page, redirects to login page;
 * If the user is on the home page, shows login button
 * If user is logged in, shows logout button
 */
function userAuth() {
  fetch('/~login').then(response => response.text()).then(stats => {
    if (stats.trim().startsWith("okay")) {
      var authButton = document.getElementById("authButton");
      authButton.innerText = "Sign out";
      authButton.onclick = (function() {
        window.location.href = stats.trim().substring(4);
      });
      authButton.classList.remove("hidden");
    } else {
      if (window.location.href.endsWith("manage.html")) {
        window.location.href = stats.trim();
      }
    }
  });
}

/** Displays links */
function getLinks() {
  userAuth();
  fetch(`/~manage`)
    .then(response => response.json())
    .then((stats) => {
      if (links) {
        links = stats;
        TOTAL_PAGES = Math.ceil(links.length / ROWS_PER_PAGE);
        if (links.length > 0) show("page_buttons");
        // By default, display from the beginning
        displayFirstPage();
      }
  });
}

function displayFirstPage() {
  offset = 0;
  displayLinks();
}

function displayLastPage() {
  offset = (links.length % ROWS_PER_PAGE == 0) ? links.length - ROWS_PER_PAGE
      : links.length - links.length % ROWS_PER_PAGE;
  displayLinks();
}

function displayNextPage() {
  offset += ROWS_PER_PAGE;
  (offset < links.length) ? displayLinks(): offset -= ROWS_PER_PAGE;
}

function displayPrevPage() {
  offset -= ROWS_PER_PAGE;
  (offset >= 0) ? displayLinks() : offset += ROWS_PER_PAGE;
}

function displayLinks() {
  var tablebody = document.getElementById('link-container-body');
  $('#link-container-body').empty();

  var slice = (offset + ROWS_PER_PAGE) < links.length ?
      links.slice(offset, offset + ROWS_PER_PAGE) :
      links.slice(offset);

  slice.forEach((link) => {
    // Add a row to the table, which looks like
    // id, shortcut, url, edit button, delete button, go-public button
    var row = tablebody.insertRow();
    row.insertCell(0).innerHTML = link.key.id;
    row.insertCell(1).innerHTML = link.propertyMap.status;
    row.insertCell(2).innerHTML = link.propertyMap.shortcut;
    addWordBreakToCell(row.insertCell(3), createHyperLink(link.propertyMap.url));
    row.insertCell(4).innerHTML = "<button onclick='editLink(this)'>Edit</button>";
    row.insertCell(5).innerHTML = "<button onclick='deleteLink(this)'>Delete</button>";
    if (link.propertyMap.status === "Private") {
      row.insertCell(6).innerHTML = "<button onclick='goPublic(this)'>Go public</button>";
    } else {
      row.insertCell(6).innerHTML = "<button onclick='goPrivate(this)'>Go private</button>";
    }
  });
  
  // Hide id
  $("tr td:first-child, th:eq(0)").hide();
  
  if (TOTAL_PAGES !== 0) {
    const pageElement = document.getElementById('pageNumber');
    pageElement.innerHTML = ` Page ${offset / ROWS_PER_PAGE + 1}/${TOTAL_PAGES} `;
  }
}

/** Creates an element that represents a clickable url. */
function createHyperLink(url) {
  const referElement = document.createElement('a');
  referElement.href = url;
  referElement.innerText = url;
  return referElement;
}

/** Open the edit form and prefill with current information. */
function editLink(btn) {
  closeAddForm();
  $("#edit-form").show();
  $("#ed-id").val($(btn).closest("tr").find("td:eq(0)").html());
  $("#ed-shortcut").val($(btn).closest("tr").find("td:eq(2)").html());
  $("#ed-url").val($(btn).closest("tr").find("td:eq(3)").html());
}

/** Close the edit form. */
function closeEditForm() {
  document.getElementById("edit-form").style.display = "none";
}

/** Close the add form. */
function closeAddForm() {
  document.getElementById("add-form").classList.add('hidden');
}

/** Displays the form for user to add a link */
function showAddLinkForm() {
  closeEditForm();
  document.getElementById("add-form").classList.remove('hidden');
}

/** Tells the server to delete the link. */
function deleteLink(btn) {
  const params = new URLSearchParams();
  params.append('id', $(btn).closest("tr").find("td:first").text());
  params.append('action', 'delete');
  fetch('/~manage', {method: 'POST', body: params});
  $(btn).closest('tr').remove();
}

function goPublic(btn) {
  var message = "Are you sure you want to make this link public?";
  if (window.confirm(message)) {
    const params = new URLSearchParams();
    params.append('id', $(btn).closest("tr").find("td:first").text());
    params.append('action', 'go-public');
    fetch('/~manage', {method: 'POST', body: params}).then(res => res.text())
        .then(stats => {
          if (stats.trim() === "Repeated shortcut.") {
            window.alert("The shortcut already exists. Consider changing it.");
          }
        });
  }
  window.location.reload();
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
            window.alert("The shortcut already exist in your list.");
          }
        });
  }
  window.location.reload();
}

function getLinkbyShortcut() {
  // Empty the table
  var tablebody = document.getElementById('link-container-body');
  $('#link-container-body').empty();

  links.forEach((link) => { 
    if (link.propertyMap.shortcut.startsWith(document.getElementById('shortcut').value)) {
      var row = tablebody.insertRow();
      row.insertCell(0).innerHTML = link.key.id;
      row.insertCell(1).innerHTML = link.propertyMap.status;
      row.insertCell(2).innerHTML = link.propertyMap.shortcut;
      addWordBreakToCell(row.insertCell(3), createHyperLink(link.propertyMap.url));
      row.insertCell(4).innerHTML = "<button onclick='editLink(this)'>Edit</button>";
      row.insertCell(5).innerHTML = "<button onclick='deleteLink(this)'>Delete</button>";
      if (link.propertyMap.status === "Private") {
        row.insertCell(6).innerHTML = "<button onclick='goPublic(this)'>Go public</button>";
      } else {
        row.insertCell(6).innerHTML = "<button onclick='goPrivate(this)'>Go private</button>";
      }

      // Hide id
      $("tr td:first-child, th:eq(0)").hide();
    }
  });
}

function redirectToManagePage() {
  userAuth();
  window.location.href = '/manage.html';
}

function redirectToHomePage() {
  window.location.href = '/index.html';
}

/** Shows an element based on its id */
function show(id) {
  document.getElementById(id).classList.remove('hidden');
}