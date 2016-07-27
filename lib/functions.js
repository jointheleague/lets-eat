updateDB = function(){
  console.log("Geocoding...")
  Markers.find({ //for default 15
    latitude: undefined
  }).forEach(function(obj){
    var address = obj.street + ", " + obj.city + ", " + obj.state + " " + obj.zipCode;
    var geo = new GeoCoder();
    var result = geo.geocode(address);
    Markers.update({_id : obj._id},{$set: {latitude : result[0].latitude, longitude : result[0].longitude}});
    Meteor._sleepForMs(200);
  });
  console.log("Geocoding finished.")
}

updateFromAdmin = function(){
  Markers.find({ //for locations added at the admin panel
    latitude: 0
  }).forEach(function(obj){
    var address = obj.street + ", " + obj.city + ", " + obj.state + " " + obj.zipCode;
    var geo = new GeoCoder();
    var result = geo.geocode(address);
    Markers.update({_id : obj._id},{$set: {latitude : result[0].latitude, longitude : result[0].longitude}});
    Meteor._sleepForMs(200);
  });
}

getInfoWindow = function(marker) {
  var currentImg = "";
  if(marker.orgID) {
    if (marker.orgID.toUpperCase() === "SDFB") {
      currentImg = '<img src="/SDFB.Color.Logo.PNG.png" style="width: 70px;"/>';
    } else if (marker.orgID.toUpperCase() === "FASD") {
      currentImg='<img src="/FASD.Logo.CMYK.jpg" style="width: 70px;"/>';
    } else if(marker.orgID.toUpperCase() === "BOTH"){
      currentImg='<img src="/SDFB.Color.Logo.PNG.png" style="width: 70px; margin-bottom: 5px;"/><br><img src="/FASD.Logo.CMYK.jpg" style="width: 70px; float: right;"/>';
    }
  }

  var urlInfo = '';
  if (marker.webURL) {
    urlInfo='<br><small><a href="'+marker.webURL+'">' + name + '\'s Website</a></small>';
  }

  return new google.maps.InfoWindow({
    content:
      '<span class="infoWindowTitle">' + ((marker.url) && (marker.url !== "TBD") ? '<a href="' + document.url + '" target="_blank">' + marker.name + '</a>' : marker.name) + '</span>' +
      '<span style="float: right;">' + currentImg + "</span><br>" +
      '<span style="vertical-align: top"><small><u>Foods Available:</u> ' + marker.foods + '</small><br>' +
      '<small><u>Hours of Operation:</u> ' + marker.hours + '</small><br>'+
      '<small><u>Holiday Closures:</u> ' + marker.closures + '</small><br>'+
      '<small><u>Documents Needed:</u> ' + marker.documents + '</small><br>'+
      '<small><u>Eligibility:</u> ' + marker.eligibility + '</small><br><br>'+
      '<small>' + marker.street + ", " + marker.city + ", " + marker.zipCode + '</small><br>'+
      '<small><a href="tel:' + marker.phone + '">' + marker.phone + '</a></small><br>'+
      urlInfo +
      '</span>'
      + '<input id="getdirections" type="button" value="Get Directions" onclick="getDirections(\''+ marker.street + " " + marker.city + " " + marker.zipCode +'\')"/>'
  });
}

getUsers = function(){
  result = [];
  Meteor.users.find().forEach(function(user) {
    result.push({
      email: user.emails[0].address,
      id: user._id
    });
  });
  return result;
}

getDirections = function(marker){
  var url = "https://www.google.com/maps/dir/" + "Current+Location" + "/" + marker;
  openInNewTab(url);
}

function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}
