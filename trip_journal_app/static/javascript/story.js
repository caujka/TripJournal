var map;
var geocoder;

function BlockAndMarker (blockElement) {
    var self = this;

    function coordinatesFromBlock(block) {
        return new google.maps.LatLng(block.dataset.lat, block.dataset.lng);
    }

    self.block = blockElement;
    if (self.block.classList[1] === 'text' || self.block.classList[1] === 'img') {
        self.marker = new google.maps.Marker({
            position: coordinatesFromBlock(blockElement),
            map: map,
            icon: UNACTIVE_ICON
        });
    }else if (this.block.classList[1] === 'artifact'){
        self.marker = new google.maps.Marker({
            position: coordinatesFromBlock(blockElement),
            map: map,
            icon: ARTIFACT_ICON_SMALL
        });
    }

    // event listeners for blocks
    self.block.addEventListener('mouseover', function(){
        self.showActive('marker');
    }, 'false');

    self.block.addEventListener('mouseout', function() {
        self.showUnactive();
    }, 'false');

    // event listeners for markers
    google.maps.event.addListener(self.marker, 'click', function() {
        map.setZoom(ZOOM_ON_MARKER);
        map.setCenter(self.marker.getPosition());
    });
    google.maps.event.addListener(self.marker, 'mouseover', function() {
        self.showActive('block');
    });
    google.maps.event.addListener(self.marker, 'mouseout', function() {
        self.showUnactive();
    });
}

BlockAndMarker.prototype = {
    constructor: BlockAndMarker,

    showActive: function (centerOn) {
        if (this.block.classList[1] === 'text' || this.block.classList[1] === 'img') {
            this.block.classList.add('active_marker_block');
            this.marker.setIcon(ACTIVE_ICON);
            console.log(this.block.classList);
            if (centerOn === 'marker') {
                map.setZoom(ZOOM_INITIAL);
                map.panTo(this.marker.getPosition());
            } else if (centerOn === 'block') {
                scrollToElement(this.block);
            }
        }else if (this.block.classList[1] === 'artifact'){
            this.block.classList.add('active_marker_block');
            this.marker.setIcon(ARTIFACT_ICON_BIG);
            console.log(this.block.classList);
            if (centerOn === 'marker') {
                map.setZoom(ZOOM_INITIAL);
                map.panTo(this.marker.getPosition());
            } else if (centerOn === 'block') {
                scrollToElement(this.block);
            }
        }
    },

    showUnactive: function () {
        if (this.block.classList[1] === 'text' || this.block.classList[1] === 'img') {
            this.block.classList.remove('active_marker_block');
            this.marker.setIcon(UNACTIVE_ICON);
        } else if (this.block.classList[1] === 'artifact'){
            this.block.classList.remove('active_marker_block');
            this.marker.setIcon(ARTIFACT_ICON_SMALL);
        }
    }
};

function ObjectToLike(element) {
    var self = this;
    this.likesCount = getInsideElement(element, 'className', 'likes_count');
    this.likeLink = getInsideElement(element, 'tagName', 'A');
    this.url = this.likeLink.getAttribute('href');
    this.likeLink.addEventListener('click', function(e){
        e.preventDefault();
        self.likeRequest();
    }, 'false');
}

ObjectToLike.prototype = {
    constructor: ObjectToLike,

    likeRequest: function () {
        var self = this;
        function showNewLike() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                self.likesCount.innerHTML = xhr.responseText;
                self.likeLink.classList.toggle("liked");
            }
        }
        var xhr = new XMLHttpRequest();
        xhr.open('POST', self.url);
        xhr.onreadystatechange = showNewLike;
        xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
        xhr.send();
    }
};

function initialize() {
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
        zoom: ZOOM_INITIAL
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var markers = collectMarkers();
    if (markers.length === 0) {
        centerOnCurrPos(map);
        return;
    }

    // bounds for all the markers to be seen on the map.
    setBounds(map, markers.map(function (obj) {return obj.marker;}));
}

function collectMarkers() {
    var blocks = [].filter.call(
            document.getElementsByClassName('saved'), function(block) {
                return block.dataset.hasOwnProperty('lat');
            }
        );
    return blocks.map(function(block) {
        return new BlockAndMarker(block);
    });
}

function collectlikeObjects () {
    var likes = [].slice.call(
            document.getElementsByClassName('like_picture')
        );
    likes.push(document.getElementById('like_story'));
    return likes.map(function (element) {
        return new ObjectToLike(element);
    });
}

google.maps.event.addDomListener(window, 'load', initialize);

//makes subscription or unsubscribe
function subscribe_or_unsubscribe() {
    var button = document.getElementsByClassName("subscribe-btn")[0];
    var url = button.getAttribute("value");
    var params = "";
    if (button.classList.contains("unsubscribe")) {
        params += "&action=unsubscribe"
    } else {
        params += "&action=subscribe"
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
                button.classList.toggle("unsubscribe")
            }
    };
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
    xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
    xhr.send(params);
};

window.onload = function() {
    collectlikeObjects();
};