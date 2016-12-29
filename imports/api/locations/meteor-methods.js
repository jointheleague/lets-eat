Meteor.methods({
	editLocation: function(location) {
		Markers.update(location.id, {$set: {
			name: location.name
		}});
	},

	addLocation: function(location) {
		console.log('Meteor.methods.addLocation...');
		console.log(Markers.insert(location));
	}
});