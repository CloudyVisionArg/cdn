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
        'data-td-target-input': 'nearest',
        'data-td-target-toggle': 'nearest',
    }).appendTo($div);

    var t = pType.toLowerCase();

    $('<input/>', {
        type: 'text',
        id: pId,
        value: pValue,
        class: 'form-control',
        'data-td-target': '#' + pId + '_div',
        'data-date-type': t,
    }).appendTo($dtp);

    var $sp = $('<span/>', {
        class: 'input-group-text',
        'data-td-target': '#' + pId + '_div',
        'data-td-toggle': 'datetimepicker',
    }).appendTo($dtp);

    $sp.append('<i class="bi bi-calendar3"></i>');

    new tempusDominus.TempusDominus($dtp[0], {
        display: {
            icons: {
                time: 'bi bi-clock',
                date: 'bi bi-calendar',
                up: 'bi bi-arrow-up',
                down: 'bi bi-arrow-down',
                previous: 'bi bi-chevron-left',
                next: 'bi bi-chevron-right',
                today: 'bi bi-calendar-check',
                clear: 'bi bi-trash',
                close: 'bi bi-x',
            },
            components: {
                decades: (t != 'time'),
                year: (t != 'time'),
                month: (t != 'time'),
                date: (t != 'time'),
                hours: (t != 'date'),
                minutes: (t != 'date'),
                seconds: false,
                useTwentyfourHour: true,
            },
        }
    });

    return $div;
}

function setDTPickerVal(pInput, pValue) {
    var type = pInput.attr('data-date-type');
    if (pValue != null && pValue != '') {
        if (type == 'date') {
            pInput.val(ISODate(pValue));
        } else if (type == 'time') {
            pInput.val(ISOTime(pValue));
        } else {
            pInput.val(ISODate(pValue) + 'T' + ISOTime(pValue));
        }
    } else {
        pInput.val('');
    }
}
