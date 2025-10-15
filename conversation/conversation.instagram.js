/**
 * Fresh: https://cdn.cloudycrm.net/ghcv/cdn@conversationUnifv2/conversation/conversation.instagram.js?_fresh=true
 */
/**
 * Libreria de mensajería a través de messenger para conversationcontrol.v2.js
 * Requiere bootstrap.js, Doorsapi.js
 * Bootstrap.js: Ventanas modales
 * Doorsapi.js: Busqueda de datos
 */

var branch = "conversationUnifv2";
var instagramRequiredScripts = [];

if(typeof(jQuery) === 'undefined'){
	instagramRequiredScripts.push({ id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' });
}
if(typeof(bootstrapVersion) === 'undefined'){
	if (typeof(cordova) != 'object') {
		instagramRequiredScripts.push({ id: 'bootstrap', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js' });
		instagramRequiredScripts.push({ id: 'bootstrap-css', depends: ['bootstrap'], src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css' });
		bootstrapVersion = function(){ return [5,1,3]; };
	}
}

instagramRequiredScripts.push({ id: 'font-awesome', src: 'https://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.css' });
instagramRequiredScripts.push({ id: 'lib-moment' });
instagramRequiredScripts.push({ id: 'emojis'});
if(typeof(DoorsAPI) === 'undefined'){
	instagramRequiredScripts.push({ id: 'doorsapi'});
}
instagramRequiredScripts.push({ id: 'conversationcontrol', depends: ['jquery','bootstrap','bootstrap-css','lib-moment','emojis','doorsapi'], src: 'https://cdn.cloudycrm.net/ghcv/cdn@' + branch + '/conversation/conversationcontrol.js' });
instagramRequiredScripts.push({ id: 'conversation-css', depends: ['conversationcontrol'], src: 'https://cdn.cloudycrm.net/ghcv/cdn@' + branch + '/conversation/conversationcontrol.css' });
instagramRequiredScripts.push({ id: 'conversation-media', depends: ['conversationcontrol'], src: 'https://cdn.cloudycrm.net/ghcv/cdn@' + branch + '/conversation/conversation.media.js' });
instagramRequiredScripts.push({ id: 'conversation-status', depends: ['conversationcontrol'], src: 'https://cdn.cloudycrm.net/ghcv/cdn@' + branch + '/conversation/conversation.status.js' });


var instagramProvider = null;

/*
* Funcion para obtener proveedor de datos de Instagram para control de conversaciones
* Parametro:
* --- options: {
		rootFldId: Requerido. Id de la carpeta root del conector de whatsapp
        messagesFolder: Opcional. Id de la carpeta de mensajes de whatsapp
        formula: Requerido. Formula a utilizar para buscar mensajes.
        sessionStatusContainer: Selector del elemento donde se mostrará el estado de sesion de WhatsApp
        modalContainer: Selector del contenedor donde se aplicará el plugin modal de Bootstrap para mostrar imagenes en pantalla completa
        from: Requerido. Id de la pagina saldrán los mensajes
        to: Requerido. Id del destinatario.
        loggedUser: Requerido. Datos del usuario logueado.
        googleMapsKey: Opcional. Apikey de Google maps para mostrar ubicaciones
        codelibUrl: Opcional. Url del codelibapi.asp
        s3Key: Requerido. Api Key de acceso a bucket s3 para compartir archivos
        putTemplateRequested: Opcional. Funcion a la que se llamará cuando el provider solicite el agregado de un template al chat
*/
function getInstagramDataProvider(opts){
	instagramProvider = new instagramDataProvider(opts);
	return instagramProvider;
}

function instagramDataProvider(opts){
    this.parent = conversationBaseDataProvider;
	this.parent();
    this.supportedTypes = ["instaMessengerMsg"];
    this.rootFolder = opts.rootFldId || null;
    var msgsFormula = opts.formula || null;
    var from = opts.from || "";
    var to = opts.to || "";
    this.codelibUrl = null;
    this.options = opts;
    this.s3Key = opts.s3Key || null;
	this.allAccounts = [];
	this.messagesFolder = opts.messagesFolder || null;
    let me = this;
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
            DoorsAPI.foldersGetByPath(me.rootFolder, '/instagram/insta_chats/insta_messages').then(
                function (fld) {
                    me.messagesFolder = fld.FldId;
                    tryResolve();
                },function(err){
                    tryResolve();
                }
            );
    
            DoorsAPI.foldersGetByPath(me.rootFolder, '/instagram/insta_chats').then(
                function (fld) {
                    me.chatsFolder = fld.FldId;
                    DoorsAPI.folderSearch(me.chatsFolder, '*', "ID = '" + to + "'").then(
                        function (res) {
							if(res.length > 0){
                            	me.chat = res[0];//.map(it => it['NAME']);
							}
                            tryResolve();
                        },function (err){
                            tryResolve();
                        }
                    );
                },function(err){
                    tryResolve();
                }
            );
            DoorsAPI.foldersGetByPath(me.rootFolder, '/config/registered_connections').then(
                function (fld) {
                    me.pagesFolder = fld;
                    DoorsAPI.folderSearch(me.pagesFolder.FldId, '*', "").then(
                        function (res) {
							me.allPages = res;//.map(it => it['NAME']);
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


    setupRequiredInfo().then(function () {
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

	var fillAccounts = function(){
		me.allPages.forEach(function(page){
			if(page["INSTAGRAM_BUSINESS_ID"] == me.options.from){
				me.accounts.push({
					id: page["INSTAGRAM_BUSINESS_ID"],
					name: page["PAGE_NAME"],
					status: "stop",
					selected: page["INSTAGRAM_BUSINESS_ID"] == me.options.from,
					icon: "fa-instagram"
				});
			}
		});
	}

    this.getMessages = function (msgLimit, maxDate){
		let me = this;
        return new Promise(function(resolve, reject){ 
			
			//var extNumberRev = me.cleanNumber(to);
			//var intNumberRev = me.cleanNumber(from);

			var formula = '(SENDER_ID = \'' + from + '%\' and recipiend_id = \'' + to + 
				'%\') or (recipient_id = \'' + from + '%\' and sender_id = \'' + to + '%\')';
			
			if (maxDate) {
				let dt = maxDate;
					formula = 'createdtime < \'' + ISODate(dt) + ' ' + ISOTime(dt, true) + '\' and (' + formula + ')';
			} /*else if (lastLoad) {
				//incLoad = true;
				//var dtEnc = '\'' + ISODate(lastLoad) + ' ' + ISOTime(lastLoad, true) + '\'';
				//formula = '(created > ' + dtEnc + ' or modified > ' + dtEnc + ') and (' + formula + ')';
			};*/
			//debugger;
            DoorsAPI.folderSearch(me.messagesFolder, 'doc_id,ID,page_id,STATE,direction,sender_id,recipient_id,body,TEXT,created,createdtime', msgsFormula, 'createdtime desc', msgLimit, null, 0).then(
				function (res) {
					let messages = [];
					let mediaPromises = [];
					let mediaPromIndexes = {};
					for(let p = 0; p < res.length; p++){
						let act = res[p];
						let msg = getMessageByActType(act);
						msg.operator = me.options.toFriendlyName;
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
		return new Promise(function(resolve, reject){
			DoorsAPI.documentsNew(me.messagesFolder).then(function(doc){
				

                msge.customSendFields = [{
					field: "SENDER_ID",
					value: from
				},{
					field: "RECIPIENT_ID",
					value: to
				},{
					field: "PAGE_ID",
					value: me.options.pageId
				},{
					field: "DIRECTION",
					value: "outbound"
				},{
					field: "STATE",
					value: "Creado"
				},{
					field: "CREATEDTIME",
					value: new Date()
				},{
					field: "TEXT",
					value: msge.body
				}];
				
				if(msge.customSendFields && msge.customSendFields.length > 0){
					for(let p = 0; p < msge.customSendFields.length; p++){
						let field = msge.customSendFields[p].field;
						let value = msge.customSendFields[p].value;
						Gestar.Tools.setDocumentValue(doc,field,value);
					}
				}
				
				//Gestar.Tools.setDocumentValue(doc,"REFERENCESTOID", currentOppId);			
				
				//debugger;
				DoorsAPI.documentSave(doc).then(function(res){
					if(msge.type == "Messenger Instagram"){
					}
					let msgeSent = getMessageByActType(res);
					
					resolve(msgeSent);
				},function(err){
					reject(err);
				});
			},function(err){
				reject(err);
			});
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
					debugger;
					reject(err.jqXHR);
				}
			)
	    });
	};
    let fieldMatches = {
        "Messenger Instagram": [
            {   docField: "DOC_ID", msgField: "sid" },
            {   docField: "SENDER_ID", msgField: "operator"},
            {   docField: "STATE", msgField: "status"},
            {   docField: "TEXT", msgField: "body"},
            {   docField: "CREATEDTIME",    msgField: "date" },
            {   docField: "DIRECTION",    msgField: "direction" },
            {   docField: "ACC_ID",    msgField: "accId" },
            {   docField: "PAGE_ID",    msgField: "pageId" },
            {   docField: "BODY",    msgField: "jsonBody" }
            ]
    };

    var getMessageByActType = function(actDoc){
        let msgIns = new instaMessengerMsg();
		msgIns.viewImage = me.viewImage;
        let actType = "Messenger Instagram";
        
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
                        if(m.docField == "BODY"){
                            if(typeof(val) == "string"){
								val = JSON.parse(val);
							}
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
			//var extNumberRev = me.cleanNumber(to);
			//var intNumberRev = me.cleanNumber(from);

			var formula = 'sender_id = \'' + to + '\' and recipient_id = \'' + from + '\'';
			
			DoorsAPI.folderSearchGroups(me.messagesFolder,"recipient_id","MAX(CREATEDTIME) AS LASTEST",formula).then(
				function (res) {
					if (res.length > 0) {
						res.forEach(function (it) {
							let latestMsgDate = new Date(it["LASTEST"]);
							let account = me.accounts.find(a=> a.id == it["RECIPIENT_ID"]);
							if(account){
								var hours = (new Date() - latestMsgDate) / (60 * 60 * 1000);
								if (hours < 144) {
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
	};

    //No aplica? Mover ahora
    this.putTemplate = function (template, target) {
		//wapp.cursorLoading(true);
		var me = this;
		DoorsAPI.folderSearch(this.templatesFolder, 'text', 'name = \'' + template + '\'', '', 1, null, 0).then(
			function (res) {
				if(me.options.putTemplateRequested){
					me.options.putTemplateRequested(res[0]['TEXT']);
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

	this.sendAudio = function (pChat) {
		this.audioRecorder(function (file) {
			debugger;
			me.sendMedia(file, pChat);
        });
	};

	this.sendCamera = function (pChat) {
		me.getPicture(Camera.PictureSourceType.CAMERA, 
			function (file) {
				me.sendMedia(file, pChat);
			}
		)
	};

	this.sendPhoto = function (pChat) {
		me.getPicture(Camera.PictureSourceType.PHOTOLIBRARY, 
			function (file) {
				me.sendMedia(file, pChat);
			}
		)
	};

	this.getPicture = function (pSource, pCallback) {
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
	};

	this.sendMedia = function (pFile, pChat) {
		//todo
        //wapp.cursorLoading(true);
        let me = this;
		if (typeof(cordova) == 'object') {
			getFile(pFile.localURL).then(
				sendMedia2,
				function (err) {
					//wapp.cursorLoading(false);
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
								var $chat = $(pChat);
								var fromN = $chat.attr('data-internal-number');
								var toN = $chat.attr('data-external-number');

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
										msg = {};
										msg.sid = $dom.find('Message Sid').html();
										msg.direction = 'outbound';
										msg.operator = me.options.loggedUser.Name;
										msg.status = $dom.find('Message Status').html();
										msg.body = $dom.find('Message Body').html();
										msg.date = (xmlDecodeDate($dom.find('Message DoorsCreated').html())).toJSON();
										msg.nummedia = $dom.find('Message NumMedia').html();;

										msg.media = JSON.stringify([{
											Url: data.Location,
											ContentType: file2.type,
										}]);

										/*
										msg.latitude = row['LATITUDE'];
										msg.longitude = row['LONGITUDE'];
										*/

										//TODO
                                        /*wapp.renderMsg(msg, function (msgRow) {
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
		}

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

	this.sendFileWeb = function (pChat) {
		var $file = $('#msngrFile');
		$file.prop('data-chat', pChat);
		$file.click();
	};
	this.getQuickMessageOptions = async function(messageType){
		let me = this;
		return new Promise((resolve,reject) =>{
			let templates = [];
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
			resolve([
				{
					text: "Plantillas",
					name: "template",
					icon: "chat_bubble_text",
					webIcon: "fa-file-text-o",
					selectable: false,
					children: templates
				}
			]);
		});
	};
	this.executeQuickOption = function (option, messageType) {
		let me = this;
		//TODO
		if (option.name == "template") {
			//TODO
			me.putTemplate(option.text);
		} else {
			//TODO
			//me.sendText(option.name);
		}
	};
	/*
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

		tempActions.params.chatEl = actions.params.chatEl;
		tempActions.open();

		function tempClick(actions, e) {
			me.putTemplate(this.text);
		};

	} else {
		toast('No hay plantillas definidas');
	} 
	*/
	

	this.displayMessengerOptions = function(container){
		var $media;
		var me = this;
		if (typeof(cordova) != 'object') {
			// Web
			/*if(!container){
				var $dropup = $('<div/>', {
					class: 'dropup',
				}).appendTo($div);
	
				$media = $('<i/>', {
					class: 'fa fa-plus',
					'data-toggle': 'dropdown',
				}).appendTo($dropup);
				container = $dropup;
			}*/

			var $menu = $('<ul/>', {
				class: 'dropdown-menu',
			}).appendTo(container);

			var $liTmp = $('<li/>', {
				class: 'dropdown-submenu',
			}).appendTo($menu);

			var $aTmp = $('<a/>').append('Plantilla <span class="caret">');
			$aTmp.appendTo($liTmp);

			$aTmp.click(function (e) {
				var $this = $(this);
				if (me.templates && me.templates.length > 0) {
					if ($this.next('ul').length == 0) {
						var $ul = $('<ul/>', {
							class: 'dropdown-menu',
						}).appendTo($this.parent());
						//debugger;
						me.templates.forEach(it => {
							var $li = $('<li/>').appendTo($ul);
							var $a = $('<a/>').appendTo($li);
							$a.append(it.NAME);
							$a.click(function (e) {
								me.putTemplate(this.text);
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
			}).appendTo($menu);

			var $li = $('<li/>').appendTo($menu);
			$('<a/>').append('Cancelar').appendTo($li);

		} else {
			// Cordova
			//  Media options
			var mediaActions = app7.actions.create({
				buttons: [
					[
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

									tempActions.params.chatEl = actions.params.chatEl;
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

			mediaActions.params.chatEl = $(container)[0];
			mediaActions.open();
		}
	};

	this.audioRecorder = function(pCallback) {
		var mediaRec, interv, timer, save;
	
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
			class: 'col button button-large button-round button-fill color-pink',
		}).append('Grabar').appendTo($recBtnRow);
		
		$btn.click(record);
		
		var $saveBtnRow = $('<div/>', {
			class: 'row',
		}).hide().appendTo($block);
		
		var $btn = $('<button/>', {
			class: 'col button button-large button-round button-outline',
		}).append('Cancelar').appendTo($saveBtnRow);
		
		$btn.click(cancel);
		
		var $btn = $('<button/>', {
			class: 'col button button-large button-round button-fill',
		}).append('Guardar').appendTo($saveBtnRow);
		
		$btn.click(save);
		
		// Abre el sheet
		var sheet = app7.sheet.create({
			swipeToClose: true,
			content: $sheet[0],
		}).open();
		
		function record() {

			debugger;
			save = false;
			var now = new Date();
			var src = 'audio_' + ISODate(now) + '_' + ISOTime(now).replaceAll(':', '-');
			if (device.platform == 'iOS') {
				src += '.m4a';
			} else {
				src += '.aac';
			}
		
			mediaRec = new Media('cdvfile://localhost/temporary/' + src,
				// success callback
				function() {
					if (save) {
						debugger;
						window.requestFileSystem(LocalFileSystem.TEMPORARY, 0,
							function (fileSystem) {
								fileSystem.root.getFile(src, { create: false, exclusive: false	},
									function (fileEntry) {
										addDuration(fileSystem, fileEntry, mediaRec, function (file) {
											if (pCallback) {
												pCallback(file);
											};
											sheet.close();
										});
	
									},
									function (err) {
										logAndToast('getFile error: ' + err.code);
									}
								);
							}
						);
					};
				},
			
				// error callback
				function (err) {
					logAndToast('Media error: ' + err.code);
				}
			);
			
			mediaRec.startRecord();
			
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
		
		function save() {
			save = true;
			clearInterval(interv);
			mediaRec.stopRecord();
			mediaRec.release();
		}
		
		function cancel() {
			clearInterval(interv);
			mediaRec.stopRecord();
			mediaRec.release();
			$timer.html('0:00');
			$timer.css('opacity', '20%');
			$recBtnRow.show();
			$saveBtnRow.hide();
		}
	
		function addDuration(pFileSystem, pFileEntry, pMediaRec, pCallback) {
			// Agrega la duracion al nombre del archivo, usa moveTo para renombrar
			if (pMediaRec.getDuration() == -1) {
				// El play/stop lo arregla en Android, para iOs hay que meter este fix:
				// https://github.com/apache/cordova-plugin-media/issues/177?_pjax=%23js-repo-pjax-container#issuecomment-487823086
				
				save = false;
				pMediaRec.play();
				pMediaRec.stop();
				pMediaRec.release();
	
				// Espera 2 segs a getDuration
				var counter = 0;
				var timerDur = setInterval(function() {
					counter = counter + 100;
					if (counter > 2000) {
						clearInterval(timerDur);
						resume();
					}
					if (pMediaRec.getDuration() > 0) {
						clearInterval(timerDur);
						resume();
					}
				}, 100);
	
			} else {
				resume();
			}
	
			function resume() {
				if (pMediaRec.getDuration() > -1) {
					var dur = pMediaRec.getDuration();
					var min = Math.trunc(dur / 60);
					var fileName = min + '-' + ('0' + Math.trunc(dur - min * 60)).slice(-2) + '_min_' + pFileEntry.name;
					pFileEntry.moveTo(pFileSystem.root, fileName,
							function (fileEntry) {
							fileEntry.file(pCallback);
						},
						function (err) {
							console.log('moveTo error: ' + err.code);
							pFileEntry.file(pCallback); // Pasa el que venia nomas
						}
					)
				} else {
					pFileEntry.file(pCallback); // Pasa el que venia nomas
				}
			}
		}


		function doWebRecord(){
			let mediaOptions = {
			  video: {
				tag: 'video',
				type: 'video/webm',
				ext: '.mp4',
				gUM: {video: true, audio: true}
			  },
			  audio: {
				tag: 'audio',
				type: 'audio/ogg',
				ext: '.ogg',
				gUM: {audio: true}
			  }
			};
			media =  mediaOptions.audio;
			navigator.mediaDevices.getUserMedia(media.gUM).then(_stream => {
				stream = _stream;
				//id('gUMArea').style.display = 'none';
				//id('btns').style.display = 'inherit';
				//start.removeAttribute('disabled');
				recorder = new MediaRecorder(stream);
				recorder.ondataavailable = e => {
					chunks.push(e.data);
					if(recorder.state == 'inactive')  makeLink();
				};
				console.log('got media successfully');
			}).catch(console.log);
			start.onclick = e => {
				start.disabled = true;
				stop.removeAttribute('disabled');
				chunks=[];
				recorder.start();
			}
			stop.onclick = e => {
				stop.disabled = true;
				recorder.stop();
				start.removeAttribute('disabled');
			}
			function makeLink(){
				let blob = new Blob(chunks, {type: media.type })
					, url = URL.createObjectURL(blob)
					, li = document.createElement('li')
					, mt = document.createElement(media.tag)
					, hf = document.createElement('a')
				;
				mt.controls = true;
				mt.src = url;
				hf.href = url;
				hf.download = `${counter++}${media.ext}`;
				hf.innerHTML = `donwload ${hf.download}`;
				li.appendChild(mt);
				li.appendChild(hf);
				ul.appendChild(li);
			}
		}
	}
}

function instaMessengerMsg(){
    this.parent = msg;
    this.parent();
    this.type = "Messenger Instagram";
    this.icon = "fa-instagram";
    this.nummedia = null;
    this.media = null;
    this.latitude = null;
    this.longitude = null;
	this.mapsUrl = null;
	this.placesUrl = null;
	this.pageId = null;
	this.jsonBody = null;
	this.viewImage = function(e){};
	this.getMessageHtml = function(message){
		var me = this;
		return new Promise((resolve, reject) => {
			resolve(getHtml(message));

			function getHtml(pMsg){
				var appendBody = true;
				let dateString = pMsg.date instanceof Date ? pMsg.date.toISOString() : pMsg.date;
				var $row = $('<div/>', {
					class: 'conv-message msngr-message insta-message',
					'data-sid': pMsg.sid,
					'data-date': dateString,
				});
				
				var $msg = $('<div/>', {
					class: 'msngr-' + pMsg.direction,
				}).appendTo($row);
			
				if (pMsg.operator) $msg.append(pMsg.operator);
				
				var $msgText = $('<div/>', {
					class: 'msngr-message-text',
				}).appendTo($msg);
				if(pMsg.jsonBody && pMsg.jsonBody.message && pMsg.jsonBody.message.attachments){
					for (let index = 0; index < pMsg.jsonBody.message.attachments.length; index++) {
						const att = pMsg.jsonBody.message.attachments[index];
						var $div = $('<div/>').appendTo($msgText);
						var $btn;
						if(att.type == "image" || att.type == "story_mention"){
							$('<img/>', {
								src: att.payload.url,
								style: 'cursor: pointer; width: 100%; height: 130px; object-fit: cover;',
							}).click(me.viewImage).appendTo($div);
							if(att.type == "story_mention"){
								$div.append('<br><b>Te mencionaron en una historia</b>');
							}
								
						} else if (att.type == 'audio') {
							var $med = $('<audio/>', {
								controls: true,
								style: 'width: 230px;',
							}).appendTo($div);
								
							$med.append('<source src="' + att.payload.url + '" >');
	
						} else if (att.type == 'video') {
							var $med = $('<video/>', {
								controls: true,
								style: 'width: 100%; object-fit: contain;',
							}).appendTo($div);
							
							$med.append('<source src="' + att.payload.url + '" >');
						} else if (att.type == "template") {
							$div.append('<i>El usuario respondió a una plantilla genérica</i>');
						}
					}
				}
			
				if (pMsg.nummedia > 0 && pMsg.media) {
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
								}).click(whatsAppProvider.viewImage).appendTo($div);
								
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
					class: 'msngr-message-time',
				}).appendTo($msg);
				
				dt = new Date(pMsg.date);
				$msgTime.append(me.formatDate(dt));
				
				if (pMsg.status) {
					//$msgTime.append(' <span class="msngr-message-status-container">' + me.getTicks(pMsg.status) + '</span>');
				}
				
				resolve($row);
			}
		});
	};
	// Devuelve los ticks segun el status
	this.getTicks = function (pStatus) {
		var tick = '&#x2713;'
		if (pStatus == 'read') {
			return '<span class="msngr-message-status" style="color: #5FC4E8;">' + tick + tick + '</span>';
		} else if (pStatus == 'delivered') {
			return '<span class="msngr-message-status">' + tick + tick + '</span>';
		} else if (pStatus == 'sent') {
			return '<span class="msngr-message-status">' + tick + '</span>';
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

/**
 * Crea un chat de Instagram en un contenedor
 * Compatible con generic3, generic5 y APP7
 * @param {string} opts.container - Requerido - Selector del contenedor donde se creará el chat
 * @param {string} opts.phoneField - Nombre del campo que contiene el número de teléfono externo. Opcional si se pasa opcion "to"
 * @param {number} opts.docId - DocId del documento. Requerido si se envío phoneField/fromField/nameField
 * @param {object} opts.doc - (opcional) Documento. Requerido si se envío phoneField/fromField/nameField y no se envió docId
 * @param {number} opts.fldId - FldId del documento. Requerido si se envío phoneField/fromField/nameField
 * @param {string} opts.to - Número de teléfono externo. Opcional si se pasa opcion "phoneField"
 * @param {string} opts.s3Key - Clave de S3 para subir archivos
 * @param {string} opts.nameField - (opcional) Nombre del campo que contiene el nombre del contacto
 * @param {string} opts.fromField - (opcional) Nombre del campo que contiene el número de teléfono interno
 * @param {string} opts.from - (opcional) Número de teléfono interno
 * @param {boolean} opts.forceSingleFrom - (opcional) Si es true, filtra los mensajes solo por el from
 * @param {object} opts.variables - (opcional) Variables a reemplazar en el mensaje
 */
async function newInstaMessengerChatControl(opts){
	let accountField = opts.accountField;
	let nameField = opts.nameField;
	let pageIdField = opts.pageIdField;
	let refDocId = opts.docId;
	let refFldId = opts.fldId;
	let s3Key = opts.s3Key;
	let container = opts.container;

	await include(instagramRequiredScripts);

	let fbFolderId = await dSession.settings('FACEBOOK_CONNECTOR_FOLDER');
    if (!fbFolderId) alert('FACEBOOK_CONNECTOR_FOLDER setting missing');

    let fbFolder = await dSession.folders(fbFolderId);
    let fldMsg = await dSession.folder('/instagram/insta_chats/insta_messages', fbFolderId);
    let fldPages = await dSession.folder('/config/registered_connections', fbFolderId);
    let fld = await dSession.folders(parseInt(refFldId));

    let allProms = [];
    allProms.push(fldPages.search({
        fields:"*",
        formula:""
    }));
    allProms.push(fld.search({
        fields:"*",
        formula:"doc_id = " + refDocId
    }));
	let variablesProp = await fld.properties("INSTA_VARIABLES");
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
        let pages = proms[0].value;
        let docs = proms[1].value;
        let accountId = null;
        let from = null;
		let name = null;
        if(docs.length > 0){
            accountId = docs[0][accountField.toUpperCase()];
			if(nameField){
				name = docs[0][nameField.toUpperCase()]
			}
        }
        if(pageIdField){
            from = docs[0][pageIdField];
        }

		$(container).append(`<div class="chat-container cust-chat" data-chat-id="${refDocId}" style="max-height: 100vh;"></div>`);
		let loggedUser = await dSession.currentUser;
		let userData = {
			Name: loggedUser.name,
			AccId: loggedUser.id
		};
		var instaMssngerOpts = {
			rootFldId: fbFolderId,
			messagesFolder: fldMsg.id,
			formula: "SENDER_ID = '" + accountId + "' OR RECIPIENT_ID = '" + accountId + "'",
			sessionStatusContainer: "div#instaMessengerChat .messenger-status-container",
			modalContainer: "",
			from: from,
			to: accountId,
			toFriendlyName: name,
			pageId: from,
			loggedUser: null,
			googleMapsKey: null,
			codelibUrl: null,
			s3Key: s3Key,
			putTemplateRequested: function(txt, templateObj){
				debugger;
				let vars = variablesProp || [];
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
				onMessengerPutTemplate('div.chat-container[data-chat-id=' + chatId + '] .wapp-reply', txt, templateObj, vars);
			}
		};
		
		let conversationOptions = {};
		conversationOptions.headerHtml = getHeaderHtml(accountId, name);
		conversationOptions.subheaderHtml = ""; //getSubheaderHtml();
		conversationOptions.selector =  'div.chat-container[data-chat-id=' + refDocId + ']';;
		conversationOptions.quickMessageTypes = ["instaMessengerMsg"];
		conversationOptions.defaultQuickMessageType = "instaMessengerMsg";
		
		let instagramProvider = getInstagramDataProvider(instaMssngerOpts);
		let providers = [instagramProvider];
		
		var dataProvider = new conversationDataProvider();
		dataProvider.msgproviders = providers;
		conversationOptions.dataProvider = dataProvider;
		
		conversationOptions.quickMessageChanged = function(newMessageType){
			if(newMessageType == "instaMessengerMsg"){
				instagramProvider.displayMessengerOptions($("div#instaMessengerChat .message-type-button"));
			}
		};
		
		let control = new conversationControl(conversationOptions);
		$('div#instaMessengerChat #type-selector .dropdown-menu li').on('click', function () {
			$("div#instaMessengerChat #type-selector .dropdown-toggle > span:first-of-type").html($(this).find("a").html());
		});
		return control;
    });


	function onMessengerPutTemplate(chatInputSelector, text){
		let input =  $(chatInputSelector);
		insertAtCaret(input[0], text);
	}
	
	
	/*
	todo:
	- Enviar media
	*/
	
	(function() {
		// include('whatsapp-css');
		// include('jslib');
		// include('emojis');
	
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
				id: 'msngrFile',
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
	});
}