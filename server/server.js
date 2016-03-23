Meteor.publish("markers", function () {
  return Markers.find();
});

Houston.hide_collection(Meteor.users);
Houston.hide_collection(Houston._admins);

Houston.methods('markers', {
  "Geocode": function (post) {
    var address = post.street + ", " + post.city + ", " + post.state + " " + post.zipCode;
    var geo = new GeoCoder();
    var result = geo.geocode(address);
    Markers.update({_id : post._id},{$set: {latitude : result[0].latitude, longitude : result[0].longitude}});
    console.log("Lat: " + result[0].latitude + " Lon: " + result[0].longitude);
    return post.name + " geocoded successfully.";
  }
});
updateDB = function(){
  Markers.find({ //for default 15
    latitude: undefined
  }).forEach(function(obj){
    var address = obj.street + ", " + obj.city + ", " + obj.state + " " + obj.zipCode;
    var geo = new GeoCoder();
    var result = geo.geocode(address);
    Markers.update({_id : obj._id},{$set: {latitude : result[0].latitude, longitude : result[0].longitude}});
    console.log("Lat: " + result[0].latitude + " Lon: " + result[0].longitude);
    Meteor._sleepForMs(200);
  });

  Markers.find({ //check for entries from admin panel
    latitude: 0
  }).forEach(function(obj){
    var address = obj.street + ", " + obj.city + ", " + obj.state + " " + obj.zipCode;
    var geo = new GeoCoder();
    var result = geo.geocode(address);
    Markers.update({_id : obj._id},{$set: {latitude : result[0].latitude, longitude : result[0].longitude}});
    console.log("Lat: " + result[0].latitude + " Lon: " + result[0].longitude);
    Meteor._sleepForMs(200);
  });
}
