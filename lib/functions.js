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
      currentImg = '<a href="http://www.sandiegofoodbank.org/" target="_blank"><img src="/SDFB.Color.Logo.PNG.png" style="width: 70px;"/></a>';
    } else if (marker.orgID.toUpperCase() === "FASD") {
      currentImg='<a href="http://feedingamericasd.org/" target="_blank"><img src="/FASD.Logo.CMYK.jpg" style="width: 70px;"/></a>';
    } else if(marker.orgID.toUpperCase() === "BOTH"){
      currentImg='<a href="http://www.sandiegofoodbank.org/" target="_blank"><img src="/SDFB.Color.Logo.PNG.png" style="width: 70px; margin-bottom: 5px;"/></a><br><a href="http://feedingamericasd.org/" target="_blank"><img src="/FASD.Logo.CMYK.jpg" style="width: 70px; float: right;"/></a>';
    }
  }

  var urlInfo = '';
  if (marker.webURL) {
    urlInfo='<br><small><a href="'+marker.webURL+'">' + name + '\'s Website</a></small>';
  }

  return new google.maps.InfoWindow({
    content: // bad code, bad practice, bad person
      '<span class="infoWindowTitle">' + ((marker.url) && (marker.url !== "TBD") ? '<a href="' + document.url + '" target="_blank">' + marker.name + '</a>' : marker.name) + '</span>' +
      '<span style="float: right;">' + currentImg + "</span><br><br>" +
      '<span style="vertical-align: top"><small>' + marker.foods + '</small><br>' +
      '<small>' + marker.hours + '</small>'+
      urlInfo +
      '</span>'
      + '<br><input id="getdirections" type="button" value="Get Directions" class="btn btn-default btn-xs" onclick="getDirections(\''+ marker.street + " " + marker.city + " " + marker.zipCode +'\')"/>'
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

var rad = function(x) {
  return x * Math.PI / 180;
};

getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter

  var dLat = rad(p2.lat() - p1.lat());
  var dLong = rad(p2.lng() - p1.lng());
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d / 1609.34; // returns the distance in meter
};

getDirections = function(marker){
  var url = "https://www.google.com/maps/dir/" + "Current+Location" + "/" + marker;
  openInNewTab(url);
}

size = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}
