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
      mapControls,
      isPlaying,
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

  $('#map').click(function(e) {
    hideExcept();
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

  /*** Playback ***/
  //TODO: Clean up needed
  $('#play-button').click(function(e) {

    // hide app controls
    $('#moment-drawer').fadeOut();
    $('#controls').fadeOut();

    // disable map interactivity
    map.remove(mapControls);

    // set map to default view
    map.center({lat: '32.00180605938799', lon: '-99.5679175'}).zoom(3);
    console.log(map.extent());

    // play the moments

    var moment = 0;
    var len = timeline.length;

    var title = $('#playback-title');
    var slider = $('#slider');

    title.parent().delay(500);

    var play = function() {
      if (moment < len) {
        // set title and subtitle
        title.html(timeline[moment].momentText);
        $('#playback-month').html(timeline[moment].month);

        // adjusting the slider changes which points are displayed
        slider.slider('value', months.indexOf(timeline[moment].monthId));

        // jquery animation queue for playing the moments
        title.parent().queue('fx', function() {
          panMap(timeline[moment].bbox);
          $(this).dequeue();
        });
        title.parent().fadeIn(600);
        title.parent().delay(2000);
        title.parent().fadeOut(600);
        title.parent().delay(2000);
        title.parent().queue('fx', function() {
          moment++;
          play();
          $(this).dequeue();
        });
      } else {
        // after the play loop reset the interface
        // show app controls
        $('#moment-drawer').fadeIn();
        $('#controls').fadeIn();

        // enable map interactivity
        map.add(mapControls);

      }
    };
    play();
  });


  /*** Map ***/

  // initialize the map
  map = po.map()
  .container(document.getElementById("map").appendChild(po.svg("svg")));

  mapControls = po.interact();
  map.add(mapControls);

  map.center({lat: '32.00180605938799', lon: '-99.5679175'}).zoom(3);

  tileUrl = "http://{S}tile.cloudmade.com/3ed7d953543745549ec8036186c45f80/37159/256/{Z}/{X}/{Y}.png";

  map.add(po.image()
          .url(po.url(tileUrl)
          .hosts(["a.", "b.", "c.", ""])));

  panMap = function(bbox) {
    Fly(map, bbox);
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


  /*** Application Crome and Intial load ***/

  // Modal window
  $('.modal').modal({backdrop:false});

  // New Moment tooltip
  $('#new-moment').tooltip({
      placement:'left',
      title: 'Capture a Moment',
      trigger: 'hover'
  });


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
