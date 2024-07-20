'use strict';

// Fresh: https://cdn.cloudycrm.net/ghcv/cdn/client/generic6.js?_fresh=1

/*
Documentacion de componentes

COMUN
˜˜˜˜˜
jQuery: https://api.jquery.com
Numeral: http://numeraljs.com
Moment: https://momentjs.com

APP
˜˜˜
Framework7: https://framework7.io/docs/
MD Icons (abrir en chrome): https://fonts.google.com/icons?icon.platform=web&icon.set=Material+Icons
F7 Icons: https://w3.cloudycrm.net/c/app7/lib/framework7/css/cheatsheet.htm

WEB
˜˜˜
Bootstrap: https://getbootstrap.com/docs/5.3/getting-started/introduction/
Iconos: https://icons.getbootstrap.com / https://fontawesome.com/v4/icons/
DTPicker: https://getdatepicker.com/5-4/
bootstrap-select: https://developer.snapappointments.com/bootstrap-select/
Select2 (AutoComplete): https://select2.org
CKEditor: https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR.html
*/

var fld_id, folder, doc_id, doc;
var utils, urlParams, preldr;
var controls, controlsFolder, controlsRights;
var $page, $navbar, f7Page, pageEl, evSrc, saving, saved;
var generic = 'generic6';

var inApp = typeof window.app7 == 'object';

