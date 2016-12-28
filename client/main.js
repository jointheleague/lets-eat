import '/imports/startup/client';



import Tabular from 'meteor/aldeed:tabular';
import { Template } from 'meteor/templating';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';

console.log('Tablur.Table...');
var myTable = new Tabular.Table({
	name: "Locations",
	collection: Markers,
	columns: [
		{data: "name", title: "Name"}
	]
});

Template.registerHelper('Tables', {
  myTable: myTable
});
