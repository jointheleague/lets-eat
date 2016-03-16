var currentOrg;
Router.route('/:org?', function () {
  // render the Home template with a custom data context
  var params = this.params;
  currentOrg = params.org;
  console.log("currentOrg:" + currentOrg);
  this.render('main', {data: {title: 'My Title'}});
});
Markers = new Mongo.Collection('markers');
var currentInfoWindow;
if(Meteor.isServer){
  Meteor.publish("markers", function () {
    return Markers.find();
  });
}


geocode = function(address, name, foods, hours, id){
  var map = GoogleMaps.get('map');
  var geocoder = new google.maps.Geocoder();

  geocoder.geocode( { 'address': address}, function(results, status) {

    if (status == google.maps.GeocoderStatus.OK) {
      var latitude = results[0].geometry.location.lat();
      var longitude = results[0].geometry.location.lng();
      var marker = new google.maps.Marker({
        draggable: false,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(latitude, longitude),
        map: map.instance,
        id: document._id
      });

      var contentString = '<h2>' + name + '</h2><br><small>' + foods + '</small><br><small>' + hours + '</small>';

      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });

      marker.addListener('click', function() {
        if (typeof currentInfoWindow !== 'undefined') {
          currentInfoWindow.close();
        }
        infowindow.open(map.instance, marker);
        currentInfoWindow=infowindow;
      });

      markers[id] = marker;
      console.log("Geocoded: " + name);
      //console.log(id);
      //console.log(markers[id]);
    }
    else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
      setTimeout(function() {
        geocode(address,name,foods,hours);
      }, 200);
    }
    else{
      alert("Error in GeoCode! Status: "+status+" Address: "+ address);
    }
  });
}


if (Meteor.isClient) {

  navigator.geolocation.getCurrentPosition(function(position) {
    Session.set('lat', position.coords.latitude);
    Session.set('lon', position.coords.longitude);
  });

  currentLocations = new Mongo.Collection(null);

  Meteor.subscribe("markers");
  var centerLat = 32.947419;
  var centerLng = -117.239467;
  Template.map.onCreated(function() {
    GoogleMaps.ready('map', function(map) {
      markers = {};

      var myloc = new google.maps.Marker({
        clickable: false,
        icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
        new google.maps.Size(22,22),
        new google.maps.Point(0,18),
        new google.maps.Point(11,11)),
        shadow: null,
        zIndex: 999,
        map: GoogleMaps.get('map').instance,
        position: new google.maps.LatLng(Session.get('lat'), Session.get('lon'))
      });

      map.instance.addListener("bounds_changed", function() {
        console.log('bounds_changed...');
        currentLocations.remove({});
        Markers.find().forEach(function(location) {
          //console.log(location._id);
          //console.log(location.name);
          if(markers[location._id] && map.instance.getBounds().contains(markers[location._id].getPosition())) {
            console.log( location.name + " is visible");
            currentLocations.insert({
              name: location.name,
              street: location.street,
              city: location.city,
              state: location.state,
              zipCode: location.zipCode,
              foods: location.foods,
              hours: location.hours
            });
          }
        });
      });

      Markers.find().observe({
        added: function (document) {
          if(document.orgID===currentOrg||currentOrg===undefined){
            var geocoder = new google.maps.Geocoder();
            var address = document.street + ', ' + document.city + ', ' + document.state + ' ' + document.zipCode;
            //Meteor.call('Geocode', address, document.name, document.foods, document.hours);
            if(Markers.findOne(document._id).latitude == undefined){
              geocode(address, document.name, document.foods, document.hours, document._id);
            }
            else {
              var marker = new google.maps.Marker({
                draggable: false,
                animation: google.maps.Animation.DROP,
                position: new google.maps.LatLng(Markers.findOne(document._id).lat, Markers.findOne(document._id).lon),
                map: map.instance,
                id: document._id
              });
              var contentString = '<h2>' + document.name + '</h2><br><small>' + document.foods + '</small><br><small>' + document.hours + '</small>';

              var infowindow = new google.maps.InfoWindow({
                content: contentString
              });

              marker.addListener('click', function() {
                if (typeof currentInfoWindow !== 'undefined') {
                  currentInfoWindow.close();
                }
                infowindow.open(map.instance, marker);
                currentInfoWindow=infowindow;
              });

              markers[id] = marker;
            }
          }
        },
        changed: function (newDocument, oldDocument) {
          markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
        },
        removed: function (oldDocument) {
          markers[oldDocument._id].setMap(null);
          google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
          delete markers[oldDocument._id];
        }
      });
    });
  });

  Meteor.startup(function() {
    GoogleMaps.load();
  });

  Template.map.helpers({
    mapOptions: function() {
      if (GoogleMaps.loaded()) {
        return {
          center: new google.maps.LatLng(centerLat, centerLng),
          zoom: 8
        };
      }
    }
  });

  Template.registerHelper("currentLocationsIteration", function() {
    result = [];
    //finds all locations by current user id
    currentLocations.find().forEach(function(marker) {
      result.push({
        name: marker.name,
        address: marker.street + ", " + marker.city + ", " + marker.state,
        zipCode: marker.zipCode
      });
      //}
    });
    return result;
  });

  Template.zip.events({
    "click #findZip": function(e){
      var map = GoogleMaps.get('map');
      var geocoder = new google.maps.Geocoder();
      var address = document.getElementById('zipcode').value;
      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var adr = results[0].formatted_address;
          map.instance.panTo(new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
          map.instance.setZoom(12);
        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
      });
    }
  });

}

