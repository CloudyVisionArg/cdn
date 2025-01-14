/*
jslib
Funciones varias de JavaScript para web y app

Inventario de metodos:

tabClick(ev)
numbersOnly(pText)
sheetFuncs (sheet)
isObject(value)
accountsSearch(filter, order, forceOnline)
getCache(pKey)
setCache(pKey, pValue, pSeconds)
fileSize(size)
asyncLoop(iterations, func, callback)
getFolder(pFolder, pRootFolderId)
htmlEncode(pText)
sqlEncode(pValue, pType)
jQuery: soporte para eventos show y hide
formatDate(pDate, pOptions)
fechaTexto(pFecha, pSinAnio, pSinHora)
objPropCI(pObj, pProp)
getCookie(pName)
string.reverse
string.repeat
encryptAsync(pString, pPass, pCallback)
decryptAsync(pString, pPass, pCallback)
insertAtCaret(pInput, pValue)
insertAtCursor(pInput, pValue)
string.replaceAll
addOption(ctl, option, value)
xmlDecodeDate(pDate)
xmlEncodeDate(pDate)
timeZone()
cDate(pDate)
ISODate(pDate)
ISOTime(pDate, pSeconds)
leadingZeros(pString, pLength)
getDocField(pDoc, pFieldName)
errMsg(pErr)
*/

/**
Convierte un elemento en zoomeable con hammer
Soporta pinch, pan y doubletap
*/
async function hammerIt(elm) {
    await include([
        { id: 'hammer', src: 'https://hammerjs.github.io/dist/hammer.js' },
    ]);

    let hammertime = new Hammer(elm, {});
    hammertime.get('pinch').set({
        enable: true
    });
    var posX = 0,
        posY = 0,
        scale = 1,
        last_scale = 1,
        last_posX = 0,
        last_posY = 0,
        max_pos_x = 0,
        max_pos_y = 0,
        transform = "",
        el = elm;

    hammertime.on('doubletap pan pinch panend pinchend', function(ev) {
        if (ev.type == "doubletap") {
            transform =
                "translate3d(0, 0, 0) " +
                "scale3d(2, 2, 1) ";
            scale = 2;
            last_scale = 2;
            try {
                if (window.getComputedStyle(el, null).getPropertyValue('-webkit-transform').toString() != "matrix(1, 0, 0, 1, 0, 0)") {
                    transform =
                        "translate3d(0, 0, 0) " +
                        "scale3d(1, 1, 1) ";
                    scale = 1;
                    last_scale = 1;
                }
            } catch (err) {}
            el.style.webkitTransform = transform;
            transform = "";
        }

        //pan    
        if (scale != 1) {
            posX = last_posX + ev.deltaX;
            posY = last_posY + ev.deltaY;
            max_pos_x = Math.ceil((scale - 1) * el.clientWidth / 2);
            max_pos_y = Math.ceil((scale - 1) * el.clientHeight / 2);
            if (posX > max_pos_x) {
                posX = max_pos_x;
            }
            if (posX < -max_pos_x) {
                posX = -max_pos_x;
            }
            if (posY > max_pos_y) {
                posY = max_pos_y;
            }
            if (posY < -max_pos_y) {
                posY = -max_pos_y;
            }
        }


        //pinch
        if (ev.type == "pinch") {
            scale = Math.max(.999, Math.min(last_scale * (ev.scale), 4));
        }
        if(ev.type == "pinchend"){last_scale = scale;}

        //panend
        if(ev.type == "panend"){
            last_posX = posX < max_pos_x ? posX : max_pos_x;
            last_posY = posY < max_pos_y ? posY : max_pos_y;
        }

        if (scale != 1) {
            transform =
                "translate3d(" + posX + "px," + posY + "px, 0) " +
                "scale3d(" + scale + ", " + scale + ", 1)";
        }

        if (transform) {
            el.style.webkitTransform = transform;
        }
    });
}

/**
Esta funcion se utiliza para seleccionar el tab correspondiente a
un nav clickeado.
Soporta tabs de Bootstrap 5.3 y Framework7 7.0.
Tanto los navs como los tabs deben estar dentro de un contenedor 
con la clase doors-control-container.
Evita el uso de IDs en los tabs.
La funcion activara el tab que se encuentra en el mismo order index
que el nav clickeado.

@example
$tabs.find('.nav-link').on('click', tabClick); // Web
$tabs.find('.tab-link').on('click', tabClick); // App
*/
function tabClick(ev) {
    let $this = $(ev.currentTarget);
    
    if (typeof app7 == 'object') { // App
        let ix = $this.index();
        let $root = $this.closest('.doors-control-container');
        $root.find('.tab-link-active').removeClass('tab-link-active');
        $root.find('.tab-active').removeClass('tab-active');
        $root.find('.tab-link').eq(ix).addClass('tab-link-active');
        app7.toolbar.setHighlight($root.find('.toolbar')[0]);
        $root.find('.tab').eq(ix).addClass('tab-active');

    } else { // Web
        let ix = $this.parent().index();
        let $root = $this.closest('.doors-control-container');
        $root.find('.active').removeClass('active');
        $root.find('.show').removeClass('show');
        $root.find('.nav-link').eq(ix).addClass('active');
        $root.find('.tab-pane').eq(ix).addClass('show active');
    }
};

