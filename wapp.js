(function() {
	var headTag = document.getElementsByTagName('head')[0];
	var linkTag = document.createElement('link');
	linkTag.rel = 'stylesheet';
	linkTag.href = 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@3/wapp.css';
	headTag.appendChild(linkTag);

	includeJs('emojis');
}());

$(document).ready(function () {
	DoorsAPI.instanceSettingsGet('WHATSAPP_CONNECTOR_FOLDER').then(
		function (res) {
			wapp.rootFolder = res;
			
			DoorsAPI.foldersGetByName(res, 'messages').then(
				function (fld) {
					wapp.messagesFolder = fld.FldId;
	
					// Carga inicial
					$('div.wapp-chat').each(function () {
						wapp.renderChat($(this));
						wapp.loadMessages($(this));
						wapp.refreshSession($(this));
					});
					
					// Carga mensajes nuevos cada 5 segs
					setInterval(function () {
						$('div.wapp-chat').each(function () {
							wapp.loadMessages($(this));
						});
					}, 5000);
	
					// Actualiza el estado de la sesion cada 1'
					setInterval(function () {
						$('div.wapp-chat').each(function () {
							wapp.refreshSession($(this));
						});
					}, 60000);
				}
			);
	
			DoorsAPI.foldersGetByName(res, 'templates').then(
				function (fld) {
					wapp.templatesFolder = fld.FldId;
				}
			);
	
			DoorsAPI.foldersGetByName(res, 'symbols').then(
				function (fld) {
					wapp.symbolsFolder = fld.FldId;
				}
			);
		}
	);

	DoorsAPI.loggedUser().then(
		function (res) {
			wapp.loggedUser = res;
		}
	);

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
});


