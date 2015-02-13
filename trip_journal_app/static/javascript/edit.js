 var Images = [];//Array of pictures that will be uploaded.
 var Markers=[]; //Array of markers, index of marker in this array is equal to the index of the block that it belongs. 

window.onload=function(){
        initialize(); // initialize the google map API
        getStoryTags(); // get story tegs using Ajax request.

//Variables
    var geocoder,
        indexOfMarket=-1, // index of marker with which we wont to work (default=-1)
        add_title = document.getElementById('add_title'),
        story_title=document.getElementById('story_title'),
        tag_input = document.getElementById('tag_input'),
        tag_add = document.getElementById('tag_add'),
        story_cont = document.getElementById('story_content'),       
        added_artifact=document.getElementById("added_artifact"),       
        added_image=document.getElementById("added_image"),       
        added_text=document.getElementById("added_text"),        
        textarea = document.getElementById('textarea'),
        textarea_artifact = document.getElementById('textarea_artifact'),
        photo_cont = document.getElementById('photo_cont'),
        plusText=document.getElementById("adds_block_t"),
        plusPhoto=document.getElementById("adds_block_p"),
        plusArtifact=document.getElementById("adds_block_a"),       
        fileSelect = document.getElementById('type_file'),
        clearBlocks=document.getElementsByClassName("delete_block"),
        findAddres=document.getElementById('findAddres');

//Events
        add_title.addEventListener("click", addTitle);
        story_title.addEventListener("blur", savePage);
        tag_input.addEventListener("change", tags_add);
        tag_add.addEventListener("click", tags_add);
        fileSelect.addEventListener("change", add_img);
        story_cont.addEventListener("mouseover", showKeybar);
        story_cont.addEventListener("mouseout", hideKeybar);
        story_cont.addEventListener("click", buttonsClick);
        added_artifact.addEventListener("click", showArtifactPanel);
        added_image.addEventListener("click", showImagePanel);
        added_text.addEventListener("click", showTextPanel);
        plusText.addEventListener("click", save_text_story);
        plusPhoto.addEventListener("click", save_photo_story);
        photo_cont.addEventListener("click", deleteImageFromPhotoCont);
        plusArtifact.addEventListener("click", save_photo_artifact);
        findAddres.addEventListener("click", codeAddress);
        for(var i=0;i<clearBlocks.length;i++){
            clearBlocks[i].addEventListener("click", clear);
        }
}


//Functions
//add title of story
function addTitle(e){
    var titleInput=document.getElementById("title"),
        add_title = document.getElementById('add_title'),
        story_title=document.getElementById('story_title')
        story_title.innerHTML=titleInput.value
        story_title.style.display="block"
        titleInput.style.display="none"
        add_title.style.display="none"
        e.stopPropagation()
        savePage();
}

//function delete tag
function tag_delete(i) {
    deleteStoryTags(i);
}

//function adds tag
function tags_add(e) {
    var reg = /^[а-яa-z0-9іїє\s]+$/i;
    if (tag_input.value.search(reg) >= 0) {
        putTag(tag_input.value);
    } else {
        alert('input a-z, а-я, 0-9');
    }
    tag_input.focus();
    e.stopPropagation()
}

//show panel of text
function showTextPanel(){
    var textarea = document.getElementById('textarea')
    clear()
    this.style.background = '#8ed41f';
    text_panel.style.display = 'block';
    textarea.focus();  
}

//show panel of image
function showImagePanel(){
    clear()  
    this.style.background = '#8ed41f';
    photo_panel.style.display = 'block';    
}

//show panel of artifact
function showArtifactPanel(){
    var textarea_artifact = document.getElementById('textarea_artifact')
    clear()
    this.style.background = '#8ed41f';
    artifact_panel.style.display = 'block';
    textarea_artifact.focus();
}

