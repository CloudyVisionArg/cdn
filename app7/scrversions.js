var f7Page;

var $page = getPage({
    id: 'scrversions',
    title: 'Version de los scripts',
    leftbutton: 'exit',
	rightbutton: 'save',
});

$page.find('.navbar-inner .left .link').on('click', function (e) {
    f7Page.view.router.back();
});

$page.find('.navbar-inner .right .link').on('click', function (e) {
    var value = $get('#scripts').val();
    value = value.replaceAll(String.fromCharCode(8220), '"');
    value = value.replaceAll(String.fromCharCode(8221), '"');
    if (value) {
        try {
            var json = JSON.parse(value);
            if (Array.isArray(json)) {
                localStorage.setItem('scripts', JSON.stringify(json));
                fillControls();
                toast('Cambios guardados');
            } else {
                toast('Error: El valor debe ser un array de objetos');
            }
        } catch (e) {
            toast(errMsg(e));
            console.log(e);
        };
    } else {
        localStorage.setItem('scripts', '');
        toast('Cambios guardados');
    }
});

var $pageCont = $page.find('.page-content');

var $ul = $('<ul/>');

$('<div/>', {
    class: 'list no-hairlines-md',
    style: 'margin-top: 0;',
}).append($ul).appendTo($pageCont);

getTextarea('scripts').appendTo($ul);

var $btn = getButton('Reiniciar').appendTo($ul).find('.button');
$btn.click(function () {
    location.href = 'index.html';
});

function pageInit(e, page) {
    f7Page = page;
    fillControls();
}

function fillControls() {
    var scr = localStorage.getItem('scripts');
    try { var obj = JSON.parse(scr); } catch(er) {};
    setInputVal($get('#scripts'), (obj ? JSON.stringify(obj, null, 2) : scr));
}

// Usar solo despues del pageInit
function $get(pSelector) {
    return $(pSelector, f7Page.pageEl);
}

resolveRoute({ resolve: resolve, pageEl: $page, pageInit: pageInit });
