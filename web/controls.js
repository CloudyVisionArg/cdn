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
    debugger;
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