/**
 * Quita todos los caracteres que no sean numeros
 * @param {*} pText 
 * @returns 
 */
function numbersOnly(pText) {
	return pText.replace(/\D/g, '');
}

/*
Funciones que facilitan el barrido de una hoja excel
*/
function sheetFuncs (sheet) {
    sheet._range = XLSX.utils.decode_range(sheet['!ref']);

    sheet._rangeRows = function () {
        return this._range.e.r - this._range.s.r + 1;
    };

    sheet._rangeCols = function () {
        return this._range.e.c - this._range.s.c + 1;
    }

    //Devuelve un objeto cell https://docs.sheetjs.com/docs/csf/cell
    sheet._rangeCells = function (r, c) {
        return this[XLSX.utils.encode_cell({
            r: r + this._range.s.r,
            c: c + this._range.s.c,
        })];
    }

    //Devuelve el .v de un cell, validando ya si es undefined https://github.com/SheetJS/sheetjs/issues/1600
    sheet._rangeCellsV = function (r, c) {
        let cell = this._rangeCells(r, c);
        return cell ? cell.v : undefined;
    }
};

/*
Retorna true si value es un objeto {}
*/
function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}

/*
forceOnline se utiliza solo en el APP. Pasar true en caso que accounts
este sincronizado y se necesite una busqueda online
*/
function accountsSearch(filter, order, forceOnline) {
    return new Promise(function (resolve, reject) {
        var key = 'accountsSearch|' + filter + '|' + order;
        var cache = getCache(key);
        if (cache != undefined) {
            cache.then(resolve, reject);

        } else {
            if (typeof(cordova) != 'object' || forceOnline) {
                onlineSearch();

            } else {
                sync.tableExist('accounts', function (res) {
                    if (res) {
                        sync.getDbFields('accounts', function (cols) {
                            // Delimita los campos con doble comilla
                            var arr = [];
                            for (var i = 0; i < cols.length; i++) {
                                arr.push('\\b' + cols[i].name + '\\b');
                            }
                            // Este regExp reemplaza palabras completas fuera de comillas
                            var regEx = new RegExp('(' + arr.join('|') + ')(?=(?:[^\']|\'[^\']*\')*$)', 'gi');
                            // con la misma palabra delimitada con doble comilla
                            var rep = '"$&"';

                            var sql = 'select * from accounts';
                            if (filter) sql += ' where ' + filter.replace(regEx, rep);
                            if (order) sql += ' order by ' + order.replace(regEx, rep);
                            dbRead(sql, [],
                                function (rs) {
                                    resolve(convertSqliteAccounts(rs));
                                },
                                function (err) {
                                    reject(err);
                                }
                            )
                        });

                    } else {
                        onlineSearch();
                    }
                });
            }

            function onlineSearch() {
                cache = dSession.directory.accountsSearch(filter, order);
                setCache(key, cache, 60); // Cachea por 60 segundos
                cache.then(resolve, reject);
            }
        }
    });
}

/*
Cache de uso gral
setCache('myKey', myValue, 60); // Almacena por 60 segundos
myVar = getCache('myKey'); // Obtiene el valor almacenado en el cache, devuelve undefined si no esta o expiro
*/
function getCache(pKey) {
    if (Array.isArray(getCache._cache)) {
        let f = getCache._cache.find(el => el.key == pKey);
        if (f) {
            if (!f.expires || f.expires > Date.now()) {
                console.log('Cache hit: ' + pKey);
                return f.value;
            }
        }
    }
}

function setCache(pKey, pValue, pSeconds) {
    if (!Array.isArray(getCache._cache)) getCache._cache = [];

    var exp, sec = parseInt(pSeconds);
    if (!isNaN(sec)) {
        exp = Date.now() + sec * 1000;
    } else {
        exp = Date.now() + 300000; // 5' por defecto
    }
    let f = getCache._cache.find(el => el.key == pKey);
    if (f) {
        f.value = pValue;
        f.expires = exp;
    } else {
        getCache._cache.push({ key: pKey, value: pValue, expires: exp });
    }
}

/*
Convierte un nro de bytes en un texto con la unidad conveniente
*/
function fileSize(size) {
    var cutoff, i, selectedSize, selectedUnit;
    var units = ['Tb', 'Gb', 'Mb', 'Kb', 'b'];

    for (i = 0; i < units.length; i++) {
        cutoff = Math.pow(1024, 4 - i);
        if (size + 1 >= cutoff) {
            selectedSize = size / cutoff;
            selectedUnit = units[i];
            break;
        }
    }
    selectedSize = Math.round(10 * selectedSize) / 10;
    return selectedSize + ' ' + selectedUnit;
};

