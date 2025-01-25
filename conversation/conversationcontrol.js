/**
 * Fresh: https://cdn.cloudycrm.net/ghcv/cdn@conversationUnifv2/conversation/conversationcontrol.js?_fresh=true
 */
window._isCapacitor = function () {
	try { return (Capacitor != undefined); }
	catch (e) { return false; }
};

window.cloudy = window.cloudy || {};
window.cloudy.conversation = window.cloudy.conversation || {
	instances: [],
	getInstance: function(selector){
		return window.cloudy.conversation.instances.find(i => i.options.selector == selector);
	}
};

/***********************************************************
 * Control para conversaciones y datos base
 * Requiere: JQuery, Fontawesome, moment, emojis, jslib
 * Necesita: Proveedor de datos y tipos de mensajes
 * Opcionales: HTML Encabezado y HTML de opciones extra
 ***********************************************************/




/**
 * Tipo de mensaje base. Propiedades requeridas y renderizado simple
 * Para tener multiples tipos de mensaje, heredar de esta clase y sobreescribir de la siguiente forma
 * function llamadaMsg(){
 *  //define herencia
 * 	this.parent = msg;
 *   this.parent();
 *	//Sobreescribe icono
 *	this.icon = "fa-telephone";
 *	//Sobreescribe tipo
 *	this.type = "Llamada";
 * }
 */
function msg() {
	this.sid = null;
	this.direction = "outbound";
	this.operator = null;
	this.status = null;
	this.body = null;
	this.date = null;
	this.type = "Msg";
	this.icon = "fa-pencil-square-o";
	this.classes = "";
	this.customProps = {};
	this.getMessageHtml = function (message) {
		let me = this;
		return new Promise((resolve, reject) => {
			resolve(getHtml(message));
			function getHtml(msj) {
				var appendBody = true;
				let dateString = msj.date instanceof Date ? msj.date.toISOString() : msj.date;
				var $row = $('<div/>', {
					class: 'conv-message wapp-message ' + msj.classes,
					'data-sid': msj.sid,
					'data-date': dateString,
					'data-type': msj.type,
				});

				var $msg = $('<div/>', {
					class: 'wapp-' + msj.direction,
				}).appendTo($row);

				if (msj.operator) $msg.append("<span class='msg-operator'>" + msj.operator + "</span>");

				var $msgText = $('<div/>', {
					class: 'wapp-message-text',
				}).appendTo($msg);
				let body = msj.body;
				if (appendBody) {

					if (body) {
						body = body.replace(/\n/g, '<br>'); // Reemp los \n con <br>

						//todo: estos deberian trabajar con word boundary, mejorar
						// https://stackoverflow.com/questions/58356773/match-star-character-at-end-of-word-boundary-b
						body = body.replace(/\*([^*]+)\*/g, '<b>$1<\/b>'); // Reemp los * con <b>
						body = body.replace(/\_([^_]+)\_/g, '<i>$1<\/i>'); // Reemp los _ con <i>
						body = body.replace(/\~([^~]+)\~/g, '<del>$1<\/del>'); // Reemp los _ con <i>
					};

				}

				//body += "<h4><i class='fa " + self.icon + "'></i> " + self.type + "</h4>";

				/*if (msj.status) {
					let icon = msj.status == "Mensaje Enviado" ? "fa-thumbs-up text-success" : "fa-thumbs-down text-danger";
					body += "<div class='msg-detail-container'><i class='fa " + icon + "'></i> " + msj.status + "</div>";
				}
				else{
					body += "<div class='activity-actions'>" +
					"<button class='btn btn-success' onclick='smsMessageTools.markAsDone(" + msj.sid + ",true);this.disabled = true;'><i class='fa fa-thumbs-up'></i> La hice</button>" + 
					"<button class='btn btn-danger' onclick='smsMessageTools.markAsDone(" + msj.sid + ",false);this.disabled = true;'><i class='fa fa-thumbs-down'></i> No la hice</button>" + 
					"</div>";
				}*/
				$msgText.append(body);

				var $msgTime = $('<div/>', {
					class: 'wapp-message-time',
				}).appendTo($msg);

				dt = new Date(msj.date);

				$msgTime.append("<span class='pull-left'><i class='fa " + me.icon + "'></i></span>");
				$msgTime.append("<span>" + me.formatDate(dt) + "</span>");
				return $row;
			}
		})
	};

	// La fecha corta de los msjs
	this.formatDate = function (pDate) {
		var pDate2, date;
		var today = onlyDate(new Date());
		pDate2 = new Date(pDate);
		pDate2 = onlyDate(pDate2);
		var diff = today.getTime() - pDate2.getTime();
		if (pDate2.getTime() == today.getTime()) {
			date = '';
		} else if (diff <= (24 * 60 * 60 * 1000)) {
			date = 'Ayer ';
		} else {
			//todo: ir hasta una semana p atras c el dia (Lun, Mar, etc)
			date = pDate.getDate() + '/' + (pDate.getMonth() + 1) + ' ';
		}
		return date + ISOTime(pDate);

		function onlyDate(dt) {
			dt.setHours(0);
			dt.setMinutes(0);
			dt.setSeconds(0);
			dt.setMilliseconds(0);
			return dt
		}
	};
}
/**
 * Proveedor de mensajes de chat. Esta clase sirve para estandarizar el buscado de mensajes
 * Sobreescribir con la búsqueda de notas, actividades, mensajes de chat, etc de la siguiente forma
 * function notasDataProvider(){
 * this.parent = conversationBaseDataProvider;
 * this.supportedTypes = ["llamadaMsg"];
 * this.getMessages = function (msgLimit){
 * 		return new Promise(function(resolve, reject){ DoorsAPI.folderSearch()...... });
 * }
 * }
 */
