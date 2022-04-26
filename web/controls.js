function newInputText(pId, pLabel) {
    var $div = $('<div/>');

    $div.append('<label class="form-label">' + pLabel + '</label>');

    $('<input/>', {
        type: 'text',
        class: 'form-control',
        id: pId,
    }).appendTo($div);

    return $div;
}

function newTextarea(pId, pLabel) {
    var $div = $('<div/>');

    $div.append('<label class="form-label">' + pLabel + '</label>');

    $('<textarea/>', {
        class: 'form-control',
        id: pId,
    }).appendTo($div);

    return $div;
}

function newDTPicker(pId, pLabel, pType) {
    // pType: date, time, datetime-local
    // todo: agragar funcion value()

    var $div = $('<div/>');

    $div.append('<label class="form-label">' + pLabel + '</label>');

    var $dtp = $('<div/>', {
        class: 'input-group date',
        id: pId + '_div',
        'data-target-input': 'nearest',
    }).appendTo($div);

    var f, t = pType.toLowerCase();
    if (t == 'date') {
        f = 'L';
    } else if (t == 'time') {
        f = 'LT';
    } else {
        f = 'L LT';
    }

    var $inp = $('<input/>', {
        type: 'text',
        id: pId,
        class: 'form-control datetimepicker-input',
        'data-target': '#' + pId + '_div',
        'data-date-type': t,
    }).appendTo($dtp);

    var $sp = $('<span/>', {
        class: 'input-group-text',
        'data-target': '#' + pId + '_div',
        'data-toggle': 'datetimepicker',
    }).appendTo($dtp);

    $sp.append('<i class="bi bi-' + (t == 'time' ? 'clock': 'calendar3') + '"></i>');

    $dtp.datetimepicker({
        locale: 'es',
        buttons: {
            showClose: true,
        },
        format: f,
    });

    $inp[0]._value = function (pValue) {
        var $self = $(this);

        if (pValue == undefined) {
            //get
            return $self.val();

        } else {
            // set
            var type = $self.attr('data-date-type');
            if (pValue != null && pValue != '') {
                if (type == 'date') {
                    $self.val(moment(pValue).format('L'));
                } else if (type == 'time') {
                    $self.val(moment(pValue).format('LT'));
                } else {
                    $self.val(moment(pValue).format('L LT'));
                }
            } else {
                $self.val('');
            }
            return $self.val();
        }
    }

    // Sinonimo de _value
    $inp[0]._text = function (pValue) {
        return this._value(pValue);
    }

    return $div;
}

function inputDataList(pInput, pSource) {
    //todo: ver si puedo hacerlo sin permisos
    pInput.attr('autocomplete', 'off');

    getFolder(objPropCI(pSource, 'folder'), objPropCI(pSource, 'rootFolder')).then(
        function (fld) {
            var f = objPropCI(pSource, 'field').toUpperCase();
            DoorsAPI.folderSearchGroups(fld['FldId'], f, '', f + ' is not null and ' + f + ' <> \'\'').then(
                function (res) {
                    var id = pInput.attr('id');
                    pInput.attr('list', id + '_list');
                    var $list = $('<datalist/>', {
                        id: id + '_list',
                    });
                    $list.insertAfter(pInput);
                    res.forEach(el => {
                        $('<option/>', {
                            value: el[f],
                        }).appendTo($list);
                    });
                },
                function (err) {
                    console.log(err);
                }
            )
        }
    )
}

function newSelect(pId, pLabel, pOptions) {
    var $div = $('<div/>');

    $div.append('<label class="form-label">' + pLabel + '</label>');

    var $sel = $('<select/>', {
        id: pId,
        class: 'form-control',
    }).appendTo($div);

    if (pOptions && pOptions.multiple) $sel.attr('multiple', true);

    $sel.selectpicker(pOptions);

    $sel[0]._value = function (pValue) {
        var $self = $(this);

        if (pValue == undefined) {
            //get
            var val = $self.val();
            return val && val != '[NULL]' ? val : null;

        } else {
            //set
        }
    }

    $sel[0]._text = function (pText) {
        debugger;
        var $self = $(this);

        if (pText == undefined) {
            // get
            var val = $self.val();
            if (val && val != '[NULL]') {
                if (Array.isArray(val)) {
                    var arr = [];
                    pSelect.find('option:selected').each(function (ix, el) {
                        arr.push($(el).text());
                    });
                    return arr;
                } else {
                    return pSelect.find('option:selected').text();
                };
            } else {
                return null;
            }

        } else {
            //set
        }
    }
    
    function getSelectText(pSelect) {
    }

    


    return $div;
}

