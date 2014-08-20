var submit_button = document.getElementById("button");
var story_title = document.getElementById("story_title");
var title_button = document.getElementById("add_title");
var add_title_block = document.getElementById("add_title_block");


// adding new blocks of text
submit_button.onclick = function() {
    var new_box = document.createElement('DIV');
    var paragraph = document.createElement('p');
    var new_text = document.getElementById('text_box').value;
    paragraph.appendChild(document.createTextNode(new_text));
    new_box.appendChild(paragraph);
    document.getElementById("story_content").appendChild(new_box);
    document.getElementById('text_box').value = '';
}

// adding title to story and hiding form after that
title_button.onclick = function() {
    var title_input = document.getElementById("title_text")
    var title_text = title_input.value;
    title_input.value = '';
    if (title_input) {
        story_title.innerHTML = title_text;
        add_title_block.style.display = "none";
    }
}


// if there is no title - show form to add one
if (!story_title.innerHTML) {
    add_title_block.style.display = "block";
}