//function returns all panels of text, images, artifacts in default condition 
function clear() {
    var added_artifact=document.getElementById("added_artifact"),
        added_image=document.getElementById("added_image"),
        added_text=document.getElementById("added_text"),
        textarea = document.getElementById('textarea'),
        photo_cont = document.getElementById('photo_cont'),
        textarea_artifact = document.getElementById('textarea_artifact')
        hidePanels = document.getElementsByClassName('hide');
        for(var i=0; i<hidePanels.length; i++){
            hidePanels[i].style.display = 'none'; 
        }
        added_text.style.background = "#80B098";
        added_image.style.background = "#80B098";
        added_artifact.style.background = "#80B098";
        textarea.value = '';
        textarea_artifact.value = '';
        photo_cont.innerHTML = '';
        photo_cont.style.display = 'none';
}

//function adds a block of a given type ("text","img","artifact")
function appendBlock(blockContent, block_type){
    var story_cont = document.getElementById('story_content')
    var container = document.createElement('div'),
        keybar = document.createElement('div'),        
        buttons= ['top','bottom','delete','addmarker','removemarker'];
        if(block_type=="artifact"){
           buttons= ['top','bottom','delete','addmarkerArtifact','removemarker']; 
        }
        container.className = "block_story";
        // Write type as an attribute of the element !!!
        container.setAttribute("block_type", block_type) 
        story_cont.appendChild(container)
        container.appendChild(blockContent)   
        keybar.className = "key_panel"
        container.appendChild(keybar);   
        for(i=0;i<buttons.length;i++){
            var button=document.createElement('button');
                button.className=buttons[i];
                keybar.appendChild(button);
        } 
        savePage();    
}

//save text block
function save_text_story(){
    var textarea = document.getElementById('textarea');
    var pText=document.createElement("p")
        pText.innerHTML=escape_html_tags(textarea.value)             
        appendBlock(pText, "text");
        clear();
        savePage();       
    }

function escape_html_tags(str) {
    return str.replace(/>/g, '&gt;').replace(/</g, '&lt;');
}

//save artifact block
function save_photo_artifact(){
    var textarea_artifact = document.getElementById('textarea_artifact')
    var pArtifact=document.createElement("p")
        pArtifact.innerHTML=escape_html_tags(textarea_artifact.value)     
        appendBlock(pArtifact, "artifact")
        clear();
        savePage();          
}

//function shows the image in temporary panel using HTML5 ObjectURL
function add_img() {

        var i, URL, imageUrl, id, file,
            photo_cont = document.getElementById('photo_cont'),
            fileSelect = document.getElementById('type_file')
            files = fileSelect.files; // all files in input
        if (files.length > 0) {
            for (i = 0; i < files.length; i++) {
                file = files[i];
                if (!file.type.match('image.*')) { //Select from files only pictures 
                    continue;
                }
                // Create array Images to be able to choose what pictures will be uploaded.
                // You cannot change the value of an <input type="file"> using JavaScript.
                Images.push(file);
                URL = window.URL;
                if (URL) {
                    var imageUrl = URL.createObjectURL(files[i]); // create object URL for image          
                    var img_block=document.createElement("div");
                        img_block.className="img_block";
                        photo_cont.appendChild(img_block)
                    var img_story=document.createElement("img")
                        img_story.className="img_story";
                        img_story.src=imageUrl;
                        img_block.appendChild(img_story);
                    var button_delete=document.createElement("button");// create button to delete picture
                        button_delete.className="button_3";
                    var x=document.createTextNode("x");
                        button_delete.appendChild(x)
                        img_block.appendChild(button_delete);
                }
            }
        document.getElementById('photo_cont').style.display = 'inline-block';
        }
    }

//function delete image from temporary panel.
function deleteImageFromPhotoCont(e){
    var photo_cont = document.getElementById('photo_cont')
    var index=-1;
    var target = e.target;
        if(target.className=="button_3"){           
            var imgblock=target.parentNode;
            var imgblocks=photo_cont.getElementsByClassName("img_block");
                for(var i=0; i<imgblocks.length; i++){
                    if(imgblocks[i]==imgblock){
                        index=i; // define index of our image
                    }
                }         
            photo_cont.removeChild(imgblock);
            Images.splice(index, 1); //delete image from array Images[] that will be uploaded.
        }   
}

