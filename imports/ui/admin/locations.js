Template.locationsAdmin.events({
	'click #add': function(e) {
		e.preventDefault();
		Session.set('locationID', '' );
		document.getElementById('locationsForm').reset();
		$('#locationsModal').modal('show');
	}
});

Template.locationsAdmin.events({
	'click #edit': function(e) {
		e.preventDefault();
		var locationID = $(e.target).data("id");
		Session.set('locationID', locationID );

		$('#locationsModal').modal('show');
	}
});
