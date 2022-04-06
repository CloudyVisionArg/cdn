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

    $div.append(`
    <div class="input-group date" id="id_0">
        <input type="text" value="05/16/2018 12:31:00 AM" class="form-control" />
        <span class="input-group-text input-group-addon">
            <i class="glyphicon glyphicon-calendar fa fa-calendar"></i>
        </span>
    </div>
    `);

    return $div;
}
