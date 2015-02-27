var Images = []; //Array of pictures for upload
var Markers = []; //Array of markers 



//get elements by Id
function gId(id){
    return document.getElementById(id)
}

window.onload = function() {
    alert("work")
    // List of things, that I have to do, when the file offline.manifest will be right configured.
    function toDo() {
        console.log(" ");
        console.log("TODO LIST");
        console.log(" 1. In file ajax_requests, uncomment 'check_actual_tags' \
             ");
        console.log(" ");
    }

    //Variables
    var geocoder,
        indexOfMarket = -1,
        add_title = gId('add_title'),
        story_title = gId('story_title'),
        tag_input = gId('tag_input'),
        tag_add = gId('tag_add'),
        story_cont = gId('story_content'),
        added_artifact = gId("added_artifact"),
        added_image = gId("added_image"),
        added_text = gId("added_text"),
        textarea = gId('textarea'),
        textarea_artifact = gId('textarea_artifact'),
        photo_cont = gId('photo_cont'),
        fileSelect = gId('type_file')
        

    //Events
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

    getStoryContent(); // get story content using AJAX
    getStoryTags(); // get story tegs using AJAX

    // In online mode initialize the google map API. In offline show short menu
    if (checkServerConnection()) {
        initialize(); // initialize the google map API
    } else {
        setMenu(); // Show in menu only editor element
    }

    // Get content from server
    function getStoryContent() {
        if (checkServerConnection()) {
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
                xhr.open('GET', '/get_story_content/?' + params, true);
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

        if (checkServerConnection()) {

            if (content.text) {
                content_list = JSON.parse(content.text);

                for (var i = 0; i < content_list.length; i++) {

                    if (content_list[i].type === "text") {
                        text_view(content_list[i].content);
                    }

                    if (content_list[i].type === "artifact") {
                        artifact_view(content_list[i].content);
                    }

                    if (content_list[i].type === "img") {

                        if (content.picture) {
                            var picture_id = content_list[i].id;
                            var picture = content.picture[picture_id]
                            picture_view(picture_id, picture);
                        }

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
    function text_view(text) {
        var pText = document.createElement("p");
        pText.innerHTML = escape_html_tags(text);
        appendBlock(pText, "text");
    }

    // create artifact block, and view artifact
    function artifact_view(artifact) {
        var pArtifact = document.createElement("p");
        pArtifact.innerHTML = escape_html_tags(artifact);
        appendBlock(pArtifact, "artifact");
    }

    // create picture block, and view picture
    function picture_view(id, img) {
        var oneImage = document.createElement("img");
        oneImage.className = "image_story";
        oneImage.src = img;
        oneImage.setAttribute("data-dbid", id);
        appendBlock(oneImage, "img");
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


    //Functions
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
        var tag_input=gId('tag_input')
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
        container.setAttribute("block_type", block_type) //write type as an attribute of the element
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
            files = gId('type_file').files;
        if (files.length > 0) {
            for (i = 0; i < files.length; i++) {
                file = files[i];
                if (!file.type.match('image.*')) { //Select from files only pictures 
                    continue;
                }
                Images.push(file);
                URL = window.URL;
                if (URL) {
                    var imageUrl = URL.createObjectURL(files[i]);
                    var img_block = document.createElement("div");
                    img_block.className = "img_block";
                    gId('photo_cont').appendChild(img_block)
                    var img_story = document.createElement("img")
                    img_story.className = "img_story";
                    img_story.src = imageUrl;
                    img_block.appendChild(img_story);
                    var button_delete = document.createElement("button");
                    button_delete.className = "button_3";
                    var x = document.createTextNode("x");
                    button_delete.appendChild(x)
                    img_block.appendChild(button_delete);
                }
            }
            gId('photo_cont').style.display = 'inline-block';
        }
    }

    //function delete image from photo_cont
    function deleteImageFromPhotoCont(e) {
        var index = -1;
        var target = e.target;
        if (target.className == "button_3") {
            var imgblock = target.parentNode;
            var imgblocks = gId('photo_cont').getElementsByClassName("img_block");
            for (var i = 0; i < imgblocks.length; i++) {
                if (imgblocks[i] == imgblock) {
                    index = i;
                }
            }
            gId('photo_cont').removeChild(imgblock);
            Images.splice(index, 1);
        }
    }

    //save photo block, add single image or gallery with many images in one block
    function save_photo_story() {
        var arr = document.getElementsByClassName("img_story")
        gId('story_content').style.display = 'block';
        if (arr.length > 1) {
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
            oneImage = document.createElement("img")
            oneImage.className = "image_story"
            oneImage.src = arr[0].src
            appendBlock(oneImage, "img");
        }
        clear();
    }

    //change image when you click on gallery
    function galleryChangePicture(element) {
        var number;
        var gallery_container = element.parentNode;
        gallery_pictures = gallery_container.getElementsByClassName("gallery")
        countPicture = gallery_pictures.length;
        for (var i = 0; i < countPicture; i++) {
            if (gallery_pictures[i] == element) {
                number = i;
                break;
            }
        }
        for (j = 0; j < countPicture; j++) {
            gallery_pictures[j].style.display = "none";
        }
        number++;
        if (number == countPicture) {
            number = 0;
        }
        gallery_pictures[number].style.display = "block"
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
        var story_cont=gId('story_content'),
            index = indexOfClickedBlock(element),
            bloks = story_cont.getElementsByClassName("block_story"),
            block = bloks[index];
        if (index == 0) return;
        story_cont.insertBefore(bloks[index].cloneNode(true), bloks[index - 1]);
        story_cont.removeChild(block);
        marker_1 = Markers[index - 1];
        marker_2 = Markers[index];
        Markers.splice(index - 1, 2, marker_2, marker_1);
        savePage();
    }

    //move block down
    function moveBlockDown(element) {
        var story_cont=gId('story_content'),
            index = indexOfClickedBlock(element),
            bloks = story_cont.getElementsByClassName("block_story"),
            block = bloks[index];
        story_cont.insertBefore(bloks[index].cloneNode(true), bloks[index + 2]);
        story_cont.removeChild(block);
        marker_1 = Markers[index];
        marker_2 = Markers[index + 1];
        Markers.splice(index, 2, marker_2, marker_1);
        savePage();
    }

    //delete block
    function deleteBlock(element) {
        var story_cont=gId('story_content'),
            index = indexOfClickedBlock(element);
        block = story_cont.getElementsByClassName("block_story")[index];
        story_cont.removeChild(block);
        if (Markers[index]) {
            Markers[index].setMap(null);
            Markers.splice(index, 1);
        }
        savePage();
    }

    //create textarea in block to edit it
    function editBlock(element) {
        if (element.edit || element.getAttribute("block_type") == "img") {
            return;
        } else {
            element.edit = "true";
            var textAreaEditBlock = document.createElement("textarea");
            textAreaEditBlock.className = "text_area_edit";
            textAreaEditBlock.addEventListener("keypress", endEditBlock)
            textAreaEditBlock.value = element.children[0].innerHTML;
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
            block.children[0].innerHTML = textarea.value
            block.children[0].style.display = "block"
            block.removeChild(textarea);
            block.edit = false;
            savePage();
        }

    }

    // function to initialize the google map and put markers if "block_story" has attribyte "data-lng" and "data-lat")
    function initialize() {
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

        // put markers 
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

    // call function what I have to do.
    toDo();
}