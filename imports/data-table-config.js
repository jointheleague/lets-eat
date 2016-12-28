import Tabular from 'meteor/aldeed:tabular';
import { Template } from 'meteor/templating';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';

console.log('init Tabular.Table...');
new Tabular.Table({
	name: "Locations",
	collection: Markers,
	columns: [
		{data: "name", title: "Name"}
	]
});


