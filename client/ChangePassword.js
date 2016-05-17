Template.ChangePassword.events({
  'submit form': function(event) {
    event.preventDefault();
    var passwordVar = event.target.registerPassword.value;
    var userid = Meteor.userId();
    Meteor.call("updatePassword",userid,passwordVar);
    event.target.registerPassword.value="";
    alert("Your password has been changed");
  }
});
