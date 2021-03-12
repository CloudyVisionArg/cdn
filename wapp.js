/*
todo:
- Mejorar el estilo del picker de plantillas
*/

(function() {
	var headTag = document.getElementsByTagName('head')[0];
	var linkTag = document.createElement('link');
	linkTag.rel = 'stylesheet';
	//linkTag.href = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@3/wapp.css';
	linkTag.href = 'https://cloudycrm.net/c/gitcdn.asp?path=/wapp.css';
	headTag.appendChild(linkTag);

	includeJs('javascript');
	includeJs('emojis');
}());

$(document).ready(function () {
	DoorsAPI.instanceSettingsGet('WHATSAPP_CONNECTOR_FOLDER').then(
		function (res) {
			var root = document.documentElement;

			if (typeof(cordova) == 'object') {
				// App
				wapp.codelibUrl = new URL(window.localStorage.getItem('endPoint')).origin + '/c/codelibapi.asp'

				root.style.setProperty('--wapp-chat-horizontal-margin', '20px');
				root.style.setProperty('--wapp-button-size', '30px');
				
			} else {
				// Web
				wapp.codelibUrl = '/c/codelibapi.asp';

				root.style.setProperty('--wapp-chat-horizontal-margin', '0px');
				root.style.setProperty('--wapp-button-size', '25px');
			};
		
			wapp.rootFolder = res;
			
			DoorsAPI.foldersGetByName(res, 'messages').then(
				function (fld) {
					wapp.messagesFolder = fld.FldId;
	
					if (typeof(cordova) != 'object') {
						// Carga inicial
						$('div.wapp-chat').each(function () {
							wapp.initChat($(this));
						});
					}
					
					// Carga mensajes nuevos cada 5 segs
					setInterval(function () {
						wapp.checkSession(function () {
							$('div.wapp-chat[data-ready]').each(function () {
								wapp.loadMessages($(this));
							});
						});
					}, 5000);
	
					// Actualiza el estado de la sesion cada 1'
					setInterval(function () {
						wapp.checkSession(function () {
							$('div.wapp-chat[data-ready]').each(function () {
								wapp.refreshSession($(this));
							});
						});
					}, 60000);
				}
			);
	
			DoorsAPI.foldersGetByName(res, 'templates').then(
				function (fld) {
					wapp.templatesFolder = fld.FldId;

					var $picker = $('<div/>', {
						id: 'wappTemplatePicker',
					}).css({
						backgroundColor: '#ECECEC',
						borderRadius: '12px',
						display: 'none',
						position: 'absolute',
						padding: '5px',
						height: '170px',
						width: '350px',
						overflowY: 'scroll',
					}).appendTo($(document.body));

					DoorsAPI.folderSearch(wapp.templatesFolder, 'name', '', 'name').then(
						function (res) {
							var $ul = $('<ul/>').appendTo($picker);
							res.forEach(it => {
								$li = $('<li/>').appendTo($ul);
								$li.attr('data-value', it['NAME']);
								$li.append(it['NAME']);
							})
						}
					);

					$picker.on('click', 'li', function (e) {
						var $this = $(this);
						wapp.template($this.attr('data-value'), $this.closest('div')[0].target);
					});

					$(document).click(function () {
						$picker.hide()
					});
		
				}
			);

			debugger;
			if (typeof(cordova) == 'object' && device.platform == 'iOS') {
				wapp.useOgv = true;
			} else {
				var ua = navigator.userAgent;
				if (ua.indexOf('Safari/') > -1 && ua.indexOf('Chrome/') == -1) {
					wapp.useOgv = true;
				}
			}
			if (wapp.useOgv) includeJs('ogv', 'http://cloudycrm.net/c/wapp/ogv/ogv.js');
		}
	);

	DoorsAPI.loggedUser().then(
		function (res) {
			wapp.loggedUser = res;
		}
	);

	if (typeof(cordova) != 'object') {
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
	}
});


