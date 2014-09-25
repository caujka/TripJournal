var number = 1,
    Blocks = [],
    BlockTypes = [],
    Images = [];

function deleteImagesFromBlock(blockNumber){
    for (var i=0; i < Images.length; ++i){
        if (Images[i].block === blockNumber){
            Images.splice(i, 1);
        }
    }
}

function swapImagesFromBlock(blockNumber1, blockNumber2){
    for (var i=0;i<Images.length; ++i){
        if(Images[i].block === blockNumber1) {
            Images[i].block = blockNumber2;
        }
        else if (Images[i].block === blockNumber2) {
            Images[i].block = blockNumber1;
        }
    }
}

function addImagesFromTemp(){
    var i;
    for(i=0; i < Images.length; ++i){
        if (Images[i].state === 'temp') {
            Images[i].state = 'loaded';
            Images[i].block = number;
        }
    }
}

function appendBlock(story, blockContent, block_type) {
    var container = document.createElement("div"),
        keybar = document.createElement("div"),
        buttons = [
            ['top', 'moveup'],
            ['bottom', 'movedown'],
            ['edit', 'editBlock'],
            ['delete', 'deleteBlock']
        ];

    function create_button(button_name_and_func) {
        var button_name = button_name_and_func[0],
            button_func = button_name_and_func[1],
            button = document.createElement("button");
        button.setAttribute('onClick', button_func + "('" + number + "')");
        button.id = button_name;
        keybar.appendChild(button);
    }

    container.setAttribute(
        'onMouseOver',
        "change_button_visibility('" + number + "', \"visible\")"
    );
    container.setAttribute(
        'onMouseOut',
        "change_button_visibility('" + number + "', \"hidden\")"
    );
    container.id = "block_" + number;
    container.className = "block_story";

    container.innerHTML =
        '<div contenteditable="true" id="contentarea_' + number + '">' +
        blockContent +
        '</div>';

    keybar.id = "keybar_" + number;
    keybar.className = "key_panel";

    buttons.forEach(create_button);

    container.appendChild(keybar);
    story.appendChild(container);

    Blocks.push(number);
    BlockTypes.push(block_type);
	if (block_type == 'img') {
        addImagesFromTemp(number);
    }
    number++;
}

function deleteBlock(itemstr) {
    var item = parseInt(itemstr),
        poss = Blocks.indexOf(item),
        block = document.getElementById("block_" + Blocks[poss]);
    block.parentNode.removeChild(block);
    Blocks.splice(poss, 1);
    BlockTypes.splice(poss, 1);
    deleteImagesFromBlock(item);
}


function move_block(itemstr, direction) {
    // direction (-1) - up, (+1) - down
    var item = parseInt(itemstr),
        block = document.getElementById('contentarea_' + item),
        poss = Blocks.indexOf(item);
    if ((poss + direction) in Blocks) {
        var blockprev = document.getElementById('contentarea_' + (Blocks[poss + direction])),
            prevconen = blockprev.innerHTML,
            block_type = BlockTypes[poss];
        blockprev.innerHTML = block.innerHTML;
        block.innerHTML = prevconen;
        BlockTypes[poss] = BlockTypes[poss + direction];
        BlockTypes[poss + direction] = block_type;
        swapImagesFromBlock(Blocks[poss + direction], Blocks[poss]);
    }
}

function moveup(itemstr) {
    move_block(itemstr, -1);
}

function movedown(itemstr) {
    move_block(itemstr, 1);
}

function change_button_visibility(itemstr, visibility) {
    var item = parseInt(itemstr);
    document.getElementById('keybar_' + item).style.visibility = visibility;
}

function delete_img(id) {
    if (id) {
        var div = document.getElementById(id);
        div.parentNode.removeChild(div);
    }
}

function escape_html_tags(str) {
    return str.replace(/>/g, '&gt;').replace(/</g, '&lt;');
}

function text_block_template(text) {
    return (
        '<p class="description_story">' +
        text + '</p>'
    );
}

function img_block_template(src, img_id) {
    return (
        '<img src="' + src + '"class="image_story">' +
        '<p style="display:none;">' + img_id + '</p>'
    );
}

