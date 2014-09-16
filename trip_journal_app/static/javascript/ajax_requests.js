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
        };
        if (type === "text") {
            block.content = html_block.children[0].innerHTML;
        }
        if (type === "img") {
            block.id = parseInt(html_block.children[1].innerHTML);
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
    var i, formData, xhr, img_block_index, img,
        number_of_img = Images.length;

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
            }
        } 
    }
    for (i=0; i < number_of_img; ++i){
        formData = new FormData();
        img = Images.shift();
        formData.append('file', img.image);
        xhr = new XMLHttpRequest();
        img_block_index = img.block;
        xhr.onreadystatechange = function() {
            add_image_id_from_db(img_block_index);
        };
        xhr.open('POST', '/upload/' + story_id);
        xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        xhr.send(formData);
    }
}

function post_data(){
   var xhr = new XMLHttpRequest(),
       curr_url = document.URL.split(['/']),
       story_id = curr_url[curr_url.length - 1];
       request_body = JSON.stringify(jsonForming());

    function change_url() {
        // This function appends story id to page url
        // if request was sent from /edit/ page.
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                new_id = xhr.responseText;
                if (! document.URL.endsWith(new_id)) {
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
    xhr.open('POST', '/save/' + story_id);
    xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(request_body);

    post_images(story_id);
}

