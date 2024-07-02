/*
web-generic
Generic de la web

Documentacion de componentes:

Bootstrap: https://getbootstrap.com/docs/5.1/getting-started/introduction/
Iconos: https://icons.getbootstrap.com / https://fontawesome.com/v4/icons/
DTPicker: https://getdatepicker.com/5-4/
bootstrap-select: https://developer.snapappointments.com/bootstrap-select/
jQuery: https://api.jquery.com
Numeral: http://numeraljs.com
Moment: https://momentjs.com
CKEditor: https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR.html
*/

'use strict';

var doorsapi2, dSession;
var urlParams, fld_id, folder, doc_id, doc;
var folderJson, docJson;
var controlsFolder, controls, controlsRights;
var saving, saved;

// Includes para mostrar el preloader
var arrScriptsPre = [];
arrScriptsPre.push({ id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' });
arrScriptsPre.push({ id: 'bootstrap', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js' });
arrScriptsPre.push({ id: 'bootstrap-css', depends: ['bootstrap'], src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css' });
arrScriptsPre.push({ id: 'web-javascript', depends: ['jquery', 'bootstrap'] });

// Includes que tienen que estar antes de dibujar la pag
var arrScripts = [];
arrScripts.push({ id: 'doorsapi', depends: ['jquery'] });
arrScripts.push({ id: 'web-controls' });
arrScripts.push({ id: 'lib-numeral' });
arrScripts.push({ id: 'lib-numeral-locales', depends: ['lib-numeral'] });
arrScripts.push({ id: 'tempus-dominus', depends: ['jquery', 'lib-moment'], src: 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/js/tempusdominus-bootstrap-4.min.js' });
arrScripts.push({ id: 'tempus-dominus-css', src: 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/css/tempusdominus-bootstrap-4.min.css' });
arrScripts.push({ id: 'lib-moment' });
arrScripts.push({ id: 'bootstrap-select', depends: ['jquery', 'bootstrap', 'bootstrap-css'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/js/bootstrap-select.min.js' });
arrScripts.push({ id: 'bootstrap-select-css', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/css/bootstrap-select.min.css' });
// todo: esto deberia ser segun el lng_id
arrScripts.push({ id: 'bootstrap-select-lang', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/js/i18n/defaults-es_ES.min.js' });

// Includes que no es necesario esperar
var arrScriptsPos = [];
arrScriptsPos.push({ id: 'bootstrap-icons', src: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css' });
arrScriptsPos.push({ id: 'font-awesome', src: 'https://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.css' });

arrScriptsPos.push({ id: 'ckeditor', src: '/c/inc/ckeditor-nov2016/ckeditor.js' });
arrScriptsPos.push({ id: 'lib-filesaver' });


//Monaco includes

arrScriptsPos.push({id: 'monaco-editor-loader',  src: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.49.0/min/vs/loader.js' });
arrScriptsPos.push({id: 'monaco-editor-main-nls', src: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.49.0/min/vs/editor/editor.main.nls.js' });
arrScriptsPos.push({id: 'monaco-editor-main-ts-js', src: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.49.0/min/vs/language/typescript/tsMode.js' });
arrScriptsPos.push({id: 'monaco-editor-main-javascript-js', src: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.49.0/min/vs/basic-languages/javascript/javascript.js' });
arrScriptsPos.push({id: 'monaco-editor-main-js', src: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.49.0/min/vs/editor/editor.main.js' });



//arrScriptsPos.push({id: 'monaco-editor-loader', src: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs/loader.js',  depends:['jquery','monaco-editor']});




(async () => {
    await include(arrScriptsPre);
    preloader.show();
    await include(arrScripts);
debugger;

    // var arrScriptTemp = [];
    // arrScriptTemp.push({id: 'monaco-editor-loader',  src: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.0/min/vs/loader.js' });
    // arrScriptTemp.push({id: 'monaco-editor', src: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.0/min/vs/editor/editor.main.js' });
    // arrScriptTemp.push({id: 'monaco-editor-nls',  src: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.0/min/vs/editor/editor.main.nls.js' });
    
    // await include(arrScriptTemp);


    
    doorsapi2 = await import(scriptSrc('doorsapi2'));
    dSession = new doorsapi2.Session();

    if (!await dSession.webSession() || !await dSession.isLogged) {
        end('La sesion no ha sido iniciada');
        return;
    }

    Doors.RESTFULL.ServerUrl = dSession.serverUrl;
    Doors.RESTFULL.AuthToken = dSession.authToken;

    
    var monacoEditorCss = document.createElement('link');
    monacoEditorCss.setAttribute('data-name','vs/editor/editor.main');
    monacoEditorCss.setAttribute('href', 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs/editor/editor.main.min.css');
    monacoEditorCss.setAttribute('rel','stylesheet');
    document.head.appendChild(monacoEditorCss);
    var require = { paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.49.0/min/vs' } };
    
    include(arrScriptsPos).then(()=>{
        //document.getElementById("script_monaco-editor-main-css").setAttribute("data-name","vs/editor/editor.main");
        //var require = { paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.49.0/min/vs' } };
        var monacoEditorContainer = document.createElement("div");
        monacoEditorContainer.id = "monaco-editor-cont";
        document.querySelector("body").append(monacoEditorContainer);
        document.querySelector("#monaco-editor-cont").style.height = "400px";
        var editor = monaco.editor.create(monacoEditorContainer, {
            value: [
                'function x() {',
                '\tconsole.log("Hello world!");',
                '}'
            ].join('\n'),
            language: 'javascript'
        });
    });

    await dSession.runSyncEventsOnClient(false);

    // todo: setar segun el LNG_ID
    moment.locale('es');
    numeral.locale('es'); // http://numeraljs.com/
    numeral.defaultFormat('0,0.[00]');

    urlParams = new URLSearchParams(window.location.search);
    fld_id = urlParams.get('fld_id');
    doc_id = urlParams.get('doc_id');
    
    if (fld_id) {
        try {
            folder = await dSession.foldersGetFromId(fld_id);
            folderJson = folder.toJSON();
            folder.form; // Para q vaya cargando el form

            if (folder.type == 1) {
                if (doc_id) {
                    doc = await folder.documents(doc_id);
                } else {
                    doc = await folder.documentsNew();
                }
                docJson = doc.toJSON();
                loadControls().then((r)=>{

      
                });

            } else {
                end('La carpeta ' + fld_id + ' no es una carpeta de documentos');
            }

        } catch(err) {
            end(dSession.utils.errMsg(err));
        }
    
    } else {
        end('Se requiere fld_id');
    }
})();

function end(pErr) {
    logAndToast(errMsg(pErr), { delay: 10000 });
    preloader.hide();
}

async function loadControls() {
	var cf = objPropCI(doc.tags, 'controlsFolder');
	
    try {
	    if (cf) {
		    controlsFolder = await folder.app.folders(cf);
    	} else {
            controlsFolder = await folder.folders('controls');
        }
        controls = await controlsFolder.search({ order: 'parent, order, column', maxTextLen: 0 });
        getControlsRights(controls);
        renderPage();

    } catch(err) {
        renderPage(); // Dibuja igual, sin controles
    }
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
                $row = getRow($row, $tab);
                $col = $('<div/>', {
                    class: 'col-12 col-md-6 form-group',
                }).appendTo($row);

                getDefaultControl(field).appendTo($col);
            }
        });

        $row = getRow(undefined, $tab);
        $col = $('<div/>', {
            class: 'col-12 form-group',
        }).appendTo($row);

        newAttachments('attachments', 'Adjuntos').addClass('mt-3').appendTo($col);

        // tabHeader

        $tab = $cont.find('#tabHeader');
        $row = undefined;

        doc.fields().forEach(field => {
            if (field.headerTable) {
                $row = getRow($row, $tab);
                $col = $('<div/>', {
                    class: 'col-12 col-md-6 form-group',
                }).appendTo($row);

                getDefaultControl(field).appendTo($col);
            }
        })

        // tabHist

        $tab = $cont.find('#tabHist');
        $row = undefined;
        newDocLog('docLog').addClass('mt-3').appendTo($tab);

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
}

function getRow(pRow, pCont, pCol) {
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

function printForm() {
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

function exitForm() {
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

    /*
    todo: ver como debe quedar el closeOnExit

    v2

    if(closeonexit == "1"){
        try{
            if (window.top == window.self) {
                window.close();
            }
            document.write('Se guardaron los cambios, debe cerrar la pagina manualmente');
        } catch(ex){
            document.write('Se guardaron correctamente los cambios, debe cerrar la pagina manualmente');
        }
    } else {
        let contentUrl = "/c/content.asp?fld_id=" + fld_id;
        if (top.navigate) {
            window.location = contentUrl;
        }
        else {
            document.location.href = contentUrl;
        }
    }


    generic3

    If Request("closeonexit") & "" = "1" Then
	    RWL "try{" 	
        RWL "disposeDoc('" & doc_id & "','" & docguid & "');"
        RWL "setTimeout(function(){"
        RWL "   try{"
        RWL "   window.close();"
	    RWL "   document.write('Se guardaron los cambios, debe cerrar la pagina manualmente');"
        RWL "   } catch(ex){"
        RWL "       document.write('Se guardaron correctamente los cambios, debe cerrar la pagina manualmente');" 
        RWL "   }"
        RWL "},100);"
        RWL "} catch(ex){"
        RWL "document.write('Se guardaron correctamente los cambios, debe cerrar la pagina manualmente');" 
        RWL "}" 	

	ElseIf dSession.Tags("HOMEPAGE").Value <> "" Then
	    'RWL "if (top.navigate) { " & VbCrLf
        'RWL "	top.navigate(" & Folder.FolderType & ", 'frameDer', '" & ContentUrl & "', true);" & VbCrLf
        'RWL "	window.location = '" & ContentUrl & "';" & VbCrLf
        'RWL "} else {" & VbCrLf
        RWL "	window.location = '" & contentUrl & "';" & VbCrLf
        'RWL "}" & VbCrLf
		'RWL "top.location.href = '" & dSession.Tags("HOMEPAGE").Value & "';" 'TODO: no vuelve a la carpeta
	Else
		RWL "document.location.href = '" & contentUrl & "';"
	End If

    'TODO: sBackToFld
    */
}


function getDefaultControl(pField) {
    var $ret, $input, label;

    label = pField.description ? pField.description : pField.name;

    if (pField.type == 1) {
        if (pField.length > 0 && pField.length < 500) {
            $ret = newInputText(pField.name, label);
            $ret.addClass('mt-3');
            $input = $ret.find('input');
        } else {
            $ret = newTextarea(pField.name, label);
            $ret.addClass('mt-3');
            $input = $ret.find('textarea');
        }
        if (!pField.updatable) $input.attr({ 'readonly': 'readonly' });

    } else if (pField.type == 2) {
        $ret = newDTPicker(pField.name, label, 'datetime-local');
        $ret.addClass('mt-3');
        $input = $ret.find('input');
        if (!pField.updatable) $input.closest('.input-group').datetimepicker('disable');

    } else if (pField.type == 3) {
        $ret = newInputText(pField.name, label);
        $ret.addClass('mt-3');
        $input = $ret.find('input');
        $input.attr('data-numeral', numeral.options.defaultFormat);
        if (!pField.updatable) $input.attr({ 'readonly': 'readonly' });
    };

    $input.attr('data-textfield', pField.name.toLowerCase())

    return $ret;
}

async function renderControls(pCont, pParent) {
    var $row, $col, ctl, type, $this, domAttr, label, $input, aux, bsctl;
    var tf, textField, vf, valueField;

    var subset = controls.filter(function (el) {
        return el['PARENT'] == pParent && el['CONTROL'].toUpperCase() != 'TAB' &&
            el['CONTROL'].toUpperCase() != 'EVENT' && el['DONOTRENDER'] != 1 && el['R'] != '0'
    });

    for (var i = 0; i < subset.length; i++) {
        ctl = subset[i];
        type = ctl['CONTROL'].toUpperCase();
        domAttr = undefined;
        if (ctl['XMLATTRIBUTES']) {
            try {
                domAttr = $.parseXML(ctl['XMLATTRIBUTES']);
            } catch (err) {
                console.log('Error parsing ' + ctl['NAME'] + '.XMLATTRIBUTES: ' + errMsg(err));
            }
        };
        ctl.domAttr = domAttr;
        ctl.attr = function (attribute) {
            if (this.domAttr) return this.domAttr.documentElement.getAttribute(attribute);
        };

        label = ctl['DESCRIPTION'] ? ctl['DESCRIPTION'] : ctl['NAME'];
        $this = undefined;
        $input = undefined;
        bsctl = undefined;

        tf = undefined;
        textField = undefined;
        vf = undefined;
        valueField = undefined;

        var tf = ctl.attr('textfield');
        if (tf && tf != '[NULL]') {
            var textField = doc.fields(tf);
        };

        var vf = ctl.attr('valuefield');
        if (vf && vf != '[NULL]') {
            var valueField = doc.fields(vf);
        };

        $row = getRow($row, pCont, ctl['COLUMN']);
        $col = $('<div/>', {
            class: 'col-12 col-md-' + (ctl['COLUMN'] == '0' ? '12': '6') + ' form-group',
        }).appendTo($row);

        // todo: revisar que esten soportadas todas las properties de controls3

        // -- Textbox --

        if (type == 'TEXTBOX') {
            if (ctl.attr('mode') == '2') { // Multiline
                $this = newTextarea(ctl['NAME'], label);
                $this.addClass('mt-3');
                $input = $this.find('textarea');
                if (ctl.attr('height')) $input.css('height', ctl.attr('height') + ctl.attr('unitheight'));

            } else {
                $this = newInputText(ctl['NAME'], label);
                $this.addClass('mt-3')
                $input = $this.find('input');
                if (ctl.attr('mode') == '3') $input.attr('type', 'password');
                if (ctl.attr('isnumber') == '1') $input.attr('data-numeral', numeral.options.defaultFormat);
            }

            $input.attr('data-textfield', tf);

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


        // -- DTPicker --

        } else if (type == 'DTPICKER') {
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


        // -- HtmlRaw --

        } else if (type == 'HTMLRAW') {
            $this = $('<div/>', {
                id: ctl['NAME'],
                class: 'mt-3',
            });


        // -- Select / SelectMultiple --

        } else if (type == 'SELECT' || type == 'SELECTMULTIPLE') {
            $this = newSelect(ctl['NAME'], label, {
                multiple: ctl.attr('multiple') == '1' || type == 'SELECTMULTIPLE',
                liveSearch: (ctl.attr('searchbar') == '1'),
            });
            $this.addClass('mt-3');
            $input = $this.find('select');

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $input.attr('disabled', 'disabled');
                $input.selectpicker('refresh');
            }


        // -- SelectFolder / SelectKeywords / SelectMultipleFolder / LookupboxAccounts --

        } else if (type == 'SELECTFOLDER' || type == 'SELECTKEYWORDS' || type == 'SELECTMULTIPLEFOLDER' || type == 'LOOKUPBOXACCOUNTS') {
            $this = newSelect(ctl['NAME'], label, {
                multiple: ctl.attr('mode') == '2' || type == 'SELECTMULTIPLEFOLDER',
                liveSearch: (ctl.attr('searchbar') == '1' || type == 'LOOKUPBOXACCOUNTS'),
            });
            $this.addClass('mt-3');
            $input = $this.find('select');

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $input.attr('disabled', 'disabled');
                $input.selectpicker('refresh');
            }

            $input.attr('data-textfield', tf);
            $input.attr('data-valuefield', vf);

            $input.attr('data-fill', '1');

            if (type == 'SELECTKEYWORDS') {
                $input.attr('data-fill-folder', ctl.attr('folder'));
                $input.attr('data-fill-fields', 'DESCRIPTION, ID');
                $input.attr('data-fill-formula', 'TYPE = ' + sqlEncode(ctl.attr('keywordtype'), 1) +
                    ' and (DISABLED = 0 OR DISABLED is NULL)');
                aux = ctl.attr('order');
                $input.attr('data-fill-order', (aux ? aux : 'DESCRIPTION'));
                $input.attr('data-fill-withoutnothing', ctl.attr('withoutnull') == '1' ? '1' : '0');
                /*
                Si hacen falta los XFIELD agregarlos en el SBF asi:
                    $input.attr('data-fill-fields', $input.attr('data-fill-fields') + ', xfield1') 
                */

            } else if (type == 'SELECTFOLDER' || type == 'SELECTMULTIPLEFOLDER') {
                $input.attr('data-fill-folder', ctl.attr('searchfolder'));
                $input.attr('data-fill-fields', ctl.attr('fieldlist'));
                $input.attr('data-fill-formula', ctl.attr('searchfilter'));
                $input.attr('data-fill-order', ctl.attr('searchorder'));
                $input.attr('data-fill-withoutnothing', ctl.attr('withoutnull') == '1' || type == 'SELECTMULTIPLEFOLDER' ? '1' : '0');

            } else if (type == 'LOOKUPBOXACCOUNTS') {
                $input.attr('data-fill-folder', 'accounts');
                aux = '(disabled = 0 or disabled is null) and system = 0';
                if (ctl.attr('formula')) {
                    aux = aux + ' and (' + ctl.attr('formula') + ')';
                }
                $input.attr('data-fill-formula', aux);
                $input.attr('data-fill-order', 'name');
                $input.attr('data-fill-withoutnothing',
                    (ctl.attr('withoutnull') == '1' || ctl.attr('mode') == '2') ? '1' : '0');
            }


        // -- DocumentLog --

        } else if (type == 'DOCUMENTLOG') {
            $this = newDocLog(ctl['NAME'], label);
            //$this.addClass('mt-3');
            $this.attr('style', 'margin-top: 2.2rem !important;'); // Para alinear mejor con los inputs


        // -- HtmlArea --

        } else if (type == 'HTMLAREA') {
            let aux = parseInt(ctl.attr('height'));
            $this = newCKEditor(ctl['NAME'], label, {
                readOnly: ctl['W'] == 0 || ctl.attr('readonly') == '1',
                height: !isNaN(aux) ? aux : 150,
                customConfig: ctl.attr('mode') == 'basic' ? 'configbasic.js' : 'config.js',
            });
            $this.addClass('mt-3');
            $input = $this.find('textarea');
            $input.attr('data-textfield', tf);
            $input.attr('data-ckeditor', true);

            /*
            Tener en cuenta que el CKEditor no estara inicializado en el SBR porque la 
            inicializacion es asincrona. Para customizar el editor en el SBR usar su evento ckReady:

            ctx.$input.on('ckReady', (ev) => {
                ev.target.ckeditor.setReadOnly(true);
            });
            */


        // -- Checkbox --

        } else if (type == 'CHECKBOX') {
            $this = newCheckbox(ctl['NAME'], label);
            $this.addClass('mt-3');
            $input = $this.find('input');

            $input.attr('data-textfield', tf);
            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $input.attr('disabled', 'disabled');
            }


        // -- Hidden --

        } else if (type == 'HIDDEN') {
            $this = $('<input/>', {
                type: 'hidden',
                name: ctl['NAME'],
                id: ctl['NAME'],
                'data-textfield': tf
            })

        
        // -- Fieldset --

        } else if (type == 'FIELDSET') {
            $this = newFieldset(ctl['NAME'], ctl['DESCRIPTION']);

            let $coll = $this.find('.collapse');
            if ($coll.length) { // Si no tiene .collapse es invisible
                $this.addClass('mt-3');
                $this.find('.card-body').css('padding-top', '0');
                bsctl = $this.find('.collapse')[0].bscollapse;
            }

            await renderControls($this.find('fieldset'), ctl['NAME']);

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $this.find('fieldset').attr('disabled', 'disabled');
            }

            /*
            bsctl.show() // Abre el collapse
            bsctl.hide() // Cierra el collapse
            */


        // -- Autocomplete --

        } else if (type == 'AUTOCOMPLETE') {
            /*
            // todo: faltan editurl y addurl

            $this = getAutocomplete(ctl['NAME'], label, {
                folder: ctl.attr('searchfolder'),
                rootFolder: folder.RootFolderId,
                searchFields: ctl.attr('searchfields'),
                extraFields: ctl.attr('returnfields'),
                formula: ctl.attr('searchfilter'),
                order: ctl.attr('searchorder'),
            }, ctl.attr('mode') == '1');

            $input = $this.find('[data-autocomplete]');
            f7ctl = app7.autocomplete.get($input);

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                if ($input[0].tagName == 'INPUT') {
                    inputReadonly($input, true);
                } else {
                    $input.addClass('disabled');
                }
            }

            $input.attr('data-textfield', tf)
            f7ctl.params.textSource = ctl.attr('textsource');

            $('<input/>', {
                type: 'hidden',
                'data-valuefield': vf,
            }).appendTo($this);
            f7ctl.params.valueSource = ctl.attr('valuesource');

            $('<input/>', {
                type: 'hidden',
                'data-xmlfield': ctl.attr('xmlfield'),
            }).appendTo($this);

            f7ctl.on('change', function (value) {
                var self = this;

                if (self.inputEl) {
                    // Dropdown (simple)
                    var $li = $(self.inputEl).closest('li')
                } else {
                    // Popup (multiple)
                    var $li = $(self.openerEl).closest('li')
                    var $t = $(self.openerEl).find('.item-after');
                    var ts = self.params.textSource.toUpperCase();
                    var ta = [];
                }
                var $v = $li.find('[data-valuefield]');
                var vs = self.params.valueSource.toUpperCase();
                var va = [];

                var $x = $li.find('[data-xmlfield]');
                var dom = $.parseXML('<root/>');

                if (value.length > 0) {
                    var $it;
                    value.forEach(el => {
                        va.push(el[vs]);
                        if ($t) ta.push(el[ts]);
                        var $it = $('<item/>', dom);
                        Object.keys(el).forEach(prop => {
                            $it.attr(prop.toLowerCase(), el[prop]);
                        });
                        $it.appendTo(dom.documentElement);
                    })
                    $v.val(va.join(';'));
                    if ($t) $t.html(ta.join(';'));
                    $x.val((new XMLSerializer()).serializeToString(dom));

                } else {
                    $v.val('');
                    $x.val('');
                    if ($t) $t.empty();
                };
            });
            */


        // -- Maps Autocomplete --

        } else if (type == 'MAPSAUTOCOMPLETE') {
            $this = newMapsAutocomplete(ctl['NAME'], label);
            $this.addClass('mt-3');
            $input = $this.find('.maps-autocomplete');

            $input.attr('data-textfield', tf);
            $input.attr('data-valuefield', vf);

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $input.attr({ 'readonly': 'readonly' });
            }

            /*
            Para attacharse al evento change en el SBR:

            $input.on('placeChange', function (e) {
                var addrComp = e.originalEvent.detail.addressComponents;
                if (addrComp) {
                    toast(addrComp['locality'] + ' - ' + addrComp['administrative_area_level_1'] + ' - ' + addrComp['country']);
                }
            })
            */


        // -- Attachments --

        } else if (type == 'ATTACHMENTS') {
            $this = newAttachments(ctl['NAME'], label);
            $this.addClass('mt-3');
            $input = $this.find('div[data-attachments]');

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $input[0]._readonly(true);
            }

            /*
            El TAG se setea en el SBR asi:
                ctx.$input.attr('data-attachments', 'miTag');

            El addonly:
                ctx.$input[0]._addonly(true);
            */

        } else if (type == 'TIMEINTERVAL') {
            /*
            Set this = getTimeInterval (oNode, oProperties)
            executeScriptBeforeRender oNode
            If oNode.getAttribute("w") & "" <> "1" Then this.Readonly = True
            oStrBuilder.Append getLabel(oNode)
            */

        } else if (type == 'LINK') {
            /*
            Set this = getLink (oNode, oProperties)
            executeScriptBeforeRender oNode
            If oNode.getAttribute("w") & "" <> "1" Then this.Readonly = True
            oStrBuilder.Append "<label style='width:100%'> </label>"
            */

        } else if (type == 'BUTTONSBAR') {
            /*
            Set this = getButtonsBar(oNode, oProperties)
            executeScriptBeforeRender oNode
            'If oNode.getAttribute("w") & "" <> "1" Then this.Readonly = True
            'oStrBuilder.Append this.Render
            */

        } else if (type == 'BUTTON') {
            /*
            Set this = getButton(oNode, oProperties)
            executeScriptBeforeRender oNode
            If oNode.getAttribute("w") & "" <> "1" Then this.Readonly = True
            */
            let opts = {
                type: ctl.attr("issubmit") == "1" ? "submit" : "button"
            }
            $this = newButton(ctl['NAME'], label, opts);
            //$this.addClass('mt-3');
            $input = $this;
            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $input.attr('disabled', 'disabled');
            }
        }

        // Tooltips
        if ($this && ctl.attr('showtooltip') == '1' && ctl.attr('tooltip')) {
            $this.attr('data-bs-toggle', 'tooltip');
            $this.attr('data-bs-placement', 'bottom');
            $this.attr('title', ctl.attr('tooltip'));
        }

        if ($this) $this.appendTo($col);

        try {
            var context = {
                ctl, $this, $input, bsctl, textField, valueField, label
            };

            // Evento renderControl
            document.dispatchEvent(new CustomEvent('renderControl', { detail : context}));
            if (context.return && typeof context.return.then == 'function') await context.return;

            if (ctl['SCRIPTBEFORERENDER']) await evalCode(ctl['SCRIPTBEFORERENDER'], context);
            
        } catch (err) {
            console.error(err);
            toast(ctl['NAME'] + ' error: ' + dSession.utils.errMsg(err));
        }
        /*
        Objetos disponibles en este script:
            doc: El documento que se esta abriendo
            folder: La carpeta actual
            controlsFolder: La carpeta de controles
            controls: El search a la carpeta de controles completo
            ctl: El row del control que se esta dibujando
            ctl.attr(): Function que devuelve un atributo de XMLATTRIBUTES
            $this: El control completo JQuery (inluido el <div/>)
            $input: El input, textarea, select, etc, dentro del control
                (puede ser undefined en caso de los raw y otros)
            bsctl: El control Bootstrap (depende del control)
            textField: El objeto Field bindeado con textField (depende del control)
            valueField: El objeto Field bindeado con valueField (depende del control)
        */
    }
}

async function fillControls() {
    var title, form, formDesc;

    form = await folder.form
    formDesc = form.description ? form.description : form.name;

    if (!doc.isNew) {
        title = doc.fields('subject').value;
        if (title) {
            title += ' - ' + formDesc;
        } else {
            title = formDesc + ' #' + doc.id;
        };

        $('#deleteDoc').show();
    } else {
        title = 'Nuevo ' + formDesc;
        $('#deleteDoc').hide();
    }    

    document.title = title;
    $('#title').html(title);

    $('[data-textfield], [data-valuefield], [data-xmlfield]').each(function (ix, el) {
        var tf, textField, text;
        var vf, valueField, value;
        var xf, xmlField, xml;
        var $el = $(el);

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

        if (textField && el._text) {
            el._text(text);
            textField = undefined;
        }
        if (valueField && el._value) {
            el._value(value);
            valueField = undefined;
        }
        if (xmlField && el._xml) {
            el._xml(xml);
            xmlField = undefined;
        }
        
        if (textField || valueField || xmlField) {
            var f, v;
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
                    var format = $el.attr('data-numeral');
                    if (f.type == 3 || format) {
                        // Input numeric
                        let n = numeral(v);
                        if (n.value() != null) {
                            $el.val(n.format(format));
                        } else {
                            $el.val('');
                        }

                    } else if (f.type == 2) {
                        var dt = dSession.utils.cDate(v);
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

    // todo: todo esto hay q reemplazarlo segun el nuevo autocomplete
    /*
    $('[data-autocomplete]').each(function (ix, el) {
        var $el = $(el);
        var ac = app7.autocomplete.get($el);
        var $li = $el.closest('li');
        var $v = $li.find('[data-valuefield]');
        var $x = $li.find('[data-xmlfield]');
        if ($x.val()) {
            try {
                var $dom = $($.parseXML($x.val()));
                var values = [];
                $dom.find('item').each(function (ix, el) {
                    var value = {};
                    for (var i = 0; i < el.attributes.length; i++) {
                        var attr = el.attributes[i];
                        value[attr.name.toUpperCase()] = attr.value;
                    };
                    values.push(value);
                });
                ac.value = values;

            } catch (err) {
                console.log('Error setting autocomplete value: ' + errMsg(err));
            }
 
        } else if ($el.val() || $v.val()) {
            var txts = ($el.val() != '' ? $el.val().split(';') : []);
            var vals = ($v.val() != '' ? $v.val().split(';') : []);
            var values = [];
            var ts = ac.params.textSource.toUpperCase();
            var vs = ac.params.valueSource.toUpperCase();
            var i = 0;
            while (txts[i] != undefined || vals[i] != undefined) {
                var value = {};
                if (ts && txts[i] != undefined) {
                    value[ts] = txts[i];
                }
                if (vs && vals[i] != undefined) {
                    value[vs] = txts[i];
                }
                values.push(value);
                i++;
            }
            ac.value = values;
 
        } else {
            ac.value = [];
        }
        //ac.emit('change', ac.value);
    })
    */

    // Inicializa los chats de Whatsapp
    let $wappChats = $('div.wapp-chat');
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

    $('[data-attachments]').each(function (ix, el) {
        this._value(doc);
    });

    $('[data-doc-log]').each(function (ix) {
        this._value(doc);
    });

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

function getEvent(pEvent) {
    if (controls) {
        let ev = controls.find(el => el['NAME'] && el['NAME'].toUpperCase() == pEvent.toUpperCase());
        if (ev) return ev['SCRIPTBEFORERENDER'];
    }
}

async function saveDoc(exitOnSuccess) {
    if (saving) return;
    saving = true;
    preloader.show();

    try {
        $('[data-textfield]').each(function (ix, el) {
            var $el = $(el);
            var field = doc.fields($el.attr('data-textfield'));

            if (field && field.updatable) {
                if (el._text) {
                    let aux = el._text();
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
                }
            }
        });

        $('[data-valuefield]').each(function (ix, el) {
            var $el = $(el);
            var field = doc.fields($el.attr('data-valuefield'));

            if (field && field.updatable) {
                if (el._value) {
                    let aux = el._value();
                    field.value = Array.isArray(aux) ? aux.join(';') : aux;

                } else if (el.tagName == 'SELECT') {
                    let aux = $el.val();
                    field.value = Array.isArray(aux) ? aux.join(';') : aux;

                } else if (el.tagName == 'INPUT') {
                    field.value = $el.val();
                }
            }
        });

        $('[data-xmlfield]').each(function (ix, el) {
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
        var context = { exitOnSuccess };

        // Evento beforeSave
        document.dispatchEvent(new CustomEvent('beforeSave', { detail : context }));
        if (context.return && typeof context.return.then == 'function') await context.return;

        // Control Event BeforeSave
        var ev = getEvent('BeforeSave');
        if (ev) await evalCode(ev, context);

        await doc.save();
        docJson = doc.toJSON();
        doc_id = doc.id;
        saved = true;

        try {
            await saveAtt();
            doc.attachmentsReset();

        } catch(err) {
            var attErr = 'Algunos adjuntos no pudieron guardarse, consulte la consola para mas informacion';
            console.log(attErr);
            console.error(err);
        }

        try {
            // Evento afterSave
            document.dispatchEvent(new CustomEvent('afterSave', { detail : context }));
            if (context.return && typeof context.return.then == 'function') await context.return;

            // Control Event AfterSave
            var ev = getEvent('AfterSave');
            if (ev) await evalCode(ev, context);

        } catch (err) {
            var asErr = 'AfterSave error: ' + dSession.utils.errMsg(err);
            console.error(err);
        }

        saving = false;
        preloader.hide();

        if (attErr) {
            toast(attErr);
        } else if (asErr) {
            toast(asErr);
        }

        if (exitOnSuccess) {
            var timeOut = (attErr || asErr ? 5000 : 0);
            setTimeout(exitForm, timeOut);
        } else {
            toast('Cambios guardados');
            fillControls();
        }

    } catch(err) {
        errMgr(err);
    }

    function errMgr(pErr) {
        saving = false;
        preloader.hide();
        toast(dSession.utils.errMsg(pErr));
        console.error(pErr);
    }
}

function saveAtt() {
    return new Promise(async (resolve, reject) => {
        var errors = [];

        // Guarda los adjuntos que se puedan haber agregado por codigo
        try {
            await doc.saveAttachments();

        } catch (err) {
            errors.push({
                action: 'saveAttachments',
                error: dSession.utils.errMsg(err),
            });
        }

        // Guarda los adjuntos de los controles attachments
        var $attsToSave = $('div[data-attachments] [data-att-action]');
        var attMap = await doc.attachments();

        dSession.utils.asyncLoop($attsToSave.length, async loop => {
            var $this = $($attsToSave[loop.iteration()]);
            var tag = $this.closest('li.accordion-item').attr('data-attachments');
            tag = (tag == 'all' ? null : tag);
            var attName = $this.attr('data-att-name');
            var attAction = $this.attr('data-att-action');

            if (attAction == 'save') {
                var file = $this[0]._file;
                var reader = new FileReader();
                reader.onloadend = async function (e) {
                    try {
                        var att = doc.attachmentsAdd(file.name);
                        att.fileStream = new Blob([this.result], { type: file.type });
                        if (tag || tag == 0) {
                            att.description = tag;
                            att.group = tag;
                        }
                        await att.save();

                    } catch (err) {
                        errors.push({
                            file: attName,
                            action: 'save',
                            error: dSession.utils.errMsg(err),
                        });
                    }
                    loop.next();
                };
                reader.readAsArrayBuffer(file);

            } else if (attAction == 'delete') {
                var att = attMap.find(el => el.id == $this.attr('data-att-id'));
                if (att) {
                    try {
                        await att.delete();
                    } catch (err) {
                        errors.push({
                            file: attName,
                            action: 'delete',
                            error: err,
                        });
                    }
                }
                loop.next();
            }
        }, () => {
            if (errors.length == 0) {
                resolve(true);
            } else {
                reject(errors);
            }
        });
    });
}

async function evalCode(code, ctx) {
    try {
        var pipe = {};
        eval(`pipe.fn = async (ctx) => {\n\n${code}\n};`);
        return await pipe.fn(ctx);

    } catch(err) {
        console.error(err);
        throw err;
    }
}