if (Meteor.isServer) {
  console.log("Server");
  geocode = function(address){
    console.log("I ran");
    try{
      console.log("Im good");
    var geo = new GeoCoder();
    var result = geo.geocode(address);
    Markers.update({_id : document._id},{$set: {latitude : result[0].latitude, longitude : result[0].longitude}});
  }
  catch(err) {
    console.log("Over query")
    setTimeout(function() {
      geocode(address);
    }, 200);
  }

  Markers.find().observe({
    added: function (document) {
      console.log("Observe");
      var address = document.street + ", " + document.city + ", " + document.state + " " + document.zipCode;
      geocode(address);
    }
  });



  if(Markers.find().count()===0){
    Markers.insert({
      name:"Teen Challange",
      street:"5450 Lea Street",
      city:"San Diego",
      state:"CA",
      zipCode:"92105",
      foods:"20-30lb fresh produce per household",
      hours:"2nd Monday of each month from 9AM until food is gone",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"LGBT Community Center",
      street:"3909 Centre Street",
      city:"San Diego",
      state:"CA",
      zipCode:"92103",
      foods:"20-30 lbs of fresh produce per household",
      hours:"1st Tuesday of each month from 9:00 am until food is gone",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"South Bay Pentecostal",
      street:"395 D Street",
      city:"Chula Vista",
      state:"CA",
      zipCode:"91910",
      foods:"20-30 lbs of fresh produce per household",
      hours:"1st Friday of each month from 9:00 am until food is gone",
      orgID:""
    });
    Markers.insert({
      name:"Hearts & Hands Working Together",
      street:"2020 Alaquinas Drive",
      city:"San Ysidro",
      state:"CA",
      zipCode:"92173",
      foods:"20-30 lbs of fresh produce per household",
      hours:"2nd Tuesday of each month from 9:00 am until food is gone"
    });
    Markers.insert({
      name:"Journey Community Church",
      street:"8363 Center Drive, Ste 6C",
      city:"La Mesa",
      state:"CA",
      zipCode:"91942",
      foods:"20-30 lbs of fresh produce per household",
      hours:"2nd Friday of each month from 9:00 am until food is gone"
    });
    Markers.insert({
      name:"St. Stephen's of COGIC",
      street:"5825 Imperial Avenue",
      city:"San Diego",
      state:"CA",
      zipCode:"92114",
      foods:"20-30 lbs of fresh produce per household",
      hours:"3rd Monday of each month from 9:00 am until food is gone"
    });
    Markers.insert({
      name:"Vista Spanish SDA Church",
      street:"254 West Indian Rock",
      city:"Vista",
      state:"CA",
      zipCode:"92083",
      foods:"20-30 lbs of fresh produce per household",
      hours:"3rd Monday of each month from 2:00 pm until food is gone"
    });
    Markers.insert({
      name:"El Cajon 7th Day Adventist Church",
      street:"1630 East Madison Avenue",
      city:"El Cajon",
      state:"CA",
      zipCode:"92019",
      foods:"20-30 lbs of fresh produce per household",
      hours:"3rd Tuesday of each month from 4:00 pm until food is gone"
    });
    Markers.insert({
      name:"Military Outreach Ministry",
      street:"2624 Santa Margarita Road",
      city:"Oceanside",
      state:"CA",
      zipCode:"92058",
      foods:"20-30 lbs of fresh produce per household",
      hours:"3rd Saturday of each month from 10:00 am until food is gone"
    });
    Markers.insert({
      name:"Heaven's Windows",
      street:"2300 Bancroft Drive",
      city:"Spring Valley",
      state:"CA",
      zipCode:"91977",
      foods:"20-30 lbs of fresh produce per household",
      hours:"4th Tuesday of each month from 9:00 am until food is gone"
    });
    Markers.insert({
      name:"Fallbrook Food Pantry",
      street:"221 North Pico Avenue",
      city:"Fallbrook",
      state:"CA",
      zipCode:"92028",
      foods:"20-30 lbs of fresh produce per household",
      hours:"Last Wednesday of each month from 10:00 am until food is gone"
    });
    Markers.insert({
      name:"Bread of Life",
      street:"1919 Apple Street",
      city:"Oceanside",
      state:"CA",
      zipCode:"92054",
      foods:"20-30 lbs of fresh produce per household",
      hours:"Last Thursday of each month from 3:00 pm until food is gone"
    });
    Markers.insert({
      name:"Samoa Independent",
      street:"2055 Skyline Drive",
      city:"Lemon Grove",
      state:"CA",
      zipCode:"91945",
      foods:"20-30 lbs of fresh produce per household",
      hours:"Last Friday of each month from 9:00 am until food is gone"
    });
    Markers.insert({
      name:"SDFB Back Country  Boulevard",
      street:"39605 Old Highway 80",
      city:"Boulevard",
      state:"CA",
      zipCode:"91905",
      foods:"EFAP Commodities - canned & packaged goods, occasional meat and fresh produce",
      hours:"2nd Monday of each month from 10:00 am - 11:00 am"
    });
    Markers.insert({
      name:"Salvation Army - Campo",
      street:"376 Sheridan Rd",
      city:"Campo",
      state:"CA",
      zipCode:"91905",
      foods:"EFAP Commodities - canned & packaged goods, occasional meat and fresh produce",
      hours:"Wednesday after 2nd Monday of the month from 12:00 pm - 12:30 pm"
    });
  }
}
}
