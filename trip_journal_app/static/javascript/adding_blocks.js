var submit_button = document.getElementById("button");

submit_button.onclick = function() {
    var new_box = document.createElement('DIV');
    var paragraph = document.createElement('p');
    var new_text = document.getElementById('text_box').value;
    paragraph.appendChild(document.createTextNode(new_text));
    new_box.appendChild(paragraph);
    document.getElementById("added_content").appendChild(new_box);
    document.getElementById('text_box').value = '';
}
