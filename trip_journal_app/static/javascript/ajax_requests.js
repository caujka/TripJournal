/**
 * Module for sending ajax POST request with block contents from edit page. 
 */

// for browser that don't support endsWith method for strings
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
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
            block.id = parseInt(
                getInsideElement(htmlBlock, 'tagName', 'IMG').dataset.dbid
                );
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
            var imgElement = getInsideElement(
                    document.getElementById(
                        'contentarea_' + blockNum.toString()
                        ), 'tagName', 'IMG'
                    );
            picIdInDB = parseInt(xhr.responseText);
            imgElement.dataset.dbid = picIdInDB;
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

function getStoryTags() {

    alert('getStoryTags');
    var xhr = new XMLHttpRequest();
    story_id = storyIdFromUrl();
    xhr.onstatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var tags_arr = xhr.responseText;
        }
    }
    xhr.open('GET', '/get_story_tags/', true);
    xhr.send(story_id);
}

function jsonTagStory(tag_name) {
    var block = {};
    block.story_id = storyIdFromUrl();
    block.tag_name = tag_name;
    return block;
}

function putTag(tag_name) {

    alert('putTag 1');
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/put_tag/', true);
    xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
    xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {

            alert('putTag 2');
            tag_input.value = '';
        }
    }
    savePage();
    request_body = JSON.stringify(jsonTagStory(tag_name));
    xhr.send(request_body);
}
