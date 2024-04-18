/*
web-javascript
Funciones varias de JavaScript para la web (para el APP usar app7-global).

Changelog:
2024-04-18: JP - Renombrado de openWindowWithPost a submitData
2024-04-18: JP - Agrego downloadFile
2024-04-16: JP - Agrego openWindowWithPost

Inventario de metodos:

downloadFile(buffer, fileName)
submitData(options)
logAndToast(pMsg, pToastOptions)
preloader
bootstrapVersion()
toast(pText, pOptions)
addInputButton(pControl, pIcon, pAction, pPrepend)
addPhoneButton(pControl)
addWappButton(pControl)
wappButtonClick(pButton)
wappUrl()
addEmailButton(pControl)
wappNumber(pPhone)
*/

// Incluye jslib como dependencia
(function () {
	include('jslib', function () {
		var n = document.getElementById('script_web-javascript');
		n._hasdep = false;
	});
})();

/**
Descarga un buffer como archivo
@example
downloadFile(buffer, 'logo.jpg');
*/
function downloadFile(buffer, fileName) {
    var url = window.URL.createObjectURL(buffer);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();    
    a.remove(); 
}

/**
Crea un formulario, hace submit de los datos y lo borra
Se puede usar para abrir una nueva ventana haciendo POST
@example
submitData({
	url: 'http://my.url.address/path',
	data: {
		param1: 'value1',
		param2: 'value2',
	},
	method: 'GET', // Opcional, default POST
	target: '_self', // Opcional, default _blank
});
*/
function submitData(options) {
	var opt = {
		method: 'POST',
		target: '_blank',
	}
	Object.assign(opt, options);

    var form = document.createElement('form');
    form.target = opt.target;
    form.method = opt.method;
    form.action = opt.url;
    form.style.display = 'none';

    for (var key in opt.data) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = opt.data[key];
        form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}


function logAndToast(pMsg, pToastOptions) {
    console.log(pMsg);
    toast(pMsg, pToastOptions);
}

/*
Requiere bootstrap 5 y jQuery
Muestra/oculta un spinner que tapa toda la pagina:

preloader.show();
preloader.hide();
*/
if (typeof jQuery != 'undefined') {
	var preloader = $('<div/>', {
		style: 'position:absolute; top:0; left:0; z-index:9999; display:none;',
	}).appendTo($('body'));
	preloader.css('background-color', $('body').css('background-color'));
	preloader.css('opacity', '0.5');
	preloader.append('<div style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);"><div class="spinner-border"></div></div>');
	preloader.on('show', function () {
		$(this).css({
			'height': $(document).height(),
			'width': $(document).width(),
		});
	})
}

function bootstrapVersion() {
	var ver, ret;
	try {
		if (typeof bootstrap == 'object') {
			ver = bootstrap.Button.VERSION;
		} else {
			ver = $.fn.button.Constructor.VERSION;
		}
		ret = ver.split('.').map(el => parseInt(el));
		return ret;

	} catch (er) {
		console.warn('Bootstrap not found');
	};
}

// Requiere bootstrap 5 y jQuery
function toast(pText, pOptions) {
	var bsver = bootstrapVersion();

	if (bsver[0] < 5) {
		console.warn('Bootstrap 5 es requerido para toast');
		alert(pText);
		return;
	};

    var opt = {
        autohide: true,
        delay: 3000,
        title: 'Cloudy CRM',
        subtitle: '',
        icon: 'https://cdn.cloudycrm.net/ghcv/cdn@66/img/favicon/favicon-32x32.png',
    }
    Object.assign(opt, pOptions);

    var $cont = $('.toast-container');
    if ($cont.length == 0) {
        $cont = $('<div/>', {
            class: 'toast-container p-3',
            style: 'position:fixed; top:15px; right:0; z-index: 2000;',
        }).appendTo($('body'));
    }

    var $toast = $('<div/>', {
        class: 'toast',
    }).appendTo($cont);

    var $th = $('<div/>', {
        class: 'toast-header',
    }).appendTo($toast);

	$('<img/>', {
		src: opt.icon,
		class: 'rounded me-2',
	}).appendTo($th);

	$('<strong/>', {
		class: 'me-auto',
	}).append(opt.title).appendTo($th);

	$('<small/>', {
		class: 'text-muted',
	}).append(opt.subtitle).appendTo($th);

	$('<button/>', {
		type: 'button',
		class: 'btn-close',
		'data-bs-dismiss': 'toast',
	}).appendTo($th);

    var $tb = $('<div/>', {
        class: 'toast-body',
    }).appendTo($toast);

    $tb.append(pText);

    var t = new bootstrap.Toast($toast, opt);

    $toast.on('hidden.bs.toast', function () {
        $(this).remove();
    });

    t.show()
}

function addInputButton(pControl, pIcon, pAction, pPrepend) {
	var esGroup = pControl.parent().hasClass('input-group');
	var div;
	
	if (esGroup) {
		div = pControl.parent();
	} else {
		div = $('<div/>').addClass('input-group');
		var newControl = pControl.clone();
		div.append(newControl);
		if (pControl.hasClass('selectpicker')) {
			pControl.selectpicker('destroy');
			newControl.selectpicker('render');
		}
	}
	
	var spanClass;
	var bsver = bootstrapVersion();
	if (bsver[0] == 3) {
		spanClass = 'input-group-addon add-on';
	} else if (bsver[0] >= 5) {
		spanClass = 'input-group-text';
	};

	var span = $('<span/>', {
		'class': spanClass,
		'style': 'cursor: pointer;',
	});
	span.append('<span class="' + pIcon + '"></span>');

	if (typeof(pAction) == 'function') {
		span.click(pAction);
	} else {
		span.attr('onclick', pAction);
	}
	
	if (pPrepend) {
		span.prependTo(div);
	} else {
		span.appendTo(div);
	};
	
	if (!esGroup) pControl.replaceWith(div);
	//return newControl ? newControl : pControl;
	return span;
}

function addPhoneButton(pControl) {
	addInputButton(pControl, 'fa fa-phone', 'window.open(\'tel:\' + $(\'#' + pControl.attr('id') + '\').val())');
}

function addWappButton(pControl) {
	addInputButton(pControl, 'fa fa-whatsapp', 'wappButtonClick(this)');
}

function wappButtonClick(pButton) {
	var url = wappUrl();
	var number = $(pButton).siblings('input[type="text"]').val();
	var w = window.open(url + 'send?phone=' + wappNumber(number));
	if (url == 'whatsapp://') setTimeout(function () { w.close() }, 10000);
}

function wappUrl() {
	var ret = sessionStorage.getItem('WhatsappURL');
	if (!ret) {
		if (window.confirm('Tiene instalado el cliente Whatsapp? (presione CANCELAR si usa Whatsapp Web)')) {
			ret = 'whatsapp://';
		} else {
			ret = 'https://web.whatsapp.com/';
		}
		sessionStorage.setItem('WhatsappURL', ret);
	}
	return ret;
}

function addEmailButton(pControl) {
	return addInputButton(pControl, 'fa fa-envelope', 'window.open(\'mailto:\' + $(\'#' + pControl.attr('id') + '\').val())');
}

function wappNumber(pPhone) {
	var ret = pPhone.replace(/[^0-9]/g, '');
	if (ret.length == 10) ret = '549' + ret;
	return ret;
}
