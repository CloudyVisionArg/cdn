/*
web-controls
Controles de la web

Inventario de metodos:

newInputText(pId, pLabel)
newTextarea(pId, pLabel)
newDTPicker(pId, pLabel, pType)
inputDataList(pInput, pSource)
newSelect(pId, pLabel, pOptions)
fillSelect(pSelect, pSource, pWithoutNothing, textField, valueFields, dataFields)
setSelectVal(pSelect, pText, pValue, pNotFoundAction)
newCKEditor(pId, pLabel, pOptions)
newCheckbox(pId, pLabel)
newFieldset(pId, pLabel)
newMapsAutocomplete(pId, pLabel)
newDocLog(pId, pLabel)
newAttachments(pId, pLabel)
*/

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
            // get
            return dSession.utils.cDate($self.val());

        } else {
            // set
            var val = dSession.utils.cDate(pValue);

            var type = $self.attr('data-date-type');
            if (val != null && val != '') {
                if (type == 'date') {
                    $self.val(moment(val).format('L'));
                } else if (type == 'time') {
                    $self.val(moment(val).format('LT'));
                } else {
                    $self.val(moment(val).format('L LT'));
                }
            } else {
                $self.val('');
            }
            return val;
        }
    }

    $inp[0]._text = function (pValue) {
        if (pValue != undefined) {
            this._value(pValue);
        }
        return this.value;
    }

    return $div;
}

/*
pSource = {
    folder,
    rootFolder,
    field,
}
*/
function inputDataList(pInput, pSource) {
    //todo: ver si puedo hacerlo sin permisos
    pInput.attr('autocomplete', 'off');
    pInput.attr('data-filling', '1');

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
                    pInput.removeAttr('data-filling');
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
            if ($self.attr('multiple')) {
                setSelectVal($self, undefined, pValue ? pValue.split(';') : null);
            } else {
                setSelectVal($self, undefined, pValue);
            }
        }
    }

    $sel[0]._text = function (pText) {
        var $self = $(this);

        if (pText == undefined) {
            return getSelectText($self);

        } else {
            //set
            if ($self.attr('multiple')) {
                setSelectVal($self, pText ? pText.split(';') : null);
            } else {
                setSelectVal($self, pText);
            }
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

/* todo: esto se podria hacer agregando un metodo al prototype:
HTMLSelectElement.prototype._text = function(text) {}
*/
/**
Retorna el text del option seleccionado de un select.
Si es select multiple retorna un array.
*/
function getSelectText(pSelect) {
    var $sel = $(pSelect);
    var val = $sel.val();
    if (val && val != '[NULL]') {
        if (Array.isArray(val)) {
            var arr = [];
            $sel.find('option:selected').each(function (ix, el) {
                arr.push($(el).text());
            });
            return arr;
        } else {
            return $sel.find('option:selected').text();
        };
    } else {
        return null;
    }
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
    pSelect.val('[NULL]');

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

        if (pValue || pValue == 0) {
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
        txt.ckeditor.on('instanceReady', (ev) => {
            txt.dispatchEvent(new CustomEvent('ckReady'));
        });
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
    if (pLabel) {
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

    } else {
        // Si no viene label devuelvo un fieldset invisible
        $div = $(`<div id="${ pId }"><fieldset /></div>`);
    }

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

    var $i = $thead.find('i');
    if ($i.tooltip) {
        $thead.find('i').tooltip({
            delay: {
                show: 100,
                hide: 100,
            },
            placement: 'auto',
        });
    }
                
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
                console.error(err);
        
                $tr = $('<tr/>').appendTo($tbody);
                $('<td/>', {
                    colspan: 2,
                }).append('Error: ' + errMsg(err)).appendTo($tr);
            });

            $self.attr('data-filled', 1);
        }
    }
    
    cll._value = function (pDoc) {
        var $self = $(this);
        var $tbody = $self.find('tbody');
        $tbody.empty();
        $self.attr('data-doc-id', pDoc.id);
        $self.removeAttr('data-filled');
        if ($self.hasClass('show')) this.fill();
    }

    return $ctl;
}