//save photo block, add single image or gallery with many images in one block
function save_photo_story() {
    var story_cont = document.getElementById('story_content')       
    var arr = document.getElementsByClassName("img_story")
        story_cont.style.display = 'block';
        if(arr.length>1){ // gallery will be created if many  pictures  are in the temporary panel.
        var gallery=document.createElement("div");
            gallery.className="gallery_container"          
            for (var i = 0; i < arr.length; i++) {
                 var imageInGallery=document.createElement("img")
                     imageInGallery.className="image_story gallery";
                     imageInGallery.src=arr[i].src;
                     gallery.appendChild(imageInGallery)
            }
            appendBlock(gallery, "img");
        }else{  //only one picture is in temporary panel.
            oneImage=document.createElement("img")
            oneImage.className="image_story"
            oneImage.src=arr[0].src
            appendBlock(oneImage, "img");
        }            
        clear();
    }

//change image when you click on gallery
function galleryChangePicture(element){
    var number;
    var gallery_container=element.parentNode;
        gallery_pictures=gallery_container.getElementsByClassName("gallery")
        countPicture=gallery_pictures.length;
        for(var i=0; i<countPicture; i++){
            if(gallery_pictures[i]==element){
               number=i; //define index of clicked picture
                break;
            }                       
        } 
        for(j=0;j<countPicture;j++){
            gallery_pictures[j].style.display="none"; //hide all picture
        }
        number++;
        if(number==countPicture){
            number=0;
        }    
        gallery_pictures[number].style.display="block" //show picture whith index number.
}

//function shows buttons when the mouse pointer moves over the "block_story"
function showKeybar(e){
    var target = e.target;
        while(target!=this){
            if(target.className=="block_story"){
                var key_panel= target.getElementsByClassName("key_panel")[0];
                    key_panel.style.display="block";                             
            }
        target=target.parentNode;    
        }
}

//function hides buttons when the mouse pointer leaves the "block_story"
function hideKeybar(e){
    var target = e.target;
        while(target!=this){
            if(target.className=="block_story"){
                var key_panel= target.getElementsByClassName("key_panel")[0];               
                    key_panel.style.display="none";
            }
        target=target.parentNode;    
        }
}

//the main function that defines the function for each button and block
function buttonsClick(e){
    var target = e.target;
        while(target.id!="story_content"){
                switch(target.className){
                    case "top": moveBlockUp(target); return;
                    case "bottom": moveBlockDown(target); return;
                    case "delete": deleteBlock(target); return;
                    case "addmarker": setactiveMarker(target); return;
                    case "addmarkerArtifact": setactiveMarker(target); return;
                    case "removemarker": removeMarker(target); return;
                    case "image_story gallery":galleryChangePicture(target); return;
                    case "block_story": editBlock(target); return;                   
                }                                             
            target=target.parentNode;           
        }           
}

//function returns the index of the clicked block
function indexOfClickedBlock(element){
    while (element.className!="block_story"){
        element=element.parentNode;
    }
    var my=document.getElementsByClassName("block_story")
        for(var i=0; i<my.length; i++){
            if(my[i]==element) return i;          
        } 
}

//move block up
function moveBlockUp(element){
    var story_cont = document.getElementById('story_content')
    var index=indexOfClickedBlock(element),
        bloks=story_cont.getElementsByClassName("block_story"),
        block=bloks[index];
        if(index==0) return;
        // Swap blocks
        story_cont.insertBefore(bloks[index].cloneNode(true), bloks[index-1]);
        story_cont.removeChild(block);
        // Swap markers of blocks
        marker_1=Markers[index-1];
        marker_2=Markers[index];
        Markers.splice(index-1, 2, marker_2, marker_1);
        savePage();
}

//move block down
function moveBlockDown(element){
    var story_cont = document.getElementById('story_content')
    var index=indexOfClickedBlock(element),
        bloks=story_cont.getElementsByClassName("block_story"),
        block=bloks[index];
        // Swap blocks        
        story_cont.insertBefore(bloks[index].cloneNode(true), bloks[index+2]);
        story_cont.removeChild(block);
        // Swap markers of blocks
        marker_1=Markers[index];
        marker_2=Markers[index+1];
        Markers.splice(index, 2, marker_2, marker_1);
        savePage();
}

