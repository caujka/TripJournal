
window.onload=function(){
        first=document.getElementById("content")
        first.addEventListener("click", mainClick, false)
}

//основна функція яка шукае елемент по якому клікнули і виконує функцію
function mainClick(e){
        var event = e || window.event;
        var target = event.target || event.srcElement;
        while(target.id!="content"){           
                switch(target.id){
                    case "added_artifact": alert("green"); return;
                    case "added_image": alert("red"); return;           
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