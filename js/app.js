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

  var client = new APIClient();
  // get some photos
  client.getJSON('/Me/places', {limit: 10}, function(places) {
    console.log(places);
    map.add(po.geoJson()
            .features([{geometry: {coordinates: [-122.258, 37.805], type: "Point"}}]));
  });

});

