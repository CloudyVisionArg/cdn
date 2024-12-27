var folder, sheet, refresh;
var f7Page;
var fld_id = routeTo.query.fld_id;

dSession.foldersGetFromId(fld_id).then(
    function (fld) {
        folder = fld;
        folder.form; // Para que vaya cargando
    },
    errMgr
);

var $page = getPage({
    id: 'import',
    title: 'Importar',
    leftbutton: 'exit',
});

$page.find('.navbar-inner .left .link').on('click', function (e) {
    if (refresh) f7Page.pageFrom.pageEl.drs.reloadView();
    f7Page.view.router.back();
});

var $pageCont = $page.find('.page-content');

// Input file
var $list = $('<div/>', {
    class: 'list no-hairlines-md',
    style: 'margin-top: 0;',
}).appendTo($pageCont);

var $ul = $('<ul/>').appendTo($list);

var $ctl = getInputText('filename', 'Seleccione el archivo a importar', {
    iosicon: 'paperclip',
    mdicon: 'attach_file',
}).appendTo($ul);

$ctl.find('.item-title').remove();

var $fileName = $ctl.find('input');
$fileName.attr('readonly', true);
$fileName.change(e => {
    if (!e.target.value) {
        $inputFile.val('');
        $ulMap.empty();
        sheet = undefined;
        $btnImport.addClass('disabled');
        $btnCopy.addClass('disabled');
        $blockLog.empty();
    }
});

var $inputFile = $('<input/>', {
    type: 'file',
    style: 'display: none',
}).appendTo($ctl);

var $clip = $ctl.find('.item-media');

$clip.click(e => {
    $inputFile.click();
});

$inputFile.change(e => {
    if (e.target.files.length > 0)
        loadXls(e.target.files[0]);
});

// Mapeo de campos
$pageCont.append('<div class="block-title">Mapeo de campos</div>');

var $list = $('<div/>', {
    class: 'list inline-labels no-hairlines-md',
    style: 'margin-top: 0;',
}).appendTo($pageCont);

var $ulMap = $('<ul/>').appendTo($list);

/* suspendido por ahora, la idea es poner un script q se ejecute antes del save
// Opciones

var $acc = $(`
<div class="block block-strong">
    <div class="accordion-item corp-item">
        <a href="" class="item-link item-content">
            <div class="item-inner">
                <div class="item-title">Opciones</div>
            </div>
        </a>
        <div class="accordion-item-content" style="padding-left: 8px;">
            <div class="list no-hairlines-md">
                <ul />
            </div>
        </div>
    </div>
</div>
`).appendTo($pageCont);

var $ul = $acc.find('ul');
getTextarea('code', 'Pre-save script', ':)').appendTo($ul);
*/

// Boton importar
var $block = $('<div/>', {
    class: 'block block-strong',
}).appendTo($pageCont);

var $btnImport = $('<button>', {
    class: 'button button-fill disabled',
}).append('Importar').appendTo($block);

$btnImport.click(doImport);

// Block de log
var $blockLog = $('<div/>', {
    class: 'block',
    style: 'overflow-wrap: anywhere;',
}).appendTo($pageCont);

// Boton Copy
var $block = $('<div/>', {
    class: 'block block-strong',
}).appendTo($pageCont);

var $btnCopy = $('<button>', {
    class: 'button button-fill disabled',
}).append('Copiar log al portapapeles').appendTo($block);

$btnCopy.click(() => {
    navigator.clipboard.writeText($blockLog[0].innerText || $blockLog[0].textContent).then(
        () => { toast('Listo!') },
        (err) => { toast(errMsg(err)) }
    );
});

resolveRoute({ resolve: resolve, pageEl: $page, pageInit: pageInit });

function pageInit(e, page) {
    f7Page = page;
}

async function loadXls(file) {
    $btnImport.addClass('disabled');
    $btnCopy.addClass('disabled');
    $blockLog.empty();
    $ulMap.empty();

    try {
        setInputVal($fileName, file.name);
        const data = await file.arrayBuffer();
        const book = XLSX.read(data);
        sheet = book.Sheets[book.SheetNames[0]];
        sheetFuncs(sheet);

        // Lee los campos habilitados
        try {
            let sett = f7Page.pageFrom.pageEl.drs.import.fields;
            if (sett) {
                var fieldsSett = sett.split(',');
                fieldsSett.forEach((el, ix) => {
                    fieldsSett[ix] = el.trim().toLowerCase();
                });
            }

        } catch(err) {
            console.error(err);
        };

        // Lee los campos del folder
        var form = await folder.form;
        var fields = [];
        form.fields().forEach(f => {
            if (f.custom && !f.headerTable && f.updatable && !f.computed) {
                let fName = f.name.toLowerCase();
                if (!fieldsSett || fieldsSett.find(el => el == fName)) {
                    fields.push(f.name.toLowerCase());
                }
            }
        });
        fields.sort();

        var headers = [];

        // Carga el mapeo
        for (var i = 0; i < sheet._rangeCols(); i++) {
            headers.push(String(sheet._rangeCellsV(0, i)));

            let $selCtl = getSelect(undefined, headers[i]);
            $selCtl.find('.item-title').removeClass('item-floating-label').addClass('item-label');

            var $sel = $selCtl.find('select');
            addOption($sel[0], '(no importar)', '[NULL]'); 
            fields.forEach(it => {
                addOption($sel[0], it);
            })
            $sel.val(headers[i].toLowerCase());
            if ($sel[0].selectedIndex < 0) $sel[0].selectedIndex = 0;

            $selCtl.appendTo($ulMap);
        }

        $btnImport.removeClass('disabled');

    } catch (err) {
        toast(errMsg(err));
        console.error(err);
    }
}

async function doImport() {
    const cronStart = new Date().getTime();

    $btnImport.addClass('disabled');
    $blockLog.empty();
    $blockLog.append('Importando ' + (sheet._rangeRows() - 1) + ' filas...' + '<br/>');

    var mapeo = [];
    $ulMap.find('select').each((ix, el) => {
        mapeo[ix] = getSelectVal($(el));
    });

    for (var i = 1; i < sheet._rangeRows(); i++) {
        $blockLog.append('<br/>Importando fila ' + (i + 1) + '<br/>');

        // Filas no vacias
        if (mapeo.find((el, ix) => (el && sheet._rangeCellsV(i, ix)))) {
            try {
                $blockLog.append('Creando el documento<br/>');
                let doc = await folder.documentsNew();
                mapeo.forEach((el, ix) => {
                    if (el) {
                        let val = sheet._rangeCellsV(i, ix);
                        val = (val === undefined ? null : val);
                        doc.fields(el).value = val;
                        $blockLog.append(el + ' = ' + val + '<br/>');
                    }
                });
                $blockLog.append('Guardando el documento<br/>');
                await doc.save();
                $blockLog.append('OK!<br/>');
                refresh = true;
                //await doc.delete(); // sacar en prod!!

            } catch (err) {
                $blockLog.append('<span style="color: red;">ERROR: ' + errMsg(err) + '</span><br/>');
            }

        } else {
            $blockLog.append('Fila vacia<br/>');
        }
    }

    const cron = new Date().getTime();
    $blockLog.append(`<br/><b>Proceso terminado en ${parseInt((cron - cronStart) / 1000)} segs</b>`);
    $btnCopy.removeClass('disabled')
}

// Usar solo despues del pageInit
function $get(pSelector) {
    return $(pSelector, f7Page.pageEl);
}

function errMgr(err) {
    console.log(err);
    toast(errMsg(err));
};
