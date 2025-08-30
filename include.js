/**
Devuelve un array con los scripts registrados.
*/
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
    
    /*
    Dps de comitear freshear:
        https://cdn.cloudycrm.net/ghcv/cdn/include.js?_fresh=1
        https://nodedev.cloudycrm.net/ghcv/cdn/include.js?_fresh=1
    */
    scripts.push({ id: 'app7-explorer', path: '/app7/explorer.js', version: 487 });
    scripts.push({ id: 'app7-global', path: '/app7/global.js', version: 487, hasdep: true });
    scripts.push({ id: 'doorsapi2', path: '/doorsapi2.mjs', version: 486 });
    scripts.push({ id: 'jslib', path: '/jslib.js', version: 480 });
    scripts.push({ id: 'app7-index', path: '/app7/index.js', version: 476 });
    scripts.push({ id: 'web-javascript', path: '/web/javascript.js', version: 469, hasdep: true });
    scripts.push({ id: 'app7-index.css', path: '/app7/index.css', version: 467 });
    scripts.push({ id: 'app7-controls', path: '/app7/controls.js', version: 464 });
    /*
    Por si hay que volver atras
    scripts.push({ id: 'app7-explorer', path: '/app7/explorer.js', version: 465 });
    scripts.push({ id: 'app7-global', path: '/app7/global.js', version: 468, hasdep: true });
    scripts.push({ id: 'doorsapi2', path: '/doorsapi2.mjs', version: 479 });
    scripts.push({ id: 'jslib', path: '/jslib.js', version: 435 });
    scripts.push({ id: 'app7-index', path: '/app7/index.js', version: 426 });
    scripts.push({ id: 'web-javascript', path: '/web/javascript.js', version: 444, hasdep: true });
    scripts.push({ id: 'app7-index.css', path: '/app7/index.css', version: 196 });
    scripts.push({ id: 'app7-controls', path: '/app7/controls.js', version: 334 });
    */
    scripts.push({ id: 'whatsapp', path: '/wapp/wapp.js', version: 449 });
    scripts.push({ id: 'app7-controls', path: '/app7/controls.js', version: 444 });
    scripts.push({ id: 'lib-moment-timezone', path: 'lib/moment-timezone-with-data.min.js', version: 436 });
    scripts.push({ id: 'app7-notifications', path: '/app7/notifications.js', version: 422 });
    scripts.push({ id: 'app7-generic', path: '/app7/generic.js', version: 427 });
    scripts.push({ id: 'web-generic', path: '/web/generic.js', version: 405 });
    scripts.push({ id: 'whatsapp-css', path: '/wapp/wapp.css', version: 380 });
    scripts.push({ id: 'pivotable', repo: 'Global', path: 'client/pivotable.js' });
    scripts.push({ id: 'generic6', repo: 'Global', path: '/client/generic6.js' });
    scripts.push({ id: 'lib-moment', path: '/lib/moment-with-locales.min.js', version: 377 });
    scripts.push({ id: 'maps', path: '/maps.js', version: 370 });
    scripts.push({ id: 'web-controls', path: '/web/controls.js', version: 369 });
    scripts.push({ id: 'app7-cloudy-index.css', path: '/app7/cloudy/index.css', version: 325 });
    scripts.push({ id: 'app7-sade-index.css', path: '/app7/sade/index.css', version: 325 });
    scripts.push({ id: 'app7-popovers.json', path: '/app7/popovers.json', version: 313 });
    scripts.push({ id: 'app7-login', path: '/app7/login.html', version: 318 });
    scripts.push({ id: 'app7-sync', path: '/app7/sync.js', version: 296 });
    scripts.push({ id: 'app7-scrversions', path: '/app7/scrversions.js', version: 267 });
    scripts.push({ id: 'emojis', path: '/emojis.js', version: 256 });
    scripts.push({ id: 'app7-popovers', path: '/app7/popovers.js', version: 252 });
    scripts.push({ id: 'app7-session', path: '/app7/session.mjs', version: 250 });
    scripts.push({ id: 'app7-import', path: '/app7/import.js', version: 238 });
    scripts.push({ id: 'app7-signin', path: '/app7/signin.html', version: 202 });
    scripts.push({ id: 'app7-resetpass', path: '/app7/resetpass.html', version: 184 });
    scripts.push({ id: 'app7-cloudy-index', path: '/app7/cloudy/index.js', version: 149 });
    scripts.push({ id: 'app7-sade-index', path: '/app7/sade/index.js', version: 149 });
    scripts.push({ id: 'app7-chpass', path: '/app7/chpass.html', version: 108 });
    scripts.push({ id: 'doorsapi', path: '/doorsapi.js', version: 102 });
    scripts.push({ id: 'lib-filesaver', path: '/lib/FileSaver.js', version: 98 });
    scripts.push({ id: 'lib-fireworks', path: '/lib/fireworks.js', version: 93 });
    scripts.push({ id: 'app7-console', path: '/app7/console.html', version: 73 });
    scripts.push({ id: 'lib-numeral', path: '/lib/numeral/numeral.min.js', version: 59 });
    scripts.push({ id: 'lib-numeral-locales', path: '/lib/numeral/locales.min.js', version: 59 });
    scripts.push({ id: 'lib-cryptojs-aes', path: '/lib/crypto-js/aes.js', version: 55 });
    scripts.push({ id: 'lib-qrcode', path: 'lib/qrcode.js', version: 55 });

    // Aliases (for backward compatibility)
    scripts.push({ id: 'app7-dsession', aliasOf: 'app7-session' });
    scripts.push({ id: 'app7-doorsapi', aliasOf: 'doorsapi' });
    scripts.push({ id: 'javascript', aliasOf: 'web-javascript' });
    scripts.push({ id: 'qrcode', aliasOf: 'lib-qrcode' });

    return scripts;
}

