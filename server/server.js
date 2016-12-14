Meteor.publish("markers", function () {
  return Markers.find();
});
Meteor.publish("userList", function () {
  return Meteor.users.find({}, {fields: {emails: 1, _id: 1}});
});
Meteor.startup(function(){
  console.log("Starting Up... Adding isActive");
  Markers.find().forEach(function(obj){
    if (obj.isActive===undefined) {
      Markers.update({_id:obj._id},{$set: {isActive: true}})
    }
  });
}
);
Houston.hide_collection(Meteor.users);
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
  },
  RemoveUser: function(id){
    Houston._admins.remove({user_id: id});
    if (Houston._admins.find().count() === 1) {
      Houston._admins.remove({exits: true});
    }
    Meteor.users.remove(id);
  },
  UpdateEmail:function(data){
    Meteor.users.update({
      _id:data.userId
    }, {
      $set:{
        'emails.0.address': data.mail
      }
    });
  },
  updateFoods:function(data){
    console.log("Updating Foods");
    console.log(data.id);
    console.log(data.type);
    console.log(data.checked);
    var setModifier = { $set: {} };
    setModifier.$set[data.type] = data.checked;
    Markers.update({_id: data.id}, setModifier);

    //  Markers.update({_id:data.id.toString()},{$set:{data.type : data.checked}});
  }
});
