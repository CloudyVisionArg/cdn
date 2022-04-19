'use strict';

/*
Documentacion de componentes:

Bootstrap: https://getbootstrap.com/docs/5.1/getting-started/introduction/
Iconos: https://icons.getbootstrap.com
DTPicker: https://getdatepicker.com/5-4/
bootstrap-select: https://developer.snapappointments.com/bootstrap-select/
jQuery: https://api.jquery.com
Numeral: http://numeraljs.com
Moment: https://momentjs.com
CKEditor: https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR.html
*/

var urlParams, fld_id, folder, doc_id, doc;
var controlsFolder, controls, controlsRights;
var saving, cache;

// Includes que no es necesario esperar
include('bootstrap-icons', 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css');
include('font-awesome', 'https://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.css');
include('ckeditor', '/c/inc/ckeditor-nov2016/ckeditor.js');

// Includes que tienen que estar antes de dibujar la pag
var arrScripts = [];
arrScripts.push({ id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' });
arrScripts.push({ id: 'bootstrap', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js' });
arrScripts.push({ id: 'bootstrap-css', depends: ['bootstrap'], src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css' });
arrScripts.push({ id: 'doorsapi', depends: ['jquery'] });
arrScripts.push({ id: 'web-javascript', version: 0, depends: ['jquery'] });
arrScripts.push({ id: 'web-controls' });
arrScripts.push({ id: 'lib-numeral' });
arrScripts.push({ id: 'lib-numeral-locales', depends: ['lib-numeral'] });
arrScripts.push({ id: 'tempus-dominus', depends: ['jquery'], src: 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/js/tempusdominus-bootstrap-4.min.js' });
arrScripts.push({ id: 'tempus-dominus-css', src: 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/css/tempusdominus-bootstrap-4.min.css' });
arrScripts.push({ id: 'lib-moment' });
arrScripts.push({ id: 'bootstrap-select', depends: ['jquery', 'bootstrap', 'bootstrap-css'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/js/bootstrap-select.min.js' });
arrScripts.push({ id: 'bootstrap-select-css', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/css/bootstrap-select.min.css' });
// todo: esto deberia ser segun el lenguaje
arrScripts.push({ id: 'bootstrap-select-lang', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/js/i18n/defaults-es_ES.min.js' });

include(arrScripts, function () {
    console.log('Page init');
    preloader.show();

	Doors.RESTFULL.ServerUrl = window.location.origin + '/restful';
	//Doors.RESTFULL.AuthToken = getCookie('AuthToken');
	Doors.RESTFULL.AuthToken = '408F7D71E82F037A70B36EF1484229CB99480095B65DEC7F6878FB9C91D87124';

    // todo: mensaje y terminar
    DoorsAPI.islogged().then(
		function (res) {
		},
		function (err) {
			console.log(err);
		}
	);

    // todo: setar segun el LNG_ID
    moment.locale('es');
    numeral.locale('es'); // http://numeraljs.com/
    numeral.defaultFormat('0,0.[00]');

	urlParams = new URLSearchParams(window.location.search);
	fld_id = urlParams.get('fld_id');
	doc_id = urlParams.get('doc_id');
	
	if (fld_id) {
		DoorsAPI.foldersGetById(fld_id).then(
			function (res) {
				folder = res;
                if (folder.Type == 1) {
                    DoorsAPI.formsGetById(folder.FrmId).then(
                        function (frm) {
                            folder.Form = frm;
                        }
                    );
                }
				getDoc();
			},
			errMgr
		)
	}

});

function errMgr(pErr) {
	console.log(pErr);
	alert(errMsg(pErr));
};

function getDoc() {
	if (doc_id) {
		DoorsAPI.documentsGetById(doc_id).then(
			function (res) {
				doc = res;
				getControlsFolder();
			},
			errMgr
		);

	} else {
		DoorsAPI.documentsNew(fld_id).then(
			function (res) {
				doc = res;
				getControlsFolder();
			},
			errMgr
		);
	}
}

function getControlsFolder() {
	var cf = objPropCI(doc.Tags, 'controlsFolder');
	
	if (cf) {
		DoorsAPI.foldersGetByPath(folder.RootFolderId, cf).then(
			function (res) {
				controlsFolder = res;
				loadControls();
			},
			function (err) {
				renderPage(); // Dibuja igual, sin controles
			}
		);
		
	} else {
		DoorsAPI.foldersGetByName(fld_id, 'controls').then(
			function (res) {
				controlsFolder = res;
				loadControls();
			},
			function (err) {
				renderPage(); // Dibuja igual, sin controles
			}
		);
	};
}

function loadControls() {
	DoorsAPI.folderSearch(controlsFolder['FldId'], '', '', 'parent, order, column', 0, null, 0).then(
		function (res) {
			controls = res;
			getControlsRights(controls);
			renderPage();
		},
		function (err) {
			console.log(pErr);
			renderPage(); // Dibuja igual, sin controles
		}
	)
}

function getControlsRights(pControls) {
	var cr = objPropCI(doc.Tags, 'controlsRights');
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

function renderPage() {
    var $body = $('body');
    var $d = $(document);

    $d.ready(function () {
        // Tooltips
        $('[data-bs-toggle="tooltip"]').tooltip();

        // Validacion de numero
        $('[data-numeral]').change(function (e) {
            var $this = $(this);
            var n = numeral($this.val());
            if (n.value()) {
                $this.val(n.format($this.attr('data-numeral')));
            } else {
                $this.val('');
                toast('Ingrese un numero valido');
            }
        });

        // Kb shortcuts
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

    $cont.append(`
        <div class="btn-group" role="group" aria-label="..." style="position:fixed; top:10px; right:10px; z-index:1000;">
            <button type="button" id="print" class="btn btn-primary" onclick="printForm();">
                <i class="bi bi-printer-fill"></i>
                <span class="d-none d-md-inline-block"> Imprimir</span>
            </button>
            <button type="button" id="save" class="btn btn-primary" onclick="saveDoc();" title="CTRL+S" data-bs-toggle="tooltip">
                <i class="bi bi-cloudy-fill"></i>
                <span class="d-none d-md-inline-block"> Guardar</span>
            </button>
            <button type="button" id="saveexit" class="btn btn-primary" onclick="submitForm('saveexit');">
                <i class="bi bi-cloud-check-fill"></i>
                <span class="d-none d-md-inline-block"> Guardar y salir</span>
            </button>
            <button type="button" id="cancel" class="btn btn-primary" onclick="exitForm(false);">
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

        doc.CustomFields.forEach(field => {
            if (!field.HeaderTable && field.Name != 'DOC_ID') {
                $row = getRow($row, $tab);
                $col = $('<div/>', {
                    class: 'col-12 col-md-6 form-group',
                }).appendTo($row);

                getDefaultControl(field).appendTo($col);
            }
        });

        /*
        $ctl = getAttachments('attachments', 'Adjuntos').appendTo($ul);
        $ctl.find('.list').on('click', 'a', downloadAtt);
        $ctl.on('swipeout:deleted', 'li.swipeout', deleteAtt);
        $ctl.find('div.row').on('click', 'button', addAtt);
        */

        // tabHeader

        $tab = $cont.find('#tabHeader');
        $row = undefined;

        doc.CustomFields.forEach(field => {
            if (field.HeaderTable) {
                $row = getRow($row, $tab);
                $col = $('<div/>', {
                    class: 'col-12 col-md-6 form-group',
                }).appendTo($row);

                getDefaultControl(field).appendTo($col);
            }
        })

        doc.HeadFields.forEach(field => {
            $row = getRow($row, $tab);
            $col = $('<div/>', {
                class: 'col-12 col-md-6 form-group',
            }).appendTo($row);

            getDefaultControl(field).appendTo($col);
        })

        // tabHist

        $tabHist = $('<div/>', {
            class: 'tab',
            id: 'tabHist',
        }).appendTo($tabs);

        $('<div/>', {
            'data-doclog': 1,
        }).append('Cargando...').appendTo($tabHist);

    } else {

        // CON CONTROLES

        // Evento BeforeRender
        var ev = getEvent('BeforeRender');
        if (ev) {
            try {
                eval(ev);
            } catch (err) {
                console.log('Error in BeforeRender: ' + errMsg(err));
            }
        };

        // Membrete

        renderControls($cont, '[NULL]');

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

                renderControls($tab, tab['NAME']);
            }
        }
    };

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
            getFolder($el.attr('data-fill-folder'), folder.RootFolderId).then(
                function (res) {
                    var arrFields, textField, valueField, dataFields;

                    var arrFields = $el.attr('data-fill-fields').split(',');
                    if (arrFields.length > 0) textField = arrFields.shift().trim();
                    if (arrFields.length > 0) valueField = arrFields.shift().trim();
                    if (arrFields.length > 0) dataFields = arrFields.join(',');

                    fillSelect($el,
                        DoorsAPI.folderSearch(res['FldId'], $el.attr('data-fill-fields'),
                            $el.attr('data-fill-formula'), $el.attr('data-fill-order')
                        ),
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
    setTimeout(function waiting() {
        if ($('[data-filling]').length > 0) {
            setTimeout(waiting, 100);
        } else {
            fillControls(doc);
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
    debugger;

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
    history.back();
}

function getDefaultControl(pField) {
    var $ret, $input, label;

    label = pField.Description ? pField.Description : pField.Name;

    if (pField.Type == 1) {
        if (pField.Length > 0 && pField.Length < 500) {
            $ret = newInputText(pField.Name, label);
            $ret.addClass('mt-3');
            $input = $ret.find('input');
        } else {
            $ret = newTextarea(pField.Name, label);
            $ret.addClass('mt-3');
            $input = $ret.find('textarea');
        }

    } else if (pField.Type == 2) {
        $ret = newDTPicker(pField.Name, label, 'datetime-local');
        $ret.addClass('mt-3');
        $input = $ret.find('input');

    } else if (pField.Type == 3) {
        $ret = newInputText(pField.Name, label);
        $ret.addClass('mt-3');
        $input = $ret.find('input');
        $input.attr('data-numeral', numeral.options.defaultFormat);
    };

    if (!pField.Updatable) $input.attr({ 'readonly': 'readonly' });
    $input.attr('data-textfield', pField.Name.toLowerCase())

    return $ret;
}

function renderControls(pCont, pParent) {
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
            var textField = getDocField(doc, tf);
            if (!textField) {
                console.log('No se encontro el campo ' + tf.toUpperCase());
            }
        };

        var vf = ctl.attr('valuefield');
        if (vf && vf != '[NULL]') {
            var valueField = getDocField(doc, vf);
            if (!valueField) {
                console.log('No se encontro el campo ' + vf.toUpperCase());
            }
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
            } else if (textField && textField.Type == 1 && textField.Length > 0) {
                $input.attr('maxlength', textField.Length);
            }

            if (textField && textField.Type == 3) {
                $input.attr('data-numeral', numeral.options.defaultFormat)
            }

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                inputReadonly($input, true);
            }

            if (ctl.attr('datalist') == '1' && ctl.attr('mode') == '1' && textField) {
                inputDataList($input, {
                    folder: fld_id,
                    field: tf,
                });
            }

            if (ctl.attr('buttons') == 'phone') addPhoneButton($this);
            if (ctl.attr('buttons') == 'email') addEmailButton($this);


        // -- DTPicker --

        } else if (type == 'DTPICKER') {
            var mode = 'date';
            if (ctl.attr('mode') == '2') {
                mode = 'datetime-local';
            } else if (ctl.attr('mode') == '3') {
                mode = 'time';
            }
            $this = newDTPicker(ctl['NAME'], label, mode)
            $this.addClass('mt-3');
            $input = $this.find('input');
            $input.attr('data-textfield', tf);
            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                inputReadonly($input, true);
            }


        // -- HtmlRaw --

        } else if (type == 'HTMLRAW') {
            $this = $('<div/>', {
                id: ctl['NAME'],
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
                $input.attr('disabled', true);
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
                $input.attr('disabled', true);
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
                $input.attr('data-fill-withoutnothing', ctl.attr('allownull') == '0' ? '1' : '0');
                /*
                Si hacen falta los XFIELD agregarlos en el SBF asi:
                    $input.attr('data-fill-fields', $input.attr('data-fill-fields') + ', xfield1') 
                */

            } else if (type == 'SELECTFOLDER' || type == 'SELECTMULTIPLEFOLDER') {
                $input.attr('data-fill-folder', ctl.attr('searchfolder'));
                $input.attr('data-fill-fields', ctl.attr('fieldlist'));
                $input.attr('data-fill-formula', ctl.attr('searchfilter'));
                $input.attr('data-fill-order', ctl.attr('searchorder'));
                $input.attr('data-fill-withoutnothing', ctl.attr('allownull') == '0' || type == 'SELECTMULTIPLEFOLDER' ? '1' : '0');

            } else if (type == 'LOOKUPBOXACCOUNTS') {
                $input.attr('data-fill-folder', 'accounts');
                aux = '(disabled = 0 or disabled is null) and system = 0';
                if (ctl.attr('formula')) {
                    aux = aux + ' and (' + ctl.attr('formula') + ')';
                }
                $input.attr('data-fill-formula', aux);
                $input.attr('data-fill-order', 'name');
                $input.attr('data-fill-withoutnothing',
                    (ctl.attr('allownull') == '0' || ctl.attr('mode') == '2') ? '1' : '0');
            }


        // -- DocumentLog --

        } else if (type == 'DOCUMENTLOG') {
            /*
            $this = $('<li/>');
            
            $('<div/>', {
                id: ctl['NAME'],
                name: ctl['NAME'],
                class: 'block',
                'data-doclog': 1,
            }).append('Cargando...').appendTo($this);
            */


        // -- HtmlArea --

        } else if (type == 'HTMLAREA') {
            var aux = parseInt(ctl.attr('height'));
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
            inicializacion es asincrona. Para customizar el editor en el SBR usar su evento ckinit:

            $input.on('ckinit', function (e) {
                this.ckeditor.setReadOnly(true);
            })
            */


        // -- Checkbox --

        } else if (type == 'CHECKBOX') {
            $this = newCheckbox(ctl['NAME'], label);
            $this.addClass('mt-3');
            $input = $this.find('input');

            $input.attr('data-textfield', tf);
            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $input.attr('disabled', true);
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
            $this.addClass('mt-3');
            $this.find('.card-body').css('padding-top', '0');

            bsctl = $this.find('.collapse')[0].bscollapse;
            renderControls($this.find('fieldset'), ctl['NAME']);

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $this.find('fieldset').attr('disabled', true);
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
                    if ($t) $t.html('');
                };
            });
            */


        // -- Attachments --

        } else if (type == 'ATTACHMENTS') {
            /*
            $this = getAttachments(ctl['NAME'], label);
            $this.find('.list').on('click', 'a.item-content', downloadAtt);
            $this.on('swipeout:deleted', 'li.swipeout', deleteAtt);
            $this.find('div.row').on('click', 'button', addAtt);

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $this.attr('readonly', true);
                $this.find('div.row').hide();
            }

            // El TAG se setea en el APP7_SCRIPT asi:
            // $this.attr('data-attachments', 'miTag');
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
        }

        if ($this) $this.appendTo($col);

        try {
            if (ctl['SCRIPTBEFORERENDER']) eval(ctl['SCRIPTBEFORERENDER']);
        } catch (err) {
            console.log('Error in ' + ctl['NAME'] + '.SCRIPTBEFORERENDER: ' + errMsg(err));
        }
        /*
        Objetos disponibles en este script:
            doc: El objeto Document que se esta abriendo
            folder: La carpeta actual
            controlsFolder: La carpeta de controles
            controls: El search a la carpeta de controles completo
            ctl: El control que se esta dibujando
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

function fillControls() {
    var title, form;

    form = folder.Form.Description ? folder.Form.Description : folder.Form.Name;

    if (!doc.IsNew) {
        title = getDocField(doc, 'subject').Value;
        if (title) {
            title += ' - ' + form;
        } else {
            title = form + ' #' + doc.DocId;
        }

        /*
        getDocLog(doc_id, function (table) {
            $('[data-doclog]').html(table);
        });
        */

    } else {
        title = 'Nuevo ' + form;
        //$('[data-doclog]').html('');
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
            var textField = getDocField(doc, tf);
            if (textField) {
                text = textField.Value;
            } else {
                text = null;
                console.log('No se encontro el campo ' + tf.toUpperCase());
            }
        };

        vf = $el.attr('data-valuefield');
        if (vf && vf != '[NULL]') {
            var valueField = getDocField(doc, vf);
            if (valueField) {
                value = valueField.Value;
            } else {
                value = null;
                console.log('No se encontro el campo ' + vf.toUpperCase());
            }
        };

        xf = $el.attr('data-xmlfield');
        if (xf && xf != '[NULL]') {
            var xmlField = getDocField(doc, xf);
            if (xmlField) {
                xml = xmlField.Value;
            } else {
                xml = null;
                console.log('No se encontro el campo ' + xf.toUpperCase());
            }
        };

        if (el.tagName == 'INPUT') {
            
            var type = $el.attr('type').toLowerCase();

            if (type == 'text') {
                var format = $el.attr('data-numeral');
                if (format) {
                    // Input numeric
                    var n = numeral(text);
                    if (n.value() != null) {
                        $el.val(n.format(format));
                    } else {
                        $el.val('');
                    }
                } else if ($el.attr('data-date-type')) {
                    // DTPicker
                    setDTPickerVal($el, text);

                } else if ($el.hasClass('maps-autocomplete')) {
                    // Input maps
                    $el.val(text);

                    // Setea el place (value) del Autocomplete
                    el.initializing = true;
                    el.mapsAutocomplete.set('place', undefined);
                    el.initializing = undefined;

                    if (value) {
                        var places = new google.maps.places.PlacesService(maps.map);
                        places.getDetails({ placeId: value.split(';')[0] }, function (place, status) {
                            if (status === google.maps.places.PlacesServiceStatus.OK) {
                                el.initializing = true;
                                el.mapsAutocomplete.set('place', place);
                                el.initializing = undefined;
                            }
                        });
                    };
        
                } else {
                    if (textField && textField.Type == 2) {
                        if (text) {
                            $el.val(formatDate(text));
                        } else {
                            $el.val('');
                        }
                    } else {
                        $el.val(text);
                    }
                }

            } else if (type == 'checkbox') {
                el.checked = (text == '1');

            } else if (type == 'hidden') {
                if (textField) {
                    $el.val(text);
                } else if (valueField) {
                    $el.val(value);
                } else if (xmlField) {
                    $el.val(xml);
                }
            }

        } else if (el.tagName == 'TEXTAREA') {
            if (el.ckeditor) {
                el.ckeditor.setData(text);
            } else {
                $el.val(text);
            }

        } else if (el.tagName == 'SELECT') {
            if ($el.attr('multiple')) {
                var t = text ? text.split(';') : null;
                var v = value ? value.split(';') : null;
                setSelectVal($el, t, v);
            } else {
                setSelectVal($el, text, value);
            }

        } else if (el.tagName == 'A') {
            if ($el.attr('data-autocomplete')) {
                $el.find('.item-after').html(text);
            }
        }
    });

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

    // Inicializa los chats de Whatsapp
    var $wappChats = $('div.wapp-chat');
    if ($wappChats.length > 0) {
        include('whatsapp', function () {
            wapp.ready(function () {
                $wappChats.each(function () {
                    var $this = $(this);
                    setFieldAttr($this, 'data-internal-name');
                    setFieldAttr($this, 'data-internal-number');
                    setFieldAttr($this, 'data-external-name');
                    setFieldAttr($this, 'data-external-number');
                    wapp.init($this);

                    function setFieldAttr(pCont, pAttr) {
                        var field = pCont.attr(pAttr + '-field');
                        if (field) {
                            pCont.attr(pAttr, getDocField(doc, field).Value);
                        }
                    }
                });
            });
        });
    }

    $('[data-attachments]').each(function (ix, el) {
        fillAttachments($(el));
    });

    // Evento AfterRender
    var ev = getEvent('AfterRender');
    if (ev) {
        try {
            eval(ev);
        } catch (err) {
            console.log('Error in AfterRender: ' + errMsg(err));
        }
    };

}

function getEvent(pEvent) {
    if (controls) {
        var ev = controls.find(el => el['NAME'] && el['NAME'].toUpperCase() == pEvent.toUpperCase());
        if (ev) return ev['SCRIPTBEFORERENDER'];
    }
}

function saveDoc() {
    if (saving) return;
    saving = true;
    preloader.show();

    $('[data-textfield]').each(function (ix, el) {
        var $el = $(el);
        var field = getDocField(doc, $el.attr('data-textfield'));

        if (field && field.Updatable) {
            if (el.tagName == 'INPUT') {
                var type = $el.attr('type').toLowerCase();
                if (type == 'text') {
                    if ($el.attr('data-numeral') || field.Type == 3) {
                        field.Value = numeral($el.val()).value();
                    } else if (field.Type == 2) {
                        var mom = moment($el.val(), 'L LT');
                        if (mom.isValid()) {
                            field.Value = mom.format('YYYY-MM-DDTHH:mm:ss') + timeZone();
                        } else {
                            field.Value = null;
                        }
                    } else {
                        field.Value = $el.val();
                    };

                } else if (type == 'checkbox') {
                    field.Value = el.checked ? '1' : '0';

                } else if (type == 'hidden') {
                    field.Value = $el.val();
                }

            } else if (el.tagName == 'SELECT') {
                var aux = getSelectText($el);
                field.Value = Array.isArray(aux) ? aux.join(';') : aux;

            } else if (el.tagName == 'DIV') {
                if ($el.hasClass('text-editor')) {
                    field.Value = app7.textEditor.get($el).getValue();
                }

            } else if (el.tagName == 'A') {
                if ($el.attr('data-autocomplete')) {
                    field.Value = $el.find('.item-after').html();
                }

            } else if(el.tagName == 'TEXTAREA') {
                if (el.ckeditor) {
                    field.value = el.ckeditor.getData();
                } else {
                    field.Value = $el.val();
                }
            }
        }
    });

    $('[data-valuefield]').each(function (ix, el) {
        var $el = $(el);
        var field = getDocField(doc, $el.attr('data-valuefield'));

        if (field && field.Updatable) {
            if (el.tagName == 'SELECT') {
                var aux = getSelectVal($el);
                field.Value = Array.isArray(aux) ? aux.join(';') : aux;

            } else if (el.tagName == 'INPUT') {
                if ($el.hasClass('maps-autocomplete')) {
                    field.Value = $el.attr('data-place');

                } else {
                    var type = $el.attr('type').toLowerCase();
                    if (type == 'hidden') {
                        if (field.Type == 3) {
                            field.Value = numeral($el.val()).value();
                        } else {
                            field.Value = $el.val();
                        };
                    }
                }
            }
        }
    });

    $('[data-xmlfield]').each(function (ix, el) {
        var $el = $(el);
        var field = getDocField(doc, $el.attr('data-xmlfield'));

        if (field && field.Updatable) {
            if (el.tagName == 'INPUT') {
                var type = $el.attr('type').toLowerCase();
                if (type == 'hidden') {
                    field.Value = $el.val();
                }
            }
        }
    });

    // Evento BeforeSave
    var ev = getEvent('BeforeSave');
    if (ev) {
        try {
            eval(ev);
        } catch (err) {
            console.log('Error in BeforeSave: ' + errMsg(err));
        }
    };

    DoorsAPI.documentSave(doc).then(
        function (doc2) {
            doc = doc2;
            doc_id = getDocField(doc, 'doc_id').Value;

            saveAtt().then(
                function (res) {
                    // Evento AfterSave
                    var ev = getEvent('AfterSave');
                    if (ev) {
                        try {
                            eval(ev);
                        } catch (err) {
                            console.log('Error in AfterSave: ' + errMsg(err));
                        }
                    };

                    saving = false;
                    preloader.hide();
                    toast('Cambios guardados');
                    fillControls();
                },
                errMgr
            );
        },
        errMgr
    );

    function errMgr(pErr) {
        saving = false;
        preloader.hide();
        if (Array.isArray(pErr)) {
            if (pErr.length == 1) {
                toast('Error al \'' + pErr[0].action + '\' el adjunto \'' + pErr[0].name + '\': ' + pErr[0].result);

            } else {
                // Error de saveAtt
                toast('Algunos adjuntos no pudieron guardarse, consulte la consola para mas informacion');
            }
        } else {
            toast(errMsg(pErr));
        }
        console.log(pErr);
    }
}

function saveAtt() {
    return new Promise(function (resolve, reject) {

        resolve('OK');
        return;

        var calls = [];
        var $attsToSave = $('li[data-attachments] [data-att-action]');

        if ($attsToSave.length == 0) {
            resolve('OK');
            
        } else {
            $attsToSave.each(function () {
                var $this = $(this);
                var tag = $this.closest('li.accordion-item').attr('data-attachments');
                var attName = $this.attr('data-att-name');
                var attAction = $this.attr('data-att-action');
                
                beginCall(attName, attAction);
                
                if (attAction == 'save') {
                    getFile($this.attr('data-att-url')).then(
                        function (file) {
                            var reader = new FileReader();
                            reader.onloadend = function (e) {
                                var blobData = new Blob([this.result], { type: file.type });
                                var formData = new FormData();
                                // todo: como subimos el Tag?
                                formData.append('attachment', blobData, file.name);
                                DoorsAPI.attachmentsSave(doc_id, formData).then(
                                    function (res) {
                                        endCall(attName, 'OK');
                                    },
                                    function (err) {
                                        endCall(attName, 'attachmentsSave error: ' + errMsg(err));
                                    }
                                )
                            };
                            reader.readAsArrayBuffer(file);
    
                        },
                        function (err) {
                            endCall(attName, 'file error: ' + errMsg(err));
                        }
                    )
                    
                } else if (attAction == 'delete') {
                    // todo: borrar $this.attr('data-att-id')
                    setTimeout(function () { endCall(attName, 'No implementado') }, 0);
                }
            
                function beginCall(pName, pAction) {
                    calls.push({ name: pName, action: pAction, result: 'pending' });
                }
                
                function endCall(pName, pResult) {
                    calls.find(el => el.name == pName).result = pResult;
                    if (!calls.find(el => el.result == 'pending')) {
                        if (calls.find(el => el.result != 'OK')) {
                            reject(calls.filter(el => el.result != 'OK'));
                        } else {
                            resolve('OK');
                        }
                    }
                }
            });
        }
    });
}

// accountsSearch con cache
function accountsSearch(pFormula, pOrder) {
    return new Promise(function (resolve, reject) {
        var key, prom;
        key = 'accSearch / ' + pFormula + ' / ' + pOrder;
        prom = getCache(key);
        if (prom == undefined) {
            prom = DoorsAPI.accountsSearch(pFormula, pOrder);
            setCache(key, prom);
        }
        prom.then(
            function (res) {
                resolve(res);
            },
            function (err) {
                console.log(err);
                reject(err);
            }
        )
    });
}

function getCache(pKey) {
    if (Array.isArray(cache)) {
        var f = cache.find(el => el.key == pKey);
        if (f) {
            console.log('Cache hit: ' + pKey);
            return f.value;
        }
    }
}

function setCache(pKey, pValue) {
    if (Array.isArray(cache)) {
        var f = cache.find(el => el.key == pKey);
        if (f) {
            f.value = pValue;
        } else {
            cache.push({ key: pKey, value: pValue });
        }
    } else {
        cache = [{ key: pKey, value: pValue }];
    }
}