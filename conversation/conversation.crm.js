/**
 * Fresh: https://cdn.cloudycrm.net/ghcv/cdn@conversationUnifv2/conversation/conversation.crm.js?_fresh=true
 */

var actsProvider = null; //new activitiesDataProvider(actsProvOpts);
var notasProvider = null; //new notasDataProvider(notasOpts);
//var whatsAppProvider = null; //new whatsAppDataProvider(wappOpts);


/*
* Funcion para obtener proveedores de datos de CRM para control de conversaciones
* Parametros:
* --- actsOptions: {
		chatContainer: Requerido. selector o elemento contenedor del chat
		fldId: Requerido. ID de la carpeta de actividades
		formula: Requerido. fitro inicial del provedor de actividades //"REFIERE_ID = 303507 AND TIPO NOT IN ('Enviar WhatsApp')",
		crmData: Requerido {
			leadData: {
				Datos de la lead para impactar en las actividades
				docId, frmId, subject
			},
			customerData:{
				Datos del cliente para enviar mensajes y llamadas y para impactar en las actividades
				mobilePhone, email, telephone, name, lastName, fullName, docId
			},
			userData: {
				Datos del usuario logueado
				name, accId, email
			}
		},
        fieldMatches: (opcional) Objeto matcheando actividades y los campos del mensaje
        Ej:
        {
        La actividades de tipo "Enviar Sms" matchea con los siguientes campos del mensaje
        "Enviar Sms": [
            {   docField: "DOC_ID", msgField: "sid" },
            {   docField: "ORGANIZADOR", msgField: "operator"},
            {   docField: "ESTADO", msgField: "status"},
            {   docField: "NOTAS", msgField: "body"},
            {   docField: "INICIO",    msgField: "date" }
            ],
            ...
	    }
* --- notasOptions: {
		fldId: Id de la carpeta de notas
		formula: Filtro del proveedor de notas
		leadData: {
			Datos de la lead para impactar en las actividades
			docId, frmId, subject
		}
		userData: {
			Datos del usuario logueado
			name, accId, email
		}
	}
*/
function getCrmDataProviders(actsOptions,notasOptions){
	let providers = [];
	if(actsOptions){
		actsProvider = new activitiesDataProvider(actsOptions)
		providers.push(actsProvider);
	}
	if(notasOptions){
		notasProvider = new notasDataProvider(notasOptions);
		providers.push(notasProvider);
	}
	return providers;
}


