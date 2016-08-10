if (Meteor.isClient) {
  setTimeout(navigator.geolocation.getCurrentPosition(function(position) {
    Session.set('lat', position.coords.latitude);
    Session.set('lon', position.coords.longitude);
  }), 1000);
}
