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
    addEvent(added_artifact, "click", function(){alert("gogo")})






}