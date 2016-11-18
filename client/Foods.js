Template.Foods.events({
  'click':function(e){
    if (e.target.type ==='checkbox') {
      console.log(e);
      var type ='foods.'+ e.target.getAttribute('data-type');
      var id = e.target.getAttribute('data-id');
      var checked = e.target.checked;
      Meteor.call("updateFoods",id,type,checked);
    }
  }
});
Template.registerHelper("LocationsIteration", function() {
  result = [];
  Markers.find().forEach(function(marker) {
    result.push(marker);
  });
  return result;
});
