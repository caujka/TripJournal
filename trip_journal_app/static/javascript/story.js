var map;
var geocoder;
var markers = [];

function BlockAndMarker (blockElement) {
    this.unactiveIcon = {
        url: '../static/images/green_marker.png',
        scaledSize: new google.maps.Size(20, 32)
    };

    this.activeIcon = {
        url: '../static/images/red_marker.png',
        scaledSize: new google.maps.Size(25, 40)
    };

    function coordinatesFromBlock( block ) {
        var markerElement = getInsideElement(
                block, 'className', 'block_marker'
            );
        var position = JSON.parse(
            markerElement.innerHTML.replace("u'k'", '"k"').replace("u'B'", '"B"')
        );
        return new google.maps.LatLng(position.k, position.B);
    }

    this.block = blockElement;
    this.marker = new google.maps.Marker({
        position: coordinatesFromBlock(blockElement),
        map: map,
        icon: this.unactiveIcon
    });

    this.showActive = function (centerOn) {
        this.block.classList.add('active_marker_block');
        this.marker.setIcon(this.activeIcon);
        if (centerOn === 'marker') {
            map.setZoom(14);
            map.panTo(this.marker.getPosition());
        } else if (centerOn === 'block') {
            scrollToElement(this.block);
        }
    };

    this.showUnactive = function () {
        this.block.classList.remove('active_marker_block');
        this.marker.setIcon(this.unactiveIcon);
    };
}

function collectMarkers() {
    var markerElement, blockElement;
    var blocks = document.getElementsByClassName('saved');

    for (i = 0; i < blocks.length; i++) {
        blockElement = blocks[i];
        markerElement = getInsideElement(
                blockElement, 'className', 'block_marker'
            ).innerHTML;
        if (markerElement !== 'None') {
            markers.push(new BlockAndMarker(blockElement));
        }
    }
}

function initialize() {
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
        zoom: 14
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    collectMarkers();

    for (var i=0; i < markers.length; ++i) {
        (function (i) {
            google.maps.event.addListener(markers[i].marker, 'click', function() {
                map.setZoom(15);
                map.setCenter(markers[i].marker.getPosition());
            });
            google.maps.event.addListener(markers[i].marker, 'mouseover', function() {
                markers[i].showActive('block');
            });
            google.maps.event.addListener(markers[i].marker, 'mouseout', function() {
                markers[i].showUnactive();
            });
        })(i);
    }

    // bounds for all the markers to be seen on the map.
    var bounds = new google.maps.LatLngBounds();
    for (i=0; i < markers.length; i++) {
        bounds.extend(markers[i].marker.getPosition());
    }
    map.fitBounds(bounds);
}


function addHoverListenersToBlocks() {
    for (var i = 0; i < markers.length; i++) {
        ( function (i) {
            markers[i].block.addEventListener('mouseover', function(){
                markers[i].showActive('marker');
            }, 'false');
            markers[i].block.addEventListener('mouseout', function() {
                markers[i].showUnactive();
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
    var objToLike = {};
    objToLike.likesCount = getInsideElement(element, 'className', 'likes_count');
    objToLike.likeLink = getInsideElement(element, 'tagName', 'A');
    objToLike.url = objToLike.likeLink.getAttribute('href');
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
            objToLike.likesCount.innerHTML = xhr.responseText;
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

google.maps.event.addDomListener(window, 'load', initialize);

window.onload = function() {
    var likes = likeObjectsArray();
    addClickListenersToLikes(likes);
    addHoverListenersToBlocks();
};

