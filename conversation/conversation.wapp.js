/**
 * Fresh: https://cdn.cloudycrm.net/ghcv/cdn@conversationUnifv2/conversation/conversation.wapp.js?_fresh=true
 */
/**
 * Libreria de mensajería a través de conector de Whatsapp utilizando como base conversationcontrol.js 
 * Requiere bootstrap.js, Doorsapi.js
 * Bootstrap.js: Ventanas modales
 * Doorsapi.js: Busqueda de datos
 */

var wappRequiredScripts = [];
wappRequiredScripts.push({ id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' });
wappRequiredScripts.push({ id: 'bootstrap', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js' });
wappRequiredScripts.push({ id: 'bootstrap-css', depends: ['bootstrap'], src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css' });
wappRequiredScripts.push({ id: 'font-awesome', src: 'https://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.css' });
wappRequiredScripts.push({ id: 'lib-moment' });
wappRequiredScripts.push({ id: 'emojis'});
wappRequiredScripts.push({ id: 'doorsapi'});
wappRequiredScripts.push({ id: 'conversationcontrol', depends: ['jquery','bootstrap','bootstrap-css','lib-moment','emojis','doorsapi'], src: 'https://cdn.cloudycrm.net/ghcv/cdn@conversationUnif/conversation/conversationcontrol.js' });
wappRequiredScripts.push({ id: 'conversation-css', depends: ['conversationcontrol'], src: 'https://cdn.cloudycrm.net/ghcv/cdn@conversationUnif/conversation/conversationcontrol.css' });
wappRequiredScripts.push({ id: 'conversation-media', depends: ['conversationcontrol'], src: 'https://cdn.cloudycrm.net/ghcv/cdn@conversationUnif/conversation/conversation.media.js' });

var whatsAppProvider = null; //new whatsAppDataProvider(wappOpts);

/*
* Funcion para obtener proveedor de datos de Whatsapp para control de conversaciones
* Parametro:
* --- options: {
		rootFldId: Requerido. Id de la carpeta root del conector de whatsapp
        messagesFolder: Opcional. Id de la carpeta de mensajes de whatsapp
        formula: Requerido. Formula a utilizar para buscar mensajes.
        sessionStatusContainer: Selector del elemento donde se mostrará el estado de sesion de WhatsApp
        modalContainer: Selector del contenedor donde se aplicará el plugin modal de Bootstrap para mostrar imagenes en pantalla completa
        from: Requerido. Numero de donde saldrán los mensajes
        to: Requerido. Numero de telefono del destinatario.
        loggedUser: Requerido. Datos del usuario logueado.
        googleMapsKey: Opcional. Apikey de Google maps para mostrar ubicaciones
        codelibUrl: Opcional. Url del codelibapi.asp
        s3Key: Requerido. Api Key de acceso a bucket s3 para compartir archivos
        putTemplateRequested: Opcional. Funcion a la que se llamará cuando el provider solicite el agregado de un template al chat
*/
function getWhatsAppDataProvider(opts){
	whatsAppProvider = new whatsAppDataProvider(opts);
	return whatsAppProvider;
}

function whatsAppDataProvider(opts){
    this.parent = conversationBaseDataProvider;
	this.parent();
    this.supportedTypes = ["wappMsg"];
    this.rootFolder = opts.rootFldId || null;
    var msgsFormula = opts.formula || null;
    var from = opts.from || "";
    var to = opts.to || "";
    this.codelibUrl = null;
    this.options = opts;
    this.s3Key = opts.s3Key || null;
	this.allAccounts = [];
	this.messagesFolder = opts.messagesFolder || null;
	this.numbers = [];
    let me = this;
	var wappLib = opts.wappLib || null;
	var intervalId;
    if (typeof(cordova) == 'object') {
        this.codelibUrl = new URL(window.localStorage.getItem('endPoint')).origin + '/c/codelibapi.asp'
    } else {
        this.codelibUrl = '/c/codelibapi.asp';
    };
    this.codelibUrl = opts.codelibUrl || this.codelibUrl;

    var setupRequiredInfo = function () {
        return new Promise((resolve,reject)=>{
            let reqs = 4;
            DoorsAPI.foldersGetByName(me.rootFolder, 'messages').then(
                function (fld) {
                    me.messagesFolder = fld.FldId;
                    tryResolve();
                },function(err){
                    tryResolve();
                }
            );
    
            DoorsAPI.foldersGetByName(me.rootFolder, 'templates').then(
                function (fld) {
                    me.templatesFolder = fld.FldId;
                    DoorsAPI.folderSearch(me.templatesFolder, 'name,text,doc_id', '', 'name').then(
                        function (res) {
                            me.templates = res;//.map(it => it['NAME']);
                            tryResolve();
                        },function (err){
                            tryResolve();
                        }
                    );
                },function(err){
                    tryResolve();
                }
            );
            DoorsAPI.foldersGetByName(me.rootFolder, 'numbers').then(
                function (fld) {
                    me.numbersFolder = fld;
                    DoorsAPI.folderSearch(fld.FldId, '*', '', 'name').then(
                        function (res) {
                            me.numbers = res;//.map(it => it['NAME']);
							fillAccounts();
                            tryResolve();
                        },function (err){
                            tryResolve();
                        }
                    );
                },function(err){
                    tryResolve();
                }
            );

			DoorsAPI.accountsSearch("","").then(function(allAccounts){
				me.allAccounts = allAccounts;
				tryResolve();
			},function(err){
				tryResolve();
			})

            function tryResolve(){
                reqs--;
                if(reqs == 0) resolve();
            }
        });
    };

	var fillAccounts = function(){
		me.numbers.forEach(function(num){
			me.accounts.push({
				id: num["NUMBER"],
				name: num["NAME"],
				status: "stop",
				selected: num["DEFAULT"] == "1" ? true : false,
				icon: "fa-whatsapp"
			});
		});
	}

    setupRequiredInfo().then(function () {
        // Carga mensajes nuevos cada 5 segs
        /*setInterval(function () {
            me.checkSession(function () {
                //TODO Refresh session
                //$('div.wapp-chat[data-rendered]').each(function () {
                //    wapp.loadMessages($(this));
                //});
            });
        }, 5000);*/

        // Actualiza el estado de la sesion cada 1'
		if (!intervalId){
			intervalId = setInterval(function () {
				//TODO
				me.checkSession(function () {
					//TODO Refresh session
					refreshSession();
				});
			}, 60000);
		}
		var $headingSession = $('<div/>', {
			class: 'session',
			style: 'width: 20%; text-align: center;',
		}).appendTo($(me.options.sessionStatusContainer));
		
		$headingSession.append('<img height="30" src="https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@55/wapp/red.png" />');
		$headingSession.append('<div class="session-time"></div>');

		me.checkSession(function () {
			//TODO Refresh session
			refreshSession();
		});
    });

    this.getMessages = function (msgLimit, maxDate){
        return new Promise(function(resolve, reject){ 
			
			var extNumberRev = me.cleanNumber(to);
			var intNumberRev = me.cleanNumber(from);

			var formula = '(from_numrev like \'' + extNumberRev + '%\' and to_numrev like \'' + intNumberRev + 
				'%\')';
			
			if (maxDate) {
				let dt = maxDate;
					formula = 'created < \'' + ISODate(dt) + ' ' + ISOTime(dt, true) + '\' and (' + formula + ')';
			} /*else if (lastLoad) {
				//incLoad = true;
				//var dtEnc = '\'' + ISODate(lastLoad) + ' ' + ISOTime(lastLoad, true) + '\'';
				//formula = '(created > ' + dtEnc + ' or modified > ' + dtEnc + ') and (' + formula + ')';
			};*/
            DoorsAPI.folderSearch(me.messagesFolder, '*', msgsFormula, 'created desc', msgLimit, null, 0).then(
				function (res) {
					let messages = [];
					let mediaPromises = [];
					let mediaPromIndexes = {};
					for(let p = 0; p < res.length; p++){
						let act = res[p];
						let msg = getMessageByActType(act);
						messages.push(msg);


						if(msg.nummedia > 0){
							if (!msg.media) {
								mediaPromises.push(msgMedia(msg.sid));
								mediaPromIndexes[mediaPromises.length - 1] = msg.sid;
							}
						}
					}
					if(mediaPromises.length > 0){
						Promise.allSettled(mediaPromises).then((results)=>{
							for(let indx = 0; indx < results.length; indx++){
								let promResult = results[indx];
								let msgId = mediaPromIndexes[indx];
								if(promResult.status == "fulfilled"){
									let found = messages.find(m=>m.sid == msgId);
									if(found){
										found.media = promResult.value;
									}
								}
								else{
									console.log("Error al obtener media del msj: " + msgId);
								}
							}
							resolve(messages);
						});
					}
					else{
						resolve(messages);
					}					
				},function(err){
					reject(err);
				});
		});
	};
	this.sendMessage = function(msge){
		let me = this;
		let input = null;
		if(me.conversationControl != null && me.conversationControl.options != null && me.conversationControl.options.selector != null){
			let selector = me.conversationControl.options.selector;
			input = $(selector).find(".wapp-reply");
		}
		let msg = {
			from: from,
			to: to,
			body: msge.body
		}
		let selectedAccount = me.accounts.find(a=> a.selected == true);
		if(selectedAccount){
			msg.from = selectedAccount.name;
		}
		if(input && input.attr("data-template")){
			let template = JSON.parse(input.attr("data-template"));
			let vars = input.attr("data-template-vars") ? JSON.parse(input.attr("data-template-vars")) : [];
			
			if(template["MEDIA"] !== undefined && template["MEDIA"] !== null && template["MEDIA"] !== ""){
                msg["mediaUrl"] = [template["MEDIA"]];
                msg["body"] = template["NAME"];
            }
            if(template["CONTENT_SID"]){
                msg.contentSid = template["CONTENT_SID"];
                //Fuerzo para que se busque y se agregue el service id
				//Ya no aplica porque se utiliza la cuenta seleccionada
                //msg.from = from; //["NAME"];
				let contentVariablesObj = {};
				vars.forEach(v=>{
					let prop = v.variable.replaceAll("{","").replaceAll("}","");
					contentVariablesObj[prop] = v.value;
				});
                msg.contentVariables = contentVariablesObj;
                //Borro la propiedad body
                //delete msg.body;
                delete msg.mediaUrl;
            }

			input.removeAttr("data-template");
			input.removeAttr("data-template-vars");
		}
		debugger;
		return new Promise(function(resolve, reject){
			if(wappLib != null){
				wappLib.send(msg).then(function(msgSent){
					var msgObj = new wappMsg();
					msgObj.sid = msgSent.sid;
					msgObj.operator = me.options.loggedUser.Name;
					msgObj.direction = 'outbound';
					msgObj.status = msgSent.status;
					msgObj.body = msgSent.body;
					msgObj.date = msgSent.dateCreated;
					/*msgObj.sid = $dom.find('Message Sid').html();
					msgObj.operator = me.options.loggedUser.Name;
					msgObj.status = $dom.find('Message Status').html();
					msgObj.body = $dom.find('Message Body').html();
					msgObj.date = (xmlDecodeDate($dom.find('Message DoorsCreated').html())).toJSON();*/
					
					resolve(msgObj);
				},function(err){
					//if(input){
					//	input.val(msg.body);
					//}
					alert("No se pudo enviar el mensaje. Detalle: " + err.message);
					reject(err);
				});
			}
			else{
				xhr({
					wappaction: 'send',
					from: from,
					to: to,
					body:msge.body,
				}).then(
					function (res) {
						var $dom = $($.parseXML(res.jqXHR.responseText));

						var msgObj = new wappMsg();
						msgObj.sid = $dom.find('Message Sid').html();
						msgObj.direction = 'outbound';
						msgObj.operator = me.options.loggedUser.Name;
						msgObj.status = $dom.find('Message Status').html();
						msgObj.body = $dom.find('Message Body').html();
						msgObj.date = (xmlDecodeDate($dom.find('Message DoorsCreated').html())).toJSON();

						//let msgeSent = getMessageByActType(res);
						
						resolve(msgObj);
					},
					function (err) {
						//wapp.cursorLoading(false);
						alert('No se pudo enviar el mensaje. Detalle: ' + err.jqXHR.responseText);
						reject(err);
					}
				)
			}
		});
	};
	this.updateMessage = function(id, docFieldValues){
		return new Promise(function(resolve, reject){
			DoorsAPI.documentsGetById(id).then(function(doc){
				for(let i = 0; i < docFieldValues.length; i++){
					let field = docFieldValues[i];
					Gestar.Tools.setDocumentValue(doc,field.field,field.value);
				}
				DoorsAPI.documentSave(doc).then(function(doc){
					resolve(doc);
				},function(err){
					reject(err);
				});
			},function(err){
				reject(err);
			});
		});
	};

    this.checkSession = function (pCallback) {
		if (typeof(cordova) == 'object') {
			if (app7.online) {
				dSession.checkToken(pCallback);
			}
		} else {
			if (pCallback) pCallback();
		}
	};
    this.cleanNumber = function (pNumber) {
		// Elimina los caracteres no numericos, da vuelta y toma los 1ros 10 digitos
		return pNumber.replace(/\D/g, '').reverse().substring(0, 10);
	};
	this.destroy = function(){
		if(intervalId){
			clearInterval(intervalId);
			intervalId = null;
		}
	}
    var xhr = function(data) {
	    return new Promise(function (resolve, reject) {
			var dataExt = Object.assign(data, getContext());
			$.ajax({
				url: me.codelibUrl + '?codelib=WhatsappXHR',
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
			if (typeof(cordova) == 'object') {
				return {
					authToken: window.localStorage.getItem('authToken'),
					cordova: 1,
				}
			} else {
				return {
					cordova: 0,
				}
			}
		}
	};

    var msgMedia = function (pSid) {
	    return new Promise(function (resolve, reject) {
			xhr({
				wappaction: 'msgMedia',
				sid: pSid,
			}).then(
				function (res) {
					resolve(res.data);
				},
				function (err) {
					//debugger;
					reject(err.jqXHR);
				}
			)
	    });
	};

    let fieldMatches = {
        "WhatsApp": [
            {   docField: "MESSAGESID", msgField: "sid" },
            {   docField: "FROM", msgField: "operator"},
            {   docField: "STATUS", msgField: "status"},
            {   docField: "BODY", msgField: "body"},
            {   docField: "CREATED",    msgField: "date" },
            {   docField: "DIRECTION",    msgField: "direction" },
            {   docField: "ACC_ID",    msgField: "accId" },
            {   docField: "EXITCODE",    msgField: "exitCode" },
            {   docField: "LATITUDE",    msgField: "latitude" },
            {   docField: "LONGITUDE",    msgField: "longitude" },
            {   docField: "NUMMEDIA",    msgField: "nummedia" },
            {   docField: "MEDIA",    msgField: "media" },
            {   docField: "REFERRALSOURCEURL",    msgField: "referralSourceUrl" },
            ]
    };

    var getMessageByActType = function(actDoc){
        let msgIns = new wappMsg();
		msgIns.viewImage = me.viewImage;
        let actType = "WhatsApp";
        
        if(msgIns && actDoc){
            let match = fieldMatches[actType];
            if(match){
                for(let i = 0; i < match.length; i++){
                    let m = match[i];
                    if(m.msgField !== null && m.docField !== null){
                        let val = actDoc[m.docField];
                        //Es un document
                        if(actDoc.CustomFields){
                            val = Gestar.Tools.getDocumentValue(actDoc, m.docField);
                        }
                        if(m.msgField == "date"){
                            val = new Date(val);
                        }
                        if(m.docField == "DIRECTION"){
                            val = val.replace("-api","");
                        }
                        msgIns[m.msgField] = val;
                    }
                }
            }
        }
        return msgIns;
    };

    var refreshSession = function (pDate) {
		if (pDate) {
			render(pDate);

		} else {
			/*var extNumber = pChat.attr('data-external-number');
			var intNumber = pChat.attr('data-internal-number');
			if (!extNumber || !intNumber) return;*/


			// Elimina los caracteres no numericos y da vuelta
			var extNumberRev = me.cleanNumber(to);
			//var intNumberRev = me.cleanNumber(from);

			//var formula = 'from_numrev like \'' + extNumberRev + '%\' and to_numrev like \'' + intNumberRev + '%\'';
			var formula = 'from_numrev like \'' + extNumberRev + '%\' ';
			
			/*let accArray = [];
			me.accounts.forEach(function(account){
				accArray.push("whatsapp:" + account.id);
			});
			formula += " and to in ('" + accArray.join("','") + "')";*/

			
			
			
			DoorsAPI.folderSearchGroups(me.messagesFolder,"TO","MAX(CREATED) AS LASTEST",formula).then(
				function (res) {
					if (res.length > 0) {
						res.forEach(function (it) {
							let latestMsgDate = new Date(it["LASTEST"]);
							let account = me.accounts.find(a=> a.id == it["TO"].replace("whatsapp:",""));
							if(account){
								var hours = (new Date() - latestMsgDate) / (60 * 60 * 1000);
								if (hours < 24) {
									account.status = "go";
								}
								else{
									account.status = "stop";
								}
							}
						});
					}
				},
				function (err) {
					console.log(err);
					//debugger;
				}
			)
		};
		
		/*function render(pDate) {
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
			
            var $img = $(me.options.sessionStatusContainer).find('.session img');
            $img.attr('src', 'https://cdn.jsdelivr.net/gh/CloudyVisionArg/cdn@55/wapp/' + light + '.png');
			var $remain = $(me.options.sessionStatusContainer).find('.session .session-time');
			$remain.html(remain);
		}*/
	}

    //TODO Mover afuera? Mover a mensaje?
    this.viewImage = function (e) {
		if (typeof(cordova) == 'object') {
			var popup = getPopup();
			var $cont = popup.$el.find('.page-content .block');

			var $img = $('<img/>').appendTo($cont);
			$img.attr('src', $(this).attr('src'));
			$img.one("load", function() {
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
			$modalBody.html($img);
			$img.attr('src', $(this).attr('src'));
			$img.load(function () {
				$modalDialog.css({marginTop: ($(window).height() - $modalBody.height() - 30) / 2});
			});
		}
	};

    // Devuelve los ticks segun el status
    //TODO Mover a mensaje
    this.getTicks = function (pStatus) {
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
	};

    //No aplica? Mover ahora
    this.putTemplate = function (template) {
		//wapp.cursorLoading(true);
		var me = this;
		DoorsAPI.folderSearch(this.templatesFolder, '*', 'name = \'' + template + '\'', '', 1, null, 0).then(
			function (res) {
				if(me.options.putTemplateRequested){
					me.options.putTemplateRequested(res[0]['TEXT'], res[0]);
				}
				
				//wapp.cursorLoading(false);
				//insertAtCaret(target, res[0]['TEXT']);
				//wapp.inputResize(target);
				//$(target).focus();
			},
			function (err) {
				//wapp.cursorLoading(false);
				console.log(err);
			}
		)
	};

	this.sendAudio = function () {
		var me = this;
		this.audioRecorder(function (file) {
			const previewReader = new FileReader()
			previewReader.onloadend = function(e){
				debugger;
				var previewBlob = new Blob([new Uint8Array(e.target.result)],{type: file.type});
				var previewURL = URL.createObjectURL(previewBlob)
				
				var $block = $(".modal-in").find(".block")
				if(!_isCapacitor()){
					$block = $("#wappModal").find(".modal-body");
					$block.html("");
				}

				var $previewBtnRow = $('<div/>', {
					class: '',
					style: 'padding-top: 10%'
				})
				
				var $divPreviewAudio = $('<div/>',{
					style: "width: 100%;",
				}).appendTo($previewBtnRow);
				
				var $audioControl = $('<audio/>',{
					controls: 'controls',
					style: "width:90%; margin:0 5% 5px;",
				}).appendTo($divPreviewAudio)
				
				var $srcAudioControl = $('<source/>',{
					src: previewURL,
					type: file.type,	
				}).appendTo($audioControl)	
					//<source src=""" type="audio/ogg">
							
				var $btn = $('<button/>', {
					class: 'col button button-large button-round button-outline btn btn-default',
				}).append('Cancelar').appendTo($previewBtnRow);
				
				$btn.click(()=>{
					URL.revokeObjectURL(previewURL);
					if(app7){
						app7.sheet.close(".modal-in");
					}
					else{
						let $modal = $('#wappModal');
						if($modal.length > 0){
							$modal.modal("hide");
						}
					}
				});
				
				var $btnEnviar = $('<button/>', {
					class: 'col button button-large button-round button-fill btn btn-success',
				}).append('Enviar').appendTo($previewBtnRow);
				
				$previewBtnRow.appendTo($block);				
				debugger;
				$btnEnviar.on("click",()=>{
					URL.revokeObjectURL(previewURL);
					me.sendMediaFromFile(file);
					if(app7){
						app7.sheet.close(".modal-in");
					}
					else{
						let $modal = $('#wappModal');
						if($modal.length > 0){
							$modal.modal("hide");
						}
					}
				});
			};
			previewReader.readAsArrayBuffer(file)
        });
	};

	this.sendCamera = function () {
		let source = _isCapacitor() ? CameraSource.Camera : Camera.PictureSourceType.CAMERA;
		let permisssion = _isCapacitor() ? CameraPermissionType.Camera : null;
		me.getPicture(source, permisssion,
			function (file) {
				me.sendMedia(file);
			}
		)
	};

	this.sendPhoto = function () {
		let source = _isCapacitor() ? CameraSource.Photos : Camera.PictureSourceType.PHOTOLIBRARY;
		let permission = _isCapacitor() ? CameraPermissionType.Photos : null;
		me.getMedia(source, permission,
			function (file) {
				me.sendMedia(file);
			}
		);
	};

	this.getMedia = async function (pSource, pPermission, pCallback) {
		if (_isCapacitor()) {
			let res = await Capacitor.Plugins.FilePicker.pickMedia({multiple : true, readData : true});
			let files = res.files;
			for(let idx=0; idx < files.length; idx++){
				let file = me.getBlobFromFile(files[idx].name, files[idx].data, files[idx].mimeType);
				if (pCallback) pCallback(file);
			}
		}else{
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
		}

		function errMgr(pMsg) {
			debugger;
			console.log(pMsg);
			toast(pMsg);
		}
	};

	this.getPicture = async function (pSource, pPermission, pCallback) {
		if (_isCapacitor()) {
			const opts = cameraOptionsCapacitor(pSource);
			opts.resultType = CameraResultType.Uri;
			const hasPermission = await requestPermissionsImages(pPermission);
			if(!hasPermission){ throw new Error('Se necesita permiso de acceso a la c&aacutemara'); }
			try{
				const photo =  await Capacitor.Plugins.Camera.getPhoto(opts);
				const file = await writeFileInCachePath(photo.path);
				file.type = `image/${photo.format}`;
				let fileRes = me.getBlobFromFile(file.name, file.data, file.type);
				debugger;
				if (pCallback) pCallback(fileRes);
			}catch(err){
				errMgr(err);
			}
		} else {
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
		}

		function errMgr(pMsg) {
			debugger;
			console.log(pMsg);
			toast(pMsg);
		}

	};


	this.getBlobFromFile = function(pFileName, pFileData, pFileType){
		let byteCharacters = atob(pFileData);
		let byteNumbers = new Array(byteCharacters.length);

		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}

		let byteArray = new Uint8Array(byteNumbers);
		let blob = new Blob([byteArray], { type: pFileType });

		return new File([blob], pFileName, { type: pFileType });
	}

	this.sendMedia = function (pFile) {
		//todo
        //wapp.cursorLoading(true);
		if(_isCapacitor()){
			me.sendMediaFromFile.call(me, pFile);
			
		}else{
			let me = this;
			if (typeof(cordova) == 'object') {
				getFile(pFile.localURL).then(
					function(){
						me.sendMediaFromFile.call(me, ...arguments);
					},
					function (err) {
						//wapp.cursorLoading(false);
						debugger;
					}
				);
			} else {
				//me.sendMediaFromFile(pFile,pChat);
				me.sendMediaFromFile.call(me, pFile);
			};
		}
	};
	
	this.sendMediaFromFile = function(file2) {
		//var me = this; se pierde la referencia y en este caso this queda apuntando a window en vez del dataprovider 
		//var me = whatsAppProvider;
		//se vuelve a cambiar porque se puede obtener la referencia con el this, si se llama con el ".call"
		var me = this;
		debugger;
		var reader = new FileReader();
		reader.onloadend = function (e) {
			var blobData = new Blob([this.result], { type: file2.type });

			// Setea un ContentType valido para Twilio:
			// https://www.twilio.com/docs/sms/accepted-mime-types
			if (file2.type == 'audio/x-m4a') {
				blobData.contentType = 'audio/mpeg';
			} else if (file2.type == 'audio/aac') {
				//blobData.contentType = 'audio/basic';
				blobData.contentType = file2.type; // audio/aac
			} else {
				blobData.contentType = file2.type;
			}
			
			// Pasos para configurar un Bucket publico en S3:
			// https://medium.com/@shresthshruti09/uploading-files-in-aws-s3-bucket-through-javascript-sdk-with-progress-bar-d2a4b3ee77b5
			me.getS3(function () {
				var s3Key = Doors.RESTFULL.AuthToken + '/' + file2.name;

				me.s3.upload(
					{
						Key: s3Key,
						Body: blobData,
						ContentType: blobData.contentType,
						ACL: 'public-read',
					},

					function(err, data) {
						if (err) {
							debugger;
							//wapp.cursorLoading(false);
							alert(errMsg(err));

						} else {
							var fromN = from; //$chat.attr('data-internal-number');
							var toN = to; //$chat.attr('data-external-number');

							debugger;
				
							xhr({
								wappaction: 'send',
								from: fromN,
								to: toN,
								body: file2.name, // todo: el body va solo en documentos
								mediaUrl: data.Location,
							}).then(
								function (res) {
									debugger;
									var $dom = $($.parseXML(res.jqXHR.responseText));
									let sentMsg = new wappMsg();
									sentMsg.sid = $dom.find('Message Sid').html();
									sentMsg.direction = 'outbound';
									sentMsg.operator = me.options.loggedUser.Name;
									sentMsg.status = $dom.find('Message Status').html();
									sentMsg.body = $dom.find('Message Body').html();
									sentMsg.date = (xmlDecodeDate($dom.find('Message DoorsCreated').html())).toJSON();
									sentMsg.nummedia = $dom.find('Message NumMedia').html();;

									sentMsg.media = JSON.stringify([{
										Url: data.Location,
										ContentType: file2.type,
									}]);

									/*
									sentMsg.latitude = row['LATITUDE'];
									sentMsg.longitude = row['LONGITUDE'];
									*/
									if(me.options.onMessageSent){
										me.options.onMessageSent(sentMsg);
									}
									//TODO
									/*wapp.renderMsg(sentMsg, function (msgRow) {
										var $cont = $chat.find('div.wapp-messages');
										$cont.append(msgRow);
										$cont.scrollTop($cont[0].scrollHeight);
										wapp.cursorLoading(false);
									});*/
								},
								function (err) {
									debugger;
									//wapp.cursorLoading(false);
									alert('Error: ' + err.jqXHR.responseText);
								}
							);

							/*
							// Borra el archivo de S3 despues de un minuto
							setTimeout(function () {
								wapp.s3.deleteObject({ Key: s3Key }, function (err, data) {
									if (err) {
										console.log(err, err.stack);
										debugger;
									}
								});
							}, 60000)
							*/
						}
					}

				).on('httpUploadProgress', function (progress) {
					// Por si hay que actualizar un progress
					var uploaded = parseInt((progress.loaded * 100) / progress.total);
				});
			});
		};
		reader.readAsArrayBuffer(file2);
	};

	this.getS3 = function (pCallback) {
        let me = this;
		if (this.s3) {
			if (pCallback) pCallback();

		} else {
			include('aws-sdk', 'https://sdk.amazonaws.com/js/aws-sdk-2.1.24.min.js', function () {
				var id = me.s3Key; ;
				if (typeof(cordova) == 'object') {
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
					
					me.s3 = new AWS.S3({
						apiVersion: '2006-03-01',
						params: {Bucket: 'cloudy-whatsapp-connector'}
					});
					
					if (pCallback) pCallback();
				}
			})
		}
	};

	this.sendFileWeb = function () {
		var $file = $('#wappFile');
		$file.prop('data-chat', "");
		$file.click();
	};

	this.sendFile = function(){
		let me = this;

		if(_isCapacitor()){
            //Obtengo el archivo seleccionado, lo copio al cache del app y desde ahi dejo asociado.
            //Esto deberia tener un momento en el cual se borra del cache estos files despues de subirlos.
            Capacitor.Plugins.FilePicker.pickFiles({multiple:true, readData:true}).then(
				(res)=>{
					const files = res.files;
					for (let idx=0; idx < files.length; idx++){
						let file = files[idx];
						let blobFile = me.getBlobFromFile(file.name, file.data, file.mimeType);
						me.sendMedia(blobFile);
					}
				},(er)=>{
					alert(errMsg(er));
			});			
        }else{
			if (typeof(cordova) == 'object') {
				chooser.getFileMetadata().then(
					function (res) {
						if (res) {
							//res.uri = "file://" + res.uri; //.replace("content://",);
							getFile(res.uri).then(
								function (file) {
									//att.URL = file.localURL;
									//att.Name = res.name;
									//att.Size = file.size;
									me.sendMedia(file);
								},
								function(err){
									alert(errMsg(err));
								}
							)
						}
					},
					function(erro){
						alert(errMsg(erro));
					}
				)
			}
			else{
				this.sendFileWeb("");
			}
		}
	};
	this.getQuickMessageOptions = async function(messageType){
		let me = this;
		return new Promise((resolve,reject)=>{
			let templates = [];
			if (!me.templates || me.templates.length == 0){
				DoorsAPI.foldersGetByName(me.rootFolder, 'templates').then(
					function (fld) {
						me.templatesFolder = fld.FldId;
						DoorsAPI.folderSearch(me.templatesFolder, 'name,text,doc_id', '', 'name').then(
							function (res) {
								me.templates = res;//.map(it => it['NAME']);
								tryResolve(resolve);
							},function (err){
								reject(err);
							}
						);
					},function(err){
						reject(err);
					}
				);
			}
			else{
				tryResolve(resolve);
			}

			function tryResolve(res){
				if (me.templates && me.templates.length > 0) {
					me.templates.forEach(it => {
						templates.push({
							text: it.NAME,
							name: "template",
							icon: "doc",
							webIcon: "fa-file-text-o",
							selectable: true
						});
					});
				}
				
				res([
					{
						text: "Mensaje de voz",
						name: "audio",
						icon: "mic",
						webIcon: "fa-microphone",
						selectable: true
					},
					{
						text: "C&aacute;mara",
						name: "camera",
						icon: "camera",
						webIcon: "fa-camera",
						selectable: true
					},
					{
						text: "Fotos y Videos",
						name: "pictures",
						icon: "photo",
						webIcon: "fa-picture-o",
						selectable: true
					},
					{
						text: "Documento",
						name: "document",
						icon: "doc",
						webIcon: "fa-file-o",
						selectable: true
					},
					{
						text: "Ubicaci&oacute;n",
						name: "location",
						icon: "placemark",
						webIcon: "fa-map-marker",
						selectable: true
					},
					{
						text: "Plantillas",
						name: "template",
						icon: "chat_bubble_text",
						webIcon: "fa-file-text-o",
						selectable: false,
						children: templates
					}
				])
			}
		});
	};
	this.displayWhatsAppOptions = function(container){
		var $media;
		var me = this;
		if (typeof(cordova) != 'object') {
			// Web
			if(!container){
				var $dropup = $('<div/>', {
					class: 'dropup',
				}).appendTo($div);
	
				$media = $('<i/>', {
					class: 'fa fa-plus',
					'data-toggle': 'dropdown',
				}).appendTo($dropup);
				container = $dropup;
			}			
			if(!$(container).is("ul")){
				var $menu = $('<ul/>', {
					class: 'dropdown-menu',
				}).appendTo(container);
			}
			else{
				$menu = container;
			}
			if($menu.children().length > 0) return;

			/*var $liAudio = $('<li/>').appendTo($menu);
			var $audioLink = $('<a/>').append('Audio');
			$audioLink.appendTo($liAudio);
			$audioLink.click(function (e) {
				//me.sendFileWeb($cont[0]);
				//TODO
				me.sendAudio(container);
			});*/

			var $li = $('<li/>',{
				class:"dropdown-item"
			}).appendTo($menu);
			
			var $file = $('<a/>').append('Archivo');
			$file.appendTo($li);
			$file.click(function (e) {
				me.sendFileWeb("");
			});

			var $liTmp = $('<li/>', {
				class: 'dropdown-item dropdown-submenu',
			}).appendTo($menu);

			var $aTmp = $('<a/>').append('Plantilla <span class="caret">');
			$aTmp.appendTo($liTmp);

			$liTmp.click(function (e) {
				var $this = $(this).children("a");
				if (me.templates && me.templates.length > 0) {
					if ($this.next('ul').length == 0) {
						var $ul = $('<ul/>', {
							class: 'dropdown-menu',
						}).appendTo($this.parent());
						//debugger;
						me.templates.forEach(it => {
							var $li = $('<li/>',{
								class:"dropdown-item"
							}).appendTo($ul);
							var $a = $('<a/>').appendTo($li);
							$a.append(it.NAME);
							$li.click(function (e) {
								me.putTemplate($(this).children("a").text());
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
				class: 'divider dropdown-divider',
			}).appendTo($menu);

			var $li = $('<li/>', {
				class: "dropdown-item"
			}).appendTo($menu);
			$('<a/>').append('Cancelar').appendTo($li);
			//$menu.css("display","block")

		} else {
			// Cordova
			//  Media options
			var mediaActions = app7.actions.create({
				buttons: [
					[
						{
							text: '<i class="f7-icons">mic</i>&nbsp;&nbsp;Mensaje de voz',
							onClick: function () {
								me.sendAudio.call(me);
							}
						},
						{
							text: '<i class="f7-icons">camera</i>&nbsp;&nbsp;C&aacute;mara',
							onClick: function () {
								me.sendCamera();
							}
						},
						{
							text: '<i class="f7-icons">photo</i>&nbsp;&nbsp;Fotos y Videos',
							onClick: function () {
								me.sendPhoto();
							}
						},
						{
							text: '<i class="f7-icons">doc</i>&nbsp;&nbsp;Documento',
							onClick: function () {
								//toast('En desarrollo');
								me.sendFile();
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

								if (me.templates && me.templates.length > 0) {
									var tempButtons = [
										[],
										[{
											text: 'Cancelar',
											bold: true,
											close: true,
										}]
									];

									me.templates.forEach(it => {
										tempButtons[0].push({
											text: it.NAME,
											onClick: tempClick,
										})
									});

									tempActions = app7.actions.create({
										buttons: tempButtons,
									});

									
									tempActions.open();

									function tempClick(actions, e) {
										me.putTemplate(this.text);
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

			
			mediaActions.open();
		}
	};

	this.executeQuickOption = function (option, messageType) {
		let me = this;
		//TODO
		if (option.name == "audio") {
			if(typeof(cordova) == "object"){
				me.sendAudio.call(me);
			}
			else{
				//alert("En desarrollo");
				me.sendAudio.call(me);
			}
		} else if (option.name == "camera") {
			if(typeof(cordova) == "object"){
				me.sendCamera.call(me);
			}
			else{
				me.sendFileWeb("");
			}
		} else if (option.name == "pictures") {
			if(typeof(cordova) == "object"){
				me.sendPhoto.call(me);
			}
			else{
				me.sendFileWeb("");
			}
		} else if (option.name == "document") {
			if(typeof(cordova) == "object"){
				me.sendFile.call(me);
			}
			else{
				me.sendFileWeb("");
			}
		} else if (option.name == "location") {
			alert("En desarrollo");
		} else if (option.name == "template") {
			//TODO
			me.putTemplate(option.text);
		} else {
			//TODO
			//me.sendText(option.name);
		}
	};

	this.audioRecorder = function(pCallback) {
		var mediaRec, interv, timer, save;
		save = false;
	
		var $sheet = $('<div/>', {
			class: 'sheet-modal',
		});
		
		$('<div/>', {
			class: 'swipe-handler',
		}).appendTo($sheet);
		
		var $block = $('<div/>', {
			class: 'block',
		}).appendTo($sheet);
		
		var $timer = $('<div/>', {
			class: 'text-align-center',
			style: 'font-size: 40px; font-weight: bold; padding: 30px; opacity: 20%',
		}).append('0:00').appendTo($block);
		
		var $recBtnRow = $('<div/>', {
			class: 'row',
		}).appendTo($block);
		
		var $btn = $('<button/>', {
			class: 'col button button-large button-round button-fill color-pink btn btn-primary',
		}).append('Grabar').appendTo($recBtnRow);
		
		$btn.click(record);
		
		var $saveBtnRow = $('<div/>', {
			class: '',
		}).hide().appendTo($block);
		
		var $btn = $('<button/>', {
			class: 'col button button-large button-round button-outline btn btn-default',
		}).append('Cancelar').appendTo($saveBtnRow);
		
		$btn.click(cancel);
		
		var $btn = $('<button/>', {
			class: 'col button button-large button-round button-fill btn btn-success',
		}).append('Guardar').appendTo($saveBtnRow);
		
		$btn.click(saveAction);
		

		var sheet = null, $modal = null;
		if(typeof(cordova) == "object"){
			// Abre el sheet
			sheet = app7.sheet.create({
				swipeToClose: true,
				content: $sheet[0],
			}).open();
		}
		else{
			$modal = $('#wappModal');
			var $modalDialog = $modal.find('.modal-dialog');
			var $modalBody = $modal.find('.modal-body');
			$modalBody.html($sheet);
			$modalDialog.css({marginTop: ($(window).height() - $modalBody.height() - 30) / 2});
			$modalDialog.css("width","300px");
			$modalDialog.css("height","170px");
			$modal.modal('show');
		}
		

		//throw "Not implemented";
		function record(){
			mediaRec = new recorder(null);
			mediaRec.record().then(function(file){
				if(save){
					$timer.hide()
					$saveBtnRow.hide();
					pCallback(file);
				}else{
					if(sheet){
						sheet.close();
					}
					if($modal){
						$modal.modal("hide");
					}
				}
			},function(error){

			});
			$recBtnRow.hide();
			$saveBtnRow.show();
			$timer.css('opacity', '100%');
			
			timer = new Date();
			interv = setInterval(function () {
				var secs = Math.trunc((new Date() - timer) / 1000);
				var mins = Math.trunc(secs / 60);
				secs = secs - mins * 60;
				$timer.html(mins + ':' + leadingZeros(secs, 2));
			}, 200);
		}
		
		function saveAction() {
			save = true;
			clearInterval(interv);
			mediaRec.stopRecording();
		}
		
		function cancel() {
			clearInterval(interv);
			mediaRec.stopRecording();
			$timer.html('0:00');
			$timer.css('opacity', '20%');
			$recBtnRow.show();
			$saveBtnRow.hide();
		}
	};
}

function wappMsg(){
    this.parent = msg;
    this.parent();
    this.type = "WhatsApp";
    this.icon = "fa-whatsapp";
    this.nummedia = null;
    this.media = null;
    this.latitude = null;
    this.longitude = null;
	this.mapsUrl = null;
	this.placesUrl = null;
	this.referralSourceUrl = null;
	this.viewImage = function(e){};
	this.getMessageHtml = function(message){
		var me = this;
		return new Promise((resolve, reject) => {
			resolve(getHtml(message));

			function getHtml(pMsg){
				var appendBody = true;
				let dateString = pMsg.date instanceof Date ? pMsg.date.toISOString() : pMsg.date;
				var $row = $('<div/>', {
					class: 'conv-message wapp-message',
					'data-sid': pMsg.sid,
					'data-date': dateString
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
						//debugger;
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
								}).click(me.viewImage).appendTo($div);
								
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
									 download: pMsg.body || "Archivo",
									 style: 'font-weight: 500;',
								}).append(pMsg.body || "Archivo").appendTo($div);
								
								appendBody = false;
							}
						});
					}
				}

				if(pMsg.referralSourceUrl){
					var $div = $('<div/>').appendTo($msgText);
					if(!pMsg.body){
						pMsg.body = "sin texto";
					}
					$('<a/>', {
						target: '_blank',
						href: pMsg.referralSourceUrl,
						style: 'font-weight: 500;',
				   }).append(pMsg.body).appendTo($div);
				   appendBody = false;
				}
				
				if (pMsg.latitude || pMsg.longitude) {
					var lat = pMsg.latitude;
					var lng = pMsg.longitude;
					
					var $div = $('<div/>').appendTo($msgText);
	
					var key;
					if (typeof(cordova) == 'object') {
						//todo: falta restringir esta clave (no se puede ingresar la URL ionic://localhost)
						//https://developers.google.com/maps/documentation/javascript/get-api-key
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
						
						//todo: estos reemplazos deben trabajar con word boundary
						// https://stackoverflow.com/questions/58356773/match-star-character-at-end-of-word-boundary-b
						//body = body.replace(/\*([^*]+)\*/g, '<b>$1<\/b>'); // Reemp los * con <b>
						// Este queda desactivado xq me rompe los enlaces, activarlo cdo este word boundary
						//body = body.replace(/\_([^_]+)\_/g, '<i>$1<\/i>'); // Reemp los _ con <i>
						body = body.replace(/\~([^~]+)\~/g, '<del>$1<\/del>'); // Reemp los ~ con <del>
					};
					
					$msgText.append(body);
				}
				$("<i class='fa " + me.icon + " pull-left' style='margin-right:6px;' aria-hidden='true'></i>").appendTo($msg);
				var $msgTime = $('<div/>', {
					class: 'wapp-message-time',
				}).appendTo($msg);
				
				dt = new Date(pMsg.date);
				$msgTime.append(me.formatDate(dt));
				
				if (pMsg.status) {
					$msgTime.append(' <span class="wapp-message-status-container">' + me.getTicks(pMsg.status) + '</span>');
				}
				
				resolve($row);
			}
		});
	};


	// Devuelve los ticks segun el status
	this.getTicks = function (pStatus) {
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
	};
}

async function newWhatsAppChatControl(opts){
	let phoneField = opts.phoneField;
	let fromField = opts.fromField;
	let nameField = opts.nameField;
	let refDocId = opts.docId;
	let refFldId = opts.fldId;
	let s3Key = opts.s3Key;
	let container = opts.container;

	await include(wappRequiredScripts);

	let wappFolderId = await dSession.settings('WHATSAPP_CONNECTOR_FOLDER');
    if (!wappFolderId) alert('WHATSAPP_CONNECTOR_FOLDER setting missing');

    let wappFolder = await dSession.folders(wappFolderId);
    let fldMsg = await wappFolder.folder('messages');
    let fldNumbers = await wappFolder.folder('numbers');
    let fld = await dSession.folders(parseInt(refFldId));

    let allProms = [];
    allProms.push(fldNumbers.search({
        fields:"*",
        formula:"default = 1"
    }));
    allProms.push(fld.search({
        fields:"*",
        formula:"doc_id = " + refDocId
    }));
	let variablesProp = await fld.properties("WAPP_VARIABLES");
	if(variablesProp){
		variablesProp = JSON.parse(variablesProp);
	}
	//debugger;
	/*
	[
		{variable:"{{1}}","type":"field",value: "NAME"},
		{variable:"{{2}}","type":"text",value: "Casa"},
		{variable:"{{3}}","type":"loggedusername", value: "NAME"}
	]
	*/

    Promise.allSettled(allProms).then(async proms=>{
        let numbers = proms[0].value;
        let docs = proms[1].value;
        let mobilePhone = null;
        let from = null;
		let name = null;
		if(numbers.length > 0){
			from = numbers[0]["NUMBER"];
		}
        if(docs.length > 0){
            mobilePhone = docs[0][phoneField.toUpperCase()];
			if(nameField){
				name = docs[0][nameField.toUpperCase()]
			}
			if(fromField){
				from = docs[0][fromField.toUpperCase()]
			}
        }


		$(container).append(`<div class="chat-container cust-chat" data-chat-id="${refDocId}" style="max-height: 100vh;"></div>`);

		mobilePhone = mobilePhone != null && mobilePhone.length == 10 ? "+549" + mobilePhone : mobilePhone + "";
        /*let opts = {
            rootFldId: wappFolderId,
            msgsFldId: fldMsg.id,
            from: from,
            selector: 'div.chat-container[data-chat-id=' + refDocId + ']',
            sessionStatusContainer: 'div.chat-container[data-chat-id=' + refDocId + '] .chat-header .whatsapp-status-container',
            mobilePhone: mobilePhone,
            s3Key: s3Key,
            onPutTemplateRequested: function(txt){
				debugger;
				let vars = variablesProp;
				onWhatsappPutTemplate(refDocId,txt);
			}
        };*/
		let loggedUser = await dSession.currentUser;
		let userData = {
			Name: loggedUser.name,
			AccId: loggedUser.id
		};
    
		
		let reversedNum = mobilePhone.slice(-8).split("").reverse().join("");
		let finalFormula = "FROM_NUMREV LIKE '" + reversedNum + "%' OR TO_NUMREV LIKE '" + reversedNum + "%'";
		//Si le pasó un from explícito por campo, buscamos solo los mensajes con ese from
		if(fromField){
			finalFormula = "(FROM_NUMREV LIKE '" + reversedNum + "%' AND TO = 'whatsapp:" + from + "') OR (TO_NUMREV LIKE '" + reversedNum + "%' AND FROM = 'whatsapp:" + from + "')";
		}

		var wappOpts = {
			rootFldId: wappFolderId,
			messagesFolder: fldMsg.id,
			formula: finalFormula,
			sessionStatusContainer: 'div.chat-container[data-chat-id=' + refDocId + '] .chat-header .whatsapp-status-container',
			from: from,
			to: mobilePhone,
			loggedUser: userData,
			googleMapsKey: null, //TODO
			s3Key: s3Key,
			wappLib: opts.wappLib,
			onMessageSent:function (msg){

			},
			putTemplateRequested: function(txt, templateObj){
				debugger;
				let vars = variablesProp;
				/*[
					{variable:"{{1}}","type":"field",value: "NAME"},
					{variable:"{{2}}","type":"text",value: "Casa"},
					{variable:"{{3}}","type":"loggedusername", value: "NAME"}
				]*/
				if(txt == null && templateObj != null){
					txt = templateObj.NAME;
				}
				vars.map((varObj) => {
					var val = null;
					if(varObj.type == "field"){
						val = docs[0][varObj.value.toUpperCase()];
					}
					if(varObj.type == "text"){
						val = varObj.value;
					}
					if(varObj.type == "loggedusername"){
						val = loggedUser.name;
					}

					if(val == null) return;
					txt = txt.replaceAll(varObj.variable, val);
					varObj["value"] = val;
				})
				onWhatsappPutTemplate('div.chat-container[data-chat-id=' + refDocId + '] .wapp-reply', txt, templateObj, vars);
			}
		};
		let providers = [];
		var wappProvider = getWhatsAppDataProvider(wappOpts);
		providers.push(wappProvider);
		var dataProvider = new conversationDataProvider();
		dataProvider.msgproviders = providers;
		let conversationOptions = {};
		conversationOptions.dataProvider = dataProvider;
		let quickMessageTypes = [  
			{
				name: 'Whatsapp',
				type: "wappMsg",
				children: [
					{
						name: 'Audio',
						type: "wappMsg",
						children: null
					},
					{
						name: 'Archivo',
						type: "wappMsg",
						children: null
					},
					{
						name: "Plantilla",
						type: "wappMsg",
						children: null
					}
				]
			}
		];
		conversationOptions.headerHtml = getHeaderHtml(mobilePhone, name);
		conversationOptions.subheaderHtml = "";
		conversationOptions.selector = 'div.chat-container[data-chat-id=' + refDocId + ']';
		conversationOptions.quickMessageTypes = quickMessageTypes;
		conversationOptions.defaultQuickMessageType = "wappMsg";
		conversationOptions.quickMessageChanged = function(newMessageType){
			if(newMessageType == "wappMsg"){
				//TODO: What??
				//$("div.chat-container[data-chat-id='" + refDocId + "'] .message-type-button ul.dropdown-menu li a i.fa-whatsapp").parent().parent().addClass("dropdown-submenu");
				//$('div.chat-container[data-chat-id=' + refDocId + '] .message-type-button ul.dropdown-menu').html("<li></li>");
				wappProvider.displayWhatsAppOptions($('div.chat-container[data-chat-id=' + refDocId + '] .message-type-button ul.dropdown-menu'));
			}
		};
		let control = new conversationControl(conversationOptions);
		return control;
    });
}

function onWhatsappPutTemplate(chatInputSelector, text, templateObj,vars){
    let input =  $(chatInputSelector);
	if(templateObj){
		$(input).attr("data-template", JSON.stringify(templateObj));
	}
	if(vars){
		$(input).attr("data-template-vars", JSON.stringify(vars));
	}
    insertAtCaret(input[0], text);
}

/*
todo:
- Enviar media
*/

(function() {
	include('whatsapp-css');
	include('jslib');
	include('emojis');

	var root = document.documentElement;

	if (typeof(cordova) == 'object') {
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
}());

$(document).ready(function () {
	/*DoorsAPI.instanceSettingsGet('WHATSAPP_CONNECTOR_FOLDER').then(
		function (res) {
			wapp.rootFolder = res;
			
			if (typeof(cordova) == 'object') {
				wapp.codelibUrl = new URL(window.localStorage.getItem('endPoint')).origin + '/c/codelibapi.asp'
			} else {
				wapp.codelibUrl = '/c/codelibapi.asp';
			};
		
			
		}
	);

	DoorsAPI.loggedUser().then(
		function (res) {
			wapp.loggedUser = res;
		}
	);*/

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

		// El input para leer archivos
		let $file = $('<input/>', {
			type: 'file',
			id: 'wappFile',
			style: 'display: none;'
		}).appendTo(document.body);

		$file.change(function (e) {
			let inp = e.target;
			if (inp.files.length > 0) {
				whatsAppProvider.sendMedia(inp.files[0], $(inp).prop('data-chat'));
				inp.value = '';
			}
		})

	}
});



/*
function newProxAccionControl(pId,pLabel,pOptions){
	var arrScripts = [];
	//Requiere JQuery, moment, Bootrap y bootstrap-datetimepicker
	arrScripts.push({ id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' });
	arrScripts.push({ id: 'lib-moment' });
	arrScripts.push({ id: 'bootstrap', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js' });
	arrScripts.push({ id: 'bootstrap-css', depends: ['bootstrap'], src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css' });
	arrScripts.push({ id: 'tempus-dominus', depends: ['jquery', 'bootstrap-css', 'lib-moment'], src: 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/js/tempusdominus-bootstrap-4.min.js' });
	arrScripts.push({ id: 'tempus-dominus-css', src: 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/css/tempusdominus-bootstrap-4.min.css' });
}*/