/**
 * Module for sending ajax POST request with block contents from edit page. 
 */

// for browser that don't support endsWith method for strings
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    } else {
        return undefined;
    }
}

function storyIdFromUrl() {
    var currUrl = document.URL.split(['/']);
    return currUrl[currUrl.length - 1];
}

function storyBlocksJson() {
    var i, type, block, blockContent, blockText,
        title = document.getElementById('story_title').innerHTML,
        blocks = [];

    for (i = 0; i < Blocks.length; i++) {
        type = BlockTypes[i];
	marker = getMarkerLocation(i);
        htmlBlock = document.getElementById('contentarea_' + (Blocks[i]));
        block = {
            'type': type,
	    'marker' : marker
        };
        if (type === 'text') {
            block.content = htmlBlock.children[0].innerHTML;
        }
        if (type === 'img') {
            block.id = parseInt(htmlBlock.children[1].innerHTML);
        }
        blocks.push(block);
    }
    return {
        'title': title,
        'blocks': blocks
    };
}

function postImages(storyId){
    var i, formData, xhr, imgBlockIndex, img,
        numberOfImg = Images.length;

    /**
     * Sets hidden element with
     * picture id from database when picture is saved.
     */
    function addImageIdFromDB(blockNum) {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var blockContainer = document.getElementById(
                'contentarea_' + blockNum.toString()
            );
            picIdInDB = parseInt(xhr.responseText);
            blockContainer.children[1].innerHTML = picIdInDB;
            postData(true);
        } 
    }
    for (i=0; i < numberOfImg; ++i){
        formData = new FormData();
        img = Images.shift();
        formData.append('file', img.image);
        xhr = new XMLHttpRequest();
        imgBlockIndex = img.block;
        xhr.onreadystatechange = function() {
            addImageIdFromDB(imgBlockIndex);
        };
        xhr.open('POST', '/upload/' + storyIdFromUrl());
        xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
        xhr.send(formData);
    }
}

function postData(async){
    var xhr = new XMLHttpRequest(),
        requestBody = JSON.stringify(storyBlocksJson());

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
}


function savePage() {
    if (storyIdFromUrl().length === 0) postData(false);
    if (Images.length > 0) {
        postImages();
    } else {
        postData(true);
    }
}
