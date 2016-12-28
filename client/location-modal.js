Template.locationsModalTemplate.helpers({
	locationID: function() {return Session.get('locationID');},
	location: function() { return Markers.findOne({ _id: Session.get('locationID') }); }
});