//delete block
function deleteBlock(element){
    var story_cont = document.getElementById('story_content')
    var index=indexOfClickedBlock(element);
        block=story_cont.getElementsByClassName("block_story")[index];
        story_cont.removeChild(block);
        if(Markers[index]){
            Markers[index].setMap(null);         
            Markers.splice(index,1); //delete marker of block          
        }
        savePage();
}

//create textarea in block to edit it
function editBlock(element){       
        if(element.edit || element.getAttribute("block_type")=="img"){
            return; // you can edit only block with type "text" or "artifact"
        }else{
            element.edit="true";
        var textAreaEditBlock=document.createElement("textarea");
            textAreaEditBlock.className="text_area_edit";
            textAreaEditBlock.addEventListener("keypress", endEditBlock)
            textAreaEditBlock.value=element.children[0].innerHTML;// value of textarea = value of block's text  
            element.children[0].style.display="none"
            element.className="block_story block_edited";
            element.insertBefore(textAreaEditBlock, element.children[1])
            element.getElementsByClassName("key_panel")[0].style.display="none"
            textAreaEditBlock.focus();
        }   
}

// return value of textarea to block 
function endEditBlock(e){
    var textarea=e.target;
    var block=textarea.parentNode;
    if (e.keyCode === 13) {
        block.className="block_story";
        block.children[0].innerHTML=textarea.value // value of block's text = value of textarea 
        block.children[0].style.display="block"
        block.removeChild(textarea);
        block.edit=false;
        savePage();
    }

}
    /*
     * Initialize the google map and put markers if blocks that were created
     * on server side has attribyte "data-lng" and "data-lat.
     */
function initialize() {
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
        zoom: 14
    };
    map = new google.maps.Map(
            document.getElementById('map-canvas'),
            mapOptions);
    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
    });

    // put markers if blocks has coordinates
    var blocks=document.getElementsByClassName("block_story");
        for(i=0;i<blocks.length;i++){
            if(blocks[i].getAttribute("data-lng")){
                lng=+blocks[i].getAttribute("data-lng")
                lat=+blocks[i].getAttribute("data-lat")
                markerLocation=new google.maps.LatLng(lat, lng)
                indexOfMarket=i;
                placeMarker(markerLocation)
                indexOfMarket=-1;
            }          
        }       
    if (Markers.length === 0) {
        centerOnCurrPos(map);// Set centers map on current position or L'viv city center.
    } else {
        setBounds(map, Markers);// Sets the map zoom so that all the markers are visible.
    }
    addDrawingManager(map);  
}

// find a place on the google map and set the center map on it 
function codeAddress() {
    var address = document.getElementById('address').value;
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// define marker with which we work 
function setactiveMarker(element){
    indexOfMarket=indexOfClickedBlock(element)
}

// function put marker or change markers position
function placeMarker(location){
    if(indexOfMarket==-1){
        return;
    }else if (Markers[indexOfMarket]) {
        Markers[indexOfMarket].setPosition(location);
        indexOfMarket=-1;
    }else{
        var block=document.getElementsByClassName("block_story")[indexOfMarket];
            if(block.getAttribute("block_type")=="artifact"){           
                Markers[indexOfMarket] = new google.maps.Marker({
                position: location,
                map: map,
                icon: {url: '../static/images/artifact_marker.png'}
                })
            }else{
                Markers[indexOfMarket] = new google.maps.Marker({
                position: location,
                map: map
                }) 
            }
            Markers[indexOfMarket].setMap(map)       
            indexOfMarket=-1       
        }
    savePage();
}

// get coordinates of marker
function getMarkerLocation(index){
    if(Markers[index]){
            var pos = Markers[index].getPosition();
            return {
                'lat': pos.lat(),
                'lng': pos.lng()
            };       
    }
    return null;
}

// function remove marker
function removeMarker(element){
    var index=indexOfClickedBlock(element)
        if(Markers[index]){         
           Markers[index].setMap(null);
           Markers[index]=null;
           savePage();
    }
}