function newAttachments(pId, pLabel) {
    /*
    sAcceptedFiles
    sOrderAttribute
    sOrderDirection
    sOrderType
    sTag
    tooltip
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
        style: 'padding-bottom: 2px;',
        'data-attachments': 'all',
    }).appendTo($grp);

    // El input para leer archivos
    let $file = $('<input/>', {
        type: 'file',
        style: 'display: none;',
        multiple: 'multiple',
    }).appendTo($grp);

    $file.change(function (e) {
        var inp = e.target;
        var $atts = $(inp).prevAll('.form-control');
        var file;
        for (var i = 0; i < inp.files.length; i++) {
            file = inp.files[i];

            var $att = renderAtt({
                name: file.name,
                size: file.size,
            });
            $att.attr('data-att-action', 'save');
            $att[0]._file = file;
            $att.appendTo($atts);
        };
        inp.value = '';
    })

    $div[0]._value = async function (pDoc) {
        var $self = $(this);
        $self.empty();
        var readonly = $self.attr('readonly') || $self.attr('addonly');
        var tag = $self.attr('data-attachments').toLowerCase();

        if (pDoc) {
            for (let [key, value] of await pDoc.attachments()) {
                if (tag == 'all' || (value.description && value.description.toLowerCase() == tag)) {
                    renderAtt(value, readonly).appendTo($self);
                }
            }
        };
    }

    function renderAtt(pAtt, pReadonly) {
        var $grp = $('<div/>', {
            class: 'input-group float-start me-2 mb-1',
            style: 'width: auto;',
            'data-att-id': pAtt.id,
            'data-att-name': pAtt.name,
        });

        var $div;

        if (pAtt.id) {
            var $div = $('<a/>', {
                class: 'link-primary form-control',
            });
            $div.css('cursor', 'pointer');
            $div.click(downloadAtt);
            $div.attr('title', 'Agregado por ' + pAtt.ownerName + ', el ' + formatDate(pAtt.created) + ' (#' + pAtt.id + ')');

        } else {
            var $div = $('<div/>', {
                class: 'form-control',
            });
            $div.attr('title', 'Agregado ahora, pendiente de guardar');
        };

        $div.append(pAtt.name + ' (' + fileSize(pAtt.size) + ')').appendTo($grp);

        $div.attr('data-bs-toggle', 'tooltip');
        if ($div.tooltip) {
            $div.tooltip({
                delay: {
                    show: 500,
                    hide: 100,
                },
                placement: 'auto',
            });    
        }

        var $btn = $('<span/>', {
            class: 'input-group-text',
            style: 'cursor: pointer;'
        }).appendTo($grp);

        if(pReadonly) $btn.css({ 'opacity': 0.4, 'pointer-events': 'none' });

        $btn.append('<i class="bi bi-x"></i>');

        $btn.click(function () {
            var $att = $(this).closest('.input-group');
            if ($att.attr('data-att-action') == 'save') {
                $att.remove();
            } else {
                $att.attr('data-att-action', 'delete');
                $att.hide();
            };
        });

        return $grp;
    };

    function downloadAtt() {
        var $att = $(this).closest('.input-group');
        var attId = $att.attr('data-att-id');
        var attName = $att.attr('data-att-name');
        var blob = $att[0]._blob;
    
        if (blob) {
            // Ya se descargo antes
            saveAs(blob, attName);
    
        } else {
            preloader.show();
    
            DoorsAPI.attachmentsGetById(doc_id, attId).then(
                function (res) {
                    preloader.hide();
                    var blob = new Blob([res]);
                    $att[0]._blob = blob;
                    saveAs(blob, attName);

                    /*
                    Esto es para abrir directo, funciona bien solo con algunas extensiones
                    Hay q crear el blob con type, ej: blob = new Blob([res], {type : 'application/pdf'})

                    var fileURL = URL.createObjectURL(blob);
                    window.open(fileURL);
                    */
                },
                function (err) {
                    preloader.hide();
                    logAndToast('attachmentsGetById error: ' + errMsg(err))
                }
            )
        }
    };

    $div[0]._readonly = function (pValue) {
        var $this = $(this);
        var $cont = $this.closest('div.input-group');
        var $clip = $cont.children('span.input-group-text');

        if (pValue) {
            $clip.css({ 'opacity': 0.4, 'pointer-events': 'none' });
            $this.attr('readonly', true);
            $this.find('span.input-group-text').css({ 'opacity': 0.4, 'pointer-events': 'none' });
        } else {
            $clip.css({ 'opacity': 1, 'pointer-events': 'auto' });
            $this.removeAttr('readonly');
            $this.find('span.input-group-text').css({ 'opacity': 1, 'pointer-events': 'auto' });
        }
    }

    $div[0]._addonly = function (pValue) {
        var $this = $(this);

        if (pValue) {
            $this.attr('addonly', true);
            $this.find('span.input-group-text').css({ 'opacity': 0.4, 'pointer-events': 'none' });
        } else {
            $this.removeAttr('addonly');
            $this.find('span.input-group-text').css({ 'opacity': 1, 'pointer-events': 'auto' });
        }
    }

    return $ctl;
}

