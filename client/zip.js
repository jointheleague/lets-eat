Template.zip.events({
  "click #findZip": function(e){
    var map = GoogleMaps.get('map');
    var geocoder = new google.maps.Geocoder();
    var address = document.getElementById('zipcode').value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var adr = results[0].formatted_address;
        map.instance.panTo(new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
        map.instance.setZoom(12);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }
});
