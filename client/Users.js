Template.users.events({
"click .remove": function() {
  var id = this.dataid;
  var user = Meteor.users.findOne(id);
  Meteor.Meteor.users.Collection.remove({_id:user});
},
"click .reset": function(){
  var id = this.dataid;
  var user = Meteor.users.findOne(id);
Accounts.Accounts.sendResetPasswordEmail(id);

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
