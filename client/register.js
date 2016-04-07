Template.register.events({
  'submit form': function(event) {
    event.preventDefault();
    var emailVar = event.target.registerEmail.value;
    var passwordVar = event.target.registerPassword.value;
    Meteor.call("MakeUser",emailVar,passwordVar);
    alert("The user "+emailVar+" has been created");
    event.target.registerEmail.value="";
    event.target.registerPassword.value="";
  }
});