/**
Carga una biblioteca Javascript o CSS en forma dinamica.
La funcion verifica si la biblioteca ya esta cargada, en cuyo caso omite la repeticion.

args[0]
- string -> Id del script
- array -> Inclusion multiple [{ id, version o src, depends[id] }] (version se considera antes que src)

args[1]
- string -> SRC del script custom
- number o string -> Tag si es numero (0 = lastCommit), Branch sino
- function -> Callback

args[2]
- function -> Callback

@example

await include('emojis');
// emojis loaded with Promise await

include('emojis', function () {
    // emojis loaded with callback
});
	
// Puedo especificar la version (tag del commit)

await include('emojis', 15);

// U obtener el ultimo commit, sin caches, pidiendo la version 0

await include('emojis', 0);

// O el ultimo commit de un branch, pasando el nombre del mismo (case sensitive)

await include('emojis', 'MyBranch');

// Puedo usarlo para mis propios script especificando el src. Si el src termina en '.css' se creara un <link>, sino un <script>.

await include('myScript', 'http://path/to/my/script.js');

// Tambien puedo armar un array de includes y cargarlos todos juntos:

var scripts = [];
scripts.push({ id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' });
scripts.push({ id: 'font-awesome', src: '/c/themes/default/css/font-awesome.min.css' });
scripts.push({ id: 'doorsapi', depends: ['jquery'] }); // No se carga hasta que este cargado jquery
scripts.push({ id: 'web-javascript', version: 0 }); // Ult commit
scripts.push({ id: 'web-javascript', version: 'MyBranch' }); // Ult commit del branch MyBranch

await include(scripts);
// all scripts loaded
*/
function include() {
    return new Promise((resolve, reject) => {
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
                if (pEl.version || pEl.version == 0) {
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
                    resolve(arrScr.length); // Number of items loaded
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
                    // Si tiene ://, .js, .mjs o .css es el src, sino el branch
                    if (arguments[1].indexOf('://') >= 0 || arguments[1].indexOf('.js') >= 0 || 
                            arguments[1].indexOf('.mjs') >= 0 || arguments[1].indexOf('.css') >= 0) {
                        pSrc = arguments[1];
                    } else {
                        pVer = arguments[1]
                    }
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

                        // Saca la extension del archivo
                        let p = src.indexOf('?');
                        let f = p >= 0 ? src.substring(0, p) : src;
                        p = f.lastIndexOf('.');
                        let ext = p >= 0 ? f.substring(p).toLowerCase() : '';
                        
                        if (ext == '.css') {
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
                    }

                    scriptNode.loaded(() => {
                        if (pCallback) pCallback(scriptNode);
                        resolve(scriptNode);
                    });
                }
            }
        }
    });
};

// Backward compatibility
function includeJs() {
	return include.apply(null, arguments);
}

function scriptLoaded(scriptId, callback) {
	var scripts = registeredScripts();
    var script = scripts.find(el => el.id.toLowerCase() == scriptId.toLowerCase());
    var id;
    if (script && script.aliasOf) {
        id = script.aliasOf.toLowerCase();
    } else {
        id = scriptId.toLowerCase();
    }
    var el = document.getElementById('script_' + id)
    if (el) {
        el.loaded(callback);
    } else {
        console.log('script_' + id + ' node not found');
    }
};

/**
Retorna el src (url) del script registrado con scriptId.
Si especifico version se devuelve el src de esa version.
*/
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
                        scripts = [{ "id": "doorsapi", "version": 0 }, { "id": "app7-global", "version": "MyBranch" }]
                    */
                    var lsScripts = JSON.parse(window.localStorage.getItem('scripts'));
                    if (Array.isArray(lsScripts)) {
                        var scr = lsScripts.find(el => el.id == scriptId);
                        if (scr) {
                            v = scr.version;
                            console.log('scriptSrc localStorage hit', scr)
                        }
                    };
                } catch (e) {
                    console.log(e);
                };
            };

            if (script.repo) {
                script.url = true;
                if (v != undefined) {
                    if (v == 0) {
                        script.fresh = true;
                    } else {
                        script.ref = v;
                    }
                }
                src = gitCdn(script);

            } else if (!isNaN(parseInt(v))) {
                // Master
                if (v == 0) {
                    //src = 'https://cloudycrm.net/c/gitcdn.asp?path=' + script.path;
                    src = gitCdn({ path: script.path, fresh: true, url: true });
                } else {
                    //src = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@' + v + script.path;
                    src = gitCdn({ path: script.path, ref: v, url: true });
                }

            } else {
                // Branch
                //src = 'https://cloudycrm.net/c/gitcdn.asp?ref=' + v + '&path=' + script.path;
                src = gitCdn({ path: script.path, ref: v, fresh: true, url: true });
            }
        }

	} else {
		src = undefined;
	}

	return src;
}

