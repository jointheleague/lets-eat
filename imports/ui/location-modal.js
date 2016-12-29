import toastr from 'toastr';
import 'toastr/build/toastr.css';

toastr.options = {
	"closeButton": false,
	"debug": false,
	"newestOnTop": false,
	"progressBar": false,
	"positionClass": "toast-top-right",
	"preventDuplicates": false,
	"onclick": null,
	"showDuration": "300",
	"hideDuration": "1000",
	"timeOut": "5000",
	"extendedTimeOut": "1000",
	"showEasing": "swing",
	"hideEasing": "linear",
	"showMethod": "fadeIn",
	"hideMethod": "fadeOut"
}


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
			Meteor.call('addLocation', location, function(error,result) {
				if (error) { alert(error); }
			});
		} else {
			_.extend(location, {id: locationID});
			Meteor.call('editLocation', location, function(error,result){
				if (error){ alert(error); }
			});
		}

		$('#locationsModal').modal('hide');

		toastr.info('Your changes were saved');

	},

	'click #delete': function(e) {
		var id = Session.get('locationID');
		Meteor.call('deleteLocation', id, function(error,result){
			if (error) { alert(error) }
		});
		$('#locationsModal').modal('hide');
		toastr.info('The location was deleted');
	}

});