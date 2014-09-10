/*
Module for sending ajax POST request with block contents from edit page. 
*/

function getCookie(name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length == 2) return parts.pop().split(';').shift();
}

var xhr;
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

