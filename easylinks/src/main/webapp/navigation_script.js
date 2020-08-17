/**Script code for navigation page */


// Stores the configurations of the map
const config = {
  URL_CUT_LENGTH: 6, 
  ZOOM_LEVEL: 16, 
  MAP_CENTER: {lat: 40.8075355, lng: -73.9625727}, 
  SEARCH_RADIUS: 5000,
  TEST_LOCATION: {lat: 40.807587, lng: -73.961938}
}
let map;
let markers;

/** Initializes the map and sets the center to the Columbia University */
function initMap() {
  // Initialize the map
  markers = [];
  map = new google.maps.Map(document.getElementById("map"), {
    center: config.MAP_CENTER,
    zoom: config.ZOOM_LEVEL
  }); 

  // Retrieve the destination name
  const dest = decodeURI(window.location.search.substr(config.URL_CUT_LENGTH));
  showDestination(dest);
}

/** Displays the destination on the map */
function showDestination(dest) {
  const request = {
    query: dest, 
    fields: ['name', 'geometry'],
    locationBias: {radius: config.SEARCH_RADIUS, center: config.MAP_CENTER}
  };

  service = new google.maps.places.PlacesService(map);
  service.findPlaceFromQuery(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      results.forEach(addMarker);
      map.setCenter(results[0].geometry.location);
    }
  });
}

/** Creates a marker of the given place and adds it to the map */
function addMarker(place) {
  // Initialize the marker
  const marker = new google.maps.Marker({
    position: place.geometry.location,
    map: map,
    title: place.name
  });
  markers.push(marker);

  // Set the diplay information of the marker
  const infowindow = new google.maps.InfoWindow({
    content: `<p><b>${place.name}</b></p>` +
             `<p>location:${place.geometry.location}</p>` +
             `<button onclick="showDirectionsFromCurrentPosition(
               ${place.geometry.location.lat()}, 
               ${place.geometry.location.lng()})">
               Directions</button>`
  });
  infowindow.open(map, marker);

  marker.addListener('click', () => {
    infowindow.open(map, marker);
  });
}

/** Navigates to the destination from the current position */
function showDirectionsFromCurrentPosition(destLat, destLng) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => showDirectionsWhenSuccess(pos, destLat, destLng), 
      (error) => handleLocationError(true, error));
  } else {
    handleLocationError(false, null);
  }
}

/** Processes the current position and navigates the destination */
function showDirectionsWhenSuccess(pos, destLat, destLng) {
  var directionsService = new google.maps.DirectionsService();
  var directionsRenderer = new google.maps.DirectionsRenderer();
  var routeRequest = {
      origin:new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
      destination: new google.maps.LatLng(destLat, destLng),
      travelMode: 'WALKING' 
  };

  // Navigate to the destionation
  markers.forEach(marker => marker.setMap(null));
  directionsRenderer.setMap(map);
  directionsService.route(routeRequest, (response, status) => {
    status === "OK" ?
    directionsRenderer.setDirections(response) :
    showAlertMsg();
  });
}

/** Displays the error message when the route is not found */
function showAlertMsg() {
  const mapHeader = document.getElementById('mapHeader');
  mapHeader.classList.add('hidden');

  const alertElement = document.getElementById('alertNoResult');
  alertElement.classList.remove('hidden');
  alertElement.innerHTML = '<p><strong>Oops! </strong>'
                            + 'No walking route to the destintation is found. '
                            + 'Maybe the destination is too far for walking? '
                            + '<button id="navigationbtn" '
                            + 'onclick="redirectToHomePage()">'
                            + 'Back</button>';
  
  markers.forEach(marker => marker.setMap(map));
}

/** Handles the location error when getting the user's current location */
function handleLocationError(browserHasGeolocation, error) {
  console.log(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' + error :
                        'Error: Your browser doesn\'t support geolocation.');
}
