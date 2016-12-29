Template.locationsModalTemplate.helpers({
	locationID: function() {return Session.get('locationID');},

	location: function() { return Markers.findOne({ _id: Session.get('locationID') }); },

	hasFood: function(food) {
		return (food ? "checked" : "");
	}
});


Template.locationsModalTemplate.events({
	'click #save': function(e) {

		e.preventDefault();
		var locationID = Session.get('locationID');

		//TODO: handle the food checkboxes
		console.log( "produce:" );
		console.log( $('#produce').prop('checked') );

		//TODO: geocode

		var location = {
			name: $('#name').val(),
			street: $('#street').val(),
			//TODO: other fields go here
			foods: {
				produce: $('#produce').prop('checked')
				//TODO other food types go here
			}
		}

		console.log(location);

		if (!locationID)
		{
			console.log('new location...');
			Meteor.call('addLocation', location, function(error,result) {
				if (error) { alert(error); }
			});
		} else {
			console.log('edit location ' + locationID);
			_.extend(location, {id: locationID});
			Meteor.call('editLocation', location, function(error,result){
				if (error){ alert(error); }
			});
		}

		$('#locationsModal').modal('hide');

	},

	'click #delete': function(e) {
		var id = Session.get('locationID');
		Meteor.call('deleteLocation', id, function(error,result){
			if (error) { alert(error) }
		});
		$('#locationsModal').modal('hide');
	}

});