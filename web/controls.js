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
            if (typeof $(this).selectpicker == 'function') {
            }
        }
    }

    $sel[0]._text = function (pText) {
        var $self = $(this);

        if (pText == undefined) {
            // get
            var val = $self.val();
            if (val && val != '[NULL]') {
                if (Array.isArray(val)) {
                    var arr = [];
                    $self.find('option:selected').each(function (ix, el) {
                        arr.push($(el).text());
                    });
                    return arr;
                } else {
                    return $self.find('option:selected').text();
                };
            } else {
                return null;
            }

        } else {
            //set
        }
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
// todo: pasar a property del select
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
    todo: readonly

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

function newDocLog(pId, pLabel) {
	var $ctl, $table, $thead, $tbody;
	
	var $ctl = newFieldset(pId, pLabel ? pLabel : 'Cambios de datos');

	$table = $('<table/>', {
        class: 'table',
    }).appendTo($ctl.find('fieldset'));

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

    var cll = $ctl.find('.collapse')[0];
    cll.bscollapse.hide();
    $(cll).attr('data-doc-log', 1);

    cll.addEventListener('show.bs.collapse', function () {
        this.fill();
    });

    cll.fill = function () {
        var $self = $(this);
        var docId = $self.attr('data-doc-id');
        if ($self.attr('data-filled') != 1 && docId) {
            var $tbody = $self.find('tbody');

            DoorsAPI.documentsFieldsLog(docId).then(function (log) {
                var i, userAnt, dtAnt, dt, $tr;
        
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
                
            }, function (err) {
                console.log(err);
        
                $tr = $('<tr/>').appendTo($tbody);
                $('<td/>', {
                    colspan: 2,
                }).append('Error: ' + errMsg(err)).appendTo($tr);
            });

            $self.attr('data-filled', 1);
        }
    }
    
    cll._value = function (pValue) {
        var $self = $(this);
        var $tbody = $self.find('tbody');
        $tbody.html('');
        $self.attr('data-doc-id', pValue);
        $self.removeAttr('data-filled');
        if ($self.hasClass('show')) this.fill();
    }

    return $ctl;
}

function newAttachments(pId, pLabel) {
    /*
    bReadonly
    bAddonly
    sAcceptedFiles
    sOrderAttribute
    sOrderDirection
    sOrderType
    sTag
    */
    var $ctl = $('<div/>');

    $('<label/>', {
        class: 'form-label',
    }).append(pLabel).appendTo($ctl);

    var $grp = $('<div/>', {
        class: 'input-group',
    }).appendTo($ctl);

    var $span = $('<span/>', {
        class: 'input-group-text',
        style: 'cursor: pointer;'
    }).appendTo($grp);

    $span.on('click', function () {
        var $file = $(this).closest('.input-group').find('input[type="file"]');
        $file.click();
    });

    $('<i/>', {
        class: 'bi bi-paperclip',
    }).appendTo($span);

    var $div = $('<div/>', {
        id: pId,
        class: 'form-control',
        'data-attachments': 'all',
    }).appendTo($grp);

    // El input para leer archivos
    let $file = $('<input/>', {
        type: 'file',
        style: 'display: none;'
    }).appendTo($grp);

    $file.change(function (e) {
        let inp = e.target;
        if (inp.files.length > 0) {
            toast(inp.files[0].name);
            inp.value = '';
        }
    })


    /*
        sRet = sRet & " onclick='" & AttEnc(sClick) & "' style='cursor:pointer;'"
    End If
    
    "' style='height:auto;min-height: 34px;' id='" & sName & "' name='" & sName & "' " 
    If oTooltip & "" <> "" Then
        sRet = sRet & GetAtt("data-toogle", "tooltip")
        sRet = sRet & GetAtt("title", oTooltip)
    End If
    */

    $div[0]._value = function (pValue) {
        var $self = $(this);
        var tag = $self.attr('data-attachments').toLowerCase();

        if (pValue) {
            DoorsAPI.attachments(pValue).then(
                function (res) {
                    // Filtra por el tag
                    var atts = res.filter(att => tag == 'all' || (att.Description && att.Description.toLowerCase() == tag));

                    if (atts.length > 0) {
                        // Ordena descendente
                        atts.sort(function (a, b) {
                            return a.AttId >= b.AttId ? -1 : 1;
                        });

                        // Arma un array de AccId
                        var ids = atts.map(att => att.AccId);
                        // Saca los repetidos
                        ids = ids.filter((el, ix) => ids.indexOf(el) == ix);
                        // Levanta los accounts, completa el nombre y renderiza
                        accountsSearch('acc_id in (' + ids.join(',') + ')').then(
                            function (accs) {
                                atts.forEach(att => {
                                    att.AccName = accs.find(acc => acc['AccId'] == att.AccId)['Name'];

                                    //{AttId, Name, AccName, Size, Created}
                                });
                            }
                        )

                    } else {
                        noAttachs();
                    }
                },

                function (err) {
                    logAndToast('newAttachments._value error: ' + errMsg(err));
                }
            );

        } else {
            noAttachs();
        }

        function noAttachs() {
            // Agrega la leyenda Sin adjuntos
            $self.html('Sin adjuntos');
        }

    }

    return $ctl;
}