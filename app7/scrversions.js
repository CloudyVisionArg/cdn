var f7Page;

var $page = getPage({
    id: 'scrversions',
    title: 'Versiones de los scripts',
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
}

// Usar solo despues del pageInit
function $get(pSelector) {
    return $(pSelector, f7Page.pageEl);
}

resolveRoute({ resolve: resolve, pageEl: $page, pageInit: pageInit });
