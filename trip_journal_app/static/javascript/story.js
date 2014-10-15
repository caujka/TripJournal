var map;
var geocoder;

function BlockAndMarker (blockElement) {
    var self = this;

    function coordinatesFromBlock(block) {
        var markerElement = getInsideElement(
                block, 'className', 'block_marker'
            );
        var position = JSON.parse(
            markerElement.innerHTML.replace("u'k'", '"k"').replace("u'B'", '"B"')
        );
        return new google.maps.LatLng(position.k, position.B);
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
        map.setZoom(15);
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
        scaledSize: new google.maps.Size(20, 32)
    },

    activeIcon: {
        url: '../static/images/red_marker.png',
        scaledSize: new google.maps.Size(25, 40)
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

function collectMarkers() {
    var markerElement, blockElement,
        markers = [],
        blocks = document.getElementsByClassName('saved');

    for (i = 0; i < blocks.length; i++) {
        blockElement = blocks[i];
        markerElement = getInsideElement(
                blockElement, 'className', 'block_marker'
            ).innerHTML;
        if (markerElement !== 'None') {
            markers.push(new BlockAndMarker(blockElement));
        }
    }
    return markers;
}

function initialize() {
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
        zoom: 14
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var markers = collectMarkers();

    // bounds for all the markers to be seen on the map.
    setBounds(map, markers.map(function (obj) {return obj.marker;}));
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

