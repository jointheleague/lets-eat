Template.Foods.events({
  'click':function(e){
    if (e.target.type ==='checkbox') {
      console.log(e);
      var a ='foods.'+ e.target.getAttribute('data-type');
      var b = e.target.getAttribute('data-id');
      var c = e.target.checked;
      var data = {
        id:b,
        type:a,
        checked:c
      };
      Meteor.call("updateFoods",data);
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
