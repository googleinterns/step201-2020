/** Script code for the EasyLink project */


/** Tells the server to delete the link. */
function deleteLink(id) {
  const params = new URLSearchParams();
  params.append('id', id);
  fetch('/delete-link', {method: 'POST', body: params});
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