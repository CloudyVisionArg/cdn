/*
includeJs permite cargar una biblioteca Javascript en forma dinamica.
La funcion verifica si la biblioteca ya esta cargada, en cuyo caso omite la repeticion.
Ej:

	includeJs('emojis');
	
	includeJs('emojis', function () {
		// emojis loaded
	});
	
Tambien puedo verificar si la biblioteca esta cargada con el metodo scriptLoaded:

	scriptLoaded('emojis', function () {
		// emojis loaded
	});

Puedo usarlo para mis propios script especificando el src:

	includeJs('myScript', 'http://path/to/my/script.js', function () {
		// myScript loaded
	});
*/

// todo: ver de recibir la version para el @
/*
arg 0: Id del script
arg 1: string -> SRC del script custom / function -> Callback / Number -> Version (0: lastCommit)
arg 2: function -> Callback (script custom)
*/

function includeJs() {
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

	var src, reqVer, callback;

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

	debugger;

	var script = scripts.find(el => el.id == id.toLowerCase());

	if (script) {
		if (reqVer != undefined) {
			if (reqVer == 0) {
				src = 'https://cloudycrm.net/c/gitcdn.asp?path=' + script.path;
			} else {
				src = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@' + reqVer + script.path;
			}
		} else {
			src = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@' + script.version + script.path;
		}

	} else {
		if (!src) {
			throw id + ' not registered and no src specified';
		}
	}

	if (src) {
		var script = document.getElementById('script_' + id);
		if (!script) {
			var D = document
			var scriptNode = D.createElement('script');
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

			if (callback) scriptNode.loaded(callback);

			var cont = D.getElementsByTagName('head')[0] || D.body || D.documentElement;
			cont.appendChild(scriptNode);
			return scriptNode;
			
		} else {
			if (callback) script.loaded(callback);
			return script;
		}
	}
};

function scriptLoaded(scriptName, callback) {
	document.getElementById('script_' + scriptName.toLowerCase()).loaded(callback);
};