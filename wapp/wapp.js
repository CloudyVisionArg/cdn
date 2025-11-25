var inApp = typeof app7 == 'object';

(async function () {
	$(function() {
		// Mostrar loading en todos los chats
		$('div.wapp-chat').html('<div class="wapp-loading"><div class="wapp-spinner"></div>Cargando chat...</div>');
	});
	
	await include([
		{ id: 'whatsapp-css' },
		{ id: 'jslib' },
		{ id: 'emojis' },
		{ id: 'linkify', src: 'https://cdn.jsdelivr.net/npm/linkifyjs@4.3.2/dist/linkify.min.js' },
		{ id: 'linkify-string', depends: ['linkify'], src: 'https://cdn.jsdelivr.net/npm/linkify-string@4.3.2/dist/linkify-string.min.js' },
	]);

	let root = document.documentElement;

	if (inApp) {
		// App
		root.style.setProperty('--wapp-chat-horizontal-margin', '20px');
		root.style.setProperty('--wapp-chat-vertical-margin', '10px');
		root.style.setProperty('--wapp-button-size', '30px');
		
	} else {
		// Web
		root.style.setProperty('--wapp-chat-horizontal-margin', '0px');
		root.style.setProperty('--wapp-chat-vertical-margin', '0px');
		root.style.setProperty('--wapp-button-size', '25px');
	};

	if (!window.doorsapi2) window.doorsapi2 = await import(scriptSrc('doorsapi2'));
	if (!window.dSession) {
		window.dSession = new doorsapi2.Session();
		utils = dSession.utils;

		if (!await dSession.webSession() || !await dSession.isLogged) {
			throw new Error('La sesion no ha sido iniciada');
		}
	}

	wapp.modWapp = await import(gitCdn({
		repo: 'Global',
		path: 'wappcnn/wapp.mjs',
		url: true,
		//fresh: true, //todo: sacar fresh
	}))
	wapp.modWapp.setContext({ dSession });

	wapp.rootFolderId = await dSession.settings('WHATSAPP_CONNECTOR_FOLDER');
	wapp.rootFolder = await dSession.folder(wapp.rootFolderId);
	wapp.messagesFolder = await wapp.rootFolder.folder('messages');
	wapp.templatesFolder = await wapp.rootFolder.folder('templates');
	wapp.templates = {
		twilio: await wapp.modWapp.twTemplates(),
		local: await wapp.templatesFolder.search({
			fields: 'name, text, content_sid',
			order: 'name',
		}),
	}

	wapp.loggedUser = await dSession.currentUser;

	if (!inApp) {
		// El DIV para mostrar imagenes fullScreen
		$(document.body).append(`
			<div class="modal fade" id="wappModal" tabindex="-1" role="dialog">
			<div class="modal-dialog" style="width: fit-content; margin: auto;">
				<div class="modal-content">
				<div class="modal-body" style="padding: 5px;"></div>
				<button style="position: fixed; top: 10px; right: 10px; background-color: white; padding: 0 5px 5px 5px; opacity: 0.5;" type="button" class="close" data-dismiss="modal">
					<span aria-hidden="true">&times;</span>
				</button>
				</div>
			</div>
			</div>
		`);

		// El input para leer archivos
		let $file = $('<input/>', {
			type: 'file',
			id: 'wappFile',
			style: 'display: none;'
		}).appendTo(document.body);

		$file.change(function (e) {
			let inp = e.target;
			if (inp.files.length > 0) {
				wapp.sendMedia(inp.files[0], $(inp).prop('data-chat'));
				inp.value = '';
			}
		})
	}

	$(document).ready(() => {
		if (!inApp) {
			// Carga inicial
			$('div.wapp-chat').each(function () {
				wapp.init($(this));
			});
		}
		
		// Carga mensajes nuevos cada 5 segs
		setInterval(function () {
			wapp.checkSession(function () {
				$('div.wapp-chat[data-rendered]:not([data-disabled])').each(function () {
					wapp.loadMessages($(this));
				});
			});
		}, 5000);

		// Actualiza el estado de la sesion cada 1'
		setInterval(function () {
			wapp.checkSession(function () {
				$('div.wapp-chat[data-rendered]:not([data-disabled])').each(function () {
					wapp.refreshSession($(this));
				});
			});
		}, 60000);
		
		// Event handler for error icon tooltips
		$(document).on('click', '.error-icon', function(e) {
			e.stopPropagation();
			var errorText = $(this).data('error');
			if (errorText) {
				wapp.toast(errorText);
			}
		});
		
		// Event handler for chat resize
		$(document).on('mousedown', '.wapp-resize-handle', function(e) {
			e.preventDefault();
			var $messages = $(this).closest('.wapp-chat').find('.wapp-messages');
			var startY = e.pageY;
			var startHeight = $messages.height();
			
			function doDrag(e) {
				var newHeight = startHeight + (e.pageY - startY);
				var minHeight = parseInt($messages.css('min-height'));
				var maxHeight = parseInt($messages.css('max-height'));
				
				if (newHeight < minHeight) newHeight = minHeight;
				if (newHeight > maxHeight) newHeight = maxHeight;
				
				$messages.height(newHeight);
			}
			
			function stopDrag() {
				$(document).off('mousemove', doDrag);
				$(document).off('mouseup', stopDrag);
			}
			
			$(document).on('mousemove', doDrag);
			$(document).on('mouseup', stopDrag);
		});
	});

	wapp.readyFlag = true;
})();

