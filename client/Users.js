Template.UserList.events({
  "click [data-action='UserList/remove']": function(e) {
    console.log("Clicked remove");
    var id = e.target.name;
    console.log(id);
    Meteor.call("RemoveUser", id);
  },
  "click [data-action='UserList/update']": function(e){
    console.log("clicked update");
    var id = e.target.name;
    var newEmail = e.target.parentElement.parentElement.children[0].children[0].value;
    console.log(newEmail);
    UpdateEmail(id,newEmail);
  }
});

Template.registerHelper("UsersIteration", function() {
  return getUsers();
});
