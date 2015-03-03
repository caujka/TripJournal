/**
 * Module for sending ajax POST request with block contents from edit page.
 */
// for browser that don't support endsWith method for strings
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

// Check connection with server, and return condition.
function checkServerConnection() {
    // return false;
    // return navigator.onLine;
    var xhr = new XMLHttpRequest;
    var condition = false;
    xhr.open('GET', '/check_connection/', false);

    xhr.onreadystatechange = function() {
        if (xhr.status === 200) {
            condition = true;
        }
    }
    xhr.send();
    return condition;
}

// get story Id
function storyIdFromUrl() {
    var currUrl = document.URL.split(['/']);
    return currUrl[currUrl.length - 1];
}

function getMarkerLocation(index) {
    if (Markers[index]) {
        var pos = Markers[index].getPosition();
        return {
            'lat': pos.lat(),
            'lng': pos.lng()
        };
    }
    return null;
}

function storyBlocksJson() {
    var blocks = [];
    var datetime = new Date();

    story_title = document.getElementById("story_title")
    if (story_title.childNodes[0]) {
        var title = story_title.childNodes[0].nodeValue
    } else {
        var title = "";
    }

    var Blocks = document.getElementsByClassName("block_story");
    // alert(Blocks.length);
    for (var i = 0; i < Blocks.length; i++) {
        var block = {
            "type": Blocks[i].getAttribute("block_type"),
            "marker": getMarkerLocation(i)
        };
        if (block.type === 'text') {
            block.content = Blocks[i].children[0].innerHTML;
        }
        if (block.type === 'artifact') {
            block.content = Blocks[i].children[0].innerHTML;
        }
        if (block.type === 'img') {
            var imagesInBlock = Blocks[i].getElementsByClassName("image_story");
            // alert(imagesInBlock.length);
            if (imagesInBlock.length > 1) {
                block["galleryId"] = [];
                block.id = parseInt(imagesInBlock[0].getAttribute("data-dbid"));
                block["galleryId"][0] = parseInt(imagesInBlock[0].getAttribute("data-dbid"));
                for (var j = 1; j < imagesInBlock.length; j++) {
                    block["galleryId"][j] = parseInt(imagesInBlock[j].getAttribute("data-dbid"));
                }
            } else {
                block.id = parseInt(imagesInBlock[0].getAttribute("data-dbid"));
            }
        }
        blocks.push(block)
    }
    return {
        'datetime': datetime,
        'title': title,
        'blocks': blocks
    };
}

function postImages(storyId) {
    var i, formData, xhr, img, pic;
    countPicture = Images.length
    /**
     * Sets hidden element with
     * picture id from database when picture is saved.
     */
    function addImageIdFromDB() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            picIdInDB = parseInt(xhr.responseText);
            var pictures = document.getElementsByClassName("image_story");
            for (var i = 0; i < countPicture; i++) {
                pictures[pictures.length - i - 1].setAttribute("data-dbid", picIdInDB - i);
            }
            postData(true);
        }
    }

    for (i = 0; i < Images.length; ++i) {
        formData = new FormData();
        img = Images[i]
        formData.append('file', img);
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            addImageIdFromDB();
        };
        xhr.open('POST', '/upload/' + storyIdFromUrl(), true);
        xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
        xhr.send(formData);
    }
    Images = [];
}


function postData(async) {
    if (checkServerConnection()) {
        var xhr = new XMLHttpRequest(),
            requestBody = JSON.stringify(storyBlocksJson());

        // Add to localStorage
        if (supportsLocalStorage()) {
            addToLocalStorrage("Block_content", requestBody);
        }

        /**
         * Appends story id to page url and urls form publsih panel
         * and makes publish panel visble
         * if request was sent from /edit/ page.
         */
        function addStoryIdToUrls() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var newId = xhr.responseText;
                if (!document.URL.endsWith(newId)) {
                    window.history.pushState(
                        'new_id', 'Title', '/edit/' + newId
                    );
                    var publish_panel = document.getElementById('publish_panel');
                    publish_panel.className = 'block';
                    publish_panel.style.display = 'block';
                    document.getElementById('publish_form').action = '/publish/' + newId;
                    document.getElementById('view_form').action = '/story/' + newId;
                }
            }
        }
        xhr.onreadystatechange = addStoryIdToUrls;
        xhr.open('POST', '/save/' + storyIdFromUrl(), async);
        xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(requestBody);

    } else {
        requestBody = JSON.stringify(storyBlocksJson());
        addToLocalStorrage("Block_content", requestBody);
    }
}


