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


Template.usersModal.helpers({
	location: function() {
		var usr = Meteor.users.findOne({ _id: Session.get('clickedUserID')});
		console.log(usr);
		return usr;
	},
	locationID: function() {
		return Session.get('clickedUserID');
	},
	email: function() {
		var usr = Meteor.users.findOne({_id: Session.get('clickedUserID')});
		return usr.emails[0].address;
	},
	newUser: function() {
		if (Meteor.users.findOne({ _id: Session.get('clickedUserID')}) === undefined) {
			console.log(true);
			return true;
		}
		console.log(false);
		return false;

	}

});


Template.usersModal.events({
	'click #save': function(e) {
		e.preventDefault();
		var locationID = Session.get('clickedUserID');
		var data = {
			email: 		$('#email').val(),
			name: 		$('#name').val(),
			pass: $('#pass').val()
		}

		console.log(location);

		if (!locationID)
		{
			Meteor.call('MakeUser', data.email);
		} else {
			_.extend(location, {id: locationID});
			Meteor.call('editUser', location, function(error,result){
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
