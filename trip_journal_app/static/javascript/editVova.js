
window.onload=function(){
    first=document.getElementsByTagName("main")[0]
    first.addEventListener("click", mainClick, false)
}

//основна хендлер в якому задаеться яка функція визиваеться при якому кліку
function mainClick(e){
    var event = e || window.event;
    var target = event.target || event.srcElement;
        while(target.id!="content"){
            if(target.id){               
                switch(target.id){
                    case "added_artifact": alert("green"); return;
                    case "added_image": alert("red"); return;
                }
            }else{
                switch(target.className){
                    case "block_title": alert("className"); return;                  
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