/*
Loop asincrono, utilizar cuando dentro del loop tengo llamadas asincronas
que debo esperar antes de realizar la prox iteracion. Si en iterations
paso undefined, se repite el loop hasta loop.break()

asyncLoop(10,
    function (loop) {
        console.log(loop.iteration());
        setTimeout(function () {
            loop.next();
        }, 0);
        
        //loop.break(); // Para finalizar el loop
    },
    function() {
        console.log('cycle ended')
    }
);
*/
function asyncLoop(iterations, loopFunc, callback) {
	var index = 0;
	var done = false;
	var loop = {
	    next: function() {
	        if (done) return;
	
	        if (iterations == undefined || index < iterations) {
	            index++;
	            loopFunc(loop);
	        } else {
	            done = true;
	            if (callback) callback();
	        }
	    },
	
	    iteration: function() {
        	return index - 1;
	    },
	
	    break: function() {
	        done = true;
	        if (callback) callback();
	    }
	};
	loop.next();
	return loop;
}

// Implementado en dSession.folder (usar ese) 
async function getFolder(pFolder, pCurrentFolderId) {
    return (await dSession.folder(pFolder, pCurrentFolderId)).toJSON();
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
if (typeof jQuery != 'undefined') {
    (function($) {
        $.each(['show', 'hide'], function(i, ev) {
            var el = $.fn[ev];
            $.fn[ev] = function() {
                this.trigger(ev);
                return el.apply(this, arguments);
            };
        });
    })(jQuery);
}

function formatDate(pDate, pOptions) {
    var dt, ret, opt;

    var opt = {
        year: true,
        hour: true,
        shortYear: false,
    };
    Object.assign(opt, pOptions);

    if (Object.prototype.toString.call(pDate) === '[object Date]') {
        dt = pDate;
    } else {
        dt = new Date(pDate);
    }
    if (dt != 'Invalid Date') {
        if (opt.year && !opt.shortYear) {
            ret = dt.toLocaleDateString();
        } else {
            var ret = dt.getDate() + '/' + (dt.getMonth() + 1);
            if (opt.year) {
                let y = dt.getFullYear().toString();
                if (opt.shortYear) y = y.slice(-2);
                ret += '/' + y;
            }
        }
        if (opt.hour) {
            var t = ISOTime(dt);
            if (t != '00:00') ret += ' ' + t;
        }
        return ret;

    } else {
        return 'Invalid Date';
    }
}

function fechaTexto(pFecha, pSinAnio, pSinHora) {
    return formatDate(pFecha, { year: !pSinAnio, hour: !pSinHora });
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

// Alias
function insertAtCursor(pInput, pValue) {
    insertAtCaret(pInput, pValue)
}

// string.replaceAll
if (typeof String.prototype.replaceAll !== 'function') {
	String.prototype.replaceAll = function (search, replacement) {
		var target = this;
		return target.replace(new RegExp(search, 'g'), replacement);
	};
}

// string.repeat
if (typeof String.prototype.repeat !== 'function') {
	String.prototype.repeat = function (count) {
        var target = this;
        var ret = '';
        for (var i = 0; i < count; i++) {
            ret += target;
        }
		return ret;
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

/**
 * Convierte a Date
 * @param {*} pDate 
 * @returns 
 */
function cDate(pDate) {
    var dt;
    if (pDate == null || pDate == undefined) return null;
    
    if (Object.prototype.toString.call(pDate) === '[object Date]') {
        dt = pDate;
    } else {
        dt = moment(pDate, 'L LTS').toDate(); // moment con locale
        if (isNaN(dt.getTime())) dt = moment(pDate).toDate(); // moment sin locale
        if (isNaN(dt.getTime())) dt = new Date(pDate); // nativo
    }
    if(!isNaN(dt.getTime())) {
        return dt;
    } else {
        return null;
    }
}

/**
 * Devuelve la fecha en formato YYYY-MM-DD
 * @param {*} pDate 
 * @returns 
 */
function ISODate(pDate) {
    var dt = cDate(pDate);
	if (dt) {
        return dt.getFullYear() + '-' + leadingZeros(dt.getMonth() + 1, 2) + '-' +
            leadingZeros(dt.getDate(), 2);
	} else {
        return null;
	}
}

/**
 * Devuelve la hora en formato HH:MM:SS
 * @param {*} pDate 
 * @param {*} pSeconds 
 * @returns 
 */
function ISOTime(pDate, pSeconds) {
    var dt = cDate(pDate);
	if (dt) {
        return leadingZeros(dt.getHours(), 2) + ':' + leadingZeros(dt.getMinutes(), 2) +
            (pSeconds ? ':' + leadingZeros(dt.getSeconds(), 2) : '');
	} else {
        return null;
	}
}

/**
 * Completa con ceros a la izquierda
 * @param {*} pString 
 * @param {*} pLength 
 * @returns 
 */
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
// Deprecado, usar dSession.utils.errMsg
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
            return 'XHRError (readyState: ' + pErr.xhr.readyState 
                + ', status: ' + pErr.xhr.status + ' - ' + pErr.xhr.statusText + ')';
        }
    }
    return JSON.stringify(pErr);
}
