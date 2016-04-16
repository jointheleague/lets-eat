var handles = [];
['markers'].forEach(function(name){
  var handle = Meteor.subscribe(name, function() {
  });
  handles.push(handle);
});

var markers = function() {
  return Markers.find().fetch().map(function(it){
    return {value: it.name, id: it._id};
  });
};
Template.search.rendered = function() {
  Meteor.typeahead.inject();
};
