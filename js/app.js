$(document).ready(function() {
  /*
  var client = new APIClient();
  // get some photos
  client.getJSON('/Me/photos', {limit: 10}, function(photos) {
    console.log('found ' + photos.length + ' photos');
    // add them to the DOM
    for(var i in photos) {
      console.log('photo #' + i, photos[i]);
      $('body').append('<img src="' + photos[i].url + '">');
    }
  });
  */

  var po = org.polymaps;

  var map = po.map()
  .container(document.getElementById("map").appendChild(po.svg("svg")))
  .add(po.interact())
  .add(po.hash());

  map.add(po.image()
          .url(po.url("http://{S}tile.cloudmade.com"
                      + "/3ed7d953543745549ec8036186c45f80"
                      + "/37159/256/{Z}/{X}/{Y}.png")
                      .hosts(["a.", "b.", "c.", ""])));

                      map.add(po.compass()
                              .pan("none"));
});

