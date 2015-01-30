var number = 1,
    current_marker = -1,
    temp_positions = [],
    Blocks = [],
    BlockTypes = [],
    BlockMarkers = [],
    Images = [],
    typeOfMarker = 0, // simple marker, 1 - custom marker
    editBlockStatus = 0;

function deleteImagesFromBlock(blockNumber) {
    for (var i=0; i < Images.length; i++) {
        if (Images[i].block === blockNumber) {
            Images.splice(i, 1);
        }
    }
}

function swapImagesFromBlock(blockNumber1, blockNumber2) {
    for (var i=0; i<Images.length; i++) {
        if (Images[i].block === blockNumber1) {
            Images[i].block = blockNumber2;
        }
        else if (Images[i].block === blockNumber2) {
            Images[i].block = blockNumber1;
        }
    }
}

function addImagesFromTemp() {
    var i;
    for(i=0; i < Images.length; i++) {
        if (Images[i].state === 'temp') {
            Images[i].state = 'loaded';
            Images[i].block = number;
        }
    }
}

function appendBlockMarker(marker) {
    if (marker.hasOwnProperty('lat') > 0) {
        temp_positions.push({'block' : current_marker, 'position' : marker});
    }
}

function appendBlock(story, blockContent, block_type, saved) {
    var container = document.createElement('div'),
        keybar = document.createElement('div'),
        buttons = [
            ['top', 'moveup'],
            ['bottom', 'movedown'],
            ['delete', 'deleteBlock'],
            ['addmarker', 'setactivemarker'],
            ['removemarker', 'removeBlockMark']
        ];

    function create_button(button_name_and_func) {
        var button_name = button_name_and_func[0],
            button_func = button_name_and_func[1],
            button = document.createElement('button');
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
        '<div onclick="editBlock(' + number + ')" id="contentarea_' + number + '">' +
        blockContent +
        '</div>';

    keybar.id = "keybar_" + number;
    keybar.className = "key_panel";

    buttons.forEach(create_button);

    container.appendChild(keybar);
    story.appendChild(container);

    Blocks.push(number);
    BlockMarkers.push(null);
    BlockTypes.push(block_type);
	if (block_type == 'img') {
        addImagesFromTemp(number);
    }
    
    current_marker = Blocks.length - 1;
    number++;
    if (!saved) {
        savePage();
    }
}

function appendBlockArtifact(story, blockContent, block_type, saved, itemstr) {
    var container = document.createElement('div'),
        keybar = document.createElement('div'),
        buttons = [
            ['top', 'moveup'],
            ['bottom', 'movedown'],
            ['delete', 'deleteBlock'],
            ['addmarkerArtifact', 'setactivemarkerArtifact'],
            ['removemarker', 'removeBlockMark']
        ];
function create_button(button_name_and_func) {
        var button_name = button_name_and_func[0],
            button_func = button_name_and_func[1],
            button = document.createElement('button');
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
        '<div onclick="editBlock(' + number + ')" id="contentarea_' + number + '">' +
        blockContent +
        '</div>';

    keybar.id = "keybar_" + number;
    keybar.className = "key_panel";

    buttons.forEach(create_button);

    container.appendChild(keybar);
    story.appendChild(container);

    Blocks.push(number);
    BlockMarkers.push(null);
    BlockTypes.push(block_type);
	if (block_type === 'img') {
        addImagesFromTemp(number);
    }

    current_marker = Blocks.length - 1;
    number++;
    if (!saved) {
        savePage();
    }
}

function deleteBlock(itemstr) {
    var item = parseInt(itemstr),
        poss = Blocks.indexOf(item),
        block = document.getElementById("block_" + Blocks[poss]);
    block.parentNode.removeChild(block);
    Blocks.splice(poss, 1);
    if(BlockMarkers[poss] !== null){
        removeMark(BlockMarkers[poss]);
    }
    BlockMarkers.splice(poss, 1);
    BlockTypes.splice(poss, 1);
    deleteImagesFromBlock(item);
    savePage();
}

function editBlock(itemstr) {
    var item = parseInt(itemstr),
        poss = Blocks.indexOf(item),
        block = document.getElementById("block_" + Blocks[poss]),
        contentarea = document.getElementById('contentarea_' + Blocks[poss]),
        keybar = document.getElementById('keybar_' + Blocks[poss]);
    console.log(BlockTypes[poss]);
    if (editBlockStatus === 0) {
        editBlockStatus = 1;
        if (BlockTypes[poss] === 'text' || BlockTypes[poss] === 'artifact') {
            textarea = document.createElement('textarea');
            textarea.value = document.getElementsByClassName('description_story')[poss].innerHTML;
            textarea.rows = 4;
            textarea.cols = 90;
            contentarea.style.display = 'none';
            keybar.style.display = 'none';
            block.appendChild(textarea);
            textarea.focus();
            textarea.onkeypress = function (e) {
                if (e.keyCode === 13) {
                    document.getElementsByClassName('description_story')[poss].innerHTML = textarea.value;
                    block.removeChild(textarea);
                    contentarea.style.display = 'block';
                    keybar.style.display = 'block';
                    savePage();
                    editBlockStatus = 0;
                }
            };
        }
    }
}


function move_block(itemstr, direction) {
    // direction (-1) - up, (+1) - down
    var item = parseInt(itemstr),
        block = document.getElementById('contentarea_' + item),
        poss = Blocks.indexOf(item);
    if ((poss + direction) in Blocks) {
        var blockprev = document.getElementById('contentarea_' + (Blocks[poss + direction])),
            prevconen = blockprev.innerHTML,
	    block_marker = BlockMarkers[poss],
            block_type = BlockTypes[poss];
        blockprev.innerHTML = block.innerHTML;
        block.innerHTML = prevconen;
        BlockMarkers[poss] = BlockMarkers[poss + direction];
        BlockMarkers[poss + direction] = block_marker;
        BlockTypes[poss] = BlockTypes[poss + direction];
        BlockTypes[poss + direction] = block_type;
        swapImagesFromBlock(Blocks[poss + direction], Blocks[poss]);
    }
    savePage();
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
        '<img src="' + src + '"class="image_story" data-dbid="' +
        img_id + '">'
    );
}

function add_saved_blocks() {
    var i, block, block_text, block_type, marker,
        blocks = document.getElementsByClassName('saved'),
        blocks_num = blocks.length,
        story_content = document.getElementById('story_content');
    for (i=0; i < blocks_num; i++) {
        marker = {};
        block = blocks[0];
        block_type = block.classList[1];
        if (block_type === 'text') {
            block_text = text_block_template(block.children[0].innerHTML);
        } else if (block_type === 'img') {
            block_text = img_block_template(
                block.children[0].innerHTML,
                block.dataset.dbid
            );
        }
        else if (block_type === 'artifact') {
            block_text = text_block_template(block.children[0].innerHTML);
        }
        block.parentNode.removeChild(block);
        if (block_type === 'text' || block_type === 'img') {
            appendBlock(story_content, block_text, block_type, saved = true);
        }else if (block_type === 'artifact') {
            appendBlockArtifact(story_content, block_text, block_type, saved = true);
        }
        if (block.dataset.hasOwnProperty('lat')) {
	        marker = {
                'lat': block.dataset.lat,
                'lng': block.dataset.lng
            };
        }

	appendBlockMarker(marker);
    }
}

window.onload = function() {

    var story_cont = document.getElementById('story_content'),
        photo_cont = document.getElementById('photo_cont'),
        comment_t = document.getElementById('add_comment_t'),
        treasure_t = document.getElementById('add_treasure_t'),
        //comment_p = document.getElementById('add_comment_p'),
        //treasure_p = document.getElementById('add_treasure_p'),
        edit = document.getElementById('add_treasure_t'),
        textarea = document.getElementById('textarea'),
        text = document.getElementById('added_text'),
        photo = document.getElementById('added_image'),
        video = document.getElementById('added_video'),
        text_panel = document.getElementById('text_panel'),
        photo_panel = document.getElementById('photo_panel'),
        video_panel = document.getElementById('video_panel'),
        publish_panel = document.getElementById('publish_panel'),
        title = document.getElementById('title'),
        textarea_artifact = document.getElementById('textarea_artifact'),
        text_artifact = document.getElementById('added_artifact'),
        artifact_panel = document.getElementById('artifact_panel'),

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
            arr_1[i].style.background = "#80B098";
        }
        for (i = 0; i < arr_2.length; i++) {
            arr_2[i].style.display = 'none';
        }
        for (i = 0; i < arr_3.length; i++) {
            arr_3[i].value = '';
            arr_3[i].style.display = 'none';
        }
        textarea.value = '';
        textarea_artifact.value = '';
        photo_cont.innerHTML = '';
        photo_cont.style.display = 'none';
        clearImagesFromTemp();
    }

    function save_text_story() {
        typeOfMarker = 0;
        story_cont.style.display = 'block';
        var text = escape_html_tags(textarea.value),
            content = text_block_template(text);
        appendBlock(story_cont, content, "text");
        clear();
    }

    function save_artifact_story() {
        typeOfMarker = 1;
        story_cont.style.display = 'block';
        var text = escape_html_tags(textarea_artifact.value),
            content = text_block_template(text);
        appendBlockArtifact(story_cont, content, "artifact");
        clear();
    }

        textarea_artifact.onkeypress = function(e) {
        if (e.keyCode === 13) {
            save_artifact_story();
            return false;
        }
    };

    function save_photo_story(){           
        var i,
            arr = document.getElementsByClassName(number),
            content = '';
        story_cont.style.display = 'block';
        for (i = 0; i < arr.length; i++) {
            content += img_block_template(arr[i].src);
        }
        appendBlock(story_cont, content, "img");
        clear();
        
        $('#type_file').fileExif(setMarkerFromImageExifData);
    }
    // put marker if image has GPS coordinates in Exif data
    function setMarkerFromImageExifData(exifData){           
          if(exifData.GPSLatitude && exifData.GPSLongitude){
              var lat=ConvertDMSToDD(exifData.GPSLatitude);
              var lng=ConvertDMSToDD(exifData.GPSLongitude);                      
              var myLatlng = new google.maps.LatLng(lat, lng);
              var countBlock=document.getElementsByClassName("block_story").length                     
              setactivemarker(countBlock);
              placeMarker(myLatlng, countBlock);
              map.setCenter(myLatlng);
            }
        }
    //convert from degrees, minutes, seconds to decimal degrees coordinates
      function ConvertDMSToDD(dms){
        var dmsArray=dms.toString().split(",");
        var degrees=+dmsArray[0];
        var minutes=+dmsArray[1];
        var seconds=+dmsArray[2];
        var dd = degrees + minutes/60 + seconds/(60*60);
        return dd;   
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

    text_artifact.onclick = function() {
        clear();
        this.style.background = '#8ed41f';
        artifact_panel.style.display = 'block';
        document.getElementById('textarea_artifact').focus();
    }

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
    publish_panel.style.display = (
        (publish_panel.className === 'invisible') ? 'none' : 'block'
    );

    // document.getElementById('type_file').onchange = add_img;
    document.getElementById('adds_block_t').onclick = save_text_story;
    document.getElementById('clear_block_t').onclick = clear;
    document.getElementById('adds_block_p').onclick = save_photo_story;
    document.getElementById('clear_block_p').onclick = clear;
    document.getElementById('adds_block_a').onclick = save_artifact_story;
    document.getElementById('clear_block_a').onclick = clear;


var tag_input = document.getElementById('tag_input');
tag_input.onchange = tags_add;
var tag_add = document.getElementById('tag_add');
tag_add.onclick = tags_add;


};
getStoryTags();

