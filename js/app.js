$(document).ready(function() {
  var po = org.polymaps;

  var map,
      timeline = [],
      tileUrl,
      place2geojson,
      currentLayer = {},
      placesByMonth,
      months,
      addTitle,
      replaceLayer,
      processData,
      client = new APIClient(),
      panMap,
      prettyMonth;

  /*** Timeline ***/

  // new moment handler
  $('#new-moment').parent().click(function(e) {
    // create new instance
    var newMoment = Object.create(Moment);

    // Current month values
    var monthId = months[$("#slider").slider('value')];
    var currentMonth = prettyMonth(monthId);

    // Identity counter
    var nextIndex = timeline.length;

    // Setup the moment and attaches all the events
    newMoment.init(nextIndex, monthId, currentMonth);

    // Store the current map view
    newMoment.setGeo(map.extent());

    timeline.push(newMoment);

    // Only show the new moment popover
    newMoment.show();
    hideExcept(newMoment.id);

    // set the state back for this moment
    // this only allows 1 popup at a time
    $(newMoment.$el).on('show', function(e, moment) {
      hideExcept(moment.id);
      map.extent(moment.bbox);
      $('#slider').slider('value', months.indexOf(moment.monthId));
    });
  });

  // Hides all the moments except for index it's passed
  hideExcept = function(i) {
    _.each(timeline, function(el) {
      if (i !== el.id) el.hide();
    });
  };

  // date utils come from jQuery UI's calendar picker
  prettyMonth = function(monthKey) {
    var yymm = parseInt(monthKey, 10) + 1;
    var date = $.datepicker.parseDate('yymmdd', yymm + '01');
    return $.datepicker.formatDate("M ''y", date);
  };


  /*** Map ***/

  // initialize the map
  map = po.map()
  .container(document.getElementById("map").appendChild(po.svg("svg")))
  .add(po.interact())
  .add(po.hash());

  tileUrl = "http://{S}tile.cloudmade.com/3ed7d953543745549ec8036186c45f80/37159/256/{Z}/{X}/{Y}.png";

  map.add(po.image()
          .url(po.url(tileUrl)
          .hosts(["a.", "b.", "c.", ""])));

  panMap = function(bbox) { // [s,w,n,e]

    // TODO: don't just use the first one, see if there's one nearby to where we're already looking

    // compute the extent in points, scale factor, and center
    // -- borrowed from map.extent(), thanks Mike
    var bl = map.locationPoint({ lat: bbox[0], lon: bbox[1] }),
    tr = map.locationPoint({ lat: bbox[2], lon: bbox[3] }),
    sizeActual = map.size(),
    k = Math.max((tr.x - bl.x) / sizeActual.x, (bl.y - tr.y) / sizeActual.y),
    l = map.pointLocation({x: (bl.x + tr.x) / 2, y: (bl.y + tr.y) / 2});

    // update the zoom level
    var z = map.zoom() - Math.log(k) / Math.log(2);

    animateCenterZoom(map, l, z);
  };

  // sets title from geojson properties
  addTitle = po.stylist().title(function(d){
    return d.properties.from + ' ' + d.properties.title;
  });

  // replaces current layer with a new array of features
  replaceLayer = function(layer) {
    if (_.has(currentLayer, "map")) {map.remove(currentLayer);}
    currentLayer = po.geoJson().features(layer).on('load',addTitle);
    map.add(currentLayer);
  };


  /*** Data ***/

  processData = function(places) {
    return  _.chain(places)

      // sort by the place date
      .sortBy(function(el) {
        return el.at; })

      // convert the place objects into geojson
      .map(function(el, i, list) {
        return place2geojson(el); })

      // group by the year and month
      .groupBy(function(el){
        var d = new Date(el.properties.at);
        var v = (v = d.getMonth().toString()).length === 2 ? v : '0' + v;
        return d.getFullYear() + v; })

      // return the value of the chain
      .value();
  };

  // converting to a subset of the Geojson standard
  place2geojson = function(place) {
    return {
      geometry: {
        coordinates: [place.lng, place.lat],
        type: "Point"
      },
      properties: {
        from: place.from,
        network: place.network,
        at: place.at,
        title: place.title
      }
    };
  };


  client.getJSON('/query/getPlace?terms=[(me:true)]', {limit: 1000}, function(places) {
    // get some places
    placesByMonth = processData(places);
    months = _.keys(placesByMonth);

    sliderChange = function() {
      return function(event, ui) {
        replaceLayer(placesByMonth[months[ui.value]]);
        var label = prettyMonth(months[ui.value]);
        $('.ui-slider-handle').html(label);
      };
    };

    // set the slider
    $( "#slider" ).slider({
        min: 0,
        max: months.length-1,
        animate: true,
        slide: sliderChange(),
        change: sliderChange()
    });

    // set the slider value after init so that the handle text gets updated
    $("#slider").slider('value', Math.floor((months.length-1)/2));
  });

});
