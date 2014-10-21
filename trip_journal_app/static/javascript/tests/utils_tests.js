QUnit.test( 'test getCookie', function(assert) {
    var cookie1 = 1,
        cookie2 = 2;
    document.cookie = 'cookie1=' + cookie1;
    document.cookie = 'cookie2=' + cookie2;
    assert.strictEqual(getCookie('cookie1'), '1');
    assert.strictEqual(getCookie('cookie2'), '2');
});


QUnit.test( 'test getInsideElement', function(assert){
    var topElement = document.getElementById('parent_element'),
        aTagChild = document.getElementById('a_tag_child');
    assert.equal(
        getInsideElement(topElement, 'tagName', 'A'), aTagChild,
        'can find a child element by tagName'
    );
    var idChild = document.getElementById('id_child');
    assert.equal(
        getInsideElement(topElement, 'id', 'id_child'), idChild,
        'can find a child element by Id'
    );
    var firstClassChild = document.getElementById('first_class_child');
    assert.equal(
        getInsideElement(topElement, 'className', 'class_test'), firstClassChild,
        'can get the first child element with className'
    );
});
