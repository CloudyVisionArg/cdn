var f7Page;

var $page = getPage({
    id: 'scrversions',
    title: 'Version de los scripts',
    leftbutton: 'exit',
	rightbutton: 'save',
});

$page.find('.navbar-inner .left .button').on('click', function (e) {
    f7Page.view.router.back();
});

$page.find('.navbar-inner .right .button').on('click', function (e) {
    var value = $get('#scripts').val();
    value.replaceAll('“', '"');
    debugger;
    if (value) {
        try {
            var json = JSON.parse(value);
            if (Array.isArray(json)) {
                localStorage.setItem('scripts', JSON.stringify(json));
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

function pageInit(e, page) {
    f7Page = page;

    setInputVal($get('#scripts'), localStorage.getItem('scripts'));
}

// Usar solo despues del pageInit
function $get(pSelector) {
    return $(pSelector, f7Page.pageEl);
}

resolveRoute({ resolve: resolve, pageEl: $page, pageInit: pageInit });
