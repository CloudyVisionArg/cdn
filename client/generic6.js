'use strict';

// Fresh: https://cdn.cloudycrm.net/ghcv/cdn/client/generic6.js?_fresh=1

var fld_id, folder, doc_id, doc;
var utils, urlParams, preldr, modControls;
var controls, controlsFolder, controlsRights;
var $page, $navbar, f7Page, pageEl, saving;

var inApp = typeof window.app7 == 'object';

var propControls = 'App7_controls';

(async () => {
    if (inApp) {
        fld_id = routeTo.query.fld_id;
        doc_id = routeTo.query.doc_id;
    
        preldr = app7.preloader;
        preldr.show();
        
    } else {
        await include([
            { id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' },
            { id: 'bootstrap', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js' },
            { id: 'bootstrap-css', depends: ['bootstrap'], src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css' },
            { id: 'web-javascript', depends: ['jquery', 'bootstrap'] },
        ]);

        preldr = preloader;
        preldr.show();

        if (!window.doorsapi2) window.doorsapi2 = await import(scriptSrc('doorsapi2'));
        if (!window.dSession) {
            window.dSession = new doorsapi2.Session();
            if (!await dSession.webSession() || !await dSession.isLogged) {
                errMgr(new Error('La sesion no ha sido iniciada'));
                return;
            }
        }

        await include([
            // { id: 'web-controls' },
            { id: 'tempus-dominus', depends: ['jquery', 'lib-moment'], src: 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/js/tempusdominus-bootstrap-4.min.js' },
            { id: 'tempus-dominus-css', src: 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/css/tempusdominus-bootstrap-4.min.css' },
            { id: 'bootstrap-select', depends: ['jquery', 'bootstrap', 'bootstrap-css'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/js/bootstrap-select.min.js' },
            { id: 'bootstrap-select-css', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/css/bootstrap-select.min.css' },
            // todo: esto deberia ser segun el lng_id
            { id: 'bootstrap-select-lang', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/js/i18n/defaults-es_ES.min.js' },
        ]);
    
        include([
            { id: 'bootstrap-icons', src: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css' },
            { id: 'font-awesome', src: 'https://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.css' },
            { id: 'ckeditor', src: '/c/inc/ckeditor-nov2016/ckeditor.js' },
            { id: 'lib-filesaver' },
        ]);

        await dSession.runSyncEventsOnClient(false);
        
        urlParams = new URLSearchParams(window.location.search);
        fld_id = urlParams.get('fld_id');
        doc_id = urlParams.get('doc_id');
    }

    utils = dSession.utils;

    if (fld_id) {
        try {
            folder = await dSession.folder(fld_id);
            folder.form; // Para q vaya cargando el form

            if (folder.type == 1) {
                if (doc_id) {
                    doc = await folder.documents(doc_id);
                } else {
                    doc = await folder.documentsNew();
                }

                modControls = await import(gitCdn({ repo: 'Global', path: '/client/controls.mjs', url: true, fresh: true }));
                modControls.setContext({ dSession, folder, doc });
                    
                loadControls();

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
        resolve({ content: errPage(dSession.utils.errMsg(pErr)) });

    } else {
        console.error(pErr);
        toast(dSession.utils.errMsg(pErr), { delay: 10000 });
        preloader.hide();
    }
}

async function loadControls() {
    var controlsProp;
    try { controlsProp = JSON.parse(await folder.properties(propControls)) }
        catch(err) { console.error(err) };
    
    if (controlsProp && controlsProp.viaHub) {
        controls = await modControls.controlsHub(folder);

    } else {
        var cf = objPropCI(doc.tags, 'controlsFolder');

        try {
            if (cf) {
                controlsFolder = await folder.app.folders(cf);
            } else {
                controlsFolder = await folder.folders('controls');
            }
            controls = await controlsFolder.search({ order: 'parent, order, column', maxTextLen: 0 });
            getControlsRights(controls);

        } catch(err) {
            console.error(err);
        }
    }

    renderPage();    
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


async function renderPage() {
    inApp ? appRenderPage() : webRenderPage();
}

async function appRenderPage() {
    // page
    $page = getPage({
        id: 'generic6_' + getGuid(),
        title: 'Cargando...',
        leftbutton: 'exit',
        rightbutton: 'save',
    });

    $page.find('.navbar-inner .left .link').on('click', function (e) {
        // todo: ver si se puede detectar si hubo cambios
        /*
        app7.dialog.confirm('Perdera los cambios relizados', (dialog) => {
            f7Page.view.router.back();
        }
        */
        goBack();
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
                modControls.newDefaultControl(field).appendTo($ul);
            }
        }

        let $ctl = modControls.newAttachments('attachments', 'Adjuntos').appendTo($ul);
        /* todo: pasar al control
        $ctl.find('.list').on('click', 'a', downloadAtt);
        $ctl.on('swipeout:deleted', 'li.swipeout', deleteAtt);
        $ctl.find('div.row').on('click', 'button', addAtt);
        */


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
                modControls.newDefaultControl(field).appendTo($ul);
            }
        }

        // tabHist

        let $tabHist = $('<div/>', {
            class: 'tab',
            id: 'tabHist',
        }).appendTo($tabs);

        modControls.newDocLog().appendTo($tabHist);

    } else {

        // CON CONTROLES

        try {
            // Control Event BeforeRender
            var ev = getEvent('BeforeRender');
            if (ev) await evalCode(ev);

        } catch(err) {
            console.error(err);
            toast('BeforeRender error: ' + dSession.utils.errMsg(err));
        }

        // Membrete

        $ul = $('<ul/>')
        await renderControls($ul, '[NULL]');

        if ($ul.html()) {
            $('<div/>', {
                class: 'list no-hairlines-md',
                style: 'margin-top: 0;',
            }).append($ul).appendTo($pageCont);
        }

        // TABS

        var tabs = controls.filter(function (el) {
            return el['CONTROL'].toUpperCase() == 'TAB' && el['DONOTRENDER'] != 1 &&
                el['R'] != '0' && el['HIDEINAPP'] != '1'
        });

        if (tabs.length > 0) {
            $tabbar = $('<div/>', {
                class: 'toolbar tabbar toolbar-top',
                style: 'top: 0;',
            }).appendTo($pageCont);

            $tabbarInner = $('<div/>', {
                class: 'toolbar-inner',
            }).appendTo($tabbar);

            $tabs = $('<div/>', {
                class: 'tabs',
            }).appendTo($pageCont);

            var tab, label, $tab, $ul;
            for (var i = 0; i < tabs.length; i++) {
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
    pageEl.crm = {};

    preldr.hide();

    return;

    f7Page.view.on('swipebackMove', (ev) => {
        explorerRefresh();
    })

    // En ios el navbar esta fuera del page
    $navbar = (f7Page.navbarEl ? $(f7Page.navbarEl) : $(f7Page.pageEl).find('.navbar'))

    // Validacion de numero
    $get('[data-numeral]').change(function (e) {
        var $this = $(this);
        if ($this.val() != '') {
            var n = numeral($this.val());
            if (n.value() || n.value() == 0) {
                setInputVal($this, n.format($this.attr('data-numeral')));
            } else {
                setInputVal($this, '');
                toast('Ingrese un numero valido');
            }
        }
    });

    // Llena controles Select
    $get('[data-fill]').each(function (ix, el) {
        var $el = $(el);
        $el.removeAttr('data-fill');
        $el.attr('data-filling', '1');
        var fld = $el.attr('data-fill-folder');

        if (fld == 'accounts') {
            fillSelect($el,
                accountsSearch($el.attr('data-fill-formula'), $el.attr('data-fill-order')),
                $el.attr('data-fill-withoutnothing') == '1', 'name', 'accid', 'type').then(
                function (res) {
                    $el.find('option').each(function (ix, el) {
                        var $e = $(el);
                        var type = $e.attr('data-field-type');
                        if (type == '1') {
                            $e.attr('data-option-icon-ios', 'f7:person');
                            $e.attr('data-option-icon-md', 'material:person_outline');
                        } else if (type == '2') {
                            $e.attr('data-option-icon-ios', 'f7:person_2_fill');
                            $e.attr('data-option-icon-md', 'material:group');
                        }
                    })
                }
            );

        } else {
            folder.app.folder($el.attr('data-fill-folder')).then(
                function (fld) {
                    var arrFields, textField, valueField, dataFields;

                    var arrFields = $el.attr('data-fill-fields').split(',');
                    if (arrFields.length > 0) textField = arrFields.shift().trim();
                    if (arrFields.length > 0) valueField = arrFields.shift().trim();
                    if (arrFields.length > 0) dataFields = arrFields.join(',');

                    fillSelect($el,
                        fld.search({ fields: $el.attr('data-fill-fields'),
                            formula: $el.attr('data-fill-formula'), order: $el.attr('data-fill-order')
                        }),
                        $el.attr('data-fill-withoutnothing') == '1', textField, valueField, dataFields
                    );
                },
                function (err) {
                    console.log(err);
                }
            )
        }
    });

    // Bug de fecha read-only de Safari
    // https://stackoverflow.com/questions/25928605/in-ios8-safari-readonly-inputs-are-handled-incorrectly
    if (device.platform == 'iOS') {
        $get('input[type=\'date\'][readonly], input[type=\'time\'][readonly], input[type=\'datetime-local\'][readonly]')
            .focus(function (e) {
                $(this).trigger('blur');
            }
        );
    }

    // Espera que se terminen de llenar todos los controles antes de hacer el fill
    var wt = 0;
    setTimeout(async function waiting() {
        if ($page.find('[data-filling]').length > 0) {
            wt += 100;
            if (wt == 3000) {
                console.log('data-filling esta demorando demasiado');
                debugger; // Para poder ver q corno pasa
            }
            setTimeout(waiting, 100);

        } else {
            // Evento afterRender
            let context = {};
            $page[0].dispatchEvent(new CustomEvent('afterRender', { detail : context}));
            if (context.return && typeof context.return.then == 'function') await context.return;

            // Deprecado, usar el anterior
            $page[0].dispatchEvent(new CustomEvent('afterPageInit'));

            // Control Event AfterRender, ver si se lo puede traer desde afterFillControls
            //var ev = getEvent('AfterRender');
            //if (ev) await evalCode(ev);

            await fillControls();
            app7.preloader.hide();
        }
    }, 0);

    if (!pageEl.crm) pageEl.crm = {};
    Object.assign(pageEl.crm, {
        fillControls, saveDoc, fld_id, folder, folderJson, 
        doc_id, doc, docJson, $navbar, f7Page, goBack,
    });
}


async function webRenderPage() {
    var $body = $('body');
    var $d = $(document);

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
            <button type="button" id="print" class="btn btn-primary" onclick="printForm();">
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

                modControls.newDefaultControl(field).appendTo($col);
            }
        });

        $row = webGetRow(undefined, $tab);
        $col = $('<div/>', {
            class: 'col-12 form-group',
        }).appendTo($row);

        modControls.newAttachments('attachments', 'Adjuntos').addClass('mt-3').appendTo($col);

        // tabHeader

        $tab = $cont.find('#tabHeader');
        $row = undefined;

        doc.fields().forEach(field => {
            if (field.headerTable) {
                $row = webGetRow($row, $tab);
                $col = $('<div/>', {
                    class: 'col-12 col-md-6 form-group',
                }).appendTo($row);

                modControls.newDefaultControl(field).appendTo($col);
            }
        })

        // tabHist

        $tab = $cont.find('#tabHist');
        $row = undefined;
        modControls.newDocLog('docLog').addClass('mt-3').appendTo($tab);

    } else {

        // CON CONTROLES

        try {
            // Control Event BeforeRender
            var ev = getEvent('BeforeRender');
            if (ev) await evalCode(ev);

        } catch(err) {
            console.error(err);
            toast('BeforeRender error: ' + dSession.utils.errMsg(err));
        }

        // Membrete

        await renderControls($cont, '[NULL]');

        // TABS

        var tabs = controls.filter(function (el) {
            return el['CONTROL'].toUpperCase() == 'TAB' && el['DONOTRENDER'] != 1 && el['R'] != '0'
        });

        if (tabs.length > 0) {
            var $navTabs = $('<ul/>', {
                class: 'nav nav-tabs mt-3',
            }).appendTo($cont);

            var $tabCont = $('<div/>', {
                class: 'tab-content',
            }).appendTo($cont);

            var tab, label, $tab, $li;
            for (var i = 0; i < tabs.length; i++) {
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
    $cont.append('<span style="padding-bottom: 25px;">Powered by <a href="https://cloudy.ar" target="_blank">CloudyVision</a></span>');

    // Boton Borrar
    var $delBtn = $('<button/>', {
        type: 'button',
        id: 'deleteDoc',
        class: 'btn btn-outline-danger',
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

    /*

    // Llena controles Select
    $('[data-fill]').each(function (ix, el) {
        var $el = $(el);
        $el.removeAttr('data-fill');
        $el.attr('data-filling', '1');
        var fld = $el.attr('data-fill-folder');

        if (fld == 'accounts') {
            fillSelect($el,
                accountsSearch($el.attr('data-fill-formula'), $el.attr('data-fill-order')),
                $el.attr('data-fill-withoutnothing') == '1', 'name', 'accid', 'type').then(
                function (res) {
                    $el.find('option').each(function (ix, el) {
                        var $e = $(el);
                        var type = $e.attr('data-field-type');
                        if (type == '1') {
                            $e.attr('data-icon', 'bi bi-person');
                        } else if (type == '2') {
                            $e.attr('data-icon', 'bi bi-people-fill');
                        }
                    })
                }
            );

        } else {
            folder.app.folder($el.attr('data-fill-folder')).then(
                function (fld) {
                    var arrFields, textField, valueField, dataFields;

                    var arrFields = $el.attr('data-fill-fields').split(',');
                    if (arrFields.length > 0) textField = arrFields.shift().trim();
                    if (arrFields.length > 0) valueField = arrFields.shift().trim();
                    if (arrFields.length > 0) dataFields = arrFields.join(',');

                    fillSelect($el,
                        fld.search({ fields: $el.attr('data-fill-fields'),
                            formula: $el.attr('data-fill-formula'), order: $el.attr('data-fill-order')
                        }),
                        $el.attr('data-fill-withoutnothing') == '1', textField, valueField, dataFields
                    );
                },
                function (err) {
                    console.log(err);
                }
            )
        }
    });

    // Validacion de numero
    $('[data-numeral]').change(function (e) {
        var $this = $(this);
        if ($this.val() != '') {
            var n = numeral($this.val());
            if (n.value() || n.value() == 0) {
                $this.val(n.format($this.attr('data-numeral')));
            } else {
                $this.val('');
                toast('Ingrese un numero valido');
            }
        }
    });

    // Tooltips
    $('[data-bs-toggle="tooltip"]').each(function (ix) {
        new bootstrap.Tooltip(this);
    });

    // Espera que se terminen de llenar todos los controles antes de hacer el fill
    var wt = 0;
    setTimeout(async function waiting() {
        if ($('[data-filling]').length > 0) {
            wt += 100;
            if (wt == 3000) {
                console.log('data-filling esta demorando demasiado');
                debugger; // Para poder ver q corno pasa
            }
            setTimeout(waiting, 100);

        } else {
            // Evento afterRender
            let context = {};
            document.dispatchEvent(new CustomEvent('afterRender', { detail : context}));
            if (context.return && typeof context.return.then == 'function') await context.return;

            // Control Event AfterRender
            let ev = getEvent('AfterRender');
            if (ev) await evalCode(ev);

            await fillControls();
            preloader.hide();
        }
    }, 0);

    */
    preldr.hide();
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
