window.onload = function(){

    var story_cont = document.getElementById('story_content');
    var photo_cont = document.getElementById('photo_cont');
    var comment_t = document.getElementById('add_comment_t');
    var treasure_t = document.getElementById('add_treasure_t');
    var comment_p = document.getElementById('add_comment_p');
    var treasure_p = document.getElementById('add_treasure_p');
    var textarea = document.getElementById('textarea');
    var text = document.getElementById('added_text');
    var photo = document.getElementById('added_image');
    var video = document.getElementById('added_video');
    var text_panel = document.getElementById('text_panel');
    var photo_panel = document.getElementById('photo_panel');
    var video_panel = document.getElementById('video_panel');
    var title = document.getElementById('title');

    document.getElementById('story').onclick = create_story;
    document.getElementById('type_file').onchange = add_img;
    document.getElementById('adds_block_t').onclick = save_text_story;
    document.getElementById('clear_block_t').onclick = clear;
    document.getElementById('adds_block_p').onclick = save_photo_story;
    document.getElementById('clear_block_p').onclick = clear;
    document.getElementById('comment_but_t').onclick = function() {
        comment_t.style.display = 'inline-block';
        comment_t.focus();
    }
    document.getElementById('treasure_but_t').onclick = function() {
        treasure_t.style.display = 'inline-block';
        treasure_t.focus();
    }
    document.getElementById('comment_but_p').onclick = function() {
        comment_p.style.display = 'inline-block';
        comment_p.focus();
    }
    document.getElementById('treasure_but_p').onclick = function() {
        treasure_p.style.display = 'inline-block';
        treasure_p.focus();
    }
    document.getElementById('add_title').onclick = function() {
            document.getElementById('story_title').innerHTML = title.value;
            document.getElementById('story_content').style.display = 'block';
            clear();
        }

    function create_story(){
        this.parentNode.style.display = 'none';
        document.getElementById('title_panel').style.display = 'block';
        document.getElementById('add_panel').style.display = 'block';
        document.getElementById('publish_panel').style.display = 'block';
        title.focus();
        text.onclick = function() {
            clear();
            this.style.background = '#8ed41f';
            text_panel.style.display = 'block';
            document.getElementById('textarea').focus();
        }
        photo.onclick = function() {
            clear();
            this.style.background = '#8ed41f';
            photo_panel.style.display = 'block';
        }
        video.onclick = function() {
            clear();
            this.style.background = '#8ed41f';
            video_panel.style.display = 'block';
        }
    }

    function add_img() {
        var file = document.getElementById('type_file').value;
        var url = file.substr(file.lastIndexOf('\\')+1);
        var im = url.substr(0,url.indexOf('.'));
        var ref = im*number;
        document.getElementById('photo_cont').innerHTML +=
            '<div class="img_block">'+
            '<img src="images/'+url+'" id="'+ref+'" class="img_story '+number+'">'+
            '<button onclick="delete_img('+ref+')" class="button_3">x</button>'+
            '</div>';
        document.getElementById('photo_cont').style.display = 'inline-block';
    }


    function save_text_story() {
        story_cont.style.display = 'block';
        var a = b = '';
        if (comment_t.value !== '') {
            a = 
            '<p class="comments"><b>Коментарі: </b>'+
            '<span>'+comment_t.value+'</span>'+
            '</p>';
        }
        if (treasure_t.value !== '') {
            b = 
            '<p class="treasure"><b>Скарб: </b>'+
            '<span>'+treasure_t.value+'</span>'+
            '</p>';
        }
        var content =   '<p class="description_story">'+textarea.value+'</p>'+a+b;
        appendBlock(story_cont, content);
        clear();
    }

    function save_photo_story() {
        story_cont.style.display = 'block';
        var arr = document.getElementsByClassName(number);
        var image = '';
        for (var i = 0; i < arr.length; i++) {
            image += '<img src="'+arr[i].src+'"class="image_story"><br>';
        }
        var a = b = '';
        if (comment_p.value !== '') {
            a = 
            '<p class="comments"><b>Коментарі: </b>'+
            '<span>'+comment_p.value+'</span>'+
            '</p>';
        }
        if (treasure_p.value !== '') {
            b = 
            '<p class="treasure"><b>Скарб: </b>'+
            '<span>'+treasure_p.value+'</span>'+
            '</p>';
        }
        var content = image + a + b;
	    appendBlock(story_cont, content);
        clear();
    }

    function clear() {
        var arr_1 = document.getElementsByClassName('add_block');
        for(var i=0; i<arr_1.length; i++) {
            arr_1[i].style.background = 'url(images/plus-sign_2.png) 35px 35px no-repeat #83a054';
        }
        var arr_2 = document.getElementsByClassName('hide');
        for(var i=0; i<arr_2.length; i++) {
            arr_2[i].style.display = 'none';
        }
        var arr_3 = document.getElementsByClassName('clear_cont');
        for(var i=0; i<arr_3.length; i++) {
            arr_3[i].value = '';
            arr_3[i].style.display = 'none';
        }
        textarea.value = '';
        photo_cont.innerHTML = '';
        photo_cont.style.display = 'none';
    }

    // mariya

    function appendBlock(story, blockContent){
    	var container = document.createElement("div");
    	container.id = "block_" + number;
    	container.className = "block_story";

    	container.innerHTML = 
    		'<div id="contentarea_'+ number +'">' + 
    			blockContent + 
    		'</div>';
    	
    	var up = document.createElement("button");
    	up.setAttribute('onClick', "moveup('" + number + "')");
    	up.className = "button_4";
    	up.id = "top";
    	container.appendChild(up);

    	var down = document.createElement("button");
    	down.setAttribute('onClick', "movedown('" + number + "')");
    	down.className = "button_4";
    	down.id = "bottom";
    	container.appendChild(down);

    	var editBlock = document.createElement("button");
    	editBlock.setAttribute('onClick', "editBlock('" + number + "')");
    	editBlock.className = "button_4";
    	editBlock.innerHTML = "edit";
    	editBlock.id = "edit_block";
    	container.appendChild(editBlock);

    	var removeBlock = document.createElement("button");
    	removeBlock.setAttribute('onClick', "deleteBlock('" + number + "')");
    	removeBlock.className = "button_4";
    	removeBlock.innerHTML = "x";
    	removeBlock.id = "delete_block";
    	container.appendChild(removeBlock);

    	story.appendChild(container);
    	
    	Blocks.push(number);
    	number++;
    }
}

