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

getInputFile('ee', 'Excel').appendTo($ul);


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

function getInputFile(pId, pLabel) {
    var $itemInput, $itemInner, $inputWrap;

    $itemInput = $('<li/>', {
        class: 'item-content item-input',
    });
    
    $itemInner = $('<div/>', {
        class: 'item-inner',
    }).appendTo($itemInput);

    $('<div/>', {
        class: 'item-title item-floating-label',
    }).append(pLabel).appendTo($itemInner);
    
    $inputWrap = $('<div/>', {
        class: 'item-input-wrap',
    }).appendTo($itemInner);
    
    $('<input/>', {
        type: 'file',
        id: pId,
        placeholder: pLabel,
        autocomplete: 'off',
    }).appendTo($inputWrap);

    $('<span/>', {
        class: 'input-clear-button',
    }).appendTo($inputWrap);
    
    return $itemInput;
}