(async () => {
    if (inApp) { // APP
        utils = dSession.utils;
        fld_id = routeTo.query.fld_id;
        doc_id = routeTo.query.doc_id;
    
        preldr = app7.preloader;
        preldr.show();
        
    } else { // WEB
        await include([
            { id: 'jquery', src: 'https://code.jquery.com/jquery-3.7.1.min.js' },
            { id: 'bootstrap', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js' },
            { id: 'bootstrap-css', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' },
            { id: 'web-javascript', depends: ['jquery', 'bootstrap'] },
        ]);

        // dark-mode
        $('html').attr('data-bs-theme', localStorage.getItem('dark-mode') == '1' ? 'dark' : 'light');

        preldr = preloader;
        preldr.show();

        if (!window.doorsapi2) window.doorsapi2 = await import(scriptSrc('doorsapi2'));
        if (!window.dSession) {
            window.dSession = new doorsapi2.Session();
            utils = dSession.utils;

            if (!await dSession.webSession() || !await dSession.isLogged) {
                errMgr(new Error('La sesion no ha sido iniciada'));
                return;
            }
        }
        await dSession.runSyncEventsOnClient(false);
        
        urlParams = new URLSearchParams(window.location.search);
        fld_id = urlParams.get('fld_id');
        doc_id = urlParams.get('doc_id');
    }

    if (fld_id) {
        try {
            folder = await dSession.folder(fld_id);

            if (folder.type == 1) {
                if (doc_id) {
                    doc = await folder.documents(doc_id);
                } else {
                    doc = await folder.documentsNew();
                }

                if (!window.modControls6) {
                    //todo: sacar fresh
                    window.modControls6 = await import(gitCdn({ repo: 'Global', path: '/client/controls6.mjs', url: true, fresh: true }));
                    await modControls6.init();
                }
        
                await loadControls();

            } else {
                errMgr(new Error('La carpeta ' + fld_id + ' no es una carpeta de documentos'));
            }

        } catch (err) {
            errMgr(err)
        }

    } else {
        errMgr(new Error('Se requiere fld_id'));
    }
})();


function errMgr(pErr) {
    if (inApp) {
        console.error(pErr);
        app7.preloader.hide();
        resolve({ content: errPage(utils.errMsg(pErr)) });

    } else {
        console.error(pErr);
        toast(utils.errMsg(pErr), { delay: 10000 });
        preloader.hide();
    }
}


async function loadControls() {
    let cf = objPropCI(doc.tags, 'controlsFolder');

    try {
        // Tag
        try {
            if (cf) controlsFolder = await folder.app.folders(cf);
        } catch(er) {};

        // controls hija
        try {
            if (!controlsFolder) {
                controlsFolder = await folder.folders('controls');
            }
        } catch(er) {};

        if (controlsFolder && controlsFolder.type == 1) {
            controls = await controlsFolder.search({ order: 'parent, order, column', maxTextLen: 0 });
        } else {
            // Hub
            controls = await modControls6.controlsHub(folder);
        }
        
        if (controls) getControlsRights(controls);

    } catch(err) {
        console.error(err);
    }

    inApp ? await appRenderPage() : await webRenderPage();
}


function getControlsRights(pControls) {
	var cr = objPropCI(doc.tags, 'controlsRights');
	if (cr) {
		try {
			controlsRights = $.parseXML(cr);
		} catch (err) {
			console.log('Error parsing controlsRights: ' + errMsg(err));
		}
	}

	var ctl;
	if (controlsRights) {
        // Mergea controlsRights en controls
		var $cr = $(controlsRights);
		var name, r, w;
		$cr.find('item').each(function (ix, el) {
			name = el.getAttribute('control').toLowerCase();
			r = el.getAttribute('r');
			w = el.getAttribute('w');
			if (r || w) {
				ctl = controls.find(function (el) {
					if (el['NAME']) return el['NAME'].toLowerCase() == name;
				});
				if (ctl) {
					if (r) ctl['R'] = r;
					if (w) ctl['W'] = w;
				}
			}
		});
	}
	
	// Setea todo lo que no se especifico a 1
	controls.forEach(ctl => {
		if (!ctl['R']) ctl['R'] = '1';
		if (!ctl['W']) ctl['W'] = '1';
	})
}


async function appRenderPage() {
    // page
    $page = getPage({
        id: 'generic6_' + getGuid(),
        title: 'Cargando...',
        leftbutton: 'exit',
        rightbutton: 'save',
    });

    evSrc = $page[0];

    $page.find('.navbar-inner .left .link').on('click', function (e) {
        // todo: ver si se puede detectar si hubo cambios
        /*
        app7.dialog.confirm('Perdera los cambios realizados', (dialog) => {
            f7Page.view.router.back();
        }
        */
        exitForm();
    });

    $page.find('.navbar-inner .right .link').on('click', function (e) {
        saveDoc();
    });

    // Boton Guardar y salir
    let $nbRight = $page.find('.navbar-inner .right');

    let $saveExitBtn = $('<a/>', {
        href: '#',
        class: 'link icon-only',
        style: app7.theme == 'ios' ? 'margin-left: 8px;' : 'margin-right: 6px;',
    }).appendTo($nbRight);
    $saveExitBtn.append('<i class="material-icons-outlined" style="font-size: 30px;">cloud_done</i>');

    $saveExitBtn.click(function () {
        saveDoc(true);
    });

    // Page Content
    let $pageCont = $page.find('.page-content');

    if (!controls) {

        // SIN CONTROLES

        // TABBAR

        let $tabbar = $('<div/>', {
            class: 'toolbar tabbar toolbar-top',
            style: 'top: 0;',
        }).appendTo($pageCont);

        let $tabbarInner = $('<div/>', {
            class: 'toolbar-inner',
        }).appendTo($tabbar);

        $('<a/>', {
            class: 'tab-link tab-link-active',
            href: '#' + $page.attr('id') + ' #tabMain',
        }).append('Datos').appendTo($tabbarInner);

        $('<a/>', {
            class: 'tab-link',
            href: '#' + $page.attr('id') + ' #tabHeader',
        }).append('Header').appendTo($tabbarInner);

        $('<a/>', {
            class: 'tab-link',
            href: '#' + $page.attr('id') + ' #tabHist',
        }).append('Historial').appendTo($tabbarInner);


        // TABS

        let $tabs = $('<div/>', {
            class: 'tabs',
        }).appendTo($pageCont);

        // tabMain

        let $tabMain = $('<div/>', {
            class: 'tab tab-active',
            id: 'tabMain',
        }).appendTo($tabs);

        let $div = $('<div/>', {
            class: 'list no-hairlines-md',
            style: 'margin-top: 0;',
        }).appendTo($tabMain);

        let $ul = $('<ul/>').appendTo($div);

        for (let [key, field] of doc.fields()) {
            if (field.custom && !field.headerTable && field.name != 'DOC_ID') {
                modControls6.newDefaultControl(field).$root.appendTo($ul);
            }
        }

        let ctl = modControls6.newAttachments('attachments', {
            label: 'Adjuntos',
            collapse: false,
        });
        ctl.$root.appendTo($ul);

        // tabHeader

        let $tabHeader = $('<div/>', {
            class: 'tab',
            id: 'tabHeader',
        }).appendTo($tabs);

        $div = $('<div/>', {
            class: 'list no-hairlines-md',
            style: 'margin-top: 0;',
        }).appendTo($tabHeader);

        $ul = $('<ul/>').appendTo($div);

        for (let [key, field] of doc.fields()) {
            if (!field.custom && field.headerTable) {
                modControls6.newDefaultControl(field).$root.appendTo($ul);
            }
        }

        // tabHist

        let $tabHist = $('<div/>', {
            class: 'tab',
            id: 'tabHist',
        }).appendTo($tabs);

        $div = $('<div/>', {
            class: 'list no-hairlines-md',
            style: 'margin-top: 0;',
        }).appendTo($tabHist);

        $ul = $('<ul/>').appendTo($div);

        ctl = modControls6.newDocLog('docLog', {
            label: 'Cambios de datos',
            collapse: false,
        });
        ctl.$root.appendTo($ul);

    } else {

        // CON CONTROLES

        try {
            // BeforeRender del hub
            if (controls.beforeRender) await evalCode(controls.beforeRender);

            // Control Event BeforeRender
            let ev = getEvent('BeforeRender');
            if (ev) await evalCode(ev);

        } catch (err) {
            console.error(err);
            toast('BeforeRender error: ' + utils.errMsg(err));
        }

        // Membrete

        let $ul = $('<ul/>')
        await renderControls($ul, '[NULL]');

        if ($ul.html()) {
            $('<div/>', {
                class: 'list no-hairlines-md',
                style: 'margin-top: 0; margin-bottom: 5px;',
            }).append($ul).appendTo($pageCont);
        }

        // TABS

        let tabs = controls.filter(function (el) {
            return el['CONTROL'].toUpperCase() == 'TAB' && el['DONOTRENDER'] != 1 &&
                el['R'] != '0' && el['HIDEINAPP'] != '1'
        });

        if (tabs.length > 0) {
            let $tabbar = $('<div/>', {
                class: 'toolbar tabbar toolbar-top',
                style: 'top: 0;',
            }).appendTo($pageCont);

            let $tabbarInner = $('<div/>', {
                class: 'toolbar-inner',
            }).appendTo($tabbar);

            let $tabs = $('<div/>', {
                class: 'tabs',
            }).appendTo($pageCont);

            let tab, label, $tab, $ul;
            for (let i = 0; i < tabs.length; i++) {
                tab = tabs[i];
                label = tab['DESCRIPTION'] ? tab['DESCRIPTION'] : tab['NAME'];
                $('<a/>', {
                    class: 'tab-link' + (i == 0 ? ' tab-link-active' : ''),
                    href: '#' + $page.attr('id') + ' #' + tab['NAME'],
                }).append(label).appendTo($tabbarInner);

                $tab = $('<div/>', {
                    class: 'tab' + (i == 0 ? ' tab-active' : ''),
                    id: tab['NAME'],
                }).appendTo($tabs);

                $ul = $('<ul/>')
                await renderControls($ul, tab['NAME']);

                if ($ul.html()) {
                    $('<div/>', {
                        class: 'list no-hairlines-md',
                        style: 'margin-top: 0;',
                    }).append($ul).appendTo($tab);
                }
            }
        }
    }

    resolveRoute({ resolve: resolve, pageEl: $page, pageInit: appPageInit });
}


async function appPageInit(e, page) {
    f7Page = page;
    pageEl = page.pageEl;
    pageEl.drs = {};

    // En ios el navbar esta fuera del page
    $navbar = (f7Page.navbarEl ? $(f7Page.navbarEl) : $(f7Page.pageEl).find('.navbar'))

    f7Page.view.on('swipebackMove', (ev) => {
        appExplorerRefresh();
    })

    // Evento afterRender
    let context = {};
    $page[0].dispatchEvent(new CustomEvent('afterRender', { detail : context}));
    if (context.return && typeof context.return.then == 'function') await context.return;

    // Control Event AfterRender
    let ev = getEvent('AfterRender');
    if (ev) await evalCode(ev);

    await fillControls();
    preldr.hide();

    if (!pageEl.drs) pageEl.drs = {};
    Object.assign(pageEl.drs, {
        fillControls, saveDoc, fld_id, folder, 
        doc_id, doc, $navbar, f7Page, exitForm,
    });
}


async function webRenderPage() {
    var $body = $('body');
    var $d = $(document);
    evSrc = document;

    $d.ready(function () {
        // Key shortcuts
        $d.keypress(function (e) {
            if (e.code == 'KeyS' && e.ctrlKey) { // CTRL+S
                e.preventDefault();
                saveDoc();
            }
        });
    });

    var $cont = $('<div/>', {
        class: 'container',
    }).appendTo($body);

    // Barra de botones
    $cont.append(`
        <div id="mainButtons" class="btn-group" role="group" aria-label="..." style="position:fixed; top:10px; right:10px; z-index:1000;">
            <button type="button" id="print" class="btn btn-primary" onclick="webPrintForm();">
                <i class="bi bi-printer-fill"></i>
                <span class="d-none d-md-inline-block"> Imprimir</span>
            </button>
            <button type="button" id="save" class="btn btn-primary" onclick="saveDoc();" title="CTRL+S" data-bs-toggle="tooltip">
                <i class="bi bi-cloudy-fill"></i>
                <span class="d-none d-md-inline-block"> Guardar</span>
            </button>
            <button type="button" id="saveexit" class="btn btn-primary" onclick="saveDoc(true);">
                <i class="bi bi-cloud-check-fill"></i>
                <span class="d-none d-md-inline-block"> Guardar y salir</span>
            </button>
            <button type="button" id="cancel" class="btn btn-primary" onclick="exitForm();">
                <i class="bi bi-caret-right-fill"></i>
                <span class="d-none d-md-inline-block"> Salir</span>
            </button>
    </div>
    `);

    $cont.append(`
        <div class="row" style="padding-top: 8px; max-width: 50%">
            <h4 id="title">Cargando...</h4>
        </div>
        <hr>
    `);
    
    if (!controls) {

        // SIN CONTROLES

        $cont.append(`
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <button type="button" class="nav-link active" data-bs-toggle="tab" 
                        data-bs-target="#tabMain">Datos</button>
                </li>
                <li class="nav-item">
                    <button type="button" class="nav-link" data-bs-toggle="tab" 
                        data-bs-target="#tabHeader">Header</button>
                </li>
                <li class="nav-item">
                    <button type="button" class="nav-link" data-bs-toggle="tab" 
                        data-bs-target="#tabHist">Historial</button>
                </li>
            </ul>
        `);

        $cont.append(`
            <div class="tab-content">
                <div class="tab-pane fade show active" id="tabMain"></div>
                <div class="tab-pane fade" id="tabHeader"></div>
                <div class="tab-pane fade" id="tabHist"></div>
            </div>
        `);

        var $tab, $row, $col;

        // tabMain

        $tab = $cont.find('#tabMain');
        $row = undefined;

        doc.fields().forEach(field => {
            if (!field.headerTable && field.name != 'DOC_ID') {
                $row = webGetRow($row, $tab);
                $col = $('<div/>', {
                    class: 'col-12 col-md-6 form-group',
                }).appendTo($row);

                let ctl = modControls6.newDefaultControl(field);
                ctl.$root.addClass('mt-3').appendTo($col);
            }
        });

        $row = webGetRow(undefined, $tab);
        $col = $('<div/>', {
            class: 'col-12 form-group',
        }).appendTo($row);

        let ctl = modControls6.newAttachments('attachments', {
            label: 'Adjuntos',
        });
        ctl.$root.addClass('mt-3').appendTo($col);

        // tabHeader

        $tab = $cont.find('#tabHeader');
        $row = undefined;

        doc.fields().forEach(field => {
            if (field.headerTable) {
                $row = webGetRow($row, $tab);
                $col = $('<div/>', {
                    class: 'col-12 col-md-6 form-group',
                }).appendTo($row);

                let ctl = modControls6.newDefaultControl(field);
                ctl.$root.addClass('mt-3').appendTo($col);
            }
        })

        // tabHist

        $tab = $cont.find('#tabHist');
        $row = undefined;

        $row = webGetRow($row, $tab);
        $col = $('<div/>', {
            class: 'col-12 form-group',
        }).appendTo($row);

        ctl = modControls6.newDocLog('docLog', {
            label: 'Cambios de datos',
            collapse: false,
        });
        ctl.$root.addClass('mt-3').appendTo($col);

    } else {

        // CON CONTROLES

        try {
            // BeforeRender del hub
            if (controls.beforeRender) await evalCode(controls.beforeRender);

            // Control Event BeforeRender
            let ev = getEvent('BeforeRender');
            if (ev) await evalCode(ev);

        } catch (err) {
            console.error(err);
            toast('BeforeRender error: ' + utils.errMsg(err));
        }

        // Membrete

        await renderControls($cont, '[NULL]');

        // TABS

        let tabs = controls.filter(function (el) {
            return el['CONTROL'].toUpperCase() == 'TAB' && el['DONOTRENDER'] != 1 && el['R'] != '0'
        });

        if (tabs.length > 0) {
            let $navTabs = $('<ul/>', {
                class: 'nav nav-tabs mt-3',
            }).appendTo($cont);

            let $tabCont = $('<div/>', {
                class: 'tab-content',
            }).appendTo($cont);

            let tab, label, $tab, $li;
            for (let i = 0; i < tabs.length; i++) {
                tab = tabs[i];
                label = tab['DESCRIPTION'] ? tab['DESCRIPTION'] : tab['NAME'];

                $li = $('<li/>', {
                    class: 'nav-item',
                }).appendTo($navTabs);

                $('<button/>', {
                    type: 'button',
                    class: 'nav-link' + (i == 0 ? ' active' : ''),
                    'data-bs-toggle': 'tab',
                    'data-bs-target': '#' + tab['NAME'],
                }).append(label).appendTo($li);

                $tab = $('<div/>', {
                    class: 'tab-pane fade' + (i == 0 ? ' show active' : ''),
                    id: tab['NAME'],
                }).appendTo($tabCont);

                await renderControls($tab, tab['NAME']);
            }
        }
    };

    // Footer
    $('<hr/>').appendTo($cont);

    $cont.append(`
        <span style="padding-bottom: 25px;">
            Powered by <a href="https://cloudy.ar" target="_blank">CloudyVision</a>
        </span>
    `);

    // Boton dark-mode
    let $btn = $(`<button type="button" class="btn" title="Modo oscuro">
        <i class="bi bi-cloud-moon" aria-hidden="true"></i>
    </button>`).appendTo($cont);

    $btn.click(() => {
        let dm = localStorage.getItem('dark-mode');
        if (dm == '1') {
            $('html').attr('data-bs-theme', 'light');
            localStorage.setItem('dark-mode', 0);
        } else {
            $('html').attr('data-bs-theme', 'dark');
            localStorage.setItem('dark-mode', 1);
        }
    });

    // Boton Designer
    $btn = $(`<button type="button" class="btn" title="Designer">
        <i class="bi bi-tools" aria-hidden="true"></i>
    </button>`).appendTo($cont);

    $btn.click(() => {
        let ls = localStorage.getItem('designer');
        if (ls == '1') {
            localStorage.setItem('designer', '0');
            $('html').attr('data-drs-mode', 'runtime');
        } else {
            localStorage.setItem('designer', '1');
            showDesigner();
        }

    });

    // Boton Borrar
    let $delBtn = $('<button/>', {
        type: 'button',
        id: 'deleteDoc',
        class: 'btn',
        title: 'Enviar a la papelera',
        style: 'float: right;',
    }).appendTo($cont);

    $delBtn.append('<i class="bi bi-trash" aria-hidden="true"></i>');

    $delBtn.click(function () {
        if (confirm('ATENCION!! Esta a punto de enviar este documento a la papelera, desea continuar?')) {
            doc.delete().then(
                async function (res) {
                    toast('El documento ha sido enviado a la papelera');

                    // Evento afterDelete
                    let context = {};
                    document.dispatchEvent(new CustomEvent('afterDelete', { detail : context }));
                    if (context.return && typeof context.return.then == 'function') await context.return;

                    exitForm();
                },
                function (err) {
                    logAndToast(errMsg(err));
                }
            )
        }
    });

    // Tooltips
    $get('[data-bs-toggle="tooltip"]').each(function (ix) {
        new bootstrap.Tooltip(this);
    });
    
    // Evento afterRender
    let context = {};
    document.dispatchEvent(new CustomEvent('afterRender', { detail : context}));
    if (context.return && typeof context.return.then == 'function') await context.return;

    // Control Event AfterRender
    let ev = getEvent('AfterRender');
    if (ev) await evalCode(ev);

    // designer
    if (localStorage.getItem('designer') == '1') {
        showDesigner();
    } else {
        $('html').attr('data-drs-mode', 'runtime');
    }
        
    await fillControls();
    preldr.hide();
}

function webPrintForm() {
    debugger; // Utilizar este boton para activar el debugger

	var frm = top.window.frames['frameDer'];
	if (!frm) frm = window;
	if (!frm) {
		toast('No se pudo imprimir el formulario');
		return;
	}
	frm.focus();
	frm.window ? frm.window.print() : frm.print();
}

function webGetRow(pRow, pCont, pCol) {
    var $row;

    if (pCol == undefined) {
        if (pRow && pRow.children().length < 2) {
            return pRow;
        } else {
            return $('<div/>', {
                class: 'row',
            }).appendTo(pCont);
        }

    } else {
        if (pCol == '2' && pRow && pRow[0].lastCol == '1') {
            $row = pRow;
        } else {
            $row = $('<div/>', {
                class: 'row',
            }).appendTo(pCont);
            if (pCol == 2) {
                $('<div/>', {
                    class: 'col-12 col-md-6 form-group',
                }).appendTo($row);
            }
            $row[0].lastCol = pCol;
        };
        
        return $row;
    }
}

async function renderControls(container, parent) {
    let subset = controls.filter(el => {
        return el['PARENT'] == parent && el['CONTROL'].toUpperCase() != 'TAB' &&
            el['CONTROL'].toUpperCase() != 'EVENT' && el['DONOTRENDER'] != 1 &&
            el['R'] != '0' && (inApp ? el['HIDEINAPP'] != '1' : true);
    });

    let $row;

    await utils.asyncLoop(subset.length, async loop => {
        let ctl = subset[loop.iteration()];
        let type = ctl['CONTROL'].toUpperCase();
        if (ctl['XMLATTRIBUTES']) {
            try {
                ctl.domAttr = $.parseXML(ctl['XMLATTRIBUTES']);
            } catch (err) {
                console.log('Error parsing ' + ctl['NAME'] + '.XMLATTRIBUTES: ' + utils.errMsg(err));
            }
        };
        ctl.attr = function (attribute) {
            if (this.domAttr) return this.domAttr.documentElement.getAttribute(attribute);
        };

        let label = ctl['DESCRIPTION'] ? ctl['DESCRIPTION'] : ctl['NAME'];
        
        let control, options, $this, $input, bsctl, f7ctl, tf, textField, vf, valueField, context;

        tf = ctl.attr('textfield');
        if (tf && tf != '[NULL]') {
            textField = doc.fields(tf);
        };

        vf = ctl.attr('valuefield');
        if (vf && vf != '[NULL]') {
            valueField = doc.fields(vf);
        };

        let $cont;

        if (inApp) {
            $cont = $(container);
        } else {
            $row = webGetRow($row, container, ctl['COLUMN']);
            $cont = $('<div/>', {
                class: 'col-12 col-md-' + (ctl['COLUMN'] == '0' ? '12': '6') + ' form-group',
            }).appendTo($row);
        }


        // -- Textbox --

        if (type == 'TEXTBOX') {

            options = {
                label,
                textField: tf,
            }
            if (ctl.attr('mode') == '3') options.type = 'password';

            if (ctl.attr('isnumber') == '1' || (textField && textField.type == 3))
                options.numeral = true;

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                options.readOnly = true;
            }

            if (ctl.attr('maxlength')) {
                options.maxLength = ctl.attr('maxlength');
            } else if (textField && textField.type == 1 && textField.length > 0) {
                options.maxLength = textField.length;
            }
    
            if (ctl.attr('datalist') == '1' && ctl.attr('mode') == '1' && textField) {
                options.dataList = {
                    folder,
                    field: textField.name,
                }
            }

            let buttons = ctl.attr('buttons');
            if (buttons && buttons != '[NULL]') {
                if (buttons == 'email') {
                    options.buttons = 'email';
                } else if (buttons == 'phone') {
                    options.buttons = ['phone', 'whatsapp'];
                }
            }

            await eventBRC(options);
            if (ctl.attr('mode') == '2') { // Multiline
                control = modControls6.newTextarea(ctl['NAME'], options);
            } else {
                control = modControls6.newInput(ctl['NAME'], options);
            }

            $this = control.$root;
            $input = control.$input;

            if (!inApp) {
                control.$root.addClass('mt-3');
                if (ctl.attr('height')) $input.css('height', ctl.attr('height') + ctl.attr('unitheight'));
            }


        // -- DTPicker --

        } else if (type == 'DTPICKER') {

            let type = 'date';
            if (ctl.attr('mode') == '2') {
                type = 'datetime-local';
            } else if (ctl.attr('mode') == '3') {
                type = 'time';
            }

            options = {
                label, type,
                textField: tf,
            }

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                options.readOnly = true;
            }

            await eventBRC(options);
            control = modControls6.newDTPicker(ctl['NAME'], options);
            $this = control.$root;
            $input = control.$input;

            if (!inApp) control.$root.addClass('mt-3');


        // -- Select / SelectMultiple / SelectFolder / SelectKeywords / SelectMultipleFolder / LookupboxAccounts --

        } else if (type == 'SELECT' || type == 'SELECTMULTIPLE' || type == 'SELECTFOLDER' 
            || type == 'SELECTKEYWORDS' || type == 'SELECTMULTIPLEFOLDER' || type == 'LOOKUPBOXACCOUNTS') {

            options = {
                label,
                multiple: ctl.attr('mode') == '2' || type == 'SELECTMULTIPLEFOLDER',
                readOnly: ctl['W'] == 0 || ctl.attr('readonly') == '1',
                search: (ctl.attr('searchbar') == '1' || type == 'LOOKUPBOXACCOUNTS'),
                textField: tf,
                valueField: vf,
                fill: {},
            };

            if (type == 'SELECTKEYWORDS') {
                options.fill = {
                    source: await folder.app.folder(ctl.attr('folder')),
                    fields: 'description, id',
                    formula: 'type = ' + dSession.db.sqlEncode(ctl.attr('keywordtype'), 1) +
                        ' and (disabled = 0 or disabled is null)',
                    order: ctl.attr('order') ? ctl.attr('order') : 'description',
                };

            } else if (type == 'SELECTFOLDER' || type == 'SELECTMULTIPLEFOLDER') {
                options.fill = {
                    source: await folder.app.folder(ctl.attr('searchfolder')),
                    fields: ctl.attr('fieldlist'),
                    formula: ctl.attr('searchfilter'),
                    order: ctl.attr('searchorder'),
                };

            } else if (type == 'LOOKUPBOXACCOUNTS') {
                options.fill = {
                    source: 'accounts',
                    formula: '(disabled = 0 or disabled is null) and system = 0',
                };
                if (ctl.attr('formula')) {
                    options.fill.formula += ' and (' + ctl.attr('formula') + ')';
                }
            }

            await eventBRC(options);
            control = modControls6.newSelect(ctl['NAME'], options);
            $this = control.$root;
            $input = control.$select;

            if (!inApp) control.$root.addClass('mt-3');


        // -- Checkbox --

        } else if (type == 'CHECKBOX') {

            options = {
                label,
                textField: tf,
            };

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                options.readOnly = true;
            }

            await eventBRC(options);
            control = modControls6.newSwitch(ctl['NAME'], options);

            $input = control.$input
            $this = control.$root;

            if (!inApp) control.$root.css('margin-top', '2rem');


        // -- Fieldset --

        } else if (type == 'FIELDSET') {

            options = ctl['DESCRIPTION'] ? { label: ctl['DESCRIPTION'] } : { noBorders: true };

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                options.readOnly = true;
            }

            await eventBRC(options);
            control = modControls6.newFieldset(ctl['NAME'], options);

            if (!inApp && !options.noBorders) control.$root.addClass('mt-3');

            await renderControls(control.$content, ctl['NAME']);


        // -- Attachments --

        } else if (type == 'ATTACHMENTS') {

            options = { label };

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                options.readOnly = true;
            }

            await eventBRC(options);
            control = modControls6.newAttachments(ctl['NAME'], options);

            $this = control.$root;
            $input = control.$content;

            if (!inApp) {
                control.$root.addClass('mt-3');
                if (ctl.attr('height')) $input.css('height', ctl.attr('height') + ctl.attr('unitheight'));
            }

            /*
            El TAG se setea en el SBR asi:
                ctx.control.tag('miTag');

            El addOnly:
                ctx.control.addOnly(true);
            
            Para mostrarlo abierto (solo app):
                ctx.control.collapse(false);
            */
            

        // -- DocumentLog --

        } else if (type == 'DOCUMENTLOG') {

            options = { label }
            await eventBRC(options);
            control = modControls6.newDocLog(ctl['NAME'], options);
            if (!inApp) control.$root.attr('style', 'margin-top: 2.2rem !important;'); // Para alinear mejor con los inputs

            /*
            El docLog se muestra por defecto cerrado. Para mostrarlo abierto:
                ctx.control.collapse(false);
            */
        

        // -- HtmlArea --

        } else if (type == 'HTMLAREA') {

            options = {
                label,
                textField: tf,
                editor: {},
            }
            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                options.readOnly = true;
            }

            if (!inApp) {
                let aux = parseInt(ctl.attr('height'));
                if (!isNaN(aux)) options.editor.height = aux;
                options.editor.customConfig = ctl.attr('mode') == 'basic' ? 'configbasic.js' : 'config.js';
            };

            await eventBRC(options);
            control = modControls6.newHtmlEditor(ctl['NAME'], options);

            $this = control.$root;
            $input = control.$input;

            if (!inApp) control.$root.addClass('mt-3');
        

        // -- Autocomplete --

        } else if (type == 'AUTOCOMPLETE') {

            options = {
                label,
                multiple: ctl.attr('mode') == '1',
                folder: await folder.app.folder(ctl.attr('searchfolder')),
                formula: ctl.attr('searchfilter'),
                order: ctl.attr('searchorder'),
                searchFields: ctl.attr('searchfields'),
                textField: ctl.attr('textfield'),
                textSource: ctl.attr('textsource'),
                valueField: ctl.attr('valuefield'),
                valueSource: ctl.attr('valuesource'),
                xmlField: ctl.attr('xmlfield'),
                extraFields: ctl.attr('returnfields'),
                editUrl: ctl.attr('editurl'),
                addUrl: ctl.attr('addurl'),
                readoOnly: ctl['W'] == 0 || ctl.attr('readonly') == '1',
            }

            await eventBRC(options);
            control = modControls6.newAutocomplete(ctl['NAME'], options);

            $this = control.$root;
            $input = control.$input;

            if (!inApp) control.$root.addClass('mt-3');


        // -- HtmlRaw --

        } else if (type == 'HTMLRAW') {
            control = {
                $root: inApp ? $('<li/>') : $('<div/>', { class: 'mt-3' }),
            };

        }
    
        if (control && control.$root) control.$root.appendTo($cont);

        try {
            context = {
                control, ctl, $this, $input, f7ctl, bsctl, textField, valueField, label
            };

            /*
            Objetos disponibles en este script:
            - control: El control Doors
            - doc: El objeto Document que se esta abriendo
            - folder: La carpeta actual
            - controlsFolder: La carpeta de controles
            - controls: El search a la carpeta de controles completo
            - ctl: El row del control que se esta dibujando
            - ctl.attr(): Function que devuelve un atributo de XMLATTRIBUTES
            - $this: El $root JQuery del control
            - $input: El input, textarea, select, etc, dentro del control
                (puede ser undefined en caso de los raw y otros)
            - bsctl: El control Bootstrap (depende del control)
            - f7ctl: El control Framework7 (depende del control)
            - textField: El objeto Field bindeado con textField (depende del control)
            - valueField: El objeto Field bindeado con valueField (depende del control)
            */

            // Evento renderControl
            evSrc.dispatchEvent(new CustomEvent('renderControl', { detail : context}));
            if (context.return && typeof context.return.then == 'function') await context.return;

            if (ctl['SCRIPTBEFORERENDER']) {
                // Copio la funcion evalCode para que se ejecute en este contexto
                let pipe = {};
                eval('pipe.fn = ' + evalCode.toString());
                /* await */ pipe.fn(ctl['SCRIPTBEFORERENDER'], context);
                /*
                    todo: Ver si hace falta await, lo ideal seria que no, para que
                    la pantalla se dibuje mas rapido.
                */
            }

        } catch (err) {
            console.error(err);
            toast(ctl['NAME'] + ' error: ' + utils.errMsg(err));
        }

        // Evento beforeRenderControl
        async function eventBRC(options) {
            try {
                context = { options, ctl, textField, valueField, label };
                evSrc.dispatchEvent(new CustomEvent('beforeRenderControl', { detail : context}));
                if (context.return && typeof context.return.then == 'function') await context.return;
    
            } catch (err) {
                console.error(err);
                toast(ctl['NAME'] + ' error: ' + utils.errMsg(err));
            }
        }

        loop.next();
    })
}

