/*
include permite cargar una biblioteca Javascript o CSS en forma dinamica.
La funcion verifica si la biblioteca ya esta cargada, en cuyo caso omite la repeticion.

Ej:

	include('emojis');
	
	include('emojis', function () {
		// emojis loaded
	});
	
Puedo verificar si la biblioteca se termino de cargar con el metodo scriptLoaded:

	scriptLoaded('emojis', function () {
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
	scripts.push({ id: 'doorsapi', depends: ['jquery'] }); // No se carga hasta que este cargado jquery
	scripts.push({ id: 'web-javascript', version: 0 });
	
	include(scripts, function () {
		// all scripts loaded
	});

Si el src termina en '.css' se creara un <link>, sino un <script>
*/

// Scripts registrados
function registeredScripts() {
	var scripts = [];

    /*
    hasdep se pone en true cdo la biblioteca tiene dependencias que resuelve ella misma
    Ej (ver web-javascript):

    // Incluye jslib como dependencia
    (function () {
        include('jslib', function () {
            var n = document.getElementById('script_web-javascript');
            n._hasdep = false;
        });
    })();

    Incluye la dependencia y setea el _hasdep del nodo a false
    */
    scripts.push({ id: 'app7-cloudy-index.css', path: '/app7/cloudy/index.css', version: 163 });
    scripts.push({ id: 'app7-login', path: '/app7/login.html', version: 163 });
	scripts.push({ id: 'app7-dsession', path: '/app7/dsession.js', version: 163 });
    scripts.push({ id: 'app7-global', path: '/app7/global.js', version: 163, hasdep: true });
    scripts.push({ id: 'app7-index', path: '/app7/index.js', version: 163 });

    scripts.push({ id: 'app7-explorer', path: '/app7/explorer.js', version: 157 });
    scripts.push({ id: 'app7-index.css', path: '/app7/index.css', version: 155 });
    scripts.push({ id: 'app7-popovers', path: '/app7/popovers.js', version: 154 });
    scripts.push({ id: 'app7-notifications', path: '/app7/notifications.js', version: 154 });
    scripts.push({ id: 'app7-controls', path: '/app7/controls.js', version: 153 });
    scripts.push({ id: 'app7-cloudy-index', path: '/app7/cloudy/index.js', version: 149 });
    scripts.push({ id: 'app7-sade-index.css', path: '/app7/sade/index.css', version: 149 });
    scripts.push({ id: 'app7-sade-index', path: '/app7/sade/index.js', version: 149 });
	scripts.push({ id: 'app7-generic', path: '/app7/generic.js', version: 146 });
	scripts.push({ id: 'web-controls', path: '/web/controls.js', version: 146 });
    scripts.push({ id: 'web-generic', path: '/web/generic.js', version: 146 });
    scripts.push({ id: 'jslib', path: '/jslib.js', version: 125 });
	scripts.push({ id: 'web-javascript', path: '/web/javascript.js', version: 125, hasdep: true });
	scripts.push({ id: 'app7-scrversions', path: '/app7/scrversions.js', version: 111 });
	scripts.push({ id: 'app7-chpass', path: '/app7/chpass.html', version: 108 });
	scripts.push({ id: 'app7-resetpass', path: '/app7/resetpass.html', version: 102 });
	scripts.push({ id: 'app7-signin', path: '/app7/signin.html', version: 102 });
	scripts.push({ id: 'doorsapi', path: '/doorsapi.js', version: 102 });
	scripts.push({ id: 'lib-filesaver', path: '/lib/FileSaver.js', version: 98 });
	scripts.push({ id: 'maps', path: '/maps.js', version: 96 });
	scripts.push({ id: 'lib-fireworks', path: '/lib/fireworks.js', version: 93 });
	scripts.push({ id: 'emojis', path: '/emojis.js', version: 91 });
	scripts.push({ id: 'whatsapp', path: '/wapp/wapp.js', version: 84 });
	scripts.push({ id: 'app7-console', path: '/app7/console.html', version: 73 });
	scripts.push({ id: 'lib-moment', path: '/lib/moment.min.js', version: 66 });
	scripts.push({ id: 'lib-numeral', path: '/lib/numeral/numeral.min.js', version: 59 });
	scripts.push({ id: 'lib-numeral-locales', path: '/lib/numeral/locales.min.js', version: 59 });
	scripts.push({ id: 'whatsapp-css', path: '/wapp/wapp.css', version: 56 });
	scripts.push({ id: 'lib-cryptojs-aes', path: '/lib/crypto-js/aes.js', version: 55 });
	scripts.push({ id: 'lib-qrcode', path: 'lib/qrcode.js', version: 55 });
	scripts.push({ id: 'app7-sync', path: '/app7/sync.js', version: 41 });

	// Aliases (for backward compatibility)
	scripts.push({ id: 'app7-doorsapi', aliasOf: 'doorsapi' });
	scripts.push({ id: 'javascript', aliasOf: 'web-javascript' });
	scripts.push({ id: 'qrcode', aliasOf: 'lib-qrcode' });

	return scripts;
}

