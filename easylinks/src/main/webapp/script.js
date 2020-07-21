/** Script code for the EasyLink project */


/** Tells the server to delete the link. */
function deleteLink(id) {
  const params = new URLSearchParams();
  params.append('id', id);
  fetch('/data', {method: 'POST', body: params});
}

/**
 * Checks user authentication. 
 * Redirects to login page if user is not logged in
 */
function userAuth() {
  fetch('/login').then(response => response.text()).then(stats => {
    if (stats.trim() !== "okay-columbia" && stats.trim() !== "okay") {
      window.location.href = stats;
    }
  });
}

/** Displays links after user is logged in */
function getLinks() {
  userAuth();
  fetch(`/data`)
    .then(response => response.json())
    .then((stats) => {
      var tableElement = document.getElementById('link-container');
      tableElement.getElementsByTagName("tbody")[0].innerHTML = '';

      if (stats) {
        stats.forEach((link) => {
          // Add a row to the table, which looks like
          // id, shortcut, url, edit button, delete button
          var row = tableElement.insertRow();
          row.insertCell(0).innerHTML = link.propertyMap.id;
          row.insertCell(1).innerHTML = link.propertyMap.shortcut;
          row.insertCell(2).innerHTML = createHyperLink(link.propertyMap.url);
          row.insertCell(3).innerHTML = "<button class=\"edit-button\">Edit</button>";
          row.insertCell(4).innerHTML = "<button>Delete</button>";
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

$(".edit-button").click(function() {
  $("#edit-form").show();
  const id = document.getElementById("id");
  id.innerText = Integer.parseInt($(this).closest("tr").find("td:nth-child(0)").text());
  const shortcut = document.getElementById("shortcut")
  shortcut.value = $(this).closest("tr").find("td:nth-child(1)").text();
  const url = document.getElementById("url");
  url.value = $(this).closest("tr").find("td:nth-child(2)").text();
});

function closeForm() {
  document.getElementById("edit-form").style.display = "none";
}