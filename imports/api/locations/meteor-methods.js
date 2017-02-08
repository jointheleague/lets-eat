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
	},
	createNewUser: function(data){
		Accounts.createUser({
			email: data.email,
			password: data.password,
			username: data.name
		});
		var user = Accounts.findUserByEmail(email);
		console.log(user);
		Houston._admins.insert({
			user_id: user._id
		})
	},
	changeUser: function(data){
		Meteor.users.update({
			_id:data.id
		}, {
			$set:{
				'emails.0.address': data.email,
				'username': data.name
			}
		});
	},
	deleteUser: function(id){
    Houston._admins.remove({user_id: id});
    if (Houston._admins.find().count() === 1) {
      Houston._admins.remove({exits: true});
    }
    Meteor.users.remove(id);
  }
});
