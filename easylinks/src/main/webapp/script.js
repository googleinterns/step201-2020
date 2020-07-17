/** Script code for the EasyLink project */

/** Tells the server to delete the link. */
function deleteLink(id) {
  const params = new URLSearchParams();
  params.append('id', id);
  fetch('/delete-link', {method: 'POST', body: params});
}