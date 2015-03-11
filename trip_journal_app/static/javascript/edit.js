var Images = []; //Array of pictures that will be uploaded.
var Markers = []; //Array of markers, index of marker in this array is equal to the index of the block that it belongs. 
var serverConnect = checkServerConnection();

window.onload = function() {
    getStoryContent(); // get story content using AJAX
    getStoryTags(); // get story tegs using AJAX

    // In online mode initialize the google map API. In offline show short menu
    if (serverConnect) {
        initialize(); // initialize the google map API
    } else {
        setMenu(); // Show in menu only editor element
    }

    //EventListeners
    gId('add_title').addEventListener("click", addTitle);
    gId('story_title').addEventListener("blur", savePage);
    gId('tag_input').addEventListener("change", tags_add);
    gId('tag_add').addEventListener("click", tags_add);
    gId('type_file').addEventListener("change", add_img);
    gId('story_content').addEventListener("mouseover", showKeybar);
    gId('story_content').addEventListener("mouseout", hideKeybar);
    gId('story_content').addEventListener("click", buttonsClick);
    gId("added_artifact").addEventListener("click", showArtifactPanel);
    gId("added_image").addEventListener("click", showImagePanel);
    gId("added_text").addEventListener("click", showTextPanel);
    gId("adds_block_t").addEventListener("click", save_text_story);
    gId("adds_block_p").addEventListener("click", save_photo_story);
    gId('photo_cont').addEventListener("click", deleteImageFromPhotoCont);
    gId("adds_block_a").addEventListener("click", save_photo_artifact);
    gId('findAddres').addEventListener("click", codeAddress);
    clearBlocks = document.getElementsByClassName("delete_block")
    for (var i = 0; i < clearBlocks.length; i++) {
        clearBlocks[i].addEventListener("click", clear);
    }

    // call function what I have to do.
    toDo();
}


//get elements by Id
function gId(id) {
    return document.getElementById(id)
}

// Get content from server
function getStoryContent() {
    if (serverConnect) {
        story_id = storyIdFromUrl();
        if (story_id) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var str = xhr.responseText;
                    var content = JSON.parse(str);
                    initialize_story(content);
                }
            }
            params = 'id=' + story_id;
            xhr.open('GET', '/get_story_content/?' + params, false);
            xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.send();
        }
    } else {
        var str = localStorage.getItem("Block_content");
        var content = JSON.parse(str);
        if (content) {
            initialize_story(content[0]);
        }
    }
}

// Check type of block content, and call right function
function initialize_story(content) {
    if (content.title) {
        title_view(content.title);
    }
    if (serverConnect) {

        if (content.text) {
            content_list = JSON.parse(content.text);
            for (var i = 0; i < content_list.length; i++) {
                var marker = content_list[i].marker
                    // create text block
                if (content_list[i].type === "text") {
                    text_view(content_list[i].content, marker);
                }
                // create artifack block
                if (content_list[i].type === "artifact") {
                    artifact_view(content_list[i].content, marker);
                }
                // create image or gallery block
                if (content_list[i].type === "img") {
                    var galleryId = content_list[i].galleryId || [content_list[i].id];
                    var imgs = content.picture;
                    show_pictures(galleryId, imgs, marker);
                }
            }
        }

    } else {
        for (var i = 0; i < content.blocks.length; i++) {
            if (content.blocks[i].type === "text") {
                text_view(content.blocks[i].content);
            }
            if (content.blocks[i].type === "artifact") {
                artifact_view(content.blocks[i].content);
            }
        };
    }
}

// view title on page
function title_view(title) {
    var titleInput = gId("title");
    gId('story_title').innerHTML = title;
    gId('story_title').style.display = "block";
    titleInput.style.display = "none";
    gId('add_title').style.display = "none";
}

