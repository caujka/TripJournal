var number = 1,
    Blocks = [],
    BlockTypes = [],
    Images = [];

function deleteImagesFromBlock(blockNumber){
    for (var i=0; i < Images.length; ++i){
        if (Images[i].block === blockNumber){
            Images.splice(i,1);
        }
    }
}

function swapImagesFromBlock(blockNumber1, blockNumber2){
    for (var i=0;i<Images.length; ++i){
        if(Images[i].block === blockNumber1) {
            Images[i].block = blockNumber2;
        }
        else if (Images[i].block === blockNumber2) {
            Images[i].block = blockNumber1;
        }
    }
}

function addImagesFromTemp(){
    var i;
    for(i=0; i < Images.length; ++i){
        if (Images[i].state === 'temp') {
            Images[i].state = 'loaded';
            Images[i].block = number;
        }
    }
}

function appendBlock(story, blockContent, block_type) {
    var container = document.createElement("div"),
        keybar = document.createElement("div"),
        buttons = [
            ['top', 'moveup'],
            ['bottom', 'movedown'],
            ['edit', 'editBlock'],
            ['delete', 'deleteBlock']
        ];

    function create_button(button_name_and_func) {
        var button_name = button_name_and_func[0],
            button_func = button_name_and_func[1],
            button = document.createElement("button");
        button.setAttribute('onClick', button_func + "('" + number + "')");
        button.id = button_name;
        keybar.appendChild(button);
    }

    container.setAttribute(
        'onMouseOver',
        "change_button_visibility('" + number + "', \"visible\")"
    );
    container.setAttribute(
        'onMouseOut',
        "change_button_visibility('" + number + "', \"hidden\")"
    );
    container.id = "block_" + number;
    container.className = "block_story";

    container.innerHTML =
        '<div contenteditable="true" id="contentarea_' + number + '">' +
        blockContent +
        '</div>';

    keybar.id = "keybar_" + number;
    keybar.className = "key_panel";

    buttons.forEach(create_button);

    container.appendChild(keybar);
    story.appendChild(container);

    Blocks.push(number);
    BlockTypes.push(block_type);
	if (block_type == 'img') {
        addImagesFromTemp(number);
    }
    number++;
}

function deleteBlock(itemstr) {
    var item = parseInt(itemstr),
        poss = Blocks.indexOf(item),
        block = document.getElementById("block_" + Blocks[poss]);
    block.parentNode.removeChild(block);
    Blocks.splice(poss, 1);
    BlockTypes.splice(poss, 1);
    deleteImagesFromBlock(item);
}


function move_block(itemstr, direction) {
    // direction (-1) - up, (+1) - down
    var item = parseInt(itemstr),
        block = document.getElementById('contentarea_' + item),
        poss = Blocks.indexOf(item);
    if ((poss + direction) in Blocks) {
        var blockprev = document.getElementById('contentarea_' + (Blocks[poss + direction])),
            prevconen = blockprev.innerHTML,
            block_type = BlockTypes[poss];
        blockprev.innerHTML = block.innerHTML;
        block.innerHTML = prevconen;
        BlockTypes[poss] = BlockTypes[poss + direction];
        BlockTypes[poss + direction] = block_type;
        swapImagesFromBlock(Blocks[poss + direction], Blocks[poss]);
    }
}

function moveup(itemstr) {
    move_block(itemstr, -1);
}

function movedown(itemstr) {
    move_block(itemstr, 1);
}

function change_button_visibility(itemstr, visibility) {
    var item = parseInt(itemstr);
    document.getElementById('keybar_' + item).style.visibility = visibility;
}

function delete_img(id) {
    if (id) {
        var div = document.getElementById(id);
        div.parentNode.removeChild(div);
    }
}

function escape_html_tags(str) {
    return str.replace(/>/g, '&gt;').replace(/</g, '&lt;');
}

