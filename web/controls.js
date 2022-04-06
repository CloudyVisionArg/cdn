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

    $('<input/>', {
        type: 'text',
        id: pId,
        value: pValue,
        class: 'form-control',
        'data-td-target': '#' + pId + '_div',
    }).appendTo($dtp);

    var $sp = $('<span/>', {
        class: 'input-group-text',
        'data-td-target': '#' + pId + '_div',
        'data-td-toggle': 'datetimepicker',
    }).appendTo($dtp);

    $sp.append('<i class="bi bi-calendar"></i>');

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
        }
    });

    return $div;
}
