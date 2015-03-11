function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    } else {
        return undefined;
    }
}

function scrollToElement(elem) {
    var htmlElement = document.getElementsByTagName('html')[0],
        currentY = document.getElementsByTagName('html')[0].scrollTop,
        targetY = elem.offsetTop;
    htmlElement.scrollTop = targetY;
    return;
}

function getInsideElement(parentElement, property, propertyName) {
    var i,
    children = parentElement.children;
    if (property === 'className') {
        for (i = 0; i < children.length; i++) {
            if (children[i].classList.contains(propertyName)) {
                return children[i];
            }
        }
    }
    for (i = 0; i < children.length; i++) {
        if (children[i][property] === propertyName) {
            return children[i];
        }
    }
    return;
}

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
