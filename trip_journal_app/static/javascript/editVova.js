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
       // typeOfMarker = 0;
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
number=1
function appendBlock(story, blockContent, block_type){
    var container = document.createElement('div'),
        keybar = document.createElement('div'),
        buttons = [
            ['top', 'moveup'],
            ['bottom', 'movedown'],
            ['delete', 'deleteBlock'],
            ['addmarker', 'setactivemarker'],
            ['removemarker', 'removeBlockMark']
        ];

    function create_button(button_name_and_func) {
        var button_name = button_name_and_func[0],
            button_func = button_name_and_func[1],
            button = document.createElement('button');
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
        '<div onclick="editBlock(' + number + ')" id="contentarea_' + number + '">' +
        blockContent +
        '</div>';

    keybar.id = "keybar_" + number;
    keybar.className = "key_panel";

    buttons.forEach(create_button);

    container.appendChild(keybar);
    story.appendChild(container);

//    Blocks.push(number);
//    BlockMarkers.push(null);
//   BlockTypes.push(block_type);
 //   if (block_type == 'img') {
 //       addImagesFromTemp(number);
 //   }
    
//    current_marker = Blocks.length - 1;
//    number++;
//    if (!saved) {
//        savePage();
    
}



}