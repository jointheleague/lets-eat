Template.registerHelper("currentLocationsIteration", function() {
  result = [];
  //finds all locations by current user id
  currentLocations.find().forEach(function(marker) {
    result.push(marker);
  });
  return result;
});

Template.locations.events({
  "click .table-row": function() {
    var id = this.dataid;
    var marker = Markers.findOne(id);
    new google.maps.Geocoder().geocode({'address': marker.street + ', ' + marker.city + ', ' + 'CA' + ' ' + marker.zipCode}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if(currentInfoWindow !== 'undefined') {
          currentInfoWindow.close();
        }
        currentInfoWindow = getInfoWindow(marker);
        currentInfoWindow.open(GoogleMaps.get("map").instance, markers[id]);

        GoogleMaps.get("map").instance.setZoom(12);
        GoogleMaps.get("map").instance.panTo(results[0].geometry.location);

        window.scrollTo(0, 0);
      } else {
        console.log('Template.locations.events.click:  Error status is: ' + status);
      }
    });
  }
});
Template.locations.helpers({
  'isURL': function(){
    if(!this.url || this.url === "TBD" || this.url === ''){
      return false;
    }
    else{
      return true;
    }
  },
	'hasEligibilityURL': function(){
		if( !this.eligibilityURL || this.eligibility === 'none' || this.eligibilityURL === ''){
			return false;
		} else {
			return true;
		}
	},
  'foodStatus': function(foods) {
    return parseFoods(foods);
  }
});
