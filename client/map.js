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

Template.map.onCreated(function() {
  GoogleMaps.ready('map', function(map) {
    searchLocation = new google.maps.LatLng(Session.get('lat'), Session.get('lon'));

    var myloc = new google.maps.Marker({
      clickable: false,
      icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
      new google.maps.Size(22,22),
      new google.maps.Point(0,18),
      new google.maps.Point(11,11)),
      shadow: null,
      zIndex: 999,
      map: GoogleMaps.get('map').instance,
      position: searchLocation
    });

    addCurrentLocationMarker = function(location) {
      currentLocations.insert({
        name: location.name,
        url: location.url,
        street: location.street,
        city: location.city,
        state: location.state,
        zipCode: location.zipCode,
        foods: location.foods,
        hours: location.hours,
        orgID: location.orgID,
        documents: location.documents,
        phone: location.phone,
        eligibility: location.eligibility,
        closures: location.closures,
        lat: location.latitude,
        lng: location.longitude,
        eligibilityURL: location.eligibilityURL,
        closures: location.closures,
        dataid: location._id,
        isActive: location.isActive
      });
    }

    map.instance.addListener("idle", function() {
      currentLocations.remove({});
      Markers.find().forEach(function(location) {
        if(isNaN(searchLocation.lat()) && markers[location._id] && map.instance.getBounds().contains(markers[location._id].getPosition())) {
          addCurrentLocationMarker(location);
          return;
        }

        if(markers[location._id] && map.instance.getBounds().contains(markers[location._id].getPosition()) && (getDistance(searchLocation, markers[location._id].getPosition()) < radius)) {
          addCurrentLocationMarker(location);
        }
      });
    });
    Markers.find().forEach(function(location) {
      addCurrentLocationMarker(location);
    });

    Markers.find().observe({
      added: function (document) {
        if((document.orgID===currentOrg||currentOrg===undefined)&&document.isActive){
          var geocoder = new google.maps.Geocoder();
          var address = document.street + ', ' + document.city + ', ' + document.state + ' ' + document.zipCode;
          if(Markers.findOne(document._id).latitude == undefined){
            //geocode is not defined?? geocode(address, document.name, document.foods, document.hours, document._id);
          } else {
            var marker = new google.maps.Marker({
              draggable: false,
              animation: google.maps.Animation.DROP,
              position: new google.maps.LatLng(Markers.findOne(document._id).latitude, Markers.findOne(document._id).longitude),
              map: map.instance,
              id: document._id
            });

            var infowindow = getInfoWindow(document);

            marker.addListener('click', function() {
              if (currentInfoWindow !== 'undefined') {
                currentInfoWindow.close();
              }
              var infowindow = getInfoWindow(Markers.findOne(document._id));
              infowindow.open(map.instance, marker);
              currentInfoWindow=infowindow;
            });

            markers[document._id] = marker;
          }
        }
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

Template.map.onRendered(function() {
	// get the current route name (better than checking window.location)
	var routeName = Router.current().route.getName();

	// add the class to body if this is the correct route
	if (routeName === 'home')
		$('body').addClass('mapBodyClass');
});

Template.map.onDestroyed(function() {
	$('body').removeClass('mapBodyClass');
});
