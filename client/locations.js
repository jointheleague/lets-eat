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
      orgID: marker.orgID
    });
    //}
  });
  return result;
});
