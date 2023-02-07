var fld_id = routeTo.query.fld_id;
var folder;

dSession.foldersGetFromId(fld_id).then(
    function (fld) {
        folder = fld;
        folder.form; // Para que vaya cargando
    },
    errMgr
);

var f7Page;

var $page = getPage({
    id: 'import',
    title: 'Importar',
    leftbutton: 'exit',
	rightbutton: 'save',
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

var $ctl = getInputText('filename', 'Seleccione el archivo a importar', {
    iosicon: 'paperclip',
    mdicon: 'attach_file',
}).appendTo($ul);

var $itemTitle = $ctl.find('.item-title');
$itemTitle.remove();

var $fileName = $ctl.find('input');
$fileName.attr('readonly', true);
$fileName.change(e => {
    if (!e.target.value) $inputFile.val('');
    $ul.empty();
});

var $clip = $ctl.find('.item-media');

var $inputFile = $('<input/>', {
    type: 'file',
    style: 'display: none',
}).appendTo($ctl);

$inputFile.change(async e => {
    // Lee el excel
    const file = e.target.files[0];
    $fileName.val(file.name);
    const data = await file.arrayBuffer();
    /* data is an ArrayBuffer */
    const book = XLSX.read(data);
    const sheet = book.Sheets[book.SheetNames[0]];
    sheetFuncs(sheet);

    // Lee los campos del folder
    var form = await folder.form;
    var fields = [];
    form.fieldsMap.forEach(f => {
        if (f.custom && !f.headerTable) {
            fields.push(f.name.toLowerCase());
        }
    });
    fields.sort();

    $ul.empty();
    var headers = [];

    // Carga el mapeo
    for (var i = 0; i < sheet._rangeCols(); i++) {
        headers.push(sheet._rangeCells(0, i).v);

        let $selCtl = getSelect(undefined, headers[i]);
        $selCtl.find('.item-title').removeClass('item-floating-label').addClass('item-label');

        var $sel = $selCtl.find('select');
        addOption($sel[0], '(no importar)', '[NULL]'); 
        fields.forEach(it => {
            addOption($sel[0], it);
        })
        $sel.val(headers[i]);
        if ($sel[0].selectedIndex < 0) $sel[0].selectedIndex = 0;

        $selCtl.appendTo($ul);
    }
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
