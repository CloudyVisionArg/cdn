/*
app7-controls
Controles del APP7

Inventario de metodos:

getControlFolder(pFolder, pRootFolderId)
getInputText(pId, pLabel, options)
setInputVal(pInput, pVal)
inputReadonly(pInput, pReadonly)
inputDisabled(pInput, pDisabled)
addPhoneButtons(pInput)
wappNumber(pPhone)
getInputPhone(pId, pLabel, options)
addEmailButton(pInput)
getInputEmail(pId, pLabel, options)
inputDataList(pInput, pSource)
getInputAddress(pId, pLabel, pValue)
getSelect(pId, pLabel)
getSmartSelect(pId, pLabel, pMultiple)
fillSelect(pSelect, pSource, pWithoutNothing, textField, valueFields, dataFields)
getSelectVal(pSelect)
getSelectText(pSelect)
setSelectVal(pSelect, pText, pValue, pNotFoundAction)
getDTPicker(pId, pLabel, pType, pValue)
getDTPickerVal(pInput, pJSON)
timeZone()
setDTPickerVal(pInput, pValue)
getTextarea(pId, pLabel, pValue)
getToggle(pId, pLabel, options)
setToggleVal(pCtrl, pValue){
getCheckbox(pId, pLabel)
getStepper(pId, pLabel, options)
getPopup(pTitle)
getAutocomplete(pId, pLabel, pSource, pMultiple)
getButton(pTitle)
getDocLog(pDocId, pCallback)
getPage(params)
getLink(params)
getSearchBar()
getCollapsible(pId, pTitle)
getTextEditor(pId, pLabel, pValue)
getAttachments(pId, pTitle, pTag)
getAttachment(pAttach, pReadonly)
addDefaultOptions(pContainer)
getTabbedViewsLayout(pTabs)
getVirtualList(pListElement)
renderMediaListItem(pItem)
getListLinkItem(pLink)
*/

/*
Backward compat, ver getFolder en jslib
*/
function getControlFolder(pFolder, pRootFolderId) {
    return getFolder(pFolder, pRootFolderId);
}

/*
Devuelve un <input type="text">

var $ctl = getInputText('myInput', 'Etiqueta', {
    value: 'valor inicial',
    iosicon: 'icon',
    mdicon: 'icon',
});
*/
function getInputText(pId, pLabel, options) {
    var $itemCont, $itemInner, $inputWrap, value;

    var opt = {};

    if (isObject(options)) {
        Object.assign(opt, options);
        value = opt.value;

    } else {
        // Backward compat
        value = options;
    }

    $itemCont = $('<li/>', {
        class: 'item-content item-input',
    });
    
    if (opt.iosicon || opt.mdicon) {
        var $itemMedia = $('<div/>', {
            class: 'item-media',
        }).appendTo($itemCont);

        if (opt.iosicon) {
            var $i = $('<i/>', {
                class: 'f7-icons',
            }).append(opt.iosicon).appendTo($itemMedia);
            if (opt.mdicon) $i.addClass('ios-only');
        }
        
        if (opt.mdicon) {
            var $i = $('<i/>', {
                class: 'material-icons',
            }).append(opt.mdicon).appendTo($itemMedia);
            if (opt.iosicon) $i.addClass('md-only');
        }
    };

    $itemInner = $('<div/>', {
        class: 'item-inner',
    }).appendTo($itemCont);

    $('<div/>', {
        class: 'item-title item-floating-label',
    }).append(pLabel).appendTo($itemInner);
    
    $inputWrap = $('<div/>', {
        class: 'item-input-wrap',
    }).appendTo($itemInner);
    
    $('<input/>', {
        type: 'text',
        id: pId,
        placeholder: pLabel,
        value: value,
        autocomplete: 'off',
    }).appendTo($inputWrap);

    $('<span/>', {
        class: 'input-clear-button',
    }).appendTo($inputWrap);
    
    return $itemCont;
}

function setInputVal(pInput, pVal) {
    let $inp = $(pInput);

    $inp.val(pVal);
    app7.input.checkEmptyState($inp[0]);
    if ($inp.prop('tagName') == 'TEXTAREA' && $inp.hasClass('resizable')) {
        app7.input.resizeTextarea($inp[0]);
    }
}

function inputReadonly(pInput, pReadonly) {
    let $inp = $(pInput);

    if (pReadonly) {
        $inp.attr({ 'readonly': 'readonly' });
        $inp.siblings('.input-clear-button').hide();
    } else {
        $inp.removeAttr('readonly');
        $inp.siblings('.input-clear-button').show();
    }
}

function inputDisabled(pInput, pDisabled) {
    let $inp = $(pInput);

    if (pDisabled) {
        $inp.closest('.item-input').addClass('disabled');
        $inp.siblings('.input-clear-button').hide();
    } else {
        $inp.closest('.item-input').removeClass('disabled');
        $inp.siblings('.input-clear-button').show();
    }
}

// Agrega el boton llamar y enviar whatsapp a un Textbox
function addPhoneButtons(pInput) {
    let $inp = $(pInput);

    var $inputMedia = $('<div/>', {
        class: 'item-media',
        style: 'min-width: 74px; align-self: flex-end;'
    }).appendTo($inp);

    var $i;

    if (app7.theme == 'md') {
        $i = $('<i/>', {
            class: 'material-icons-outlined',
        }).append('phone').appendTo($inputMedia);    
    } else {
        $i = $('<i/>', {
            class: 'f7-icons',
        }).append('phone').appendTo($inputMedia);
    }

    $i.click(function (e) {
        var val = $(this).closest('li').find('input').val();
        if (val) cordova.InAppBrowser.open('tel:' + encodeURI(val), '_system');
    });

    if (app7.theme == 'md') {
        $i = $('<i/>', {
            class: 'material-icons-outlined',
        }).append('maps_ugc').appendTo($inputMedia);
    } else {
        $i = $('<i/>', {
            class: 'f7-icons',
        }).append('chat_bubble').appendTo($inputMedia);
    }

    $i.click(function (e) {
        var val = $(this).closest('li').find('input').val();
        if (val) cordova.InAppBrowser.open('whatsapp://send?phone=' + wappNumber(val), '_system');
    });
}

// saca los + ( ) - y espacios
function wappNumber(pPhone) {
    var num = pPhone.replace(/[^0-9]/g, '');
    //if (num.length == 10) num = '549' + num;
	return encodeURI(num);
}

function getInputPhone(pId, pLabel, options) {
    var $input;

    var $input = getInputText(pId, pLabel, options);
    addPhoneButtons($input);
    return $input;
}

// Agrega el boton enviar email a un Textbox
function addEmailButton(pInput) {
    let $inp = $(pInput);

    var $inputMedia = $('<div/>', {
        class: 'item-media',
        style: 'min-width: 40px; align-self: flex-end;',
    }).appendTo($inp);

    var $i;
    if (app7.theme == 'md') {
        var $i = $('<i/>', {
            class: 'material-icons-outlined',
        }).append('email').appendTo($inputMedia);
    } else {
        var $i = $('<i/>', {
            class: 'f7-icons',
        }).append('envelope').appendTo($inputMedia);
    }

    $i.click(function (e) {
        var val = $(this).closest('li').find('input').val();
        if (val) cordova.InAppBrowser.open('mailto:' + encodeURI(val), '_system')
    });
}

function getInputEmail(pId, pLabel, options) {
    var $input;

    var $input = getInputText(pId, pLabel, options);
    addEmailButton($input);
    return $input;
}

/*
Agrega un dataList a un Input
pList puede ser un Array de opciones o un objeto { folder, rootFolder, field }
(si folder es int no hace falta rootFolder)
*/
function inputDataList(pInput, pSource) {
    pInput.attr('autocomplete', 'off');

    var ac = app7.autocomplete.create({
        inputEl: $(pInput)[0],
        openIn: 'dropdown',
        typeahead: true,
        limit: 50,
        
        source: function (query, render) {
            var par = this.params;
            var results = [];
    
            if (par.filling) { render(results); return; }
    
            if (!par.allValues) {
                if (query.length === 0) { render(results); return; };
            };
    
            par.src.forEach(function (el) {
                if (el.toLowerCase().indexOf(query.toLowerCase()) >= 0)
                    results.push(el);
                }
            );
            render(results);
        }
    });

    ac.params.allValues = true;

    if (!Array.isArray(pSource)) {
        ac.params.filling = true;
        getControlFolder(objPropCI(pSource, 'folder'), objPropCI(pSource, 'rootFolder')).then(
            function (fld) {
                var f = objPropCI(pSource, 'field');
                folderSearchGroups(fld['FldId'], f, '', f + ' is not null and ' + f + ' <> \'\'').then(
                    function (res) {
                        ac.params.src = res.map(el => el[f.toUpperCase()]);
                        ac.params.srcInitial = pSource;
                        ac.params.filling = false;
                    },
                    function (err) {
                        ac.params.src = [];
                        ac.params.srcInitial = pSource;
                        ac.params.filling = false;
                        console.log(err);
                    }
                )
            }
        )
    } else {
        ac.params.src = pSource;
    };

    return ac;
}

