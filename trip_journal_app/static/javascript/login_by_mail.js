window.addEventListener("load", loginByEmail)

function loginByEmail() {
	bind();
	
	function bind(){
		var mailLogo = document.getElementById("mail_logo"),
			closeIcon = document.getElementById("close_icon"),
			sendBtn = document.getElementById("send_btn"),
			loginBtn = document.getElementById("login_btn"),
			loginQst = document.getElementById("login_qst"),
			loginArea = document.getElementById("login_area"),
			mailForm = document.getElementById("mail_form"),
			msg = document.getElementById("msg"),
			overlay = document.getElementById("overlay");

		closeIcon.addEventListener("click", removeClass.bind(null, overlay,"show"));
		mailLogo.addEventListener("click", addClass.bind(null, overlay,"show"));
		sendBtn.addEventListener("click", sendCode.bind(null, mailForm));
		closeIcon.addEventListener("click", function(){msg.innerHTML = ""});
		loginBtn.addEventListener("click", logIn.bind(null, mailForm));
		loginQst.addEventListener("click", toggleClass.bind(null, loginArea,"show"));

	}

	function logIn(form) {
		var email = form["mail"].value,
			code = form["code"].value,
			login = form["login"].value,
			loginArea = document.getElementById("login_area"),
			overlay = document.getElementById("overlay"),
			mailForm = document.getElementById("mail_form"),
			currentPage = window.location,
			xhr,
			body = {
				"mail": email,
				"code": code,
				"login": login,
			}
			msg = document.getElementById("msg");

		msg.innerHTML = "";
		if (isEmailCorrect(email) && code != ''){
			xhr = new XMLHttpRequest();
			xhr.open('POST', '/log_in/', true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4 && xhr.status === 200) {
					if (xhr.responseText == "ok") {
						removeClass(overlay,"show");
						removeClass(loginArea,"show");
						mailForm.reset();
						msg.innerHTML = "";
						window.location.href = currentPage;
					} else{
						msg.innerHTML = xhr.responseText;
					}	
				}
			}
			xhr.send(JSON.stringify(body));
		} else {
			msg.innerHTML = "Please enter correct email address and code.";
		}
	}

	function sendCode(form){
		var email = form["mail"].value,
			xhr,
			body = {
				"mail": email,
			},
			msg = document.getElementById("msg");

		msg.innerHTML = "";
		if (isEmailCorrect(email)){
			xhr = new XMLHttpRequest();
			xhr.open('POST', '/send_code/', true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4 && xhr.status === 200) {
					msg.innerHTML = xhr.responseText;
				}
			}
			xhr.send(JSON.stringify(body));
		} else {
			msg.innerHTML = "Please enter correct email address.";
		}
	}

	function isEmailCorrect(mail){
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(mail);
	}
	
}