function loading() {
    return new Promise((resolve, reject) => {
        let wt = 0;
        setTimeout(function waiting() {
            let $dl = $get('.doors-loading');
            if ($dl.length > 0) {
                wt += 50;
                if (wt == 3000) {
                    console.log('Hay controles tardando demasiado en inicializarse', $dl);
                    debugger; // Para poder ver q corno pasa
                    reject($dl);
                }
                setTimeout(waiting, 50);

            } else {
                resolve(true);
            }
        });    
    });
}

async function fillControls() {
    let form = await folder.form
    let formDesc = form.description ? form.description : form.name;
    await loading();

    let title;
    if (doc.isNew) {
        title = 'Nuevo ' + formDesc;

        if (!inApp) $get('#deleteDoc').hide();

    } else {
        title = doc.fields('subject').value;
        if (title) {
            if (!inApp) title += ' - ' + formDesc;
        } else {
            title = formDesc + ' #' + doc.id;
        };

        if (!inApp) $get('#deleteDoc').show();
    }

    if (inApp) {
        $navbar.find('.title').html(title);
        app7.navbar.size($navbar); // Para que se ajuste bien el titulo

    } else {
        document.title = title;
        $get('#title').html(title);
    }

    $get('[data-textfield], [data-valuefield], [data-xmlfield]').each(function (ix, el) {
        let tf, textField, text;
        let vf, valueField, value;
        let xf, xmlField, xml;
        let $el = $(el);

        tf = $el.attr('data-textfield');
        if (tf && tf != '[NULL]') {
            textField = doc.fields(tf);
            text = textField ? textField.value : null;
        };

        vf = $el.attr('data-valuefield');
        if (vf && vf != '[NULL]') {
            valueField = doc.fields(vf);
            value = valueField ? valueField.value : null;
        };

        xf = $el.attr('data-xmlfield');
        if (xf && xf != '[NULL]') {
            xmlField = doc.fields(xf);
            xml = xmlField ? xmlField.value : null;
        };

        if ((textField || valueField) && el.drs && el.drs.control == 'SELECT') {
            el.drs.setFieldValues(text, value);
            textField = undefined;
            valueField = undefined;

        } else if ((textField || valueField || xmlField) && el.drs && el.drs.control == 'AUTOCOMPLETE') {
            el.drs.setFieldValues(text, value, xml);
            textField = undefined;
            valueField = undefined;
            xmlField = undefined;

        } else if ((textField || valueField) && el.drs && el.drs.control == 'MAPSAUTOCOMPLETE') {
            el.drs.value({ text, value });
            textField = undefined;
            valueField = undefined;

        } else if (textField && el.drs && el.drs.text) {
            el.drs.text(text);
            textField = undefined;
        }
        if (valueField && el.drs && el.drs.value) {
            el.drs.value(value);
            valueField = undefined;
        }
        if (xmlField && el.drs && el.drs.xml) {
            el.drs.xml(xml);
            xmlField = undefined;
        }
        
        if (textField || valueField || xmlField) {
            let f, v;
            if (textField) {
                f = textField; v = text;
            } else if (valueField) {
                f = valueField; v = value;
            } else if (xmlField) {
                f = xmlField; v = xml;
            }

            if (el.tagName == 'INPUT') {
                let type = $el.attr('type').toLowerCase();

                if (type == 'text' || type == 'email' || type == 'password') {
                    let format = $el.attr('data-numeral');
                    if (f.type == 3 || format) {
                        // Input numeric
                        let n = numeral(v);
                        if (n.value() != null) {
                            $el.val(n.format(format));
                        } else {
                            $el.val('');
                        }

                    } else if (f.type == 2) {
                        let dt = utils.cDate(v);
                        if (dt) {
                            $el.val(new moment(dt).format('L LT'));
                        } else {
                            $el.val('');
                        }

                    } else {
                        $el.val(v);
                    }

                } else if (type == 'checkbox') {
                    el.checked = (v && v.toString() == '1');

                } else if (type == 'hidden') {
                    $el.val(v);
                }

            } else if (el.tagName == 'TEXTAREA') {
                $el.val(v);

            } else if (el.tagName == 'SELECT') {
                if ($el.attr('multiple')) {
                    let t = text ? text.split(';') : null;
                    let v = value ? value.split(';') : null;
                    debugger;
                    setSelectVal($el, t, v);
                } else {
                    debugger
                    setSelectVal($el, text, value);
                }

            }
        }
    });

    $get('[data-attachments]').each(function (ix, el) {
        this.drs.value(doc);
    });

    $get('.doors-doc-log').each(function (ix, el) {
        this.drs.value(doc);
    });

    // Inicializa los chats de Whatsapp
    let $wappChats = $get('div.wapp-chat');
    if ($wappChats.length > 0) {
        include('whatsapp', function () {
            wapp.ready(function () {
                $wappChats.each(function () {
                    let $this = $(this);
                    setFieldAttr($this, 'data-internal-name');
                    setFieldAttr($this, 'data-internal-number');
                    setFieldAttr($this, 'data-external-name');
                    setFieldAttr($this, 'data-external-number');
                    wapp.init($this);

                    function setFieldAttr(pCont, pAttr) {
                        let field = pCont.attr(pAttr + '-field');
                        if (field) {
                            pCont.attr(pAttr, doc.fields(field).value);
                        }
                    }
                });
            });
        });
    }

    try {
        // Evento afterFillControls
        let context = {};
        document.dispatchEvent(new CustomEvent('afterFillControls', { detail : context}));
        if (context.return && typeof context.return.then == 'function') await context.return;

        // Control Event AfterFillControls
        let ev = getEvent('AfterFillControls');
        if (ev) await evalCode(ev);

    } catch (err) {
        console.error(err);
        toast('afterFillControls error: ' + dSession.utils.errMsg(err));
    };
}

