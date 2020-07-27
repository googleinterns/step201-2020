// Client ID and API key from the Developer Console
var CLIENT_ID = '438102825107-e8ielv4ebjlreus56gdbcd3s58qma0ei.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCIDJtZ0o2uuCQrIVOjB-aJGfnxyzSIlmE';

var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var authorizeButton = document.getElementById('authorizeButton');
var signoutButton = document.getElementById('signoutButton');

/**
 *  Loads the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
  apiKey: API_KEY,
  clientId: CLIENT_ID,
  discoveryDocs: DISCOVERY_DOCS,
  scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function(error) {
    alert(error);
  });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    listNextEvent();
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Signs in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Signs out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Prints summary, start time, and location of the next event in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listNextEvent() {
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 1,
    'orderBy': 'startTime'
  }).then(function(response) {
    var events = response.result.items;

    if (events.length > 0) {
      var event = events[0];

      var location = event.location;
      if (location) {
        // TODO: Add Navigation 
        // addNavigation(location);
      }

      var hangoutLink = event.hangoutLink;
      if (hangoutLink) {
        addHangoutButton(hangoutLink);
      }

      var when = event.start.dateTime;
      if (when) {
        // TODO: Calculate Set off time using Directions API
        // getSetOffTime(when, destination);
      }
      addText('Next Event: ' + event.summary + ' (' + when + ')' + 
          ' (' + location + ')');
    } else {
      addText('No upcoming events found.');
    }
  });
}

function addHangoutButton(hangoutLink) {
  var div = document.getElementById("hangout");
  div.innerHTML = '';
  const buttonElement = document.createElement("button");
  buttonElement.id = "hangoutButton";
  buttonElement.onclick = function() {window.location.href = hangoutLink};
  buttonElement.innerText = "Hangout Link";
  div.appendChild(buttonElement);
}

function addText(message) {
  var div = document.getElementById('overview');
  div.innerHTML = '';
  var textContent = document.createTextNode(message);
  div.appendChild(textContent);
}

function initMap() {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 18,
    center: { lat: 40.807587, lng: -73.961938 }
  });
  directionsRenderer.setMap(map);
}