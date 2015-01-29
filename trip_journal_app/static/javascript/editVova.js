//Скріпт ,що буде виконуватись після загрузки DOM
window.onload=function(){

var main=document.getElementsByTagName("main")[0];
 //   first.addEventListener("click", mainClick, false)

//назначаємо функції addEvent, removeEvent в залежності від того чи  підтримує браузер addEventListener (для IE<9 використовуєм attachEvent)
var addEvent, removeEvent;   
    if (document.addEventListener) { 
        addEvent = function(elem, type, handler) {
            elem.addEventListener(type, handler, false);
    };
        removeEvent = function(elem, type, handler) {
            elem.removeEventListener(type, handler, false);
    };
    } else {
        addEvent = function(elem, type, handler) {
            elem.attachEvent("on" + type, handler);
    };
        removeEvent = function(elem, type, handler) {
            elem.detachEvent("on" + type, handler);
    };
}

//основна хендлер в якому задаеться яка функція визиваеться при якому кліку
function mainClick(e){
    var event = e || window.event;
    var target = event.target || event.srcElement;
        while(target.id!="content"){
            if(target.id){               
                switch(target.id){
                  //  case "added_artifact": alert("green"); return;
                 //   case "added_image": alert("red"); return;
                }
            }else{
                switch(target.className){
                  //  case "block_title": alert("className"); return;                  
                }
            }                                  
            target=target.parentNode;           
        }           
}

//функція вертає індекс блока по якому клікнули
function indexOfClickedBlock(element){
    while (element.className!="my"){
        element=element.parentNode;
    }
    var my=document.getElementsByClassName("my")
        for(var i=0; i<my.length; i++){
            if(my[i]==element) return i          
        } 
}

//функція вертає з урла браузера story_id
function storyIdFromUrl(){    
    var currUrl = document.URL.split(['/']);
    return currUrl[currUrl.length - 1];
}

var added_artifact=document.getElementById("added_artifact")
    addEvent(added_artifact, "click", showArtifactPanel)

//показує панель артефакта
function showArtifactPanel(){
    clear()
    this.style.background = '#8ed41f';
    artifact_panel.style.display = 'block';
    document.getElementById('textarea_artifact').focus();
}

var added_image=document.getElementById("added_image")
    addEvent(added_image, "click", showImagePanel)

//показує панель фото
function showImagePanel(){
    clear()  
    this.style.background = '#8ed41f';
    photo_panel.style.display = 'block';    
}

var added_text=document.getElementById("added_text")
    addEvent(added_text, "click", showTextPanel)

//показує панель текста
function showTextPanel(){
    clear()
    this.style.background = '#8ed41f';
    text_panel.style.display = 'block';
    document.getElementById('textarea').focus();  
}

//функція вертає всі панелі текста, фото, артефакта в початковий стан
var textarea = document.getElementById('textarea')
var textarea_artifact = document.getElementById('textarea_artifact')
var photo_cont = document.getElementById('photo_cont')

function clear() {
        var arr_1 = document.getElementsByClassName('add_block'),
            arr_2 = document.getElementsByClassName('hide'),
            arr_3 = document.getElementsByClassName('clear_cont'),
            i;
        for (i = 0; i < arr_1.length; i++) {
            arr_1[i].style.background = "#80B098";
        }
        for (i = 0; i < arr_2.length; i++) {
            arr_2[i].style.display = 'none';
        }
        for (i = 0; i < arr_3.length; i++) {
            arr_3[i].value = '';
            arr_3[i].style.display = 'none';
        }
        textarea.value = '';
        textarea_artifact.value = '';
        photo_cont.innerHTML = '';
        photo_cont.style.display = 'none';
       // clearImagesFromTemp();
    }

///////////////////////////////////////////////////////////////////////////////////////
var plus=document.getElementById("adds_block_t")
    plus.onclick=function(){
         save_text_story();     
    }

////////////////////////////////////////////////////////////////////////////
var story_cont = document.getElementById('story_content')

function save_text_story(){       
        story_cont.style.display = 'block';
    var text = escape_html_tags(textarea.value)
        content = text_block_template(text);
        appendBlock(story_cont, content, "text");
        clear();
        
    }

function escape_html_tags(str) {
    return str.replace(/>/g, '&gt;').replace(/</g, '&lt;');
}

function text_block_template(text) {
    return (
        '<p class="description_story">' +
        text + '</p>'
    );
}


function appendBlock(story, blockContent, block_type){
    var container = document.createElement('div');
        container.className = "block_story";
        story.appendChild(container)
        container.innerHTML =blockContent
    var keybar = document.createElement('div')
        keybar.className = "key_panel"
        container.appendChild(keybar);
    var buttons= ['top','bottom','delete','addmarker','removemarker'];
        for(i=0;i<buttons.length;i++){
            var button=document.createElement('button');
                button.className=buttons[i];
                keybar.appendChild(button);
        }    
}




 var fileSelect = document.getElementById('type_file');
     Images = [];
     fileSelect.onchange = add_img;

number=1

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


function save_photo_story() {       
        var i,
            arr = document.getElementsByClassName(number),
            content = '';
        story_cont.style.display = 'block';
        for (i = 0; i < arr.length; i++) {
            content += img_block_template(arr[i].src);
        }
        appendBlock(story_cont, content, "img");
        clear();
    }

function img_block_template(src, img_id) {     
    return (
        '<img src="' + src + '"class="image_story" data-dbid="' +
        img_id + '">'
    );
}
var plusIm=document.getElementById("adds_block_p")
    plusIm.onclick=function(){
        alert("save_image")
        save_photo_story()
        savePage()  
    }

}