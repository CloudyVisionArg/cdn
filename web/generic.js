'use strict';

/*
Documentacion de componentes:

Bootstrap: https://getbootstrap.com/docs/5.1/getting-started/introduction/
Iconos: https://icons.getbootstrap.com
DTPicker: https://getdatepicker.com/5-4/
Popper: https://popper.js.org/docs/v2/
jQuery: https://api.jquery.com
Numeral: http://numeraljs.com
*/

var urlParams, fld_id, folder, doc_id, doc;
var constrolsFolder, controls, controlsRights;
var saving;

var arrScripts = [];
arrScripts.push({ id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' });
arrScripts.push({ id: 'popper', src: 'https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.2/dist/umd/popper.min.js' });
arrScripts.push({ id: 'bootstrap', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js', depends: ['popper'] });
arrScripts.push({ id: 'bootstrap-css', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css' });
arrScripts.push({ id: 'bootstrap-icons', src: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css' });
arrScripts.push({ id: 'font-awesome', src: 'https://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.css' });
arrScripts.push({ id: 'app7-doorsapi', depends: ['jquery'] });
arrScripts.push({ id: 'web-javascript', version: 0 });
arrScripts.push({ id: 'web-controls' });
arrScripts.push({ id: 'lib-numeral' });
arrScripts.push({ id: 'lib-numeral-locales', depends: ['lib-numeral'] });
arrScripts.push({ id: 'tempus-dominus', src: 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/js/tempusdominus-bootstrap-4.min.js', depends: ['jquery'] });
arrScripts.push({ id: 'tempus-dominus-css', src: 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/css/tempusdominus-bootstrap-4.min.css' });
arrScripts.push({ id: 'lib-moment' });

include(arrScripts, function () {
	Doors.RESTFULL.ServerUrl = window.location.origin + '/restful';
	//Doors.RESTFULL.AuthToken = getCookie('AuthToken');
	Doors.RESTFULL.AuthToken = '8F7B48DCE93ED4DE55A38E0D58288B60E1DB7F5B2646209739AE718BC2A82D5F';

    // todo: mensaje y terminar
    DoorsAPI.islogged().then(
		function (res) {
		},
		function (err) {
			console.log(err);
		}
	);

    // todo: Reemplazar pot Intl
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

    var $cont = $('<div/>', {
        class: 'container',
    }).appendTo($body);

    $cont.append(`
        <div class="btn-group" role="group" aria-label="..." style="position:fixed; top:10px; right:10px; z-index:1000;">
            <button type="button" id="print" class="btn btn-primary" onclick="printForm();">
                <i class="bi bi-printer-fill"></i>
                <span class="d-none d-md-inline-block"> Imprimir</span>
            </button>
            <button type="button" id="save" class="btn btn-primary" onclick="saveDoc();">
                <i class="bi bi-cloud-arrow-up-fill"></i>
                <span class="d-none d-md-inline-block"> Guardar</span>
            </button>
            <button type="button" id="saveexit" class="btn btn-primary" onclick="submitForm('saveexit');">
                <i class="bi bi-cloud-check-fill"></i>
                <span class="d-none d-md-inline-block"> Guardar y salir</span>
            </button>
            <button type="button" id="cancel" class="btn btn-primary" onclick="exitForm(false);">
                <i class="bi bi-door-open-fill"></i>
                <span class="d-none d-md-inline-block"> Salir</span>
            </button>
    </div>
    `);

    $cont.append(`
        <div class="row" style="padding-top: 8px;">
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
    
    fillControls();
}

function getDefaultControl(pField) {
    var $ret, $input, label;

    label = pField.Description ? pField.Description : pField.Name;

    if (pField.Type == 1) {
        if (pField.Length > 0 && pField.Length < 500) {
            $ret = newInputText(pField.Name, label);
            $input = $ret.find('input');
        } else {
            $ret = newTextarea(pField.Name, label);
            $input = $ret.find('textarea');
        }

    } else if (pField.Type == 2) {
        $ret = newDTPicker(pField.Name, label, 'datetime-local');
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

function fillControls() {
    var title;

    if (!doc.IsNew) {
        title = getDocField(doc, 'subject').Value;
        if (!title) title = 'Doc Id ' + doc.DocId;

        /*
        getDocLog(doc_id, function (table) {
            $('[data-doclog]').html(table);
        });
        */

    } else {
        title = 'Nuevo documento';
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
            $el.val(text);

        } else if (el.tagName == 'SELECT') {
            if ($el.attr('multiple')) {
                var t = text ? text.split(';') : null;
                var v = value ? value.split(';') : null;
                setSelectVal($el, t, v);
            } else {
                setSelectVal($el, text, value);
            }

        } else if (el.tagName == 'DIV') {
            if ($el.hasClass('text-editor')) {
                app7.textEditor.get($el).setValue(text);
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
    //$navbar.find('.right .button').addClass('disabled');
    //app7.preloader.show();

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
                field.Value = $el.val();
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
                    //app7.preloader.hide();
                    //$navbar.find('.right .button').removeClass('disabled');
                    //toast('Cambios guardados');
                    fillControls();
                },
                errMgr
            );
        },
        errMgr
    );

    function errMgr(pErr) {
        saving = false;
        //app7.preloader.hide();
        //$navbar.find('.right .button').removeClass('disabled');
        if (Array.isArray(pErr)) {
            if (pErr.length == 1) {
                toast('Error al \'' + pErr[0].action + '\' el adjunto \'' + pErr[0].name + '\': ' + pErr[0].result, 5000);

            } else {
                // Error de saveAtt
                toast('Algunos adjuntos no pudieron guardarse, consulte la consola para mas informacion', 5000);
            }
        } else {
            //toast(errMsg(pErr), 5000);
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