function smsMsg(){
    this.parent = msg;
    this.parent();
    this.type = "Sms";
    this.icon = "fa-commenting-o";
    this.getMessageHtml = function(message){
        var me = this;
        return new Promise((resolve, reject) => {
            resolve(getHtml(message));
            function getHtml(msj){
                var appendBody = true;
                let dateString = msj.date instanceof Date ? msj.date.toISOString() : msj.date;
                var $row = $('<div/>', {
                    class: 'conv-message wapp-message msj-sms',
                    'data-sid': msj.sid,
                    'data-date': dateString,
                });
                
                var $msg = $('<div/>', {
                    class: 'wapp-' + msj.direction,
                }).appendTo($row);
            
                if (msj.operator) $msg.append(msj.operator);
                
                var $msgText = $('<div/>', {
                    class: 'wapp-message-text',
                }).appendTo($msg);

                if (appendBody) {
                    var body = msj.body;
                    if (body) {
                        body = body.replace(/\n/g, '<br>'); // Reemp los \n con <br>
                        
                        //todo: estos deberian trabajar con word boundary, mejorar
                        // https://stackoverflow.com/questions/58356773/match-star-character-at-end-of-word-boundary-b
                        body = body.replace(/\*([^*]+)\*/g, '<b>$1<\/b>'); // Reemp los * con <b>
                        body = body.replace(/\_([^_]+)\_/g, '<i>$1<\/i>'); // Reemp los _ con <i>
                        body = body.replace(/\~([^~]+)\~/g, '<del>$1<\/del>'); // Reemp los _ con <i>
                    };
                    
                    
                }
                if (msj.status) {
                    //let icon = msj.status == "Realizada" ? "fa-thumbs-up text-success" : "fa-thumbs-down text-danger";
                    //body += "<div class='msg-detail-container'><i class='fa " + icon + "'></i> " + msj.status + "</div>";
                }
                else{
                    /*body += "<div class='activity-actions'>" +
                    "<button class='btn btn-success' onclick='smsMessageTools.markAsDone(" + msj.sid + ",true);this.disabled = true;'><i class='fa fa-thumbs-up'></i> La hice</button>" + 
                    "<button class='btn btn-danger' onclick='smsMessageTools.markAsDone(" + msj.sid + ",false);this.disabled = true;'><i class='fa fa-thumbs-down'></i> No la hice</button>" + 
                    "</div>";*/
                }
                $msgText.append(body);
                
                var $msgTime = $('<div/>', {
                    class: 'wapp-message-time',
                }).appendTo($msg);
                
                dt = new Date(msj.date);
                $msgTime.append("<span class='pull-left'><i class='fa fa-commenting-o'></i></span>");
                $msgTime.append("<span>" + me.formatDate(dt) + "</span>");
                
                //if (msj.status) {
                //    $msgTime.append(' <span class="wapp-message-status-container">' + whatsappMessageTools.getTicks(msj.status) + '</span>');
                //}
                return $row;
            }
        })
	};
}
function emailMsg(){
    this.parent = msg;
    this.parent();
    this.type = "Email";
    this.icon = "fa-envelope";
    this.getMessageHtml = function(message){
        var me = this;
        return new Promise((resolve, reject) => {
            resolve(getHtml(message));
            function getHtml(msj){
                var appendBody = true;
                let dateString = msj.date instanceof Date ? msj.date.toISOString() : msj.date;
                var $row = $('<div/>', {
                    class: 'conv-message wapp-message',
                    'data-sid': msj.sid,
                    'data-date': dateString,
                });
                
                var $msg = $('<div/>', {
                    class: 'wapp-' + msj.direction,
                }).appendTo($row);
            
                if (msj.operator) $msg.append(msj.operator);
                
                var $msgText = $('<div/>', {
                    class: 'wapp-message-text',
                }).appendTo($msg);

                if (appendBody) {
                    var body = msj.body;
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
                if (msj.status) {
                    let icon = msj.status == "Mensaje Enviado" ? "fa-thumbs-up text-success" : "fa-thumbs-down text-danger";
                    body += "<div class='msg-detail-container'><i class='fa " + icon + "'></i> " + msj.status + "</div>";
                }
                else{
                    body += "<div class='activity-actions'>" +
                    "<button class='btn btn-success' ><i class='fa fa-thumbs-up'></i> La hice</button>" + 
                    "<button class='btn btn-danger' ><i class='fa fa-thumbs-down'></i> No la hice</button>" + 
                    "</div>";
                }
                var $msgTime = $('<div/>', {
                    class: 'wapp-message-time',
                }).appendTo($msg);
                
                dt = new Date(msj.date);

                $msgTime.append("<span class='pull-left'><i class='fa fa-envelope'></i></span>");
                $msgTime.append("<span>" + me.formatDate(dt) + "</span>");
                
                //if (msj.status) {
                //    $msgTime.append(' <span class="wapp-message-status-container">' + whatsappMessageTools.getTicks(msj.status) + '</span>');
                //}

                
                $row.find(".activity-actions .btn-success").on("click",function(e){
                    this.disabled = true;
                    me.provider.markAsDone(me.sid,true);
                })
                $row.find(".activity-actions .btn-danger").on("click",function(e){
                    this.disabled = true;
                    me.provider.markAsDone(me.sid,false);

                })

                return $row;
            }
        })
	};
}
function wappActMsg(){
    this.parent = msg;
    this.parent();
    this.type = "WhatsApp";
    this.icon = "fa-whatsapp";
    this.nummedia = null;
    this.media = null;
    this.latitude = null;
    this.longitude = null;
}
function notaMsg(){
    this.parent = msg;
    this.parent();
    this.type = "Nota";
    this.getMessageHtml = function(message){
        var me = this;
        return new Promise((resolve, reject) => {
            resolve(getHtml(message));
            function getHtml(msj){
                var appendBody = true;
                let dateString = msj.date instanceof Date ? msj.date.toISOString() : msj.date;
                var $row = $('<div/>', {
                    class: 'conv-message wapp-message',
                    'data-sid': msj.sid,
                    'data-date': dateString,
                });
                
                var $msg = $('<div/>', {
                    class: 'wapp-' + msj.direction,
                }).appendTo($row);
            
                if (msj.operator) $msg.append(msj.operator);
                
                var $msgText = $('<div/>', {
                    class: 'wapp-message-text',
                }).appendTo($msg);

                if (appendBody) {
                    let body = msj.body;
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

                $msgTime.append("<span class='pull-left'><i class='fa fa-pencil-square-o'></i></span>");
                
                dt = new Date(msj.date);
                $msgTime.append("<span>" + me.formatDate(dt) + "</span>");
                
                
                return $row;
            }
        })
	};
}
function llamadaMsg(){
    this.parent = msg;
    this.parent();
    this.type = "Llamar";
    this.icon = "fa-phone";
    this.getMessageHtml = function(message){
        var me = this;
        return new Promise((resolve, reject) => {
            resolve(getHtml(message));
            function getHtml(msj){
                var appendBody = true;
                let dateString = msj.date instanceof Date ? msj.date.toISOString() : msj.date;
                var $row = $('<div/>', {
                    class: 'conv-message wapp-message',
                    'data-sid': msj.sid,
                    'data-date': dateString,
                });
                
                var $msg = $('<div/>', {
                    class: 'wapp-' + msj.direction,
                }).appendTo($row);
            
                if (msj.operator) $msg.append(msj.operator);
                
                var $msgText = $('<div/>', {
                    class: 'wapp-message-text',
                }).appendTo($msg);

                if (appendBody) {
                    let body = msj.body;
                    if (body) {
                        body = body.replace(/\n/g, '<br>'); // Reemp los \n con <br>
                        
                        //todo: estos deberian trabajar con word boundary, mejorar
                        // https://stackoverflow.com/questions/58356773/match-star-character-at-end-of-word-boundary-b
                        body = body.replace(/\*([^*]+)\*/g, '<b>$1<\/b>'); // Reemp los * con <b>
                        body = body.replace(/\_([^_]+)\_/g, '<i>$1<\/i>'); // Reemp los _ con <i>
                        body = body.replace(/\~([^~]+)\~/g, '<del>$1<\/del>'); // Reemp los _ con <i>
                    };
                    
                    body = "<h6><i class='fa fa-phone'></i> Llamada saliente</h6>";
                    if (msj.status && msj.status != "Pendiente") {
                        let icon = msj.status == "Realizada" || msj.status == "Contactado" ? "fa-thumbs-up text-success" : "fa-thumbs-down text-danger";
                        body += "<div class='msg-detail-container'><i class='fa " + icon + "'></i> " + msj.status + "</div>";
                    }
                    else{
                        body += "<div class='activity-actions'>" +
                        "<button class='btn btn-success'><i class='fa fa-thumbs-up'></i> La hice</button>" + 
                        "<button class='btn btn-danger' ><i class='fa fa-thumbs-down'></i> No la hice</button>" + 
                        "</div>";
                    }
                    $msgText.append(body);
                }
                
                var $msgTime = $('<div/>', {
                    class: 'wapp-message-time',
                }).appendTo($msg);
                
                //dt = new Date(msj.date);
                dt = msj.date;
                
                $msgTime.append("<span class='pull-left'><i class='fa fa-'></i></span>");
                $msgTime.append("<span>" + me.formatDate(dt) + "</span>");
                
                
                
                $row.find(".activity-actions .btn-success").on("click",function(e){
                    this.disabled = true;
                    me.provider.markAsDone(me.sid,true);
                })
                $row.find(".activity-actions .btn-danger").on("click",function(e){
                    this.disabled = true;
                    me.provider.markAsDone(me.sid,false);

                })

                return $row;
            }
        })
	};
}
function visitaMsg(){
    this.parent = msg;
    this.parent();
    this.type = "Visita";
    this.where = null;
    this.when = null;
    this.icon = "fa-users";
    this.getMessageHtml = function(message){
        let me = this;
        return new Promise((resolve, reject) => {
            resolve(getHtml(message));
            function getHtml(msj){
                var appendBody = true;
                let dateString = msj.date instanceof Date ? msj.date.toISOString() : msj.date;
                var $row = $('<div/>', {
                    class: 'conv-message wapp-message msj-visita',
                    'data-sid': msj.sid,
                    'data-date': dateString,
                });
                
                var $msg = $('<div/>', {
                    class: 'wapp-' + msj.direction,
                }).appendTo($row);
            
                if (msj.operator) $msg.append(msj.operator);
                
                var $msgText = $('<div/>', {
                    class: 'wapp-message-text',
                }).appendTo($msg);
                let body = ""; //msj.body;
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
                dt = new Date(msj.date);
                
                let  visitaText = me.actType ? me.actType : me.type;
                body += "<h4><i class='fa " + me.icon + "'></i> " + visitaText + " el " + moment(dt).format("L") + " a las " + moment(dt).format("LT") + "</h4>";

                if (msj.status) {
                    let icon = msj.status == "Vino a la reunión" ? "fa-thumbs-up text-success" : "fa-thumbs-down text-danger";
                    body += "<div class='msg-detail-container'><i class='fa " + icon + "'></i> " + msj.status + "</div>";
                }
                else{
                    body += "<div class='activity-actions'>" +
                    "<button class='btn btn-success' ><i class='fa fa-thumbs-up'></i> La hice</button>" + 
                    "<button class='btn btn-danger' ><i class='fa fa-thumbs-down'></i> No la hice</button>" + 
                    "</div>";
                }
                $msgText.append(body);

                var $msgTime = $('<div/>', {
                    class: 'wapp-message-time',
                }).appendTo($msg);
                
                
                
                $msgTime.append("<span class='pull-left'><i class='fa " + me.icon + "'></i></span>");
                $msgTime.append("<span>" + me.formatDate(dt) + "</span>");    
                
                
                $row.find(".activity-actions .btn-success").on("click",function(e){
                    this.disabled = true;
                    me.provider.markAsDone(me.sid,true);
                })
                $row.find(".activity-actions .btn-danger").on("click",function(e){
                    this.disabled = true;
                    me.provider.markAsDone(me.sid,false);

                })

                return $row;
            }
        });
    };
}
function activitiesDataProvider(opts){
    this.parent = conversationBaseDataProvider;
	this.parent();
    this.supportedTypes = opts.supportedTypes || ["llamadaMsg","visitaMsg","emailMsg","smsMsg","wappMsg"];
    this.allMessages = [];
	var actsFolder = opts.fldId || 5211;
    var actsFormula = opts.formula || "1=0";
	var allOpts = opts;
    var me = this;
    this.getMessages = function (msgLimit){
        return new Promise(function(resolve, reject){ 
            DoorsAPI.folderSearch(actsFolder, 'doc_id,tipo,estado,inicio,notas,subject,organizador', actsFormula, 'created desc', msgLimit, null, 0).then(
				function (res) {
					let messages = [];
					for(let p = 0; p < res.length; p++){
						let act = res[p];
						let msg = me.getMessageByActType(act["TIPO"],act);
                        msg.provider = me;
						messages.push(msg);
					}
					me.allMessages = messages;
					resolve(messages);
				},function(err){
					reject(err);
				});
		});
	};
	this.sendMessage = function(mssg){
		let me = this;
		return new Promise(function(resolve, reject){
            me.conversationControl.cursorLoading(true);
			DoorsAPI.documentsNew(actsFolder).then(function(doc){
                
                let msgType = mssg.constructor.name;
				debugger;
                if(msgType == "smsMsg"){
					mssg.customSendFields = [{
						field:"INICIO",
						value: moment().subtract(1,"m").toDate()
					},{
						field:"FIN",
						value: moment().subtract(10,"s").toDate()
					},{
						field: "REFIERE",
						value: allOpts.crmData.leadData.subject
					},{
						field: "REFIERE_FORM",
						value: allOpts.crmData.leadData.frmName
					},{
						field: "REFIERE_ID",
						value: allOpts.crmData.leadData.docId
					},{
						field: "ORGANIZADOR",
						value: allOpts.crmData.userData.name
					},{
						field: "ORGANIZADOR_ID",
						value: allOpts.crmData.userData.accId
					},{
						field: "ESTADO",
						value: "Realizada"
					},{
						field: "TIPO",
						value: "Enviar Sms"
					},{
						field: "NOTAS",
						value: mssg.body
					}];
				}
				if(msgType == "llamadaMsg"){
					mssg.customSendFields = [{
						field:"INICIO",
						value: new Date()
					},{
						field: "REFIERE",
						value: allOpts.crmData.leadData.subject
					},{
						field: "REFIERE_FORM",
						value: allOpts.crmData.leadData.frmName
					},{
						field: "REFIERE_ID",
						value: allOpts.crmData.leadData.docId
					},{
						field: "ORGANIZADOR",
						value: allOpts.crmData.userData.name
					},{
						field: "ORGANIZADOR_ID",
						value: allOpts.crmData.userData.accId
					},{
						field: "ESTADO",
						value: "Pendiente"
					},{
						field: "TIPO",
						value: "Llamar"
					}];
				}
				if(msgType == "emailMsg"){
					mssg.customSendFields = [{
						field:"INICIO",
						value: moment().subtract(1,"m").toDate()
					},{
						field:"FIN",
						value: moment().subtract(10,"s").toDate()
					},{
						field: "REFIERE",
						value: allOpts.crmData.leadData.subject
					},{
						field: "REFIERE_FORM",
						value: allOpts.crmData.leadData.frmName
					},{
						field: "REFIERE_ID",
						value: allOpts.crmData.leadData.docId
					},{
						field: "ORGANIZADOR",
						value: allOpts.crmData.userData.name
					},{
						field: "ORGANIZADOR_ID",
						value: allOpts.crmData.userData.accId
					},{
						field: "ESTADO",
						value: "Realizada"
					},{
						field: "TIPO",
						value: "Enviar Correo"
					},{
						field: "NOTAS",
						value: mssg.body
					}];
				}

				
				if(mssg.customSendFields && mssg.customSendFields.length > 0){
					for(let p = 0; p < mssg.customSendFields.length; p++){
						let field = mssg.customSendFields[p].field;
						let value = mssg.customSendFields[p].value;
						Gestar.Tools.setDocumentValue(doc,field,value);
					}
				}
				
				DoorsAPI.documentSave(doc).then(function(res){
					let link = null;
					if(msgType == "smsMsg"){
						link = me.getSmsLink(allOpts.crmData.customerData.mobilePhone, mssg.body);
					}
					if(msgType == "emailMsg"){
						link = "mailto:" + allOpts.crmData.customerData.email + "?body=" + encodeURIComponent(mssg.body);
					}
                    if(msgType == "llamadaMsg"){
                        link = "tel:" + allOpts.crmData.customerData.mobilePhone;
                    }
					if(link != null){
						if (typeof(cordova) == 'object') {
							cordova.InAppBrowser.open(link,"_system");
						}
						else{
							window.open(link, '_newTab');
						}
					}
					
					let messageType = Gestar.Tools.getDocumentValue(doc,"TIPO");
					let newMsg = me.getMessageByActType(messageType,res);
					me.allMessages.push(newMsg);
                    me.conversationControl.cursorLoading(false);
					resolve(newMsg);
				},function(err){
                    me.conversationControl.cursorLoading(false);
					reject(err);
				});
			},function(err){
                me.conversationControl.cursorLoading(false);
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

	this.call = function(){
        let me = this;
		return new Promise((resolve,reject)=>{
			let type = "Llamar";
			let message = new llamadaMsg();
			message.body = "Llamada";
			message.date = new Date();
            message.provider = me;
			
			//TODO
			var phone = allOpts.crmData.customerData.mobilePhone ? allOpts.crmData.customerData.mobilePhone : allOpts.crmData.customerData.telephone;
			//No se tira excepcion. Debería?
			if(phone){
				//TODO Verificar formato? No haría falta, porque el telefono interpreta varios formatos
				
				let me = this;
                me.conversationControl.cursorLoading(true);
				this.sendMessage(message).then(function(obj){
                    me.conversationControl.cursorLoading(false);
					/*let convertedMsg = me.getMessageByActType(type, obj);*/
					resolve(obj);
					
				},function(err){
                    me.conversationControl.cursorLoading(false);
                    console.error("err",err);
					reject(err);
					//errMgr(err);
				});
			}
            else{
                resolve(null);
            }
		});
	};
	this.markAsDone = function(id, successful){
		let fields = [];
		let result = successful ? "Realizada" : "Cancelada";
		fields.push({field:"ESTADO", value: result});
		fields.push({field:"FIN", value: new Date()});
		let me = this;
        this.updateMessage(id, fields).then(function(doc){
			let found = me.allMessages.find(m=> m.sid == id);
			if(found){
				found.status = result;
				found.getMessageHtml(found).then(function(html){
					$(allOpts.chatContainer).find('[data-sid=' + id + "]").replaceWith(html);
				});
			}
		}).catch(function(err){
			console.log(err);
		});
	};
    this.getSmsLink = function(phone, text){
		let mobilePhone = phone.replace(/\+| |\(|\)|-/g, "");
		//TODO Característica
		return "sms:+549" + mobilePhone + "?&body=" + encodeURIComponent(text);
	}
	var messagesByActTypes = 
    {
        "Enviar Sms": function(){return new smsMsg()},
        "Enviar Correo": function(){return new emailMsg()},
        "Llamar":function(){return new llamadaMsg()},
        "Visita oficina":function(){return new visitaMsg()},
        "Visita producto":function(){return new visitaMsg()}
    };
    let defaults = {
        "Enviar Sms": [
            {   docField: "DOC_ID", msgField: "sid" },
            {   docField: "ORGANIZADOR", msgField: "operator"},
            {   docField: "ESTADO", msgField: "status"},
            {   docField: "NOTAS", msgField: "body"},
            {   docField: "INICIO",    msgField: "date" }
            ],
        "Enviar Correo":[
            {   docField: "DOC_ID", msgField: "sid" },
            {   docField: "ORGANIZADOR", msgField: "operator"},
            {   docField: "ESTADO", msgField: "status"},
            {   docField: "NOTAS", msgField: "body"},
            {   docField: "INICIO",    msgField: "date" }
            ],
        "Llamar":[
            {   docField: "DOC_ID", msgField: "sid" },
            {   docField: "ORGANIZADOR", msgField: "operator"},
            {   docField: "ESTADO", msgField: "status"},
            {   docField: "NOTAS", msgField: "body"},
            {   docField: "INICIO",    msgField: "date" }
            ],
        "Visita oficina":[
            {   docField: "DOC_ID", msgField: "sid" },
            {   docField: "ORGANIZADOR", msgField: "operator"},
            {   docField: "ESTADO", msgField: "status"},
            {   docField: "NOTAS", msgField: "body"},
            {   docField: "INICIO",    msgField: "date" },
            /*{   docField: "TYPE_UBICACION",    msgField: "where" },*/
            {   docField: "INICIO",    msgField: "when" },
            {   docField: "TIPO",    msgField: "actType" }
            ],
        "Visita producto":[
            {   docField: "DOC_ID", msgField: "sid" },
            {   docField: "ORGANIZADOR", msgField: "operator"},
            {   docField: "ESTADO", msgField: "status"},
            {   docField: "NOTAS", msgField: "body"},
            {   docField: "INICIO",    msgField: "date" },
            /*{   docField: "TYPE_UBICACION",    msgField: "where" },*/
            {   docField: "INICIO",    msgField: "when" },
			{   docField: "TIPO",    msgField: "actType" }
            ],
        "Msg":[
            {   docField: "DOC_ID", msgField: "sid" },
            {   docField: "ORGANIZADOR", msgField: "operator"},
            {   docField: "ESTADO", msgField: "status"},
            {   docField: "TIPO", msgField: "body"},
            {   docField: "INICIO",    msgField: "date" }
            ],
    };
    let fieldMatches =  $.extend(true, defaults, allOpts.fieldMatches);

    this.getMessageByActType = function(actType,actDoc){
        var typeMsg = messagesByActTypes[actType];
        let msgIns = undefined;
        if(typeMsg) {
            msgIns = typeMsg();
        } 
        else{
            msgIns = new msg();
            actType = "Msg";
        }
        
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
                        if(actType == "Enviar WhatsApp" && m.docField == "NOTAS"){
                            val = val != null ? val.split("Comentarios Sirena:")[1] : val;
                        }
                        msgIns[m.msgField] = val;
                    }
                }
            }
        }
        msgIns.provider = this;
        return msgIns;
    }
}
function notasDataProvider(opts){
    this.parent = conversationBaseDataProvider;
    this.parent();
    this.supportedTypes = ["notaMsg"];
    var notasFolder = opts.fldId || 5321;
    var notasFormula = opts.formula || "1=0";
	var userData = opts.userData || {};
	var leadData = opts.leadData || {};
    var me = this;
    this.getMessages = function(msgLimit){
		return new Promise(function(resolve, reject){
			DoorsAPI.folderSearch(notasFolder, 'doc_id,nota,usuario,usuario_id,fecha,CREATED,DOC_ID_PADRE', notasFormula, 'FECHA desc', msgLimit, null, 0).then(
				function (res) {
					let messages = [];
					for(let p = 0; p < res.length; p++){
						let nota = res[p];
						let msg = getMessageByActType("Nota", nota);
                        msg.provider = me;
						messages.push(msg);
					}
					resolve(messages);
				},function(err){
					reject(err);
				});
		});
	},
	this.sendMessage = function(msg){
		return new Promise(function(resolve, reject){
			DoorsAPI.documentsNew(notasFolder).then(function(doc){
				Gestar.Tools.setDocumentValue(doc,"nota", msg.body);
				Gestar.Tools.setDocumentValue(doc,"fecha", msg.date);
				Gestar.Tools.setDocumentValue(doc,"usuario",userData.name);
				Gestar.Tools.setDocumentValue(doc,"usuario_id",userData.accId);
				Gestar.Tools.setDocumentValue(doc,"DOC_ID_PADRE",leadData.docId);
				DoorsAPI.documentSave(doc).then(function(res){
                    let msg = getMessageByActType("Nota", res);
					resolve(msg);
				},function(err){
					reject(err);
				});
			}, function(err){
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

    var messagesByActTypes = 
    {
        "Nota": function(){return new notaMsg()}
    };

    let fieldMatches = opts.fieldMatches || {
        "Nota": [
            {   docField: "DOC_ID", msgField: "sid" },
            {   docField: "USUARIO", msgField: "operator"},
            {   docField: "NOTA", msgField: "body"},
            {   docField: "FECHA",    msgField: "date" }
            ],
    };

    var getMessageByActType = function(actType,actDoc){
        var typeMsg = messagesByActTypes[actType];
        let msgIns = undefined;
        if(typeMsg) {
            msgIns = typeMsg();
        } 
        else{
            msgIns = new msg();
            actType = "Msg";
        }
        
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
                        if(actType == "Enviar WhatsApp" && m.docField == "NOTAS"){
                            val = val != null ? val.split("Comentarios Sirena:")[1] : val;
                        }
                        msgIns[m.msgField] = val;
                    }
                }
            }
        }
        msgIns.provider = me;
        return msgIns;
    }
}

/**
* Funcion para crear un control de proxima accion. Este control permite editar fecha y accion aislado del documento, permitiendo embeberlo según necesidad y notificando ante cambios para actualizar el documento o evitar cambios
* Requiere JQuery, moment, Bootrap y bootstrap-datetimepicker
* Uso: var p = new proxAccionControl(options);
* @public
* @class
* @param {Object} opts: Objeto con la configuracion del control
* @param {Boolean} [opts.generateActivity] - Falso por defecto. Propiedad que determina si se debe generar una actividad al marcar como Realizada o Cancelada la prox accion
* @param {Object} [opts.leadData] - Requerido cuando generateActivity es true. Objeto con informacion de la lead {docId, subject, frmId, frmName }
* @param {Object} [opts.activityData] - Requerido cuando generateActivity es true. Objeto con informacion para generar automáticamente actividades { fldId, activityId, extraFields }
* @param {string} [opts.container] - Selector u objeto que contendrá el control. En caso de enviarlo el control se renderizará automáticamente. En caso de no enviarlo, se deberá utilizar la función getProxAccionHtml
* @param {string} [opts.proxAccion] - Proxima accion
* @param {string} [opts.fechaProxAccion] - Fecha de proxima accion (string ISO 8601)
* @param {Object[]} [opts.proxAcciones] - Array con proximas acciones custom. En caso de enviarlo, se utiliza la coleccion enviada
* @param {Function} [opts.onProxAccionChange] - Funcion que se disparará la cambiar la opcion del listado de la proxima accion. Ningún dato del control está modificado en este punto.
* @param {Function} [opts.beforeChange] - Para validaciones antes de cambiar la prox accion. Funcion que se disparará antes de cambiar la proxima accion. Si esta funcion retorna un string, se mostrará en un mensaje de alerta y se prevendrá el cambio de prox acción.
* @param {Function} [opts.beforeComplete] - Para validacion antes de completar como realizada o cancelada una prox accion. Funcion que se disparará previo a marcar una acción como completada. Si esta funcion retorna un string, se mostrará en un mensaje de alerta y se prevendrá el completado de prox acción.
* @param {Function} [opts.onChange] - Para cambiar valor en el documento. Funcion que se disparará ante el cambio de la proxima accion
* @param {Function} [opts.completed] - Funcion que se disparará ante el guardado exitoso de una actividad cuando se marque como realizada o cancelada la prox accion
*/
function proxAccionControl(opts){
    var defaults = {
        container: null,
        proxAccion: null,
        generateActivity: false,
        fechaProxAccion: null,
        proxAcciones : [
            {text:"Llamar",value:"Llamar",disabled:false},
            {text:"Enviar WhatsApp",value:"Enviar WhatsApp",disabled:false},
            {text:"Enviar Correo",value:"Enviar Correo",disabled:false},
            {text:"Visita oficina",value:"Visita oficina",disabled:false},
            {text:"Visita producto",value:"Visita producto",disabled:false}
        ],
        leadData:{
            subject:null,
            docId:null,
            frmId:null,
            frmName:null
        },
        actvityData:{
            fldId: null,
            activityId: null,
            extraFields:null
        },
        onProxAccionChange:function (proxAccion){},
        beforeChange: function(prevValue,newValue){ return null;},
        beforeComplete: function(proxAccion){ return null;},
        onChange:function(proxAccion,fechaProxAccion){},
        completed:function(proxAccion,fechaProxAccion,successfull){}
    }
    
    this.allOptions =  $.extend(true, defaults, opts);

    if(this.allOptions.generateActivity == true){
        if(!this.allOptions.leadData.docId || !this.allOptions.leadData.subject || !this.allOptions.leadData.frmId || !this.allOptions.leadData.frmName){
            throw "Si se utiliza generateActivity en true, deberá completar todos los valores de la lead";
        }
        if(!this.allOptions.actvityData.fldId){
            throw "Si se utiliza generateActivity en true, deberá completar el fldId de actividades en parametro activityData";
        }
    }
    this.proxAccion = this.allOptions.proxAccion;
    this.fechaProxAccion = this.allOptions.fechaProxAccion;
    let me = this;
    //Primera parte: edicion de prox accion
    this.editProxAccion = function(){
        //TODO ARMAR PARA WEB
		let tit = "Editar proxima accion";
		let popupHeader = `<div class="navbar">
			<div class="navbar-bg"></div>
			<div class="navbar-inner">
			  <div class="title">${tit}</div>
			  <div class="right">
				<!-- Link to close popup -->
				<a class="link popup-close">Cerrar</a>
			  </div>
			</div>
			</div>`;
        let proxAccionOptionsHtml = "";
        for (let index = 0; index < this.allOptions.proxAcciones.length; index++) { 
            const element = this.allOptions.proxAcciones[index];
            let disabledStr = "";
            if(element.disabled){
                disabledStr = "disabled";
            }
            proxAccionOptionsHtml += '<option value="' + element.value + '" ' + disabledStr+ '>' + element.text + '</option>';
        }
		let agendarButtonHtml = '<div class="form-group"><button id="agendarProxAccionButton" class="col button button-fill">Agendar</button></div>';
		/*'<input id="inputFechaProxAccion" type="datetime-local" class="form-control" id="proxAccionDate" placeholder="Fecha proxima acci&oacute;n">' +*/
		let proxAccionHtml = '<div class="block block-strong inset"><div class="form-group">' +
					'<label for="proxAccion">Proxima acci&oacute;n</label>' +
					'<select id="selectProxAccion" class="">' +
						'<option value="">Seleccione una acci&oacute;n</option>' +
                        proxAccionOptionsHtml + 
					'</select>' +
				'</div>' +
				'<div class="form-group">'+
					'<label for="inputFechaProxAccion">Fecha proxima acci&oacute;n</label>' +
					'<div class="input-group date">' +
					'	<input id="inputFechaProxAccion" type="text" class="form-control datetimepicker-input" placeholder="Fecha proxima acci&oacute;n">' +
					"	<span class='input-group-addon input-group-text' data-target='#inputFechaProxAccion' data-toggle='datetimepicker'>" + 
					"		<span class='fa fa-calendar'></span>" +
					"	</span>" +
					'</div>' +
				'</div></div>';
		let html = '<div id="proxAccionMainContainer">' + popupHeader + proxAccionHtml + agendarButtonHtml + '</div>'; // + popUpScript;
		
		if (typeof(cordova) == 'object') {
			var popup = app7.popup.create({
			  content: '<div class="popup">' + html + '</div>',
			  on: {
				opened: function () {
				  console.log('Popup opened')
				}
			  }
			});
			popup.open(true);
		}else{
			var $modal = $('#accionModal');
			var $modalDialog = $modal.find('.modal-dialog');
			var $modalBody = $modal.find('.modal-body');
			$modalBody.html('<div style="padding: 30px;">' + html + '</div>');
			$modalBody.find(".right").addClass("hidden")
			$("#agendarProxAccionButton").removeClass().addClass("btn btn-primary");
			$("#agendarProxAccionButton").css({float:"right"});
			$("#agendarProxAccionButton").parent().css({marginBottom:"30px"});
			$("#selectProxAccion").addClass("form-control");
			$("#inputFechaProxAccion").addClass("form-control");
			$modalDialog.css({marginTop: ($(window).height() - 150) / 2,width:"30%"});
			$modal.modal('show');
			
		}
		
		$("#proxAccionMainContainer #agendarProxAccionButton").one("click",function(e){
            let newAccion = $("#proxAccionMainContainer #selectProxAccion option:selected").val();
            let result = me.allOptions.beforeChange.call(me, me.proxAccion, newAccion);
            if(result != null){
                alert(result);
                return;
            }
            //Obtengo los valores seleccionados
            let newDate = $("#proxAccionMainContainer #inputFechaProxAccion").parent().datetimepicker("viewDate");
			let newDateMoment = moment(newDate);

            if (typeof(cordova) == 'object') {
				//Cierro el popup
				popup.close(true);
			}else{
				$modal.modal('hide');
			}

            //Actualizo los datos
            this.proxAccion = newAccion;
            this.fechaProxAccion = newDateMoment.toISOString();

			
            //Actualizo los textos
            $(me.allOptions.container).find(".fecha-prox-accion").text(newDateMoment.format("L") + " " + newDateMoment.format("LT"));
		    $(me.allOptions.container).find(".prox-accion-text").text(newAccion);
            
            //Muestro los botones
            $(me.allOptions.container).find(".right-container .btn-success").removeClass("hidden");
            $(me.allOptions.container).find(".right-container .btn-danger").removeClass("hidden");

            //Disparo el evento
            me.allOptions.onChange.call(me, this.proxAccion, this.fechaProxAccion);
		});

        $("#proxAccionMainContainer #selectProxAccion").on("change",function(e){
            let objDtPicker = $("#proxAccionMainContainer #inputFechaProxAccion").parent().datetimepicker().data("DateTimePicker");
            objDtPicker.hide();
            let newAccion = $("#proxAccionMainContainer #selectProxAccion option:selected").val();
            me.allOptions.onProxAccionChange.call(me, newAccion);
		});
		
		$("#proxAccionMainContainer #inputFechaProxAccion").parent().datetimepicker({showClose:true,locale:'es',focusOnShow:false});
	};

    //Segunda parte: Dibujado y completado de acciones
	this.cleanProxAccion = function(){
		$(this.allOptions.container).find(".fecha-prox-accion").text("(sin fecha)");
		$(this.allOptions.container).find(".prox-accion-text").text("(sin prox accion)");
        this.proxAccion = null;
        this.fechaProxAccion = null;
        $(this.allOptions.container).find(".right-container .btn-success").addClass("hidden");
        $(this.allOptions.container).find(".right-container .btn-danger").addClass("hidden");
	};

    function render(){
        let proxAccionStr = me.proxAccion != null && me.proxAccion != "" ? me.proxAccion : "(sin prox accion)";
        let fechaProxAccionMoment = moment(me.fechaProxAccion);
        let fechaProxAccionStr = me.fechaProxAccion != null && me.fechaProxAccion != "" ? fechaProxAccionMoment.format("L") + " " + fechaProxAccionMoment.format("LT") : "(sin fecha prox accion)";

        let html = me.getProxAccionHtml(proxAccionStr,fechaProxAccionStr);
        $(me.allOptions.container).html("");
        $(me.allOptions.container).append(html);
    }

    this.getProxAccionHtml = function(proxAccionString,fechaProxAccionString){
        if(!proxAccionString){
            proxAccionString = me.proxAccion != null && me.proxAccion != "" ? me.proxAccion : "(sin prox accion)";
        }
		
        if(!fechaProxAccionString){
            let fechaProxAccionMoment = moment(me.fechaProxAccion);
            fechaProxAccionString = me.fechaProxAccion != null && me.fechaProxAccion != "" ? fechaProxAccionMoment.format("L") + " " + fechaProxAccionMoment.format("LT") : "(sin fecha prox accion)";
        }

        let doneClass = me.proxAccion ? "" : "hidden";
        html = '<div class="chat-subheader prox-accion-container">' +
        '	<div>' +
        '		<div id="proxAccionText" class="prox-accion-text external-name">' + proxAccionString + '</div>' +
        '		<div id="fechaProxAccionText" class="fecha-prox-accion external-name">' + fechaProxAccionString + '</div>' + 
        '	</div>' +
        '	<div class="right-container">'+
        '       <button type="button" class="btn btn-default"><i class="fa fa-pencil"></i></button>'+
        '       <button id="successProxAccion" type="button" class="btn btn-success ' + doneClass + '" ><i class="fa fa-check"></i></button>' + 
        '       <button id="failProxAccion" type="button" class="btn btn-danger ' + doneClass + '" ><i class="fa fa-times"></i></button>' + 
        '	</div>' +
        '</div>';
        let jqObject = $(html);

        jqObject.find(".right-container .btn-default").on("click",function(e){
            me.editProxAccion();
        });
        jqObject.find(".right-container .btn-success").on("click",function(e){
            me.markAsDone(true);
        });
        jqObject.find(".right-container .btn-danger").on("click",function(e){
            me.markAsDone(false);
        });
        if(!me.allOptions.container) me.allOptions.container = jqObject;
        return jqObject;
    }

	this.markAsDone = function(successfull){
        let estado = successfull ? "Realizada" : "Cancelada";
        activActionClick(estado);
	}
    function activActionClick(estadoAct) {
	
        var fldAct = me.allOptions.actvityData.fldId;
        var idActAsociada = me.allOptions.actvityData.activityId; //Gestar.Tools.getDocumentValue(doc,"DOC_ID_ACT");
        debugger;
        var tipo = me.proxAccion;
        if (tipo == null) {
            alert('Ingrese la proxima accion');
            return;
        } 
        if (!me.fechaProxAccion) {
            alert('Ingrese la fecha de la proxima accion');
            return;
        }

        let result = me.allOptions.beforeComplete.call(me, tipo);
        if(result != null){
            alert(result); //"Debe guardar el documento para generar la actividad Reserva.\nÉsta próxima acción no se puede marcar como Realizada o Cancelada");
            return;
        }
        
        if(me.allOptions.generateActivity != true){
            me.allOptions.completed.call(me, ...[me.proxAccion, me.fechaProxAccion,estadoAct, null]);
            me.cleanProxAccion();
            return;
        }
        if (idActAsociada != null){
            DoorsAPI.documentsGetById(idActAsociada).then(function(doc) {
                getDocField(doc, 'INICIO')['Value'] = fechaProxAccion;
                getDocField(doc, 'ESTADO')['Value'] = estadoAct;
                //TODO Extra fields
                //getDocField(doc, 'PRODUCTO_ID')['Value'] = controlAutocomplete_producto.fSAParameter.valueString || null;
                //getDocField(doc, 'PRODUCTO')['Value'] = controlAutocomplete_producto.fSAParameter.textString || null;
                saveAct(doc);
            },
            function (err) {
                alert('Error al buscar la actividad: ' + errMsg(err));
            }); 
        }
        else{
            DoorsAPI.documentsNew(fldAct).then(function(doc) {
                //getDocField(doc, 'SUBJECT')['Value'] = 'Seguimiento de gestion';
                getDocField(doc, 'TIPO')['Value'] = tipo;
                getDocField(doc, 'ESTADO')['Value'] = estadoAct;
                getDocField(doc, 'INICIO')['Value'] = moment(me.fechaProxAccion).subtract(10,"s").toDate().toISOString();
                getDocField(doc, 'FIN')['Value'] = me.fechaProxAccion;
                getDocField(doc, 'INVITAR')['Value'] = 0;
                getDocField(doc, 'ORGANIZADOR')['Value'] = me.allOptions.userData.name;
                getDocField(doc, 'ORGANIZADOR_ID')['Value'] = me.allOptions.userData.accId;
                getDocField(doc, 'REFIERE')['Value'] = me.allOptions.leadData.subject;
                getDocField(doc, 'REFIERE_ID')['Value'] = me.allOptions.leadData.docId;
                getDocField(doc, 'REFIERE_FORM')['Value'] = me.allOptions.leadData.frmName;
                //TODO Extra fields
                saveAct(doc);
                
                }, function (err) {
                    // err del New
                    alert('Error al crear la actividad: ' + errMsg(err));
            }); // cierre del new
        }
    }
    
    function saveAct(doc){
        DoorsAPI.documentSave(doc).then(function (doc2) {
            me.allOptions.completed.call(me, ...[me.proxAccion, me.fechaProxAccion,getDocField(doc2, 'ESTADO')['Value'], doc2]);
            me.cleanProxAccion();
            //alert('Actividad registrada. Recuerde programar la proxima accion.');
        }, function (err) {
            alert('Error al guardar la actividad: ' + errMsg(err));
        });
    }

    if(this.allOptions.container){
        render();
    }
    
	//Modal de proxima accion
	if (typeof(cordova) != 'object') {
		// El DIV para mostrar imagenes fullScreen
		$(document.body).append(`
			<div class="modal fade" id="accionModal" tabindex="-1" role="dialog">
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
}