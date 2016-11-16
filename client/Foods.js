Template.Foods.events({
});
Template.registerHelper("LocationsIteration", function() {
  result = [];
  Markers.find().forEach(function(marker) {
    result.push(marker);
  });
  return result;
});
