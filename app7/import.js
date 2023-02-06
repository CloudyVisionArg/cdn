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

getInputText('ee', 'Excel', {
    iosicon: 'paperclip',
    mdicon: 'attach_file',
}).appendTo($ul);


function pageInit(e, page) {
    f7Page = page;

    //setInputVal($get('#scripts'), localStorage.getItem('scripts'));
}

// Usar solo despues del pageInit
function $get(pSelector) {
    return $(pSelector, f7Page.pageEl);
}

resolveRoute({ resolve: resolve, pageEl: $page, pageInit: pageInit });

/* Con plugin chooser https://github.com/cyph/cordova-plugin-chooser
chooser.getFileMetadata().then(
    function (res) {
        if (res) {
            getFile(res.uri).then(
                function (file) {
                    att.URL = file.localURL;
                    att.Name = res.name;
                    att.Size = file.size;
                    renderNewAtt(att, $attachs);
                },
                errMgr
            )
        }
    },
    errMgr
)
*/