var wapp = {
	rootFolder: undefined,
	messagesFolder: undefined,
	templatesFolder: undefined,
	templates: undefined,
	loggedUser: undefined,
	codelibUrl: undefined,
	s3: undefined,

	toast: function (pMsg) {
		if (inApp) {
			toast(pMsg);
		} else {
			if (typeof(toast) == 'function') {
				toast(pMsg);
			} else {
				alert(pMsg);
			}
		}
	},

	ready: function (pCallback) {
		var interv = setInterval(function () {
			if (wapp.readyFlag) {
				clearInterval(interv);
				if (pCallback) pCallback();
			}
		}, 10)
	},

	cursorLoading: function(pLoading) {
		if (inApp) {
			if (pLoading) {
				app7.preloader.show();
			} else {
				app7.preloader.hide();
			}

		} else {
			$('body').css('cursor', pLoading ? 'progress' : 'default');
		}
	},

	checkSession: function (pCallback) {
		if (inApp) {
			if (app7.online) {
				dSession.checkToken(pCallback);
			}
		} else {
			//todo: chequear aca tb
			if (pCallback) pCallback();
		}
	},

	viewImage: function (e) {
		if (inApp) {
			var popup = getPopup();
			var $cont = popup.$el.find('.page-content .block');

			var $img = $('<img/>').appendTo($cont);
			$img.attr('src', $(this).attr('src'));
			$img.load(function () {
				//$cont.html($img);
				//$modalDialog.css({marginTop: ($(window).height() - $modalBody.height() - 30) / 2});
			});

			popup.open();

		} else {
			var $modal = $('#wappModal');
			var $modalDialog = $modal.find('.modal-dialog');
			var $modalBody = $modal.find('.modal-body');
			$modalBody.html('<div style="padding: 30px;">Cargando...</div>');
			$modalDialog.css({marginTop: ($(window).height() - 150) / 2});
			$modal.modal('show');
			var $img = $('<img/>');
			$img.css({maxHeight: $(window).height() - 30, maxWidth: '100%'});
			$img.attr('src', $(this).attr('src'));
			$img.load(function () {
				$modalBody.html($img);
				$modalDialog.css({marginTop: ($(window).height() - $modalBody.height() - 30) / 2});
			});
		}
	},
	
	renderChat: function(pCont) {
		var $cont = $(pCont);

		if ($cont.attr('data-rendered') == '1') {
			$cont.find('span.external-name').html($cont.attr('data-external-name'));
			$cont.find('span.external-number').html($cont.attr('data-external-number'));
			$cont.find('span.internal-name').html($cont.attr('data-internal-name'));
			$cont.find('span.internal-number').html($cont.attr('data-internal-number'));

		} else {
			$cont.empty();
			
			var $heading = $('<div/>', {
				class: 'wapp-header',
			}).appendTo($cont);
			
			var $headingLeft = $('<div/>', {
				style: 'width: 40%;',
			}).appendTo($heading);
			
			$headingLeft.append('<b><span class="external-name">' + $cont.attr('data-external-name') + 
				'</span></b><br>(<span class="external-number">' + $cont.attr('data-external-number') + '</span>)');
			
			var $headingSession = $('<div/>', {
				class: 'session',
				style: 'width: 20%; text-align: center;',
			}).appendTo($heading);
			
			$headingSession.append('<img height="30" src="https://cdn.cloudycrm.net/ghcv/cdn@55/wapp/red.png" />');
			$headingSession.append('<div class="session-time"></div>');

			var $headingRight = $('<div/>', {
				style: 'width: 40%; text-align: right;',
			}).appendTo($heading);

			$headingRight.append('<b><span class="internal-name">' + $cont.attr('data-internal-name') +
			'</span></b><br>(<span class="internal-number">' + $cont.attr('data-internal-number') + '</span>)');

			// Select de operador en la columna derecha
			var $operatorDiv = $('<div/>', {
				style: 'margin-top: 8px; display: flex; align-items: center; gap: 5px; justify-content: flex-end;',
			}).appendTo($headingRight);

			$operatorDiv.append('<span style="font-size: 14px;">👤</span>');

			var $select = $('<select/>', {
				class: 'wapp-operator',
				style: 'padding: 5px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 12px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer;',
			}).appendTo($operatorDiv);

			$select.append('<option value="">(no asignado)</option>');

			// Cargar operadores y valor inicial
			dSession.directory.accountsSearch('(disabled = 0 or disabled is null) and system = 0', 'name').then(
				async res => {
					res.forEach(row => {
						let $o = $('<option/>', { 'value': row['AccId'] });
						$o.html(row['Name']);
						$o.appendTo($select);
					});

					// Cargar valor inicial del chat
					try {
						let chatDoc = await wapp.modWapp.chat({
							intNum: $cont.attr('data-internal-number'),
							extNum: $cont.attr('data-external-number'),
							name: $cont.attr('data-external-name'),
						});

						let operatorValue = chatDoc.fields('operator').value;
						if (operatorValue) {
							$select.val(operatorValue);
						}
					} catch(err) {
						console.error('Error cargando operador inicial:', err);
					}
				}
			);

			// Guardar operador al cambiar
			$select.change(async function() {
				let operatorId = $(this).val();

				try {
					let chatDoc = await wapp.modWapp.chat({
						intNum: $cont.attr('data-internal-number'),
						extNum: $cont.attr('data-external-number'),
						name: $cont.attr('data-external-name'),
					});

					chatDoc.fields('operator').value = operatorId;
					await chatDoc.save();

					console.log('Operador guardado:', operatorId);
				} catch(err) {
					console.error('Error guardando operador:', err);
					wapp.toast(dSession.utils.errMsg(err));
				}
			});

			var $messages = $('<div/>', {
				class: 'wapp-messages',
			}).appendTo($cont);
			
			// Observer que salta cdo se pone visible el div y dispara un evento
			let options = {
				root: document.documentElement,
			};
			let observer = new IntersectionObserver((entries, observer) => {
				entries.forEach(entry => {
					$messages[0].dispatchEvent(new CustomEvent('visibilityChange', {
						detail : { visible: entry.intersectionRatio > 0 }
					}));
				});
			}, options);
			observer.observe($messages[0]);
		
			// Cdo se pone visible hace el scroll, que se calcula al final del loadMessages
			$messages.on('visibilityChange', (ev) => {
				if (ev.detail.visible) {
					let scroll = $messages.attr('data-scroll');
					if (scroll) {
						let $cont = $messages;
						eval(scroll);
						$messages.removeAttr('data-scroll');
						console.log('scroll done');
					}
				}
			});
			
			$messages.append(`      
				<div class="wapp-loadmore" style="text-align: center; margin-bottom: 15px;">
					<a onclick="wapp.loadMore(this)">Mensajes anteriores</a>
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
			if (!inApp) {
				// WEB

				var $dropup = $('<div/>', {
					class: 'btn-group dropup',
				}).appendTo($div);

				$media = $('<i/>', {
					class: 'fa fa-plus',
					'data-toggle': 'dropdown',
					'data-bs-toggle': 'dropdown',
				}).appendTo($dropup);

				var $menu = $('<ul/>', {
					class: 'dropdown-menu',
				}).appendTo($dropup);

				var $li = $('<li/>').appendTo($menu);
				
				var $file = $('<a/>').append('<i class="fa fa-paperclip"></i>&nbsp;&nbsp;Archivo');
				$file.addClass('dropdown-item');
				$file.appendTo($li);
				$file.click(function (e) {
					wapp.sendFileWeb($cont[0]);
				});

				var $liAudio = $('<li/>').appendTo($menu);
				
				var $audio = $('<a/>').append('<i class="fa fa-microphone"></i>&nbsp;&nbsp;Audio');
				$audio.addClass('dropdown-item');
				$audio.appendTo($liAudio);
				$audio.click(function (e) {
					wapp.sendAudioWeb($cont[0]);
				});

				var $liTmp = $('<li/>', {
					class: 'dropdown-submenu',
				}).appendTo($menu);

				var $aTmp = $('<a/>').append('<i class="fa fa-file-text-o"></i>&nbsp;&nbsp;Plantilla');
				$aTmp.addClass('dropdown-item');
				$aTmp.appendTo($liTmp);

				$aTmp.click(function (e) {
					if (!wapp.templates) {
						wapp.toast('No hay plantillas definidas');
						return;
					}
					
					const $reply = $(this).closest('.wapp-footer').find('.wapp-reply')[0];
					const x = Math.max(50, Math.min(e.pageX, window.innerWidth - 400));
					const y = Math.max(50, Math.min(e.pageY + 10, window.innerHeight - 450));
					wapp.templatePicker.showPicker(x, y, $reply);
				});

				$('<li/>', {
					role: 'separator',
					class: 'divider',
				}).append('<hr class="dropdown-divider">').appendTo($menu);
				
				var $liReload = $('<li/>').appendTo($menu);
				var $aReload = $('<a/>').append('<i class="fa fa-refresh"></i>&nbsp;&nbsp;Recargar media');
				$aReload.addClass('dropdown-item');
				$aReload.appendTo($liReload);
				
				$aReload.click(function (e) {
					const $chat = $(this).closest('.wapp-chat');
					wapp.reloadMedia($chat);
				});

				$('<li/>', {
					role: 'separator',
					class: 'divider',
				}).append('<hr class="dropdown-divider">').appendTo($menu);
				
				var $li = $('<li/>').appendTo($menu);
				$('<a class="dropdown-item" />').append('Cancelar').appendTo($li);

				//todo: agregar soporte para enviar audios

			} else {
				// APP

				$media = $('<i/>', {
					class: 'f7-icons',
				}).append('plus').appendTo($div);

				$media.click(function (e) {
					//  Media options
					var mediaActions = app7.actions.create({
						buttons: [
							[
								{
									text: '<i class="f7-icons">mic</i>&nbsp;&nbsp;Mensaje de voz',
									onClick: function () {
										wapp.sendAudio(mediaActions.params.chatEl);
									}
								},
								{
									text: '<i class="f7-icons">camera</i>&nbsp;&nbsp;C&aacute;mara',
									onClick: function () {
										wapp.sendCamera(mediaActions.params.chatEl);
									}
								},
								{
									text: '<i class="f7-icons">photo</i>&nbsp;&nbsp;Fotos y Videos',
									onClick: function () {
										wapp.sendPhoto(mediaActions.params.chatEl);
									}
								},
								{
									text: '<i class="f7-icons">doc</i>&nbsp;&nbsp;Documento',
									onClick: function () {
										toast('En desarrollo');
									}
								},
								{
									text: '<i class="f7-icons">placemark</i>&nbsp;&nbsp;Ubicaci&oacute;n',
									onClick: function () {
										toast('En desarrollo');
									}
								},
								{
									text: '<i class="f7-icons">chat_bubble_text</i>&nbsp;&nbsp;Plantillas',
									onClick: function (actions, e) {
										actions.close();
										
										if (!wapp.templates) {
											toast('No hay plantillas definidas');
											return;
										}
										
										const $reply = $(actions.params.chatEl).find('.wapp-reply')[0];
										const x = 50;
										const y = 100;
										wapp.templatePicker.showPicker(x, y, $reply);
									}
								},
							],
							[
								{
									text: 'Cancelar',
									bold: true,
									close: true,
								}
							]
						]
					});
	
					mediaActions.params.chatEl = $cont[0];
					mediaActions.open();
				});
			}

			// Boton Emoji
			if (!inApp) {
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
				style: 'width: ' + (inApp ? '80%' : '70%') + 
					'; padding-left: 5px; padding-right: 5px;',
			}).appendTo($reply);
			
			var $input = $('<textarea/>', {
				class: 'wapp-reply',
				style: 'height: 37px;',
			}).appendTo($div);
			$input.change(function () { wapp.inputResize(this); });
			$input.keyup(function () { wapp.inputResize(this); });
			$input.keydown(function (e) { wapp.inputKeyDown(this, e); });

			// Emoji picker
			if (!inApp) {
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
			if (!inApp) {
				$send = $('<i/>', {
					class: 'fa fa-send',
				}).appendTo($div);
			} else {
				$send = $('<i/>', {
					class: 'f7-icons',
				}).append('paperplane_fill').appendTo($div);
			}
			
			$send.click(function () {
				wapp.send(this);
			});

			// Agregar handle de redimensionado después del footer
			var $resizeHandle = $('<div/>', {
				class: 'wapp-resize-handle',
			}).appendTo($cont);

			$cont.attr('data-rendered', '1');
		}
	},

	external: function(pCont, pData) {
		var $cont = $(pCont);
		
		if (pData === undefined) {
			// Getter
			return {
				name: $cont.attr('data-external-name'),
				number: $cont.attr('data-external-number')
			};
		} else {
			// Setter
			if (pData.name) $cont.attr('data-external-name', pData.name);
			if (pData.number) $cont.attr('data-external-number', pData.number);
			
			// Esperar inicialización y después llamar init
			wapp.ready(() => {
				wapp.init($cont);
			});
		}
	},

	init: function (pCont) {
		var $cont = $(pCont);
		wapp.renderChat($cont);
		wapp.clear($cont);
		
		// Esperar inicialización antes de cargar mensajes
		wapp.ready(() => {
			wapp.loadMessages($cont);
			wapp.refreshSession($cont);
		});
	},
	
	refreshSession: async function (pChat, pDate) {
		if (pDate) {
			render(pDate);

		} else {
			var extNumber = pChat.attr('data-external-number');
			var intNumber = pChat.attr('data-internal-number');
			if (!extNumber || !intNumber) return;

			// Elimina los caracteres no numericos y da vuelta
			var extNumberRev = wapp.cleanNumber(extNumber);
			var intNumberRev = wapp.cleanNumber(intNumber);

			var formula = 'from_numrev like \'' + extNumberRev + '%\' and to_numrev like \'' + intNumberRev + '%\'';
			
			let res = await wapp.messagesFolder.search({
				fields: 'created',
				formula,
				order: 'created desc',
				maxDocs: 1,
			});

			render(res.length > 0 ? res[0]['CREATED'] : undefined);
		};
		
		function render(pDate) {
			var light, remain;

			if (pDate) {
				var hours = (new Date() - new Date(pDate)) / (60 * 60 * 1000);
				if (hours < 24) {
					light = 'green';
					remain = 24 - hours;
					remainMin = parseInt((remain - parseInt(remain)) * 60);
					remain = parseInt(remain) + ':' + ('0' + remainMin).slice(-2);
				} else {
					light = 'red';
					remain = '';
				}
			} else {
				light = 'red';
				remain = '';
			}
			
            var $img = pChat.find('.wapp-header .session img');
            $img.attr('src', 'https://cdn.cloudycrm.net/ghcv/cdn@55/wapp/' + light + '.png');
			var $remain = pChat.find('.wapp-header .session .session-time');
			$remain.html(remain);
		}
	},
	
	insertMsg: async function (pChat, pMsg) {
		var $cont = pChat.find('div.wapp-messages');
		var $msgs = pChat.find('div.wapp-message');
		if ($msgs.length == 0) {
			await wapp.renderMsg(pMsg, function (msgRow) {
				$cont.append(msgRow);
				if (msgRow.attr('data-last-media-url')) {
					pChat.attr('data-last-media-url', msgRow.attr('data-last-media-url'));
				}
			});
		} else {
			var $msg = $msgs.filter('[data-sid="' + pMsg.sid + '"]');
			if ($msg.length > 0) {
				// Ya esta, actualizo el status
				$msg.find('.wapp-message-status-container').html(wapp.getTicks(pMsg.status, pMsg.errorCode, pMsg.errorMessage));
			} else {
				$msg = $msgs.first();
				await wapp.renderMsg(pMsg, function (msgRow) {
					if (pMsg.date <= $msg.attr('data-date')) {
						$msg.before(msgRow);
					} else {
						$msg = $msgs.last();
						while ($msg.attr('data-date') > pMsg.date) $msg = $msg.prev();
						if ($msg) {
							$msg.after(msgRow);
						} else {
							// No deberia llegar aca, lo pongo al ultimo
							$cont.append(msgRow);
						}
					}
					if (msgRow.attr('data-last-media-url')) {
						pChat.attr('data-last-media-url', msgRow.attr('data-last-media-url'));
					}
				});
			}
		}
	},
	
	renderMsg: async function (pMsg, pCallback) {
		// Pide el media, si no esta
		if (pMsg.numMedia > 0) {
			if (!pMsg.media) {
				wapp.msgMedia(pMsg.sid).then(
					async function (res) {
						pMsg.media = res;
						await render(pMsg, pCallback);
					},
					async function (err) {
						debugger;
						console.log(err.responseText);
						await render(pMsg, pCallback);
					}
				);
			} else {
				await render(pMsg, pCallback);
			}
		} else {
			await render(pMsg, pCallback);
		}
		
		// Renderiza
		async function render(pMsg, pCallback) {
			var appendBody = true;
			var lastMediaUrl = null;
			
			var $row = $('<div/>', {
				class: 'wapp-message',
				'data-sid': pMsg.sid,
				'data-date': pMsg.date,
			});
			
			var $msg = $('<div/>', {
				class: 'wapp-' + pMsg.direction.replaceAll('-api', ''),
			}).appendTo($row);
		
			if (pMsg.operator) $msg.append(pMsg.operator);
			
			var $msgText = $('<div/>', {
				class: 'wapp-message-text',
			}).appendTo($msg);
		
			if (pMsg.numMedia > 0 && pMsg.media) {
				var media = undefined;
				try {
					media = JSON.parse(pMsg.media);
				} catch (err) {
					debugger;
					console.log(err);
				};
				if (media) {
					
					for (const it of media) {
						// https://www.twilio.com/docs/whatsapp/guidance-whatsapp-media-messages#supported-mime-types
						
						if (it.Url) lastMediaUrl = it.Url;
						
						var $div = $('<div/>').appendTo($msgText);
						var $btn;
						
						if (it.ContentType.substr(0, 5) == 'image') {
							var $img = $('<img/>', {
								src: it.Url,
								style: 'cursor: pointer; width: 100%; height: 130px; object-fit: cover;',
							}).click(wapp.viewImage).appendTo($div);
							
							
						} else if (it.ContentType.substr(0, 5) == 'audio') {
							var $med = $('<audio/>', {
								controls: true,
								style: 'width: 230px;',
							}).appendTo($div);
							
							$med.append('<source src="' + it.Url + '" type="' + it.ContentType + '">');
							

						} else if (it.ContentType.substr(0, 5) == 'video') {
							var $med = $('<video/>', {
								controls: true,
								style: 'width: 100%; object-fit: contain;',
							}).appendTo($div);
							
							$med.append('<source src="' + it.Url + '" type="' + it.ContentType + '">');
							

						} else if (it.ContentType.substr(0, 11) == 'application') {
							// todo: no anda en cordova
							$('<a/>', {
								target: '_blank',
								href: it.Url,
								download: pMsg.body,
								style: 'font-weight: 500;',
							}).append(pMsg.body).appendTo($div);
							
							appendBody = false;
						}
					};
				}
			}
			
			if (pMsg.latitude || pMsg.longitude) {
				var lat = pMsg.latitude;
				var lng = pMsg.longitude;
				
				var $div = $('<div/>').appendTo($msgText);

				var key;
				if (inApp) {
					/*
					todo: falta restringir esta clave (no se puede ingresar la URL ionic://localhost)
					https://developers.google.com/maps/documentation/javascript/get-api-key
					*/
					key = decrypt('U2FsdGVkX1980jboiLSByehdC4OHgstgnLMTIAR3jlMmshxjimk1mfzFVv2NcgRQkl+FEI8GtQM+DmvOb8Cymg==', '');
				} else {
					key = 'AIzaSyDZy47rgaX-Jz74' + 'vgsA_wTUlbAodzLvnYY';
				}

				var $img = $('<img/>', {
					src: 'https://maps.google.com/maps/api/staticmap?center=' + lat + ',' + lng + '&markers=color:red%7Csize:mid%7C' + 
						lat + ',' + lng + '&zoom=15&size=260x130&key=' + key,
					style: 'cursor: pointer; width: 100%; height: 130px; object-fit: cover;',
				}).appendTo($div);

				$img.attr('data-lat', lat);
				$img.attr('data-lng', lng);

				$img.click(function () {
					var url = 'https://www.google.com/maps/place/' + $(this).attr('data-lat') + ',' + $(this).attr('data-lng');
					if (inApp) {
						cordova.InAppBrowser.open(url, '_system');
					} else {
						window.open(url);
					}
				});
			};

			if (appendBody) {
				var body = pMsg.body;
				if (body) {
					// Primero convertir URLs en links
					if (window.linkifyStr) {
						body = window.linkifyStr(body, {
							target: '_blank',
							attributes: {
								style: 'overflow-wrap: break-word;'
							},
						});
					}
					
					body = body.replace(/\n/g, '<br>'); // Reemp los \n con <br>
										
					// Versión mejorada con word boundary:
					body = body.replace(/(^|[\s\p{P}])\*([^*]+)\*(?=[\s\p{P}]|$)/gu, '$1<b>$2</b>'); // bold
					body = body.replace(/(^|[\s\p{P}])_([^_]+)_(?=[\s\p{P}]|$)/gu, '$1<i>$2</i>'); // italic
					body = body.replace(/(^|[\s\p{P}])~([^~]+)~(?=[\s\p{P}]|$)/gu, '$1<del>$2</del>'); // tachado
				};
				
				$msgText.append(body);
			}
			
			
			var $msgTime = $('<div/>', {
				class: 'wapp-message-time',
			}).appendTo($msg);
			
			dt = new Date(pMsg.date);
			$msgTime.append(wapp.formatDate(dt));
			
			if (pMsg.status) {
				$msgTime.append(' <span class="wapp-message-status-container">' + wapp.getTicks(pMsg.status, pMsg.errorCode, pMsg.errorMessage) + '</span>');
			}
			
			// Guardar la última media URL en el row
			if (lastMediaUrl) {
				$row.attr('data-last-media-url', lastMediaUrl);
			}
			
			if (pCallback) pCallback($row);
		}
	},
	
	// Deja crecer hasta 4 lineas, muestra los scrolls para mas
	inputResize: function (el) {
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
	},

	// La fecha corta de los msjs
	formatDate: function (pDate) {
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
	},

	// Devuelve los ticks segun el status
	getTicks: function (pStatus, pErrorCode, pErrorMessage) {
		var tick = '&#x2713;'
		if (pStatus == 'read') {
			return '<span class="wapp-message-status" style="color: #5FC4E8;">' + tick + tick + '</span>';
		} else if (pStatus == 'delivered') {
			return '<span class="wapp-message-status">' + tick + tick + '</span>';
		} else if (pStatus == 'sent') {
			return '<span class="wapp-message-status">' + tick + '</span>';
		} else if (pStatus == 'queued') {
			if (inApp) {
				return '<i class="f7-icons" style="font-size: 13px;">clock</i>';
			} else {
				return '<i class="fa fa-clock-o" />';
			}
		} else if (pStatus == 'undelivered') {
			var icon = inApp ? 
				'<i class="f7-icons" style="font-size: 13px;">exclamationmark_circle_fill</i>' :
				'<i class="fa fa-exclamation-circle" />';
			
			// Agregar click tooltip si hay error
			if (pErrorCode || pErrorMessage) {
				var errorText = pErrorMessage || `Error ${pErrorCode}`;
				icon = `<span class="error-icon" data-error="${errorText.replace(/"/g, '&quot;')}" style="cursor: pointer;">${icon}</span>`;
			}
			
			return icon;

		} else if (pStatus == 'failed') {
			var icon = inApp ? 
				'<i class="f7-icons" style="font-size: 13px;">exclamationmark_triangle_fill</i>' :
				'<i class="fa fa-exclamation-triangle" />';
			
			// Agregar click tooltip si hay error
			if (pErrorCode || pErrorMessage) {
				var errorText = pErrorMessage || `Error ${pErrorCode}`;
				icon = `<span class="error-icon" data-error="${errorText.replace(/"/g, '&quot;')}" style="cursor: pointer;">${icon}</span>`;
			}
			
			return icon;
			
		} else {
			return '??';
		}
	},

	clear: function (pChat) {
		var $messages = pChat.find('div.wapp-messages')
		$messages.empty();
		$messages.append(`      
			<div class="wapp-loadmore" style="text-align: center; margin-bottom: 15px;">
				<a onclick="wapp.loadMore(this)">Mensajes anteriores</a>
			</div>
		`);
		pChat.removeAttr('data-last-load');
	},

	cleanNumber: function (pNumber) {
		// Elimina los caracteres no numericos, da vuelta
		return pNumber.replace(/\D/g, '').reverse();
	},

	disableChat: function (pChat, pReason) {
		// Marcar como desactivado
		pChat.attr('data-disabled', '1');

		// Mostrar mensaje de error en el chat
		var $messages = pChat.find('div.wapp-messages');
		$messages.html(`
			<div style="
				text-align: center;
				padding: 40px 20px;
				color: #dc3545;
				background-color: #f8d7da;
				border: 1px solid #f5c6cb;
				border-radius: 8px;
				margin: 20px;
			">
				<i class="fa fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px;"></i>
				<h4 style="margin: 10px 0;">Chat desactivado</h4>
				<p style="margin: 5px 0;">${pReason}</p>
				<p style="margin: 10px 0; font-size: 14px; color: #721c24;">
					Por favor, configure correctamente los números de teléfono para activar este chat.
				</p>
			</div>
		`);

		// Deshabilitar el footer (área de respuesta)
		var $footer = pChat.find('div.wapp-footer');
		$footer.css({
			'opacity': '0.5',
			'pointer-events': 'none'
		});

		console.log('Chat desactivado por:', pReason);
	},

	enableChat: function (pChat) {
		// Quitar marca de desactivado
		pChat.removeAttr('data-disabled');

		// Limpiar mensajes y restaurar área de mensajes
		wapp.clear(pChat);

		// Restaurar el footer (área de respuesta)
		var $footer = pChat.find('div.wapp-footer');
		$footer.css({
			'opacity': '1',
			'pointer-events': 'auto'
		});

		console.log('Chat reactivado');
	},

	loadMessages: async function (pChat, pOlders) {
		if (wapp.sending) return;

		try {
			var msgLimit = 50;

			var extNumber = pChat.attr('data-external-number');
			var intNumber = pChat.attr('data-internal-number');

			// Validar números
			if (!extNumber || !intNumber) {
				throw new Error('Falta especificar nros');
			}

			var extNumberRev = wapp.cleanNumber(extNumber);
			var intNumberRev = wapp.cleanNumber(intNumber);

			if (extNumberRev.length < 10 || intNumberRev.length < 10) {
				throw new Error('Nros incorrectos');
			}

			// Si llegamos acá, los números son válidos
			// Si el chat estaba desactivado, reactivarlo
			if (pChat.attr('data-disabled') == '1') {
				wapp.enableChat(pChat);
			}

			var incLoad = false;
			var lastLoad = pChat.attr('data-last-load');
			if (lastLoad) lastLoad = new Date(new Date(lastLoad) - 5000);
			
			var formula = '(from_numrev like \'' + extNumberRev + '%\' and to_numrev like \'' + intNumberRev + 
				'%\') or (to_numrev like \'' + extNumberRev + '%\' and from_numrev like \'' + intNumberRev + '%\')';
			
			if (pOlders) {
				var $older = pChat.find('div.wapp-message').first();
				if ($older.length > 0) {
					var dt = new Date($older.attr('data-date'));
					formula = 'created < \'' + ISODate(dt) + ' ' + ISOTime(dt, true) + '\' and (' + formula + ')';
				}
			} else if (lastLoad) {
				incLoad = true;
				var dtEnc = '\'' + ISODate(lastLoad) + ' ' + ISOTime(lastLoad, true) + '\'';
				formula = '(created > ' + dtEnc + ' or modified > ' + dtEnc + ') and (' + formula + ')';
			};
			
			pChat.attr('data-last-load', (await dSession.utils.serverDate()).toJSON());

			let res = await wapp.messagesFolder.search({
				fields: '*',
				formula,
				order: 'created desc',
				maxDocs: msgLimit,
				maxTextLen: 0,
			});

			var $loadMore = pChat.find('div.wapp-loadmore a');
			if (res.length < msgLimit && !incLoad) {
				$loadMore.hide();
			}
					
			if (res.length > 0) {
				// Arma un array de AccId
				var ids = res.map(row => row['ACC_ID']);
				// Saca los repetidos
				ids = ids.filter((el, ix) => ids.indexOf(el) == ix);
				// Levanta los accounts, completa el nombre y renderiza
				let accs = await dSession.directory.accountsSearch('acc_id in (' + ids.join(',') + ')', 'name');

				var $cont = pChat.find('div.wapp-messages');
				// Si estoy al fondo
				var atBottom = ($cont.scrollTop() + $cont.innerHeight() + 20 >= $cont[0].scrollHeight);
				var sessionUpdated = false;
						
				for (const row of res) {
					row['ACC_NAME'] = accs.find(acc => acc['AccId'] == row['ACC_ID'])['Name'];

					var msg = {};
					msg.sid = row['MESSAGESID'];
					if (row['FROM_NUMREV'].indexOf(extNumberRev) >= 0) {
						msg.direction = 'inbound';
						if (!sessionUpdated && !pOlders) {
							wapp.refreshSession(pChat, row['CREATED']);
							sessionUpdated = true;
						};
					} else {
						msg.direction = 'outbound';
						msg.operator = row['ACC_NAME'];
						msg.status = row['STATUS'];
						msg.errorCode = row['ERRORCODE'];
						msg.errorMessage = row['ERRORMESSAGE'];
					}
					msg.body = row['BODY'];
					msg.date = row['CREATED'];
					msg.numMedia = row['NUMMEDIA'];
					msg.media = row['MEDIA'];
					msg.latitude = row['LATITUDE'];
					msg.longitude = row['LONGITUDE'];

					await wapp.insertMsg(pChat, msg);
				};
						
				if (pOlders && $older.length > 0) {
					$cont.scrollTop($older.offset().top - $cont.offset().top + $cont.scrollTop() - 40);
				} else {
					if (incLoad) {
						if (atBottom) {
							let scroll = `
								if ($cont[0].scrollHeight - ($cont.scrollTop() + $cont.innerHeight()) > 20) {
									$cont.scrollTop($cont[0].scrollHeight);
								}
							`;
							if ($cont[0].scrollHeight) { // Esta visible?
								// Lo ejecuta ahora
								eval(scroll);
							} else {
								// Lo ejecuta cdo se hace visible
								$cont.attr('data-scroll', scroll);
							}
						}
					} else {
						setTimeout(function () {
							let scroll = `
								$cont.scrollTop($cont[0].scrollHeight);
							`;
							if ($cont[0].scrollHeight) {
								eval(scroll);
							} else {
								$cont.attr('data-scroll', scroll);
							}
						}, 1500);
					}
				};

				wapp.cursorLoading(false);

			} else {
				wapp.cursorLoading(false);
			}

		} catch(err) {
			console.error(err);

			// Si el error es por números faltantes o incorrectos, desactivar el chat
			if (err.message === 'Falta especificar nros' || err.message === 'Nros incorrectos') {
				wapp.disableChat(pChat, err.message);
			} else {
				// Para otros errores, comportamiento original
				pChat.find('div.wapp-loadmore a').hide();
				debugger;
			}

			wapp.cursorLoading(false);
		}
	},

	loadMore: function (el) {
		debugger;
		wapp.cursorLoading(true);
		wapp.loadMessages($(el).closest('div.wapp-chat'), true);
	},

	// Enter manda, shift enter nueva linea
	inputKeyDown: function (el, ev) {
		var keyCode = ev.which || ev.keyCode;
		if (keyCode == 13 && !ev.shiftKey && !inApp) {
			// send
			ev.preventDefault();
			wapp.send(el);
		}
	},

	send: async function (el) {
		var $chat = $(el).closest('div.wapp-chat');
		var $inp = $chat.find('.wapp-reply');
		if ($inp.val()) {
			wapp.cursorLoading(true);
			wapp.sending = true;
			var fromN = $chat.attr('data-internal-number');
			var toN = $chat.attr('data-external-number');
			let sendObj = {
				from: fromN,
				to: toN,
				body: $inp.val(),
			};
			
			// Obtener template del input
			let temp = $inp[0]._template;
			if (temp && temp.sid) { // Solo los de Twilio se consideran templates
				sendObj.contentSid = temp.sid;
				sendObj.contentVariables = temp.variables;

				// Agrega el name del number pra poder levantar el service sid del number
				// Deberia enviarlo directamente como temp.messagingServiceSid
				let fromName = $chat.attr('data-internal-name');
				sendObj.from = fromName;
			}
			
			let msg;
			try {
				msg = await wapp.modWapp.send(sendObj);
			} catch(er) {
				console.error(er);
				wapp.toast(dSession.utils.errMsg(er));
				wapp.cursorLoading(false);
				wapp.sending = false;
				return;
			}

			/*
			ObjectaccountSid: "AC47a3e29520495dc61fe3a8c1fbb6a3e7"
			apiVersion: "2010-04-01"
			body: "eee"
			dateCreated: "2024-08-14T13:19:16.000Z"
			dateSent: null
			dateUpdated: "2024-08-14T13:19:16.000Z"
			direction: "outbound-api"
			doorsCreated: "2024-08-14T13:19:14.963Z"
			errorCode: null
			errorMessage: null
			from: "whatsapp:+15167152888"
			messagingServiceSid: null
			numMedia: "0"
			numSegments: "1"
			price: null
			priceUnit: null
			sid: "SMd89311e0556b25c68408a9d0b7f7127c"
			status: "queued"
			subresourceUris: {media: "/2010-04-01/Accounts/AC47a3e29520495dc61fe3a8c1fbb…ges/SMd89311e0556b25c68408a9d0b7f7127c/Media.json"}
			to: "whatsapp:+543515284577"
			uri: "/2010-04-01/Accounts/AC47a3e29520495dc61fe3a8c1fbb6a3e7/Messages/SMd89311e0556b25c68408a9d0b7f7127c.json"
			*/
			msg.operator = wapp.loggedUser.Name;
			msg.date = msg.doorsCreated;
			
			await wapp.renderMsg(msg, function (msgRow) {
				var $cont = $chat.find('div.wapp-messages');
				$cont.append(msgRow);
				$cont.scrollTop($cont[0].scrollHeight);
				if (msgRow.attr('data-last-media-url')) {
					$chat.attr('data-last-media-url', msgRow.attr('data-last-media-url'));
				}
				wapp.cursorLoading(false);
				wapp.sending = false;
			});

			$inp.removeAttr("data-content-sid");

			$inp.val('');
			wapp.inputResize($inp[0]);
		}
	},

	putTemplate: function (template, target) {
		// Guardar template completo en propiedad del nodo
		target._template = template;
		
		if (template.account_sid) {
			// Twilio - reemplazar todo el contenido
			let tmpRes = twTempResume(template);
			$(target).val(tmpRes.text);

		} else {
			// Local - reemplazar todo el contenido
			$(target).val(template['TEXT']);
		};

		wapp.inputResize(target);
		$(target).focus();

		function twTempResume(temp) {
			let typeKey = Object.keys(temp.types)[0];
			let type = temp.types[typeKey];
			let res = {
				sid: temp.sid,
				variables: temp.variables,
			}
			console.log(typeKey, type);

			// https://www.twilio.com/docs/content/content-types-overview
			if (typeKey == 'twilio/card') {
				res.text = type.title;
			} else if (typeKey == 'twilio/quick-reply') {
				res.text = type.body;
			} else if (typeKey == 'twilio/text') {
				res.text = type.body;
			} else if (typeKey == 'twilio/catalog') {
				res.text = (type.title || '');
				if (res.text) res.text += '\n';
				res.text += (type.subtitle || '');
				if (res.text) res.text += '\n';
				res.text += (type.body || '');
			} else if (typeKey == 'twilio/location') {
				res.text = type.label;
			} else if (typeKey == 'twilio/call-to-action') {
				res.text = type.body;
			} else {
				res.text = type.body;
			}

			// Reemplazar variables en el texto
			if (res.text && temp.variables) {
				Object.keys(temp.variables).forEach(varName => {
					const placeholder = `{{${varName}}}`;
					const value = temp.variables[varName] || '';
					res.text = res.text.replace(new RegExp(placeholder, 'g'), value);
				});
			}

			return res;
		}
	},
	
	msgMedia: function (pSid) {
		return wapp.modWapp.msgMedia(pSid);
	},

	sendAudio: function (pChat) {
		audioRecorder(function (file) {
			debugger;
			wapp.sendMedia(file, pChat);
        });
	},

	sendCamera: function (pChat) {
		wapp.getPicture(Camera.PictureSourceType.CAMERA, 
			function (file) {
				wapp.sendMedia(file, pChat);
			}
		)
	},

	sendPhoto: function (pChat) {
		wapp.getPicture(Camera.PictureSourceType.PHOTOLIBRARY, 
			function (file) {
				wapp.sendMedia(file, pChat);
			}
		)
	},

	getPicture: function (pSource, pCallback) {
		navigator.camera.getPicture(
            function (fileURL) {
                getFile(fileURL).then(
                    function (file) {
						if (pCallback) pCallback(file);
                    },
                    errMgr
                )
            },
            errMgr,
            cameraOptions(pSource)
        );

		function errMgr(pMsg) {
			debugger;
			console.log(pMsg);
			toast(pMsg);
		}
	},

	sendMedia: function (pFile, pChat) {
		wapp.sending = true;
		wapp.cursorLoading(true);

		if (inApp) {
			getFile(pFile.localURL).then(
				sendMedia2,
				function (err) {
					wapp.cursorLoading(false);
					debugger;
				}
			);
		} else {
			sendMedia2(pFile);
		};

		function sendMedia2(file2) {
			var reader = new FileReader();
			reader.onloadend = function (e) {
				var blobData = new Blob([this.result], { type: file2.type });

				// Setea un ContentType valido para Twilio:
				// https://www.twilio.com/docs/sms/accepted-mime-types
				if (file2.type == 'audio/x-m4a') {
					blobData.contentType = 'audio/mpeg';
				} else if (file2.type == 'audio/aac') {
					blobData.contentType = 'audio/basic';
				} else {
					blobData.contentType = file2.type;
				}

				// Pasos para configurar un Bucket publico en S3:
				// https://medium.com/@shresthshruti09/uploading-files-in-aws-s3-bucket-through-javascript-sdk-with-progress-bar-d2a4b3ee77b5
				wapp.getS3(function () {
					var s3Key = dSession.authToken + '/' + file2.name;

					wapp.s3.upload(
						{
							Key: s3Key,
							Body: blobData,
							ContentType: blobData.contentType,
							ACL: 'public-read',
						},

						async function(err, data) {
							if (err) {
								debugger;
								wapp.cursorLoading(false);
								wapp.toast(errMsg(err));

							} else {
								var $chat = $(pChat);
								var fromN = $chat.attr('data-internal-number');
								var toN = $chat.attr('data-external-number');

								let sendObj = {
									wappaction: 'send',
									from: fromN,
									to: toN,
									mediaUrl: data.Location,
								};
								
								// Solo agregar body para documentos, no para audio
								if (!file2.type.startsWith('audio/')) {
									sendObj.body = file2.name;
								}

								let msg;
								try {
									msg = await wapp.modWapp.send(sendObj);
								} catch(er) {
									console.error(er);
									wapp.toast(dSession.utils.errMsg(er));
									wapp.cursorLoading(false);
									wapp.sending = false;
									return;
								}

								msg.operator = wapp.loggedUser.Name;
								msg.date = msg.doorsCreated;
								msg.media = JSON.stringify(await wapp.modWapp.msgMedia(msg.sid));
										
								/*
								msg.latitude = row['LATITUDE'];
								msg.longitude = row['LONGITUDE'];
								*/
								
								await wapp.renderMsg(msg, function (msgRow) {
									var $cont = $chat.find('div.wapp-messages');
									$cont.append(msgRow);
									$cont.scrollTop($cont[0].scrollHeight);
									if (msgRow.attr('data-last-media-url')) {
										$chat.attr('data-last-media-url', msgRow.attr('data-last-media-url'));
									}
									wapp.cursorLoading(false);
									wapp.sending = false;
								});

								// Borra el archivo de S3 despues de un minuto
								setTimeout(function () {
									wapp.s3.deleteObject({ Key: s3Key }, function (err, data) {
										if (err) {
											console.log(err, err.stack);
											debugger;
										}
									});
								}, 60000)
							}
						}
	
					).on('httpUploadProgress', function (progress) {
						// Por si hay que actualizar un progress
						var uploaded = parseInt((progress.loaded * 100) / progress.total);
					});
				});
			};
			reader.readAsArrayBuffer(file2);
		}
	},

	getS3: function (pCallback) {
		if (wapp.s3) {
			if (pCallback) pCallback();

		} else {
			include('aws-sdk', 'https://sdk.amazonaws.com/js/aws-sdk-2.1.24.min.js', function () {
				var id = 'U2FsdGVkX18AIAicUb3TjJfTpVSW6asX7S0EKpgU6oTQtho5D9jPzAU1omLhg3oTwpqavxDtPc4Ugx/EWjLxVA==';
				if (inApp) {
					getS3b(decrypt(id, ''));
				} else {
					decryptAsync(id, '', function (res) {
						getS3b(res);
					});
				}

				function getS3b(pId) {
					AWS.config.update({
						region: 'sa-east-1',
						credentials: new AWS.CognitoIdentityCredentials({
							IdentityPoolId: pId
						})
					});
					
					wapp.s3 = new AWS.S3({
						apiVersion: '2006-03-01',
						params: {Bucket: 'cloudy-whatsapp-connector'}
					});
					
					if (pCallback) pCallback();
				}
			})
		}
	},

	sendFileWeb: function (pChat) {
		var $file = $('#wappFile');
		$file.prop('data-chat', pChat);
		$file.click();
	},

	sendAudioWeb: function (pChat) {
		wapp.recordAudio(pChat);
	},

	mediaRec: null,
	recordingElement: null,
	recordingTimer: null,
	recordingStartTime: null,
	audioStream: null,
	cancelRecording: false,
	
	recordAudio: async function (pChat) {
		if (!wapp.mediaRec || wapp.mediaRec.state == 'inactive') {
			try {
				wapp.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
				
				// Usar el mejor formato disponible para grabación
				let mimeType = 'audio/webm';
				let fileExtension = 'webm';
				
				// Probar formatos en orden de preferencia para calidad de grabación
				if (MediaRecorder.isTypeSupported('audio/webm; codecs=opus')) {
					mimeType = 'audio/webm; codecs=opus';
					fileExtension = 'webm';
				} else if (MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')) {
					mimeType = 'audio/ogg; codecs=opus';
					fileExtension = 'ogg';
				} else if (MediaRecorder.isTypeSupported('audio/mp4')) {
					mimeType = 'audio/mp4';
					fileExtension = 'm4a';
				}
				
				console.log('Recording in format:', mimeType);
				
				wapp.mediaRec = new MediaRecorder(wapp.audioStream, { mimeType });
				let audioChunks = [];
				wapp.currentAudioType = { mimeType, fileExtension };

				wapp.mediaRec.ondataavailable = (event) => {
					audioChunks.push(event.data);
				};

				wapp.mediaRec.onstop = async () => {
					try {
						// Limpiar UI de grabación
						wapp.stopRecordingUI();
						
						// Si fue cancelado, solo limpiar recursos
						if (wapp.cancelRecording) {
							wapp.cancelRecording = false;
							wapp.releaseAudioStream();
							return;
						}
						
						wapp.cursorLoading(true);

						const audioBlob = new Blob(audioChunks, { type: wapp.currentAudioType.mimeType });

						// Calcular duración del audio
						let segs = await new Promise((resolve) => {
							const audioUrl = URL.createObjectURL(audioBlob);
							const audio = new Audio(audioUrl);
							audio.addEventListener('loadedmetadata', () => {
								URL.revokeObjectURL(audioUrl);
								resolve(Math.round(audio.duration));
							});
						});

						// Convertir a MP3 real usando lamejs
						const mp3Blob = await wapp.convertToMp3(audioBlob);
						
						// Crear nombre del archivo como MP3
						let twilioName = `audio_${segs}s_${Math.round(Date.now() / 1000).toString(36)}.mp3`;
						
						// Crear un File object con MP3 real
						let audioFile = new File([mp3Blob], twilioName, { type: 'audio/mpeg' });
						
						console.log('Converted and sending real MP3 to Twilio');
						
						wapp.sendMedia(audioFile, pChat);

						// Liberar recursos
						wapp.releaseAudioStream();

					} catch (err) {
						console.error(err);
						wapp.toast(dSession.utils.errMsg(err));
						wapp.cursorLoading(false);
						wapp.releaseAudioStream();
					}
				};

				wapp.mediaRec.start();
				wapp.startRecordingUI();

			} catch (err) {
				console.error(err);
				wapp.toast('Error al acceder al micrófono: ' + dSession.utils.errMsg(err));
			}

		} else if (wapp.mediaRec.state == 'recording') {
			wapp.mediaRec.stop();
		}
	},
	
	startRecordingUI: function () {
		wapp.recordingStartTime = Date.now();
		
		// Crear ventana modal en el centro
		wapp.recordingElement = $(`
			<div id="wapp-recording" style="
				position: fixed; 
				top: 50%; 
				left: 50%; 
				transform: translate(-50%, -50%);
				background: white; 
				border: 2px solid #d9534f;
				border-radius: 8px; 
				z-index: 9999;
				font-size: 14px;
				box-shadow: 0 4px 20px rgba(0,0,0,0.3);
				width: 300px;
				text-align: center;
			">
				<div style="background: #d9534f; color: white; padding: 15px; border-radius: 6px 6px 0 0;">
					<i class="fa fa-microphone blink-recording"></i> 
					<span id="recording-text">Grabando... 0s</span>
				</div>
				<div style="padding: 20px;">
					<button id="wapp-send-audio" class="btn btn-success" style="margin-right: 10px;">
						<i class="fa fa-send"></i> Enviar
					</button>
					<button id="wapp-cancel-audio" class="btn btn-default">
						<i class="fa fa-times"></i> Cancelar
					</button>
				</div>
			</div>
		`).appendTo('body');
		
		// Event handlers para los botones
		wapp.recordingElement.find('#wapp-send-audio').click(() => {
			if (wapp.mediaRec && wapp.mediaRec.state == 'recording') {
				wapp.mediaRec.stop(); // Esto disparará el onstop que envía el audio
			}
		});
		
		wapp.recordingElement.find('#wapp-cancel-audio').click(() => {
			if (wapp.mediaRec && wapp.mediaRec.state == 'recording') {
				wapp.mediaRec.stop();
				wapp.cancelRecording = true; // Flag para no enviar
			}
		});
		
		// Timer para actualizar duración
		wapp.recordingTimer = setInterval(() => {
			if (wapp.recordingElement && wapp.recordingStartTime) {
				const elapsed = Math.floor((Date.now() - wapp.recordingStartTime) / 1000);
				wapp.recordingElement.find('#recording-text').text(`Grabando... ${elapsed}s`);
			}
		}, 1000);
	},
	
	stopRecordingUI: function () {
		if (wapp.recordingTimer) {
			clearInterval(wapp.recordingTimer);
			wapp.recordingTimer = null;
		}
		if (wapp.recordingElement) {
			wapp.recordingElement.remove();
			wapp.recordingElement = null;
		}
		wapp.recordingStartTime = null;
	},
	
	releaseAudioStream: function () {
		if (wapp.audioStream) {
			wapp.audioStream.getTracks().forEach(track => track.stop());
			wapp.audioStream = null;
		}
	},

	convertToMp3: async function (audioBlob) {
		try {
			// Cargar lamejs usando el sistema include
			if (!window.lamejs) {
				await new Promise((resolve) => {
					include('lamejs', 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js', resolve);
				});
			}
			
			// Crear AudioContext
			const audioContext = new (window.AudioContext || window.webkitAudioContext)();
			
			// Convertir blob a ArrayBuffer
			const arrayBuffer = await audioBlob.arrayBuffer();
			
			// Decodificar el audio
			const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
			
			// Convertir a MP3
			const mp3Blob = wapp.audioBufferToMp3(audioBuffer);
			
			audioContext.close();
			return mp3Blob;
			
		} catch (error) {
			console.error('Error converting audio to MP3:', error);
			wapp.toast('Error al convertir audio. Enviando formato original.');
			// Si falla la conversión, devolver el blob original
			return audioBlob;
		}
	},

	audioBufferToMp3: function (audioBuffer) {
		const sampleRate = audioBuffer.sampleRate;
		const samples = audioBuffer.getChannelData(0); // Mono
		
		// Configurar lamejs
		const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128); // mono, sample rate, bitrate
		
		// Convertir samples a Int16Array
		const sampleBlockSize = 1152; // Tamaño estándar para MP3
		const mp3Data = [];
		
		// Convertir samples float32 a int16
		const int16Samples = new Int16Array(samples.length);
		for (let i = 0; i < samples.length; i++) {
			const s = Math.max(-1, Math.min(1, samples[i]));
			int16Samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
		}
		
		// Codificar en chunks
		for (let i = 0; i < int16Samples.length; i += sampleBlockSize) {
			const sampleChunk = int16Samples.subarray(i, i + sampleBlockSize);
			const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
			if (mp3buf.length > 0) {
				mp3Data.push(mp3buf);
			}
		}
		
		// Finalizar
		const mp3buf = mp3encoder.flush();
		if (mp3buf.length > 0) {
			mp3Data.push(mp3buf);
		}
		
		// Crear blob
		return new Blob(mp3Data, { type: 'audio/mpeg' });
	},


	// Recarga todos los media del chat con autenticación
	reloadMedia: async function($chat) {
		try {
			// Verificar si hay media URL guardada
			const lastMediaUrl = $chat.attr('data-last-media-url');
			if (!lastMediaUrl) return;
			
			// Obtener credenciales de Twilio
			const creds = await wapp.modWapp.twCredentials();
			
			// Abrir popup para autenticación con la última media URL
			const popup = window.open(
				`https://${creds.accountSid}:${creds.authToken}@${lastMediaUrl.replace('https://', '')}`,
				'twilioAuth',
				'width=600,height=400,scrollbars=yes,resizable=yes'
			);
			
			if (!popup) return;
			
			setTimeout(() => {
				if (!popup.closed) {
					popup.close();
				}
				wapp.reloadMedia2($chat)
			}, 2000);
						
		} catch (error) {
			console.error('Error recargando media:', error);
		}
	},

	// Recarga todos los media de un chat
	reloadMedia2: function($chat) {
		try {
			const timestamp = Date.now();
			
			// Recargar todas las imágenes (excepto mapas)
			$chat.find('img').each(function() {
				const $img = $(this);
				const originalSrc = $img.attr('src');
				if (originalSrc && !originalSrc.includes('maps.google.com')) {
					const separator = originalSrc.includes('?') ? '&' : '?';
					$img.attr('src', originalSrc + separator + 't=' + timestamp);
				}
			});
			
			// Recargar todos los audios
			$chat.find('audio source').each(function() {
				const $source = $(this);
				const originalSrc = $source.attr('src');
				if (originalSrc) {
					const separator = originalSrc.includes('?') ? '&' : '?';
					$source.attr('src', originalSrc + separator + 't=' + timestamp);
					$source.parent()[0].load();
				}
			});
			
			// Recargar todos los videos
			$chat.find('video source').each(function() {
				const $source = $(this);
				const originalSrc = $source.attr('src');
				if (originalSrc) {
					const separator = originalSrc.includes('?') ? '&' : '?';
					$source.attr('src', originalSrc + separator + 't=' + timestamp);
					$source.parent()[0].load();
				}
			});
			
		} catch (error) {
			console.error('Error recargando media del chat:', error);
		}
	}

}