// create text block, and view text
function text_view(text, marker_coordinates) {
    // function text_view(text) {
    var pText = document.createElement("p");
    pText.innerHTML = escape_html_tags(text);
    appendBlock(pText, "text");
    set_block_coordinates(pText, marker_coordinates);
}

// create artifact block, and view artifact
function artifact_view(artifact, marker_coordinates) {
    var pArtifact = document.createElement("p");
    pArtifact.innerHTML = escape_html_tags(artifact);
    appendBlock(pArtifact, "artifact");
    set_block_coordinates(pArtifact, marker_coordinates);
}

// create pictures block, and view picture
function show_pictures(galleryId, imgs, marker_coordinates) {
    var arr = galleryId
    gId('story_content').style.display = 'block';
    if (arr.length > 1) {
        // gallery will be created if many  pictures  are in the temporary panel.
        var gallery = document.createElement("div");
        gallery.className = "gallery_container";
        for (var i = 0; i < arr.length; i++) {
            var imageInGallery = document.createElement("img");
            imageInGallery.className = "image_story gallery";
            imageInGallery.src = imgs[arr[i]];
            imageInGallery.setAttribute("data-dbid", arr[i]);
            gallery.appendChild(imageInGallery);
        }
        appendBlock(gallery, "img");
        set_block_coordinates(gallery, marker_coordinates);
    } else {
        //only one picture is in temporary panel.
        oneImage = document.createElement("img");
        oneImage.className = "image_story";
        oneImage.src = imgs[arr[0]];
        oneImage.setAttribute("data-dbid", arr[0]);
        appendBlock(oneImage, "img");
        set_block_coordinates(oneImage, marker_coordinates);
    }
}

// set coordinates in block
function set_block_coordinates(block_element, coordinates) {
    if (coordinates !== null) {
        block_element.parentNode.setAttribute("data-lat", coordinates.lat);
        block_element.parentNode.setAttribute("data-lng", coordinates.lng);
    }
}

// Main menu in offline mode
function setMenu() {
    var menu = gId('menu');
    var menu_elements = menu.children;
    for (var i = 0; i < menu_elements.length; i++) {
        if (menu_elements[i].textContent != "my stories") {
            menu_elements[i].style.display = 'none';
        }
    }
}


//add title of story
function addTitle(e) {
    var titleInput = gId("title");
    gId('story_title').innerHTML = titleInput.value
    gId('story_title').style.display = "block"
    titleInput.style.display = "none"
    gId('add_title').style.display = "none"
    e.stopPropagation()
    savePage();
}

//function adds tag
function tags_add(e) {
    var tag_input = gId('tag_input')
    var reg = /^[а-яa-z0-9іїє\s]+$/i;
    if (tag_input.value.search(reg) >= 0) {
        putTag(tag_input.value);
    } else {
        alert('input a-z, а-я, 0-9');
    }
    tag_input.focus();
    e.stopPropagation()
}

//function delete tag
function tag_delete(i) {
    deleteStoryTags(i);
}

//show panel of text
function showTextPanel() {
    clear()
    this.style.background = '#8ed41f';
    text_panel.style.display = 'block';
    gId('textarea').focus();
}

//show panel of image
function showImagePanel() {
    clear()
    this.style.background = '#8ed41f';
    photo_panel.style.display = 'block';
}

//show panel of artifact
function showArtifactPanel() {
    clear()
    this.style.background = '#8ed41f';
    artifact_panel.style.display = 'block';
    gId('textarea_artifact').focus();
}

//function returns all panels of text, images, artifacts in default condition 
function clear() {
    var hidePanels = document.getElementsByClassName('hide');
    for (var i = 0; i < hidePanels.length; i++) {
        hidePanels[i].style.display = 'none';
    }
    gId("added_text").style.background = "#80B098";
    gId("added_image").style.background = "#80B098";
    gId("added_artifact").style.background = "#80B098";
    gId('textarea').value = '';
    gId('textarea_artifact').value = '';
    gId('photo_cont').innerHTML = '';
    gId('photo_cont').style.display = 'none';
}

