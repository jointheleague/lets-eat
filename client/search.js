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
  },
  "click #Print": function(e){
    e.preventDefault();
    if(currentLocations.find().count() < 80){
      var map = GoogleMaps.get('map');
      var bounds = new google.maps.LatLngBounds();
      currentLocations.find().forEach(
        function(doc){
          bounds.extend(new google.maps.LatLng(doc.lat, doc.lng));
        }
      );
      document.getElementById("mapContainer").style.width = "800px";
      setTimeout(function(){
        console.log(map.instance.getCenter().toString());
        google.maps.event.trigger(map, 'resize');
        console.log(map.instance.getCenter().toString());
        setTimeout(function(){
          map.instance.fitBounds(bounds);
          setTimeout(function(){
          //  map.instance.panTo(bounds.getCenter());
            setTimeout(function(){
              window.print();
              // setTimeout(function(){
              //   document.getElementById("mapContainer").style.width = "100%";
              //   google.maps.event.trigger(map, 'resize');
              // },2000);
            },2000);
          },2000);
        },2000);
      },2000);
    }else {
      alert("Too many items in map to calculate center");
      window.print();
    }
  }});
