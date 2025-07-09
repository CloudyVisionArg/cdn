/**
 * Fresh: https://cdn.cloudycrm.net/ghcv/cdn@conversationUnifv2/conversation/conversation.status.js?_fresh=true
 */

window._isCapacitor = function () {
	try { return (Capacitor != undefined); }
	catch (e) { return false; }
};


/**
 * Control para dibujar barra de estado de chat.
 * En Generic3 - Funciona sin parametro doc. En basicConfig se debe enviar docId y fldId
 * En Generic5, 6 y APP - Funciona con doc. En vez de enviar los valores de celular, messengerId, etc, se pueden enviar los nombres de los campos para que se busquen en el doc (ver config de cada provider)
 * @param {Object} options - Opciones de configuracion.
 * @param {string} options.selector - Selector del contendor. Opcional si se envia funcion render.
 * @param {Array} options.providers - The array de conversationDataProviders.
 * @param {Object} options.customerData - Informacion del cliente con el que se chatea.
 * @param {Function} options.render - Funcion de renderizado en caso de querer sobreescribir render.
 * @param {Object} options.doc - Objeto documento de contexto que contiene la sesión.
 */
function conversationStatusBar(options) {
	var defaults = {
		selector: null,
		providers: [],
		customerData: {},
		disabledColor: '#b5b5b5',
		stopColor: '#F44336',
		goColor: '#37e13e',
		accountsFilter: (a)=> 0 == 0,
		render: null
	};
	var options = $.extend(defaults, options);
	var currentInterval = null;

	if(options.selector == null) {
		throw "conversationStatusBar - Selector es requerido";
	}
	var me = this;
	
	this.selectedProvider = null;
	this.selectedAccount = null;
	this.options = options;
	this.destroy = function () {
		if(currentInterval != null) {
			clearInterval(currentInterval);
		}
	};
	var init = function () {
		if(options.render){
			options.render.call(me);
		}
		else{
			render();
		}
		//Start check status timer
		currentInterval = setInterval(updateAccountStatus, 5000);
	}
	var updateAccountStatus = function () {
		if(me.selectedAccount){
			let statusSvg = $(options.selector + " .conversation-status-icon svg");
			if(me.selectedAccount.status == "stop"){
				statusSvg.removeClass("go").addClass("stop");
			}
			else if(me.selectedAccount.status == "go"){
				statusSvg.removeClass("stop").addClass("go");
			}

			let contentRender = getContentRender(me.selectedAccount);
			$(options.selector + ' select.conversation-providers-select option[value="' + me.selectedAccount.id + '"]').attr('data-content', contentRender);
			if (typeof(cordova) != 'object') {
				$(options.selector + ' select.conversation-providers-select').selectpicker('refresh');
			}
			else{

			}
		}
		//me.selectedProvider
		//#b5b5b5
		//circle
		//.red-light-shine
		//.green-light-shine
	}
	
	var render = function () {
		var accountsHtml = getAccountsHtml(options.providers);
		let name = "(sin nombre)";
		let email = "(sin email)";
		let phone = "(sin celular)";
		if(options.customerData.name) {
			name = options.customerData.name;
		}
		if(options.customerData.email) {
			email = options.customerData.email;
		}
		if(options.customerData.mobilePhone) {
			phone = options.customerData.mobilePhone;
		}
		if(options.nameField && options.doc) {
			name = options.doc.fields(options.nameField).value;
		}
		if(options.emailField && options.doc) {
			//email = options.customerData.email;
			email = options.doc.fields(options.emailField).value;
		}
		if(options.mobilePhoneField && options.doc) {
			//phone = options.customerData.mobilePhone;
			phone = options.doc.fields(options.mobilePhoneField).value;
		}

		$(options.selector).html(`
		<div class="conversation-providers-status-bar">
			<div class="conversation-customer-data">
				<div class="conversation-customer-name">
					<span>${name}</span>
				</div>
				<div class="conversation-customer-email">
					<span>${email}</span>
				</div>
				<div class="conversation-customer-phone">
					<span>${phone}</span>
				</div>
			</div>
			<div class="conversation-status">
				<div class="conversation-status-icon">
				<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
					viewBox="0 0 784.9 495.2" style="enable-background:new 0 0 784.9 495.2;" xml:space="preserve" class="stop">
					<style type="text/css">
						.st0{fill:#424242;}
						.st1{fill:#37e13e;}
						.st2{fill:#aff3af;}
						.st3{fill:#757575;}
						.st4{fill:#F44336;}
						.st5{fill:#FF8155;}
						svg.stop #Red_Light .light-shine {
							fill:#FF8155;
						}
						svg.stop #Red_Light circle {
							fill:${options.stopColor};
						}
						svg.stop #Green_Light .light-shine {
							fill: #e1e1e1;
						}
						svg.stop #Green_Light circle {
							fill: ${options.disabledColor};
						}
						svg.go #Red_Light .light-shine {
							fill: #e1e1e1;
						}
						svg.go #Red_Light circle {
							fill: ${options.disabledColor};
						}
						svg.go #Green_Light .light-shine {
							fill:#aff3af;
						}
						svg.go #Green_Light circle {
							fill:${options.goColor};
						}
					</style>
					<path class="st0" d="M0,412.5v-330C0,37,27.9,0,62.3,0h660.2c34.4,0,62.3,37,62.3,82.5v330.1c0,45.6-27.9,82.5-62.3,82.5H62.3
						C27.9,495.1,0,458.2,0,412.5z"/>
					<g id="Green_Light">
						<circle class="st1" cx="197.8" cy="280.4" r="134.9"/>
						<path class="st2 light-shine" d="M103.7,292.3c-11.5-3.6-14.6-43.9,12.3-76.1c40-48.2,97.7-47,103.8-21.3c8.5,35.9-36.9,21.7-71.5,50.7
							C126.7,263.6,121.9,297.9,103.7,292.3L103.7,292.3z"/>
						<path class="st3" d="M51.8,215.2c-4.7,9.3-19,8.9-17.7-5.2c3.2-34.3,22.7-61.3,38.7-77.8c31.8-33.4,78.5-52.4,125-52.3
							c46.6-0.2,93.2,18.9,125.1,52.2c16,16.5,38.7,53.3,38.8,79c0,11.2-12.7,14.2-17.3,5.1c-11.6-22.5-47.4-96.1-146.6-96.1
							S63.2,192.8,51.8,215.2L51.8,215.2z"/>
					</g>
					<g id="Red_Light">
						<circle class="st4" cx="585.4" cy="280.4" r="134.9"/>
						<path class="st5 light-shine" d="M491.3,292.4c-11.5-3.6-14.6-43.9,12.3-76.1c40-48.2,97.7-47,103.8-21.3c8.5,35.9-36.9,21.7-71.5,50.7
							C514.2,263.7,509.5,298,491.3,292.4z"/>
						<path class="st3" d="M439.3,215.2c-4.7,9.3-19,8.9-17.7-5.2c3.2-34.3,22.7-61.3,38.7-77.8c31.8-33.4,78.5-52.4,125-52.3
							c46.6-0.2,93.2,18.9,125.1,52.2c16,16.5,38.7,53.3,38.8,79c0,11.2-12.7,14.2-17.3,5.1c-11.6-22.5-47.4-96.1-146.6-96.1
							S450.8,192.8,439.3,215.2L439.3,215.2z"/>
					</g>
				</svg>
				</div>
			</div>
			<div class="conversation-providers-accounts">
				${accountsHtml}
			</div>
		</div>`);

		if (typeof(cordova) != 'object') {
			//Apply selectpicker
			$(options.selector + ' select.conversation-providers-select').selectpicker({
				style: 'btn-default',
				width: '100%'
			});
			//Listen to change event
			$(options.selector + ' select.conversation-providers-select').on('changed.bs.select', onChangeAccount);
		}
		else{
			app7.smartSelect.create({
				el: $(options.selector + ' select.conversation-providers-select').parent()[0],
				openIn: 'sheet',
				scrollToSelectedItem: true,
				closeOnSelect: true,
				sheetCloseLinkText: 'Cerrar',
				searchbarPlaceholder: 'Buscar',
				popupCloseLinkText: 'Cerrar',
				appendSearchbarNotFound: 'Sin resultados',
				searchbarDisableText: 'Cancelar',
			});
			$(options.selector + ' select.conversation-providers-select').on('change', onChangeAccount);
		}

		function onChangeAccount(e, clickedIndex, isSelected, previousValue) {
			var account = $(this).find('option').eq(clickedIndex);
			var providerIndx = account.attr('data-provider-indx');
			var provider = options.providers[providerIndx];
			var accountId = account.val();
			if(me.selectedAccount && me.selectedAccount.id == accountId){
				return;
			}
			//var accountStatus = account.data('accountStatus');
			me.selectedProvider = provider;
			me.selectedAccount = provider.accounts.find((a)=>{
				a.selected = false; 
				return a.id == accountId;
			});
			me.selectedAccount.selected = true;
			updateAccountStatus();
			
			//me.selectedAccount.status = accountStatus;
			//Trigger event
			//$(me).trigger('providerChanged', [me.selectedProvider, me.selectedAccount]);
		}
	}
	var getContentRender = function (account) {
		let contentRender = "<div class='conv-account-cont'><div class='conv-account " + account.status + "' data-account-status='" + 
				account.status + "' ><i class='fa " + account.icon + "'></i></div><div class='conv-account-info'><span class='conv-account-name'>" + account.name + "</span><span>" + 
				account.id + "</span></div></div>";
		return contentRender;
	};
	var getAccountsHtml = function (providers) {
		var html = "";
		if (typeof(cordova) == 'object') {
			html += `<li><a href="#" class="item-link smart-select">`;
		}
		html += "<select class='conversation-providers-select'>";
		let provIndx = 0;
		let selectedAccountText = "";
		providers.forEach(function (provider) {
			let accounts = provider.accounts.filter(options.accountsFilter);
			if(accounts.length == 0){
				return;
			}
			let provName = "";
			//if(provider instanceof whatsAppDataProvider){
			if(provider.constructor.name == "whatsAppDataProvider"){
				provName = "Whatsapp";
			}
			//else if(provider instanceof messengerDataProvider){
			else if(provider.constructor.name == "messengerDataProvider"){
				provName = "Facebook";
			}
			else if(provider.constructor.name == "instagramDataProvider"){
				provName = "Instagram";
			}
			//html += `<optgroup label="${provName}" data-content="<span>${provName}</span>">`;
			accounts.forEach(function (account) {
				let contentRender = getContentRender(account);
				let selected = account.selected ? "selected" : "";
				if(account.selected){
					me.selectedProvider = provider;
					me.selectedAccount = account;
					selectedAccountText = account.name;
				}
				let optionHtml = `<option value="${account.id}" ${selected} data-content="${contentRender}" 
					data-provider-indx="${provIndx}" data-option-icon="fa ${account.icon} ${account.status}" 
					data-display-as="${account.name}<br>${account.id}">${account.name}<br>${account.id}</option>`;
				html += optionHtml;
			});
			//html += "</optgroup>";
			provIndx++;
		});
		html += "</select>";
		if (typeof(cordova) == 'object') {
			html += `<div class="item-content">
						<div class="item-inner">
							<div class="item-title">
							</div>
							<div class="item-after">
								${selectedAccountText}
							</div>
						</div>
					</div>
				</a></li>`;
		}
		return html;
	};

	init();
}

async function newConversationStatusControl(opts){
    let arrScripts = [];

	if(typeof(bootstrapVersion) === 'undefined'){
		/*arrScripts.push({ id: 'bootstrap-select', depends: ['bootstrap', 'bootstrap-css'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/js/bootstrap-select.min.js' });
		arrScripts.push({ id: 'bootstrap-select-css', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/css/bootstrap-select.min.css' });
		// todo: esto deberia ser segun el lng_id
		arrScripts.push({ id: 'bootstrap-select-lang', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/js/i18n/defaults-es_ES.min.js' });*/
		
		arrScripts.push({ id: 'bootstrap-select', depends: ['bootstrap', 'bootstrap-css'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js' });
		arrScripts.push({ id: 'bootstrap-select-css', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css' });
		// todo: esto deberia ser segun el lng_id
		arrScripts.push({ id: 'bootstrap-select-lang', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/i18n/defaults-es_ES.min.js' });
		//await include(arrScripts);
	}
    return new conversationStatusBar(opts);
}