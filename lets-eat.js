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
      //console.log("OVER_QUERY_LIMIT, address: " + address);
      setTimeout(function() {
        //Meteor.call('Geocode', address, name, foods, hours);
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
              console.log("else");
              var marker = new google.maps.Marker({
                draggable: false,
                animation: google.maps.Animation.DROP,
                position: new google.maps.LatLng(Markers.findOne(document._id).latitude, Markers.findOne(document._id).longitude),
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

              markers[document._id] = marker;
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
  updateDB = function(){
    Markers.find({ //for default 15
      latitude: undefined
    }).forEach(function(obj){
      var address = obj.street + ", " + obj.city + ", " + obj.state + " " + obj.zipCode;
      var geo = new GeoCoder();
      var result = geo.geocode(address);
      Markers.update({_id : obj._id},{$set: {latitude : result[0].latitude, longitude : result[0].longitude}});
      console.log("Lat: " + result[0].latitude + " Lon: " + result[0].longitude);
      Meteor._sleepForMs(200);
    });

    Markers.find({ //check for entries from admin panel
      latitude: 0
    }).forEach(function(obj){
      var address = obj.street + ", " + obj.city + ", " + obj.state + " " + obj.zipCode;
      var geo = new GeoCoder();
      var result = geo.geocode(address);
      Markers.update({_id : obj._id},{$set: {latitude : result[0].latitude, longitude : result[0].longitude}});
      console.log("Lat: " + result[0].latitude + " Lon: " + result[0].longitude);
      Meteor._sleepForMs(200);
    });
  }



  if(Markers.find().count()===0){
    Markers.insert({
      name:"Food Program Name",
      street:"Street Address",
      city:"City ",
      state:"CA",
      zipCode:"Zip Code",
      foods:"Foods Typically Available",
      hours:"Day(s)/Time",
      orgID:"San Diego Food Bank Partner (for internal use for ancillary donor map)"
    });
    Markers.insert({
      name:"Teen Challenge",
      street:"5450 Lea Street",
      city:"San Diego",
      state:"CA",
      zipCode:"92105",
      foods:"20-30 lbs of fresh produce per household",
      hours:"2nd Monday of each month from 9:00 am until the food is gone",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"LGBT Community Center",
      street:"3909 Centre Street",
      city:"San Diego",
      state:"CA",
      zipCode:"92103",
      foods:"20-30 lbs of fresh produce per household",
      hours:"9:00 AM",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"South Bay Pentecostal",
      street:"395 D Street",
      city:"Chula Vista",
      state:"CA",
      zipCode:"91910",
      foods:"20-30 lbs of fresh produce per household",
      hours:"9:00 AM",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Teen Challenge",
      street:"5450 Lea Street",
      city:"San Diego",
      state:"CA",
      zipCode:"92105",
      foods:"20-30 lbs of fresh produce per household",
      hours:"9:00 AM",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Hearts & Hands Working Together",
      street:"2020 Alaquinas Drive",
      city:"San Ysidro",
      state:"CA",
      zipCode:"92173",
      foods:"20-30 lbs of fresh produce per household",
      hours:"9:00 AM",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Journey Community Church",
      street:"8363 Center Drive",
      city:"Ste 6C",
      state:"CA",
      zipCode:"La Mesa",
      foods:"9:00 AM",
      hours:"2nd Friday of each month from 9:00 am until food is gone",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"St. Stephen's of COGIC",
      street:"5825 Imperial Avenue",
      city:"San Diego",
      state:"CA",
      zipCode:"92114",
      foods:"20-30 lbs of fresh produce per household",
      hours:"9:00 AM",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Vista Spanish SDA Church",
      street:"254 West Indian Rock",
      city:"Vista",
      state:"CA",
      zipCode:"92083",
      foods:"20-30 lbs of fresh produce per household",
      hours:"2:00 PM",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"El Cajon 7th Day Adventist Church",
      street:"1630 East Madison Avenue",
      city:"El Cajon",
      state:"CA",
      zipCode:"92019",
      foods:"20-30 lbs of fresh produce per household",
      hours:"4:00 PM",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Military Outreach Ministry",
      street:"2624 Santa Margarita Road",
      city:"Oceanside",
      state:"CA",
      zipCode:"92058",
      foods:"20-30 lbs of fresh produce per household",
      hours:"10:00 AM",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Heaven's Windows",
      street:"2300 Bancroft Drive",
      city:"Spring Valley",
      state:"CA",
      zipCode:"91977",
      foods:"20-30 lbs of fresh produce per household",
      hours:"9:00 AM",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Fallbrook Food Pantry",
      street:"221 North Pico Avenue",
      city:"Fallbrook",
      state:"CA",
      zipCode:"92028",
      foods:"20-30 lbs of fresh produce per household",
      hours:"10:00 AM",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Bread of Life",
      street:"1919 Apple Street",
      city:"Oceanside",
      state:"CA",
      zipCode:"92054",
      foods:"20-30 lbs of fresh produce per household",
      hours:"3:00 PM",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Samoa Independent",
      street:"2055 Skyline Drive",
      city:"Lemon Grove",
      state:"CA",
      zipCode:"91945",
      foods:"20-30 lbs of fresh produce per household",
      hours:"9:00 AM",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Heaven's Windows",
      street:"2300 Bancroft Drive",
      city:"Spring Valley",
      state:"CA",
      zipCode:"91977",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Monday through Friday from 9:00 am - 12:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Good News Baptist Church",
      street:" 416 Swift Avenue",
      city:"San Diego",
      state:"CA",
      zipCode:"92104",
      foods:"CSFP Commodities - canned & packaged goods",
      hours:"2nd Wednesday of each month from 10:30 am - 12:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"SDFB Back Country  Boulevard",
      street:"39605 Old Highway 80",
      city:"Boulevard",
      state:"CA",
      zipCode:"91905",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"2nd Monday of each month from 10:00 am - 11:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Salvation Army - Campo",
      street:"376 Sheridan Rd",
      city:"Campo",
      state:"CA",
      zipCode:"91905",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Wednesday after 2nd Monday of the month from 12:00 pm - 12:30 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Salvation Army - Lake Morena",
      street:"29801 Oak Drive",
      city:"Lake Morena",
      state:"CA",
      zipCode:"91906",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Wednesday after 2nd Monday of the month from 1:00 pm - 1:30 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Lutheran Social Services of SoCal - Project Hand",
      street:"580 Hilltop Drive",
      city:"Chula Vista",
      state:"CA",
      zipCode:"91910",
      foods:" Wednesday",
      hours:"Monday",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Congregational Tower",
      street:"288 F Street",
      city:"Chula Vista",
      state:"CA",
      zipCode:"91910",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Wednesdays and Fridays from 9:00 am - 11:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Oxford Terrace Apartments",
      street:"555 Oxford St.",
      city:"Chula Vista",
      state:"CA",
      zipCode:"91911",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"2nd Friday of the month from 9:00 am until food is gone",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"South Bay Community Services",
      street:"333 Oxford Street",
      city:"Chula Vista",
      state:"CA",
      zipCode:"91911",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Tuesdays and Thursdaysfrom 9:00 am - 12:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Salvation Army - Guatay",
      street:"27521 Old Hwy 80",
      city:"Guatay",
      state:"CA",
      zipCode:"91931",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Wednesday after 2nd Monday of the month from 10:00 am - 10:30 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Imperial Beach United Methodist Church",
      street:"455 Palm Ave",
      city:"Imperial Beach",
      state:"CA",
      zipCode:"91932",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Tuesday and Thursday from 9:00 am - 11:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"SDFB Back Country Jacumba",
      street:"44681 Old Highway 80",
      city:"Jacumba",
      state:"CA",
      zipCode:"91933",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"2nd Monday of each month from 1:00 pm - 2:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Home Start/La Mesa",
      street:"4370 Parks Ave",
      city:"La Mesa",
      state:"CA",
      zipCode:"91941",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Tuesday of each month from 9:30 am - 11:30 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"La Mesa SDA Community Church",
      street:"4207 Spring Gardens  RD",
      city:"La Mesa",
      state:"CA",
      zipCode:"91941",
      foods:" Tuesday",
      hours:"Monday",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Samoa Independent Full Gospel",
      street:"2055 Skyline Dr",
      city:"Lemon Grove",
      state:"CA",
      zipCode:"91945",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"1st Friday of each month from 9:00 am - 11:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Community Food Bank of National City",
      street:"2605 Highland Avenue",
      city:"National City",
      state:"CA",
      zipCode:"91950",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"2nd Friday of each month from 9:00 am - 11:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"First Christian Church of National City",
      street:"1800 E. 17th Street",
      city:"National City",
      state:"CA",
      zipCode:"91950",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Every Friday of the month from 9:00 am - 10:30 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"National City Collaborative-Euclid",
      street:"2325 Euclid Ave.",
      city:"National City",
      state:"CA",
      zipCode:"91950",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Every Monday and Friday from 1:00 pm - 5:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"TBD",
      street:"National City",
      city:"91950",
      state:"CA",
      zipCode:"Calculated from mapping zip code",
      foods:" and Thursday from 8:00 am - 12:00 pm",
      hours:"  Wednesday",
      orgID:"National City Collaborative-18"
    });
    Markers.insert({
      name:"Salvation Army - Pine Valley",
      street:"28989 Old Hwy 80",
      city:"Pine Valley",
      state:"CA",
      zipCode:"91962",
      foods:" Wednesday and Friday from 8:00 am - 4:00 pm",
      hours:"Monday",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Salvation Army - Pine Valley",
      street:"28940 Old Hwy 80",
      city:"Pine Valley",
      state:"CA",
      zipCode:"91962",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Wednesday after 2nd Monday of the month from 9:00 am - 9:30 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"TBD",
      street:"Potrero",
      city:"91963",
      state:"CA",
      zipCode:"Calculated from mapping zip code",
      foods:" occasional meat and fresh produce",
      hours:"EFAP Commodities - canned & packaged goods",
      orgID:"Potrero Community  Center Foundation"
    });
    Markers.insert({
      name:"San Martin de Porres Apt. MAAC",
      street:"9119 Jamacha Rd.",
      city:"Spring Valley",
      state:"CA",
      zipCode:"91977",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Tuesday of each month from 3:00 pm - 5:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Spring Valley Community Church",
      street:"9255 Lamar St",
      city:"Spring Valley",
      state:"CA",
      zipCode:"91977",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Tuesday of each month from 3:00 pm - 4:30 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Stepping Higher Inc.",
      street:"2778 Sweetwater Springs Blvd",
      city:"Spring Valley",
      state:"CA",
      zipCode:"91977",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Every Tuesday from 9:00 am - 11:00 am; Every Thursday and Friday from 1:00 pm - 3:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Heaven's Windows",
      street:"2300 Bancroft Dr",
      city:"Spring Valley",
      state:"CA",
      zipCode:"91977",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Monday through Friday from 9:00 am - 12:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"St Barnabas Episcopal Church",
      street:"2680 Country Club Dr.",
      city:"Borrego Springs",
      state:"CA",
      zipCode:"92004",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Monday before 3rd Tuesday of each month from 2:00 pm - 4:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Pilgrim United Church of Christ",
      street:"2020 Chestnut Ave",
      city:"Carlsbad",
      state:"CA",
      zipCode:"92008",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Tuesday of each month from 1:00 pm - 2:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Christian Credit Counselors",
      street:"5838 Edison Pl # 200",
      city:"Carlsbad",
      state:"CA",
      zipCode:"92008",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Monday through Friday from 8:00 am - 4:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Laurel Tree Apartments",
      street:"1307 Laurel Tree Lane",
      city:"Carlsbad",
      state:"CA",
      zipCode:"92011",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Tuesday of each month from 3:00 pm - 5:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Crisis House",
      street:"1034 North Magnolia",
      city:"El Cajon",
      state:"CA",
      zipCode:"92020",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Monday through Friday from 8:30 am - 11:15 am; Every Monday and Friday from 1:00 pm - 3:30 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Salvation Army - El Cajon",
      street:"1011 East Main St.",
      city:"El Cajon",
      state:"CA",
      zipCode:"92020",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Wednesday after 3rd Tuesday of the month from 9:30 am until food is gone",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Heartland  Community a Foursquare Church",
      street:"1012 East Bradley Ave",
      city:"El Cajon",
      state:"CA",
      zipCode:"92021",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Tuesday of each month from 9:30 am - 12:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"St John's Church",
      street:"1001 Encintas Blvd.",
      city:"Encinitas",
      state:"CA",
      zipCode:"92024",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Tuesday of each month from 12:30 pm until food is gone",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Community Resource Center",
      street:"656 Second St.",
      city:"Encinitas",
      state:"CA",
      zipCode:"92024",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Monday through Thursday from 8:00 am - 5:00 pm; Every Fridayfrom 8:00 am - 1:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"North County Church of Christ",
      street:"130 Woodward Ave.",
      city:"Escondido",
      state:"CA",
      zipCode:"92025",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Tuesday of each month from 4:00 pm - 6:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Fallbrook Food Pantry",
      street:"1042 South Mission Rd",
      city:"Fallbrook",
      state:"CA",
      zipCode:"92028",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd week of the Month (Monday- Friday) from 9:30 am - 12:30 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Shelter Valley Citizens Corp",
      street:"7217 Great Southern Overland Trial",
      city:"Julian",
      state:"CA",
      zipCode:"92036",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Tuesday of the month from 8:00 am until food is gone",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Villa Lakeshore Apts",
      street:"12606 Lakeshore Dr",
      city:"Lakeside",
      state:"CA",
      zipCode:"92040",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Tuesday of the month from 10:00 am until food is gone",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Lakeside Christian Helps Center",
      street:"9931 Channel Rd",
      city:"Lakeside",
      state:"CA",
      zipCode:"92040",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Monday through Friday from 10:00 am - 12:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Brother Benno Foundation",
      street:"3260 Production Av. ",
      city:"Oceanside",
      state:"CA",
      zipCode:"92054",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Monday through Friday from 6:30 am - 12:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Salvation Army - Oceanside",
      street:"3935 Lake Blvd",
      city:"Oceanside",
      state:"CA",
      zipCode:"92056",
      foods:" Wednesday",
      hours:"Every Monday",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"The Community Food Connection",
      street:"14047 Twin Peaks Road",
      city:"Poway",
      state:"CA",
      zipCode:"92064",
      foods:" Wednesday",
      hours:"Every Monday",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Ramona Food & Clothes Closet Inc",
      street:"773 Main St",
      city:"Ramona",
      state:"CA",
      zipCode:"92065",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Monday through Friday from 9:30 am - 12:30 pm and 2:30 pm - 4:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"In His Steps Christian  Home",
      street:"1619 La Brea Ave.",
      city:"Ramona",
      state:"CA",
      zipCode:"92065",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Wednesday after 3rd Tuesday of each month from 8:00 am - 11:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Palomar Korean Church",
      street:"170 Bosstick Blvd",
      city:"San Marcos",
      state:"CA",
      zipCode:"92069",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Tuesday of each month from 12:00 pm - 3:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"TBD",
      street:"Santee",
      city:"92071",
      state:"CA",
      zipCode:"Calculated from mapping zip code",
      foods:" occasional meat and fresh produce",
      hours:"EFAP Commodities - canned & packaged goods",
      orgID:"Santee Food Bank"
    });
    Markers.insert({
      name:"North Coast Fellowship",
      street:"940 Genevieve Street",
      city:"Solana Beach",
      state:"CA",
      zipCode:"92075",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Tuesday of each month from 4:30 pm - 7:30 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Serving & Sharing Foundation",
      street:"31020 Cole Grade Rd",
      city:"Valley Center",
      state:"CA",
      zipCode:"92082",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Fourth Saturday of each month from 12:30 pm - 2:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Vista Spanish SDA",
      street:"254 West Indian Rock",
      city:"Vista",
      state:"CA",
      zipCode:"92083",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Monday of each month from 2:00 pm until food is gone",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Catholic Charities  Vista",
      street:"917 East Vista Way",
      city:"Vista",
      state:"CA",
      zipCode:"92084",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Tuesday through Friday from 9:00 am - 12:00 pm and 1:00 pm - 4:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Warner Springs Community Resource Ctr",
      street:"30951 Hwy 79",
      city:"Warner Springs",
      state:"CA",
      zipCode:"92086",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"3rd Tuesday of each month from 8:00 am - 12:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Ladle Fellowship",
      street:"320 Date Street",
      city:"San Diego",
      state:"CA",
      zipCode:"92101",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"2nd Saturday of each monthfrom 8:30 am - 10:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Catholic Charities Downtown",
      street:"349 Cedar Street",
      city:"San Diego",
      state:"CA",
      zipCode:"92101",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Monday through Friday from 9:00 am - 12:00 pm and 1:00 pm - 4:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Sherman Heights Community Ctr.",
      street:"2258 Island Ave.",
      city:"San Diego",
      state:"CA",
      zipCode:"92102",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"1st Friday of each month from 9:00 am - 11:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"St Paul  United Methodist Church of San Diego",
      street:"3094 L St",
      city:"San Diego",
      state:"CA",
      zipCode:"92102",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Every Thursday from 1:30 pm - 3:30 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Metro Chollas View",
      street:"906 North 47th St",
      city:"San Diego",
      state:"CA",
      zipCode:"92102",
      foods:" Wednesday",
      hours:"Every Wednesday and Friday from 10:00 am - 12:00 pm; Every Monday",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"S D Broadway Spanish SDA",
      street:"2411 Broadway St",
      city:"San Diego",
      state:"CA",
      zipCode:"92102",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Saturday after 1st Friday of the month from 3:00 pm - 6:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Being Alive",
      street:"1051 University Ave",
      city:"San Diego",
      state:"CA",
      zipCode:"92103",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"1st Friday of each month from 9:00 am - 12:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Good News Baptist Church",
      street:"4106 Swift Av",
      city:"San Diego",
      state:"CA",
      zipCode:"92104",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"1st Friday of each month from 9:00 am - 11:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"The Church of Nazarene in Mid City",
      street:"4101 University Ave",
      city:"San Diego",
      state:"CA",
      zipCode:"92105",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"1st Saturday of each month from 9:00 am - 11:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"New Hope SDA Church",
      street:"2420 52nd Street",
      city:"San Diego",
      state:"CA",
      zipCode:"92105",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"1st Friday of each month from 9:00 am - 11:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"TBD",
      street:"San Diego",
      city:"92105",
      state:"CA",
      zipCode:"Calculated from mapping zip code",
      foods:" occasional meat and fresh produce",
      hours:"EFAP Commodities - canned & packaged goods",
      orgID:"President John Adams Manor Apt. MAAC"
    });
    Markers.insert({
      name:"St Agnes Church",
      street:"1145 Evergreen St",
      city:"San Diego",
      state:"CA",
      zipCode:"92106",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"4th Thursday of each month from 9:00 am until food is gone",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Unions United",
      street:"TBD",
      city:"3737 Camino del Rio South #106",
      state:"CA",
      zipCode:"San Diego",
      foods:"Monday through Friday from 8:00 am - 12:00 pm and 1:00 pm - 4:30 pm",
      hours:"Calculated from mapping zip code",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Bayside Community Center",
      street:"2202 Comstock St.",
      city:"San Diego",
      state:"CA",
      zipCode:"92111",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Tuesday from 12:00 pm - 2:00 pm; Thursday from 10:00 am - 12:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Greater Victory Baptist Church",
      street:"1045 So. 29 St",
      city:"San Diego",
      state:"CA",
      zipCode:"92113",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Tuesday and Thursday from 2:00 pm - 4:00 pm; Wednesday from 9:00 am - 11:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"TBD",
      street:"San Diego",
      city:"92113",
      state:"CA",
      zipCode:"Calculated from mapping zip code",
      foods:" occasional meat and fresh produce",
      hours:"EFAP Commodities - canned & packaged goods",
      orgID:"Mercado Apartments MAAC"
    });
    Markers.insert({
      name:"Christian Fellowship Church",
      street:"1601 Kelton Rd",
      city:"San Diego",
      state:"CA",
      zipCode:"92114",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"1st Friday of each month from 9:00 am until food is gone         ",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Catholic Charities-College Area",
      street:"6360 El Cajon Blvd.",
      city:" Suite B",
      state:"CA",
      zipCode:" ",
      foods:"Calculated from mapping zip code",
      hours:"92115",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Grace Church",
      street:"4637 Oregon St",
      city:"San Diego",
      state:"CA",
      zipCode:"92116",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Every Wednesday from 6:00 pm - 8:00 pm; Every Saturday from 9:00 am - 11:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Community Christian  Service Agency",
      street:"4167 Rappahannock Av",
      city:"San Diego",
      state:"CA",
      zipCode:"92117",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Monday through Friday from 9:30 am - 3:30 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Ascension Lutheran Church",
      street:"5106 Zion Ave",
      city:"San Diego",
      state:"CA",
      zipCode:"92120",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"1st Friday of each month from 9:00 am until food is gone         ",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Mt Moriah Christian Church",
      street:"7055 Carrol Rd",
      city:"San Diego",
      state:"CA",
      zipCode:"92121",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Every Tuesday and Thursday from 4:00 pm - 5:00 pm; Every Saturday from 9:00 am - 11:00 am          ",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"S D Armed Services YMCA",
      street:"3293 Santo Rd",
      city:"San Diego",
      state:"CA",
      zipCode:"92124",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"4th Thursday of each month from 10:00 am - 12:00 pm",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Casa Del Sol",
      street:"1157 30th Street",
      city:"San Diego",
      state:"CA",
      zipCode:"92154",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"2nd Friday of each month from 9:00 am until food is gone",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Nestor Methodist Church",
      street:"1120 Nestor Way",
      city:"Nestor",
      state:"CA",
      zipCode:"92154",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"2nd Friday of each month from 8:00 am until food is gone",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"TBD",
      street:"Nestor",
      city:"92154",
      state:"CA",
      zipCode:"Calculated from mapping zip code",
      foods:" occasional meat and fresh produce",
      hours:"EFAP Commodities - canned & packaged goods",
      orgID:"Metro Good Neighbor"
    });
    Markers.insert({
      name:"Hearts & Hands Working Together",
      street:"455 Sycamore Rd",
      city:"San Ysidro",
      state:"CA",
      zipCode:"92173",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"2nd Friday of each month from 8:00 am - 11:00 am",
      orgID:"SDFB"
    });
    Markers.insert({
      name:"Hearts & Hands Working Together",
      street:"663 E San Ysidro Blvd",
      city:"San Ysidro",
      state:"CA",
      zipCode:"92173",
      foods:"EFAP Commodities - canned & packaged goods",
      hours:"Monday through Friday from 5:00 pm - 6:30 pm",
      orgID:"SDFB"
    });
    updateDB();
  }
}