function newButton(pId, pText, pOptions){
    let defaultOptions = {
        class: "btn-primary",
        type: "button", /* button or submit */
        icon: null
    };

    Object.assign(defaultOptions, pOptions);
    let iconStr = "";
    if(defaultOptions.icon != null){
        iconStr = '<i class="' + defaultOptions.icon + '"></i>';
    }

    let sanitizedText = $("<p/>").text(pText).text();

    var $btnObj = $(`<button type="${defaultOptions.type}" id="${pId}" class="btn ${defaultOptions.class}">
                ${iconStr}
                <span class="d-none d-md-inline-block"> ${sanitizedText}</span>
            </button>`);
    return $btnObj;
}


async function newAutocomplete(pId, pLabel, options){
    let opt = { //Valores por defecto
        textSource: '',
        valueSource: '',
        idField: "doc_id",   
        searchFields: 'subject', //Fields por los que se realiza la busqueda
        extraFields: 'doc_id,fld_id', // Fields que se agregan en las opciones como attr extras a la hora de seleccionar
        //showFields : 'subject', //Fields que se muestran cuando se busca en el panel desplegado
        //selectFields: null, //Fields que se muestran cuando se selecciona
        templateSelection : formatSelection,
        showFieldsSeparator : " - ",
        //fields: "subject,doc_id",,
        order: "subject",
        maxDocs: 30,
        recursive: false,
        maxDescrLength: 200,
        minimumInputLength: 3,
        placeholder: "Buscar...",
        multiple: false
    }

    opt = Object.assign(opt, options);

    opt.searchFieldsArr = opt.searchFields.split(',').map(el => el.trim().toLowerCase());
    opt.extraFieldsArr = opt.extraFields.split(',').map(el => el.trim().toLowerCase());
    opt.fieldsArr = [opt.textSource.toLowerCase(), opt.valueSource.toLowerCase()];

    //opt.showFieldsArr = (opt.showFieldsArr) ? opt.showFields.split(',').map(el => el.trim().toLowerCase()) : [...opt.searchFieldsArr];
   //opt.showFieldsArr=  (opt.showFieldsArr.length == 0 )? opt.searchFieldsArr : [];
    
    
    opt.searchFieldsArr.concat(opt.extraFieldsArr).forEach(el => {
        if (opt.fieldsArr.indexOf(el) < 0) opt.fieldsArr.push(el);
    });

    opt.searchFieldsArr.push("doc_id");
    opt.searchFieldsArr.push("fld_id");

    //opt.selectFieldsArr = (opt.selectFields) ? opt.selectFields.split(',').map(el => el.trim().toLowerCase()) : [...opt.selectFieldsArr];

    let pOptions = opt;
    var $cont = $('<div/>');
    $cont.append(`<label class="form-label" for='${pId}'>${ dSession.utils.htmlEncode(pLabel) }</label>`);
    let parentEl = $cont;
    var $oSel = $("<select/>", {
        id: pId,
        name: pId,
        class: "",
        width: '100%',
        multiple: pOptions.multiple,
        "data-textfield": pOptions.textSource,
        "data-valuefield": pOptions.valueSource
    });
    if (opt.width) {
        $oSel.attr("data-width", opt.width);
    }
    $oSel[0]._value = function(pValue){
        debugger;
        var $self = $(this);
        if (pValue == undefined) {
            //get
            var val = $self.val();
            return val && val != '[NULL]' ? val : null;

        } else {
            //set
            if ($self.attr('multiple')) {
                
                //setSelectVal($self, undefined, pValue ? pValue.split(';') : null);
            } else {
                //$oSel[0]._selectInitialValue(undefined,  pValue ? pValue : null );
                $oSel[0]._selectInitialValue(null, pValue);
                //$oSel[0]._setSelectVal($self, undefined, pValue);
            }
        }
    }
    
    $oSel[0]._text = function (pText) {
        var $self = $(this);

        if (pText == undefined) {
            let res = [];
            if($self.select2('data').length > 0){
                for (let index = 0; index < $self.select2('data').length; index++) {
                    res.push($self.select2('data')[index].text);
                }
            }
            // si es mas de uno devuelve un array sino el texto
            return (res.length > 1) ? res : res[0] ;
        } else {
            debugger;
            //set
            if ($self.attr('multiple')) {
            
            } else {
                //$self.text(pText).trigger('change');
                //var newOpt = new Option(pText, null, false, true);
                //$self.append(newOpt);
                $oSel[0]._selectInitialValue(pText, null );
            }
        }
    }

    $oSel[0]._addOption = function (text, value, objExtraData, defaultSelected){
        
        // create the option and append to Select2
        var data = { text : text, value : value};
        var option = new Option(text, value, objExtraData ?? false, defaultSelected ??true);
        $oSel.append(option).trigger('change');
        //manually trigger the `select2:select` event
        $oSel.trigger({
            type: 'select2:select',
            params: {
                data: data
            }
        });
    }

    $oSel[0]._selectInitialValue = function (text, value){

        if(text && $oSel.find("option:contains('"+ text + "')").length ==0){
            let option = $('<option/>', {
                value: value,
                selected: 'selected',
            });
            option.html(text);
            option.appendTo($oSel);
        }
        if(value){
            if($oSel[0].options.length > 0){
                $oSel[0].options[0].value = value
            }else{
                let option = $('<option/>', {
                    value: value,
                    selected: 'selected',
                });
                option.html(value);
                option.appendTo($oSel);
            }
        }

        var data = { text : $oSel[0].options[0].text, value : $oSel[0].options[0].value};        
        $oSel.trigger({
            type: 'select2:select',
            params: {
                data: data
            }
        });
    }   

     //Ver si podemos reutilizar para el set text o set value
    $oSel[0]._setSelectVal = function(pSelect, pText, pValue, pNotFoundAction) {
        pSelect.val('[NULL]');
        debugger;
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
    
            if (pValue || pValue == 0) {
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
    
        pSelect.trigger({
            type: 'select2:select',
            params: {
                data: data
            }
        });
        //if (pSelect.selectpicker) pSelect.selectpicker('refresh');
    }

    var fldAc = await dSession.folder(opt.folder, folder.rootFolderId);
    let sURL = pOptions.url ? pOptions.url : "";
    if (!sURL && fldAc.id) {
        sURL = `${Doors.RESTFULL.ServerUrl}/folders/${fldAc.id}/documents`  
    } 
    let oConfig = {
        theme: "bootstrap-5",
        placeholder: pOptions.placeholder || "Buscar...",
        minimumResultsForSearch: 1,
        maximumSelectionLength: pOptions.maximumSelectionLength || 0,
        minimumInputLength: pOptions.minimumInputLength || 3,
        templateResult: pOptions.templateResult,
        templateSelection: pOptions.templateSelection,
        allowClear: true,
        multiple : pOptions.multiple || false,        
        ajax: {
            url: sURL,
            dataType: 'json',
            delay: 250,
            headers:{
                'AuthToken': Doors.RESTFULL.AuthToken
            },
            data: function (params) {
                //Prepara formula para buscar.
                let finalFormula = "";
                pOptions.searchFieldsArr.forEach((fld)=>{
                    if(finalFormula!="")  finalFormula += " OR ";
                    finalFormula += `${fld} like '%{{searchValue}}%'`;
                });

                let baseFormula = pOptions.formula;
                if (finalFormula != "" ){
                    baseFormula += (baseFormula != "")  ? " AND (" + finalFormula + ")" : finalFormula;
                }
                
                let strFormula = baseFormula.replaceAll("{{searchValue}}", params.term);
                return {
                    fields: opt.searchFieldsArr.join(','),
                    formula: strFormula, // search term
                    order: pOptions.order,
                    maxDocs: pOptions.maxDocs,
                    recursive: pOptions.recursive,
                    maxDescrLength: pOptions.maxDescrLength
                };
            },
            processResults: function (data, params) {
                debugger;
                params.page = params.page || 1;
                data.InternalObject.map(el =>{
                    el.id = el[pOptions.idField.toUpperCase()];
                    el.text = "";
                    for (let index = 0; index < pOptions.searchFieldsArr.length; index++) {
                        el.text += (index > 0 ) ?  pOptions.showFieldsSeparator  : "";
                        el.text +=  el[pOptions.searchFieldsArr[index].toUpperCase()];
                    }
                // for (let index = 0; index < .    pOptions.showFieldsArr.length; index++) {
                    //     el.text += (index > 0 ) ?  pOptions.showFieldsSeparator  : "";
                    //     el.text +=  el[pOptions.showFieldsArr[index].toUpperCase()];
                    // }
                });
                return {
                    results: data.InternalObject
                };
            },
            cache: true
        },
        escapeMarkup: function(markup) {
            return markup;
        }
    }
    if (pOptions.selectedElements) {
        debugger;
        let data = pOptions.selectedElements;
        if (Array.isArray(data)) {
            data.map(el => {
            el.id = el[pOptions.idField];
            if (pOptions.textField) {
                el.text = el[pOptions.textField];
            }
            let formattedText = typeof pOptions.templateSelection === 'function' ? pOptions.templateSelection(el) : el.text;
            var option = new Option(formattedText, el.id, true, true);
            $oSel.append(option);
            });
        }
        else{
            let optId = data.id || data[pOptions.idField];
            let optText = data.text || data[pOptions.textField];
            // Aplicar el formato de templateSelection al texto de la opción
            let formattedText = typeof pOptions.templateSelection === 'function' ? pOptions.templateSelection(data) : optText;
            var option = new Option(formattedText, optId, true, true);
            $oSel.append(option);
        }
    }
    
    $oSel.attr("data-config", JSON.stringify(oConfig)); //no guarda los atributos que son funciones


    $oSel.on("select2:clear", function(e){
        var x = e;
        debugger;
    });

    if (parentEl) {
        $oSel.appendTo(parentEl);
        var select2Ref =  $oSel.select2(oConfig);
        return parentEl;
    }

    // Función para formatear la selección
    function formatSelection (option) {
        var objeto = $(option.element).data('objeto');
        
        if (objeto ) {
            let txt = "";
            for (let index = 0; index < opt.searchFields.length; index++) {
                const element = opt.searchFields[index];
                txt += (txt != "") ? opt.showFieldsSeparator  : ""; 
                txt += option[element.toUpperCase()];
            }
            // for (let index = 0; index < opt.selectFieldsArr.length; index++) {
            //     const element = opt.selectFieldsArr[index];
            //     txt += (txt != "") ? opt.showFieldsSeparator  : ""; 
            //     txt += option[element.toUpperCase()];
            // }
            option.text = txt;
            return option.text;
        }
    
        return option.text;
    }
}