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
    style: 'display: none',
}).appendTo($ctl);

$inputFile.change(async e => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    /* data is an ArrayBuffer */
    const book = XLSX.read(data);
    const sheet = book.Sheets[book.SheetNames[0]];
    sheetFuncs(sheet);

    sheet._rangeRows();
    sheet._rangeRows();
    sheet._rangeCells(0, 0);

    $ul.empty();

    var headers = [];
    for (var i = 0; i < sheet._rangeCols(); i++) {
        headers.push(sheet._rangeCells(0, i).v);

        let $selCtl = getSelect('c' + i, headers[i]);
        let $title = $selCtl.find('.item-title');
        $title.removeClass('item-floating-label'),
        $title.addClass('item-label');
        
        $sel.find('select');
        addOption($sel[0], 'Campo ' + i);

        $selCtl.appendTo($ul);
    }


    
    debugger;

    <li class="item-content item-input">
        <div class="item-inner">
            <div class="item-title item-label">Gender</div>
            <div class="item-input-wrap input-dropdown-wrap">
                <select placeholder="Please choose...">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>
        </div>
    </li>

});

$pageCont.append('<div class="block-title">Mapeo de campos</div>');

var $list = $('<div/>', {
    class: 'list inline-labels no-hairlines-md',
    style: 'margin-top: 0;',
}).appendTo($pageCont);

var $ul = $('<ul/>').appendTo($list);

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