/*
Llena un Select:
- Si pSource es Array, se agregan los elementos de pecho
- pSource tambien pueder ser un folderSearch o accountsSearch:
- Ej: fillSelect($select, DoorsAPI.folderSearch(fld_id, etc...))
- Si pWithoutNothing == true no se pone el elemento (ninguno)
- El text del option es el campo textField, si no viene se toma el 1ro
- El value del option son los valueFields separados por ';', si no vienen son todos los campos
- Los dataFields se ponen como atributos data-field-nombrecampo
*/
function fillSelect(pSelect, pSource, pWithoutNothing, textField, valueFields, dataFields) {
    return new Promise(function (resolve, reject) {
        var option;

        pSelect.attr('data-filling', '1');

        if (!pWithoutNothing) {
            option = $('<option/>', { value: '[NULL]' });
            option.html('(ninguno)').appendTo(pSelect);
        }
        
        if (Array.isArray(pSource)) {
            // Lista de items
            for (var i = 0; i < pSource.length; i++) {
                option = $('<option/>', { 'value': pSource[i] });
                option.html(pSource[i]);
                option.appendTo(pSelect);
            }
            ending();
            
        } else if ((typeof pSource === 'object' || typeof pSource === 'function') && typeof pSource.then === 'function') {
            // Promise, es un folderSearch
            pSource.then(
                function (res) {
                    fillMe(pSelect, res);
                    ending();
                },
                function (err) {
                    console.log(err);
                    throw err;
                }
            );
        };

        function fillMe(pSelect, pRes) {
            pRes.forEach(row => {
                option = $('<option/>', { 'value': getValue(row) });
                option.html(getText(row));
                setData(row, option);
                option.appendTo(pSelect);
            })
        }

        function getValue(pRow) {
            if (valueFields) {
                var fields = valueFields.split(',');
                var vals = [];
                for (var i = 0; i < fields.length; i++) {
                    vals.push(objPropCI(pRow, fields[i].trim()));
                }
                return vals.join(';');
            } else {
                var vals = [];
                Object.keys(pRow).forEach(key => {
                    vals.push(pRow[key]);
                })
                return vals.join(';');
            }
        }

        function getText(pRow) {
            if (textField) {
                return objPropCI(pRow, textField);
            } else {
                var keys = Object.keys(pRow);
                return pRow[keys[0]];
            }
        }

        function setData(pRow, pOption) {
            if (dataFields) {
                var fields = dataFields.split(',');
                var f;
                for (var i = 0; i < fields.length; i++) {
                    f = fields[i].trim().toLowerCase();
                    pOption.attr('data-field-' + f, objPropCI(pRow, f));
                }
            }
        }

        function ending() {
            if (pSelect.selectpicker) pSelect.selectpicker('refresh');
            pSelect.removeAttr('data-filling');
            resolve(true);
        }
    });
}

/*
Asigna el value a un select
pNotFoundAction:
    -1: Deja como esta, sin seleccionar
    0: Selecciona el 1ro
    1: Lo agrega (opcion por defecto)
*/
function setSelectVal(pSelect, pText, pValue, pNotFoundAction) {
    pSelect.val(null);

    if (pSelect.attr('multiple')) {
        if (pValue) {
            pSelect.val(pValue);
        } else if (pText) {
            pSelect.find('option').filter(function() {
                return pText.indexOf($(this).text()) >= 0;
            }).prop('selected', true);
        }

    } else {
        var notFound = (pNotFoundAction === undefined) ? 1 : pNotFoundAction;

        if (pValue) {
            pSelect.val(pValue);
        } else {
            pSelect.find('option').filter(function() {
                return $(this).text() == pText;
            }).prop('selected', true);
        };

        if (pSelect[0].selectedIndex < 0) {
            if (notFound == 1 && (pValue || pText)) {
                var option = $('<option/>', {
                    value: pValue,
                    selected: 'selected',
                });
                option.html(pText);
                option.appendTo(pSelect);

            } else if (notFound == 0) {
                pSelect[0].selectedIndex = 0;
            }
        }
    }

    if (pSelect.selectpicker) pSelect.selectpicker('refresh');
}

function newCKEditor(pId, pLabel, pOptions) {
    var $div = $('<div/>');

    $div.append('<label class="form-label">' + pLabel + '</label>');

    var $txt = $('<textarea/>', { id: pId }).appendTo($div);

    var opt = {
        customConfig: 'configbasic.js',
        height: 200,
        disableNativeSpellChecker: true,
        scayt_autoStartup: true,
        scayt_disableOptionsStorage: 'lang',
        wsc_lang: 'es_ES',
        scayt_sLang: 'es_ES',
    };
    if (location.protocol != 'https:') {
        // Da error CORS en http
        opt.scayt_srcUrl = 'https://svc.webspellchecker.net/spellcheck31/wscbundle/wscbundle.js';
    }
    Object.assign(opt, pOptions);

    scriptLoaded('ckeditor', function () {
        var txt = $txt[0];
        txt.ckeditor = CKEDITOR.replace(txt, opt);
        txt.dispatchEvent(new CustomEvent('ckinit'));
    });

    return $div;
}

function newCheckbox(pId, pLabel) {
    var $div = $('<div/>', {
        class: 'form-check',
    });

    $('<input/>', {
        type: 'checkbox',
        class: 'form-check-input',
        id: pId,
    }).appendTo($div);

    $('<label/>', {
        class: 'form-check-label',
    }).append(pLabel).appendTo($div);

    return $div;
}