// Retorna un Automplete de Google Maps
function getInputAddress(pId, pLabel, pValue) {
    var $itemCont = getInputText(pId, pLabel, pValue);
    
    var $input = $itemCont.find('input');
    $input.addClass('maps-autocomplete');

    var $inputMedia = $('<div/>', {
        class: 'item-media',
        style: 'min-width: 40px; align-self: flex-end;',
    }).appendTo($itemCont);

    var $i = $('<i/>', {
        class: 'f7-icons',
    }).append('placemark').appendTo($inputMedia);

    $i.click(function (e) {
        maps.pickLocation($input[0], e);
    });

    $input.attr('data-filling', '1');
    include('maps', function () {
        maps.initAc($input[0], function () {
            $input.removeAttr('data-filling');
        });
    });

    return $itemCont;
}

function getSelect(pId, pLabel) {
    var $itemCont, $itemInner, $inputWrap;

    $itemCont = $('<li/>', {
        class: 'item-content item-input',
    });
    
    $itemInner = $('<div/>', {
        class: 'item-inner',
    }).appendTo($itemCont);

    $('<div/>', {
        class: 'item-title item-floating-label',
    }).append(pLabel).appendTo($itemInner);
    
    $inputWrap = $('<div/>', {
        class: 'item-input-wrap input-dropdown-wrap',
    }).appendTo($itemInner);

    $('<select/>', {
        id: pId,
        placeholder: pLabel,
    }).appendTo($inputWrap);

    return $itemCont;
}

function getSmartSelect(pId, pLabel, pMultiple) {
    var $li, $a, $select;

    $li = $('<li/>');
    
    $a = $('<a/>', {
        href: '#',
        class: 'item-link smart-select',
    }).appendTo($li);

    $select = $('<select/>', {
        id: pId,
    }).appendTo($a);
    if (pMultiple) $select.attr('multiple', 'multiple');

    $itemContent = $('<div/>', {
        class: 'item-content',
    }).appendTo($a);

    $itemInner = $('<div/>', {
        class: 'item-inner',
    }).appendTo($itemContent);

    $('<div/>', {
        class: 'item-title',
    }).append(pLabel).appendTo($itemInner);

    $('<div/>', {
        class: 'item-after',
        style: 'white-space: normal;'
    }).append(pLabel).appendTo($itemInner);

    app7.smartSelect.create({
        el: $a[0],
        openIn: 'sheet',
        scrollToSelectedItem: true,
        closeOnSelect: !pMultiple,
        sheetCloseLinkText: 'Cerrar',
        searchbarPlaceholder: 'Buscar',
        popupCloseLinkText: 'Cerrar',
        appendSearchbarNotFound: 'Sin resultados',
        searchbarDisableText: 'Cancelar',
    });

    return $li;
}

