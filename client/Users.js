Template.UserList.events({
  "click [data-action='UserList/remove']": function() {
        console.log("Clicked remove");
    var id = this.dataid;
    console.log(id);
    var user = Meteor.users.findOne(id);
    Meteor.users.remove({_id:user});
  }
});

Template.registerHelper("UsersIteration", function() {
  result = [];
  //finds all locations by current user id
  Meteor.users.find().forEach(function(user) {
    result.push({
      email: user.emails[0].address,
      id: user._id
    });
  });
  return result;
});
