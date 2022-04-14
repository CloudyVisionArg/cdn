function newInputText(pId, pLabel, pValue) {
    var $div = $('<div/>', {
        class: 'mt-3',
    });

    $div.append('<label class="form-label">' + pLabel + '</label>');

    $('<input/>', {
        type: 'text',
        class: 'form-control',
        id: pId,
        value: pValue,
    }).appendTo($div);

    return $div;
}

function newTextarea(pId, pLabel, pValue) {
    var $div = $('<div/>', {
        class: 'mt-3',
    });

    $div.append('<label class="form-label">' + pLabel + '</label>');

    $('<textarea/>', {
        class: 'form-control',
        id: pId,
        value: pValue,
    }).appendTo($div);

    return $div;
}

function newDTPicker(pId, pLabel, pType, pValue) {
    // pType: date, time, datetime-local

    var $div = $('<div/>', {
        class: 'mt-3',
    });

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
        value: pValue,
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

    return $div;
}

function setDTPickerVal(pInput, pValue) {
    var type = pInput.attr('data-date-type');
    if (pValue != null && pValue != '') {
        if (type == 'date') {
            pInput.val(moment(pValue).format('L'));
        } else if (type == 'time') {
            pInput.val(moment(pValue).format('LT'));
        } else {
            pInput.val(moment(pValue).format('L LT'));
        }
    } else {
        pInput.val('');
    }
}

function inputDataList(pInput, pSource) {
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

function newInputMaps() {
    include('maps');

    /*
    Public Name
	Public PlaceHolder
	Public Text
	Public OnChange
	Public CssClass
	Public Ticked ' Deprecado por Value
	Public Value
	Public Readonly

    If Readonly Then
        oSB.Append "<input type='text' name='" & Name & "' id='" & Name & "' class='form-control' value='" & AttEnc(Text & "") & "' readonly></input>"
        oSB.Append "<span style='color:#3c763d; right:18px; top:25px; z-index: 1000;" & IIf(Value & "" <> "" Or Ticked, "", "display:none;") & _
            "' class='glyphicon glyphicon-ok form-control-feedback'></span>"
    Else
        oSB.Append "<div class='input-group'>"
        oSB.Append "<input type='text' name='" & Name & "' id='" & Name & "' class='form-control maps-autocomplete' placeholder='" & PlaceHolder & _
            "' value='" & AttEnc(Text & "") & "' onfocus='maps.setBounds(this)' onchange='maps.onInputChange(this)' onplacechange='" & OnChange & "'></input>"
        oSB.Append "<span style='color:#3c763d; right:40px; z-index: 1000;" & IIf(Value & "" <> "" Or Ticked, "", "display:none;") & _
            "' class='glyphicon glyphicon-ok form-control-feedback'></span>"
        oSB.Append "<span class='input-group-addon add-on' style='cursor: pointer;' onclick='maps.pickLocation(this, event)'><span class='glyphicon glyphicon-map-marker'></span></span>"
        oSB.Append "</div>"
        oSB.Append "<input type='hidden' name='" & Name & "_value' id='" & Name & "_value' value='" & AttEnc(Value & "") & "'>"
    End If

    Render = oSB.ToString()
*/
}

/*
Devuelve un folder por ID o PATH
Si es por PATH hay que pasar el RootFolderId
*/
function getFolder(pFolder, pRootFolderId) {
    return new Promise(function (resolve, reject) {
        if (!isNaN(parseInt(pFolder))) {
            DoorsAPI.foldersGetById(pFolder).then(resolve, reject);
        } else {
            DoorsAPI.foldersGetByPath(pRootFolderId, pFolder).then(resolve, reject);
        }
    });
}

function newSelect(pId, pLabel, pMultiple, pOptions) {
    var $div = $('<div/>', {
        class: 'mt-3',
    });

    $div.append('<label class="form-label">' + pLabel + '</label>');

    var $sel = $('<select/>', {
        id: pId,
        class: 'form-control',
    }).appendTo($div);

    if (pMultiple) $sel.attr('multiple', true);

    $sel.selectpicker(pOptions);

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

function getSelectVal(pSelect) {
    var val = pSelect.val();
    return val && val != '[NULL]' ? val : null;
}

function getSelectText(pSelect) {
    var val = pSelect.val();
    if (val) {
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

function newHtmlArea(pId, pLabel, pValue) {
    var $div = $('<div/>', {
        class: 'mt-3',
    });

    $div.append('<label class="form-label">' + pLabel + '</label>');

    $('<textarea/>', {
        id: pId,
        value: pValue,
    }).appendTo($div);

    scriptLoaded('tiny-mce', function () {
        tinymce.init({
            selector: '#' + pId,
            plugins: 'a11ychecker advcode casechange export formatpainter image editimage linkchecker autolink lists checklist media mediaembed pageembed permanentpen powerpaste table advtable tableofcontents tinycomments tinymcespellchecker',
            toolbar: 'a11ycheck addcomment showcomments casechange checklist code export formatpainter image editimage pageembed permanentpen table tableofcontents',
            toolbar_mode: 'floating',
            tinycomments_mode: 'embedded',
            tinycomments_author: 'Author name',
        });
    });

    return $div;
}

function newCKEditor(pId, pLabel, pValue) {
    var $div = $('<div/>', {
        class: 'mt-3',
    });

    $div.append('<label class="form-label">' + pLabel + '</label>');

    var $txt = $('<textarea/>', {
        id: pId,
        value: pValue,
    }).appendTo($div);

    scriptLoaded('ckeditor', function () {
        CKEDITOR.replace($txt[0], {
            customConfig: 'configbasic.js', // config.js

            disableNativeSpellChecker: true,
            scayt_autoStartup: true,

            readOnly: false,

            height: 200,

            scayt_disableOptionsStorage: 'lang',

            wsc_lang: 'es_ES',
            scayt_sLang: 'es_ES',
        });
    })

    return $div;

}