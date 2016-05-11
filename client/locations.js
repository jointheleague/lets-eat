Template.registerHelper("currentLocationsIteration", function() {
  result = [];
  //finds all locations by current user id
  currentLocations.find().forEach(function(marker) {
    result.push({
      name: marker.name,
      url: marker.url,
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
      phone: marker.phone,
      documents: marker.documents
    });
  });
  return result;
});

Template.locations.helpers({
  'isURL': function(){
    if(this.url === "TBD" || this.url === ''){
      return false;
    }
    else{
      return true;
    }
  }
});
