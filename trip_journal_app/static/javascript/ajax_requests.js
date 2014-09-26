/*
Module for sending ajax POST request with block contents from edit page. 
*/

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

function jsonForming() {
    var i, type, block, body, blockContent, blockText,
        title = document.getElementById('story_title').innerHTML,
        blocks = [];

    for (i = 0; i < Blocks.length; ++i) {
        type = BlockTypes[i];
        htmlBlock = document.getElementById('contentarea_' + (Blocks[i]));
        block = {
            "type": type
        };
        if (type === "text") {
            block.content = htmlBlock.children[0].innerHTML;
        }
        if (type === "img") {
            block.id = parseInt(htmlBlock.children[1].innerHTML);
        }
        blocks.push(block);
    }
    body = {
        "title": title,
        "blocks": blocks,
    };
    return body;
}

function postImages(storyId){
    var i, formData, xhr, imgBlockIndex, img,
        numberOfImg = Images.length,
        currUrl = document.URL.split(['/']),
        storyId = currUrl[currUrl.length - 1];

    function add_image_id_from_db(block_num) {
        // This function sets hidden element with
        // picture id from database when picture is saved.
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var block_container = document.getElementById(
                    'contentarea_' + block_num.toString()
                );
                pic_id_in_db = parseInt(xhr.responseText);
                block_container.children[1].innerHTML = pic_id_in_db;
                postData(true);
            }
        } 
    }
    for (i=0; i < numberOfImg; ++i){
        formData = new FormData();
        img = Images.shift();
        formData.append('file', img.image);
        xhr = new XMLHttpRequest();
        imgBlockIndex = img.block;
        xhr.onreadystatechange = function() {
            add_image_id_from_db(imgBlockIndex);
        };
        xhr.open('POST', '/upload/' + storyIdFromUrl());
        xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        xhr.setRequestHeader("X_REQUESTED_WITH",'XMLHttpRequest');
        xhr.send(formData);
    }
}

function postData(async){
    var xhr = new XMLHttpRequest(),
       requestBody = JSON.stringify(jsonForming());

    function change_url() {
        // This function appends story id to page url
        // if request was sent from /edit/ page.
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                new_id = xhr.responseText;
                if (!document.URL.endsWith(new_id)) {
                    window.history.pushState(
                        'new_id', 'Title', '/edit/' + new_id
                    );
                }
            } else {
                alert('There was a problem with the request.');
            }
        }
    }

    xhr.onreadystatechange = change_url;
    xhr.open('POST', '/save/' + storyIdFromUrl(), async);
    xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
    xhr.setRequestHeader("X_REQUESTED_WITH",'XMLHttpRequest');
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
