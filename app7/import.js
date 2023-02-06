//holaa

var f7Page;

var $page = getPage({
    id: 'import',
    title: 'Importar',
    leftbutton: 'exit',
	//rightbutton: 'save',
});

$page.find('.navbar-inner .left .link').on('click', function (e) {
    f7Page.view.router.back();
});


var $pageCont = $page.find('.page-content');


var $list = $('<div/>', {
    class: 'list no-hairlines-md',
    style: 'margin-top: 0;',
}).appendTo($pageCont);

var $ul = $('<ul/>').appendTo($list);

var $ctl = getInputText('ee', 'Excel', {
    iosicon: 'paperclip',
    mdicon: 'attach_file',
}).appendTo($ul);

var $clip = $ctl.find('.item-media');

var $inputFile = $('<input/>', {
    type: 'file',
}).appendTo($clip);

$clip.click(e => {
    $inputFile.click();
});

resolveRoute({ resolve: resolve, pageEl: $page, pageInit: pageInit });

function pageInit(e, page) {
    f7Page = page;

    //setInputVal($get('#scripts'), localStorage.getItem('scripts'));
}

// Usar solo despues del pageInit
function $get(pSelector) {
    return $(pSelector, f7Page.pageEl);
}

function errMgr(err) {
    console.log(err);
    toast(errMsg(err));
};
