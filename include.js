/*
include permite cargar una biblioteca Javascript o CSS en forma dinamica.
La funcion verifica si la biblioteca ya esta cargada, en cuyo caso omite la repeticion.

Ej:

	include('emojis');
	
	include('emojis', function () {
		// emojis loaded
	});
	
Tambien puedo verificar si la biblioteca se termino de cargar con el metodo scriptLoaded:

	scriptLoaded('emojis', function () {
		// emojis loaded
	});

O mediante el metodo loaded del elemento script (hay que poner el prefijo script_)

	document.getElementById('script_emojis').loaded(function () {
		// emojis loaded
	});

Puedo especificar la version (tag del commit)

	include('emojis', 15, function () {
		// emojis v15 loaded
	});

U obtener el ultimo commit, sin caches, pidiendo la version 0

	include('emojis', 0, function () {
		// emojis last commit loaded
	});

Puedo usarlo para mis propios script especificando el src:

	include('myScript', 'http://path/to/my/script.js', function () {
		// myScript loaded
	});

Tambien puedo armar un array de includes y cargarlos todos juntos:

	var scripts = [];
	scripts.push({ id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' });
	scripts.push({ id: 'font-awesome', src: '/c/themes/default/css/font-awesome.min.css' });
	scripts.push({ id: 'app7-doorsapi', depends: ['jquery'] }); // No se carga hasta que este cargado jquery
	scripts.push({ id: 'javascript', version: 0 });
	
	include(scripts, function () {
		// all scripts loaded
	});

Si el src termina en '.css' se creara un <link>, sino un <script>
*/

// Scripts registrados
function registeredScripts() {
	var scripts = [];

	scripts.push({ id: 'dsession', path: '/dsession.js', version: 67 });
	scripts.push({ id: 'lib-moment', path: '/lib/moment.min.js', version: 66 });
	scripts.push({ id: 'web-controls', path: '/web/controls.js', version: 0 });
	scripts.push({ id: 'web-generic', path: '/web/generic.js', version: 0 });
	scripts.push({ id: 'lib-numeral', path: '/lib/numeral/numeral.min.js', version: 59 });
	scripts.push({ id: 'lib-numeral-locales', path: '/lib/numeral/locales.min.js', version: 59 });
	scripts.push({ id: 'web-javascript', path: '/web/javascript.js', version: 57 });
	scripts.push({ id: 'whatsapp', path: '/wapp/wapp.js', version: 60 });
	scripts.push({ id: 'whatsapp-css', path: '/wapp/wapp.css', version: 56 });
	scripts.push({ id: 'lib-cryptojs-aes', path: '/lib/crypto-js/aes.js', version: 55 });
	scripts.push({ id: 'lib-qrcode', path: 'lib/qrcode.js', version: 55 });
	scripts.push({ id: 'app7-global', path: '/app7/global.js', version: 49 });
	scripts.push({ id: 'app7-controls', path: '/app7/controls.js', version: 48 });
	scripts.push({ id: 'app7-explorer', path: '/app7/explorer.js', version: 47 });
	scripts.push({ id: 'app7-generic', path: '/app7/generic.js', version: 44 });
	scripts.push({ id: 'app7-sync', path: '/app7/sync.js', version: 41 });
	scripts.push({ id: 'app7-doorsapi', path: '/app7/doorsapi.js', version: 36 });
	scripts.push({ id: 'emojis', path: '/emojis.js', version: 20 });
	scripts.push({ id: 'maps', path: '/maps.js', version: 20 });

	// Backward compatibility
	scripts.push({ id: 'app7-dsession', path: '/dsession.js', version: 41 });
	scripts.push({ id: 'javascript', path: '/web/javascript.js', version: 57 });
	scripts.push({ id: 'qrcode', path: 'lib/qrcode.js', version: 55 });

	return scripts;
}

/*
Argumentos:
0:
	- string -> Id del script
	- array -> Inclusion multiple [{ id, version / src, depends[id] }] (version se considera antes que src)
1: 
	- string -> SRC del script custom
	- number -> Version (0 = lastCommit)
	- function -> Callback
2:
	- function -> Callback
*/

