Template.UserList.events({
  "click [data-action='UserList/remove']": function(e) {
    console.log("Clicked remove");
    console.log(this.id);
    var id = this.id;
    console.log(id);
    Meteor.call("RemoveUser", id);
  },
  "click [data-action='UserList/update']": function(e){
    console.log("clicked update");
    var id = this.id;
    console.log(id);
    var email = e.target.parentElement.parentElement.children[0].children[0].value;
    console.log(email);
    var newData = {
      userId:id,
      mail:email
    };
    console.log(newData);
    Meteor.call("UpdateEmail",newData);

}});

Template.registerHelper("UsersIteration", function() {
  return getUsers();
});
