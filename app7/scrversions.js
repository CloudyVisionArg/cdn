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
    value = value.replaceAll(String.fromCharCode(8220), '"');
    value = value.replaceAll(String.fromCharCode(8221), '"');
    if (value) {
        try {
            var json = JSON.parse(value);
            if (Array.isArray(json)) {
                localStorage.setItem('scripts', JSON.stringify(json));
                $get('#scripts').val(localStorage.getItem('scripts'));
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
    toast('reiniciar');
});

/*
var $li = $('<li/>').appendTo($ul);
var $div = $('<div/>', {
    class: 'block',
    style: 'margin-top: 20px; margin-bottom: 20px;',
}).appendTo($li);

let $p = $('<p/>', { class: 'row' }).appendTo($div);

let $btnActivar = getBtnHtml('Activa', 'Reactivar', 'light-blue', 'arrow_counterclockwise');
let $btnGanar = getBtnHtml('Ganada', 'Ganar', 'green', 'hand_thumbsup');
let $btnPerder = getBtnHtml('Perdida', 'Perder', 'red', 'hand_thumbsdown');

let est = getDocField(doc, 'ESTADO').Value;
if (est == 'Activa') {
    $p.append($btnGanar);
    $p.append($btnPerder);
} else if (est == 'Ganada' || est == 'Perdida') {
    $p.append($btnActivar);
}

function getBtnHtml(estado, label, color, icon) {
	var $btn = $('<button/>', {
        class: 'col button button-fill color-' + color,
        estado: estado,
    });
    $btn.click(actionClick);

    var $i = $('<i/>', {
        class: 'f7-icons',
        style: 'font-size: 18px;',
    }).appendTo($btn);

    $i.html(icon);
    $('<span/>').html(label).appendTo($btn);

    return $btn;
}
*/





function pageInit(e, page) {
    f7Page = page;

    setInputVal($get('#scripts'), localStorage.getItem('scripts'));
}

// Usar solo despues del pageInit
function $get(pSelector) {
    return $(pSelector, f7Page.pageEl);
}

resolveRoute({ resolve: resolve, pageEl: $page, pageInit: pageInit });
