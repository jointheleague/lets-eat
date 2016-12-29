Meteor.methods({
	editLocation: function(location) {
		console.log('editLocation...');
		Markers.update(location.id, {$set: {
			name: location.name
		}});
	}
});