function conversationBaseDataProvider() {
	this.supportedTypes = ["msg"];
	this.conversationControl = null;
	this.accounts = [];
	this.getQuickMessageOptions = null;
	this.getMessages = function (msgLimit, maxDate) {
		return new Promise(function (resolve, reject) { resolve([]) });
	};
	this.sendMessage = function (msg) {
		return new Promise(function (resolve, reject) { resolve(null) });
	};
	this.updateMessage = function (id, docFieldValues) {
		return new Promise(function (resolve, reject) { resolve(null) });
	};
	this.destroy = function () { };
	this.executeQuickOption = function (option, typeName) { };
}
/**
 * Proveedor de datos de chat. Utilizar este objeto para proveer de datos al chat de la siguiente forma
 * let provider = new conversationDataProvider();
 * provider.msgproviders = [new notasDataProvider()]
 * @class
 * @public
 */
function conversationDataProvider() {
	this.msgproviders = [];
	this.allMessages = [];
	var me = this;
	this.getMessages = function (msgLimit, maxDate) {
		return new Promise((resolve, reject) => {
			let promises = [];
			for (let i = 0; i < this.msgproviders.length; i++) {
				promises.push(this.msgproviders[i].getMessages(msgLimit, maxDate));
			}
			Promise.all(promises).then(function (results) {
				let messages = [];
				for (let i = 0; i < results.length; i++) {
					messages = messages.concat(results[i]);
					me.allMessages = me.allMessages.concat(results[i]);
				}
				resolve(messages);
			});
		});
	};
	//TODO
	this.getMessage = function (id, callback) {
	};
	this.sendMessage = function (msg) {
		let me = this;
		return new Promise((resolve, reject) => {
			let msgType = msg.constructor.name;
			for (let i = 0; i < this.msgproviders.length; i++) {
				let provider = this.msgproviders[i];
				if (provider.supportedTypes.indexOf(msgType) > -1) {
					provider.conversationControl.cursorLoading(true);
					provider.sendMessage(msg).then((arg)=>{
						provider.conversationControl.cursorLoading(false);
						resolve(arg);
					}, (argErr)=>{
						provider.conversationControl.cursorLoading(false);
						reject(argErr);
					});
					return;
				}
			}
			reject(null);
		});
	};
	this.updateMessage = function (id, docFieldValues) {
		return new Promise((resolve, reject) => {

			let found = me.allMessages.find(m => m.sid = id);

			if (found) {
				let msgType = found.constructor.name;
				for (let i = 0; i < this.msgproviders.length; i++) {
					let provider = this.msgproviders[i];
					if (provider.supportedTypes.indexOf(msgType) > -1) {
						provider.updateMessage(id, docFieldValues).then(resolve, reject);
						return;
					}
				}
			}

			reject(null);
		});
	};
}

/**
 * Control de conversacion tipo chat
 * @public
 * @class
 * @param {Object} opt - Objeto con la configuración del control
 * @param {string} opt.selector - Selector CSS del elemento donde se renderizará el chat
 * @param {conversationDataProvider} opt.dataProvider: Instancia de conversationDataProvider para obtener mensajes
 * @param {string} opt.defaultQuickMessageType: Tipo de mensaje a seleccionar por defecto en el menu de mensajes rapidos de texto. En caso de no enviarlo se tomar el primer tipo de mensaje del primer proveedor enviado 
 * @param {string[] | object[]} opt.quickMessageTypes  - Tipos de mensaje para enviar por texto
 * @param {(string | Function)} [opt.header] - Html, function o promesa para barra de encabezado
 * @param {(string | Function)} [opt.subheader] - Html, function o promesa que devuelve HTML para la barra inferior al encabezado
 * @param {(string | Function)} [opt.moreOptions] - Html o promesa que devuelve opciones del menu izq inferior
 * @param {Number} [opt.checkMessagesInterval=50] - Tiempo en segundos donde se chequearán por nuevos mensajes. Valor por defecto 50 segundos
 * @param {Function} [opt.onReady] - Funcion para escuchar cuando el control está listo
 * @param {Function} [opt.messageInserted] - Funcion para escuchar cuando se insertó un mensaje a través de la funcion insertMessage Se envian 1 parametro: Objeto del mensaje enviado (instancia de msg)
 * @param {Function} [opt.messageRendered] - Funcion para escuchar cuando se dibujó un mensaje Se envian 1 parametro: Objeto del mensaje enviado (instancia de msg)
 * @param {Function} [opt.messageSent] - Funcion para escuchar cuando se envió exitosamente un mensaje. Se envian 1 parametro: Objeto del mensaje enviado (instancia de msg)
 * @param {Function} [opt.quickMessageChanged] - Funcion para escuchar cuando se cambia el tipo de mensaje desde el menu de mensajes rapidos
 * }
 * Expone funciones:
 * cursorLoading: Permite mostrar control de loading. Recibe parámetro booleano determinando si se debe mostrar u ocultar
 * insertMsg: Permite insertan un mensaje manualmente al final del chat. Recibe parametro objeto del mensaje (instancia de msg)
 */
