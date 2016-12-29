Meteor.methods({

	addLocation: function(location) {
		Markers.insert(location);
	},

	editLocation: function(location) {
		Markers.update(location.id, {$set: {
			name: location.name
			//TODO: update other fields
		}});
	},
	
	deleteLocation: function(id) {
		Markers.remove(id);
	}
});