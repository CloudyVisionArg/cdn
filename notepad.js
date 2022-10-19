
renderItem({
    /* media: '<img src="..." width="50px" />', */
    title: row['CLIENTE'],
    after: row['ESTADO'],
    subtitle: row['EJECUTIVO'] + (row['PROXACCION'] ? ' - <span style="' + style + '">' + row['PROXACCION'] + ' el ' + fechaTexto(row['FECHAPROXACCION'], true) + '</span><br>' : ''),
    text: 'Creado el ' + fechaTexto(row['CREATED'], true, true) + ' - Modif ' + moment(row['MODIFIED']).fromNow(),
}, $itemContent);


getCodelib('contactos_actions').then(res => eval(res));