var wapp = {
	rootFolder: undefined,
	messagesFolder: undefined,
	symbolsFolder: undefined,
	templatesFolder: undefined,
	loggedUser: undefined,
	
	viewImage: function (e) {
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
	},
	
	renderChat: function (pCont) {
		var $heading = $('<div/>', {
			class: 'row wapp-heading',
		}).appendTo(pCont);
		
		var $headingLeft = $('<div/>', {
			class: 'col-xs-5 wapp-heading-title',
		}).appendTo($heading);
		
		$headingLeft.append('<b>' + pCont.attr('data-external-name') + '</b><br>(' + pCont.attr('data-external-number') + ')');
		
		var $headingSession = $('<div/>', {
			class: 'col-xs-2 wapp-heading-title session',
			style: 'text-align: center;',
		}).appendTo($heading);
		
		$headingSession.append('1<img height="30" src="https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@2/red.png" />');
		$headingSession.append('<div class="session-time"></div>');

		var $headingRight = $('<div/>', {
			class: 'col-xs-5 wapp-heading-title',
			style: 'text-align: right;',
		}).appendTo($heading);
		
		$headingRight.append('<b>' + pCont.attr('data-internal-name') + '</b><br>(' + pCont.attr('data-internal-number') + ')');

		var $messages = $('<div/>', {
			class: 'wapp-messages',
		}).appendTo(pCont);
		
		$messages.append(`      
		    <div class="row">
				<div class="col-xs-12 wapp-previous">
					<a onclick="wapp.loadMore(this)">Mensajes anteriores</a>
				</div>
			</div>
		`);
			
		var $reply = $('<div/>', {
			class: 'row wapp-reply',
		}).appendTo(pCont);
		
		// Boton Emoji
		var $div = $('<div/>', {
			class: 'col-xs-1 wapp-reply-button',
		}).appendTo($reply);
		
		var $emoji = $('<i/>', {
			class: 'fa fa-smile-o',
		}).appendTo($div);
		
		// Boton Template
		var $div = $('<div/>', {
			class: 'col-xs-1 wapp-reply-button',
		}).appendTo($reply);
		
		var $template = $('<i/>', {
			class: 'fa fa-copy',
		}).appendTo($div);
		
		$template.click(function () {
			wapp.template(this);
		});

		// Input
		var $div = $('<div/>', {
			class: 'col-xs-9 wapp-reply-input',
		}).appendTo($reply);
		
		var $input = $('<textarea/>').appendTo($div);
		$input.change(function () { wapp.inputResize(this); });
		$input.keyup(function () { wapp.inputResize(this); });
		$input.keydown(function () { wapp.inputKeyDown(this); });

		$('#script_emojis')[0].loaded(function () {
			emojis.createPicker({
				el: $emoji,
				inputEl: $input,
			});
		})
		
		// Boton Template
		var $div = $('<div/>', {
			class: 'col-xs-1 wapp-reply-button',
		}).appendTo($reply);
		
		var $send = $('<i/>', {
			class: 'fa fa-send',
		}).appendTo($div);
		
		$send.click(function () {
			wapp.send(this);
		});
	},
	
	refreshSession: function (pChat, pDate) {
		if (pDate) {
			render(pDate);

		} else {
			var extNumber = pChat.attr('data-external-number');
			var extNumberPart = extNumber.substr(extNumber.length - 10);
			var intNumber = pChat.attr('data-internal-number');
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
				
            var $img = pChat.find('.wapp-heading-title.session img');
            $img.attr('src', 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@2/' + light + '.png');
			var $remain = pChat.find('.wapp-heading-title.session .session-time');
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
				class: 'row wapp-message',
				'data-sid': pMsg.sid,
				'data-date': pMsg.date,
			});
			
			var $col = $('<div/>', {
				class: 'col-xs-12 wapp-message-' + pMsg.direction,
			}).appendTo($row);
			
			var $msg = $('<div/>', {
				class: 'wapp-' + pMsg.direction,
			}).appendTo($col);
		
			if (pMsg.operator) $msg.append(pMsg.operator);
			
			var $msgText = $('<div/>', {
				class: 'wapp-message-text',
			}).appendTo($msg);
		
			if (pMsg.nummedia > 0) {
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
								style: 'cursor: pointer; width: 260px; height: 130px; object-fit: cover;',
							}).click(wapp.viewImage).appendTo($div);
							
						} else if (it.ContentType.substr(0, 5) == 'audio') {
							//todo: Safari no soporta OGG, ver si se puede hacer algo con esto: https://github.com/brion/ogv.js/
							var $med = $('<audio/>', {
								controls: true,
								style: 'width: 260px;',
							}).appendTo($div);
							
							$med.append('<source src="' + it.Url + '" type="' + it.ContentType + '">');
							
						} else if (it.ContentType.substr(0, 5) == 'video') {
							var $med = $('<video/>', {
								controls: true,
								style: 'width: 260px; object-fit: contain;',
							}).appendTo($div);
							
							$med.append('<source src="' + it.Url + '" type="' + it.ContentType + '">');

						} else if (it.ContentType.substr(0, 11) == 'application') {
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
				
				var $a = $('<a/>', {
					target: '_blank',
					href: 'https://www.google.com/maps/place/' + lat + ',' + lng,
				}).appendTo($div);
				
				var $img = $('<img/>', {
					src: 'https://maps.google.com/maps/api/staticmap?center=' + lat + ',' + lng + '&markers=color:red%7Csize:mid%7C' + 
						lat + ',' + lng + '&zoom=15&size=260x130&key=AIzaSyDZy47rgaX-Jz74vgsA_wTUlbAodzLvnYY',
					style: 'width: 260px; height: 130px; object-fit: cover;',
				}).appendTo($a);
			}

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
				class: 'wapp-message-time pull-right',
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
			return '<i class="fa fa-clock-o" />';
		} else if (pStatus == 'undelivered') {
			return '<i class="fa fa-exclamation-circle" />';
		} else {
			return '??';
		}
	},

	loadMessages: function (pChat, pOlders) {
		var msgLimit = 50;
		var extNumber = pChat.attr('data-external-number');
		var extNumberPart = extNumber.substr(extNumber.length - 10);
		var intNumber = pChat.attr('data-internal-number');
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
				if (res.length < msgLimit && !incLoad) pChat.find('div.wapp-previous a').hide();
				
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
								if (row['FROM'].indexOf(extNumber) >= 0) {
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
								// Se va al fondo
								if (atBottom) {
									if ($cont[0].scrollHeight - ($cont.scrollTop() + $cont.innerHeight()) > 20)
										$cont.scrollTop($cont[0].scrollHeight);
								}
							}
		                },
		                function (err) {
		                	debugger;
		                }
		            );
	        	}
			},
			function (err) {
				debugger;
			}
		)
	},

	loadMore: function (el) {
		wapp.loadMessages($(el).closest('div.wapp-chat'), true);
	},

	// Enter manda, shift enter nueva linea
	inputKeyDown: function (el) {
		var keyCode = event.which || event.keyCode;
		if (keyCode == 13 && !event.shiftKey) {
			// send
			event.preventDefault();
			wapp.send(el);
		}
	},

	send: function (el) {
		var $chat = $(el).closest('div.wapp-chat');
		var $inp = $(el).closest('.wapp-reply').find('.wapp-reply-input textarea');
		if ($inp.val()) {
			var fromN = $chat.attr('data-internal-number');
			var toN = $chat.attr('data-external-number');
			$.ajax({
				url: '/c/codelibrun2.asp?codelib=WhatsappXHR',
				method: 'POST',
				data: {
					wappaction: 'send',
					from: fromN,
					to: toN,
					body: $inp.val(),
				},
			})
				.done(function (data, textStatus, jqXHR) {
					var $dom = $($.parseXML(jqXHR.responseText));
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
				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					alert('Error: ' + jqXHR.responseText);
				});
	
			$inp.val('');
			wapp.inputResize($inp[0]);
		}
	},

	serverDate: function () {
	    return new Promise(function (resolve, reject) {
			$.ajax({
				url: '/c/codelibrun2.asp?codelib=WhatsappXHR',
				method: 'POST',
				data: {
					wappaction: 'getDate',
				},
			})
				.done(function (data, textStatus, jqXHR) {
					resolve(xmlDecodeDate(data));
				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					reject(jqXHR);
				});
		});
	},
	
	template: function (el) {
		var template = 'support_resume'; //todo: seleccionar
		
		DoorsAPI.folderSearch(wapp.templatesFolder, 'text', 'name = \'' + template + '\'').then(
			function (res) {
				var $inp = $(el).closest('.wapp-reply').find('.wapp-reply-input textarea');
				//todo: insertAtCaret
				$inp.val(res[0]['TEXT']);
				wapp.inputResize($inp[0]);
				$inp.focus();
			},
			function (err) {
				console.log(err);
			}
		)
	},
	
	msgMedia: function (pSid) {
	    return new Promise(function (resolve, reject) {
			$.ajax({
				url: '/c/codelibrun2.asp?codelib=WhatsappXHR',
				method: 'POST',
				data: {
					wappaction: 'msgMedia',
					sid: pSid,
				},
			})
				.done(function (data, textStatus, jqXHR) {
					resolve(data);
				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					reject(jqXHR);
				});
	    });
	},
}