function tags_add() {
    var reg = /^[а-яa-z0-9іїє\s]+$/i;
    if (tag_input.value.search(reg) >= 0) {
        putTag(tag_input.value);
    } else {
        alert('input a-z, а-я, 0-9');
    }
    tag_input.focus();
}

function tags_view(tags_arr){
    button_list.innerHTML = '';
    for (var i = 0; i < tags_arr.length; i++) {
        button_list.innerHTML += '<div class="tags_button">'+tags_arr[i]+
        ' <span class="tags_delete" onclick="tag_delete('+i+')">x</span></div>'
    }
}

function tag_delete(i) {
    deleteStoryTags(i);
}


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
    map = new google.maps.Map(
            document.getElementById('map-canvas'),
            mapOptions);
    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
    });

    addDrawingManager(map);

    for (var i=0; i < temp_positions.length; i++) {
        var position = temp_positions[i].position;
        var location = new google.maps.LatLng(position.lat, position.lng);
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
        if(BlockMarkers[current_marker] !== null){
            removeMark(BlockMarkers[temp_positions[i].block]);
        }

        markersArray.push(marker);
        i = markersArray.length - 1;
        BlockMarkers[temp_positions[i].block] = i;
    }

    if (markersArray.length === 0) {
        centerOnCurrPos(map);
    } else {
        setBounds(map, markersArray);
    }
}

