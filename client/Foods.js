Template.Foods.events({
  'click':function(e){
    console.log(e);
    console.log(e.target);
  }
});
Template.registerHelper("LocationsIteration", function() {
  result = [];
  Markers.find().forEach(function(marker) {
    result.push(marker);
  });
  return result;
});
