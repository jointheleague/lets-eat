var centerLat = 32.947419;
var centerLng = -117.239467;
Template.map.helpers({
  mapOptions: function() {
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(centerLat, centerLng),
        zoom: 8
      };
    }
  }
});
