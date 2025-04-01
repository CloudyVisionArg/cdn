/**
 * Fresh: https://cdn.cloudycrm.net/ghcv/cdn@conversationUnifv2/conversation/conversation.mjs?_fresh=true
 */

var ctx, dSession;
var scriptsBranch = "conversationUnifv2";
var loggedUser = null;

export async function setContext(context){
    ctx = context;
	dSession = context.dSession;
}

/**
 * Control para dibujar barra de estado de chat. Esta barra permite mostrar estados de distintos proveedores de chats. Utiliza bootstrap-select para mostrar el selector de cuentas
 * @param {Object} options - Opciones de configuracion.
 * @param {string} options.selector - Selector del contendor. Opcional si se envia funcion render.
 * @param {Array} options.providers - The array de conversationDataProviders.
 * @param {Object} options.customerData - Informacion del cliente con el que se chatea.
 * @param {Function} options.render - Funcion de renderizado en caso de querer sobreescribir render.
 * @param {Object} options.doc - Objeto documento de contexto que contiene la sesión.
 */
export async function newConversationStatusControl(config){
    let arrScripts = [];
    /*arrScripts.push({ id: 'bootstrap-select', depends: ['bootstrap', 'bootstrap-css'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/js/bootstrap-select.min.js' });
    arrScripts.push({ id: 'bootstrap-select-css', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/css/bootstrap-select.min.css' });
    // todo: esto deberia ser segun el lng_id
    arrScripts.push({ id: 'bootstrap-select-lang', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/js/i18n/defaults-es_ES.min.js' });*/

    arrScripts.push({ id: 'bootstrap-select', depends: ['bootstrap', 'bootstrap-css'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js' });
		arrScripts.push({ id: 'bootstrap-select-css', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css' });
		// todo: esto deberia ser segun el lng_id
		arrScripts.push({ id: 'bootstrap-select-lang', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/i18n/defaults-es_ES.min.js' });
    
    //Se asume que ya se cargaron los scripts de conversacion y providers necesarios
    await include(arrScripts);
    return new conversationStatusBar(config);
}

/**
 * Crea una nueva instancia del control de conversaciones.
 * En Generic3 - Funciona sin parametro doc. En basicConfig se debe enviar docId y fldId
 * En Generic5, 6 y APP - Funciona con doc. En vez de enviar los valores de celular, messengerId, etc, se pueden enviar los nombres de los campos para que se busquen en el doc (ver config de cada provider)
 * @param {Object} basicConfig - Configuración básica para el control de conversaciones.
 * @param {string} basicConfig.selector - El selector CSS para el contenedor de la conversación.
 * @param {Object} [basicConfig.loggedUser] - Usuario logueado.
 * @param {Object} [basicConfig.wappConfig] - Configuración para el proveedor de WhatsApp.
 * @param {Object} [basicConfig.crmConfig] - Configuración para el proveedor de CRM.
 * @param {Object} [basicConfig.fbConfig] - Configuración para el proveedor de Facebook Messenger.
 * @param {Object} [basicConfig.meliConfig] - Configuración para el proveedor de MercadoLibre (En desarrollo).
 * @param {Object} [basicConfig.doc] - Objeto documento de contexto que contiene la sesión.
 * 
 * @throws Dispara un error si no se envia la propiedad 'selector' en el parámetro 'basicConfig'.
 * 
 * @returns {Promise<Object>} - Devuelve una promesa que se resuelve con la instancia del control de conversación.
 */
export async function newConversationControl(basicConfig){

    let conversationSelector = basicConfig.selector;

    if(!conversationSelector){
        throw "Debe enviar la propiedad 'selector' en el parametro 'basicConfig'";
    }
    loggedUser = basicConfig.loggedUser;

    //Si ya existe una instancia de la conversación para este selector, no se crea otra
    if(window.cloudy && window.cloudy.conversation){
        if(window.cloudy.conversation.getInstance(conversationSelector)){
            return;
        }
    }
    let doc = basicConfig.doc;
    let wappConfig = basicConfig.wappConfig;
    let crmConfig = basicConfig.crmConfig;
    let fbConfig = basicConfig.fbConfig;
    let meliConfig = basicConfig.meliConfig;
    
    let necessaryScripts = await setupNecessaryScripts(wappConfig, fbConfig, crmConfig, meliConfig);
    await include(necessaryScripts);

    //Esto tendriamos que sacarlo.
    Doors.RESTFULL.ServerUrl = dSession.serverUrl;
    Doors.RESTFULL.AuthToken = dSession.authToken;
    
    let wappProvider = null;
    let fbProvider = null;
    let crmProviders = null;
    let convProviders = [];
    let quickMessageTypes = [];
    if(wappConfig != null){
        //Compatibilidad generic3
        wappConfig.dSession = doc ? doc.session : dSession;
        wappConfig.doc = doc ? doc : null;
        wappProvider = await setupWappProvider(conversationSelector, wappConfig);
        //TODO Remover. Agrego por compatibilidad
        window.whatsAppProvider = wappProvider;
        if(wappProvider != null){
            convProviders.push(wappProvider);
            quickMessageTypes.push(...wappProvider.options.supportedTypes);
        }
    }
    if(fbConfig != null){
        fbConfig.dSession = doc ? doc.session : dSession;
        fbConfig.doc = doc ? doc : null;
        fbProvider = await setupFbMessengerProvider(conversationSelector, fbConfig);
        if(fbProvider != null){
            convProviders.push(fbProvider);
            quickMessageTypes.push(...fbProvider.options.supportedTypes);
        }
    }

    let dataProvider = new conversationDataProvider();
    dataProvider.msgproviders = convProviders;
    
    if(crmConfig != null){
        //Compatibilidad generic3
        crmConfig.dSession = doc ? doc.session : dSession;
        crmConfig.doc = doc ? doc : null;
        crmProviders = await setupCrmProvider(conversationSelector, crmConfig);
        if(crmProviders != null && crmProviders.length > 0){
            convProviders.push(...crmProviders);
            crmProviders.map((prov) => {
                if(prov.options && prov.options.supportedTypes){
                    quickMessageTypes.push(...prov.options.supportedTypes);
                }
                else{
                    quickMessageTypes.push(...prov.supportedTypes);
                }
            });
        }

        let originMessage = new msg();
        //TODO
        let originText ="Origen: <b>" + "Origen" + "</b><br>Origen de contacto: <b>" + "co" + "</b><br>Medio pref. de contacto: <b>" + "oppPreferredContact" + "</b>";
        originMessage.body = originText.substring(0, originText.length);
        originMessage.date = new Date();
        originMessage.operator = "Datos ingreso";
        originMessage.classes = "history-msg";
        //Compatibilidad generic3
        originMessage.sid = doc ? "customer_query_" + doc.id : "customer_query_" + basicConfig.docId;
        dataProvider.allMessages.push(originMessage);
    }       

    let conversationOptions = {};
    conversationOptions.dataProvider = dataProvider;
    conversationOptions.headerHtml = "";
    conversationOptions.subheaderHtml = ""; //getSubheaderHtml();
    conversationOptions.selector = basicConfig.selector;
    conversationOptions.quickMessageTypes = quickMessageTypes;
    conversationOptions.defaultQuickMessageType = basicConfig.defaultQuickMessageType || "messengerMsg";
    conversationOptions.quickOptionSelected = function(provider, newMessageType, option){
    }
    conversationOptions.quickMessageChanged = function(newMessageType, container){
        //TODO
        if(newMessageType == "wappMsg"){
            //debugger;
            if (typeof (cordova) == 'object' && wappProvider != null) {
                wappProvider.displayWhatsAppOptions(container);
            }
        }
        if(newMessageType == "messengerMsg"){
            //fbProvider.displayMessengerOptions($(conversationSelector + " .message-type-button"));
        }
        if(newMessageType == "llamadaMsg" && crmProviders != null){
            //TODO
            crmProviders.map((prov) => {
                if(prov instanceof activitiesDataProvider){

                    prov.call().then((res) => {
                        let inst = window.cloudy.conversation.getInstance(basicConfig.selector);
                        inst.insertMsg(res);   
                    });
                    // //TODO Loading
                    // let msg = new llamadaMsg();
                    // msg.date = new Date();
                    // msg.operator = loggedUser.name;
                    // msg.body = "Llamada";
                    // prov.sendMessage(msg).then((res) => {
                    //     let inst = window.cloudy.conversation.getInstance(basicConfig.selector);
                    //     inst.insertMsg(res);
                    //     //TODO Loading
                    // },function(err){
                    //     //TODO Loading
                    // });
                }
            })
        }
    };
    let ctrl = new conversationControl(conversationOptions);
    return ctrl;
}

async function setupNecessaryScripts(wappConfig, fbConfig, crmConfig, meliConfig){
    let necessaryScripts = [];

    //ESTA YA NO SE NECESITA, ESTÁ EN conversationcontrol.css
    //necessaryScripts.push({id: "wapp.css", src: "https://cdn.cloudycrm.net/ghcv/cdn@conversationUnifv2/wapp/wapp.css"});
    //ESTA YA NO SE NECESITA, ESTÁ EN conversation.css
    //necessaryScripts.push({id: "conversation-styles.css", src: "https://cdn.cloudycrm.net/ghcv/cdn@conversationUnifv2/conversation/conversationcontrol.css"});
    necessaryScripts.push({id: "conversation.css", src: "https://cdn.cloudycrm.net/ghcv/cdn@" + scriptsBranch + "/conversation/conversation.css"});
    necessaryScripts.push({id: "font-awesome", src: 'https://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.css' });
    
    let depends = [];
    //Para todo lo que no es cordova se usa bootstrap
    if(typeof(bootstrapVersion) === 'undefined'){
        if (typeof(cordova) != 'object') {
            necessaryScripts.push({id: 'bootstrap', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js' });
            necessaryScripts.push({id: "bootstrap-css", src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css' });
            depends.push("bootstrap");
        }
    }

    //En caso de que JQuery no esté cargado, lo cargamos y lo agregamos como dependencia de los demás
    if(typeof($) === 'undefined'){
        necessaryScripts.push({ id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' });
        depends.push('jquery');
    }
    //Necesarios para el control base
    necessaryScripts.push({id: "jslib"});
    necessaryScripts.push({id: 'doorsapi'});
    necessaryScripts.push({id: "emojis", depends: cloneArr(depends)});
    necessaryScripts.push({id: "conversation-control", depends: cloneArr(depends), src: 'https://cdn.cloudycrm.net/ghcv/cdn@' + scriptsBranch + '/conversation/conversationcontrol.js' });
    necessaryScripts.push({id: "conversation-status", depends: cloneArr(depends), src: 'https://cdn.cloudycrm.net/ghcv/cdn@' + scriptsBranch + '/conversation/conversation.status.js' });
    necessaryScripts.push({id: "conversation-media", depends: cloneArr(depends), src: 'https://cdn.cloudycrm.net/ghcv/cdn@' + scriptsBranch + '/conversation/conversation.media.js?v=6'});
    depends.push('conversation-control');
    depends.push('conversation-status');


    if(wappConfig != undefined && wappConfig != null){
        necessaryScripts.push({ id: 'conversation-wapp', depends: cloneArr(depends), src: 'https://cdn.cloudycrm.net/ghcv/cdn@' + scriptsBranch + '/conversation/conversation.wapp.js' });
    }
    
    if(crmConfig != undefined && crmConfig != null){    
        necessaryScripts.push({id:'conversation-crm',depends: cloneArr(depends), src: 'https://cdn.cloudycrm.net/ghcv/cdn@' + scriptsBranch + '/conversation/conversation.crm.js?v=6'});
    }

    if(fbConfig != undefined && fbConfig != null){    
        necessaryScripts.push({id:'conversation-msngr',depends: cloneArr(depends), src: 'https://cdn.cloudycrm.net/ghcv/cdn@' + scriptsBranch + '/conversation/conversation.msngr.js?v=6'});
    }
    

    //TODO Si agrego fechaproxaccion
    necessaryScripts.push({ id: 'lib-moment' });
    necessaryScripts.push({ id:"tempus-dominus-css", src: "https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/css/tempusdominus-bootstrap-4.min.css"});
    necessaryScripts.push({ id:"tempus-dominus", depends: ["lib-moment"], src: "https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/js/tempusdominus-bootstrap-4.min.js"});

    
    

    return necessaryScripts;
}

async function setupWappProvider(selector, wappConfig){

    //Verifico que viene el número de teléfono
    let mobilePhone = null;
    if(wappConfig && wappConfig.phoneField != null && wappConfig.doc){
        mobilePhone = wappConfig.doc.fields(wappConfig.phoneField).value;
    }
    if(wappConfig && wappConfig.phone != null){
        mobilePhone = wappConfig.phone;
    }
    //Si no viene por ninguno de los dos, no se puede configurar el proveedor
    if(mobilePhone == null) return null;

    //Seteo la variable global wapp. No debería ser necesario
    var wapp = await import(gitCdn({ repo: 'global', path: 'wappcnn/wapp.mjs', fresh: false, url: true }));
    await wapp.setContext({ dSession });
    
    let fldMsg = await wapp.wappFolder.folder('messages');
    let fldNumbers = await wapp.wappFolder.folder('numbers');

    
    let numbers = await fldNumbers.search({
        fields:"*",
        formula:"default = 1"
    });
    
    let variablesProp = [];
    if(wappConfig.doc){
        //Se pueden configurar variables por módulo para que se reemplacen al momento de enviar el mensaje
        let fld = await wappConfig.doc.parent;
        variablesProp = await fld.properties("WAPP_VARIABLES");
        if(variablesProp){
            variablesProp = JSON.parse(variablesProp);
        }
    }

    let from = null;
    let name = wappConfig.name;
    if(numbers.length > 0){
        from = numbers[0]["NUMBER"];
    }
    if(wappConfig.fromField && wappConfig.doc){
        from = wappConfig.doc.fields(wappConfig.fromField.toUpperCase()).value;
    }
    if(wappConfig.fromField && wappConfig.doc){
        name = wappConfig.doc.fields(wappConfig.nameField.toUpperCase()).value;
    }
    let userData = {
        name: loggedUser.name,
        accId: loggedUser.id,
        email: loggedUser.email
    };
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
    let chatSel = selector;
    let onPutTemplateRequested = function(txt, templateObj){
        debugger;
        let vars = structuredClone(variablesProp);
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
            if(varObj.type == "field" && wappConfig.doc){
                val = wappConfig.doc.fields(varObj.value.toUpperCase()).value;
            }
            if(varObj.type == "text"){
                val = varObj.value;
            }
            if(varObj.type == "loggedusername"){
                val = userData.name;
            }

            if(val == null) return;
            txt = txt.replaceAll(varObj.variable, val);
            varObj["value"] = val;
        });
        //TODO usar selector del control
        onWhatsappPutTemplate(chatSel + ' .wapp-reply', txt, templateObj, vars);
    };

    let to = mobilePhone.replace(/\D/g, '');
    if(to.length == 10){
        to = "549" + to;
    }
    let reversedNum = to.slice(-9).split("").reverse().join("");
    if(reversedNum == null || reversedNum == "") return null;
    //TODO
    let wappOpts = {
        rootFldId: wapp.wappFolder.id,
        messagesFolder: fldMsg.id,
        formula: "FROM_NUMREV LIKE '" + reversedNum + "%' OR TO_NUMREV LIKE '" + reversedNum + "%'",
        /*sessionStatusContainer: "div.cust-chat[doc-id=" + wappConfig.doc.id + "] .chat-header .whatsapp-status-container",*/
        sessionStatusContainer: "",
        modalContainer: "",
        forceSingleFrom: wappConfig.forceSingleFrom,
        wappLib: wapp,
        from: from,
        to: mobilePhone,
        loggedUser: userData,
        googleMapsKey: null,
        supportedTypes: ["wappMsg"],
        s3Key: wappConfig.s3Key,
        putTemplateRequested: onPutTemplateRequested,
        onMessageSent: function(msg){
            let me = this;
            debugger;
            //me.conversationcontrol.insertMsg(msg);
            //window["currentConversationControl_" + docJson.DocId].insertMsg(msg);
            let instance = window.cloudy.conversation.getInstance(selector);
            if(instance){
                instance.insertMsg(msg);
            }
        },
        sessionUpdated: function(session){
            //TODO Update header?
        }
    };
    let wappProvider = new whatsAppDataProvider(wappOpts);
    wappAddRequiredElements(wappProvider);
    return wappProvider;
}

async function setupFbMessengerProvider(selector, fbConfig){
    let messengerId = null;
    let pageId = null;
    if(fbConfig && fbConfig.messengerId != null){
        messengerId = fbConfig.messengerId;
    }
    if(fbConfig && fbConfig.msgnrIdField != null){
        messengerId = fbConfig.doc.fields(fbConfig.msgnrIdField).value;
    }
    if(fbConfig && fbConfig.pageId != null){
        pageId = fbConfig.pageId;
    }
    if(fbConfig && fbConfig.pageIdField != null){
        pageId = fbConfig.doc.fields(fbConfig.pageIdField).value;
    }
    //Se valida también el page id, porque no se puede interactuar con otra página que no sea a la que escribió
    if(messengerId == null || pageId == null) return null;

    let userData = {
        name: loggedUser.name,
        accId: loggedUser.id,
        email: loggedUser.email
    };
    //TODO
    let fbRootFolderId = await dSession.settings('FACEBOOK_CONNECTOR_FOLDER');
    let rootFld = await dSession.folder(fbRootFolderId);
    let fldMsg = await rootFld.app.folder('/messenger/messages');
    var messengerOpts = {
        rootFldId: fbRootFolderId,
        messagesFolder: fldMsg.id,
        supportedTypes: ["messengerMsg"],
        formula: "SENDER_ID = '" + messengerId + "' OR RECIPIENT_ID = '" + messengerId + "'",
        sessionStatusContainer: "", /*Esto no haría falta? */
        modalContainer: "",
        from: pageId,
        to: messengerId,
        pageId: pageId,
        loggedUser: userData,
        googleMapsKey: null,
        codelibUrl: null,
        s3Key: fbConfig.s3Key,
        putTemplateRequested: null
    };
    return new messengerDataProvider(messengerOpts);
}

async function setupCrmProvider(selector, crmConfig){

    if(crmConfig == null) return null;
    
    //TODO
    var userData = {
        name: loggedUser.name,
        accId: loggedUser.id,
        email:loggedUser.email
    };
    var leadData = {
        docId: crmConfig.doc ? crmConfig.doc.id : crmConfig.docId,
        frmId: crmConfig.doc ? crmConfig.doc.formId : crmConfig.formId,
        frmName: crmConfig.doc ? (await crmConfig.doc.parent).name : crmConfig.formName,
        subject: crmConfig.doc ? crmConfig.doc.fields("SUBJECT").value : crmConfig.subject,
    };

    if(!crmConfig.fldIdActs){
        crmConfig.fldIdActs = (await (await crmConfig.doc.parent).app.folders("/actividades")).id;
    }
    if(!crmConfig.formulaActs){
        crmConfig.formulaActs = "REFIERE_ID = " + crmConfig.doc.id + "";
    }
    /*mobilePhoneField: "CELULAR",
    emailField: "EMAIL",
    fullNameField: "SUBJECT",
    nameField: "NOMBRE",
    lastNameField: "APELLIDO",
    mobilePhone:  null,
    email: null,
    fullName: null,
    name: null,
    lastName: null,
    docId: null*/
    if(crmConfig.customerData.mobilePhoneField){
        crmConfig.customerData.mobilePhone = crmConfig.doc.fields(crmConfig.customerData.mobilePhoneField).value;
    }
    if(crmConfig.customerData.emailField){
        crmConfig.customerData.email = crmConfig.doc.fields(crmConfig.customerData.emailField).value;
    }
    if(crmConfig.customerData.fullNameField){
        crmConfig.customerData.fullName = crmConfig.doc.fields(crmConfig.customerData.fullNameField).value;
    }
    if(crmConfig.customerData.nameField){
        crmConfig.customerData.name = crmConfig.doc.fields(crmConfig.customerData.nameField).value;
    }
    if(crmConfig.customerData.lastNameField){
        crmConfig.customerData.lastName = crmConfig.doc.fields(crmConfig.customerData.lastNameField).value;
    }
    crmConfig.customerData.docId = crmConfig.doc ? crmConfig.doc.id : crmConfig.docId;

    var crmConversationConfig = {
        leadData: leadData,
        customerData: crmConfig.customerData,
        userData: userData
    };

    let suppTypes = [];
    if(crmConfig.customerData.mobilePhone && crmConfig.customerData.mobilePhone != null && crmConfig.customerData.mobilePhone != ""){
        suppTypes.push("llamadaMsg");
        suppTypes.push("smsMsg");
    }
    if(crmConfig.customerData.email && crmConfig.customerData.email != null && crmConfig.customerData.email != ""){
        suppTypes.push("emailMsg");
    }
    suppTypes.push("visitaMsg");

    var actsProvOpts = {
        chatContainer: selector,
        fldId: crmConfig.fldIdActs,
        formula: crmConfig.formulaActs,
        supportedTypes: suppTypes,
        crmData: crmConversationConfig
    };
    var notasOpts = crmConfig.notas;
    if(crmConfig.notas === true){
        notasOpts = {
            fldId: crmConfig.doc ? 
                (await (await crmConfig.doc.parent).folders("notas")).id : 
                (await (await dSession.folder(crmConfig.fldId)).folders("notas")).id,
            formula: "DOC_ID_PADRE = " + (crmConfig.doc ? crmConfig.doc.id : crmConfig.docId),
            leadData: leadData,
            supportedTypes: ["notaMsg"],
            userData: userData
        };
    }
    let providers = [];
	if(actsProvOpts){
		let actsProvider = new activitiesDataProvider(actsProvOpts)
		providers.push(actsProvider);
	}
	if(notasOpts){
		let notasProvider = new notasDataProvider(notasOpts);
		providers.push(notasProvider);
	}
	return providers;
}

function cloneArr(arr){
    return JSON.parse(JSON.stringify(arr));
}