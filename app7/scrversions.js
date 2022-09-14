var f7Page;

var $page = getPage({
    id: 'scrversions',
    title: 'Versiones de los scripts',
});

var $pageCont = $page.find('.page-content');

getTextarea('scripts').appendTo($pageCont);

function pageInit(e, page) {
    f7Page = page;
}

// Usar solo despues del pageInit
function $get(pSelector) {
    return $(pSelector, f7Page.pageEl);
}

resolveRoute({ resolve: resolve, pageEl: $page, pageInit: pageInit });
