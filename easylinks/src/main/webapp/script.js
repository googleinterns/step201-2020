/** Script code for the EasyLink project */


/**
 * Checks user authentication. 
 * Redirects to login page if user is not logged in
 * Shows logout button if user is logged in
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
      if (window.location.href.endsWith("index.html")) {
        var authButton = document.getElementById("authButton");
        authButton.innerText = "Sign in";
        authButton.onclick = (function() {
          window.location.href = stats.trim();
        });
        authButton.classList.remove("hidden");
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
      var tableElement = document.getElementById('link-container');
      tableElement.getElementsByTagName("tbody")[0].innerHTML = '';

      if (stats) {
        stats.forEach((link) => {
          // Add a row to the table, which looks like
          // id, shortcut, url, edit button, delete button
          var row = tableElement.insertRow();
          row.insertCell(0).innerHTML = link.key.id;
          row.insertCell(1).innerHTML = link.propertyMap.shortcut;
          row.insertCell(2).innerHTML = createHyperLink(link.propertyMap.url);
          row.insertCell(3).innerHTML = "<button onclick=\"editLink(this)\">Edit</button>";
          row.insertCell(4).innerHTML = "<button onclick=\"deleteLink(this)\">Delete</button>";
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

/** Allows for link edition when the edit button gets clicked. */
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

function redirectToManagePage() {
  userAuth();
  window.location.href = '/manage.html';
}

function redirectToHomePage() {
  window.location.href = '/index.html';
}