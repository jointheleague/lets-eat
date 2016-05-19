Meteor.publish("markers", function () {
  return Markers.find();
});

Houston.add_collection(Meteor.users);
Houston.hide_collection(Houston._admins);
//Not usefull for adding users and looks veary confusing
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
Meteor.methods({
  MakeUser: function(email, password){
    Accounts.createUser({
      email: email,
      password: password
    });
    var user = Accounts.findUserByEmail(email);
    console.log(user);
    Houston._admins.insert({
      user_id: user._id
    })
  }
});
