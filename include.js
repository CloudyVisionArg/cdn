/*
includeJs permite cargar una biblioteca Javascript en forma dinamica.
La funcion verifica si la biblioteca ya esta cargada, en cuyo caso omite la repeticion.

Ej:

	includeJs('emojis');
	
	includeJs('emojis', function () {
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

	includeJs('emojis', 15, function () {
		// emojis loaded
	});

U obtener el ultimo commit, sin caches, pidiendo la version 0

	includeJs('emojis', 0, function () {
		// emojis loaded
	});

Puedo usarlo para mis propios script especificando el src:

	includeJs('myScript', 'http://path/to/my/script.js', function () {
		// myScript loaded
	});
*/

// Scripts registrados
function registeredScripts() {
	var scripts = [];

	scripts.push({ id: 'javascript', path: '/javascript.js', version: 33 });
	scripts.push({ id: 'emojis', path: '/emojis.js', version: 20 });
	scripts.push({ id: 'whatsapp', path: '/wapp.js', version: 42 });
	scripts.push({ id: 'maps', path: '/maps.js', version: 20 });
	scripts.push({ id: 'qrcode', path: '/qrcode.js', version: 20 });
	scripts.push({ id: 'app7-controls', path: '/app7/controls.js', version: 36 });
	scripts.push({ id: 'app7-doorsapi', path: '/app7/doorsapi.js', version: 36 });
	scripts.push({ id: 'app7-sync', path: '/app7/sync.js', version: 41 });
	scripts.push({ id: 'app7-dsession', path: '/app7/dsession.js', version: 41 });
	scripts.push({ id: 'app7-global', path: '/app7/global.js', version: 42 });
	scripts.push({ id: 'app7-explorer', path: '/app7/explorer.js', version: 43 });

	return scripts;
}

/*
Argumentos:
0: Id del script
1: string -> SRC del script custom / function -> Callback / number -> Version (0: lastCommit)
2: function -> Callback (script custom)
*/

function includeJs() {
	var src, reqVer, callback;
	var scripts = registeredScripts();

	var id = arguments[0].toLowerCase();

	if (typeof arguments[1] == 'string') {
		src = arguments[1];
	} else if (typeof arguments[1] == 'number') {
		reqVer = arguments[1]
	} else if (typeof arguments[1] == 'function') {
		callback = arguments[1];
	}

	if (typeof arguments[2] == 'function') {
		callback = arguments[2];
	}

	var scriptSrc = scriptSource(id, reqVer);
	if (scriptSrc) {
		src = scriptSrc;
	} else {
		if (!src) throw id + ' not registered and no src specified';
	}

	if (src) {
		var scriptNode = document.getElementById('script_' + id);
		if (!scriptNode) {
			var D = document;
			scriptNode = D.createElement('script');
			scriptNode.id = 'script_' + id;
			scriptNode.type = 'text/javascript';
			scriptNode.async = true;
			scriptNode.src = src;
			
			scriptNode.loaded = function (pCallback) {
				var self = this;
				var waiting = 0;
				var interv = setInterval(function () {
					waiting += 10;
					if (self._loaded  || waiting > 3000) {
						clearInterval(interv);
						if (pCallback) pCallback(self);
						if (waiting > 3000) console.log('includeJs(' + id + ') timeout');
						
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

			if (callback) scriptNode.loaded(callback);
			return scriptNode;
			
		} else {
			if (callback) scriptNode.loaded(callback);
			return scriptNode;
		}
	}
};

function scriptLoaded(scriptName, callback) {
	document.getElementById('script_' + scriptName.toLowerCase()).loaded(callback);
};

function scriptSource(scriptId, version) {
	var src;
	var scripts = registeredScripts();
	var script = scripts.find(el => el.id == scriptId.toLowerCase());

	if (script) {
		if (version != undefined) {
			if (version == 0) {
				src = 'https://cloudycrm.net/c/gitcdn.asp?path=' + script.path;
			} else {
				src = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@' + version + script.path;
			}
		} else {
			src = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@' + script.version + script.path;
		}

	} else {
		src = undefined;
	}

	return src;
}