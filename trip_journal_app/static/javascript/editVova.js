
window.onload=function(){
    s=document.getElementById("story_content")
    s.onclick=function(){
        postData(false)
    }   
}

function storyIdFromUrl(){    
    var currUrl = document.URL.split(['/']);
    return currUrl[currUrl.length - 1];
}

