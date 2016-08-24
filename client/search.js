var handles = [];
['markers'].forEach(function(name){
  var handle = Meteor.subscribe(name, function() {
  });
  handles.push(handle);
});


Template.search.rendered = function() {
  Meteor.typeahead.inject();
};
Template.search.events({
  "submit .SearchForm": function(e){
    e.preventDefault();
    var map = GoogleMaps.get('map');
    var location = document.getElementById('searchBar').value;
    var location2 = Markers.findOne({name:location});

    var pos = location2 ? new google.maps.LatLng(location2.latitude,location2.longitude) : null;

    var realRadius = document.getElementById("radiusBar").value;

    if(realRadius != "") {
      radius = realRadius;
    }

    for(var key in markers) {
      markers[key].setMap(GoogleMaps.get("map").instance);
    }

    if (location2 != undefined) {
      var bounds = new google.maps.LatLngBounds();
      for(var key in markers) {
        if(getDistance(searchLocation, markers[key].getPosition()) > radius) {
          markers[key].setMap(null);
        } else {
          bounds.extend(markers[key].getPosition());
        }
      }

      map.instance.fitBounds(bounds);
    }else{
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode( { 'address': location}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var adr = results[0].formatted_address;
          pos = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());

          searchLocation = pos;
          map.instance.panTo(pos);
          var bounds = new google.maps.LatLngBounds();
          currentLocations.find().forEach(function(obj) {
            bounds.extend(markers[obj.dataid].getPosition());
          });
          map.instance.fitBounds(bounds);

          for(var key in markers) {
            if(getDistance(searchLocation, markers[key].getPosition()) > radius) {
              markers[key].setMap(null);
            }
          }
        } else {
          alert("Whoops! An error occurred! The error status is as follows: " + status);
        }
      });
    }
  },
  "click #Print": function(e){
    e.preventDefault();
    if(currentLocations.find().count() < 80){
      var original;
      var map = GoogleMaps.get('map');
      var bounds = new google.maps.LatLngBounds();
      currentLocations.find().forEach(
        function(doc){
          bounds.extend(new google.maps.LatLng(doc.lat, doc.lng));
        }
      );
      original = document.getElementById("mapContainer").style.width;
      document.getElementById("mapContainer").style.width = "900px";
      setTimeout(function(){
        google.maps.event.trigger(map.instance, 'resize');
        setTimeout(function(){
          map.instance.fitBounds(bounds);
          setTimeout(function(){
            window.print();
            document.getElementById("mapContainer").style.width = original;
          },200);
        },100);
      },100);

    }else {
      alert("Please have less than 80 markers in the map to print.");
      window.print();
    }
  }});
