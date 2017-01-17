

updateDB = function(){
  console.log("Geocoding...")
  var geocoded = 0;
  var total = Markers.find().count();
  Markers.find({
    latitude: undefined
  }).forEach(function(obj){
    try {
      var address = obj.street + ", " + obj.city + ", CA " + obj.zipCode;
      var geo = new GeoCoder();
      var result = geo.geocode(address);
      Markers.update({_id : obj._id},{$set: {latitude : result[0].latitude, longitude : result[0].longitude}});
      geocoded = geocoded + 1;
      if(((geocoded * 100)/total) % 10 < 2){
        console.log("Geocode " + ((geocoded * 100)/total) + "%");
      }
      Meteor._sleepForMs(200);
    } catch (e) {
      console.log(e.message);
      console.log(address);
    }
  });
  console.log("Geocoding finished.")
}

updateFromAdmin = function(){
  Markers.find({ //for locations added at the admin panel
    latitude: 0
  }).forEach(function(obj){
		console.log(obj)
    var address = obj.street + ", " + obj.city + ", " + "CA " + obj.zipCode;
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
    '<span class="infoWindowTitle">' + ((marker.url) && (marker.url !== "TBD") ? '<a href="' + document.url + '" target="_blank" class="infowindow"> ' + marker.name + '</a>' : marker.name) + '</span>' +
    '<span class="infowindow" style="float: right;">' + currentImg + "</span><br><br>" +
    '<span class="infowindow" style="vertical-align: top"><small><b>Foods:</b> ' + parseFoods(marker.foods) + '</small><br>' +'<small><b>Hours:</b> ' + marker.hours + '</small>' + urlInfo + '<br><small><b>Phone:</b> '+marker.phone+'</small><br><small><b>Closures:</b> '+marker.closures+'</small><br><small><b>Eligibility:</b> '+(markers.eligibility ? markers.eligibility: 'none') +'</span>'+
    '<br><input id="getdirections" type="button" value="Get Directions" class="btn btn-default btn-xs infowindow" onclick="getDirections(\''+ marker.street + " " + marker.city + " " + marker.zipCode +'\')"/>'
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
}

parseFoods = function(foods) {
  var types = "";
  for(var foodType in foods) {
    if(foods[foodType]) {
      var a = null;
      switch(foodType) {
        case "produce":
          a = "20 to 30 pounds of fresh produce";
          break;
				case "canned":
	        a = "canned and boxed foods";
	        break;
        case "bread":
          a = "bread and pastries";
          break;
				case "cooked":
	        a = "cooked meal";
	        break;
				case "snacks":
	        a = "snacks";
	        break;
        case "government":
          a = "30 pound box of government canned and dry foods with a 2 pound block of cheese";
          break;
				case "boxed":
	        a = "canned and boxed foods with occasional frozen meats,produce, or dairy";
	        break;
        case "dairy":
          a = "dairy";
          break;
				case "produce2":
	        a = "fresh produce";
	        break;
        case "storeDonations":
          a = "grocery store donations (may include meat, dairy, pastries, salads, and more)";
          break;
        default:
          break;
      }
      if(a != null) {
        types += a + ", ";
        a = null;
      }
    }
  }
  return types.substring(0, types.length - 2);
}

function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}
//for debuging in meteor shell
setAllNotActive = function(state){
  Markers.find().forEach(function(doc){
    Markers.update({_id : doc._id},{$set: {isActive: false}});
  });
  console.log("All isActive Set to false");
}
setAllActive = function(state){
  Markers.find().forEach(function(doc){
    Markers.update({_id : doc._id},{$set: {isActive: true}});
  });
  console.log("All isActive Set to true");
}
