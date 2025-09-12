/*
jslib
Funciones varias de JavaScript para web y app

Inventario de metodos:

mimeType(filename)
validEmail(value)
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
highlightControl(pControlId)
*/

/**
Devuelve el mime-type a partir del nombre del archivo
*/
function mimeType(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes = {
        // Imágenes
        'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
        'gif': 'image/gif', 'webp': 'image/webp', 'svg': 'image/svg+xml',
        'bmp': 'image/bmp', 'ico': 'image/x-icon',

        // Audio
        'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'ogg': 'audio/ogg',
        'm4a': 'audio/mp4', 'flac': 'audio/flac',

        // Video
        'mp4': 'video/mp4', 'webm': 'video/webm', 'avi': 'video/x-msvideo',
        'mov': 'video/quicktime', 'wmv': 'video/x-ms-wmv',

        // Documentos
        'pdf': 'application/pdf',
        'txt': 'text/plain', 'html': 'text/html', 'css': 'text/css',
        'js': 'text/javascript', 'json': 'application/json',
        'xml': 'application/xml',

        // Office
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };

    return mimeTypes[ext] || 'application/octet-stream';
}

/**
Valida que la direccion de email sea correcta
*/
function validEmail(value) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(value).toLowerCase());
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

// Resalta un control en la interfaz dado un id de control
function highlightControl(targetSelector) {
    if (!targetSelector || targetSelector.trim() === "") return;

    let $target = $("#" + targetSelector);
    if (!$target.length) $target = $("#" + targetSelector.toLowerCase());
    
    if (!$target.length && !inApp) {
        const ctl = controls.find(item => 
            item.XMLATTRIBUTES &&
            (
                item.XMLATTRIBUTES.textfield?.toLowerCase() === targetSelector.toLowerCase() ||
                item.XMLATTRIBUTES.valuefield?.toLowerCase() === targetSelector.toLowerCase()
            )
        )?.NAME;

        if (ctl) $target = $("#" + ctl);
    }
    
    if (!$target.length) return;

    if ($target.is("textarea") && CKEDITOR.instances[$target.attr("id")]) {
        $target = $target.siblings("div[id^='cke_']");
    }

    const continuar = () => {
        setTimeout(() => {
            if (inApp) {
                // Framework7 scroll
                $target[0].scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                // Web con Bootstrap
                const elementTop = $target.offset().top;
                const elementHeight = $target.outerHeight();
                const windowHeight = $(window).height();
                const scrollToPos = elementTop - (windowHeight / 2) + (elementHeight / 2);
                $("html, body").animate({ scrollTop: scrollToPos }, 600);
            }

            // 🔴 Resetear highlights anteriores
            $(".highlighted-parent")
                .css({ outline: "", borderRadius: "", transition: "" })
                .removeClass("highlighted-parent");

            // 🟢 Aplicar highlight al nuevo
            const $parent = $target.parent();
            $parent.addClass("highlighted-parent").focus().css({
                outline: "2px solid red",
                transition: "outline 0.3s ease-in-out",
                borderRadius: "6px"
            });

            // Quitar highlight a los 3 segundos
            setTimeout(() => {
                $parent.css({ outline: "", borderRadius: "", transition: "" })
                .removeClass("highlighted-parent");
            }, 3000);

        }, 100);
    };

    if (inApp) {
        // Framework7
        const $tabPane = $target.closest(".tab");
        if ($tabPane.length && !$tabPane.hasClass("tab-active")) {
            const tabId = "#" + $tabPane.attr("id");
            const $tabLink = $(`.tab-link[href$="${tabId}"]`);
            if ($tabLink.length) {
                const fullHref = $tabLink.attr("href"); 		

                app7.tab.show(fullHref, true);			

                // Esperar a que se muestre el tab
                $tabPane.one("tab:show", continuar);
            } else {
                continuar();
            }
        } else {
            continuar();
        }

        const $collapsibles = $target.parents(".accordion-item");
        if ($collapsibles.length) {
            let total = $collapsibles.length;
            let done = 0;
            $collapsibles.each(function () {
                const $col = $(this);
                if ($col.hasClass("accordion-item-opened")) {
                    done++;
                    if (done === total) continuar();
                } else {
                    $col.one("accordion:opened", function () {
                        done++;
                        if (done === total) continuar();
                    });
                    app7.accordion.open($col[0]);
                }
            });
        } else {
            continuar();
        }

    } else {
        // Bootstrap Web
        const $tabPane = $target.closest(".tab-pane");
        const tabSelector = $tabPane.length ? "#" + $tabPane.attr("id") : null;
        const $tabLink = tabSelector
            ? $('[data-bs-toggle="tab"][href="' + tabSelector + '"], [data-bs-toggle="tab"][data-bs-target="' + tabSelector + '"]')
            : $();

        const $collapsibles = $target.parents(".collapse");
        let totalToWait = $collapsibles.length;
        let expandedCount = 0;

        const expandCollapsibles = () => {
            if (totalToWait === 0) { continuar(); return; }
            $collapsibles.each(function () {
                const $col = $(this);
                if ($col.hasClass("show")) {
                    expandedCount++;
                    if (expandedCount === totalToWait) continuar();
                } else {
                    $col.one("shown.bs.collapse", function () {
                        expandedCount++;
                        if (expandedCount === totalToWait) continuar();
                    });
                    const el = $col[0];
                    const instance = bootstrap.Collapse.getOrCreateInstance(el, { toggle: false });
                    instance.show();
                }
            });
        };

        const activarTabSiEsNecesario = () => {
            if (!tabSelector || !$tabLink.length) { expandCollapsibles(); return; }
            const isTabAlreadyActive = $tabLink.hasClass("active");
            if (isTabAlreadyActive) {
                expandCollapsibles();
            } else {
                $tabLink[0].addEventListener("shown.bs.tab", function () { expandCollapsibles(); });
                const tab = new bootstrap.Tab($tabLink[0]);
                tab.show();
            }
        };

        activarTabSiEsNecesario();
    }
}