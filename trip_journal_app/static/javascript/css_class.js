function toggleClass(el, cls){
	if (hasClass(el,cls)) {
		removeClass(el, cls);
	} else {
		addClass(el,cls);
	}
}

function addClass(el,cls) {
	if (!hasClass(el,cls)) {
		el.className += " " + cls;
	}
}

function removeClass(el,cls) {
	if (hasClass(el,cls)) {
		var arCls = [];
		arCls = el.className.split(' ');
		for (var i=0; i<arCls.length; i++) {
			if (arCls[i] == cls) arCls.splice(i--, 1);
		}
		el.className = arCls.join(' ');
	}	
}

function hasClass(el, cls) {
	for (var arCls = el.className.split(' '),i=arCls.length-1; i>=0; i--) {
		if (arCls[i] == cls) return true;
	}
	return false;
}