// Template Picker con búsqueda
wapp.templatePicker = {
    picker: null,
    currentTarget: null,
    
    // Crear el template picker
    createPicker() {
        // Remover picker existente
        const existingPicker = document.getElementById('templatePicker');
        if (existingPicker) existingPicker.remove();

        // Crear container principal
        this.picker = document.createElement('div');
        this.picker.id = 'templatePicker';
        // Ancho responsivo basado en viewport
        const maxWidth = Math.min(450, window.innerWidth - 40);
        const pickerWidth = maxWidth + 'px';
        
        this.picker.style.cssText = `
            background-color: #fff;
            border-radius: 12px;
            display: none;
            position: absolute;
            padding: 0;
            height: 400px;
            width: ${pickerWidth};
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            border: 1px solid #ddd;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        `;

        // Estructura completa con innerHTML
        this.picker.innerHTML = `
            <div id="templateHeader" style="background-color: #f8f9fa; padding: 12px 16px; border-bottom: 1px solid #e9ecef; border-radius: 12px 12px 0 0; display: flex; align-items: center; justify-content: space-between; cursor: move;">
                <span style="font-weight: 600; color: #495057;">📋 Plantillas</span>
                <button id="templatePickerClose" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #6c757d; padding: 0; width: 24px; height: 24px;">❌</button>
            </div>
            <div style="padding: 12px 16px; border-bottom: 1px solid #e9ecef;">
                <input type="text" placeholder="🔍 Buscar plantillas..." style="width: 100%; padding: 8px 12px; border: 2px solid #e9ecef; border-radius: 8px; box-sizing: border-box; font-size: 14px;">
            </div>
            <div id="templateContent" style="height: 280px; overflow-y: auto; padding: 12px 0 0 0;"></div>
            <div style="padding: 12px 16px; border-top: 1px solid #e9ecef; text-align: center; border-radius: 0 0 12px 12px; background-color: #f8f9fa;">
                <button id="templateCancel" style="background-color: #6c757d; color: white; border: none; padding: 8px 24px; border-radius: 6px; cursor: pointer; font-size: 14px;">Cancelar</button>
            </div>
        `;
        
        const searchInput = this.picker.querySelector('input');
        const content = this.picker.querySelector('#templateContent');

        // Agregar al DOM primero
        document.body.appendChild(this.picker);
        
        // Event listeners después de agregar al DOM
        this._setupEventListeners(searchInput, content);
        
        // Poblar templates inicialmente
        this._populateTemplates(content);
    },

    // Setup event listeners
    _setupEventListeners(searchInput, content) {
        // Búsqueda
        searchInput.addEventListener('input', (e) => {
            this._filterTemplates(content, e.target.value);
        });

        // Prevenir cierre al clickear dentro
        this.picker.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Cerrar picker
        document.getElementById('templatePickerClose').addEventListener('click', () => {
            this.hidePicker();
        });
        
        document.getElementById('templateCancel').addEventListener('click', () => {
            this.hidePicker();
        });
        
        // Drag functionality
        this._setupDrag();
    },
    
    // Setup drag functionality
    _setupDrag() {
        const header = document.getElementById('templateHeader');
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(this.picker.style.left) || 0;
            startTop = parseInt(this.picker.style.top) || 0;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
        });
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;
            
            // Mantener dentro del viewport
            const maxLeft = window.innerWidth - this.picker.offsetWidth;
            const maxTop = window.innerHeight - this.picker.offsetHeight;
            
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));
            
            this.picker.style.left = newLeft + 'px';
            this.picker.style.top = newTop + 'px';
        };
        
        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    },

    // Poblar templates
    _populateTemplates(container, filter = '') {
        container.innerHTML = '';
        
        if (!wapp.templates) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">No hay plantillas disponibles</div>';
            return;
        }

        const fragment = document.createDocumentFragment();

        if (filter) {
            // Mostrar resultados filtrados
            this._showFilteredResults(fragment, filter);
        } else {
            // Mostrar por categorías
            this._showCategorizedTemplates(fragment);
        }

        container.appendChild(fragment);
    },

    // Mostrar resultados filtrados
    _showFilteredResults(container, filter) {
        const results = this._filterAllTemplates(filter);
        
        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.style.cssText = 'text-align: center; padding: 20px; color: #6c757d;';
            noResults.textContent = `No se encontraron plantillas para "${filter}"`;
            container.appendChild(noResults);
            return;
        }

        // Header de resultados
        const resultsHeader = document.createElement('div');
        resultsHeader.style.cssText = 'padding: 8px 16px; font-weight: 600; color: #495057; border-bottom: 1px solid #e9ecef;';
        resultsHeader.textContent = `🔍 Resultados para "${filter}" (${results.length})`;
        container.appendChild(resultsHeader);

        // Lista de resultados
        results.forEach(result => {
            const item = this._createTemplateItem(result.template, result.type, result.name);
            container.appendChild(item);
        });
    },

    // Mostrar plantillas por categorías
    _showCategorizedTemplates(container) {
        // Sección Twilio
        if (wapp.templates.twilio && wapp.templates.twilio.length > 0) {
            const twilioSection = this._createSection('📁 De Twilio', wapp.templates.twilio, 'twilio');
            container.appendChild(twilioSection);
        }

        // Sección Local
        if (wapp.templates.local && wapp.templates.local.length > 0) {
            const localSection = this._createSection('📁 Locales', wapp.templates.local, 'local');
            container.appendChild(localSection);
        }
    },

    // Crear sección de templates
    _createSection(title, templates, type) {
        const section = document.createElement('div');
        section.style.cssText = 'margin-bottom: 16px;';

        // Header de sección
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 8px 16px;
            font-weight: 600;
            color: #495057;
            background-color: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            cursor: pointer;
            user-select: none;
        `;
        header.textContent = title;
        section.appendChild(header);

        // Contenido de sección
        const content = document.createElement('div');
        content.style.cssText = 'border-bottom: 1px solid #e9ecef;';

        templates.forEach(template => {
            const name = type === 'twilio' ? template.friendly_name : template.NAME;
            const item = this._createTemplateItem(template, type, name);
            content.appendChild(item);
        });

        section.appendChild(content);

        // Toggle collapse/expand
        header.addEventListener('click', () => {
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            header.textContent = title + (isHidden ? '' : ' ▼');
        });

        return section;
    },

    // Crear item de template
    _createTemplateItem(template, type, name) {
        const item = document.createElement('div');
        item.style.cssText = `
            padding: 12px 16px;
            cursor: pointer;
            border-bottom: 1px solid #f1f3f4;
            transition: background-color 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const tag = type === 'twilio' ? '[Twilio]' : '[Local]';
        const tagColor = type === 'twilio' ? '#17a2b8' : '#28a745';

        item.innerHTML = `
            <span>${name}</span>
            <span style="
                background-color: ${tagColor};
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
            ">${tag}</span>
        `;

        // Hover effect
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = '#f8f9fa';
        });

        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'transparent';
        });

        // Click handler
        item.addEventListener('click', () => {
            this._selectTemplate(template);
        });

        return item;
    },

    // Filtrar todas las plantillas
    _filterAllTemplates(filter) {
        const results = [];
        const search = filter.toLowerCase();

        // Filtrar Twilio
        if (wapp.templates.twilio) {
            wapp.templates.twilio.forEach(template => {
                if (template.friendly_name.toLowerCase().includes(search)) {
                    results.push({
                        type: 'twilio',
                        name: template.friendly_name,
                        template: template
                    });
                }
            });
        }

        // Filtrar Local
        if (wapp.templates.local) {
            wapp.templates.local.forEach(template => {
                if (template.NAME.toLowerCase().includes(search)) {
                    results.push({
                        type: 'local',
                        name: template.NAME,
                        template: template
                    });
                }
            });
        }

        return results;
    },

    // Filtrar plantillas
    _filterTemplates(container, filter) {
        this._populateTemplates(container, filter);
    },

    // Seleccionar plantilla
    _selectTemplate(template) {
        const hasVariables = template.variables && Object.keys(template.variables).length > 0;
        
        if (hasVariables) {
            this._showVariablesModal(template);
        } else {
            if (this.currentTarget) {
                wapp.putTemplate(template, this.currentTarget);
            }
            this.hidePicker();
        }
    },

    // Modal para completar variables
    _showVariablesModal(template) {
        // Crear modal
        const modal = document.createElement('div');
        modal.id = 'variablesModal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 15000;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            width: 400px;
            max-width: 90vw;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 16px 20px;
            border-bottom: 1px solid #e9ecef;
            background-color: #f8f9fa;
            font-weight: 600;
            color: #495057;
        `;
        header.textContent = 'Completar Variables';

        // Body
        const body = document.createElement('div');
        body.style.cssText = `
            padding: 20px;
            max-height: 300px;
            overflow-y: auto;
        `;

        // Crear input para cada variable
        Object.keys(template.variables).forEach(varName => {
            const row = document.createElement('div');
            row.style.cssText = `
                display: flex;
                align-items: center;
                margin-bottom: 16px;
                gap: 12px;
            `;

            const label = document.createElement('span');
            label.style.cssText = `
                min-width: 100px;
                font-weight: 500;
                color: #495057;
            `;
            label.textContent = varName + ':';

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `modal_var_${varName}`;
            input.value = template.variables[varName] || '';
            input.placeholder = `Valor para ${varName}`;
            input.style.cssText = `
                flex: 1;
                padding: 8px 12px;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                font-size: 14px;
            `;

            row.appendChild(label);
            row.appendChild(input);
            body.appendChild(row);
        });

        // Footer
        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 16px 20px;
            border-top: 1px solid #e9ecef;
            background-color: #f8f9fa;
            text-align: right;
            gap: 10px;
            display: flex;
            justify-content: flex-end;
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 2px solid #6c757d;
            background: white;
            color: #6c757d;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        `;

        const acceptBtn = document.createElement('button');
        acceptBtn.textContent = 'Aceptar';
        acceptBtn.style.cssText = `
            padding: 8px 16px;
            border: none;
            background: #007bff;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        `;

        footer.appendChild(cancelBtn);
        footer.appendChild(acceptBtn);

        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modalContent.appendChild(footer);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);

        // Event listeners
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        acceptBtn.addEventListener('click', () => {
            // Recolectar valores
            Object.keys(template.variables).forEach(varName => {
                const input = document.getElementById(`modal_var_${varName}`);
                if (input) {
                    template.variables[varName] = input.value || '';
                }
            });

            // Aplicar plantilla
            if (this.currentTarget) {
                wapp.putTemplate(template, this.currentTarget);
            }
            
            modal.remove();
            this.hidePicker();
        });

        // Cerrar con Escape
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        });

        // Focus en primer input
        setTimeout(() => {
            const firstInput = body.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    },

    // Mostrar picker
    showPicker(x, y, targetElement) {
        if (!this.picker) {
            this.createPicker();
        }

        this.currentTarget = targetElement;

        // Ajustar posición - usar dimensiones reales del picker
        const pickerWidth = Math.min(450, window.innerWidth - 40);
        const pickerHeight = 400;
        
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Ajustar coordenadas con el scroll
        x = Math.max(scrollLeft + 10, Math.min(x, scrollLeft + window.innerWidth - pickerWidth - 10));
        y = Math.max(scrollTop + 10, Math.min(y, scrollTop + window.innerHeight - pickerHeight - 10));

        this.picker.style.left = x + 'px';
        this.picker.style.top = y + 'px';
        this.picker.style.display = 'block';

        // Focus en search input
        const searchInput = this.picker.querySelector('input');
        if (searchInput) {
            setTimeout(() => {
                searchInput.focus();
                searchInput.value = '';
                this._populateTemplates(document.getElementById('templateContent'));
            }, 100);
        }
    },

    // Ocultar picker
    hidePicker() {
        if (this.picker) {
            this.picker.style.display = 'none';
            this.currentTarget = null;
        }
    }
};
