/*
Module for sending ajax POST request with block contents from edit page. 
*/

function getCookie(name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length == 2) return parts.pop().split(';').shift();
}

function jsonForming() {
    var i, type, block, body, block_content, block_text,
        title = document.getElementById('story_title').innerHTML,
        blocks = [];

    for (i = 0; i < Blocks.length; ++i) {
        type = BlockTypes[i];
        html_block = document.getElementById('contentarea_' + (Blocks[i]));
        block = {
            "type": type
        }
        if (type === "text") {
            block["content"] = html_block.children[0].innerHTML;
        }
        if (type === "img") {
            block["id"] = parseInt(html_block.children[1].innerHTML);
        }
        blocks.push(block);
    }
    body = {
        "title": title,
        "blocks": blocks
    };
    return body;
}


function post_images(story_id){
    var i, formData, xhr
    for (i=0; i < Images.length; ++i){	
        formData = new FormData();
        formData.append('file', Images[i].image);
        xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload/' + story_id);
        xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        xhr.send(formData);
    }
}

function post_data(){
        httpRequest = new XMLHttpRequest();
        var curr_url = document.URL.split(['/']);
        var story_id = curr_url[curr_url.length - 1];
        httpRequest.open('POST', '/save/' + story_id);
        httpRequest.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        httpRequest.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        var request_body = JSON.stringify(jsonForming());
        httpRequest.send(request_body);

        post_images(story_id);
}

