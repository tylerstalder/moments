$(document).ready(function() {

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
});