function savePage() {
    if (storyIdFromUrl().length === 0) postData(false);
    if (Images.length > 0) {
        postImages();
    } else {
        postData(true);
    }
}

function jsonTagStory(tag_name) {
    var datetime = new Date();
    var block = {};
    block.story_id = storyIdFromUrl();
    block.tag_name = tag_name;
    block.datetime = datetime;
    return block;
}

function putTag(tag_name) {
    var tag_input=gId('tag_input')
    if (checkServerConnection()) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/put_tag/', true);
        xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                tag_input.value = '';
                getStoryTags();
                savePage();
            }
        }

        request_body = JSON.stringify(jsonTagStory(tag_name));

        if (supportsLocalStorage()) {
            addToLocalStorrage("Tag", request_body);
        };

        xhr.send(request_body);

    } else {

        if (supportsLocalStorage()) {
            // add data to localStorage
            request_body = JSON.stringify(jsonTagStory(tag_name));
            addToLocalStorrage("Tag", request_body);

            tag_input.value = '';
            getStoryTags();
        };
    }
}

function getStoryTags() {
    if (checkServerConnection()) {
        story_id = storyIdFromUrl();
        if (story_id) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var str = xhr.responseText;
                    tags_view(JSON.parse(str));
                }
            }
            params = 'Story_id=' + story_id;
            xhr.open('GET', '/get_story_tags/?' + params, true);
            xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
            xhr.send();
        }

    } else {

        var str = localStorage.getItem("Tag");
        if (str) {
            tags_view(JSON.parse(str));
        };

    }
}


// comparing tags time on the server, and in the localStorage
// and getting back array list, with actual data
function check_actual_tags(server_data) {
    var storage_data, server_date, storage_date;

    // get localStorage Tag data
    storage_data = JSON.parse(localStorage.getItem("Tag"));

    // check anvailability Tag data in localStorage
    if (storage_data) {
        storage_date = new Date(storage_data[storage_data.length - 1].datetime);
        server_date = new Date(server_data[server_data.length - 1].datetime);

        // select data wiith newer datetime
        if (storage_date > server_date) {
            return storage_data;
        } else {
            return server_data;
        }
    } else {
        return server_data;
    }
}

function tags_view(tags_arr) {
    // var actual_data = check_actual_tags(tags_arr);
    var actual_data = tags_arr;

    button_list.innerHTML = '';

    for (var i = 0; i < actual_data.length; i++) {
        var get_tag = actual_data[i].name || actual_data[i].tag_name;
        button_list.innerHTML += '<div class="tags_button">' +
            get_tag +
            ' <span class="tags_delete" onclick="tag_delete(' + i + ')">x</span></div>'
    }
}

function deleteStoryTags(i) {
    var xhr = new XMLHttpRequest();
    story_id = storyIdFromUrl();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            getStoryTags();
        }
    }
    params = 'Story_id=' + encodeURIComponent(story_id) + '&Tag_position=' + i;
    xhr.open('GET', '/delete_story_tag/?' + params, true);
    xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
    xhr.send();
}

function getId() {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            getStoryTags();
        }
    }
    params = 'Story_id=' + encodeURIComponent(story_id) + '&Tag_position=' + i;
    xhr.open('GET', '/delete_story_tag/?' + params, true);
    xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
    xhr.send();
}

// Checking if browser support localStorage
function supportsLocalStorage() {
    return ('localStorage' in window) && window['localStorage'] !== null;
}

// Add JSON to localStorage 
function addToLocalStorrage(key, json_value) {
    var json_list = [];
    var parsed_json = JSON.parse(json_value);

    if (localStorage.getItem(key)) {
        for (var i = 0; i < JSON.parse(localStorage.getItem(key)).length; i++) {
            // Next line only for  tags
            if (JSON.parse(localStorage.getItem(key))[i].tag_name === parsed_json.tag_name) {
                continue
            };
            json_list.push(JSON.parse(localStorage.getItem(key))[i]);
        }
    }
    
    json_list.push(parsed_json);
    localStorage.setItem(key, JSON.stringify(json_list));
}