function newFieldset(pId, pLabel) {
    var $div = $('<div/>', {
        class: 'card',
    });

    var $header = $('<h6/>', {
        class: 'card-header',
    }).appendTo($div);

    $('<a/>', {
        'data-bs-toggle': 'collapse',
        class: 'link-secondary',
        style: 'text-decoration: none;',
        href: '#' + pId,
    }).append(pLabel).appendTo($header);

    var $body = $('<div/>', {
        id: pId,
        class: 'card-body collapse show',
    }).appendTo($div);

    $('<fieldset/>').appendTo($body);

    $body[0].bscollapse = new bootstrap.Collapse($body, {
        toggle: false,
    });

    return $div;
}

function newMapsAutocomplete(pId, pLabel) {
    var $ctl = newInputText(pId, pLabel);
    var $inp = $ctl.find('input');
    $inp = addInputButton($inp, 'bi bi-geo-alt-fill', 'maps.pickLocation(this, event)');
    $inp.addClass('maps-autocomplete');
    $inp.attr('placeholder', 'Calle nro, Localidad');

    $('<span/>', {
        style: 'color:#3c763d; right:45px; position:absolute; z-index:1000; display:none;',
        class: 'fs-4 bi bi-check',
    }).insertAfter($inp);

    $inp.attr('data-filling', '1');
    include('maps', function () {
        maps.initAc($inp[0], function () {
            $inp.removeAttr('data-filling');
        });
    });

    return $ctl;
    /*
    readonly??

    $inp.on('placeChange', function (e) {
        var addrComp = e.originalEvent.detail.addressComponents;
        if (addrComp) {
            $('#ciudad').val(addrComp['administrative_area_level_2'] + ' - ' + addrComp['administrative_area_level_1'] + ' - ' + addrComp['country']);
            $('#provincia').val(addrComp['administrative_area_level_1'] + ' - ' + addrComp['country']);
            $('#pais').val(addrComp['country']);
        }
    })
    */
}

// Devuelve una tabla con el DocLog del documento, mediante la funcion de Callback
function newDocLog(pTitle, pDocId, pCallback) {
	var $ctl, $cardHeader, $cardBody;
	var $table, $thead, $tbody, $tr;
	
	$ctl = $('<div/>', {
		class: 'card',
	});

	$cardHeader = $('<div/>', {
		class: 'card-header',
	}).appendTo($ctl);

    $cardHeader.append(pTitle ? pTitle : 'Cambios de datos')

	$cardBody = $('<div/>', {
		class: 'card-body',
	}).appendTo($ctl);
	
	$table = $('<table/>', {
        class: 'table',
    }).appendTo($cardBody);

	$thead = $('<thead/>').appendTo($table);
    $thead.append(`
        <tr>
            <th>Campo</th>
            <th>Valor nuevo 
                <i class="bi bi-info-circle" title="Click en el valor nuevo para ver el valor anterior" data-bs-toggle="tooltip"></i>
            </th>
        </tr>
    `);

    $thead.find('i').tooltip({
        delay: {
            show: 100,
            hide: 100,
        },
        placement: 'auto',
    });
                
	$tbody = $('<tbody/>').appendTo($table);

	$tbody.on('click', 'tr', function (e) {
        var $this = $(this);
        var $td = $this.find('td');
        if ($td.length == 2) { // fila de campo
            var field = $td.first().html();
            var old = $this.attr('oldvalue');
            toast('<p>Valor anterior de <b>' + field + '</b></p>' + 
                (old ? htmlEncode(old) : '(vacio)'), { delay: 5000 });
        }
	});

	DoorsAPI.documentsFieldsLog(pDocId).then(function (log) {
		var i, userAnt, dtAnt, dt;

        log.forEach(row => {
			dt = new Date(row['LogDate']);
			if (i == 0 || userAnt != row['AccName'] || Math.abs(dt.getTime() - dtAnt.getTime()) > 60000) {
				userAnt = row['AccName'];
				dtAnt = dt;

				$tr = $('<tr/>', {
                    class: 'table-light',
                }).appendTo($tbody);
                
				$('<td/>', {
					colspan: 2,
                }).append(userAnt + ' el ' + dtAnt.toLocaleDateString() 
                    + ' ' + ISOTime(dtAnt)).appendTo($tr);
            }

			$tr = $('<tr/>').appendTo($tbody);
			$('<td/>').append(row['Field']).appendTo($tr);

			$('<td/>', {
                style: 'word-break:break-all',
            }).append(htmlEncode(row['NewValue'])).appendTo($tr);

			$tr.attr('oldvalue', row['OldValue'] == null ? '(vacio)' : row['OldValue']);
        })
		
		pCallback($ctl);
		
	}, function (err) {
		console.log(err);

		$tr = $('<tr/>').appendTo($tbody);
		$('<td/>', {
			colspan: 2,
		}).append('Error: ' + errMsg(err)).appendTo($tr);
		
		pCallback($ctl);
	});
}
