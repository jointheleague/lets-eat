var handles = [];
['markers'].forEach(function(name){
  var handle = Meteor.subscribe(name, function() {
  });
  handles.push(handle);
});

var markers = function() {
  return Markers.find().fetch().map(function(it){
    return {value: it.name, id: it._id};
  });
};
Template.search.rendered = function() {
  Meteor.typeahead.inject();
};
Template.search.events({
  "submit .SearchForm": function(e){
    e.preventDefault();
    var map = GoogleMaps.get('map');
    var location = document.getElementById('searchBar').value;
    var location2 = Markers.findOne({name:location});
    if (location2 !== undefined && location2 !== null) {
      map.instance.panTo(new google.maps.LatLng(location2.latitude,location2.longitude));
      map.instance.setZoom(14);
    }else{
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode( { 'address': location}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var adr = results[0].formatted_address;
          map.instance.panTo(new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
          map.instance.setZoom(12);
        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
      });
    }
  }
});
