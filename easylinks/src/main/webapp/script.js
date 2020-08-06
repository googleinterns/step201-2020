/** Script code for the EasyLink project */


/**
 * Checks user authentication. 
 * Redirects to login page if user is not logged in
 */
function userAuth() {
  fetch('/~login').then(response => response.text()).then(stats => {
    if (stats.trim() !== "okay-columbia" && stats.trim() !== "okay") {
      window.location.href = stats;
    }
  });
}

/** Displays links */
function getLinks() {
  userAuth();
  fetch(`/~manage`)
    .then(response => response.json())
    .then((stats) => {
      var tableElement = document.getElementById('link-container');
      tableElement.getElementsByTagName("tbody")[0].innerHTML = '';

      if (stats) {
        stats.forEach((link) => {
          // Add a row to the table, which looks like
          // id, shortcut, url, edit button, delete button, go-public button
          var row = tableElement.insertRow();
          row.insertCell(0).innerHTML = link.key.id;
          row.insertCell(1).innerHTML = link.propertyMap.shortcut;
          row.insertCell(2).innerHTML = createHyperLink(link.propertyMap.url);
          row.insertCell(3).innerHTML = "<button onclick='editLink(this)'>Edit</button>";
          row.insertCell(4).innerHTML = "<button onclick='deleteLink(this)'>Delete</button>";
          row.insertCell(5).innerHTML = "<button onclick='goPublic(this)'>Go public</button>";
        });
      }
  });
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
  $("#ed-shortcut").val($(btn).closest("tr").find("td:eq(1)").html());
  $("#ed-url").val($(btn).closest("tr").find("td:eq(2)").html());
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
  var message = "Public links cannot be make back to private again.\n";
  message += "To use the link in the future, append '~' at the beginning.\n";
  message += "e.g. use '~hello' instead of 'hello'.";
  if (window.confirm(message)) {
    const params = new URLSearchParams();
    params.append('id', $(btn).closest("tr").find("td:first").text());
    params.append('action', 'go-public');
    fetch('/~manage', {method: 'POST', body: params}).then(res => res.text())
        .then(stats => {
          if (stats.trim() === "Repeated shortcut.") {
            window.alert("The shortcut already exists. Consider changing it.");
          } else {
            $(btn).closest('tr').remove();
          }
        });
  }
}

function redirectToManagePage() {
  userAuth();
  window.location.href = '/manage.html';
}

function redirectToHomePage() {
  window.location.href = '/index.html';
}