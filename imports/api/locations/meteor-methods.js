Meteor.methods({

	addLocation: function(location) {
		Markers.insert(location);
	},

	editLocation: function(location) {
		Markers.update(location.id, {$set: {
			name: 	location.name,
			orgID: 	location.orgID,
			street:	location.street,
			city: 	location.city,
			zipCode:	location.zipCode,
			phone: 	location.phone,
			hours: 	location.hours,
			closures: location.clojures,
			eligibility: location.eligibility,
			eligibilityUrl: location.eligibilityUrl,
			//TODO: update latitude and longitude
			isActive: location.isActive,
			foods: location.foods
		}});
	},

	deleteLocation: function(id) {
		Markers.remove(id);
	}
});