var UNACTIVE_MARKER_WIDTH = 20,
    UNACTIVE_MARKER_HEIGHT = 32,
    ACTIVE_MARKER_WIDTH = 25,
    ACTIVE_MARKER_HEIGHT = 40,
    ZOOM_INITIAL = 14,
    ZOOM_ON_MARKER = 15,
    UNACTIVE_ICON = {
        url: '../static/images/green_marker.png',
        scaledSize: new google.maps.Size(
                UNACTIVE_MARKER_WIDTH,
                UNACTIVE_MARKER_HEIGHT)
    },

    ACTIVE_ICON = {
        url: '../static/images/red_marker.png',
        scaledSize: new google.maps.Size(
                ACTIVE_MARKER_WIDTH,
                ACTIVE_MARKER_HEIGHT)
    };

    ARTIFACT_ICON_SMALL = {
        url: '../static/images/artifact_marker.png',
        scaledSize: new google.maps.Size(
                UNACTIVE_MARKER_WIDTH,
                UNACTIVE_MARKER_HEIGHT)
    };
    ARTIFACT_ICON_BIG = {
        url: '../static/images/artifact_marker.png',
        scaledSize: new google.maps.Size(
                ACTIVE_MARKER_WIDTH,
                ACTIVE_MARKER_HEIGHT)
    };

/**
 * Sets the map zoom so that all the markers are visible.
 *
 * @param map - google map
 * @param {Array} markers - markers that should be visible on map
 *
 */
function setBounds(map, markers) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
        if(markers[i]){
            bounds.extend(markers[i].getPosition());
        }
    }
    map.fitBounds(bounds);
}

/**
 * If location of the user cannot be identified centers map on
 * L'viv city center.
 * @param map - google map
 * @param {boolean} errorFlag - false if browser doesn't support geolocation,
 * true otherwise.
 */
function handleNoGeolocation(map, errorFlag) {
    var content;
    if (errorFlag) {
        content = 'Error: The Geolocation service failed.';
    } else {
        content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
        map: map,
        position: new google.maps.LatLng(49.839754, 24.029846),
        content: content
    };
    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
}


/**
 * Centers map on current position. If cannot do that calls
 * handleNoGeolocation function.
 * @param map - google map.
 */
function centerOnCurrPos (map) {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);

            var infowindow = new google.maps.InfoWindow({
                map: map,
                position: pos,
                content: "I'm here"
            });

            map.setCenter(pos);
        }, function() {
            handleNoGeolocation(map, true);
        });
    } else {
        // browser doesn't support geolocation
        handleNoGeolocation(map, false);
    }
}

/**
 * Adds drawing manager to goolge map.
 */
function addDrawingManager(map) {
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingControlOptions: {
            drawingModes: [
                google.maps.drawing.OverlayType.POLYLINE
            ]
        }
    });
    drawingManager.setMap(map);
}
