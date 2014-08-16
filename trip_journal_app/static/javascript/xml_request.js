function getCookie(name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length == 2) return parts.pop().split(';').shift();
}

(function() {
    var httpRequest;
    document.getElementById('publish_button').onclick = function() {
        makeRequest('/edit/');
    };

    function makeRequest(url) {
        if (window.XMLHttpRequest) {
            httpRequest = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
            }
            catch (e) {
                try {
                    httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
                }
                catch (e) {}
            }
        }

        if (!httpRequest) {
            console.log('Giving up :\( Cannot create an XMLHTTP instance');
            return false;
        }
        httpRequest.onreadystatechange = alertContents;
        httpRequest.open('POST', url);
        httpRequest.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        httpRequest.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        var request_body = JSON.stringify({
            title: document.getElementById('story_name').innerHTML,
            content: document.getElementById('added_content').innerHTML,
            tags: document.getElementById('demo').innerHTML,
        });
        httpRequest.send(request_body);
    }

    function alertContents() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                alert('Your changes have been saved!');
            } else {
                alert('There was a problem with the request.');
            }
        }
    }
}
)();

