// Client ID and API key from the Developer Console
const CLIENT_ID = '438102825107-e8ielv4ebjlreus56gdbcd3s58qma0ei.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCIDJtZ0o2uuCQrIVOjB-aJGfnxyzSIlmE';

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

const authorizeButton = document.getElementById('authorizeButton');
const signoutButton = document.getElementById('signoutButton');

const ZOOM_LEVEL = 18;
const CENTER = new google.maps.LatLng(40.807587, -73.961938);
const ORIGIN = new google.maps.LatLng(40.807587, -73.961938);
const DEFAULT_TRAVEL_MODE = 'WALKING';
const MS_PER_SECOND = 1000;
const NOW_ISO = (new Date()).toISOString();
const END_OF_DAY_ISO = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

var events = [];
var idx = 0;

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
    getAllEventsAndListMostUpcoming()
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
 * Retrieves all events from now to the end of the day from the user's calendar.
 * Displays information of the most upcoming event by default.
 * If no events are found an appropriate message is printed.
 */
function getAllEventsAndListMostUpcoming() {
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': NOW_ISO,
    'timeMax': END_OF_DAY_ISO,
    'showDeleted': false,
    'singleEvents': true,
    'orderBy': 'startTime'
  }).then(function(response) {
    events = response.result.items;

    if (events.length > 1) show("page_buttons");

    // Set the default display to the most upcoming event
    (events.length > 0) ? displayEventInfo(events[0]) : addText("overview", 
        "No upcoming events found.");
  });
}

function displayNextEventInfo() {
  (idx + 1) < events.length ? displayEventInfo(events[++idx]) : alert("No more events");
}

function displayPrevEventInfo() {
  (idx - 1) >= 0 ? displayEventInfo(events[--idx]) : alert("No more events");
}

function displayEventInfo(event) {
  var location = event.location;
  // For demo
  (location) ? addNavigation(ORIGIN, location) : hide("map");
  // For real usage
  // (location) ? addNavigationFromCurrentPosition(location) : hide("map");

  var hangoutLink = event.hangoutLink;
  (hangoutLink) ? addHangoutButton(hangoutLink) : hide("hangout");

  var when = event.start.dateTime;
  if (when) {
    when = new Date(when);
    if (location) {
      getSetOffTime(ORIGIN, location, when);
      // For real usage
      // getSetOffTimeFromCurrentPosition(location, when);
    } else {
      location = "Not specified in calendar";
      hide("setoff");
    }
  } else {
    when = "Not specified in calendar";
    hide("setoff");
  }
        
  addText("overview", "<b>Next Event: </b>" + event.summary + "<br>" + 
                      "<b>Start time: </b>" + when + "<br>" +
                      "<b>Location: </b>" + location);
}

function addHangoutButton(hangoutLink) {
  show("hangout");
  var div = document.getElementById("hangout");
  div.innerHTML = '';
  const buttonElement = document.createElement("button");
  buttonElement.id = "hangoutButton";
  buttonElement.onclick = function() {window.location.href = hangoutLink};
  buttonElement.innerText = "Hangout Link";
  div.appendChild(buttonElement);
}

/** Navigates to the destination from the current position */
function addNavigationFromCurrentPosition(location) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => addNavigation(new google.maps.LatLng(pos.coords.latitude, 
          pos.coords.longitude), location),
      (error) => handleLocationError(true, error));
  } else {
    handleLocationError(false, null);
  }
}

function addNavigation(origin, location) {
  show("map");
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: ZOOM_LEVEL,
    center: CENTER
  });
  directionsRenderer.setMap(map);

  directionsService.route(
    {
      origin: {
        lat: origin.lat(), lng: origin.lng()
      },
      destination: location,
      travelMode: DEFAULT_TRAVEL_MODE
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
      } else {
        alert("No walking route is found");
      }
    }
  );
}

/** Gets set off time from the current position */
function getSetOffTimeFromCurrentPosition(location, when) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => getSetOffTime(new google.maps.LatLng(pos.coords.latitude, 
          pos.coords.longitude), location, when),
      (error) => handleLocationError(true, error));
  } else {
    handleLocationError(false, null);
  }
}

/** Handles the location error when getting the user's current location */
function handleLocationError(browserHasGeolocation, error) {
  console.log(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' + error :
                        'Error: Your browser doesn\'t support geolocation.');
}

/**
 * Queries the Direction Matrix API and retrieves the duration
 * to get to the event location from the user's current location. 
 * If the event is already ongoing, prints a message instead.
 */
function getSetOffTime(origin, location, when) {
  show("setoff");
  if (when <= new Date()) {
    addText("setoff", "The event is ongoing!");
    return;
  }
  
  const service = new google.maps.DistanceMatrixService();
  const matrixOptions = {
    origins: [origin],
    destinations: [location],
    travelMode: DEFAULT_TRAVEL_MODE,
    unitSystem: google.maps.UnitSystem.METRIC,
  };
  // Call Distance Matrix service
  service.getDistanceMatrix(matrixOptions, callback);

  // Callback function used to process Distance Matrix response
  function callback(response, status) {
    // We input one origin and one destination, so there will be only one 
    // result returned
    var result = response.rows[0].elements;
    if (result[0].status !== "OK") {
      addText("setoff", "<b>Travel: </b>No walking route is found");
      return;
    }

    // Calculate the set off time
    var setoffDate = new Date(when - result[0].duration.value * MS_PER_SECOND);
    addText("setoff", "<b>Travel: </b> It takes about " + "<b>" + 
        result[0].duration.text + "</b>" + " to get to the destination. " + 
        "We recommend you to set off before " + "<b>" + setoffDate.getHours() + 
        ":" + setoffDate.getMinutes()+ "</b>");
  }
}

function redirectToHomePage() {
  window.location.href = '/index.html';
}

/** Adds HTML text to a div element as specified by id */
function addText(id, message) {
  var div = document.getElementById(id);
  div.innerHTML = message;
}

/** Hides an element based on its id */
function hide(id) {
  document.getElementById(id).classList.add('hidden');
}

/** Shows an element based on its id */
function show(id) {
  document.getElementById(id).classList.remove('hidden');
}