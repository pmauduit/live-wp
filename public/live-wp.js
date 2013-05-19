var map = {};
var current_marker = null;

update_changesets = function() {
  d = new Date();

  $.getJSON("./api/changes", function(response) {
    $.each(response, function(index,value) {
      lat = value["location"]["latitude"];
      lon = value["location"]["longitude"];

      if ((lat !== undefined) && (lon !== undefined)) {
        map.setView([lat, lon], 14);
        if (current_marker != null) {
          map.removeLayer(current_marker);
        }
      current_marker = L.marker([lat, lon]);
      current_marker.addTo(map);
      console.log(value);
      }

    });
  });



}


// on ready
$(function() {
  // setting up leaflet / map
  map = L.map('map').setView([46.6, 0.], 7);
  L.tileLayer('http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  // hooking the "blah" link - testing purposes
  $('#manual-upd').click(function() { update_changesets(); });
});
