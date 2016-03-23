Template.registerHelper("currentLocationsIteration", function() {
  result = [];
  //finds all locations by current user id
  currentLocations.find().forEach(function(marker) {
    result.push({
      name: marker.name,
      address: marker.street + ", " + marker.city + ", " + marker.state + ", " + marker.zipCode,
      foods: marker.foods,
      hours: marker.hours,
      orgID: marker.orgID
    });
    //}
  });
  return result;
});
