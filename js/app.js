$(document).ready(function() {

  var po = org.polymaps;

  var map = po.map()
  .container(document.getElementById("map").appendChild(po.svg("svg")))
  .add(po.interact())
  .add(po.hash());

  var tileUrl = "http://{S}tile.cloudmade.com/3ed7d953543745549ec8036186c45f80/37159/256/{Z}/{X}/{Y}.png";

  map.add(po.image()
          .url(po.url(tileUrl)
          .hosts(["a.", "b.", "c.", ""])));

  map.add(po.compass().pan("none"));

  var places2geojson = function(places) {
    var geojson = _.chain(places)
      .filter(function(el) {
        return el.me === true;
      })
      .map(function(el, i, list) {
        return {
          geometry: {
            coordinates: [el.lng, el.lat],
            type: "Point"
          },
          properties: {
            from: el.from,
            network: el.network,
            at: el.at
          }
        };
      }).value();
    return geojson;
  };

  var addTitle = po.stylist().title(function(d){
    return d.properties.from;});

  var client = new APIClient();
  // get some places
  client.getJSON('/Me/places', {limit: 2000}, function(places) {
    console.log(places.length);
    var points = places2geojson(places);
    console.log(points.length);
    map.add(po.geoJson().features(points).on('load',addTitle));
  });

});

