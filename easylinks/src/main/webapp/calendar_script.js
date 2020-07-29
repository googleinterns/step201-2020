// Client ID and API key from the Developer Console
const CLIENT_ID = '438102825107-e8ielv4ebjlreus56gdbcd3s58qma0ei.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCIDJtZ0o2uuCQrIVOjB-aJGfnxyzSIlmE';

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

const authorizeButton = document.getElementById('authorizeButton');
const signoutButton = document.getElementById('signoutButton');

const ZOOM_LEVEL = 18;
const ORIGIN = new google.maps.LatLng(40.807587, -73.961938);
const DEFAULT_TRAVEL_MODE = 'WALKING';
const MS_PER_SECOND = 1000;

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
      (location) ? addNavigation(location) : location = "";

      var hangoutLink = event.hangoutLink;
      (hangoutLink) ? addHangoutButton(hangoutLink) : hangoutLink = "";

      var when = event.start.dateTime;
      if (when) {
        when = new Date(when);
        if (location) getSetOffTime(when, location);
      } else {
        when = "";
      }

      addText("overview", "<b>Next Event: </b>" + event.summary + "<br>" + 
                          "<b>Start time: </b>" + when + "<br>" +
                          "<b>Location: </b>" + location);
    } else {
      addText("overview", "No upcoming events found.");
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

function addNavigation(location) {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: ZOOM_LEVEL,
    center: ORIGIN
  });
  directionsRenderer.setMap(map);

  directionsService.route(
    {
      origin: {
        // TODO: replace this fixed value with user current location
        // The value here is put just for ease of testing
        lat: ORIGIN.lat(), lng: ORIGIN.lng()
      },
      destination: {
        query: location
      },
      travelMode: DEFAULT_TRAVEL_MODE
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}

function getSetOffTime(when, location) {
  if (when <= new Date()) {
    addText("setoff", "The event is ongoing!");
    return;
  }
  
  const service = new google.maps.DistanceMatrixService();
  const matrixOptions = {
    origins: [ORIGIN],
    destinations: [location],
    travelMode: DEFAULT_TRAVEL_MODE,
    unitSystem: google.maps.UnitSystem.METRIC,
  };
  // Call Distance Matrix service
  service.getDistanceMatrix(matrixOptions, callback);

  // Callback function used to process Distance Matrix response
  function callback(response, status) {
    if (status !== "OK") {
      alert("Error with distance matrix");
      return;
    }
    
    // We input one origin and one destination, so there will be only one 
    // result returned 
    var result = response.rows[0].elements;
    addText("duration", "It takes about " + "<b>" + result[0].duration.text + 
        "</b>" + " to get to the destination");

    // Calculate the set off time
    var setoffDate = new Date(when - result[0].duration.value * MS_PER_SECOND);
    addText("setoff", "We recommend you to set off before " + "<b>"
        + setoffDate.getHours() + ":" + setoffDate.getMinutes()+ "</b>");
  }
}

function addText(id, message) {
  var div = document.getElementById(id);
  div.innerHTML = message;
}