//function adds a block of a given type ("text","img","artifact")
function appendBlock(blockContent, block_type) {
    var container = document.createElement('div'),
        keybar = document.createElement('div'),
        buttons = ['top', 'bottom', 'delete', 'addmarker', 'removemarker'];
    if (block_type == "artifact") {
        buttons = ['top', 'bottom', 'delete', 'addmarkerArtifact', 'removemarker'];
    }
    container.className = "block_story";
    // Write type as an attribute of the element !!!
    container.setAttribute("block_type", block_type)
    gId('story_content').appendChild(container)
    container.appendChild(blockContent)
    keybar.className = "key_panel"
    container.appendChild(keybar);
    for (i = 0; i < buttons.length; i++) {
        var button = document.createElement('button');
        button.className = buttons[i];
        keybar.appendChild(button);
    }
    savePage();
}

//save text block
function save_text_story() {
    var pText = document.createElement("p")
    pText.innerHTML = escape_html_tags(gId('textarea').value)
    appendBlock(pText, "text");
    clear();
    savePage();
}

function escape_html_tags(str) {
    return str.replace(/>/g, '&gt;').replace(/</g, '&lt;');
}

//save artifact block
function save_photo_artifact() {
    var pArtifact = document.createElement("p")
    pArtifact.innerHTML = escape_html_tags(gId('textarea_artifact').value)
    appendBlock(pArtifact, "artifact")
    clear();
    savePage();
}

//function shows the image in photo_cont using HTML5 ObjectURL
function add_img() {
    var i, URL, imageUrl, id, file,
        files = gId('type_file').files; // all files in input
    if (files.length > 0) {
        for (i = 0; i < files.length; i++) {
            file = files[i];
            if (!file.type.match('image.*')) { //Select from files only pictures
                continue;
            }
            // Create array Images to be able to choose what pictures will be uploaded.
            // You cannot change the value of an <input type="file"> using JavaScript.
            Images.push(file);
            URL = window.URL;
            if (URL) {
                var imageUrl = URL.createObjectURL(files[i]); // create object URL for image          
                var img_block = document.createElement("div");
                img_block.className = "img_block";
                gId('photo_cont').appendChild(img_block)
                var img_story = document.createElement("img")
                img_story.className = "img_story";
                img_story.src = imageUrl;
                img_block.appendChild(img_story);
                var button_delete = document.createElement("button"); // create button to delete picture
                button_delete.className = "button_3";
                var x = document.createTextNode("x");
                button_delete.appendChild(x)
                img_block.appendChild(button_delete);
            }
        }
        gId('photo_cont').style.display = 'inline-block';
    }
}

//function delete image from temporary panel.
function deleteImageFromPhotoCont(e) {
    var index = -1;
    var target = e.target;
    if (target.className == "button_3") {
        var imgblock = target.parentNode;
        var imgblocks = gId('photo_cont').getElementsByClassName("img_block");
        for (var i = 0; i < imgblocks.length; i++) {
            if (imgblocks[i] == imgblock) {
                index = i; // define index of our image
            }
        }
        gId('photo_cont').removeChild(imgblock);
        Images.splice(index, 1); //delete image from array Images[] that will be uploaded.
    }
}

//save photo block, add single image or gallery with many images in one block
function save_photo_story() {
    var arr = document.getElementsByClassName("img_story")
    gId('story_content').style.display = 'block';
    if (arr.length > 1) {
        // gallery will be created if many  pictures  are in the temporary panel.
        var gallery = document.createElement("div");
        gallery.className = "gallery_container"
        for (var i = 0; i < arr.length; i++) {
            var imageInGallery = document.createElement("img")
            imageInGallery.className = "image_story gallery";
            imageInGallery.src = arr[i].src;
            gallery.appendChild(imageInGallery)
        }
        appendBlock(gallery, "img");
    } else {
        //only one picture is in temporary panel.
        oneImage = document.createElement("img")
        oneImage.className = "image_story"
        oneImage.src = arr[0].src
        appendBlock(oneImage, "img");
    }
    clear();
}

