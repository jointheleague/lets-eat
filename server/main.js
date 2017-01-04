import '/imports/startup/server';

Meteor.publish("markers", function () {
  return Markers.find({}, { sort: { name: 1} });
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
//Not usefull for adding users and looks very confusing
Houston.methods('markers', {
  "Geocode": function (post) {
		//console.log('server.js:Houston.methods.Geocode...');
		//console.log(post);
    var address = post.street + ", " + post.city + ", " + 'CA' + " " + post.zipCode;
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
  },
  updateDB:function(){
    console.log("Geocoding...")
    var geocoded = 0;
    var total = Markrs.total().count();
    Markers.find({
      latitude: undefined
    }).forEach(function(obj){
      try {
        var address = obj.street + ", " + obj.city + ", CA " + obj.zipCode;
        var geo = new GeoCoder();
        var result = geo.geocode(address);
        Markers.update({_id : obj._id},{$set: {latitude : result[0].latitude, longitude : result[0].longitude}});
        geocoded = geocoded + 1;
        if(((geocoded * 100)/total) % 10 < 2){
          console.log("Geocode " + ((geocoded * 100)/total) + "%");
        }
        Meteor._sleepForMs(200);
      } catch (e) {
        console.log(e.message);
        console.log(address);
      }
    });
    console.log("Geocoding finished.")
  },
});
