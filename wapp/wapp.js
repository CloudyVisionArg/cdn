var inApp = typeof app7 == 'object';

(async function () {
	await include([
		{ id: 'whatsapp-css' },
		{ id: 'jslib' },
		{ id: 'emojis' },
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
		fresh: true, //todo: sacar fresh
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
				$('div.wapp-chat[data-rendered]').each(function () {
					wapp.loadMessages($(this));
				});
			});
		}, 5000);

		// Actualiza el estado de la sesion cada 1'
		setInterval(function () {
			wapp.checkSession(function () {
				$('div.wapp-chat[data-rendered]').each(function () {
					wapp.refreshSession($(this));
				});
			});
		}, 60000);
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
				
				var $file = $('<a/>').append('Archivo');
				$file.addClass('dropdown-item');
				$file.appendTo($li);
				$file.click(function (e) {
					wapp.sendFileWeb($cont[0]);
				});

				var $liTmp = $('<li/>', {
					class: 'dropdown-submenu',
				}).appendTo($menu);

				var $aTmp = $('<a/>').append('Plantilla >>');
				$aTmp.addClass('dropdown-item');
				$aTmp.appendTo($liTmp);

				$aTmp.click(function (e) {
					var $this = $(this);
					if (wapp.templates) {
						if ($this.next('ul').length == 0) {
							var $ul = $('<ul/>', {
								class: 'dropdown-menu',
							}).appendTo($this.parent());
			
							var $reply = $(this).closest('.wapp-footer').find('.wapp-reply')[0];

							// De Twilio
							$ul.append('<li><h5 class="dropdown-header">De Twilio</h5></li>');
							wapp.templates.twilio.forEach(it => {
								var $li = $('<li/>').appendTo($ul);
								var $a = $('<a class="dropdown-item" />').appendTo($li);
								$a.append(it.friendly_name);
								$a.click(function (e) {
									wapp.putTemplate(it, $reply);
								});
							});

							// Locales
							$ul.append('<li><h5 class="dropdown-header">Locales</h5></li>');
							wapp.templates.local.forEach(it => {
								var $li = $('<li/>').appendTo($ul);
								var $a = $('<a class="dropdown-item" />').appendTo($li);
								$a.append(it['NAME']);
								$a.click(function (e) {
									wapp.putTemplate(it, $reply);
								});
							});
		
						};

						$this.next('ul').toggle();
						e.stopPropagation();
						e.preventDefault();

					} else {
						alert('No hay plantillas definidas');
					}
				});

				$('<li/>', {
					role: 'separator',
					class: 'divider',
				}).append('<hr class="dropdown-divider">').appendTo($menu);
				
				var $li = $('<li/>').appendTo($menu);
				$('<a class="dropdown-item" />').append('Cancelar').appendTo($li);

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
	
										if (wapp.templates && wapp.templates.length > 0) {
											var tempButtons = [
												[],
												[{
													text: 'Cancelar',
													bold: true,
													close: true,
												}]
											];
	
											wapp.templates.forEach(it => {
												tempButtons[0].push({
													text: it,
													onClick: tempClick,
												})
											});
	
											tempActions = app7.actions.create({
												buttons: tempButtons,
											});
	
											tempActions.params.chatEl = actions.params.chatEl;
											tempActions.open();
	
											function tempClick(actions, e) {
												wapp.putTemplate(this.text, $(actions.params.chatEl).find('.wapp-reply')[0]);
											};
	
										} else {
											toast('No hay plantillas definidas');
										}
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

			$cont.attr('data-rendered', '1');
		}
	},

	init: function (pCont) {
		var $cont = $(pCont);
		wapp.renderChat($cont);
		wapp.clear($cont);
		wapp.loadMessages($cont);
		wapp.refreshSession($cont);
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
	
	insertMsg: function (pChat, pMsg) {
		var $cont = pChat.find('div.wapp-messages');
		var $msgs = pChat.find('div.wapp-message');
		if ($msgs.length == 0) {
			wapp.renderMsg(pMsg, function (msgRow) {
				$cont.append(msgRow);
			});
		} else {
			var $msg = $msgs.filter('[data-sid="' + pMsg.sid + '"]');
			if ($msg.length > 0) {
				// Ya esta, actualizo el status
				$msg.find('.wapp-message-status-container').html(wapp.getTicks(pMsg.status));
			} else {
				$msg = $msgs.first();
				wapp.renderMsg(pMsg, function (msgRow) {
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
				});
			}
		}
	},
	
	renderMsg: function (pMsg, pCallback) {
		// Pide el media, si no esta
		if (pMsg.numMedia > 0) {
			if (!pMsg.media) {
				wapp.msgMedia(pMsg.sid).then(
					function (res) {
						pMsg.media = res;
						render(pMsg, pCallback);
					},
					function (err) {
						debugger;
						console.log(err.responseText);
						render(pMsg, pCallback);
					}
				);
			} else {
				render(pMsg, pCallback);
			}
		} else {
			render(pMsg, pCallback);
		}
		
		// Renderiza
		function render(pMsg, pCallback) {
			var appendBody = true;
			
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
					
					media.forEach(it => {
						// https://www.twilio.com/docs/whatsapp/guidance-whatsapp-media-messages#supported-mime-types
						
						var $div = $('<div/>').appendTo($msgText);
						var $btn;
						
						if (it.ContentType.substr(0, 5) == 'image') {
							$('<img/>', {
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
					});
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
					body = body.replace(/\n/g, '<br>'); // Reemp los \n con <br>
					
					//todo: estos reemplazos deben trabajar con word boundary
					// https://stackoverflow.com/questions/58356773/match-star-character-at-end-of-word-boundary-b
					body = body.replace(/\*([^*]+)\*/g, '<b>$1<\/b>'); // Reemp los * con <b>
					// Este queda desactivado xq me rompe los enlaces, activarlo cdo este word boundary
					//body = body.replace(/\_([^_]+)\_/g, '<i>$1<\/i>'); // Reemp los _ con <i>
					body = body.replace(/\~([^~]+)\~/g, '<del>$1<\/del>'); // Reemp los ~ con <del>
				};
				
				$msgText.append(body);
			}
			
			var $msgTime = $('<div/>', {
				class: 'wapp-message-time',
			}).appendTo($msg);
			
			dt = new Date(pMsg.date);
			$msgTime.append(wapp.formatDate(dt));
			
			if (pMsg.status) {
				$msgTime.append(' <span class="wapp-message-status-container">' + wapp.getTicks(pMsg.status) + '</span>');
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
	getTicks: function (pStatus) {
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
			if (inApp) {
				return '<i class="f7-icons" style="font-size: 13px;">exclamationmark_circle_fill</i>';
			} else {
				return '<i class="fa fa-exclamation-circle" />';
			}
		} else if (pStatus == 'failed') {
			if (inApp) {
				return '<i class="f7-icons" style="font-size: 13px;">exclamationmark_triangle_fill</i>';
			} else {
				return '<i class="fa fa-exclamation-triangle" />';
			}
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

	loadMessages: async function (pChat, pOlders) {
		if (wapp.sending) return;
		
		try {
			var msgLimit = 50;
			
			var extNumber = pChat.attr('data-external-number');
			var intNumber = pChat.attr('data-internal-number');

			if (!extNumber || !intNumber) {
				pChat.find('div.wapp-loadmore a').hide();
				wapp.cursorLoading(false);
				return;
			}

			var extNumberRev = wapp.cleanNumber(extNumber);
			var intNumberRev = wapp.cleanNumber(intNumber);

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
						
				res.forEach(row => {
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
					}
					msg.body = row['BODY'];
					msg.date = row['CREATED'];
					msg.numMedia = row['NUMMEDIA'];
					msg.media = row['MEDIA'];
					msg.latitude = row['LATITUDE'];
					msg.longitude = row['LONGITUDE'];

					wapp.insertMsg(pChat, msg);
				});
						
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
			console.log(err);
			wapp.cursorLoading(false);
			debugger;
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
			
			let contentId = $inp.attr("data-content-sid");
			let contentVariables = $inp.attr("data-content-variables");
			
			if( contentId !== undefined && contentId !== null && contentId !== "") {
				sendObj.contentSid = contentId;
				sendObj.contentVariables = contentVariables || null;
				let fromName = $chat.attr('data-internal-name');
				sendObj.from = fromName;
			}
			
			let msg;
			try {
				msg = await wapp.modWapp.send(sendObj);
			} catch(er) {
				console.error(er);
				alert(dSession.utils.errMsg(er));
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
			
			wapp.renderMsg(msg, function (msgRow) {
				var $cont = $chat.find('div.wapp-messages');
				$cont.append(msgRow);
				$cont.scrollTop($cont[0].scrollHeight);
				wapp.cursorLoading(false);
				wapp.sending = false;
			});

			$inp.removeAttr("data-content-sid");

			$inp.val('');
			wapp.inputResize($inp[0]);
		}
	},

	putTemplate: function (template, target) {
		if (template.account_sid) {
			// Twilio
			let tmpRes = twTempResume(template);

		} else {
			// Local
			if (template["CONTENT_SID"] != null) {
				$(target).attr('data-content-sid', template["CONTENT_SID"]);
			} else {
				$(target).removeAttr('data-content-sid');
			}
			insertAtCaret(target, template['TEXT']);
			wapp.inputResize(target);
			$(target).focus();
		};

		function twTempResume(temp) {
			let type = Object.keys(temp)[0];
			debugger;
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
					var s3Key = Doors.RESTFULL.AuthToken + '/' + file2.name;

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
								alert(errMsg(err));

							} else {
								var $chat = $(pChat);
								var fromN = $chat.attr('data-internal-number');
								var toN = $chat.attr('data-external-number');

								let sendObj = {
									wappaction: 'send',
									from: fromN,
									to: toN,
									body: file2.name, // todo: el body va solo en documentos
									mediaUrl: data.Location,
								};

								try {
									let msg = await wapp.modWapp.send(sendObj);
								} catch(er) {
									console.error(er);
									alert(dSession.utils.errMsg(er));
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
								
								wapp.renderMsg(msg, function (msgRow) {
									var $cont = $chat.find('div.wapp-messages');
									$cont.append(msgRow);
									$cont.scrollTop($cont[0].scrollHeight);
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
	}

}
