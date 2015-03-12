window.addEventListener("load", galleryOverlay)

function galleryOverlay() {
	msg.innerHTML = "";
	getPicsByUser();
	bind();

	var selectedImages = []


	function bind(){
		
		var galleryLink = document.getElementById("gallery_link");
		var	closeIcon = document.getElementById("close_icon");
		var	uploadBtn = document.getElementById("upload_btn");
		var	msg = document.getElementById("gallery_msg");
		var	gal_overlay = document.getElementById("gal_overlay");
		var	imgs = document.getElementsByClassName("gallery_img_block");
		var	gallery_cont = document.getElementById("gallery_cont");

		closeIcon.addEventListener("click", closeGallery);
		galleryLink.addEventListener("click", showGallery);
		uploadBtn.addEventListener("click", upload);
		for (var i=0;i<imgs.length;i++){
			imgs[i].addEventListener("click", selectImage)
		}
			
	}
	
	function getPicsByUser(){
		xhr = new XMLHttpRequest();
		story_id = storyIdFromUrl();
		xhr.onreadystatechange = function() {
				if (xhr.readyState === 4 && xhr.status === 200) {
					var str = xhr.responseText;
					var content = JSON.parse(str);
					showContent(content["pictures"]);
				}
			}
		xhr.open('GET', '/get_pics_by_user/', false);
		xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send();
	}

	function upload(){
		if (typeof selectedImages !== 'undefined' && selectedImages.length > 0){
			// gId('story_content').style.display = 'block';
    		if (selectedImages.length > 1) {
        		// gallery will be created if many  pictures  are in the temporary panel.
       			var gallery = document.createElement("div");
        		gallery.className = "gallery_container"
        		for (var i = 0; i < selectedImages.length; i++) {
          		    var imageInGallery = document.createElement("img")
        		    imageInGallery.className = "image_story gallery";
       			    imageInGallery.src = selectedImages[i]['src'];
       			    imageInGallery.setAttribute("data-dbid", selectedImages[i]['data-dbid']);
           			gallery.appendChild(imageInGallery);
        		}
        		appendBlock(gallery, "img");
   			} 
   			else {
        		//only one picture is in temporary panel.
        		oneImage = document.createElement("img");
        		oneImage.className = "image_story";
        		oneImage.src = selectedImages[0]['src'];
        		oneImage.setAttribute("data-dbid", selectedImages[0]['data-dbid']);
        		appendBlock(oneImage, "img");
    		}
    		postData(true);
    		console.log(selectedImages[0]['src'])
			closeGallery();
		}
		else{
			msg.innerHTML = "No images were selected";
		}
	}

	function selectImage(e){
		var targetDiv=e.target.parentElement;
		console.log(targetDiv);
		var target = e.target;
		console.log(target);
		// var img_index = selectedImages.indexOf(target.src)
		var img_index = arrayObjectIndexOf(selectedImages,target.src,'src')
		if (img_index > -1 ){
			targetDiv.style.border = 'none';
			selectedImages.splice(img_index,1);
		}
		else{
			targetDiv.style.border = 'solid #0000FF';
			var new_img = {'src':target.src,'data-dbid':target.getAttribute('data-dbid')}
			selectedImages.push(new_img);
		}
		
	}

	function arrayObjectIndexOf(arr, searchTerm, property) {
    	for(var i = 0, len = arr.length; i < len; i++) {
    	    if (arr[i][property] === searchTerm) return i;
   		}
    	return -1;
	}

	function showContent(content){
		for (var i = 0; i < content.length; i++) {
			var img_block = document.createElement("div");
			img_block.className = "gallery_img_block";
            gId('gallery_cont').appendChild(img_block)
            var img_story = document.createElement("img");
            img_story.className = "gallery_img_story";
            img_story.src = content[i][0];
            img_story.setAttribute("data-dbid", content[i][1]);
            img_block.appendChild(img_story)
            
		}
		document.getElementById('gallery_cont').style.display = 'inline-block';
	}

	function closeGallery(){
		gal_overlay.style.display = "none";
		selectedImages = [];
		msg.innerHTML = "";
	}

	function showGallery(){
		gal_overlay.style.display = "block";
		var imgs = document.getElementsByClassName("gallery_img_block");
		for (var i=0;i<imgs.length;i++){
			imgs[i].style.border = "none"
		}
	}

		
}