function add_saved_blocks() {
    var i, block, block_text, block_type,
        blocks = document.getElementsByClassName('saved'),
        blocks_num = blocks.length,
        story_content = document.getElementById('story_content');
    for (i=0; i < blocks_num; i++) {
        block = blocks[0];
        block_type = block.classList[1];
        if (block_type === 'text') {
            block_text = text_block_template(block.children[0].innerHTML);
        } else if (block_type === 'img') {
            block_text = img_block_template(
                block.children[0].innerHTML,
                block.children[1].innerHTML
            );
        }
        block.parentNode.removeChild(block);
        appendBlock(story_content, block_text, block_type);
    }
}

window.onload = function() {

    var story_cont = document.getElementById('story_content'),
        photo_cont = document.getElementById('photo_cont'),
        comment_t = document.getElementById('add_comment_t'),
        treasure_t = document.getElementById('add_treasure_t'),
        //comment_p = document.getElementById('add_comment_p'),
        //treasure_p = document.getElementById('add_treasure_p'),
        textarea = document.getElementById('textarea'),
        text = document.getElementById('added_text'),
        photo = document.getElementById('added_image'),
        video = document.getElementById('added_video'),
        text_panel = document.getElementById('text_panel'),
        photo_panel = document.getElementById('photo_panel'),
        video_panel = document.getElementById('video_panel'),
        title = document.getElementById('title'),

        fileSelect = document.getElementById('type_file');
        form = document.getElementById('file-form'),
        upload=document.getElementById('publish'),
        uploadButton = document.getElementById('upload-button'),
        filesget = fileSelect.files,
        formData = new FormData(),
        arr = [],
        file = document.getElementById('type_file');


    function clearImagesFromTemp() {
	    var poss = 0;
	    while (true) {
	        if (poss == Images.length) {
		    break;
	        }
	        if (Images[poss].state === 'temp') {
		        Images.splice(poss, 1);
		        continue;
	        }
	    poss++;
	    }
    }

    function clear() {
        var arr_1 = document.getElementsByClassName('add_block'),
            arr_2 = document.getElementsByClassName('hide'),
            arr_3 = document.getElementsByClassName('clear_cont'),
            i;

        for (i = 0; i < arr_1.length; i++) {
            arr_1[i].style.background = "url(\"../static/images/plus-sign_2.png\") 35px 35px no-repeat #83a054";
        }
        for (i = 0; i < arr_2.length; i++) {
            arr_2[i].style.display = 'none';
        }
        for (i = 0; i < arr_3.length; i++) {
            arr_3[i].value = '';
            arr_3[i].style.display = 'none';
        }
        textarea.value = '';
        photo_cont.innerHTML = '';
        photo_cont.style.display = 'none';
        clearImagesFromTemp();
    }

    function save_text_story() {
        story_cont.style.display = 'block';
        var text = escape_html_tags(textarea.value),
            content = text_block_template(text);
        appendBlock(story_cont, content, "text");
        clear();

    }

    function save_photo_story() {
        var i,
            arr = document.getElementsByClassName(number),
            content = '';
        story_cont.style.display = 'block';
        for (i = 0; i < arr.length; i++) {
            content += img_block_template(arr[i].src);
        }
        appendBlock(story_cont, content, "img");
        clear();
    }

    function add_img() {
        var i, URL, imageUrl, id, file, imageData,
            files = fileSelect.files;
        if (files.length > 0) {
            for (i = 0; i < files.length; i++) {
                file = files[i];
                if (!file.type.match('image.*')) {
                    continue;
                }
                imageData = {image : file, state : 'temp', block : -1};
                Images.push(imageData);
                URL = window.URL;
                if (URL) {
                    imageUrl = URL.createObjectURL(files[i]);
                    id = 'story_' + number + '_' + files[i].name.substr(0, files[i].name.indexOf('.'));
                    document.getElementById('photo_cont').innerHTML +=
                    '<div id="' + id + '" class="img_block">' +
                    '<img src="' + imageUrl + '" class="img_story ' + number + '">' +
                    '<button onclick="delete_img(\'' + id + '\')" id="' + id + '_d" class="button_3">x</button>' +
                    '</div>';
                }
            }
        document.getElementById('photo_cont').style.display = 'inline-block';
        }
    }

    add_saved_blocks();

    textarea.onkeypress = function(e) {
        if (e.keyCode === 13) {
            save_text_story();
            return false;
        }
    };

	form.onsubmit = function(event) {
        event.preventDefault();
        uploadButton.innerHTML = 'Uploading...';
    };


    text.onclick = function() {
        clear();
        this.style.background = '#8ed41f';
        text_panel.style.display = 'block';
        document.getElementById('textarea').focus();
    };

    photo.onclick = function() {
        clear();
        this.style.background = '#8ed41f';
        photo_panel.style.display = 'block';
    };

    video.onclick = function() {
        clear();
        this.style.background = '#8ed41f';
        video_panel.style.display = 'block';
    };

    fileSelect.onchange = add_img;

    if (!document.getElementById('story_title').textContent) {
        document.getElementById('title_panel').style.display = 'block';
        title.focus();
        document.getElementById('add_title').onclick = function() {
            document.getElementById('story_title').innerHTML = (
                escape_html_tags(title.value)
            );
            document.getElementById('story_content').style.display = 'block';
            clear();
        };
    }
    if (story_cont.children.length > 1 ||
            document.getElementById('story_title').textContent) {
        story_content.style.display = 'block';
    }
    document.getElementById('add_panel').style.display = 'block';
    document.getElementById('publish_panel').style.display = 'block';

    // document.getElementById('type_file').onchange = add_img;
    document.getElementById('adds_block_t').onclick = save_text_story;
    document.getElementById('clear_block_t').onclick = clear;
    document.getElementById('adds_block_p').onclick = save_photo_story;
    document.getElementById('clear_block_p').onclick = clear;

    document.getElementById('comment_but_t').onclick = function() {
        comment_t.style.display = 'inline-block';
        comment_t.focus();
    };
    document.getElementById('treasure_but_t').onclick = function() {
        treasure_t.style.display = 'inline-block';
        treasure_t.focus();
    };
};


