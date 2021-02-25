/*
includeJs permite cargar una biblioteca Javascript en forma dinamica.
La funcion verifica si la biblioteca ya esta cargada, en cuyo caso omite la repeticion.
Ej:

	includeJs('emojis');
	
	includeJs('emojis', function () {
		// emojis loaded
	});
	
Tambien puedo verificar si la biblioteca esta cargada con el metodo loaded:

	$('#script_emojis')[0].loaded(function () {
		// emojis loaded
	});

Puedo usarlo para mis propios script especificando el src:

	includeJs('myScript', 'http://path/to/my/script.js', function () {
		// myScript loaded
	});

Al usar loaded tener en cuenta que el id se pasa a minusculas:

	$('#script_myscript')[0].loaded(function () {
		// myScript loaded
	});
*/

function includeJs() {
	// Los src de gitcdn.asp no hacen cache, usar cdo se estan haciendo cambios

	var src = '';
	var id = arguments[0].toLowerCase();
	if (id == 'javascript') {
		src = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@14/javascript.js'
		//src = 'https://cloudycrm.net/c/gitcdn.asp?path=/javascript.js';
	} else if (id == 'emojis') {
		src = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@14/emojis.js'
		//src = 'https://cloudycrm.net/c/gitcdn.asp?path=/emojis.js';
	} else if (id == 'whatsapp') {
		//src = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@16/wapp.js';
		src = 'https://cloudycrm.net/c/gitcdn.asp?path=/wapp.js';
	} else if (id == 'maps') {
		//src = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@20/maps.js';
		src = 'https://cloudycrm.net/c/gitcdn.asp?path=/maps.js';
	} else if (id == 'qrcode') {
		src = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@5/qrcode.js';
	} else {
		if (typeof arguments[1] == 'string') {
			src = arguments[1];
		} else {
			throw id + ' not registered and no src specified';
		}
	}
	
	var callback;
	if (typeof arguments[1] == 'function') {
		callback = arguments[1];
	} else if (typeof arguments[2] == 'function') {
		callback = arguments[2];
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
			
			scriptNode.addEventListener('load', function () {
				this._loaded = true;
				if (callback) callback(this);
			});
			
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
			
			var cont = D.getElementsByTagName('head')[0] || D.body || D.documentElement;
			cont.appendChild(scriptNode);
			
		} else {
			if (callback) script.loaded(callback);
		}
	}
}
