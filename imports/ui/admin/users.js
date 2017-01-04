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
Template.usersDash.events({
	'click #save': function(e) {
		e.preventDefault();
		var locationID = Session.get('locationID');

		//TODO: handle the food checkboxes
		console.log( "produce:" );
		console.log( $('#produce').prop('checked') );
		console.log( "isactive:" );
		console.log( $('#isactive-0').prop('checked') );

		//TODO: geocode

		var location = {
			orgID: 		$('#orgID').val(),
			name: 		$('#name').val(),
			street: 	$('#street').val(),
			city: 	$('#city').val(),
			zipCode: 	$('#zipCode').val(),
			phone: 	$('#phone').val(),
			hours: 	$('#hours').val(),
			closures: 	$('#closures').val(),
			eligibility: 	$('#eligibility').val(),
			eligibilityURL: 	$('#eligibilityURL').val(),
			url: 	$('#url').val(),
			//TODO: lat and long
			isActive: $('#isactive-0').prop('checked'),
			foods: {
				produce: $('#produce').prop('checked'),
				canned: $('#canned').prop('checked'),
				bread: $('#bread').prop('checked'),
				cooked: $('#cooked').prop('checked'),
				snacks: $('#snacks').prop('checked'),
				government: $('#government').prop('checked'),
				boxed: $('#boxed').prop('checked'),
				dairy: $('#dairy').prop('checked'),
				produce2: $('#produce2').prop('checked'),
				storeDonations: $('#storeDonations').prop('checked')
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