window.onload = function() {

    var story_cont = document.getElementById('story_content'),
        photo_cont = document.getElementById('photo_cont'),
        comment_t = document.getElementById('add_comment_t'),
        treasure_t = document.getElementById('add_treasure_t'),
        //comment_p = document.getElementById('add_comment_p'),
        //treasure_p = document.getElementById('add_treasure_p'),
        textarea = document.getElementById('textarea'),
        text = document.getElementById('added_text'),
        photo = document.getElementById('added_image'),
        video = document.getElementById('added_video'),
        text_panel = document.getElementById('text_panel'),
        photo_panel = document.getElementById('photo_panel'),
        video_panel = document.getElementById('video_panel'),
        title = document.getElementById('title'),

        fileSelect = document.getElementById('type_file');
        form = document.getElementById('file-form'),
        upload=document.getElementById('publish'),
        uploadButton = document.getElementById('upload-button'),
        filesget = fileSelect.files,
        formData = new FormData(),
        arr = [],
        file = document.getElementById('type_file');


    function clearImagesFromTemp() {
	    var poss = 0;
	    while (true) {
	        if (poss == Images.length) {
		    break;
	        }
	        if (Images[poss].state === 'temp') {
		        Images.splice(poss, 1);
		        continue;
	        }
	    poss++;
	    }
    }

    function clear() {
        var arr_1 = document.getElementsByClassName('add_block'),
            arr_2 = document.getElementsByClassName('hide'),
            arr_3 = document.getElementsByClassName('clear_cont'),
            i;

        for (i = 0; i < arr_1.length; i++) {
            arr_1[i].style.background = "url(\"../static/images/plus-sign_2.png\") 35px 35px no-repeat #83a054";
        }
        for (i = 0; i < arr_2.length; i++) {
            arr_2[i].style.display = 'none';
        }
        for (i = 0; i < arr_3.length; i++) {
            arr_3[i].value = '';
            arr_3[i].style.display = 'none';
        }
        textarea.value = '';
        photo_cont.innerHTML = '';
        photo_cont.style.display = 'none';
        clearImagesFromTemp();
    }
	
    function save_text_story() {
        story_cont.style.display = 'block';
        var text = escape_html_tags(textarea.value);
        var content = (
            '<p class="description_story">' + 
            text + '</p>'
        );
        appendBlock(story_cont, content, "text");
        clear();
    }

    function save_photo_story() {
        var i,
            arr = document.getElementsByClassName(number),
            content = '';
        story_cont.style.display = 'block';
        for (i = 0; i < arr.length; i++) {
            content += '<img src="' + arr[i].src + '"class="image_story"><br>';
        }
        appendBlock(story_cont, content, "img");
        clear();
    }

    function add_img() {
        var i, URL, imageUrl, id, file, imageData,
            files = fileSelect.files;
        if (files.length > 0) {
            for (i = 0; i < files.length; i++) {
            file = files[i];
            if (!file.type.match('image.*')) {
                continue;
            }
        imageData = {image : file, state : 'temp', block : -1};
        Images.push(imageData);
        URL = window.URL;
        if (URL) {
            imageUrl = URL.createObjectURL(files[i]);
            id = 'story_' + number + '_' + files[i].name.substr(0, files[i].name.indexOf('.'));
            document.getElementById('photo_cont').innerHTML +=
            '<div id="' + id + '" class="img_block">' +
            '<img src="' + imageUrl + '" class="img_story ' + number + '">' +
            '<button onclick="delete_img(\'' + id + '\')" id="' + id + '_d" class="button_3">x</button>' +
            '</div>';
            }
        }
        document.getElementById('photo_cont').style.display = 'inline-block';
    }
    }

    textarea.onkeypress = function(e) {
        if (e.keyCode === 13) {
            save_text_story();
            return false;
        }
    };

	form.onsubmit = function(event) {
        event.preventDefault();
        uploadButton.innerHTML = 'Uploading...';
    };

    title.focus();

    text.onclick = function() {
        clear();
        this.style.background = '#8ed41f';
        text_panel.style.display = 'block';
        document.getElementById('textarea').focus();
    };

    photo.onclick = function() {
        clear();
        this.style.background = '#8ed41f';
        photo_panel.style.display = 'block';
    };

    video.onclick = function() {
        clear();
        this.style.background = '#8ed41f';
        video_panel.style.display = 'block';
    };

    fileSelect.onchange = add_img;

    document.getElementById('title_panel').style.display = 'block';
    document.getElementById('add_panel').style.display = 'block';
    document.getElementById('publish_panel').style.display = 'block';

    // document.getElementById('type_file').onchange = add_img;
    document.getElementById('adds_block_t').onclick = save_text_story;
    document.getElementById('clear_block_t').onclick = clear;
    document.getElementById('adds_block_p').onclick = save_photo_story;
    document.getElementById('clear_block_p').onclick = clear;

    document.getElementById('add_title').onclick = function() {
        document.getElementById('story_title').innerHTML = (
            escape_html_tags(title.value)
        );
        document.getElementById('story_content').style.display = 'block';
        clear();
    };
    document.getElementById('comment_but_t').onclick = function() {
        comment_t.style.display = 'inline-block';
        comment_t.focus();
    };
    document.getElementById('treasure_but_t').onclick = function() {
        treasure_t.style.display = 'inline-block';
        treasure_t.focus();
    };
};

