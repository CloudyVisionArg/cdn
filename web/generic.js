'use strict';

// https://fontawesome.com/v4/icons/ para buscar iconos

var urlParams, fld_id, folder, doc_id, doc;
var constrolsFolder, controls, controlsRights;

var arrScripts = [];
arrScripts.push({ id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' });
arrScripts.push({ id: 'bootstrap', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js' });
arrScripts.push({ id: 'app7-doorsapi', depends: ['jquery'] });
arrScripts.push({ id: 'javascript', version: 0 });
arrScripts.push({ id: 'web-controls', version: 0 });
arrScripts.push({ id: 'lib-numeral' });
arrScripts.push({ id: 'lib-numeral-locales', depends: ['lib-numeral'] });

includeJs(arrScripts, function () {
	Doors.RESTFULL.ServerUrl = window.location.origin + '/restful';
	//Doors.RESTFULL.AuthToken = getCookie('AuthToken');
	Doors.RESTFULL.AuthToken = 'B3ECBFD9E08A25A73CC243F662099323865DD9CBCCB62121C37A68D53F6430D2';

	DoorsAPI.islogged().then(
		function (res) {
		},
		function (err) {
			console.log(err);
		}
	);

    // todo: setar segun el LNG_ID
    numeral.locale('es'); // http://numeraljs.com/
    numeral.defaultFormat('0,0.[00]');

	urlParams = new URLSearchParams(window.location.search);
	fld_id = urlParams.get('fld_id');
	doc_id = urlParams.get('doc_id');
	
	if (fld_id) {
		DoorsAPI.foldersGetById(fld_id).then(
			function (res) {
				folder = res;
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
	folderSearch(controlsFolder['FldId'], '', '', 'parent, order, column').then(
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

    var $cont = $('<div/>', {
        class: 'container',
    }).appendTo($body);

    $cont.append(`
        <div class="btn-group" role="group" aria-label="..." style="position:fixed; top:10px; right:10px; z-index:1000;">
            <button type="button" id="print" class="btn btn-primary" onclick="printForm();">
                <i class="fa fa-print"></i>
                <span class="d-none d-md-inline-block"> Imprimir</span>
            </button>
            <button type="button" id="save" class="btn btn-primary" onclick="submitForm('save');">
                <i class="fa fa-cloud-upload"></i>
                <span class="d-none d-md-inline-block"> Guardar</span>
            </button>
            <button type="button" id="saveexit" class="btn btn-primary" onclick="submitForm('saveexit');">
                <i class="fa fa-cloud-upload"></i> +
                <i class="fa fa-sign-out"></i>
                <span class="d-none d-md-inline-block"> Guardar y salir</span>
            </button>
            <button type="button" id="cancel" class="btn btn-primary" onclick="exitForm(false);">
                <i class="fa fa-sign-out"></i>
                <span class="d-none d-md-inline-block"> Salir</span>
            </button>
    </div>
    `);

    $cont.append(`
        <div id="title" class="row" style="padding-top: 8px;">
            <h4>Cargando...</h4>
        </div>
        <hr>
    `);
    
    $cont.append(`
    <div class="input-group date" id="datepicker">
        <input type="text" class="form-control" id="date"/>
        <span class="input-group-append">
          <span class="input-group-text bg-light d-block">
            <i class="fa fa-calendar"></i>
          </span>
        </span>
      </div>
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

        var $tab = $cont.find('#tabHeader');
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

        function getRow(pRow, pCont) {
            if (pRow && pRow.children().length < 2) {
                return pRow;
            } else {
                return $('<div/>', {
                    class: 'row',
                }).appendTo(pCont);
            }
        }


        /*
        // tabHist

        $tabHist = $('<div/>', {
            class: 'tab',
            id: 'tabHist',
        }).appendTo($tabs);

        $('<div/>', {
            'data-doclog': 1,
        }).append('Cargando...').appendTo($tabHist);
        */

    } else {
/*
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
*/
    };

    // Validacion de numero
    $('[data-numeral]').change(function (e) {
        var $this = $(this);
        var n = numeral($this.val());
        if (n.value()) {
            $this.val(n.format($this.attr('data-numeral')));
        } else {
            $this.val('');
            // todo: cambiar por toast
            alert('Ingrese un numero valido');
        }
    });
    
}

function getDefaultControl(pField) {
    var $ret, $input, label;

    label = pField.Description ? pField.Description : pField.Name;

    if (pField.Type == 1) {
        if (pField.Length > 0 && pField.Length < 500) {
            $ret = newInputText(pField.Name, label);
            $input = $ret.find('input');
        } else {
            $ret = newInputText(pField.Name, label);
            //$ret = getTextarea(pField.Name, label);
            $input = $ret.find('textarea');
        }

    } else if (pField.Type == 2) {
        $ret = newDTPicker(pField.Name, label, 'date');
        $input = $ret.find('input');

    } else if (pField.Type == 3) {
        $ret = newInputText(pField.Name, label);
        $input = $ret.find('input');
        $input.attr('data-numeral', numeral.options.defaultFormat);
    };

    if (!pField.Updatable) $input.attr({ 'readonly': 'readonly' });
    $input.attr('data-textfield', pField.Name.toLowerCase())

    return $ret;
}