/*
Argumentos:
0:
	- string -> Id del script
	- array -> Inclusion multiple [{ id, version o src, depends[id] }] (version se considera antes que src)
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
                setTimeout(function wait() {
                    var faltan = false;
                    el.depends.forEach(function (el2, ix2) {
                        if (arrScr.find(el3 => el3.id == el2 && !el3.loaded)) {
                            faltan = true;
                        }
                    });
                    if (faltan) {
                        setTimeout(wait, 100);
                    } else {
                        includeEl(el);
                    }
                }, 0)
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

        var script = scripts.find(el => el.id == pId);

        if (script && script.aliasOf) {
            // Es un alias
            arguments[0] = script.aliasOf;
            include.apply(null, arguments); 

        } else {
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
                    //console.log(pId + ' loading');
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
                    if (script && script.hasdep) scriptNode._hasdep = true;
                    
                    scriptNode.loaded = function (callback) {
                        var self = this;
                        var waiting = 0;
                        var interv = setInterval(function () {
                            waiting += 10;
                            if ((self._loaded && !self._hasdep) || waiting > 3000) {
                                clearInterval(interv);
                                if (waiting > 3000) console.log('include(' + pId + ') timeout');
                                if (callback) callback(self);
                                
                                /* Cuando se esta depurando y hay un debugger en la carga de la pagina,
                                el evento load no se dispara, en ese caso loaded llama igual al
                                callback luego de 3 segundos */
                            }
                        }, 10)
                    };
                    
                    scriptNode.addEventListener('load', function () {
                        this._loaded = true;
                        console.log(this.id.substring(7) + ' loaded' + ' - ' + src);
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
    }
};

// Backward compatibility
function includeJs() {
	include.apply(null, arguments);
}

function scriptLoaded(scriptName, callback) {
	var scripts = registeredScripts();
    var script = scripts.find(el => el.id.toLowerCase() == scriptName.toLowerCase());
    var id;
    if (script && script.aliasOf) {
        id = script.aliasOf.toLowerCase();
    } else {
        id = scriptName.toLowerCase();
    }
    var el = document.getElementById('script_' + id)
    if (el) {
        el.loaded(callback);
    } else {
        console.log('script_' + id + ' node not found');
    }
};

function scriptSrc(scriptId, version) {
	var src;
	var scripts = registeredScripts();
	var script = scripts.find(el => el.id == scriptId.toLowerCase());

	if (script) {
        if (script.aliasOf) {
            return scriptSrc(script.aliasOf, version);

        } else {
            var v = version;
            if (v == undefined) {
                v = script.version;
                try {
                    /*
                    Puedo especificar la version de los scripts en el localStorage, en un item asi:
                        scripts = [{ "id": "doorsapi", "version": 0 }, { "id": "app7-global", "version": 0 }]
                    */
                    var lsScripts = JSON.parse(window.localStorage.getItem('scripts'));
                    if (Array.isArray(lsScripts)) {
                        var scr = lsScripts.find(el => el.id == scriptId);
                        if (scr) v = scr.version;
                    };
                } catch (e) {
                    // Nothing to do
                };
            };

            if (v == 0) {
                /*
                todo: soportar el uso de branch, agregarlo asi a la peticion:
                http://cloudycrm.net/c/gitcdn.asp?branch=master&path=/jslib.js
                */
                src = 'https://cloudycrm.net/c/gitcdn.asp?path=' + script.path;
            } else {
                src = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@' + v + script.path;
            }
        }

	} else {
		src = undefined;
	}

	return src;
}
