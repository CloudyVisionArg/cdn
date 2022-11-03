
renderItem({
    /* media: '<img src="..." width="50px" />', */
    title: row['CLIENTE'],
    after: row['ESTADO'],
    subtitle: row['EJECUTIVO'] + (row['PROXACCION'] ? ' - <span style="' + style + '">' + row['PROXACCION'] + ' el ' + fechaTexto(row['FECHAPROXACCION'], true) + '</span><br>' : ''),
    text: 'Creado el ' + fechaTexto(row['CREATED'], true, true) + ' - Modif ' + moment(row['MODIFIED']).fromNow(),
}, $itemContent);


getCodelib('contactos_actions').then(res => eval(res));

if (row['ESTADO'] == 'Ganada') {
    style = 'color: #4cd964'; // Verde
} else if (row['ESTADO'] == 'Perdida') {
    style = 'color: #ff3b30'; // Rojo
} else if (row['ESTADO'] == 'Activa') {
    if (row['FECHAPROXACCION']) {
        var now = new Date;
        if (new Date(row['FECHAPROXACCION']) < now) {
            style = 'color: #ff9500'; // Azul
        }
    }
}
