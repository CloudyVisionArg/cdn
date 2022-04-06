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
    }).appendTo($div);

    $dtp.append(`
        <input type="text" value="" class="form-control" />
        <span class="input-group-text">
            <i class="fa fa-calendar"></i>
        </span>
    `);

    new tempusDominus.TempusDominus($dtp[0], {
        display: {
            icons: {
                time: 'fa fa-clock-o',
                date: 'fa fa-calendar-o',
                up: 'fa fa-arrow-up',
                down: 'fa fa-arrow-down',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-calendar-check-o',
                clear: 'fa fa-trash-o',
                close: 'fa fa-times',
            },
        }
    });

    return $div;
}
