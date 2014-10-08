window.onload = function() {
    add_markers();

    var likes = likeObjectsArray();
    for (var i = 0; i < likes.length; i++) {
        ( function (i) {
            likes[i].likeLink.addEventListener('click', function(e){
                e.preventDefault();
                likeRequest(likes[i]);
        }, 'false');
        })(i);
    }
}

var map;
var geocoder;
var markers = [];

function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    } else {
        return undefined;
    }
}

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

function likeObjectsArray () {
    var likes = [].slice.call(
            document.getElementsByClassName('like')
        );
    likes.push(document.getElementById('like_story'));
    var likesObjects = [];
    for (var i = 0; i < likes.length; i++) {
        console.log(likes[i]);
        likesObjects.push(formObjectToLike(likes[i]));
    }
    return likesObjects;
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

/*
* Sends like POST request to picture or story url with id of that item.
* When the response is returned adds 'liked' class to corresponding heart.
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
