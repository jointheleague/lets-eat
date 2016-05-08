Template.registerHelper("currentLocationsIteration", function() {
  result = [];
  //finds all locations by current user id
  currentLocations.find().forEach(function(marker) {
    result.push({
      name: marker.name,
      street: marker.street,
      city: marker.city,
      state: marker.state,
      zipCode: marker.zipCode,
      foods: marker.foods,
      hours: marker.hours,
      orgID: marker.orgID,
      closures: marker.closures,
      eligibility: marker.eligibility,
      eligibilityURL: marker.eligibilityURL,
      documents: marker.documents,
      _id: marker._id
    });
  });
  return result;
});

Template.locations.events({
  "click .table-row": function() {
    var marker = currentLocations.findOne(this._id);
    new google.maps.Geocoder().geocode({'address': marker.street + ', ' + marker.city + ', ' + marker.state + ' ' + marker.zipCode}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        GoogleMaps.get("map").instance.setZoom(12);
        GoogleMaps.get("map").instance.panTo(results[0].geometry.location);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }
});
