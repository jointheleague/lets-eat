import Tabular from 'meteor/aldeed:tabular';
import { Template } from 'meteor/templating';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';

var markersDataTable = new Tabular.Table({
	name: "Locations",
	collection: Markers,
	columns: [
		{data: "name", title: "Name"},
		{data: "street", title: "Street"},
		{data: "zipCode", title: "Zip Code"},
		{data: "isActive", title: "Active?", render: function(data,type,row){ return (data ? "Yes": "No") }},
		{data: "_id",render: function(data,type,row){ return '<a href="#" id="edit" data-id="' + data + '" >Edit</a>'  }, orderable: false } //{data: "_id",render: function(data,type,row){ return '<a href="/location/'+ data + '/edit">Edit</a>'  }, orderable: false }
	],
	columnDefs: [
		{"className": "dt-center", "targets": [2,3,4]}
	],
	paging: false,
	scrollY: '75vh'
});
var usersDataTable = new Tabular.Table({
	name: "Users",
	collection: Meteor.users,
	columns:[
		{data: "username", title:"Username"},
		{data: "emails.0.address", title:"Email"}
	],
	columnDefs: [
		{"className": "dt-center", "targets": [2,3,4]}
	],
	paging: false,
	scrollY: '75vh'
})

if (Meteor.isClient)
{
	Template.registerHelper('Tables', {
		markers: markersDataTable
	});

}