// Add a marker to the map and push to the array.
function placeMarker(location, itemstr) {
    var item = parseInt(itemstr);
    if (typeOfMarker === 1) {
        var marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: {url: '../static/images/artifact_marker.png'}
    });
    } else {
        var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    }


    if(current_marker !== -1) {
        if(BlockMarkers[current_marker] !== null){
            removeMark(BlockMarkers[current_marker]);
        }

        markersArray.push(marker);
        i = markersArray.length - 1;
        BlockMarkers[current_marker] = i;
    }

    savePage();
}

// Sets the map on all markers in the array.
function setAllMap(map) {
    for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(map);
    }
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

function setactivemarker(itemstr){
    typeOfMarker = 0
    var item = parseInt(itemstr);
    current_marker = Blocks.indexOf(item);
}

function setactivemarkerArtifact(itemstr){
    typeOfMarker = 1;
    var item = parseInt(itemstr);
    current_marker = Blocks.indexOf(item);
}

function removeBlockMark(itemstr){
    var item = parseInt(itemstr);
    var index = Blocks.indexOf(item);  
    removeMark(BlockMarkers[index]);
    BlockMarkers[index] = null;
}

function getMarkerLocation(i){
    if(BlockMarkers[i] !== null){
        var marker =  markersArray[BlockMarkers[i]];
        if(marker !== null){
            var pos = marker.getPosition();
            return {
                'lat': pos.lat(),
                'lng': pos.lng()
            };
        }
    }
    return null;
}

function centerMap(i) {
    map.setCenter(markersArray[i].getPosition());
}

function removeMark(i) {
    markersArray[i].setMap(null);
    markersArray[i] = null;
    savePage();
}

google.maps.event.addDomListener(window, 'load', initialize);

