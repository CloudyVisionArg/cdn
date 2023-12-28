window._isCapacitor = function () {
	try { return (Capacitor != undefined); }
	catch (e) { return false; }
};


/**
 * Control para dibujar barra de estado de chat.
 * @param {Object} options - Opciones de configuracion.
 * @param {string} options.selector - Selector del contendor. Opcional si se envia funcion render.
 * @param {Array} options.providers - The array de conversationDataProviders.
 * @param {Object} options.customerData - Informacion del cliente con el que se chatea.
 * @param {Function} options.render - Funcion de renderizado en caso de querer sobreescribir render.
 */
function conversationStatusBar(options) {
	var defaults = {
		selector: null,
		providers: [],
		customerData: {},
		render: null
	};
	var options = $.extend(defaults, options);
	var currentInterval = null;

	if(options.selector == null) {
		throw "Selector option is required";
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
		//me.selectedAccount
		//me.selectedProvider
	}

	var render = function () {
		var accountsHtml = getAccountsHtml(options.providers);
		$(options.selector).html(`
		<div class="conversation-providers-status-bar">
			<div class="conversation-customer-data">
				<div class="conversation-customer-name">
					<span>${options.customerData.name}</span>
				</div>
				<div class="conversation-customer-email">
					<span>${options.customerData.email}</span>
				</div>
				<div class="conversation-customer-phone">
					<span>${options.customerData.phone}</span>
				</div>
			</div>
			<div class="conversation-status">
				<div class="conversation-status-icon">
				<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
					viewBox="0 0 784.9 495.2" style="enable-background:new 0 0 784.9 495.2;" xml:space="preserve">
					<style type="text/css">
						.st0{fill:#424242;}
						.st1{fill:#4CAF50;}
						.st2{fill:#6FD86F;}
						.st3{fill:#757575;}
						.st4{fill:#F44336;}
						.st5{fill:#FF8155;}
					</style>
					<path class="st0" d="M0,412.5v-330C0,37,27.9,0,62.3,0h660.2c34.4,0,62.3,37,62.3,82.5v330.1c0,45.6-27.9,82.5-62.3,82.5H62.3
						C27.9,495.1,0,458.2,0,412.5z"/>
					<g id="Green_Light">
						<circle class="st1" cx="197.8" cy="280.4" r="134.9"/>
						<path class="st2" d="M103.7,292.3c-11.5-3.6-14.6-43.9,12.3-76.1c40-48.2,97.7-47,103.8-21.3c8.5,35.9-36.9,21.7-71.5,50.7
							C126.7,263.6,121.9,297.9,103.7,292.3L103.7,292.3z"/>
						<path class="st3" d="M51.8,215.2c-4.7,9.3-19,8.9-17.7-5.2c3.2-34.3,22.7-61.3,38.7-77.8c31.8-33.4,78.5-52.4,125-52.3
							c46.6-0.2,93.2,18.9,125.1,52.2c16,16.5,38.7,53.3,38.8,79c0,11.2-12.7,14.2-17.3,5.1c-11.6-22.5-47.4-96.1-146.6-96.1
							S63.2,192.8,51.8,215.2L51.8,215.2z"/>
					</g>
					<g id="Red_Light">
						<circle class="st4" cx="585.4" cy="280.4" r="134.9"/>
						<path class="st5" d="M491.3,292.4c-11.5-3.6-14.6-43.9,12.3-76.1c40-48.2,97.7-47,103.8-21.3c8.5,35.9-36.9,21.7-71.5,50.7
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

		//Apply selectpicker
		$(options.selector + ' .conversation-providers-select').selectpicker({
			style: 'btn-default',
			width: '100%'
		});
		//Listen to change event
		$(options.selector + ' .conversation-providers-select').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
			var account = $(this).find('option').eq(clickedIndex);
			var providerIndx = account.attr('data-provider-indx');
			var provider = options.providers[providerIndx];
			var accountId = account.val();
			//var accountStatus = account.data('accountStatus');
			me.selectedProvider = provider;
			me.selectedAccount = provider.getAccount(accountId);
			updateAccountStatus();
			//me.selectedAccount.status = accountStatus;
			//Trigger event
			//$(me).trigger('providerChanged', [me.selectedProvider, me.selectedAccount]);
		});
	}

	var getAccountsHtml = function (providers) {
		var html = "<select class='conversation-providers-select'>";
		let provIndx = 0;
		providers.forEach(function (provider) {
			let accounts = provider.accounts;
			accounts.forEach(function (account) {
				let contentRender = "<div class='conv-account-cont'><div class='conv-account' data-account-status='" + account.status + "' ></div><div class='conv-account-info'><span class='conv-account-name'>" + account.name + "</span><span>" + 
				account.description + "</span></div></div>";
				optionHtml = `<option value="${account.id}" data-content="${contentRender}" data-provider-indx="${provIndx}">${account.name}</option>`;
				html += optionHtml;
			});
			provIndx++;
		});
		html += "</select>";
		return html;
	};

	init();
}