function delete_img(id) {
    if(id) {
        var div = document.getElementById(id);
        div.parentNode.removeChild(div);
    }
}

//Volodya
var geocoder;
var markersArray = [];
function initialize() {
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
    zoom: 14
};
    map = new google.maps.Map(document.getElementById('map-canvas'),
							  mapOptions);
    google.maps.event.addListener(map, 'click', function(event) {
    	placeMarker(event.latLng);
});

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
      handleNoGeolocation(true);
    });
  } else {
    // browser doesn't support geolocation
    heNoGeolocation(false);
  }
  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingControlOptions: {
      drawingModes: [
        google.maps.drawing.OverlayType.POLYLINE
      ]
    },

  });
  drawingManager.setMap(map);
}
$ = jQuery;
function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(49.839754, 24.029846),
    content: content
  };
  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}

// Add a marker to the map and push to the array.
function placeMarker(location) {

    //Get last added textarea id
    var textboxes;
    textboxes = document.getElementsByClassName('key_panel');
    last_element = textboxes[textboxes.length-1]
    var bar_id='#'+last_element.id;

    //check if there is already any button assigned to textarea div block
    if (last_element.innerHTML.search('Marker') !== -1) {
        alert('Only one marker rep one textarea')
    } else {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    //add marker in markers array
    markersArray.push(marker);
    i = markersArray.length - 1;
    jQuery(bar_id).append('<button onclick="centerMap(' + i + '); return false;">Marker</button>');
    jQuery(bar_id).append('<button onclick="delMarkCompl(' + i + '); return false;">Remove</button>');
    //jQuery(bar_id).append('<button onclick="delMarkCompl('i'); return false;">Remove</button>');
    }
    //var markerButton = document.createElement("button");
    //	markerButton.setAttribute('onClick', "centerMap(' + i + '); return false;");
    //	markerButton.id = "buu";
    //	document.getElementById("#keybar_"+number).append(markerButton);
    //var markerButton = document.getElementsByClassName("key_panel");
    //<button onclick="centerMap(' + i + '); return false;">Marker</button>
    //var keybar = document.createElement("div");
	//keybar.id="keybar_"+number;
	//keybar.className="key_panel"

}

// Add a marker to the map and push to the array.
function delMarkCompl(element, i) {
    //find marker

    //delete marker
    //removeMark(i);
    //delete buttons

}

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setAllMap(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markersArray = [];
}

function codeAddress() {
  var address = document.getElementById('address').value;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
      } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

google.maps.event.addDomListener(window, 'load', initialize);
	function centerMap(i) {
        map.setCenter(markersArray[i].getPosition());
	}

google.maps.event.addDomListener(window, 'load', initialize);
    function removeMark(i) {
        markersArray[i].setMap(null);
        markersArray.splice(i, 1);
         // Func to delete one marker from map
         //alert('remove mark func')       
    }