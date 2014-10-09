var map;
var geocoder;
var markers = [];
var unactiveMarker = {
    url: '../static/images/green_marker.png',
    scaledSize: new google.maps.Size(20, 32)
};

var activeMarker = {
    url: '../static/images/red_marker.png',
    scaledSize: new google.maps.Size(25, 40)
};

function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    } else {
        return undefined;
    }
}

function collectMarkers() {
    var marker;
    var blocks = document.getElementsByClassName('saved');

    for (i = 0; i < blocks.length; i++) {
        block = blocks[i];
        marker = block.children[1].innerHTML;
        if (marker !== 'None') {
            markers.push({
                block: block,
                marker: marker
            });
        }
    }
}

function initialize() {
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
        zoom: 14
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    for (var i=0; i < markers.length; ++i) {
        var position = JSON.parse(
                markers[i].marker.replace("u'k'", '"k"').replace("u'B'", '"B"')
                );
        var place = new google.maps.LatLng(position.k, position.B);
        markers[i].marker = placeMarker(place);

        (function (i) {
            google.maps.event.addListener(markers[i].marker, 'click', function() {
                map.setZoom(15);
                map.setCenter(markers[i].marker.getPosition());
            });
            google.maps.event.addListener(markers[i].marker, 'mouseover', function() {
                markers[i].block.classList.add('active_marker_block');
            });
            google.maps.event.addListener(markers[i].marker, 'mouseout', function() {
                markers[i].block.classList.remove('active_marker_block');
            });
        })(i);
    }

    // bounds for all markers to bee seen on the map.
    var bounds = new google.maps.LatLngBounds();
    for (i=0; i < markers.length; i++) {
        bounds.extend(markers[i].marker.getPosition());
    }
    map.fitBounds(bounds);
}


function placeMarker(place) {
    var marker = new google.maps.Marker({
        position: place,
        map: map,
        icon: unactiveMarker
    });
    return marker;
}


function centerMap(pos) {
    map.setCenter(pos);
}

function addHoverListenersToBlocks() {
    for (var i = 0; i < markers.length; i++) {
        ( function (i) {
            markers[i].block.addEventListener('mouseover', function(){
                markers[i].marker.setIcon(activeMarker);
            }, 'false');
            markers[i].block.addEventListener('mouseout', function() {
                markers[i].marker.setIcon(unactiveMarker);
            }, 'false');
        })(i);
    }
}

function likeObjectsArray () {
    var likes = [].slice.call(
            document.getElementsByClassName('like_picture')
        );
    likes.push(document.getElementById('like_story'));
    return likes.map(formObjectToLike);
}

function formObjectToLike(element) {
    var objToLike = {},
        children = element.childNodes;
    for (var i = 0; i < children.length; i++) {
        if (children[i].className === "likes_count") {
            objToLike.likesCount = children[i];
        }
        else if (children[i].tagName === 'A') {
            objToLike.url = children[i].getAttribute("href");
            objToLike.likeLink = children[i];
        }
    }
    return objToLike;
}

function addClickListenersToLikes(likes) {
    for (var i = 0; i < likes.length; i++) {
        ( function (i) {
            likes[i].likeLink.addEventListener('click', function(e){
                e.preventDefault();
                likeRequest(likes[i]);
            }, 'false');
        })(i);
    }
}

/*
* Sends like POST request to picture or story url with id of that item.
* When the response is returned adds 'liked' class to the corresponding heart.
* objToLike should have the following properties: url, element that contains
* like count and link element to which class "liked" should be added.
* */
function likeRequest(objToLike) {
    function showNewLike() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var likesCount = xhr.responseText;
            objToLike.likesCount.innerHTML = likesCount;
            objToLike.likeLink.classList.add("liked");
        }
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', objToLike.url);
    xhr.onreadystatechange = showNewLike;
    xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
    xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
    xhr.send();
}

window.onload = function() {

    collectMarkers();

    var likes = likeObjectsArray();
    addClickListenersToLikes(likes);
    addHoverListenersToBlocks();
};

google.maps.event.addDomListener(window, 'load', initialize);

