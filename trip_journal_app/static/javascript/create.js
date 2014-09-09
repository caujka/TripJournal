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
    var file = document.getElementById('type_file');
    var arr = new Array;

	textarea.onkeypress = function(e) {
	    if (e.keyCode == 13) {
		save_text_story();
		return false;
	    }
	}

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
    file.onchange = add_img;

	
	document.getElementById('title_panel').style.display = 'block';
	document.getElementById('add_panel').style.display = 'block';
	document.getElementById('publish_panel').style.display = 'block';

    document.getElementById('type_file').onchange = add_img;
    document.getElementById('adds_block_t').onclick = save_text_story;
    document.getElementById('clear_block_t').onclick = clear;
    document.getElementById('adds_block_p').onclick = save_photo_story;
    document.getElementById('clear_block_p').onclick = clear;
    
    
    document.getElementById('add_title').onclick = function() {
            document.getElementById('story_title').innerHTML = title.value;
            document.getElementById('story_content').style.display = 'block';
            clear();
        }
    document.getElementById('comment_but_t').onclick = function() {
        comment_t.style.display = 'inline-block';
        comment_t.focus();
    }
    document.getElementById('treasure_but_t').onclick = function() {
        treasure_t.style.display = 'inline-block';
        treasure_t.focus();
    }
  
  
    function add_img() {
        files = file.files;
        if(files.length > 0) {
            for (var i = 0; i < files.length; i++) {

                var URL = window.URL, imageUrl, image;
                if (URL) {
                    imageUrl = URL.createObjectURL(files[i]);

                    var id = 'story_'+number+'_'+files[i].name.substr(0,files[i].name.indexOf('.'));
                    document.getElementById('photo_cont').innerHTML +=
                        '<div id="'+id+'" class="img_block">'+
                        '<img src="'+imageUrl+'" class="img_story '+number+'">'+
                        '<button onclick="delete_img(\''+id+'\')" id="'+id+'_d" class="button_3">x</button>'+
                        '</div>';
                }

            }

            document.getElementById('photo_cont').style.display = 'inline-block';
        } 
            console.log(files);
            console.log(arr);
    }


    function save_text_story() {
        story_cont.style.display = 'block';
        var a = b = '';
      
        var content =   '<p class="description_story">'+textarea.value+'</p>'+a+b;
	jsontext=textarea.value;
        appendBlock(story_cont, content, "text");
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
        
        var content = image + a + b;
	    appendBlock(story_cont, content, "image");
        clear();
    }

    function clear() {
        var arr_1 = document.getElementsByClassName('add_block');
        for(var i=0; i<arr_1.length; i++) {
            arr_1[i].style.background = 'url("{% static "images/plus-sign_2.png" %}") 35px 35px no-repeat #83a054';
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

    function appendBlock(story, blockContent, block_type){
    	var container = document.createElement("div");
	container.setAttribute('onMouseOver',"show_button('" + number + "')");
	container.setAttribute('onMouseOut',"hide_button('" + number + "')");
    	container.id = "block_" + number;
    	container.className = "block_story";

    	container.innerHTML = 
    		'<div contenteditable="true" id="contentarea_'+ number +'">' + 
    			blockContent + 
    		'</div>';
    	var keybar = document.createElement("div");
	keybar.id="keybar_"+number;
	keybar.className="key_panel"
    	var up = document.createElement("button");
    	up.setAttribute('onClick', "moveup('" + number + "')");
    	
    	up.id = "top";
    	keybar.appendChild(up);
	
    	var down = document.createElement("button");
    	down.setAttribute('onClick', "movedown('" + number + "')");
    	
    	down.id = "bottom";
    	keybar.appendChild(down);

    	var editBlock = document.createElement("button");
    	editBlock.setAttribute('onClick', "editBlock('" + number + "')");
    	
    	editBlock.id = "edit";
    	keybar.appendChild(editBlock);

    	var removeBlock = document.createElement("button");
    	removeBlock.setAttribute('onClick', "deleteBlock('" + number + "')");
    	
    	removeBlock.id = "delete";
    	keybar.appendChild(removeBlock);

	container.appendChild(keybar);
    	story.appendChild(container);
    	
    	Blocks.push(number);
	BlockTypes.push(block_type);
    	number++;
    }
}

var number = 1;
var Blocks = new Array();
var BlockTypes = new Array();

function jsonForming(){
	var title = document.getElementById('story_title').innerHTML;
	blocks = new Array();
	for (var i=0;i<Blocks.length; ++i){
		var type = BlockTypes[i];
		var block_content = "";
		if(type === "text"){
			var blockitem=document.getElementById('contentarea_' + (Blocks[i]));
			var block_text = blockitem.children[0];
			block_content = block_text.innerHTML;
		}
		if(type === "image"){
			var blockitem=document.getElementById('contentarea_' + (Blocks[i]));
			var block_text = blockitem.children[0];
			block_content = block_text.src;
		}
		var block = {"type": type, "content": block_content};		
		blocks.push(block);

	}
	var body = {"title": title, "blocks": blocks};
	return body;
}

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
}

function deleteBlock(itemstr){
	var item = parseInt(itemstr);
	var block = document.getElementById('contentarea_' + item);
	var poss = Blocks.indexOf(item);
	var block = document.getElementById("block_"+Blocks[poss]);
	block.parentNode.removeChild(block);
	Blocks.splice(poss,1);
	BlockTypes.splice(poss,1);
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

		block_type = BlockTypes[poss];
		BlockTypes[poss] = BlockTypes[poss - 1];
		BlockTypes[poss - 1] = block_type;
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
		block_type = BlockTypes[poss];
		BlockTypes[poss] = BlockTypes[poss + 1];
		BlockTypes[poss + 1] = block_type;
	}
}



function show_button(itemstr)
{var item = parseInt(itemstr);
	
	document.getElementById('keybar_'+item).style.visibility="visible";
}
function hide_button(itemstr){
var item = parseInt(itemstr);
	document.getElementById('keybar_'+item).style.visibility="hidden";
}



//igor



function delete_img(id) {
    if(id) {
        var div = document.getElementById(id);
        div.parentNode.removeChild(div);
    }
}
