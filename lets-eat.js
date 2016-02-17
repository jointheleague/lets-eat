Markers = new Mongo.Collection('markers');

if (Meteor.isClient) {
  Template.map.onCreated(function() {
    GoogleMaps.ready('map', function(map) {
      google.maps.event.addListener(map.instance, 'click', function(event) {
        Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      });

      var markers = {};

      Markers.find().observe({
        added: function (document) {

          var geocoder = new google.maps.Geocoder();
          var address = document.street + ', ' + document.city + ', ' + document.state + ' ' + document.zipCode;

          geocoder.geocode( { 'address': address}, function(results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
              var latitude = results[0].geometry.location.lat();
              var longitude = results[0].geometry.location.lng();
              var marker = new google.maps.Marker({
                draggable: false,
                animation: google.maps.Animation.DROP,
                position: new google.maps.LatLng(latitude, longitude),
                map: map.instance,
                id: document._id
              });

              var contentString = '<h2>' + document.name + '</h2><br><small>' + document.foods + '</small><br><small>' + document.hours + '</small>';

              var infowindow = new google.maps.InfoWindow({
                content: contentString
              });

              marker.addListener('click', function() {
                infowindow.open(map.instance, marker);
              });
            }
          });

          markers[document._id] = marker;
        },
        changed: function (newDocument, oldDocument) {
          markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
        },
        removed: function (oldDocument) {
          markers[oldDocument._id].setMap(null);
          google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
          delete markers[oldDocument._id];
        }
      });
    });
  });

  Meteor.startup(function() {
    if(Markers.find().count()===0){
      Markers.insert({
        name:"Teen Challange",
        street:"5450 Lea Street",
        city:"San Diego",
        state:"CA",
        zipCode:"92105",
        foods:"20-30lb fresh produce per household",
        hours:"2nd Monday of each month from 9AM until food is gone"
      });
    }
    GoogleMaps.load();
  });

  Template.map.helpers({
    mapOptions: function() {
      if (GoogleMaps.loaded()) {
        return {
          center: new google.maps.LatLng(32.947419, -117.239467),
          zoom: 8
        };
      }
    }
  });
}
