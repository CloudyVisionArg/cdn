// Inserta pValue en pInput, en la posicion del cursor 
function insertAtCaret(pInput, pValue) {
	try {
		var inp = $(pInput)[0];
		if (document.all && inp.createTextRange && inp.caretPos) {
			var cPos = inp.caretPos;
			cPos.text = '' == cPos.text.charAt(cPos.text.length - 1) ? pValue + '' : pValue
		} else if (inp.setSelectionRange) {
			var selStart = inp.selectionStart,
				selEnd = inp.selectionEnd,
				left = inp.value.substring(0, selStart),
				right = inp.value.substring(selEnd);
			inp.value = left + pValue + right;
			var len = pValue.length;
			inp.setSelectionRange(selStart + len, selStart + len);
			//inp.blur()
		} else {
			inp.value += pValue;
		}
		inp.focus();
		$(pInput).change();
	} catch (err) {
		debugger;
	}
}	

// string.replaceAll
if (typeof String.prototype.replaceAll !== 'function') {
	String.prototype.replaceAll = function(search, replacement) {
		var target = this;
		return target.replace(new RegExp(search, 'g'), replacement);
	};
}

function addOption(ctl, option, value) {
	var opt = document.createElement('option');
	if (value != undefined) {
		opt.value = value;
	} else {
		if (option == '(ninguno)') {
			opt.value = '[NULL]';
		} else {
			opt.value = option;
		}
	}
	opt.innerHTML = option;
	ctl.appendChild(opt);
	return opt;
}

function addPhoneButton(pControl) {
	addInputButton(pControl, 'fa fa-phone', 'window.open(\'tel:\' + $(\'#' + pControl.attr('id') + '\').val())');
}

function addWappButton(pControl) {
	if (window.WhatsappURL == undefined) {
		if (window.confirm('Tiene instalado el cliente Whatsapp? (presione CANCELAR si usa Whatsapp Web)')) {
			debugger;
			window.WhatsappURL = 'whatsapp://send';
		} else {
			window.WhatsappURL = 'https://web.whatsapp.com/send';
		}
	}
	//addInputButton(pControl, 'fa fa-whatsapp', 'window.open(\'https://api.whatsapp.com/send?phone=\' + wappNumber($(\'#' + pControl.attr('id') + '\').val()))');
	addInputButton(pControl, 'fa fa-whatsapp', 'window.open(\'whatsapp://send?phone=\' + wappNumber($(\'#' + pControl.attr('id') + '\').val()))');
}

function addEmailButton(pControl) {
	return addInputButton(pControl, 'fa fa-envelope', 'window.open(\'mailto:\' + $(\'#' + pControl.attr('id') + '\').val())');
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
	
	var span = $('<span/>', {
		'class': 'input-group-addon add-on',
		'style': 'cursor: pointer;',
		'onclick': pAction,
	});
	span.append('<span class="' + pIcon + '"></span></span>');
	
	if (pPrepend) {
		span.prependTo(div);
	} else {
		span.appendTo(div);
	};
	
	if (!esGroup) pControl.replaceWith(div);
	return span;
}

function wappNumber(pPhone) {
	var ret = pPhone.replace(/\+| |\(|\)|-/g, '');
	if (ret.length == 10) ret = '54' + ret;
	return ret;
}

function xmlDecodeDate(pDate) {
	return new Date(pDate.replace(' ', 'T') + timeZone());
}

function xmlEncodeDate(pDate) {
	var d = ISODate(pDate);
	if (d) {
		return d + ' ' + ISOTime(pDate);
	} else {
		return null;
	}	
}

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

function fechaTexto(pFecha, pSinAnio, pSinHora) {
	var ret = pFecha.getDate() + '/' + (pFecha.getMonth() + 1)
	if (!pSinAnio) ret += '/' + pFecha.getFullYear().toString().slice(-2);
	if (!pSinHora) ret += ' ' + ISOTime(pFecha);
	return ret;
}

function ISODate(pDate) {
    var dt;
    if (Object.prototype.toString.call(pDate) === '[object Date]') {
        dt = pDate;
    } else {
        dt = new Date(pDate);
    }
    if(!isNaN(dt.getTime())) {
        return dt.getFullYear() + '-' + leadingZeros(dt.getMonth() + 1, 2) + '-' +
            leadingZeros(dt.getDate(), 2);
    } else {
        return null;
    }
}

function ISOTime(pDate, pSeconds) {
    if (Object.prototype.toString.call(pDate) === '[object Date]') {
        dt = pDate;
    } else {
        var dt = new Date(pDate);
    }
    if(!isNaN(dt.getTime())) {
        return leadingZeros(dt.getHours(), 2) + ':' + leadingZeros(dt.getMinutes(), 2) +
            (pSeconds ? ':' + leadingZeros(dt.getSeconds(), 2) : '');
    } else {
        return null;
    }
}

function leadingZeros(pString, pLength) {
    return ('0'.repeat(pLength) + pString).slice(-pLength);
}

// Busca y devuelve un Field
function getDocField(pDoc, pFieldName) {
    var fie, i;
    for (i = 0; i < pDoc.CustomFields.length; i++) {
        fie = pDoc.CustomFields[i];
        if (fie['Name'].toLowerCase() == pFieldName.toLowerCase()) {
            return fie;
        }
    }
    for (i = 0; i < pDoc.HeadFields.length; i++) {
        fie = pDoc.HeadFields[i];
        if (fie['Name'].toLowerCase() == pFieldName.toLowerCase()) {
            return fie;
        }
    }
    return null;
}

// Devuelve el mensaje de un objeto err
function errMsg(pErr) {
    if (typeof(pErr) == 'string') {
        return pErr;
    } else if (typeof(pErr) == 'object') {
        if (pErr instanceof Error) {
            return pErr.constructor.name + ': ' + pErr.message;
        } else if (pErr.constructor.name == 'SQLError') {
            return 'SQLError {code: ' + pErr.code + ', message: \'' + pErr.message + '\'}';
        } else if (pErr.ExceptionMessage) {
            // error de Doors
            return pErr.ExceptionMessage;            
        } else if (pErr.xhr) {
            return 'Error de conexion (readyState: ' + pErr.xhr.readyState 
                + ', status: ' + pErr.xhr.status + ' - ' + pErr.xhr.statusText + ')';
        }
    }
    return JSON.stringify(pErr);
}
