window.onload = function(){
    document.getElementById('story').onclick = create_story;

    var comment_t = document.getElementById('add_comment_t');
    var treasure_t = document.getElementById('add_treasure_t');
    var comment_p = document.getElementById('add_comment_p');
    var treasure_p = document.getElementById('add_treasure_p');

    document.getElementById('type_file').onchange = add_img;

    var img;
    function add_img() {
        var file = document.getElementById('type_file').value;
        var url = file.substr(file.lastIndexOf('\\')+1);
        document.getElementById('photo_cont').innerHTML +=
            '<div class="img_block">'+
            '<img src="images/'+url+'" alt="" class="img_story">'+
            '<button id="delete_img" class="button_3">x</button>'+
            '</div>';
        document.getElementById('photo_cont').style.display = 'inline-block';
        img = url;
    }

    function create_story(){
        this.parentNode.style.display = 'none';
        document.getElementById('title_panel').style.display = 'block';
        document.getElementById('title').focus();
        document.getElementById('add_panel').style.display = 'block';
        document.getElementById('publish_panel').style.display = 'block';
        document.getElementById('add_title').onclick = function() {
            var text = document.getElementById('title').value;
            document.getElementById('story_title').innerHTML = text;
            clear();
            document.getElementById('story_content').style.display = 'block';
        }


        var text = document.getElementById('added_text');
        var photo = document.getElementById('added_image');
        var video = document.getElementById('added_video');
        var text_panel = document.getElementById('text_panel');
        var photo_panel = document.getElementById('photo_panel');
        var video_panel = document.getElementById('video_panel');

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



    var adds_block_t = document.getElementById('adds_block_t');
    adds_block_t.onclick = save_text_story;
    var clear_block_t = document.getElementById('clear_block_t');
    clear_block_t.onclick = clear;

    var adds_block_p = document.getElementById('adds_block_p');
    adds_block_p.onclick = save_photo_story;
    var clear_block_p = document.getElementById('clear_block_p');
    clear_block_p.onclick = clear;
    
    document.getElementById('comment_but_t').onclick = function() {
        comment_t.style.display = 'inline-block';
    }
    document.getElementById('treasure_but_t').onclick = function() {
        treasure_t.style.display = 'inline-block';
    }
    document.getElementById('comment_but_p').onclick = function() {
        comment_p.style.display = 'inline-block';
    }
    document.getElementById('treasure_but_p').onclick = function() {
        treasure_p.style.display = 'inline-block';
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
        document.getElementById('textarea').value = '';
    }

    function save_text_story() {
        var story = document.getElementById('story_content');
        story.style.display = 'block';
        var text = document.getElementById('textarea').value;
        
        var content = 	'<p class="description_story">'+text+'</p>'+
                '<p class="comments"><b>Коментарі: </b>'+
                    '<span>'+comment_t.value+'</span>'+
                '</p>'+
                '<p class="treasure"><b>Скарб: </b>'+
                    '<span>'+treasure_t.value+'</span>'+
                '</p>';
	appendBlock(story, content);
        clear();
    }

    function save_photo_story() {
        var story = document.getElementById('story_content');
        story.style.display = 'block';

        var content = '<img src="images/'+img+'" alt="" class="image_story">'+
                '<p class="comments"><b>Коментарі: </b>'+
                    '<span>'+comment_p.value+'</span>'+
                '</p>'+
                '<p class="treasure"><b>Скарб: </b>'+
                    '<span>'+treasure_p.value+'</span>'+
                '</p>' ;
	appendBlock(story, content);

        clear();
        var photo = document.getElementById('photo_cont');
        photo.innerHTML = '';
        photo.style.display = 'none';
    }

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
	up.innerHTML = "up";
	up.id = "top";
	container.appendChild(up);

	var down = document.createElement("button");
	down.setAttribute('onClick', "movedown('" + number + "')");
	down.className = "button_4";
	down.innerHTML = "down";
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

var number = 0;
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

function editBlock(itemstr){
	return;
}