var number = 1;
var Blocks = new Array();

function deleteBlock(itemstr){
	var item = parseInt(itemstr);
	var block = document.getElementById('contentarea_' + item);
	var poss = Blocks.indexOf(item);
	var block = document.getElementById("block_"+Blocks[poss]);
	block.parentNode.removeChild(block);
	Blocks.splice(poss,1);
}

function moveup(itemstr){
	var item = parseInt(itemstr);
	var block = document.getElementById('contentarea_' + item);
	var poss = Blocks.indexOf(item);
	if(poss - 1 >= 0){
		var blockprev=document.getElementById('contentarea_' + (Blocks[poss -1]));
		var prevconen = blockprev.innerHTML;
		blockprev.innerHTML = block.innerHTML;
		block.innerHTML = prevconen;
	}		
}

function movedown(itemstr){
	var item = parseInt(itemstr);
	var block = document.getElementById('contentarea_' + item);
	
	var poss = Blocks.indexOf(item);
	if(poss + 1 < Blocks.length){
		var blockprev=document.getElementById('contentarea_' + Blocks[poss + 1]);
		var prevconen = blockprev.innerHTML;
		blockprev.innerHTML = block.innerHTML;
		block.innerHTML = prevconen;
	}
}

//igor

function editBlock(itemstr){
	return;
}

function delete_img(id) {
    alert(id);
    var div = document.getElementById(id).parentNode;
    div.parentNode.removeChild(div);
}