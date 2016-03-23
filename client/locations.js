Template.registerHelper("currentLocationsIteration", function() {
  result = [];
  //finds all locations by current user id
  currentLocations.find().forEach(function(marker) {
    result.push({
      name: marker.name,
      address: marker.street + ", " + marker.city + ", " + marker.state,
      zipCode: marker.zipCode
    });
    //}
  });
  return result;
});
