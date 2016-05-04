updateDB = function(){
  console.log("Geocoding...")
  Markers.find({ //for default 15
    latitude: undefined
  }).forEach(function(obj){
    var address = obj.street + ", " + obj.city + ", " + obj.state + " " + obj.zipCode;
    var geo = new GeoCoder();
    var result = geo.geocode(address);
    Markers.update({_id : obj._id},{$set: {latitude : result[0].latitude, longitude : result[0].longitude}});
    Meteor._sleepForMs(200);
  });
  console.log("Geocoding finished.")
}

updateFromAdmin = function(){
  Markers.find({ //for locations added at the admin panel
    latitude: 0
  }).forEach(function(obj){
    var address = obj.street + ", " + obj.city + ", " + obj.state + " " + obj.zipCode;
    var geo = new GeoCoder();
    var result = geo.geocode(address);
    Markers.update({_id : obj._id},{$set: {latitude : result[0].latitude, longitude : result[0].longitude}});
    Meteor._sleepForMs(200);
  });
}
