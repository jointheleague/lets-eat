Template.usersDash.events({
	'click #add': function(e) {
		e.preventDefault();
		Session.set('locationID', '' );
		document.getElementById('locationsForm').reset();
		$('#usersModal').modal('show');
	}
});

Template.usersDash.events({
	'click #edit': function(e) {
		e.preventDefault();
		var locationID = $(e.target).data("id");
		Session.set('locationID', locationID );

		$('#usersModal').modal('show');
	}
});