function conversationControl(opt) {

	var allMessages = [];
	var defaults = {
		selector: null,
		dataProvider: null,
		headerHtml: null,
		subheaderHtml: null,
		moreOptions: null,
		quickMessageTypes: null,
		defaultQuickMessageType: null,
		checkMessagesInterval: 50,
		onReady: null,
		messageInserted: null,
		messageRendered: null,
		messageSent: null,
		quickMessageChanged: null
	};
	this.options = $.extend(defaults, opt);
	if (this.options.selector == null) {
		throw "Se necesita al menos el selector de contenedor para renderizar el chat. Revise las opciones enviadas por parametro";
	}

	if(window.cloudy && window.cloudy.conversation){
		let found = window.cloudy.conversation.getInstance(this.options.selector);
		if(found){
			throw "Ya existe un control de conversacion registrado para este selector: " + this.options.selector;
		}
		window.cloudy.conversation.instances.push(this);
	}


	var $mainContainer = $(this.options.selector);
	this.dataProvider = this.options.dataProvider;
	var me = this;
	this.dataProvider.msgproviders.map(function (p) { 
		p.conversationControl = me;
	});
	var intervalId;
	this.cursorLoading = function (pLoading) {
		if (typeof (cordova) == 'object') {
			if (pLoading) {
				app7.preloader.show();
			} else {
				app7.preloader.hide();
			}

		} else {
			if (pLoading) {
				$mainContainer.append(`<div class="web-chat-loading">
    				<span class="web-chat-loading-icon">
						<i class="fa fa-refresh fa-spin"></i>
					</span>
					<span class="web-chat-loading-text">Cargando...</span>
				</div>`)
			}
			else{
				$mainContainer.find('.web-chat-loading').remove();
			}
			$mainContainer.css('cursor', pLoading ? 'progress' : 'default');
		}
	};

	this.insertMsg = function (pMsg) {
		return new Promise(function (resolve, reject) {
			if (!pMsg) {
				resolve(null);
				return;
			}
			let found = me.dataProvider.allMessages.find(m => m.sid == pMsg.sid);
			if (!found) {
				me.dataProvider.allMessages.push(pMsg);
			}
			var pChat = $(me.options.selector);
			var $cont = pChat.find('div.wapp-messages');
			var $msgs = pChat.find('div.conv-message');
			var shouldUpdate = false;
			if (found) {
				let foundClone = Gestar.Tools.cloneObject(found);
				let msgClone = Gestar.Tools.cloneObject(pMsg);
				foundClone.provider = null;
				msgClone.provider = null;
				if (JSON.stringify(foundClone) != JSON.stringify(msgClone)) {
					shouldUpdate = true;
				}
			}
			if ($msgs.length == 0) {
				//Si es el primero, obtengo el html y lo renderizo
				pMsg.getMessageHtml(pMsg).then(function (msgRow) {
					$cont.append(msgRow);
					scrollToBottom();
					resolve(msgRow);
				});
			} else {
				pMsg.getMessageHtml(pMsg).then(function (msgRow) {
					var existingMessage = $msgs.filter('[data-sid="' + pMsg.sid + '"]');
					//Ya existe y esta dibujado
					if (existingMessage.length > 0) {
						//se reemplaza el elemento para actualizar
						//TODO Solo reemplazar si cambió el html
						//if(existingMessage.html() != $(msgRow).html()){
						//Se cambia la validacion por la comparacion de los datos, no la visualizacion
						if (shouldUpdate) {
							console.log("actualizando interfaz de mensaje " + pMsg.sid);
							existingMessage.replaceWith(msgRow);
						}
						scrollToBottom();
						resolve(msgRow);
						return;
					} else {
						existingMessage = pChat.find('div.conv-message').first();
					}
					let dateString = pMsg.date instanceof Date ? pMsg.date.toISOString() : pMsg.date;
					if (dateString <= existingMessage.attr('data-date')) {
						existingMessage.before(msgRow);
					} else {
						existingMessage = pChat.find('div.conv-message').last();
						while (existingMessage.attr('data-date') > dateString) existingMessage = existingMessage.prev();
						if (existingMessage) {
							existingMessage.after(msgRow);
						} else {
							// No deberia llegar aca, lo pongo al ultimo
							//$cont.append(msgRow);
						}
					}
					scrollToBottom();
					resolve(msgRow);
				});
			}
		});
	};

	var scrollToBottom = function () {
		try {
			var $cont = $mainContainer.find('div.wapp-messages');
			var atBottom = ($cont.scrollTop() + $cont.innerHeight() + 20 >= $cont[0].scrollHeight);
			if (atBottom) {
				if ($cont[0].scrollHeight - ($cont.scrollTop() + $cont.innerHeight()) > 20) {
					$cont.scrollTop($cont[0].scrollHeight);
				}
			}
			else {
				$cont.scrollTop($cont[0].scrollHeight);
			}
		} catch (error) {
			console.log("Error al hacer scroll al final del chat: " + error);
		}
	};


	this.destroy = function () {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		for (let i = 0; i < this.dataProvider.msgproviders.length; i++) {
			let provider = this.dataProvider.msgproviders[i];
			if (typeof (provider.destroy) == 'function') {
				provider.destroy();
			}
		}
		let indx = window.cloudy.conversation.instances.indexOf(this);
		window.cloudy.conversation.instances.splice(indx, 1);
	}

	var ready = function () {
		if (me.options.onReady) {
			me.options.onReady(me);
		}
	};

	var renderChat = function (pCont) {
		var $cont = $(pCont);

		if ($cont.attr('data-rendered') == '1') {
			$cont.find('span.external-name').html($cont.attr('data-external-name'));
			$cont.find('span.external-number').html($cont.attr('data-external-number'));
			$cont.find('span.internal-name').html($cont.attr('data-internal-name'));
			$cont.find('span.internal-number').html($cont.attr('data-internal-number'));

		} else {

			if(me.options.headerHtml != null){
				var $heading = $('<div/>', {
					class: 'wapp-header',
				}).appendTo($cont);

				if(typeof(me.options.headerHtml) == 'function'){
					let headerCall = me.options.headerHtml()
					if(headerCall instanceof Promise){
						headerCall.then(function(result){
							$(result).appendTo($heading);
						},function(err){
							//TODO Nada?
						});
					}
					else{
						$(headerCall).appendTo($heading);
					}
				}
				else{
					$(me.options.headerHtml).appendTo($heading);
				}
			}
			
			if(me.options.subheaderHtml != null){
				let $subheader = $('<div class="wapp-subheader"></div>').appendTo($cont);
				if (typeof (me.options.subheaderHtml) == 'function') {
					let subheaderCall = me.options.subheaderHtml()
					if (subheaderCall instanceof Promise) {
						subheaderCall.then(function (result) {
							$(result).appendTo($subheader);
						}, function (err) {
							//TODO Nada?
						});
					}
					else {
						$(subheaderCall).appendTo($subheader);
					}
				}
				else {
					$(me.options.subheaderHtml).appendTo($subheader);
				}

			}

			var $messages = $('<div/>', {
				class: 'wapp-messages',
			}).appendTo($cont);

			$messages.append(`      
				<div class="wapp-" style="text-align: center; margin-bottom: 15px;">
					<a onclick="wapp.(this)">Mensajes anteriores</a>
				</div>
			`);

			var $reply = $('<div/>', {
				class: 'wapp-footer',
			}).appendTo($cont);

			// Boton + (media)
			var $div = $('<div/>', {
				class: 'wapp-button',
				style: 'width: 10%',
			}).appendTo($reply);

			var $media;
			var $menuContainer = $div;
			if (typeof (cordova) != 'object') {
				// Web

				var $dropup = $('<div/>', {
					class: 'dropup',
				}).appendTo($div);

				/*$media = $('<i/>', {
					class: 'fa fa-plus',
					'data-toggle': 'dropdown',
				}).appendTo($dropup);*/

				var $menu = $('<ul/>', {
					class: 'dropdown-menu',
				}).appendTo($dropup);

				$menuContainer = $menu;
			}
			if (me.options.moreOptions != null) {
				if (typeof (me.options.moreOptions) == "function") {
					me.options.moreOptions().then(function (html) {
						$menuContainer.html(html);
					});
				}
				else if (typeof (me.options.moreOptions) == "string") {
					$menuContainer.html(html);
				}
			}

			// Boton MessageType (media)
			var $div = $('<div/>', {
				class: 'wapp-button',
				style: 'width: 10%'
			}).appendTo($reply);

			var $media;

			let defaultMsgClass = "";
			let defaultMsgType = "";
			let defaultIcon = "fa-pencil-square-o";
			if (me.options.defaultQuickMessageType != null) {
				defaultMsgClass = me.options.defaultQuickMessageType;
			} else {
				defaultMsgClass = me.dataProvider.msgproviders[0].supportedTypes[0];
			}
			if (defaultMsgClass != "") {
				let msgDefault = null;
				try {
					eval("msgDefault = new " + defaultMsgClass + "()");
					defaultMsgType = msgDefault.type;
					defaultIcon = msgDefault.icon;
				} catch (error) {
					//Do nothing
				}
			}

			if (typeof (cordova) != 'object') {
				// Web
				var $dropup = $('<div/>', {
					class: 'dropup message-type-button',
					id: "messageTypeButton",
					"data-message-type": defaultMsgType,
					"data-message-class": defaultMsgClass,
				}).appendTo($div);

				$media = $('<i/>', {
					class: 'fa ' + defaultIcon,
					/*'data-toggle': 'dropdown',
					'data-bs-toggle': 'dropdown',
					'data-bs-auto-close': 'outside',*/
					'aria-expanded': 'false',
					'data-bs-target': "#messageTypesFirstMenu"
				}).appendTo($dropup);

				$media.click(function (event) {
					event.preventDefault();
    				event.stopPropagation();

    				//$(this).parents(".dropdown-menu").first().find(".show").removeClass("show");
    				//$(this).parents(".dropdown-menu").first().find("[aria-expanded='true']").attr("aria-expanded", false);
					if($(this).attr("aria-expanded") == "true"){

						$(this).attr("aria-expanded", false);
					}
					else{
						$(this).attr("aria-expanded", true);
					}
    				$(this).siblings(".dropdown-menu").toggleClass("show");

					// $(this)
					// 	.parents(".nav-item.dropdown")
					// 	.on("hidden.bs.dropdown", function (e) {
					// 		$(".dropdown-submenu .show").removeClass("show");
					// 		$(".dropdown-submenu [aria-expanded='true']").attr("aria-expanded", false);
					// 	});
				})

				var $menu = $('<ul/>', {
					id: "messageTypesFirstMenu",
					style: "position: absolute; inset: auto auto 0px 0px; margin: 0px; transform: translate(44px, -34px);",
					class: 'dropdown-menu',
				}).appendTo($dropup);

				insertWebMessageTypesOptionsMenu($menu);

			} else {
				// Cordova
				var $dropup = $('<div/>', {
					class: 'dropup message-type-button',
					id: "messageTypeButton",
					"data-message-type": defaultMsgType,
					"data-message-class": defaultMsgClass,
				}).appendTo($div);

				$media = $('<i/>', {
					id: "",
					class: 'fa ' + defaultIcon,
				}).appendTo($div);

				insertMobileMessageTypeOptionsMenu($dropup, $media);
			}

			// Boton Emoji
			if (typeof (cordova) != 'object') {
				var $div = $('<div/>', {
					class: 'wapp-button',
					style: 'width: 10%',
				}).appendTo($reply);

				var $emoji = $('<i/>', {
					class: 'fa fa-smile-o',
				}).appendTo($div);

				$('#script_emojis')[0].loaded(function () {
					emojis.createPicker({
						el: $emoji,
						inputEl: $input,
					});
				})
			}

			// Input
			var $div = $('<div/>', {
				style: 'width: ' + (typeof (cordova) == 'object' ? '80%' : '70%') +
					'; padding-left: 5px; padding-right: 5px;',
			}).appendTo($reply);

			var $input = $('<textarea/>', {
				class: 'wapp-reply',
				style: 'height: 37px;',
				placeholder: 'Escribir'
			}).appendTo($div);
			$input.change(function () { inputResize(this); });
			$input.keyup(function () { inputResize(this); });
			$input.keydown(function (e) { inputKeyDown(this, e); });

			// Emoji picker
			if (typeof (cordova) != 'object') {
				$('#script_emojis')[0].loaded(function () {
					emojis.createPicker({
						el: $emoji,
						inputEl: $input,
					});
				})
			}

			// Boton Enviar
			var $div = $('<div/>', {
				class: 'wapp-button',
				style: 'width: 10%',
			}).appendTo($reply);

			var $send;
			if (typeof (cordova) != 'object') {
				$send = $('<i/>', {
					class: 'fa fa-send',
				}).appendTo($div);
			} else {
				$send = $('<i/>', {
					class: 'f7-icons',
				}).append('paperplane_fill').appendTo($div);
			}

			$send.click(function () {
				send(this);
			});

			$cont.attr('data-rendered', '1');
			ready(me);
		}
	};

	var startCheckingForMessages = function () {
		// Carga mensajes nuevos cada 5 segs
		if (!intervalId) {
			intervalId = setInterval(function () {
				loadMessages($mainContainer);
			}, me.options.checkMessagesInterval * 1000);
		}
	}

	var init = function (pCont) {
		var $cont = $(pCont);
		renderChat($cont);
		clear($cont);
		loadMessages($cont);
		//wapp.refreshSession($cont);
		startCheckingForMessages();
	};

	// Deja crecer hasta 4 lineas, muestra los scrolls para mas
	var inputResize = function (el) {
		el.style.height = '1px';
		scrH = el.scrollHeight;
		if (scrH < 37) scrH = 37;
		if (scrH > 80) {
			scrH = 80;
			el.style.overflowY = 'auto';
		} else {
			el.style.overflowY = 'hidden';
		}
		el.style.height = scrH + 'px';
	};

	var clear = function (pChat) {
		var $messages = pChat.find('div.wapp-messages')
		$messages.empty();
		$messages.append(`      
			<div class="wapp-" style="text-align: center; margin-bottom: 15px;">
				<a onclick="wapp.(this)">Mensajes anteriores</a>
			</div>
		`);
		pChat.removeAttr('data-last-load');
	};

	var loadMessages = function (pChat, pOlders) {
		var msgLimit = 50;
		var maxDate = null;
		serverDate().then(function (dt) { pChat.attr('data-last-load', dt.toJSON()); });
		me.cursorLoading(true);
		me.dataProvider.getMessages(msgLimit, maxDate).then(
			function (res) {
				var $chat = pChat.find('div.wapp-chat');
				if (res.length < msgLimit) {
					$chat.hide();
				} else {
					$chat.show();
				}

				if (res.length > 0) {
					var $cont = pChat.find('div.wapp-messages');
					var atBottom = ($cont.scrollTop() + $cont.innerHeight() + 20 >= $cont[0].scrollHeight);
					var sessionUpdated = false;
					res.sort(function (a, b) {
						return a.date - b.date;
					})
					let promises = [];
					res.forEach(message => {
						promises.push(me.insertMsg(message));
					});

					Promise.all(promises).then(function () {
						if (pOlders && $older.length > 0) {
							$cont.scrollTop($older.offset().top - $cont.offset().top + $cont.scrollTop() - 40);
						} else {
							if (atBottom) {
								if ($cont[0].scrollHeight - ($cont.scrollTop() + $cont.innerHeight()) > 20) {
									$cont.scrollTop($cont[0].scrollHeight);
								}
							}
							else {
								setTimeout(function () {
									$cont.scrollTop($cont[0].scrollHeight);
								}, 1500);
							}
						};

						me.cursorLoading(false);
					});
				}
			}, function (err) {
				//TODO: error
			});
	};

	var loadMore = function (el) {
		me.cursorLoading(true);
		loadMessages($(el).closest('div.wapp-chat'), true);
	};
	// Enter manda, shift enter nueva linea
	var inputKeyDown = function (el, ev) {
		var keyCode = ev.which || ev.keyCode;
		if (keyCode == 13 && !ev.shiftKey && typeof (cordova) != 'object') {
			// send
			ev.preventDefault();
			send(el);
		}
	};

	var send = function (el) {
		var $chat = $(el).closest(me.options.selector);
		var $inp = $chat.find('.wapp-reply');
		if ($inp.val() && $inp.prop("disabled") == false) {
			me.cursorLoading(true);
			$inp.prop("disabled",true);
			let body = $inp.val();
			let type = $(me.options.selector + " .message-type-button").attr('data-message-class');
			let message = null;
			debugger;
			try {
				eval("message = new " + type + "();");
			} catch (error) {
				console.error("Error al enviar mensaje de tipo " + type);
				$inp.prop("disabled",false);
				return;
			}
			$inp.val('');
			message.body = body;
			message.date = new Date();
			me.dataProvider.sendMessage(message).then(function (obj) {
				$inp.prop("disabled",false);
				me.insertMsg(obj).then(function () {
					inputResize($inp[0]);
					me.cursorLoading(false);
				});
			}, function (err) {
				$inp.prop("disabled",false);
				console.error("err " + JSON.stringify(err), err);
				me.cursorLoading(false);
			});
		}
	};

	var serverDate = function () {
		return new Promise(function (resolve, reject) {
			resolve(new Date());
		});
	};

	/**
	 * function displayMenu(tree, element) {
		// Check if Framework7 is defined
		if (typeof Framework7 !== 'undefined') {
		// If Framework7 is defined, create a new popup
		var popup = Framework7.popup.create({
			content: '<ul></ul>'
		});
	
		// Get the ul element from the popup content
		var ul = $(popup.el).find('ul');
		} else {
		// If Framework7 is not defined, create a new dropdown
		var dropdown = $('<div class="dropdown"><button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Select Message Type</button><ul class="dropdown-menu" aria-labelledby="dropdownMenuButton"></ul></div>');
	
		// Get the ul element from the dropdown
		var ul = dropdown.find('ul');
		}
	
		// Loop through each item in the tree
		tree.forEach(function(item) {
		// Create a new li element
		var li = $('<li>');
	
		// Create a new a element
		var a = $('<a>').text(item.name);
	
		// Check if the item has children
		if (item.children && item.children.length > 0) {
			// If the item has children, recursively call the displayMenu function to create a nested list
			var nestedMenu = displayMenu(item.children);
			// Add the nested list to the li element
			li.append(nestedMenu);
		}
	
		// Add the a element to the li element
		li.append(a);
	
		// Add the li element to the ul element
		ul.append(li);
		});
	
		// Check if Framework7 is defined
		if (typeof Framework7 !== 'undefined') {
		// If Framework7 is defined, open the popup
		popup.open();
		} else {
		// If Framework7 is not defined, add the dropdown to the specified element
		$(element).append(dropdown);
		}
	}
	

	var tree = [  
		{    
			name: 'Text',
			type: "",
			children: [      
				{        
					name: 'Single Line'
				},      
				{        
					name: 'Multi Line'      
				}    
			]
		},
		{
		name: 'Voice'
		},
		{
		name: 'Video'
		},
		{
		name: 'File'
		}
	];

	var element = '#myDropdown';

	displayMenu(tree, element);
	 */
	var insertWebMessageTypesOptionsMenu = function($menu){
		/*var $liTmp = $('<li/>', {
			class: 'dropdown-submenu',
		}).appendTo($menu);*/
		let quickTypesCount = me.dataProvider.msgproviders
		for (let index = 0; index < me.dataProvider.msgproviders.length; index++) {
			const prov = me.dataProvider.msgproviders[index];
			for (let p = 0; p < prov.supportedTypes.length; p++) {
				const typeName = prov.supportedTypes[p];
				let foundType = null;
				let typeIndex = -1;
				for (let index = 0; index < me.options.quickMessageTypes.length; index++) {
					const element = me.options.quickMessageTypes[index];
					if(typeof(element) == "string"){
						if(element == typeName){
							foundType = element;
							typeIndex = index;
						}
					}
					if(typeof(element) == "object"){
						if(element.type == typeName){
							foundType = element;
							typeIndex = index;
						}
					}
				}

				if(foundType == null) continue;
				
				appendWebMessageTypeOption($menu, foundType, typeName,me.options.quickMessageTypes.length,prov);
			}
		}
	};

	var appendWebMessageTypeOption = function($menu, menuOption, typeName, quickTypes, prov){
		let msgInst = null;
		try {
			eval("msgInst = new " + typeName + "();");
			var thisInstance = me;
			if (msgInst != null) {
				if(quickTypes > 1){
					var $li = $('<li/>', {class: "dropdown-item"}).appendTo($menu);
					let $actionLink = $('<a/>',{
						class:"quick-message-item"
					}).append('<i class="fa ' + msgInst.icon + '"></i> <span>' + msgInst.type + '</span>').appendTo($li);
					$li.click(function (e) {
						var $this = $(this);
						let currentType = $(thisInstance.options.selector + " .message-type-button").attr('data-message-type');
						$(thisInstance.options.selector + " .message-type-button > i").attr('class', "").attr("class", $this.find('i').first().attr('class'));
						$(thisInstance.options.selector + " .message-type-button").attr('data-message-type', msgInst.type);
						$(thisInstance.options.selector + " .message-type-button").attr('data-message-class', msgInst.constructor.name);
						if (thisInstance.options.quickMessageChanged) {
							thisInstance.options.quickMessageChanged(msgInst.constructor.name, $li);
						}
						/*if(typeof(menuOption) == "object"){
							if(menuOption.children && menuOption.children.length > 0){
								//$this.parents(".dropup").addClass('open');
								e.stopPropagation();
							}
						}*/
						//Si efectivamente se está cambiando de tipo de mensaje, oculto los submenu de los otros tipos
						if(currentType != msgInst.type) {
							$(thisInstance.options.selector + " .message-type-button li.dropdown-submenu ul").hide()
						}
						//Parent li
						let subMenuToShow = $this.children("ul.dropdown-menu");
						if(subMenuToShow.length > 0){
							subMenuToShow.toggle();
							e.stopPropagation();
						}
						else{
							$this.parent().removeClass("show");
							$this.children("i").attr("aria-expanded","false");
						}
					});

					if(prov.getQuickMessageOptions){
						prov.getQuickMessageOptions(typeName).then(options=>{
							addRecursively($li, options, thisInstance.options.quickOptionSelected, typeName, prov);
						});
					}
				}
				else{
					$menu.parent().children("i").click(function(e){
						if (thisInstance.options.quickMessageChanged) {
							thisInstance.options.quickMessageChanged(msgInst.constructor.name, null);
						}
					});
				}
				if(typeof(menuOption) == "object"){
				 	if(menuOption.children && menuOption.children.length > 0){
						$(this).parent().toggleClass('open');
						// $($menu).find("li ul.dropdown-menu").on('click', function(e) {
						// 	debugger;
						// 	e.stopPropagation();
						// });
					}
				}
			}
		} catch (error) {
			//TODO
		}
		function addRecursively(liItem, children, clickHandler, typeName, provider){
			if(children && children.length > 0){
				liItem.addClass("dropdown-submenu");
				var $subMenu = $('<ul/>', {class: "dropdown-menu"}).appendTo(liItem);
				for (let index = 0; index < children.length; index++) {
					const option = children[index];
					var $li = $('<li/>', {class: "dropdown-item"}).appendTo($subMenu);
					let $actionLink = $('<a/>').append('<i class="fa ' + option.webIcon + '"></i> ' + option.text).appendTo($li);
					
					$li.click(function (e) {
						var $this = $(this);
						let subMenuToShow = $(this).children("ul.dropdown-menu");
						subMenuToShow.toggle();
						if(subMenuToShow.outerHeight() > 390){
							subMenuToShow.css("overflow-y","auto");
						}
						//let display = subMenuToShow.css("display") == "none" ? display = "block" : display = "none";
						//.css('display',display);
						e.stopPropagation();
						if(option.selectable){
							hideMenu();
						}
						if(option.selectable && clickHandler){
							if(provider.executeQuickOption){
								provider.executeQuickOption(option, typeName);
							}
							clickHandler(option, typeName, provider);
						}
					});
					if(option.children && option.children.length > 0){
						addRecursively($li, option.children, clickHandler, typeName, provider);
					}
				}
			}
		}
	};

	var hideMenu = function(){
		//TODO Cordova
		$mainContainer.find(".message-type-button > .dropdown-menu.show").removeClass("show")
	};

	var insertMobileMessageTypeOptionsMenu = function ($div, $media) {
		var btns = [];
		
		//Si es un solo provider, al hacer click en el icono de mensaje, se debe mostrar directamente las subopciones de ese provider
		if(me.dataProvider.msgproviders.length == 1){
			let prov = me.dataProvider.msgproviders[0];
			if(prov.getQuickMessageOptions){
				const typeName = prov.supportedTypes[0];
				prov.getQuickMessageOptions(typeName).then(options=>{
					for(let opIndx = 0; opIndx < options.length; opIndx++){
						try {
							const option = options[opIndx];
							var thisInstance = me;
							btns.push({
								text: '<i class="f7-icons">' + option.icon + '</i> <span>' + option.text + '</span>',
								onClick: function () {
									debugger;
									$(thisInstance.options.selector + " .message-type-button > i").attr('class', "").attr("class", $(this.text).attr("class"));
									$(thisInstance.options.selector + " .message-type-button").attr('data-message-type', typeName);
									$(thisInstance.options.selector + " .message-type-button").attr('data-message-class', typeName);
									if (thisInstance.options.quickMessageChanged) {
										thisInstance.options.quickMessageChanged(typeName);
									}
									// if(prov.getQuickMessageOptions){
									// 	prov.getQuickMessageOptions(typeName).then(subOptions=>{
									// 		if(subOptions && subOptions.length > 0){
									// 			tryToDisplayQuickMessageOptions(subOptions);
									// 		}
									// 	});
									// }
									
								}
							});
						} catch (error) {
							alert("whats");
							console.error("Error al agregar opcion de mensaje rapido: ", error);
						}
					}
				});
			}
		}
		else{
			for (let index = 0; index < me.dataProvider.msgproviders.length; index++) {
				const prov = me.dataProvider.msgproviders[index];
				for (let p = 0; p < prov.supportedTypes.length; p++) {
					const typeName = prov.supportedTypes[p];
					
					var found = me.options.quickMessageTypes.find((element) =>{
						if(typeof(element) == "string"){
							return element == typeName;
						}
						if(typeof(element) == "object"){
							return element.type == typeName;
						}
					})
	
					if (!found) continue;
					let msgInst = null;
					try {
						eval("msgInst = new " + typeName + "();");
						if (msgInst != null) {
							var thisInstance = me;
							btns.push({
								text: '<i class="fa ' + msgInst.icon + '"></i> <span>' + msgInst.type + '</span>',
								onClick: function () {
									debugger;
									$(thisInstance.options.selector + " .message-type-button > i").attr('class', "").attr("class", $(this.text).attr("class"));
									$(thisInstance.options.selector + " .message-type-button").attr('data-message-type', msgInst.type);
									$(thisInstance.options.selector + " .message-type-button").attr('data-message-class', msgInst.constructor.name);
									if (thisInstance.options.quickMessageChanged) {
										thisInstance.options.quickMessageChanged(msgInst.constructor.name);
									}
									if(prov.getQuickMessageOptions){
										prov.getQuickMessageOptions(typeName).then(subOptions=>{
											if(subOptions && subOptions.length > 0){
												tryToDisplayQuickMessageOptions(subOptions);
											}
										});
									}
									
								}
							})
							
						}
					} catch (error) {
					}
				}
			}
		}



		

		$media.click(function (e) {
			//  Media options
			var mediaActions = app7.actions.create({
				buttons: [
					btns,
					[
						{
							text: 'Cancelar',
							bold: true,
							close: true,
						}
					]
				]
			});
			mediaActions.params.chatEl = $div;
			mediaActions.open();
		});
	};

	var tryToDisplayQuickMessageOptions = function(options){
		//TODO
		/*//  Media options
		var mediaActions = app7.actions.create({
			buttons: [
				btns,
				[
					{
						text: 'Cancelar',
						bold: true,
						close: true,
					}
				]
			]
		});
		mediaActions.params.chatEl = $div;
		mediaActions.open();*/
	}

	//Inicio el chat
	init($mainContainer);
}