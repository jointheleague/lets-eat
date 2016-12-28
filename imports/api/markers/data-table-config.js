import Tabular from 'meteor/aldeed:tabular';
import { Template } from 'meteor/templating';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';

var markersDataTable = new Tabular.Table({
	name: "Locations",
	collection: Markers,
	columns: [
		{data: "name", title: "Name"},
		{data: "_id",render: function(data,type,row){ return '<a href="/location/'+ data + '/edit">Edit</a>'  }, orderable: false }
	],
	paging: false,
	scrollY: '75vh'
});

if (Meteor.isClient)
{
	Template.registerHelper('Tables', {
		markers: markersDataTable
	});

}

