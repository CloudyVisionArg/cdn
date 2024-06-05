'use strict';

// Fresh: https://cdn.cloudycrm.net/ghcv/cdn/client/generic6.js?_fresh=1

var fld_id, folder, doc_id, doc;
var utils, urlParams, preldr, modControls;
var controls, controlsFolder, controlsRights;
var $page, $navbar, f7Page, pageEl, evSrc, saving, saved;

var inApp = typeof window.app7 == 'object';

var propControls = 'App7_controls';

(async () => {
    if (inApp) { // APP
        fld_id = routeTo.query.fld_id;
        doc_id = routeTo.query.doc_id;
    
        preldr = app7.preloader;
        preldr.show();
        
    } else { // WEB
        await include([
            { id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' },
            { id: 'bootstrap', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js' },
            { id: 'bootstrap-css', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' },
            { id: 'web-javascript', depends: ['jquery', 'bootstrap'] },
        ]);

        // dark-mode
        $('html').attr('data-bs-theme', localStorage.getItem('dark-mode') == '1' ? 'dark' : 'light');

        preldr = preloader;
        preldr.show();

        debugger;
        if (!window.doorsapi2) window.doorsapi2 = await import(scriptSrc('doorsapi2'));
        if (!window.dSession) {
            window.dSession = new doorsapi2.Session();
            if (!await dSession.webSession() || !await dSession.isLogged) {
                errMgr(new Error('La sesion no ha sido iniciada'));
                return;
            }
        }
        await dSession.runSyncEventsOnClient(false);

        await include([
            { id: 'lib-moment' },
            { id: 'lib-numeral' },
            { id: 'lib-numeral-locales', depends: ['lib-numeral'] },
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
        app7.dialog.confirm('Perdera los cambios relizados', (dialog) => {
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
                modControls.newDefaultControl(field).$root.appendTo($ul);
            }
        }

        let ctl = modControls.newAttachments('attachments', {
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
                modControls.newDefaultControl(field).$root.appendTo($ul);
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

        ctl = modControls.newDocLog('docLog', {
            label: 'Cambios de datos',
            collapse: false,
        });
        ctl.$root.appendTo($ul);

    } else {

        // CON CONTROLES

        try {
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
                style: 'margin-top: 0;',
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

    /*


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
    */

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

                let ctl = modControls.newDefaultControl(field);
                ctl.$root.addClass('mt-3').appendTo($col);
            }
        });

        $row = webGetRow(undefined, $tab);
        $col = $('<div/>', {
            class: 'col-12 form-group',
        }).appendTo($row);

        let ctl = modControls.newAttachments('attachments', {
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

                let ctl = modControls.newDefaultControl(field);
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

        ctl = modControls.newDocLog('docLog', {
            label: 'Cambios de datos',
            collapse: false,
        });
        ctl.$root.addClass('mt-3').appendTo($col);

    } else {

        // CON CONTROLES

        try {
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

    let $btn = $(`<button type="button" class="btn" title="Modo oscuro">
        <i class="bi bi-cloud-moon" aria-hidden="true"></i>
    </button>`).appendTo($cont);

    // Boton dark-mode
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

    // Boton Borrar
    let $delBtn = $('<button/>', {
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
    await fillControls();
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

async function renderControls(container, parent) {
    let subset = controls.filter(el => {
        return el['PARENT'] == parent && el['CONTROL'].toUpperCase() != 'TAB' &&
            el['CONTROL'].toUpperCase() != 'EVENT' && el['DONOTRENDER'] != 1 &&
            el['R'] != '0' && (inApp ? el['HIDEINAPP'] != '1' : true);
    });

    let $row;

    utils.asyncLoop(subset.length, async loop => {
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
        
        let control, options, $this, $input, bsctl, f7ctl, tf, textField, vf, valueField;

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
            /*
            {
                label: 'Etiqueta',
                value: 'Valor inicial',
                type: 'password', // text (def), email, password, hidden
                textField: 'micampo', // Nombre del field enlazado
                readOnly: true, // Def false
                containerTag: 'span', // tagName del container. Def web: div, app: li
            }
            
            Control:
            {
                $input,
                $root,
                readonly(),
                text(),
                value(),
            }
            */

            options = {
                label: label,
                textField: tf,
            }
            if (ctl.attr('mode') == '3') opt.type = 'password';

            //if (ctl.attr('isnumber') == '1') $input.attr('data-numeral', numeral.options.defaultFormat);

            if (ctl.attr('mode') == '2') { // Multiline
                control = modControls.newTextarea(ctl['NAME'], options);
            } else {
                control = modControls.newInputText(ctl['NAME'], options);
            }

            $this = control.$root;
            $input = control.$input;

            if (inApp) {
            } else {
                control.$root.addClass('mt-3');
                if (ctl.attr('height')) $input.css('height', ctl.attr('height') + ctl.attr('unitheight'));
            }


            /*
            if (ctl.attr('maxlength')) {
                $input.attr('maxlength', ctl.attr('maxlength'));
            } else if (textField && textField.type == 1 && textField.length > 0) {
                $input.attr('maxlength', textField.length);
            }

            if (textField && textField.type == 3) {
                $input.attr('data-numeral', numeral.options.defaultFormat)
            }

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $input.attr({ 'readonly': 'readonly' });
            }

            if (ctl.attr('datalist') == '1' && ctl.attr('mode') == '1' && textField) {
                inputDataList($input, {
                    folder: fld_id,
                    field: tf,
                });
            }

            let buttons = ctl.attr('buttons');
            if (buttons) {
                if (buttons.indexOf('email') >= 0) addEmailButton($this);
                if (buttons.indexOf('phone') >= 0) addPhoneButton($this);
                if (buttons.indexOf('whatsapp') >= 0) addWappButton($this);
            }
            */


        // -- DTPicker --

        } else if (type == 'DTPICKER') {
            /*
            let mode = 'date';
            if (ctl.attr('mode') == '2') {
                mode = 'datetime-local';
            } else if (ctl.attr('mode') == '3') {
                mode = 'time';
            }
            $this = newDTPicker(ctl['NAME'], label, mode)
            $this.addClass('mt-3');
            $input = $this.find('input');
            bsctl = $this.find('div.input-group');
            $input.attr('data-textfield', tf);
            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $input.closest('.input-group').datetimepicker('disable');
                //$input.attr({ 'readonly': 'readonly' });
            }
            */
        
        
        // -- Attachments --

        } else if (type == 'ATTACHMENTS') {
            /*
            Options:
            {
                label: 'myAtt',
                tag: 'myTag', // Def all
                readOnly: true, // Def false
                addOnly: true, // Def false
                containerTag: 'span', // tagName del container. Def web: div, app: li
                collapse: true, // Solo app. Lo crea cerrado. Def false
            }
            
            Control:
            {
                $content,
                $label,
                $root,
                addOnly(),
                collapse(), // Solo app
                label(),
                readOnly(),
                refresh(),
                tag(),
                value(),
            }
            */
            options = {
                label: label,
            }

            control = modControls.newAttachments(ctl['NAME'], options);

            $this = control.$root;
            $input = control.$content;

            if (inApp) {
            } else {
                control.$root.addClass('mt-3');
                if (ctl.attr('height')) $input.css('height', ctl.attr('height') + ctl.attr('unitheight'));
            }

            /*
            $this = newAttachments(ctl['NAME'], label);
            $this.addClass('mt-3');
            $input = $this.find('div[data-attachments]');

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $input[0]._readonly(true);
            }

            $this = getAttachments(ctl['NAME'], label);
            $this.find('.list').on('click', 'a.item-content', downloadAtt);
            $this.on('swipeout:deleted', 'li.swipeout', deleteAtt);
            $this.find('.list').on('change', 'a.item-content', downloadAtt);
            $this.find('div.row').on('click', 'button', addAtt);
            
            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $this.attr('readonly', true);
                $this.find('div.row').hide();
            }
            */

            // El TAG se setea en el APP7_SCRIPT asi:
            // $this.attr('data-attachments', 'miTag');

            /*
            El TAG se setea en el SBR asi:
                ctx.$input.attr('data-attachments', 'miTag');

            El addonly:
                ctx.$input[0]._addonly(true);
            */
        }


        if (control && control.$root) control.$root.appendTo($cont);

        try {
            var context = {
                control, ctl, $this, $input, f7ctl, bsctl, textField, valueField, label
            };

            // Evento renderControl
            evSrc.dispatchEvent(new CustomEvent('renderControl', { detail : context}));
            if (context.return && typeof context.return.then == 'function') await context.return;

            if (ctl['SCRIPTBEFORERENDER']) {
                /*
                Objetos disponibles en este script:
                - doc: El objeto Document que se esta abriendo
                - folder: La carpeta actual
                - controlsFolder: La carpeta de controles
                - controls: El search a la carpeta de controles completo
                - ctl: El row del control que se esta dibujando
                - ctl.attr(): Function que devuelve un atributo de XMLATTRIBUTES
                - $this: El control completo JQuery (inluido el <li>)
                - $input: El input, textarea, select, etc, dentro del control
                    (puede ser undefined en caso de los raw y otros)
                - bsctl: El control Bootstrap (depende del control)
                - f7ctl: El control Framework7 (depende del control)
                - textField: El objeto Field bindeado con textField (depende del control)
                - valueField: El objeto Field bindeado con valueField (depende del control)
                */

                // Copio la funcion evalCode para que se ejecute en este contexto
                let pipe = {};
                eval('pipe.fn = ' + evalCode.toString());
                await pipe.fn(ctl['SCRIPTBEFORERENDER'], context);
            }

        } catch (err) {
            console.error(err);
            toast(ctl['NAME'] + ' error: ' + utils.errMsg(err));
        }

        loop.next();
    })
}

async function fillControls() {
    let form = await folder.form
    let formDesc = form.description ? form.description : form.name;

    let title;
    if (doc.isNew) {
        title = 'Nuevo ' + formDesc;

        if (!inApp) $('#deleteDoc').hide();

    } else {
        title = doc.fields('subject').value;
        if (title) {
            if (!inApp) title += ' - ' + formDesc;
        } else {
            title = formDesc + ' #' + doc.id;
        };

        $('#deleteDoc').show();
    }

    if (inApp) {
        $navbar.find('.title').html(title);
        app7.navbar.size($navbar); // Para que se ajuste bien el titulo

    } else {
        document.title = title;
        $('#title').html(title);
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

        if (textField && el.drs && el.drs.text) {
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
                if (el.ckeditor) {
                    el.ckeditor.setData(v);
                } else {
                    $el.val(v);
                }

            } else if (el.tagName == 'SELECT') {
                if ($el.attr('multiple')) {
                    let t = text ? text.split(';') : null;
                    let v = value ? value.split(';') : null;
                    setSelectVal($el, t, v);
                } else {
                    setSelectVal($el, text, value);
                }

            }
        }
    });

    $get('[data-attachments]').each(function (ix, el) {
        this.drs.value(doc);
    });

    $get('[data-role*="doc-log"]').each(function (ix, el) {
        this.drs.value(doc);
    });

}

function exitForm() {
    if (inApp) { // APP
        appExplorerRefresh();
        f7Page.view.router.back();
    
    } else { // WEB
    // Callback
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

        // v1
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
    saving = true;

    if (inApp) {
        $navbar.find('.right .button').addClass('disabled');
    } else {
        //todo: deshabilitar botones
    }
    preldr.show();

    try {
        $get('[data-textfield]').each(function (ix, el) {
            var $el = $(el);
            var field = doc.fields($el.attr('data-textfield'));

            if (field && field.updatable) {
                if (el.drs && el.drs.text) {
                    let aux = el.drs.text();
                    field.value = Array.isArray(aux) ? aux.join(';') : aux;
                
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
                if (el.drs && el.drs.value) {
                    let aux = el.drs.value();
                    field.value = Array.isArray(aux) ? aux.join(';') : aux;

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
                if (el.tagName == 'INPUT') {
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

        saving = false;
        preldr.hide();

        if (inApp) {
            $navbar.find('.right .button').removeClass('disabled');
        } else {
            // todo: habilitar botones
        }

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
        saving = false;
        preldr.hide();
        toast(utils.errMsg(err));
        console.error(err);
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
