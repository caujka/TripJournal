window.onload = function() {
    add_markers();
}

var map;
var geocoder;
var markers = [];

function add_markers() {
    var marker;
    var blocks = document.getElementsByClassName('saved');

    for (i = 0; i < blocks.length; i++) {
        block = blocks[i];
        marker = block.children[1].innerHTML;
        appendBlockMarker(marker);
    }
}

function appendBlockMarker(marker) {
    markers.push(marker);
}

function initialize() {
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
        zoom: 14
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
                var pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);
                map.setCenter(pos);
            },
            function() {
                handleNoGeolocation(true);
            });
    } else {
        // browser doesn't support geolocation
        heNoGeolocation(false);
    }

    for (var i = 0; i < markers.length; ++i) {
        var position = JSON.parse(markers[i].replace("u'k'", '"k"').replace("u'B'", '"B"'));
        var location = new google.maps.LatLng(position.k, position.B);
	placeMarker(location);
	map.setCenter(location);
    }
}


function placeMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
}
google.maps.event.addDomListener(window, 'load', initialize);

function centerMap(pos) {
    map.setCenter(pos);
}
