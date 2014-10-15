var map;
var geocoder;

function BlockAndMarker (blockElement) {
    var self = this;

    function coordinatesFromBlock(block) {
        return new google.maps.LatLng(block.dataset.lat, block.dataset.lng);
    }

    self.block = blockElement;
    self.marker = new google.maps.Marker({
        position: coordinatesFromBlock(blockElement),
        map: map,
        icon: self.unactiveIcon
    });

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
    unactiveIcon: {
        url: '../static/images/green_marker.png',
        scaledSize: new google.maps.Size(
                UNACTIVE_MARKER_WIDTH,
                UNACTIVE_MARKER_HEIGHT)
    },

    activeIcon: {
        url: '../static/images/red_marker.png',
        scaledSize: new google.maps.Size(
                ACTIVE_MARKER_WIDTH,
                ACTIVE_MARKER_HEIGHT)
    },

    showActive: function (centerOn) {
        this.block.classList.add('active_marker_block');
        this.marker.setIcon(this.activeIcon);
        if (centerOn === 'marker') {
            map.setZoom(14);
            map.panTo(this.marker.getPosition());
        } else if (centerOn === 'block') {
            scrollToElement(this.block);
        }
    },

    showUnactive: function () {
        this.block.classList.remove('active_marker_block');
        this.marker.setIcon(this.unactiveIcon);
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

window.onload = function() {
    collectlikeObjects();
};