function exitForm() {
    if (inApp) {
        // APP
        appExplorerRefresh();
        f7Page.view.router.back();
    
    } else {
        // WEB
        try {
            let cbfn = urlParams.get('callbackfunction');

            if (cbfn && saved) {
                if (window.opener && window.opener[cbfn]) {
                    window.opener[cbfn](doc.id);
                } else if (window.parent && window.parent[cbfn]) {
                    window.parent[cbfn](doc.id);
                } else {
                    window.parent.exFrameDer.contentWindow[cbfn](doc.id);
                }
            }

        } catch(err) {
            console.error(err);
            debugger;
        }

        if (window.top == window.self) {
            window.close();
            if (!window.closed) toast('Debe cerrar esta ventana manualmente');
        } else {
            history.back();
        }
    }

    //TODO: sBackToFld
}

function appExplorerRefresh() {
    if (!saved && f7Page.pageFrom) {
        // Si nunca guarde evito el refresh del explorer
        $(f7Page.pageFrom.pageEl).find('.refresh-on-focus').each((ix, el) => {
            $(el).removeClass('refresh-on-focus');
        })
    }
}

async function saveDoc(exitOnSuccess) {
    if (saving) return;
    toggleSaving(true);

    try {
        $get('[data-textfield]').each(function (ix, el) {
            var $el = $(el);
            var field = doc.fields($el.attr('data-textfield'));

            if (field && field.updatable) {
                if (el.drs) {
                    if (el.drs.control == 'SELECT' || el.drs.control == 'AUTOCOMPLETE') {
                        field.value = el.drs.getFieldValues().text;
                    } else if (el.drs.control == 'MAPSAUTOCOMPLETE') {
                        field.value = el.drs.value().text;
                    } else {
                        let aux = el.drs.text();
                        field.value = Array.isArray(aux) ? aux.join(';') : aux;
                    }
                
                } else if (el.tagName == 'INPUT') {
                    var type = $el.attr('type').toLowerCase();
                    if (type == 'text' || type == 'hidden' || type == 'email' || type == 'password') {
                        if ($el.attr('data-numeral')) {
                            field.value = numeral($el.val()).value();
                        } else {
                            field.value = $el.val();
                        };

                    } else if (type == 'checkbox') {
                        field.value = el.checked ? 1 : 0;
                    }

                } else if (el.tagName == 'SELECT') {
                    let aux = getSelectText($el);
                    field.value = Array.isArray(aux) ? aux.join(';') : aux;

                } else if (el.tagName == 'TEXTAREA') {
                    if (el.ckeditor) {
                        field.value = el.ckeditor.getData();
                    } else {
                        field.value = $el.val();
                    }

                } else if (el.tagName == 'DIV') {
                    if ($el.hasClass('text-editor')) {
                        field.value = app7.textEditor.get($el[0]).getValue();
                    }

                } else if (el.tagName == 'A') {
                    if ($el.attr('data-autocomplete')) {
                        field.value = $el.find('.item-after').html();
                    }
                }
            }
        });

        $get('[data-valuefield]').each(function (ix, el) {
            var $el = $(el);
            var field = doc.fields($el.attr('data-valuefield'));

            if (field && field.updatable) {
                if (el.drs) {
                    if (el.drs.control == 'SELECT' || el.drs.control == 'AUTOCOMPLETE') {
                        field.value = el.drs.getFieldValues().value;
                    } else if (el.drs.control == 'MAPSAUTOCOMPLETE') {
                        field.value = el.drs.value().value;
                    } else {
                        let aux = el.drs.value();
                        field.value = Array.isArray(aux) ? aux.join(';') : aux;
                    }

                } else if (el.tagName == 'SELECT') {
                    let aux = $el.val();
                    field.value = Array.isArray(aux) ? aux.join(';') : aux;

                } else if (el.tagName == 'INPUT') {
                    field.value = $el.val();
                }
            }
        });

        $get('[data-xmlfield]').each(function (ix, el) {
            var $el = $(el);
            var field = doc.fields($el.attr('data-xmlfield'));

            if (field && field.updatable) {
                if (el.drs) {
                    if (el.drs.control == 'AUTOCOMPLETE') {
                        field.value = el.drs.getFieldValues().xml;
                    } else {
                        let aux = el.drs.xml();
                        field.value = Array.isArray(aux) ? aux.join(';') : aux;
                    }

                } else if (el.tagName == 'INPUT') {
                    let type = $el.attr('type').toLowerCase();
                    if (type == 'text' || type == 'hidden') {
                        field.value = $el.val();
                    }
                }
            }
        });

        //Parametros para disponibilizar en los eventos
        let context = { exitOnSuccess };

        // Evento beforeSave
        evSrc.dispatchEvent(new CustomEvent('beforeSave', { detail : context }));
        if (context.return && typeof context.return.then == 'function') await context.return;

        // Control Event BeforeSave
        var ev = getEvent('BeforeSave');
        if (ev) await evalCode(ev, context);

        await doc.save();
        saved = true;
        doc_id = doc.id;

        if (inApp) {
            pageEl.drs.doc = doc;
            pageEl.drs.doc_id = doc.id;
            pageEl.drs.saved = saved;    
        }

        let attErr;
        let res = await doc.saveAttachments();

        if (res.find(el => el.result != 'OK')) {
            attErr = 'Algunos adjuntos no pudieron guardarse, consulte la consola para mas informacion';
            console.error(attErr);
            console.log(res);

        } else {
            doc.attachmentsReset();
        }

        let asErr;
        try {
            // Evento afterSave
            evSrc.dispatchEvent(new CustomEvent('afterSave', { detail : context }));
            if (context.return && typeof context.return.then == 'function') await context.return;

            // Control Event AfterSave
            var ev = getEvent('AfterSave');
            if (ev) await evalCode(ev, context);

        } catch (err) {
            asErr = 'AfterSave error: ' + utils.errMsg(err);
            console.error(err);
        }

        toggleSaving(false);

        if (attErr || asErr) {
            if (attErr) toast(attErr);
            if (asErr) toast(asErr);

        } else {
            toast('Cambios guardados');
            if (exitOnSuccess) {
                setTimeout(exitForm, inApp ? 0 : 2000);
            } else {
                fillControls();
            }
        }

    } catch(err) {
        errMgr(err);
    }

    function errMgr(err) {
        toggleSaving(false);
        toast(utils.errMsg(err));
        console.error(err);
    }

    function toggleSaving(value) {
        if (value) {
            saving = true;

            if (inApp) {
                $navbar.find('.right .button').addClass('disabled');
            } else {
                $get('#mainButtons button').attr('disabled','disabled');
            }
            preldr.show();
        
        } else {
            saving = false;

            if (inApp) {
                $navbar.find('.right .button').removeClass('disabled');
            } else {
                $get('#mainButtons button').removeAttr('disabled','disabled');
            }
            preldr.hide();
        }
    }
}

function $get(pSelector) {
    if (inApp) {
        return $(pSelector, $page[0]);
    } else {
        return $(pSelector);
    }
}

function getEvent(pEvent) {
    if (controls) {
        var ev = controls.find(el => el['NAME'] && el['NAME'].toUpperCase() == pEvent.toUpperCase());
        if (ev) return ev['SCRIPTBEFORERENDER'];
    }
}

async function evalCode(code, ctx) {
    try {
        var pipe = {};
        eval(`pipe.fn = async (ctx) => {\n${code}\n};`);
        return await pipe.fn(ctx);

    } catch(err) {
        console.error(err);
        throw err;
    }
}

function showDesigner() {
    $(document).ready(() => {
        $('html').attr('data-drs-mode', 'designer');
        window.scrollTo(0, document.body.scrollHeight);
        $('.doors-control-container').each((ix, el) => {
            let $el = $(el);
            let $lnk = $('<a />', {
                class: 'doors-container-label',
                style: 'position: relative; top: -10px; left: 10px;'
            }).append($el.attr('data-drs-id'));
            $el.prepend($lnk);
        })
    });
}