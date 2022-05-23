/*
Changelog:
2022-03-28: JP - getCookie
2022-01-11: JP - ChangeLog e Inventario de metodos

Funciones varias de JavaScript para la web (para el APP usar app7-global).

Inventario de metodos:

logAndToast(pMsg, pToastOptions)
getFolder(pFolder, pRootFolderId)
htmlEncode(pText)
sqlEncode(pValue, pType)
Eventos show y hide en jQuery
preloader
toast(pText, pOptions)
formatDate(pDate)
objPropCI(pObj, pProp, pCI)
getCookie(pName)
string.reverse()
encryptAsync(pString, pPass, pCallback)
decryptAsync(pString, pPass, pCallback)
insertAtCaret(pInput, pValue)
string.replaceAll(search, replacement)
addOption(ctl, option, value)
addInputButton(pControl, pIcon, pAction, pPrepend)
addPhoneButton(pControl)
addWappButton(pControl)
wappButtonClick(pButton)
wappUrl()
addEmailButton(pControl)
wappNumber(pPhone)
xmlDecodeDate(pDate)
xmlEncodeDate(pDate)
timeZone()
fechaTexto(pFecha, pSinAnio, pSinHora)
ISODate(pDate)
ISOTime(pDate, pSeconds)
leadingZeros(pString, pLength)
getDocField(pDoc, pFieldName)
errMsg(pErr)
*/

function logAndToast(pMsg, pToastOptions) {
    console.log(pMsg);
    toast(pMsg, pToastOptions);
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

function htmlEncode(pText) {
    var sp = document.createElement('span');
    sp.textContent = pText;
    return sp.innerHTML;
}

function sqlEncode(pValue, pType) {
    if (pValue == null) {
        return 'NULL';
    } else {
        if (pType == 1) {
            return '\'' + pValue.replaceAll('\'', '\'\'') + '\'';

        } else if (pType == 2) {
            var ret = ISODate(pValue);
            if (ret == null) {
                return 'NULL';
            } else {
                return '\'' + ret + ' ' + ISOTime(pValue, true) + '\''; 
            }

        } else if (pType == 3) {
            if (typeof pValue == 'number') {
                return pValue.toString();
            } else {
                var n = numeral(pValue).value();
                if (n != null) {
                    return n.toString();
                } else {
                    return 'NULL';
                }
            };

        } else {
            throw 'Unknown type: ' + pType;
        }
    };
}

/*
Agrega a jQuery soporte para eventos show y hide

elem.on('show', function () {
	// elem visible
})
*/
(function($) {
	$.each(['show', 'hide'], function(i, ev) {
		var el = $.fn[ev];
		$.fn[ev] = function() {
			this.trigger(ev);
			return el.apply(this, arguments);
		};
	});
})(jQuery);

/*
Requiere bootstrap 5
Muestra/oculta un spinner que tapa toda la pagina:

preloader.show();
preloader.hide();
*/
var preloader = $('<div/>', {
	style: 'position:absolute; top:0; left:0; z-index:9999; background-color:rgb(255,255,255,0.5); display:none;',
}).appendTo($('body'));
preloader.append('<div style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);"><div class="spinner-border"></div></div>');
preloader.on('show', function () {
	$(this).css({
		'height': $(document).height(),
		'width': $(document).width(),
	});
})

// Requiere bootstrap 5
function toast(pText, pOptions) {
	var bsver = $.fn.tooltip.Constructor.VERSION.split('.').map(el => parseInt(el));

	if (bsver[0] < 5) {
		console.log('Bootstrap 5 es requerido para toast');
		return;
	};

    var opt = {
        autohide: true,
        delay: 3000,
        title: 'Cloudy CRM',
        subtitle: '',
        icon: 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@66/img/favicon/favicon-32x32.png',
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

function formatDate(pDate) {
    var dt, ret;
    if (Object.prototype.toString.call(pDate) === '[object Date]') {
        dt = pDate;
    } else {
        dt = new Date(pDate);
    }
    if (dt != 'Invalid Date') {
        ret = dt.toLocaleDateString()
        var t = ISOTime(dt);
        if (t != '00:00') ret += ' ' + t;
        return ret;
    } else {
        return 'Invalid Date';
    }
}

// Devuelve una property de un objeto (Case Insensitive)
function objPropCI(pObj, pProp) {
    var keys = Object.keys(pObj);
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].toLowerCase() == pProp.toLowerCase()) {
            return pObj[keys[i]];
        }
    }
}

function getCookie(pName) {
	var cookies = decodeURIComponent(document.cookie).split('; ');
	var key = pName + '=';
	var ret;
	cookies.forEach(val => {
		if (val.indexOf(key) === 0) {
			ret = val.substring(key.length);
		}
	})
	return ret;
}

// string.reverse
if (typeof String.prototype.reverse !== 'function') {
	String.prototype.reverse = function () {
		return this.split('').reverse().join('');
	};
}

// CryptoJS
// https://code.google.com/archive/p/crypto-js/
// https://stackoverflow.com/questions/18279141/javascript-string-encryption-and-decryption
function encryptAsync(pString, pPass, pCallback) {
	include('lib-cryptojs-aes', function () {
		if (pCallback) {
			pCallback(CryptoJS.AES.encrypt(pString, pPass).toString());
		}
	})
}
function decryptAsync(pString, pPass, pCallback) {
	include('lib-cryptojs-aes', function () {
		if (pCallback) {
			pCallback(CryptoJS.AES.decrypt(pString, pPass).toString(CryptoJS.enc.Utf8));
		}
	})
}

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
	String.prototype.replaceAll = function (search, replacement) {
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
	var bsver = $.fn.tooltip.Constructor.VERSION.split('.').map(el => parseInt(el));
	if (bsver[0] == 3) {
		spanClass = 'input-group-addon add-on';
	} else if (bsver[0] >= '5') {
		spanClass = 'input-group-text';
	};

	var span = $('<span/>', {
		'class': spanClass,
		'style': 'cursor: pointer;',
		'onclick': pAction,
	});
	span.append('<span class="' + pIcon + '"></span>');
	
	if (pPrepend) {
		span.prependTo(div);
	} else {
		span.appendTo(div);
	};
	
	if (!esGroup) pControl.replaceWith(div);
	return newControl ? newControl : pControl;
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
	var ret = pPhone.replace(/\+| |\(|\)|-/g, '');
	if (ret.length == 10) ret = '549' + ret;
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
	if (pFecha.valueOf() > 0) {
		var ret = pFecha.getDate() + '/' + (pFecha.getMonth() + 1)
		if (!pSinAnio) ret += '/' + pFecha.getFullYear().toString().slice(-2);
		if (!pSinHora) ret += ' ' + ISOTime(pFecha);
		return ret;
	} else {
		return '';
	}
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