/*
Llena un Select:
- Si pSource es Array, se agregan los elementos de pecho
- Si pSource es string, va un SQL a la base local (select etc from mytable..)
- pSource tambien pueder ser un folderSearch o accountsSearch:
- Ej: fillSelect($select, folderSearch(sync.tableId('listas'), etc...))
- Si pWithoutNothing == true no se pone el elemento (ninguno)
- El text del option es el campo textField, si no viene se toma el 1ro
- El value del option son los valueFields separados por ';', si no vienen son todos los campos
- Los dataFields se ponen como atributos data-field-nombrecampo
*/
function fillSelect(pSelect, pSource, pWithoutNothing, textField, valueFields, dataFields) {
    let $sel = $(pSelect);

    return new Promise(function (resolve, reject) {
        var option;

        $sel.attr('data-filling', '1');

        if (!pWithoutNothing) {
            option = $('<option/>', { value: '[NULL]' });
            option.appendTo($sel);

            if ($sel.parent().hasClass('smart-select')) {
                option.html('(ninguno)');
            } else {
                // Para que no se superponga el (ninguno) con el placeholder
                $sel.focus(function (e) {
                    this.options[0].innerText = '(ninguno)';
                });
                $sel.blur(function (e) {
                    if (this.selectedIndex == 0) {
                        this.options[0].innerText = '';
                    }
                });
            }
        }
        
        if (Array.isArray(pSource)) {
            // Lista de items
            for (var i = 0; i < pSource.length; i++) {
                option = $('<option/>', { 'value': pSource[i] });
                option.html(pSource[i]);
                option.appendTo($sel);
            }
            ending();
            
        } else if (typeof pSource == 'string') {
            // SQL contra la base
            dbRead(pSource, [], function (rs) {
                fillMe($sel, convertSqliteResultSet(rs));
                ending();
            });
        
        } else if ((typeof pSource === 'object' || typeof pSource === 'function') && typeof pSource.then === 'function') {
            // Promise, es un folderSearch
            pSource.then(
                function (res) {
                    fillMe($sel, res);
                    ending();
                },
                function (err) {
                    console.log(err);
                    throw err;
                }
            );
        };

        function fillMe($sel, pRes) {
            pRes.forEach(row => {
                option = $('<option/>', { 'value': getValue(row) });
                option.html(getText(row));
                setData(row, option);
                option.appendTo($sel);
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
            $sel.removeAttr('data-filling');
            resolve($sel[0]);

            const ev = new CustomEvent('fillComplete');
            $sel[0].dispatchEvent(ev);
        }
    });
}

function getSelectVal(pSelect) {
    let $sel = $(pSelect);
    var val = $sel.val();
    return val && val != '[NULL]' ? val : null;
}

function getSelectText(pSelect) {
    let $sel = $(pSelect);
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
Asigna el value a un select, setea el smartSelect si existe
pNotFoundAction:
    -1: Deja como esta, sin seleccionar
    0: Selecciona el 1ro
    1: Lo agrega (opcion por defecto)
*/
function setSelectVal(pSelect, pText, pValue, pNotFoundAction) {
    let $sel = $(pSelect);
    $sel.val(null);

    if ($sel.attr('multiple')) {
        if (pValue) {
            $sel.val(pValue);
        } else if (pText) {
            $sel.find('option').filter(function() {
                return pText.indexOf($(this).text()) >= 0;
            }).prop('selected', true);
        }

    } else {
        var notFound = (pNotFoundAction === undefined) ? 1 : pNotFoundAction;

        if (pValue) {
            $sel.val(pValue);
        } else {
            $sel.find('option').filter(function() {
                return $(this).text() == pText;
            }).prop('selected', true);
        };

        if ($sel[0].selectedIndex < 0) {
            if (notFound == 1 && (pValue || pText)) {
                var option = $('<option/>', {
                    value: pValue,
                    selected: 'selected',
                });
                option.html(pText);
                option.appendTo($sel);

            } else if (notFound == 0) {
                $sel[0].selectedIndex = 0;
            }
        }
    }

    app7.input.checkEmptyState($sel[0]);

    if ($sel.parent().hasClass('smart-select')) {
        var ss = app7.smartSelect.get($sel.parent()[0]);
        if ($sel[0].selectedIndex < 0) {
            ss.unsetValue();    
        } else {
            ss.setValue($sel.val());
        }
    }
}

function getDTPicker(pId, pLabel, pType, pValue) {
    // pType: date, time, datetime-local

    var $itemCont, $itemInner, $inputWrap;

    $itemCont = $('<li/>', {
        class: 'item-content item-input',
    });
    
    $itemInner = $('<div/>', {
        class: 'item-inner',
    }).appendTo($itemCont);

    $('<div/>', {
        class: 'item-title item-floating-label',
    }).append(pLabel).appendTo($itemInner);
    
    $inputWrap = $('<div/>', {
        class: 'item-input-wrap',
    }).appendTo($itemInner);

    var $input = $('<input/>', {
        type: pType ? pType : 'date',
        id: pId,
    }).appendTo($inputWrap);

    setDTPickerVal($input, pValue);

    return $itemCont;
}

// Devuelve un Date con el value de un control DTPicker
// null si esta vacio
function getDTPickerVal(pInput, pJSON) {
    var dt = null;

    if (pInput.attr('type') == 'date') {
        dt = new Date(pInput.val() + 'T00:00' + timeZone());
    } else if (pInput.attr('type') == 'datetime-local') {
        dt = new Date(pInput.val() + timeZone());
    } else {
        return pInput.val();
    }

    if (dt && !isNaN(dt.getTime())) {
        return pJSON ? dt.toJSON() : dt;
    } else {
        return null;
    }
}

// Devuelve el TimeZone para aplicarlo a una fecha JSON
function timeZone() {
	var ret = '';
	var dif = new Date().getTimezoneOffset();
	if (dif == 0) {
		return 'Z';
	} else if (dif > 0) {
		ret += '-';
	} else {
		ret += '+';
	}
	
	dif = Math.abs(dif);
	var h = parseInt(dif / 60);
	ret += leadingZeros(h, 2) + ':' + leadingZeros(dif - (h * 60), 2);

	return ret;	
}

function setDTPickerVal(pInput, pValue) {
    var type = pInput.attr('type');
    if (pValue != null && pValue != '') {
        if (type == 'date') {
            setInputVal(pInput, ISODate(pValue));
        } else if (type == 'time') {
            setInputVal(pInput, ISOTime(pValue));
        } else if (type == 'datetime-local') {
            setInputVal(pInput, ISODate(pValue) + 'T' + ISOTime(pValue));
        }
    } else {
        setInputVal(pInput, '');
    }
}

function getTextarea(pId, pLabel, pValue) {
    var $itemCont, $itemInner, $inputWrap;

    $itemCont = $('<li/>', {
        class: 'item-content item-input',
    });
    
    $itemInner = $('<div/>', {
        class: 'item-inner',
    }).appendTo($itemCont);

    $('<div/>', {
        class: 'item-title item-floating-label',
    }).append(pLabel).appendTo($itemInner);
    
    $inputWrap = $('<div/>', {
        class: 'item-input-wrap',
    }).appendTo($itemInner);
    
    var $ta = $('<textarea/>', {
        class: 'resizable',
        id: pId,
        placeholder: pLabel,
        //value: pValue,
    }).appendTo($inputWrap);

    if (pValue) $ta.append(pValue);

    $('<span/>', {
        class: 'input-clear-button',
    }).appendTo($inputWrap);
    
    return $itemCont;
}

/*
Devuelve un Toggle (checkbox)

$ctl = getToggle('myToggle', 'Etiqueta', {
    iosicon: '',
    mdicon: '',
});
$inp = $ctl.find('input');
$inp.change(function (e) {
    alert(this.checked);
})
$inp.prop('checked', true);

o con el control F7:

$ctl = getToggle('myToggle', 'Etiqueta');
var toggle = app7.toggle.get($ctl.find('.toggle')[0]);
toggle.on('change', function (t) {
    alert(t.checked);
})
toggle.checked = true;
*/
function getToggle(pId, pLabel, options) {
    var $li, $itemCont, $itemInner, $itemAfter;

    var opt = {};
    Object.assign(opt, options);

    $li = $('<li/>');

    $itemCont = $('<div/>', {
        class: 'item-content',
    }).appendTo($li);

    if (opt.iosicon || opt.mdicon) {
        var $itemMedia = $('<div/>', {
            class: 'item-media',
        }).appendTo($itemCont);

        if (opt.iosicon) {
            var $i = $('<i/>', {
                class: 'f7-icons',
            }).append(opt.iosicon).appendTo($itemMedia);
            if (opt.mdicon) $i.addClass('ios-only');
        }
        
        if (opt.mdicon) {
            var $i = $('<i/>', {
                class: 'material-icons',
            }).append(opt.mdicon).appendTo($itemMedia);
            if (opt.iosicon) $i.addClass('md-only');
        }
    };

    $itemInner = $('<div/>', {
        class: 'item-inner',
    }).appendTo($itemCont);

    $('<div/>', {
        class: 'item-title',
    }).append(pLabel).appendTo($itemInner);

    $itemAfter = $('<div/>', {
        class: 'item-after',
    }).appendTo($itemInner);

    $toggle = $('<label/>', {
        class: 'toggle',
    }).appendTo($itemAfter);

    $('<input/>', {
        type: 'checkbox',
        id: pId,
    }).appendTo($toggle);

    $('<span/>', {
        class: 'toggle-icon',
    }).appendTo($toggle);

    app7.toggle.create({ el: $toggle[0] });
    return $li;
}

function setToggleVal(pCtrl, pValue){
    let toogle = app7.toggle.get(pCtrl.closest('.toggle')[0]);
    toogle.checked = pValue;
}

function getCheckbox(pId, pLabel) {
    return getToggle(pId, pLabel);
}

/*
Devuelve un Stepper

$ctl = getStepper('myStepper', 'Etiqueta', {
    iosicon: '',
    mdicon: '',
});
var stp = app7.stepper.get($ctl.find('.stepper')[0]);
stp.min = 50;/

stp.max = 200;
stp.step = 10;
stp.setValue(200);

stp.on('change', function (s) {
    alert(s.getValue());
})
*/
function getStepper(pId, pLabel, options) {
    var $li, $itemCont, $itemInner, $itemAfter;

    var opt = {};
    Object.assign(opt, options);

    $li = $('<li/>');

    $itemCont = $('<div/>', {
        class: 'item-content',
    }).appendTo($li);

    if (opt.iosicon || opt.mdicon) {
        var $itemMedia = $('<div/>', {
            class: 'item-media',
        }).appendTo($itemCont);

        if (opt.iosicon) {
            var $i = $('<i/>', {
                class: 'f7-icons',
            }).append(opt.iosicon).appendTo($itemMedia);
            if (opt.mdicon) $i.addClass('ios-only');
        }
        
        if (opt.mdicon) {
            var $i = $('<i/>', {
                class: 'material-icons',
            }).append(opt.mdicon).appendTo($itemMedia);
            if (opt.iosicon) $i.addClass('md-only');
        }
    };

    $itemInner = $('<div/>', {
        class: 'item-inner',
    }).appendTo($itemCont);

    $('<div/>', {
        class: 'item-title',
    }).append(pLabel).appendTo($itemInner);

    $itemAfter = $('<div/>', {
        class: 'item-after',
    }).appendTo($itemInner);

    $stepper = $('<div/>', {
        class: 'stepper stepper-fill',
    }).appendTo($itemAfter);

    $('<div/>', {
        class: 'stepper-button-minus',
    }).appendTo($stepper);

    $inputWrap = $('<div/>', {
        class: 'stepper-input-wrap',
    }).appendTo($stepper);

    $('<input/>', {
        type: 'text',
        readonly: 'readonly',
        id: pId,
    }).appendTo($inputWrap);

    $('<div/>', {
        class: 'stepper-button-plus',
    }).appendTo($stepper);

    app7.stepper.create({
        el: $stepper[0],
        autorepeat: true,
    });
    return $li;
}

/*
Devuelve una ventana popup con un boton Cerrar
Sirve para mostrar textos largos. Ej:

    var popup = getPopup('Estado de la sincronizacion');
    var $pre = $('<pre/>', {
        style: 'white-space: pre-wrap;',
    }).append('texto muuuuy laaaargo')
    $pre.appendTo(popup.$el.find('.page-content .block'));
    popup.open();

*/
function getPopup(pTitle) {
    var $popup, $page, $navbar, $navbarInner, $div, $pageCont;

    $popup = $('<div/>', {
        class: 'popup',
    });

    $page = $('<div/>', {
        class: 'page',
    }).appendTo($popup);

    $navbar = $('<div/>', {
        class: 'navbar',
    }).appendTo($page);

    $('<div/>', {
        class: 'navbar-bg',
    }).appendTo($navbar);

    $navbarInner = $('<div/>', {
        class: 'navbar-inner',
    }).appendTo($navbar);

    $('<div/>', {
        class: 'title',
    }).append(pTitle).appendTo($navbarInner);

    $div = $('<div/>', {
        class: 'right',
    }).appendTo($navbarInner);

    $('<a/>', {
        href: '#',
        class: 'link popup-close',
    }).append('Cerrar').appendTo($div);

    $pageCont = $('<div/>', {
        class: 'page-content',
    }).appendTo($page);

    $div = $('<div/>', {
        class: 'block',
    }).appendTo($pageCont);

    return app7.popup.create({content: $popup[0]});
}

/*
Devuelve un control Autocomplete. Ejemplos:

pSource = {
    folder: id o path (si es path debe ir rootFolder),
    rootFolder: (id),
    searchFields: '', // campos sobre los que se busca
    extraFields: '', // campos adicionales que devuelve value
    formula: '', // filtro para los datos
    order: '', // orden de los datos
    grouped: false, // si se utiliza search o searchGroups
    preload: false, // precarga los datos al iniciar el control
    forceOnline: false, // si se fuerzan todos los search al server
}

Multiple no se puede cambiar despues de iniciar xq cambia el markup


Ej con pMultiple = false

    // Con un array de Strings
    $li = getAutocomplete('acId', 'Etiqueta', ['Item 1', 'Item 2']);
    ac = app7.autocomplete.get($li.find('input')[0]);
    ac.params.allValues = true; // Muestra los valores al tomar el foco

    // Con un array de Objetos
    $li = getAutocomplete('acId', 'Etiqueta', [{ nombre: 'Jorge', id: 1}, {nombre: 'Pedro', id: 2}]);
    ac = app7.autocomplete.get($li.find('input')[0]);
    ac.params.allValues = true;
    // Hay que especificar las properties 
    ac.params.textProperty = 'nombre';
    ac.params.valueProperty = 'nombre';

    // A un keyword
    $li = getAutocomplete('acId', 'Etiqueta', {
        folder: '/config/listas',
        rootFolder: 5097,
        searchFields: 'description',
        extraFields: 'id',
        formula: 'type = \'ContactoEstado\'',
        order: 'description',
        preload: true,
    });
    ac = app7.autocomplete.get($li.find('input')[0]);
    ac.params.allValues = true;
    ac.params.limit = 100; // Limite de sugerencias (50 en modo single)

    // Valores anteriores del campo (datalist)
    $li = getAutocomplete('acIc', 'Etiqueta', {
        folder: 5103,
        searchFields: 'vehiculo',
        formula: 'vehiculo is not null and vehiculo <> \'\'',
        grouped: true,
    });
    ac = app7.autocomplete.get($li.find('input')[0]);
    ac.params.allValues = true;

    ac.on('change', function (value) {
        if (ac.value.length > 0) {
            $get('#cliente_id').val(ac.value[0]['doc_id']);
            setInputVal($get('#celular'), ac.value[0]['celular']);
            setInputVal($get('#email'), ac.value[0]['email']);
        } else {
            $get('#cliente_id').val('');
            setInputVal($get('#celular'), '');
            setInputVal($get('#email'), '');
        };
    });

Mas info: https://framework7.io/docs/autocomplete.html
*/
function getAutocomplete(pId, pLabel, pSource, pMultiple) {
    var $li, $acEl, $itemInner, ac;

    if (pMultiple) {
        $li = $('<li/>');

        $acEl = $('<a/>', {
            class: 'item-link item-content',
            href: '#',
            id: pId,
            'data-autocomplete': true,
        }).appendTo($li);

        $itemInner = $('<div/>', {
            class: 'item-inner',
        }).appendTo($acEl);

        $('<div/>', {
            class: 'item-title',
        }).append(pLabel).appendTo($itemInner);

        $('<div/>', {
            class: 'item-after',
            style: 'max-width: 70%; white-space: normal;',
        }).appendTo($itemInner);

        ac = app7.autocomplete.create({
            openIn: 'popup',
            openerEl: $acEl[0],
            multiple: true,
            limit: 100,
            source: acSource,
            popupCloseLinkText: 'Cerrar',
            searchbarPlaceholder: 'Buscar',
            searchbarDisableText: 'Cancelar',
        });

    } else {
        $li = getInputText(pId, pLabel);
        $acEl = $li.find('input');
        $acEl.attr('autocomplete', 'off');
        $acEl.attr('data-autocomplete', true)

        ac = app7.autocomplete.create({
            openIn: 'dropdown',
            inputEl: $acEl[0],
            limit: 50,
            source: acSource,
        });

        $li.find('.input-clear-button').click(function (e) {
            $acEl.val('');
            if (app7.theme == 'md') {
                // Fix: En android no vuelve a desplegar el listado hasta q no cambias el foco
                let $etc = $('<input/>', {
                    type: 'text',
                    style: 'height: 1px; width: 1px;',
                })
                $etc.appendTo($acEl.parent());
                $etc.focus();
                setTimeout(() => {
                    $acEl.focus();
                    $etc.remove();
                }, 0);
            }
        });
        ac.on('change', function (value) { dropdownChanged(ac); });
        $acEl.on('change', function (e) { dropdownChanged(ac); })
    }

    // Inicializa segun pSource
    if (!Array.isArray(pSource)) {
        var all;

        pSource.searchFieldsArray = objPropCI(pSource, 'searchFields').split(',').map(el => el.trim());
        if (pSource.searchFieldsArray.length > 0) {
            ac.params.textProperty = pSource.searchFieldsArray[0].toUpperCase();
            ac.params.valueProperty = pSource.searchFieldsArray[0].toUpperCase();
        }; // Si se busca en mas de un campo hay que especificar estas props en mayusculas

        if (objPropCI(pSource, 'extraFields')) {
            pSource.extraFieldsArray = objPropCI(pSource, 'extraFields').split(',').map(el => el.trim());
            all = pSource.searchFieldsArray.concat(pSource.extraFieldsArray);
        } else {
            all = pSource.searchFieldsArray;
        };

        // Saca los repetidos
        pSource.allFieldsArray = all.filter((item, index) => {
            return (all.indexOf(item) == index)
        });

        if (!objPropCI(pSource, 'grouped')) {
            // Agrega el doc_id si no esta
            if (!pSource.allFieldsArray.some(el => el.toLowerCase() == 'doc_id')) {
                pSource.allFieldsArray.push('doc_id');
            }
        };

        if (objPropCI(pSource, 'preload')) {
            ac.params.filling = true;
            getControlFolder(objPropCI(pSource, 'folder'), objPropCI(pSource, 'rootFolder')).then(
                function (fld) {
                    if (objPropCI(pSource, 'grouped')) {
                        folderSearchGroups(fld['FldId'], pSource.allFieldsArray.join(', '),
                            '', objPropCI(pSource, 'formula'), '', 0, objPropCI(pSource, 'forceOnline'))
                            .then(resMgr, errMgr);
            
                    } else {
                        folderSearch(fld['FldId'], pSource.allFieldsArray.join(', '), 
                            objPropCI(pSource, 'formula'), objPropCI(pSource, 'order'), 0, 0, 
                            objPropCI(pSource, 'forceOnline'))
                            .then(resMgr, errMgr);
                    }
                }
            )

        } else {
            ac.params.src = pSource;
        }
    } else {
        ac.params.src = pSource;
    };

    return $li;


    function dropdownChanged(pAc) {
        // Borra el value del Autocomplete si no coincide con el Input
        if (pAc.value.length > 0) {
            if (pAc.$inputEl.val() == '') {
                ac.value = [];
                ac.emit('change', ac.value);
            } else {
                //if (pAc.$inputEl.val() != pAc.value[0][pAc.params.src.searchFieldsArray[0].toUpperCase()]) {
                if (Object.values(pAc.value[0]).indexOf(pAc.$inputEl.val()) == -1) {
                    ac.value = [];
                    ac.emit('change', ac.value);
                }
            }
        };
    }
    
    function resMgr(pRes) {
        ac.params.src = pRes;
        ac.params.srcInitial = pSource;
        ac.params.filling = false;
    };

    function acSource(query, render) {
        var self = this;
        var par = self.params;
        var results = [];

        if (par.filling) { render(results); return; }

        if (!par.allValues) {
            if (query.length === 0) { render(results); return; };
        };

        if (Array.isArray(par.src)) {
            par.src.forEach(el => {
                if (typeof el == 'string') {
                    if (el.toLowerCase().indexOf(query.toLowerCase()) >= 0)
                        results.push(el);

                } else if (typeof el == 'object') {
                    var val;
                    if (par.srcInitial && par.srcInitial.searchFieldsArray) {
                        // Busca en los searchField
                        par.srcInitial.searchFieldsArray.forEach(el2 => {
                            val = objPropCI(el, el2);
                            if (typeof val == 'string') {
                                if (val.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                                    results.push(el);
                                }
                            }
                        })
                    } else {
                        // Busca en todo el objeto
                        Object.keys(el).forEach(prop => {
                            val = el[prop];
                            if (typeof val == 'string') {
                                if (val.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                                    results.push(el);
                                }
                            }
                        });
                    }
                }
            })
            render(results);

        } else {
            var formula, arr = [];

            self.preloaderShow();

            if (query.length > 0) {
                par.src.searchFieldsArray.forEach(el => {
                    arr.push(el + ' like ' + sqlEncode('%' + query + '%', 1))
                });
                formula = arr.join(' or ');
                if (objPropCI(par.src, 'formula')) {
                    formula = '(' + formula + ') and (' + objPropCI(par.src, 'formula') + ')';
                }

            } else {
                formula = objPropCI(par.src, 'formula');
            }
            if (!formula) formula = '';

            getControlFolder(objPropCI(par.src, 'folder'), objPropCI(par.src, 'rootFolder')).then(
                function (fld) {
                    if (objPropCI(par.src, 'grouped')) {
                        folderSearchGroups(fld['FldId'], par.src.allFieldsArray.join(', '),
                            '', formula, '', par.limit, objPropCI(par.src, 'forceOnline'))
                            .then(sourceResMgr, errMgr);
        
                    } else {
                        folderSearch(fld['FldId'], par.src.allFieldsArray.join(', '), formula, 
                            objPropCI(par.src, 'order'), par.limit, 0, objPropCI(par.src, 'forceOnline'))
                            .then(sourceResMgr, errMgr);
                    }
                }
            )
        }

        function sourceResMgr(pRes) {
            pRes.forEach(el => results.push(el));
            self.preloaderHide();
            render(results);
        }
    }

    function errMgr(pErr) {
        console.log(pErr);
        throw pErr;
    }
}

/*
Devuelve un boton. Ej:
    $ctl = getButton('Mi boton').appendTo($ul);
    $ctl.find('button').click(function(e) { alert('clicked') });
*/
function getButton(pTitle) {
	var $itemCont, $itemInner, $inputWrap;
	
	$itemCont = $('<li/>', {
		class: 'item-content item-input',
	});
	
	$itemInner = $('<div/>', {
		class: 'item-inner',
	}).appendTo($itemCont);
	
	$inputWrap = $('<div/>', {
		class: 'item-input-wrap',
	}).appendTo($itemInner);
	
	$('<button/>', {
		class: 'button',
	}).append(pTitle).appendTo($inputWrap);
	
	return $itemCont;
}

// Devuelve una tabla con el DocLog del documento, mediante la funcion de Callback
function getDocLog(pDocId, pCallback) {
	var $dataTable, $cardHeader, $tableTitle, $cardContent;
	var $table, $thead, $tbody, $tr;
	
	$dataTable = $('<div/>', {
		class: 'data-table card',
	});

	$cardHeader = $('<div/>', {
		class: 'card-header',
	}).appendTo($dataTable);

	$tableTitle = $('<div/>', {
		class: 'data-table-title',
	}).appendTo($cardHeader);
	
	$tableTitle.append('Cambios de datos');
	
	$cardContent = $('<div/>', {
		class: 'card-content',
	}).appendTo($dataTable);
	
	$table = $('<table/>').appendTo($cardContent);
	$thead = $('<thead/>').appendTo($table);
	$tbody = $('<tbody/>').appendTo($table);

	$tbody.on('click', 'tr', function (e) {
		var old = $(this).attr('oldvalue');
		if (old) { app7.dialog.alert(old, 'Valor anterior'); }
	});

	DoorsAPI.documentsFieldsLog(pDocId).then(function (log) {
		var i, userAnt, dtAnt, dt;

        log.forEach(row => {
			dt = new Date(row['LogDate']);
			if (i == 0 || userAnt != row['AccName'] || Math.abs(dt.getTime() - dtAnt.getTime()) > 1000) {
				userAnt = row['AccName'];
				dtAnt = dt;

				$tr = $('<tr/>').appendTo($tbody);
				$('<td/>', {
					colspan: 2,
                }).append('<b>' + userAnt + ' el ' + dtAnt.toLocaleDateString() 
                    + ' ' + ISOTime(dtAnt) + '</b>').appendTo($tr);
            }

			$tr = $('<tr/>').appendTo($tbody);
			$('<td/>').append(row['Field']).appendTo($tr);
			$('<td/>').append(row['NewValue']).appendTo($tr);
			$tr.attr('oldvalue', row['OldValue'] == null ? '(vacio)' : row['OldValue']);
        })
		
		pCallback($dataTable);
		
	}, function (err) {
		console.log(err);

		$tr = $('<tr/>').appendTo($tbody);
		$('<td/>', {
			colspan: 2,
		}).append('Error: ' + errMsg(err)).appendTo($tr);
		
		pCallback($dataTable);
	});
}

/*
var $page = getPage({
	id: 'contactos',
	title: 'Contactos',
	leftbutton: 'new' / 'save' / 'exit' / 'search' / 'menu' / {label, iosicon, mdicon}
	rightbutton: Igual que left
    searchbar: 1 fixed, 2 expandable
    subnavbar: true,
	pulltorefresh: true,
});
*/
function getPage(params) {
	var $page = $('<div/>', {
	    class: 'page',
	});

    var searchbar = getObjProp(params, 'searchbar');
    var subnavbar = getObjProp(params, 'subnavbar');
	if (searchbar === 1 || subnavbar === true) {
		$page.addClass('page-with-subnavbar');
	};

    /*
    Recomendado pasar un ID de page unico, ya que si hay elementos repetidos con otras
    paginas se puede usar el selector de esta forma: $('#pageId #elementId').
    Es una alternativa a la funcion $get. Necesario para los tabs.
    */
	
	var id = getObjProp(params, 'id');
	if (id) $page.attr('id', id);
	
	var $navbar = $('<div/>', {
	    class: 'navbar',
	}).appendTo($page);

    $('<div/>', {
        class: 'navbar-bg',
    }).appendTo($navbar);
	 
	var $navbarInner = $('<div/>', {
	    class: 'navbar-inner sliding',
	}).appendTo($navbar);
    
    var leftbutton = getObjProp(params, 'leftbutton');
    if (leftbutton) {
        var $div = $('<div/>', {
            class: 'left',
        }).appendTo($navbarInner);
        getNavbarButton(leftbutton).appendTo($div);
    }

	var title = getObjProp(params, 'title');
	if (title) {
		$div = $('<div/>', {
		    class: 'title',
		}).append(title).appendTo($navbarInner);
	};
	
    var rightbutton = getObjProp(params, 'rightbutton');
    if (rightbutton) {
        var $div = $('<div/>', {
            class: 'right',
        }).appendTo($navbarInner);
        getNavbarButton(rightbutton).appendTo($div);
    };
    
	if (searchbar === 2) {
        $searchbar = getSearchBar();
        $searchbar.addClass('searchbar-expandable');
        $searchbar.appendTo($navbarInner);
    };

	if (searchbar === 1 || subnavbar === true) {
		var $subnavbar = $('<div/>', {
		    class: 'subnavbar',
		}).appendTo($navbarInner);
        
        if (searchbar === 1) {
            var $searchbar = getSearchBar();
            $searchbar.appendTo($subnavbar);
        }
	};

    if (searchbar === 1 || searchbar === 2) {
        $('<div/>', {
            class: 'searchbar-backdrop',
        }).appendTo($page);
    };

	var $pageCont = $('<div/>', {
	    class: 'page-content',
	}).appendTo($page);
	
    var ptr = getObjProp(params, 'pulltorefresh');
	if (ptr) {
		$pageCont.addClass('ptr-content');
		$pageCont.attr('data-ptr-mousewheel', true);
	
		$div = $('<div/>', {
			class: 'ptr-preloader',
		}).appendTo($pageCont);
	
		$('<div/>', {
			class: 'preloader',
		}).appendTo($div);
	
		$('<div/>', {
			class: 'ptr-arrow',
		}).appendTo($div);
	};

    return $page;
    
    // 'new', 'save', 'exit', 'search', {label, iosicon, mdicon}
    function getNavbarButton(pButton) {
        if (pButton == 'new')
            return getLink({ iosicon: 'plus', mdicon: 'add' });
        else if (pButton == 'save')
            return getLink({ mdicon: '<span class="material-icons-outlined">cloud</span>' });
        else if (pButton == 'exit')
            return getLink({ iosicon: 'chevron_left', mdicon: 'arrow_back' });
        else if (pButton == 'search')
            return getLink({ iosicon: 'search', mdicon: 'search' });
        else if (pButton == 'menu')
            return getLink({ iosicon: 'menu', mdicon: 'more_vert' });
        else
            return getLink(pButton);
    }
}

/*
Para botones de la Navbar
{
    text: miBoton,
    iosicon: miIcono,
    mdicon: miIcono, // Puede pasarse solo uno, en ese caso se usa el mismo en ambos temas
}
*/
function getLink(params) {
    var $a, $i;
    var text = getObjProp(params, 'text');
    var iosicon = getObjProp(params, 'iosicon');
    var mdicon = getObjProp(params, 'mdicon');

    $a = $('<a/>', {
        href: '#',
    });

    if (iosicon || mdicon) {
        $a.addClass('link');
    } else {
        $a.addClass('button');
    }
    
    if (!text) $a.addClass('icon-only');

    if (iosicon) {
        $i = $('<i/>', {
            class: 'f7-icons',
        }).append(iosicon).appendTo($a);
        if (mdicon) $i.addClass('ios-only');
    }

    if (mdicon) {
        $i = $('<i/>', {
            class: 'material-icons',
        }).append(mdicon).appendTo($a);
        if (iosicon) $i.addClass('md-only');
    }

    if (text) {
        $('<span/>').append(text).appendTo($a);
    }

    return $a;
}

// Devuelve un searchBar
function getSearchBar() {
	var $searchbar = $('<form/>', {
		class: 'searchbar',
	});
	
	var $searchbarInner = $('<div/>', {
	    class: 'searchbar-inner',
	}).appendTo($searchbar);
	
	var $searchbarInputWrap = $('<div/>', {
	    class: 'searchbar-input-wrap',
	}).appendTo($searchbarInner);
	
	$('<input/>', {
		type: 'search',
		placeholder: 'Buscar',
	}).appendTo($searchbarInputWrap);
	
	$('<i/>', {
		class: 'searchbar-icon',
	}).appendTo($searchbarInputWrap);
	
	$('<span/>', {
		class: 'input-clear-button',
	}).appendTo($searchbarInputWrap);
	
	$('<span/>', {
	    class: 'searchbar-disable-button',
	}).append('Cancelar').appendTo($searchbarInner);
	
	return $searchbar;
}

function getCollapsible(pId, pTitle) {
    var $li, $a, $div;

    $li = $('<li/>', {
        class: 'accordion-item',
        style: 'background-color: var(--f7-list-item-divider-bg-color);',
        id: pId,
    });

    $a = $('<a/>', {
        href: '',
        class: 'item-link item-content',
    }).appendTo($li);

    $div = $('<div/>', {
        class: 'item-inner',
    }).appendTo($a);

    $('<div/>', {
        class: 'item-title',
    }).append(pTitle).appendTo($div);

    $('<div/>', {
        class: 'accordion-item-content',
        style: 'padding-left: 8px;',
    }).appendTo($li);

    return $li;
}

function getTextEditor(pId, pLabel, pValue) {
    var $li, $te;

    $li = $('<li/>');

    $te = $('<div/>', {
        class: 'text-editor text-editor-resizable',
        id: pId,
    }).appendTo($li);

    $('<div/>', {
        class: 'text-editor-content',
        contenteditable: 'true',
    }).appendTo($te);

    app7.textEditor.create({
        el: $te[0],
        value: pValue,
        placeholder: pLabel,
        mode: 'toolbar',
        buttons: 
        [
            ['bold', 'underline', 'strikeThrough'],
            ['h2', 'h3'],
            ['alignLeft', 'alignCenter'],
            ['orderedList'],
            ['indent', 'outdent'],
        ],
        dividers: false,
    });

    return $li;
}

/*
Devuelve un collapsible con una lista para meter los attachs
y los botones de accion para agregar
*/
function getAttachments(pId, pTitle, pTag) {
    var $li = getCollapsible(pId, pTitle ? pTitle : 'Attachments');
    $li.attr('data-attachments', pTag ? pTag : 'all');

    var $accCont = $li.find('.accordion-item-content');
    
    var $btnRow = $('<div/>', {
        class: 'row',
        style: 'padding-top: var(--f7-list-item-padding-vertical); padding-bottom: var(--f7-list-item-padding-vertical);',
    }).appendTo($accCont);


    var $btn = $('<button/>', {
        id: 'camera',
        class: 'button col',
    }).appendTo($btnRow);

    $btn.append('<i class="f7-icons ios-only">camera</i>');
    $btn.append('<i class="material-icons md-only">photo_camera</i>');

    /*
    El plugin cordova-plugin-media-capture es pesimo
    Lo sacamos hasta nuevo aviso
    
    var $btn = $('<button/>', {
        id: 'video',
        class: 'button col',
    }).appendTo($btnRow);

    $btn.append('<i class="f7-icons ios-only">videocam</i>');
    $btn.append('<i class="material-icons md-only">videocam</i>');
    */

    var $btn = $('<button/>', {
        id: 'photo',
        class: 'button col',
    }).appendTo($btnRow);

    $btn.append('<i class="f7-icons ios-only">photo</i>');
    $btn.append('<i class="material-icons md-only">photo</i>');

    var $btn = $('<button/>', {
        id: 'doc',
        class: 'button col',
    }).appendTo($btnRow);

    $btn.append('<i class="f7-icons ios-only">doc</i>');
    $btn.append('<i class="material-icons md-only">insert_drive_file</i>');

    var $btn = $('<button/>', {
        id: 'audio',
        class: 'button col',
    }).appendTo($btnRow);

    $btn.append('<i class="f7-icons ios-only">mic</i>');
    $btn.append('<i class="material-icons md-only">mic</i>');

    $('<div/>', {
        class: 'list media-list no-hairlines-md',
        style: 'margin-top: 0;',
    }).append('<ul/>').appendTo($accCont);

    return $li;
}

function bindToNode (node, name, fn) {
    node[name] = fn.bind(node);
}

/*
Devuelve el markup de un attachment para agregar
al ul del control anterior
*/
function getAttachment(pAttach, pReadonly) {
    var att = (pAttach instanceof doorsapi2.Attachment) ? pAttach.toJSON() : pAttach;

    var $li = $('<li/>', {
        class: 'swipeout',
    });

    var $swipeCont = $('<div/>', {
        class: 'swipeout-content',
    }).appendTo($li);

    var $itemCont = $('<a/>', {
        href: '#',
        class: 'item-link item-content',
        'data-att-id': att.AttId,
        'data-att-name': att.Name,
        'data-attachments': att.Description 
    }).appendTo($swipeCont);

    var $itemInner = $('<div/>', {
        class: 'item-inner',
    }).appendTo($itemCont);

    var $itemTitleRow = $('<div/>', {
        class: 'item-title-row',
    }).appendTo($itemInner);

    $('<div/>', {
        class: 'item-title',
        style: 'white-space: normal; font-weight: var(--f7-list-item-subtitle-font-weight);',
    }).append(htmlEncode(att.Name)).appendTo($itemTitleRow);

    $('<div/>', {
        class: 'item-after',
    }).append(fileSize(att.Size)).appendTo($itemTitleRow);

    $('<div/>', {
        class: 'item-text',
    }).append(att.AccName + ' ' + moment(att.Created).fromNow()).appendTo($itemInner);

    if (!pReadonly) {
        var $swipeActions = $('<div/>', {
            class: 'swipeout-actions-right',
        }).appendTo($li);

        $('<a/>', {
            href: '#',
            class: 'swipeout-delete', // swipeout-overswipe',
        }).append('Borrar').appendTo($swipeActions);
    };

    return $li;
}

// Agrega las opciones por defecto (pagina de opciones)
function addDefaultOptions(pContainer) {
    var $li, $itemCont, $itemMedia, $itemInner, $ctl, $input;

    // Cuenta
    var $li = getListLinkItem({
        title: 'Cuenta',
        iosicon: 'person_circle',
        mdicon: 'account_circle',
        click: showLogin,
    }).appendTo(pContainer);

    $li.find('.item-link').attr('id', 'options-account');

    // Status bar
    $ctl = getToggle('statusbar', 'Status bar', {
        iosicon: 'expand',
        mdicon: 'fullscreen',
    }).appendTo(pContainer);

    var toggle = app7.toggle.get($ctl.find('.toggle')[0]);
    toggle.on('change', function (t) {
        statusBar(t.checked);
        window.localStorage.setItem('statusBar', t.checked ? 'on' : 'off');
    })
    toggle.checked = !(window.localStorage.getItem('statusBar') == 'off'); // Por null va en true

    // Theme
    $ctl = getSmartSelect('theme', 'Tema').appendTo(pContainer);

    $itemCont = $ctl.find('.item-content');

    $itemMedia = $('<div/>', {
        class: 'item-media',
    }).prependTo($itemCont);

    var $i = $('<i/>', {
        class: 'f7-icons ios-only',
    }).append('logo_apple').appendTo($itemMedia);
    
    var $i = $('<i/>', {
        class: 'material-icons md-only',
    }).append('android').appendTo($itemMedia);

    $input = $ctl.find('select');

    $('<option/>', {
        value: 'auto',
    }).append('auto').appendTo($input);

    $('<option/>', {
        value: 'ios',
    }).append('ios').appendTo($input);

    $('<option/>', {
        value: 'md',
    }).append('md').appendTo($input);

    setSelectVal($input, null, window.localStorage.getItem('theme'), 0);

    $input.change(function (e) {
        window.localStorage.setItem('theme', $(this).val());
        app7.dialog.confirm('Reiniciar ahora?', function () {
            location.href = 'index.html';
        });
    });

    // Modo oscuro
    $ctl = getToggle('darktheme', 'Modo oscuro', {
        iosicon: 'moon',
        mdicon: 'dark_mode',
    }).appendTo(pContainer);

    var toggle = app7.toggle.get($ctl.find('.toggle')[0]);
    toggle.on('change', function (t) {
        if (t.checked) {
            $(document.body).addClass('dark');
        } else {
            $(document.body).removeClass('dark');
        };
        window.localStorage.setItem('darkTheme', t.checked ? 'on' : 'off');
    })
    toggle.checked = $(document.body).hasClass('dark');

    // Explorer limit
    $ctl = getStepper('explorerLimit', 'Tope de registros', {
        iosicon: 'list_number',
        mdicon: 'format_list_numbered',

    }).appendTo(pContainer);

    var stepper = app7.stepper.get($ctl.find('.stepper')[0]);
    stepper.min = 50;
    stepper.max = 200;
    stepper.step = 10;
    var val = window.localStorage.getItem('explorerLimit');
    stepper.setValue(val ? val : 200);

    stepper.on('change', function (s) {
        window.localStorage.setItem('explorerLimit', s.getValue());
    })

    // Consola
    getListLinkItem({
        title: 'Consola',
        mdicon: 'bug_report',
        click: showConsole,
    }).appendTo(pContainer);

    // Version de los scripts
    getListLinkItem({
        title: 'Version de los scripts',
        mdicon: 'data_object',
        click: ev => {
            var view = app7.views.get($(ev.target).closest('.view')[0]);
            view.router.navigate('/cdn/?script=app7-scrversions');
        },
    }).appendTo(pContainer);

    // Iconos
    if (device.platform == 'browser') {
        // F7 Icons
        getListLinkItem({
            title: 'Framework7 Icons',
            click: () => {
                cordova.InAppBrowser.open('lib/framework7/css/cheatsheet.htm', '_system');
            },
        }).appendTo(pContainer);

        // MD Icons
        getListLinkItem({
            title: 'Material Icons',
            click: () => {
                cordova.InAppBrowser.open('https://fonts.google.com/icons?selected=Material+Icons', '_system');
            },
        }).appendTo(pContainer);
    }

    /*
    let config = {
        hexRGBAColor: "#0000ffff",
        showsTimer: true,
        showsTouchRadius: true,
        showsLog: true
	}

    TouchVisualizer.start(config, (success) => {
        console.log("success visualizer", success)
    }, (error) => {
        console.log("error visualizer", error)
    });

    TouchVisualizer.stop((success) => {
        console.log("success visualizer stop", success)
    }, (error) => {
        console.log("error visualizer stop", error)
    });
    */
}

/*
Para usar en el onDeviceReady. Devuelve un layout inicial con Tabbed Views

getTabbedViewsLayout([
    {
        viewid: 'view-explorer',
        label: 'Contactos',
        url: '/explorer/?fld_id=5103&fixed=1',
        iosicon: 'person_2_alt',
        mdicon: 'contacts',
    },
    {
        viewid: 'view-opciones',
        label: 'Opciones',
        url: '/codelib/?code=opciones',
        iosicon: 'gear_alt_fill', // Como no especifico mdicon se usa este en los 2
    }
]).appendTo($('#app'));
*/
function getTabbedViewsLayout(pTabs) {
    var $views, $toolbar, $toolbarInner, $tabs, $a, tab;

    $views = $('<div/>', {
		class: 'views tabs-animated-wrap',
	});
	
	$toolbar = $('<div/>', {
		class: 'toolbar tabbar tabbar-labels toolbar-bottom',
	}).appendTo($views);
	
	$toolbarInner = $('<div/>', {
		class: 'toolbar-inner',
	}).appendTo($toolbar);
	
	$tabs = $('<div/>', {
		class: 'tabs',
	}).appendTo($views);
    
    for (var i = 0; i < pTabs.length; i++) {
        tab = pTabs[i];

        if (tab.url && tab.viewid) {
            // Es un tab de vista
            $a = getTabLink(tab);
            $a.appendTo($toolbarInner);
            
            $view = $('<div/>', {
                id: tab.viewid,
                class: 'view tab' + (i == 0 ? ' view-main tab-active' : ''),
            }).appendTo($tabs);
            
            app7.views.create($view[0], {
                url: tab.url,
            });

        } else if (tab.tabs) {
            // Es un tab de tabs
            let actions;

            tab.href = '';
            $a = getTabLink(tab);
            $a.appendTo($toolbarInner);
    
            $a.click(function (e) {
                actions.open();
            });

            let actArr = [];
            for (var j = 0; j < tab.tabs.length; j++) {
                let subtab = tab.tabs[j];

                let $view = $('<div/>', {
                    id: subtab.viewid,
                    class: 'view tab',
                }).appendTo($tabs);
                
                let f7View = app7.views.create($view[0], {
                    url: subtab.url,
                });

                let icon = '';
                if (subtab.iosicon) icon += `<i class="f7-icons ${ tab.mdicon ? ' ios-only' : '' }">${ subtab.iosicon }</i>`;
                if (subtab.mdicon) icon += `<i class="material-icons ${ tab.iosicon ? ' md-only' : '' }">${ subtab.mdicon }</i>`;
                actArr.push({
                    text: subtab.label,
                    icon,
                    onClick: function(actions, e) {
                        app7.tab.show('#' + subtab.viewid);
                    },
                });

            }

            actArr.push({
                text: 'Cerrar',
                close: true,
                color: 'red',
                icon: '<i class="f7-icons ios-only">multiply</i><i class="material-icons md-only">close</i>',
            });

            actions = app7.actions.create({
                buttons: actArr,
            });

        }
    };

    function getTabLink(tab) {
        let $a = $('<a/>', {
            href: '#' + tab.viewid,
            class: 'tab-link',
        });

        if (tab.iosicon) {
            $('<i/>', {
                class: 'f7-icons' + (tab.mdicon ? ' ios-only' : ''),
            }).append(tab.iosicon).appendTo($a);
        };
        
        if (tab.mdicon) {
            $('<i/>', {
                class: 'material-icons' + (tab.iosicon ? ' md-only' : ''),
            }).append(tab.mdicon).appendTo($a);
        };

        if (tab.label) {
            $('<span/>', {
                class: 'tabbar-label',
            }).append(tab.label).appendTo($a);
        }

        return $a;
    }

    return $views;
}

// todo: refactorizar y documentar (ver Turin contactos_old)
function getVirtualList(pListElement) {
	var vList = app7.virtualList.create({
		el: $(pListElement)[0],
		
		rowsBefore: 100,
		rowsAfter: 100,
		dynamicHeightBufferSize: 2,
		
		// Se llenan despues
		items: [],
        
        height: function (item) {
            // Determina el alto segun el contenido
            // todo: Si text tiene 2 lineas necesita mas espacio
            if (item.divider) {
                return app7.theme == 'ios' ? 31 : 48;
            } else {
                var cont = 't';
                if (item.subtitle) cont += 's';
                if (item.text) cont += 't';

                if (app7.theme == 'ios') {
                    if (cont == 't') return 44;
                    else if (cont == 'ts') return 64.55;
                    else if (cont == 'tt') return 64.55;
                    else if (cont == 'tst') return 85.46;
                } else {
                    if (cont == 't') return 51.62;
                    else if (cont == 'ts') return 72.53;
                    else if (cont == 'tt') return 71.62;
                    else if (cont == 'tst') return 92.53;
                }
            }
        },

		// Custom search function for searchbar
		searchAll: function (query, items) {
            var found = [];
            var str;
			for (var i = 0; i < items.length; i++) {
				if (!items[i].divider) {
                    if (query.trim() === '') {
                        found.push(i);
                    } else {
                        str = items[i].title;
                        if (items[i].subtitle) str += '||' + items[i].subtitle;
                        if (items[i].text) str += '||' + items[i].text;
                        if (items[i].search) str += '||' + items[i].search;
                        str = str.toLowerCase();
                        if (str.indexOf(query.toLowerCase()) >= 0) found.push(i);
                    }

				}
			}
			return found; //return array with matched indexes
		},
		
		renderItem: function (item) {
			var $li, $a, $itemInner, $itemTitleRow;

			if (item.divider) {
				$li = $('<li/>', {
					class: 'item-divider',
				}).append(item.title);
				
			} else {
				$li = $('<li/>');
				
				$a = $('<a/>', {
					href: '#',
					class: 'item-link item-content',
					doc_id: item.doc_id,
					guid: item.guid,
				}).appendTo($li);
				
				$itemInner = $('<div/>', {
					class: 'item-inner',
				}).appendTo($a);
				
				$itemTitleRow = $('<div/>', {
					class: 'item-title-row',
				}).appendTo($itemInner);
				
				$('<div/>', {
					class: 'item-title',
				}).append(item.title).appendTo($itemTitleRow);
	
				if (item.subtitle) {
					$('<div/>', {
						class: 'item-subtitle',
					}).append(item.subtitle).appendTo($itemInner);
				};
				
				if (item.text) {
					$('<div/>', {
						class: 'item-text',
					}).append(item.text).appendTo($itemInner);
				};
			};

			return $li[0].outerHTML;
		},
	});
	
	vList.params.refresh = function (pForce) {
        var self = vList;
        var par = self.params;
		var lastLoad = par.lastLoad;
        
        if (pForce) {
            par.loadItems();
        } else {
            // Recarga si nunca se cargo
            if (!lastLoad) {
                par.loadItems();
            } else {
                if (par.tableName) {
                    var tableName = sync.tableName(par.tableName);
                    // Recarga si hubo un fullSync dps de la ult carga
                    var lastFull = window.localStorage.getItem('lastFullSync_' + tableName.substr(7))
                    if (lastFull > lastLoad) {
                        par.loadItems();
                    } else {
                        var sql = 'select doc_id from ' + tableName + ' where modified_local >= ? or modified >= ?';
                        dbRead(sql, [lastLoad, lastLoad],
                            function (rs) {
                                // Recarga si hay algun registro modificado desde la ult carga
                                if (rs.rows.length > 0) {
                                    par.loadItems();
                                }
                            }
                        );
                    }
                } else {
                    if (par.folderId) {
                        // Recarga si hay un doc modificado desde la ult carga
                        DoorsAPI.folderSearch(par.folderId, 'modified', '', 'modified desc', 1, null, 0).then(
                            function (res) {
                                if (res.length > 0) {
                                    if (res[0]['MODIFIED'] > lastLoad) {
                                        par.loadItems();
                                    }
                                }
                            },
                            function (err) {
                                console.log(err);
                                par.loadItems();
                            }
                        );
                    }
                }
            }
        }
	};
	
    vList.params.loadFromView = function (pView) {
        var self = vList;
        var items = [];
        var defaultLimit = 10000;
    
        asyncLoop(pView.groups.length,
            function (loop) {
                if (pView.table) {
                    // A la base local
                    var sql = 'select ' + pView.fields + ' from ' + pView.table;
                    var where = '';
                    if (pView.where) {
                        where = pView.where;
                    }
                    var group = pView.groups[loop.iteration()];
                    if (group.where) {
                        if (where) {
                            where += ' and (' + group.where + ')';
                        } else {
                            where = group.where;
                        };
                    };
                    if (where) {
                        sql += ' where ' + where;
                    };
                    if (pView.order) {
                        sql += ' order by ' + pView.order;
                    };
                    sql += ' limit ' + (group.limit ? group.limit : defaultLimit);
                
                    dbRead(sql, [], function (rs) {
                        var row;
            
                        items.push({
                            divider: true,
                            title: group.title + ' (' + rs.rows.length + ')',
                        });
                        
                        for (var i = 0; i < rs.rows.length; i++) {
                            row = rs.rows.item(i);
                            items.push(pView.itemConstructor(row));
                        };
                        
                        loop.next();
                    });

                } else if (pView.folder) {
                    // Al server
                    var where = '';
                    if (pView.where) {
                        where = pView.where;
                    }
                    var group = pView.groups[loop.iteration()];
                    if (group.where) {
                        if (where) {
                            where += ' and (' + group.where + ')';
                        } else {
                            where = group.where;
                        };
                    };
                    var maxDocs = (group.limit ? group.limit : defaultLimit);

                    // DoorsAPI.folderSearch(fldId, fields, formula, order, maxDocs, recursive, maxDescrLength)
                    DoorsAPI.folderSearch(pView.folder, pView.fields, where, pView.order, maxDocs, null, 0).then(
                        function (res) {
                            var row;
            
                            items.push({
                                divider: true,
                                title: group.title + ' (' + res.length + ')',
                            });
                            
                            for (var i = 0; i < res.length; i++) {
                                row = res[i];
                                items.push(pView.itemConstructor(row));
                            };
                            
                            loop.next();
                        },
                        function (err) {
                            console.log(err);
                            loop.next();
                        }
                    );
                }
            },
            function() {
                // cycle ended
                app7.preloader.hide();
                self.params.loadItemsCallback(items);
            }
        );
    }

    vList.params.loadItemsCallback = function (pItems) {
        var self = vList;
        var par = self.params;
        par.lastLoad = (new Date).toJSON();
            	
    	// Reemplaza los items
		self.replaceAllItems(pItems);
        
		// Restaura la busqueda
		if (par.searchBar) {
			var query = par.searchBar.query;
			if (query) {
				var filtered = par.searchAll(query, pItems);
				self.filterItems(filtered);
				
				// Scrolla al ult item clickeado (esto no hace falta si no hay filtro)
				if (par.lastClick) {
					var arr = par.lastClick.split('=');
					var key = arr[0]; var val = arr[1];
					var j, scrollTo;
					// Busca el index del ult doc_id o guid clickeado
					for (var i = 0; i < pItems.length; i++) {
						if (pItems[i][key] + '' == val) { j = i; break; };
					};
					// Busca j en la lista de filtrados
					if (j != undefined) {
						for (var i = 0; i < filtered.length; i++) {
							if (filtered[i] == j) { scrollTo = i; break; };
						};
					};
					// Scrolla a ese item
					if (scrollTo != undefined) {
						//if (scrollTo > 0) scrollTo--; // -1 para que no quede justo arriba
						self.scrollToItem(scrollTo);
					};
				};
			;}
        };
    };
	
	return vList;
};

/*
Renderiza un item de Media List

renderMediaListItem({
	id: id que va en el <li>
	type: 0 o undefined -> comun, 1 -> <a>, 2 -> checkbox
	media: Imagen
	title: Titulo
	after:
	subtitle:
	text:
})
*/
function renderMediaListItem(pItem) {
	var $li = $('<li/>', {
    	id: pItem.id,
	});
	
	var $itemCont;
	
    if (pItem.type == 1) {
        $itemCont = $('<a/>', {
            href: '#',
            class: 'item-link item-content',
        }).appendTo($li);
    
    } else if (pItem.type == 2) {
        $itemCont = $('<label/>', {
            class: 'item-checkbox item-content',
        }).appendTo($li);
    
        $('<input/>', {
            type: 'checkbox',
        }).appendTo($itemCont);
    
        $('<i/>', {
            class: 'icon icon-checkbox',
        }).appendTo($itemCont);
        
    } else {
    	$itemCont = $('<div/>', {
    		class: 'item-content',
    	}).appendTo($li);
    }

    if (pItem.media) {
        $('<div/>', {
            class: 'item-media',
        }).append(pItem.media).appendTo($itemCont);
    };

    var $itemInner = $('<div/>', {
        class: 'item-inner',
    }).appendTo($itemCont);
    
    if (pItem.title || pItem.after) {
        var $itemTitleRow = $('<div/>', {
            class: 'item-title-row',
        }).appendTo($itemInner);
        
        if (pItem.title) {
            $('<div/>', {
                class: 'item-title',
            }).append(pItem.title).appendTo($itemTitleRow);
        };

        if (pItem.after) {
            $('<div/>', {
                class: 'item-after',
            }).append(pItem.after).appendTo($itemTitleRow);
        };
    }

    if (pItem.subtitle) {
        $('<div/>', {
            class: 'item-subtitle',
        }).append(pItem.subtitle).appendTo($itemInner);
    };
    
    if (pItem.text) {
        $('<div/>', {
            class: 'item-text',
        }).append(pItem.text).appendTo($itemInner);
    };
    
    return $li;
};

/*
Devuelve un li de tipo link para el ListView

getListLink({
    id: 'myLink',
    title: 'Productos',
    iosicon: 'cart',
    mdicon: 'shopping_cart', // Puede pasarse solo uno, en ese caso se usa el mismo en ambos temas
    click: function () {
        app7.preloader.show();
        f7Page.view.router.navigate('/explorer/?fld_id=999&back=1');
    },
}).appendTo(ul);
*/
function getListLinkItem(pLink) {
    var $li = $('<li/>');

    var $itemCont = $('<a/>', {
        id: pLink.id,
        href: '#',
        class: 'item-link item-content',
    }).appendTo($li);

    $itemCont.click(pLink.click);

    if (pLink.iosicon || pLink.mdicon) {
        var $itemMedia = $('<div/>', {
            class: 'item-media',
        }).appendTo($itemCont);

        if (pLink.iosicon) {
            var $i = $('<i/>', {
                class: 'f7-icons',
            }).append(pLink.iosicon).appendTo($itemMedia);
            if (pLink.mdicon) $i.addClass('ios-only');
        }
        
        if (pLink.mdicon) {
            var $i = $('<i/>', {
                class: 'material-icons',
            }).append(pLink.mdicon).appendTo($itemMedia);
            if (pLink.iosicon) $i.addClass('md-only');
        }
    };
        
    var $itemInner = $('<div/>', {
        class: 'item-inner',
    }).appendTo($itemCont);

    $('<div/>', {
        class: 'item-title',
    }).append(pLink.title).appendTo($itemInner);

    return $li;
}