/**
Devuelve un buffer con un elemento de GitHub o su url

@example
gitCdn({
    owner // def CloudyVisionArg
    repo // def cdn
    path // Ruta al archivo, no poner el slash inicial
    ref // Branch / tag
    fresh // Actualiza el cache
    url // Devuelve la url en vez del buffer. Def false
    server // Opcional, def https://cdn.cloudycrm.net
}
@returns {string|Promise<SimpleBuffer2>}
*/
function gitCdn(options) {
    if (options.repo && options.path) {
        try {
            /*
            Puedo especificar el ref y fresh de los scripts en el localStorage, en un item asi:
                scripts = [{ "repo": "myRepo", "path": "myScript.js", "ref": "myBranchOrTag", "fresh": "true" }, { "repo": ... }]
            */
            var lsScripts = JSON.parse(window.localStorage.getItem('scripts'));
            if (Array.isArray(lsScripts)) {
                var scr = lsScripts.find(el => el.owner == options.owner && el.repo == options.repo && el.path == options.path);
                if (scr) {
                    options.ref = scr.ref;
                    options.fresh = scr.fresh;
                    console.log('gitCdn localStorage hit', scr)
                }
            };
        } catch (e) {
            // Nothing to do
        };
    }

    var url = ghCodeUrl(options);

    if (options.url) {
        return url;
        
    } else {
        return new Promise((resolve, reject) => {
            fetch(url).then(
                async res => {
                    if (res.ok) {
                        resolve(new SimpleBuffer2(await res.arrayBuffer()));

                    } else {
                        try {
                            var txt = await res.text();
                            var json = JSON.parse(txt);
                            // importa serialize si no esta
                            if (!window.serializeError) {
                                mod = await import('https://cdn.jsdelivr.net/npm/serialize-error-cjs@0.1.3/+esm');
                                window.serializeError = mod.default;
                            }
                            var err = serializeError.deserializeError(json);
                            reject(err);

                        } catch(err) {
                            reject(new Error(res.status + ' (' + res.statusText + ')'));
                        }
                    }

                },
                err => {
                    reject(err);
                }
            )
        });
    }
}

/**
Importa un elemento de GitHub

@example
myMod = await gitImport({
    id, // id de registeredScripts
    version, // Version del script
        o
    owner, // def CloudyVisionArg
    repo, // def cdn
    path, // Ruta al archivo, no poner el slash inicial
    ref, // Branch / tag
    fresh, // Actualiza el cache

    server, // Opcional, def https://cdn.cloudycrm.net
}
@returns {Promise}
*/
function gitImport(options) {
    let url;

    if (options.path) {
        // gitCdn
        options.url = true;
        url = gitCdn(options);

    } else {
        // scriptSrc
        url = scriptSrc(options.id, options.version);
    }
    return import(url);
}

/*
Esta es una implementacion simplificada de la clase Buffer de node
Si hace falta algo mas completo usar https://github.com/feross/buffer

    await include('buffer', 'https://bundle.run/buffer@6.0.3');
    resolve(buffer.Buffer.from(await res.arrayBuffer()));
*/
class SimpleBuffer2 extends Uint8Array {
    toString() {
        var td = new TextDecoder();
        return td.decode(this);
    }   
}

/**
Devuelve la url de los endpoint gh y ghx
gh -> Leer el contenido del archivo
ghx -> Ejecutar el js

@example
ghCodeUrl({
    owner // def CloudyVisionArg
    repo // def cdn
    path // Ruta al archivo, no poner el slash inicial
    ref // Branch / tag
    fresh // Actualiza el cache
    exec // Boolean, indica si es para ejecutar (ghx)
    server // Opcional, def https://cdn.cloudycrm.net
}
*/
function ghCodeUrl(code) {
    let url = code.server ? code.server : 'https://cdn.cloudycrm.net';
    let exec = code.exec ? 'x' : '';
    url += '/' + (code.owner != undefined ? 'gh' + exec + '/' + code.owner : 'gh' + exec + 'cv');
    url += '/' + (code.repo != undefined ? code.repo : 'cdn');
    url += code.ref != undefined ? '@' + code.ref : '';
    while(code.path.substring(0, 1) == '/') code.path = code.path.slice(1);
    url += '/' + code.path;
    if (code.fresh == true || code.fresh == 1) url += '?_fresh=1';
    return url;
}