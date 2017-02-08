Template.usersDash.events({
	'click #add': function(e) {
		e.preventDefault();
		Session.set('locationID', '' );
		Session.set('newUser',true);
		document.getElementById('locationsForm').reset();
		$('#usersModal').modal('show');
	}
});

Template.usersDash.events({
	'click #edit': function(e) {
		e.preventDefault();
		var locationID = $(e.target).data("id");
		Session.set('clickedUserID', locationID );
		Session.set('newUser',false);

		$('#usersModal').modal('show');
	}
});
