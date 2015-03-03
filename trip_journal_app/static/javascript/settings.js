window.onload=function(){
	var formChange=document.getElementById('form_change_language')
	var selectLanguage=document.getElementById('select_language')
	 	selectLanguage.onchange=function(){formChange.submit()}
}