//change image  on gallery click
function galleryChangePicture(element) {
    var number;
    var gallery_container = element.parentNode;
    gallery_pictures = gallery_container.getElementsByClassName("gallery")
    countPicture = gallery_pictures.length;
    for (var i = 0; i < countPicture; i++) {
        if (gallery_pictures[i] == element) {
            number = i; //define index of clicked picture
            break;
        }
    }
    for (j = 0; j < countPicture; j++) {
        gallery_pictures[j].style.display = "none"; //hide all picture
    }
    number++;
    if (number == countPicture) {
        number = 0;
    }
    gallery_pictures[number].style.display = "block" //show picture whith index number.
}

//function shows buttons when the mouse pointer moves over the "block_story"
function showKeybar(e) {
    var target = e.target;
    while (target != this) {
        if (target.className == "block_story") {
            var key_panel = target.getElementsByClassName("key_panel")[0];
            key_panel.style.display = "block";
        }
        target = target.parentNode;
    }
}

//function hides buttons when the mouse pointer leaves the "block_story"
function hideKeybar(e) {
    var target = e.target;
    while (target != this) {
        if (target.className == "block_story") {
            var key_panel = target.getElementsByClassName("key_panel")[0];
            key_panel.style.display = "none";
        }
        target = target.parentNode;
    }
}

//the main function that defines the function for each button and block
function buttonsClick(e) {
    var target = e.target;
    while (target.id != "story_content") {
        switch (target.className) {
            case "top":
                moveBlockUp(target);
                return;
            case "bottom":
                moveBlockDown(target);
                return;
            case "delete":
                deleteBlock(target);
                return;
            case "addmarker":
                setactiveMarker(target);
                return;
            case "addmarkerArtifact":
                setactiveMarker(target);
                return;
            case "removemarker":
                removeMarker(target);
                return;
            case "image_story gallery":
                galleryChangePicture(target);
                return;
            case "block_story":
                editBlock(target);
                return;
        }
        target = target.parentNode;
    }
}

//function returns the index of the clicked block
function indexOfClickedBlock(element) {
    while (element.className != "block_story") {
        element = element.parentNode;
    }
    var my = document.getElementsByClassName("block_story")
    for (var i = 0; i < my.length; i++) {
        if (my[i] == element) return i;
    }
}

//move block up
function moveBlockUp(element) {
    var story_cont = gId('story_content'),
        index = indexOfClickedBlock(element),
        bloks = story_cont.getElementsByClassName("block_story"),
        block = bloks[index];
    if (index == 0) return;
    // Swap blocks
    story_cont.insertBefore(bloks[index].cloneNode(true), bloks[index - 1]);
    story_cont.removeChild(block);
    // Swap markers of blocks
    marker_1 = Markers[index - 1];
    marker_2 = Markers[index];
    Markers.splice(index - 1, 2, marker_2, marker_1);
    savePage();
}

//move block down
function moveBlockDown(element) {
    var story_cont = gId('story_content'),
        index = indexOfClickedBlock(element),
        bloks = story_cont.getElementsByClassName("block_story"),
        block = bloks[index];
    // Swap blocks
    story_cont.insertBefore(bloks[index].cloneNode(true), bloks[index + 2]);
    story_cont.removeChild(block);
    // Swap markers of blocks
    marker_1 = Markers[index];
    marker_2 = Markers[index + 1];
    Markers.splice(index, 2, marker_2, marker_1);
    savePage();
}

//delete block
function deleteBlock(element) {
    var story_cont = gId('story_content'),
        index = indexOfClickedBlock(element);
    block = story_cont.getElementsByClassName("block_story")[index];
    story_cont.removeChild(block);
    if (Markers[index]) {
        Markers[index].setMap(null);
        //delete marker of block          
        Markers.splice(index, 1);
    }
    savePage();
}