function include() {
	var src, pSrc, pVer, pCallback;
	var scripts = registeredScripts();

    if (Array.isArray(arguments[0])) {
        let arrScr = arguments[0];
        pCallback = arguments[1];

        // Itera el array y carga todos los scripts
        arrScr.forEach(function (el, ix) {
            if (el.depends) {
                // Tiene dependencias, hay que esperar que se carguen
                el.depends.forEach(function (el2, ix2) {
                    setTimeout(function wait() {
                        if (arrScr.find(el3 => el3.id == el2 && !el3.loaded)) {
                            setTimeout(wait, 100);
                        } else {
                            includeEl(el);
                        }
                    }, 0)
                })
            } else {
                includeEl(el);
            }
        });

        function includeEl(pEl) {
            if (typeof pEl.version == 'number') {
                include(pEl.id, pEl.version, function () {
                    pEl.loaded = true;
                })
            } else {
                include(pEl.id, pEl.src, function () {
                    pEl.loaded = true;
                })
            }
        }

        // Espera a que terminen de cargar todos y hace callback
        setTimeout(function wait() {
            if (arrScr.find(el => !el.loaded)) {
                setTimeout(wait, 100)
            } else {
                if (pCallback) pCallback();
            }
        }, 0);

    } else if (typeof arguments[0] == 'string') {
        var pId = arguments[0].toLowerCase();

        if (typeof arguments[1] == 'string') {
            pSrc = arguments[1];
        } else if (typeof arguments[1] == 'number') {
            pVer = arguments[1]
        } else if (typeof arguments[1] == 'function') {
            pCallback = arguments[1];
        }

        if (typeof arguments[2] == 'function') {
            pCallback = arguments[2];
        }

        var src = scriptSrc(pId, pVer);
        if (!src) {
            if (pSrc) {
                src = pSrc;
            } else {
                throw pId + ' not registered and no src specified';
            }
        }

        if (src) {
			var scriptNode = document.getElementById('script_' + pId);
            if (!scriptNode) {
                var D = document;
                
				if (src.substring(src.length - 4).toLowerCase() == '.css') {
					scriptNode = D.createElement('link');
					scriptNode.rel = 'stylesheet';
					scriptNode.href = src;
				} else {
					scriptNode = D.createElement('script');
					scriptNode.type = 'text/javascript';
					scriptNode.async = true;
					scriptNode.src = src;
				}
                scriptNode.id = 'script_' + pId;
                
                scriptNode.loaded = function (callback) {
                    var self = this;
                    var waiting = 0;
                    var interv = setInterval(function () {
                        waiting += 10;
                        if (self._loaded  || waiting > 3000) {
                            clearInterval(interv);
                            if (callback) callback(self);
                            if (waiting > 3000) console.log('include(' + pId + ') timeout');
                            
                            /* Cuando se esta depurando y hay un debugger en la carga de la pagina,
                            el evento load no se dispara, en ese caso loaded llama igual al
                            callback luego de 3 segundos */
                        }
                    }, 10)
                };
                
                scriptNode.addEventListener('load', function () {
                    this._loaded = true;
                });

                var cont = D.getElementsByTagName('head')[0] || D.body || D.documentElement;
                cont.appendChild(scriptNode);

                if (pCallback) scriptNode.loaded(pCallback);
                return scriptNode;
                
            } else {
                if (pCallback) scriptNode.loaded(pCallback);
                return scriptNode;
            }
        }
    }
};

// Backward compatibility
function includeJs() {
	include.apply(null, arguments);
}

function scriptLoaded(scriptName, callback) {
	document.getElementById('script_' + scriptName.toLowerCase()).loaded(callback);
};

function scriptSrc(scriptId, version) {
	var src;
	var scripts = registeredScripts();
	var script = scripts.find(el => el.id == scriptId.toLowerCase());

	if (script) {
		var v = (version != undefined ? version : script.version);

		if (v == 0) {
			src = 'https://cloudycrm.net/c/gitcdn.asp?path=' + script.path;
		} else {
			src = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@' + v + script.path;
		}

	} else {
		src = undefined;
	}

	return src;
}