var wapp = {
	rootFolder: undefined,
	messagesFolder: undefined,
	templatesFolder: undefined,
	loggedUser: undefined,
	codelibUrl: undefined,
	useOgv: undefined,

	cursorLoading: function(pLoading) {
		if (typeof(cordova) == 'object') {
			if (pLoading) {
				app7.preloader.show();
			} else {
				app7.preloader.hide();
			}

		} else {
			$('body').css('cursor', pLoading ? 'progress' : 'default');
		}
	},

	ready: function (pCallback) {
		var interv = setInterval(function () {
			if (wapp.messagesFolder) {
				clearInterval(interv);
				if (pCallback) pCallback();
			}
		}, 10)
	},

	checkSession: function (pCallback) {
		if (typeof(cordova) == 'object') {
			if (app7.online) {
				dSession.checkToken(pCallback);
			}
		} else {
			if (pCallback) pCallback();
		}
	},

	viewImage: function (e) {
		if (typeof(cordova) == 'object') {
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
	
	initChat: function (pCont) {
		var $heading = $('<div/>', {
			class: 'wapp-header',
		}).appendTo(pCont);
		
		var $headingLeft = $('<div/>', {
			style: 'width: 40%;',
		}).appendTo($heading);
		
		$headingLeft.append('<b>' + pCont.attr('data-external-name') + '</b><br>(' + pCont.attr('data-external-number') + ')');
		
		var $headingSession = $('<div/>', {
			class: 'session',
			style: 'width: 20%; text-align: center;',
		}).appendTo($heading);
		
		$headingSession.append('<img height="30" src="https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@2/red.png" />');
		$headingSession.append('<div class="session-time"></div>');

		var $headingRight = $('<div/>', {
			style: 'width: 40%; text-align: right;',
		}).appendTo($heading);
		
		$headingRight.append('<b>' + pCont.attr('data-internal-name') + '</b><br>(' + pCont.attr('data-internal-number') + ')');

		var $messages = $('<div/>', {
			class: 'wapp-messages',
		}).appendTo(pCont);
		
		$messages.append(`      
		    <div class="wapp-loadmore" style="text-align: center; margin-bottom: 15px;">
				<a href='#' onclick="wapp.loadMore(this)">Mensajes anteriores</a>
			</div>
		`);
			
		var $reply = $('<div/>', {
			class: 'wapp-footer',
		}).appendTo(pCont);
		
		if (typeof(cordova) != 'object') {
			// Boton Emoji
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
		
		// Boton Template
		var $div = $('<div/>', {
			class: 'wapp-button',
			style: 'width: 10%',
		}).appendTo($reply);
		
		var $template;
		if (typeof(cordova) != 'object') {
			$template = $('<i/>', {
				class: 'fa fa-list-ul',
			}).appendTo($div);
		} else {
			$template = $('<i/>', {
				class: 'f7-icons',
			}).append('menu').appendTo($div);
		}
		
		$template.click(function (e) {
			var posX, posY;
			var $picker = $('#wappTemplatePicker');
			if ($picker.outerWidth() > $(document).width()) {
				posX = ($(window).width() - $picker.outerWidth()) / 2;
			} else if (e.pageX + $picker.outerWidth() > $(document).width()) {
				posX = $(document).width() - $picker.outerWidth();
			} else {
				posX = e.pageX;
			}
			if (e.pageY - 200 > 0) {
				posY = e.pageY - 200;
			} else {
				posY = e.pageY + 30;
			}
			$picker.css({
				left: posX + 'px',
				top: posY + 'px',
				zIndex: 20000,
			});
			$picker[0].target = $(this).closest('.wapp-footer').find('.wapp-reply')[0];
			$picker.show();
			e.stopPropagation();
		});

		// Input
		var $div = $('<div/>', {
			style: 'width: ' + (typeof(cordova) == 'object' ? '80%' : '70%') + 
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
		if (typeof(cordova) != 'object') {
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
		if (typeof(cordova) != 'object') {
			$send = $('<i/>', {
				class: 'fa fa-send',
			}).appendTo($div);
		} else {
			$send = $('<i/>', {
				class: 'f7-icons',
			}).append('paperplane').appendTo($div);
		}
		
		$send.click(function () {
			wapp.send(this);
		});

		wapp.loadMessages(pCont);
		wapp.refreshSession(pCont);

		pCont.attr('data-ready', '1');
	},
	
	refreshSession: function (pChat, pDate) {
		if (pDate) {
			render(pDate);

		} else {
			var extNumber = pChat.attr('data-external-number');
			var intNumber = pChat.attr('data-internal-number');
			if (!extNumber || !intNumber) return;

			// Toma los 10 ult digitos
			var extNumberPart = extNumber.substr(extNumber.length - 10);
			var intNumberPart = intNumber.substr(intNumber.length - 10);

			var formula = 'from like \'%' + extNumberPart + '\' and to like \'%' + intNumberPart + '\'';
			
			DoorsAPI.folderSearch(wapp.messagesFolder, 'created', formula, 'created desc', 1, null, 0).then(
				function (res) {
					if (res.length > 0) {
						render(res[0]['CREATED']);
					} else {
						render(undefined);
					}
				},
				function (err) {
					console.log(err);
					debugger;
				}
			)
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
            $img.attr('src', 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@2/' + light + '.png');
			var $remain = pChat.find('.wapp-header .session .session-time');
			$remain.html(remain);
		}
	},
	
	insertMsg: function (pChat, pMsg) {
		var $cont = pChat.find('div.wapp-messages');
		var $msgs = pChat.find('div.wapp-message');
		if ($msgs.length == 0) {
			$cont.append(wapp.renderMsg(pMsg));
		} else {
			var $msg = $msgs.filter('[data-sid="' + pMsg.sid + '"]');
			if ($msg.length > 0) {
				// Ya esta, actualizo el status
				$msg.find('.wapp-message-status-container').html(wapp.getTicks(pMsg.status));
			} else {
				$msg = $msgs.first();
				var $msgRnd = wapp.renderMsg(pMsg);
				if (pMsg.date <= $msg.attr('data-date')) {
					$msg.before($msgRnd);
				} else {
					$msg = $msgs.last();
					while ($msg.attr('data-date') > pMsg.date) $msg = $msg.prev();
					if ($msg) {
						$msg.after($msgRnd);
					} else {
						// No deberia llegar aca, lo pongo al ultimo
						$cont.append($msgRnd);
					}
				}
			}
		}
	},
	
	renderMsg: function (pMsg) {
		// Pide el media, si no esta
		if (pMsg.nummedia > 0) {
			if (!pMsg.media) {
				wapp.msgMedia(pMsg.sid).then(
					function (res) {
						pMsg.media = res;
						return render(pMsg);
					},
					function (err) {
						debugger;
						console.log(err.responseText);
						return render(pMsg);
					}
				);
			} else {
				return render(pMsg);
			}
		} else {
			return render(pMsg);
		}
		
		// Renderiza
		function render(pMsg) {
			var appendBody = true;
			
			var $row = $('<div/>', {
				class: 'wapp-message',
				'data-sid': pMsg.sid,
				'data-date': pMsg.date,
			});
			
			var $msg = $('<div/>', {
				class: 'wapp-' + pMsg.direction,
			}).appendTo($row);
		
			if (pMsg.operator) $msg.append(pMsg.operator);
			
			var $msgText = $('<div/>', {
				class: 'wapp-message-text',
			}).appendTo($msg);
		
			if (pMsg.nummedia > 0 && pMsg.media) {
				var media = undefined;
				try {
					media = JSON.parse(pMsg.media);
				} catch (err) {
					console.log(err);
				};
				if (media) {
					media.forEach(it => {
						// https://www.twilio.com/docs/whatsapp/guidance-whatsapp-media-messages#supported-mime-types
						
						var $div = $('<div/>').appendTo($msgText);
						
						if (it.ContentType.substr(0, 5) == 'image') {
							$('<img/>', {
								src: it.Url,
								style: 'cursor: pointer; width: 100%; height: 130px; object-fit: cover;',
							}).click(wapp.viewImage).appendTo($div);
							
						} else if (it.ContentType.substr(0, 5) == 'audio') {
							//todo: Safari no soporta OGG, ver si se puede hacer algo con esto: https://github.com/brion/ogv.js/
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
				if (typeof(cordova) == 'object') {
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
					if (typeof(cordova) == 'object') {
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
					
					//todo: estos deberian trabajar con word boundary, mejorar
					// https://stackoverflow.com/questions/58356773/match-star-character-at-end-of-word-boundary-b
					body = body.replace(/\*([^*]+)\*/g, '<b>$1<\/b>'); // Reemp los * con <b>
					body = body.replace(/\_([^_]+)\_/g, '<i>$1<\/i>'); // Reemp los _ con <i>
					body = body.replace(/\~([^~]+)\~/g, '<del>$1<\/del>'); // Reemp los _ con <i>
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
			
			return $row;
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
			if (typeof(cordova) == 'object') {
				return '<i class="f7-icons" style="font-size: 13px;">clock</i>';
			} else {
				return '<i class="fa fa-clock-o" />';
			}
		} else if (pStatus == 'undelivered') {
			if (typeof(cordova) == 'object') {
				return '<i class="f7-icons" style="font-size: 13px;">exclamationmark_circle_fill</i>';
			} else {
				return '<i class="fa fa-exclamation-circle" />';
			}
		} else if (pStatus == 'failed') {
			if (typeof(cordova) == 'object') {
				return '<i class="f7-icons" style="font-size: 13px;">exclamationmark_triangle_fill</i>';
			} else {
				return '<i class="fa fa-exclamation-triangle" />';
			}
		} else {
			return '??';
		}
	},

	resetChat: function (pChat) {
		pChat.find('div.wapp-messages').empty();
		pChat.removeAttr('data-last-load');
	},

	loadMessages: function (pChat, pOlders) {
		var msgLimit = 50;
		
		var extNumber = pChat.attr('data-external-number');
		var intNumber = pChat.attr('data-internal-number');
		if (!extNumber || !intNumber) return;

		// Toma los 10 ult digitos
		var extNumberPart = extNumber.substr(extNumber.length - 10);
		var intNumberPart = intNumber.substr(intNumber.length - 10);

		var incLoad = false;
		var lastLoad = pChat.attr('data-last-load');
		if (lastLoad) lastLoad = new Date(new Date(lastLoad) - 5000);
		
		var formula = '(from like \'%' + extNumberPart + '\' and to like \'%' + intNumberPart + 
			'\') or (to like \'%' + extNumberPart + '\' and from like \'%' + intNumberPart + '\')';
		
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
		
		var $cont = pChat.find('div.wapp-messages');
		
		wapp.serverDate().then(function (dt) { pChat.attr('data-last-load', dt.toJSON()); });
		
		DoorsAPI.folderSearch(wapp.messagesFolder, '*', formula, 'created desc', msgLimit, null, 0).then(
			function (res) {
				if (res.length < msgLimit && !incLoad) pChat.find('div.wapp-loadmore a').hide();
				
				if (res.length > 0) {
		            // Arma un array de AccId
		            var ids = res.map(row => row['ACC_ID']);
		            // Saca los repetidos
		            ids = ids.filter((el, ix) => ids.indexOf(el) == ix);
		            // Levanta los accounts, completa el nombre y renderiza
		            DoorsAPI.accountsSearch('acc_id in (' + ids.join(',') + ')', 'name').then(
		                function (accs) {
		                	var atBottom = ($cont.scrollTop() + $cont.innerHeight() + 20 >= $cont[0].scrollHeight);
		                	var sessionUpdated = false;
		                	
							res.forEach(row => {
		                        row['ACC_NAME'] = accs.find(acc => acc['AccId'] == row['ACC_ID'])['Name'];
		
								var msg = {};
								msg.sid = row['MESSAGESID'];
								if (row['FROM'].indexOf(extNumberPart) >= 0) {
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
								msg.nummedia = row['NUMMEDIA'];
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
										if ($cont[0].scrollHeight - ($cont.scrollTop() + $cont.innerHeight()) > 20)
											$cont.scrollTop($cont[0].scrollHeight);
									}
								} else {
									setTimeout(function () {
										$cont.scrollTop($cont[0].scrollHeight);
									}, 2000);
								}
							};

							wapp.cursorLoading(false);
		                },
		                function (err) {
							console.log(err);
							wapp.cursorLoading(false);
		                	debugger;
		                }
		            );
	        	}
			},
			function (err) {
				console.log(err);
				wapp.cursorLoading(false);
				debugger;
			}
		)
	},

	loadMore: function (el) {
		wapp.cursorLoading(true);
		wapp.loadMessages($(el).closest('div.wapp-chat'), true);
	},

	// Enter manda, shift enter nueva linea
	inputKeyDown: function (el, ev) {
		var keyCode = ev.which || ev.keyCode;
		if (keyCode == 13 && !ev.shiftKey && typeof(cordova) != 'object') {
			// send
			ev.preventDefault();
			wapp.send(el);
		}
	},

	send: function (el) {
		var $chat = $(el).closest('div.wapp-chat');
		var $inp = $chat.find('.wapp-reply');
		if ($inp.val()) {
			wapp.cursorLoading(true);

			var fromN = $chat.attr('data-internal-number');
			var toN = $chat.attr('data-external-number');

			wapp.xhr({
				wappaction: 'send',
				from: fromN,
				to: toN,
				body: $inp.val(),
			}).then(
				function (res) {
					var $dom = $($.parseXML(res.jqXHR.responseText));
					msg = {};
					msg.sid = $dom.find('Message Sid').html();
					msg.direction = 'outbound';
					msg.operator = wapp.loggedUser.Name;
					msg.status = $dom.find('Message Status').html();
					msg.body = $dom.find('Message Body').html();
					msg.date = (xmlDecodeDate($dom.find('Message DoorsCreated').html())).toJSON();
					var $cont = $chat.find('div.wapp-messages');
					$cont.append(wapp.renderMsg(msg));
					$cont.scrollTop($cont[0].scrollHeight);

					wapp.cursorLoading(false);
				},
				function (err) {
					wapp.cursorLoading(false);
					alert('Error: ' + err.jqXHR.responseText);
				}
			)

			$inp.val('');
			wapp.inputResize($inp[0]);
		}
	},

	serverDate: function () {
	    return new Promise(function (resolve, reject) {
			wapp.xhr({ wappaction: 'getDate' }).then(
				function (res) {
					resolve(xmlDecodeDate(res.data));
				},
				function (err) {
					reject(err);
				}
			)
		});
	},
	
	template: function (template, target) {
		DoorsAPI.folderSearch(wapp.templatesFolder, 'text', 'name = \'' + template + '\'').then(
			function (res) {
				insertAtCaret(target, res[0]['TEXT']);
				wapp.inputResize(target);
				$(target).focus();
			},
			function (err) {
				console.log(err);
			}
		)
	},
	
	msgMedia: function (pSid) {
	    return new Promise(function (resolve, reject) {
			wapp.xhr({
				wappaction: 'msgMedia',
				sid: pSid,
			}).then(
				function (res) {
					resolve(res.data);
				},
				function (err) {
					debugger;
					reject(err.jqXHR);
				}
			)
	    });
	},

	xhr: function(data) {
	    return new Promise(function (resolve, reject) {
			var dataExt = Object.assign(data, getContext());
			$.ajax({
				url: wapp.codelibUrl + '?codelib=WhatsappXHR',
				method: 'POST',
				data: dataExt,
			})
				.done(function (data, textStatus, jqXHR) {
					resolve({ data: data, textStatus: textStatus, jqXHR: jqXHR });
				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					reject({ jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown });
				});
	    });

		function getContext() {
			pwd = window.localStorage.getItem('userPassword');
			if (!pwd) {
				pwd = '';
			} else if (pwd.substr(0, 2) == '__') {
				pwd = decrypt(pwd.substr(2), '__')
			}
		
			return {
				userName: window.localStorage.getItem('userName'),
				password: pwd,
				instance: window.localStorage.getItem('instance'),
				cordova: typeof(cordova) == 'object' ? 1 : 0,
			}
		}
	}
}