//create textarea in block to edit it
function editBlock(element) {
    if (element.edit || element.getAttribute("block_type") == "img") {
        return; // you can edit only block with type "text" or "artifact"
    } else {
        element.edit = "true";
        var textAreaEditBlock = document.createElement("textarea");
        textAreaEditBlock.className = "text_area_edit";
        textAreaEditBlock.addEventListener("keypress", endEditBlock)
        textAreaEditBlock.value = element.children[0].innerHTML; // value of textarea = value of block's text  
        element.children[0].style.display = "none"
        element.className = "block_story block_edited";
        element.insertBefore(textAreaEditBlock, element.children[1])
        element.getElementsByClassName("key_panel")[0].style.display = "none"
        textAreaEditBlock.focus();
    }
}

// return value of textarea to block 
function endEditBlock(e) {
    var textarea = e.target;
    var block = textarea.parentNode;
    if (e.keyCode === 13) {
        block.className = "block_story";
        block.children[0].innerHTML = textarea.value // value of block's text = value of textarea 
        block.children[0].style.display = "block"
        block.removeChild(textarea);
        block.edit = false;
        savePage();
    }

}

/*
 * Initialize the google map and put markers if blocks that were created
 * on server side has attribyte "data-lng" and "data-lat.
 */
function initialize() {
    indexOfMarket = -1
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
        zoom: 14
    };
    map = new google.maps.Map(
        gId('map-canvas'),
        mapOptions);
    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
    });

    // put markers if blocks has coordinates
    var blocks = document.getElementsByClassName("block_story");
    for (i = 0; i < blocks.length; i++) {
        if (blocks[i].getAttribute("data-lng")) {
            lng = +blocks[i].getAttribute("data-lng")
            lat = +blocks[i].getAttribute("data-lat")
            markerLocation = new google.maps.LatLng(lat, lng)
            indexOfMarket = i;
            placeMarker(markerLocation)
            indexOfMarket = -1;
        }
    }
    if (Markers.length === 0) {
        centerOnCurrPos(map); // Set centers map on current position or L'viv city center.
    } else {
        setBounds(map, Markers); // Sets the map zoom so that all the markers are visible.
    }
    addDrawingManager(map);
}

// find a place on the google map and set the center map on it 
function codeAddress() {
    var address = gId('address').value;
    geocoder.geocode({
        'address': address
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// define marker with which we work 
function setactiveMarker(element) {
    indexOfMarket = indexOfClickedBlock(element)
}

// function put marker or change markers position
function placeMarker(location) {
    if (indexOfMarket == -1) {
        return;
    } else if (Markers[indexOfMarket]) {
        Markers[indexOfMarket].setPosition(location);
        indexOfMarket = -1;
    } else {
        var block = document.getElementsByClassName("block_story")[indexOfMarket];
        if (block.getAttribute("block_type") == "artifact") {
            Markers[indexOfMarket] = new google.maps.Marker({
                position: location,
                map: map,
                icon: {
                    url: '../static/images/artifact_marker.png'
                }
            })
        } else {
            Markers[indexOfMarket] = new google.maps.Marker({
                position: location,
                map: map
            })
        }
        Markers[indexOfMarket].setMap(map)
        indexOfMarket = -1
    }
    savePage();
}

// function remove marker
function removeMarker(element) {
    var index = indexOfClickedBlock(element)
    if (Markers[index]) {
        Markers[index].setMap(null);
        Markers[index] = null;
        savePage();
    }
}

// List of things, that I have to do, when the file offline.manifest will be right configured.
function toDo() {
    console.log(" ");
    console.log("TODO LIST");
    console.log(" 1. In file ajax_requests, uncomment 'check_actual_tags' \
         ");
    console.log(" ");
}