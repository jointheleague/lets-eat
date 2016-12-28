import Tabular from 'meteor/aldeed:tabular';
import { Template } from 'meteor/templating';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';

var markersDataTable = new Tabular.Table({
	name: "Locations",
	collection: Markers,
	columns: [
		{data: "name", title: "Name"}
	]
});

if (Meteor.isClient)
{
	Template.registerHelper('Tables', {
		markers: markersDataTable //from data-table-config
	});

}

