var map = {};
var current_marker = null;
var changesets = [];

update_location = function(lat, lon) {
  map.setView([lat, lon], 14);
  if (current_marker != null) {
    map.removeLayer(current_marker);
  }
  current_marker = L.marker([lat, lon]);
  current_marker.addTo(map);
}

fill_changesets_list = function() {
  $.each(changesets, function(index, value) {
    // add entry to the changesets
    hour_str = value.timestamp.substr(11,8);
    elem_str = "<li id="+value.id+"><strong>" + hour_str + ": " + value.title +
    "</strong>, par <i>" + value.user + " ("+value["location"]["city_name"] +")</i>" +
    "<pre>" + value.comment +"</pre></li>";
  $('#changesets-listing').append(elem_str);

  });
}

consume_changesets_list = function() {
  $.each(changesets, function(index, value) {
   setTimeout(function() {
     lat = value["location"]["latitude"];
     lon = value["location"]["longitude"];
     update_location(lat, lon);
     $("#changesets-listing > li").css("background-color", "#fff");
     $("#" + value.id).css("background-color", "#4fcd4f");
   }, 4000 * index);
  });
}

update_changesets = function() {
  d = new Date();

  $.getJSON("./api/changes", function(response) {
    $('#changesets-listing').empty();
    changesets = [];

    $.each(response, function(index,value) {
      lat = value["location"]["latitude"];
      lon = value["location"]["longitude"];

      if ((lat !== undefined) && (lon !== undefined)) {
        value["id"] = "chngst-" + index;
        changesets.push(value);
      }
    });
    fill_changesets_list();
    consume_changesets_list();
  });
}

about_close = function() {
  $('#about').toggle();
}
// on ready
$(function() {
  // setting up leaflet / map
  map = L.map('map').setView([46.6, 0.], 7);
  L.tileLayer('http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    attribution: '<a href="#" id="a-about">A propos de ce site</a> - &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

  $('#a-about').click(function() { $('#about').toggle(); });

  // First call
  update_changesets();
  // Then sets the timer to regularly call it (every 30secs)
  setInterval(update_changesets, 30000);
});
