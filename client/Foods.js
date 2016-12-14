Template.Foods.events({
  'click':function(e){
    if (e.target.type ==='checkbox') {
      console.log(e);
      var a =e.target.getAttribute('data-type');
      if(a==='produce'|a==='canned'|a==='bread'|a==='cooked'|a==='snacks'|a==='government'|a==='boxed'|a==='dairy'|a==='produce2'|a==='storeDonations'){
        a='foods.'+ a
      }
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
