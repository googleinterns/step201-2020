/**Script code for navigation page */


// Stores the configurations of the map
const config = {
  URL_CUT_LENGTH: 6, ZOOM_LEVEL: 16, 
  MAP_CENTER: {lat: 40.8075355, lng: -73.9625727}, 
  SEARCH_RADIUS: 5000
}
let map;

/** Initializes the map and sets the center to the Columbia University */
function initMap() {
  // Initialize the map
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

  // Set the diplay information of the marker
  const infowindow = new google.maps.InfoWindow({
    content: `<p><b>${place.name}</b></p>` +
              `<p>location:${place.geometry.location}</p>` +
              `<button onclick="showDirections()">Directions</button>`
  });
  infowindow.open(map, marker);

  marker.addListener('click', () => {
    infowindow.open(map, marker);
  });
}

/** Navigates from the user's current position to the destination */
function showDirections() {
  console.log("Not implemented");
}

/** Handles the location error when getting the user's current location */
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}