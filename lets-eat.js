Router.route('/:org?', function () {
  var params = this.params;
  currentOrg = params.org;
  console.log("currentOrg:" + currentOrg);
  this.render('main', {data: {title: 'Lets Eat'}});

});
Houston.menu({
  'type': 'template',
  'use': 'AddAccount',
  'title': 'New User'
});
Houston.menu({
  'type': 'template',
  'use': 'ChangePassword',
  'title': 'Change Password'
});

Markers.find().observe({
  added: function (document) {
    updateFromAdmin();
  }
});

if (Meteor.isClient) {
  navigator.geolocation.getCurrentPosition(function(position) {
    Session.set('lat', position.coords.latitude);
    Session.set('lon', position.coords.longitude);
  });
  Meteor.subscribe("markers");
  Meteor.startup(function() {
    GoogleMaps.load();
  });
}
