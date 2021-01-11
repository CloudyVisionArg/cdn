(function(){
	//lo q haga falta al inicio
}());

$(document).ready(function () {
	$.ajax({
		url: 'https://cloudycrm.net/c/emojis.asp',
		dataType: 'jsonp',
	})
		.done(function (data, textStatus, jqXHR) {
			emojis.emojisJSON = data;

			// El DIV para mostrar los emojis
			var $picker = $('<div/>', {
				id: 'emojiPicker',
			}).css({
				backgroundColor: '#ECECEC',
				borderRadius: '12px',
				display: 'none',
				position: 'absolute',
				border: '3px solid #ECECEC',
				padding: '5px',
				height: '170px',
				width: '350px',
				overflowY: 'scroll',
			}).appendTo($(document.body));
			
			data.forEach(it => {
				var emoji = it.html;

				/* Este tambien anda:
				var code = it.utf16.split(';');
				var emoji = String.fromCharCode(code[0], code[1]);
				*/
				
				$('<i/>', {
				}).css({
					fontStyle: 'normal',
					fontFamily: '"Apple Color Emoji"', //https://stackoverflow.com/questions/54772829/smiling-face-relaxed-emoji-not-displaying-in-html
					cursor: 'pointer',
					padding: '3px',
					fontSize: '30px',
					width: '36px',
					display: 'inline-block',
					textAlign: 'center',
				}).append(emoji).appendTo($picker);
			});
			
			$picker.on('click', 'i', function (e) {
				emojis.insertAtCaret($(this).parent()[0].target, $(this).html());
				e.stopPropagation();
			});
			
			$(document).click(function () {
				$picker.hide()
			});
		})
		
		.fail(function (jqXHR, textStatus, errorThrown) {
			debugger;
		});
});

var emojis = {
	emojisJSON: undefined,
	
	// Retorna un emoji por su nombre
	emoji: function (pName) {
		for (var i = 0; i < emojis.emojisJSON.length; i++) {
			var it = emojis.emojisJSON[i];
			if (it.name.toLowerCase() == pName.toLowerCase()) {
				var code = it.utf16.split(';');
				return String.fromCharCode(code[0], code[1]);
			}
		};
	},

	/*
	Crea un selector de emojis. Hay que pasarle el elemento donde se hace click para abrir
	el selector, y el elemento donde se escribe el emoji: Ej:
	
	emojis.createPicker({
		el: $('#notas_add').prev('span'),
		inputEl: $('#notas_add'),
	});
	*/
	createPicker: function (pOptions) {
		$(pOptions.el)[0].emojis = pOptions;
		$(pOptions.el).click(function (e) {
			var posX, posY;
			var $picker = $('#emojiPicker');
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
				zIndex: 1000,
			});
			$picker[0].target = this.emojis.inputEl;
			$picker.show();
			e.stopPropagation();
		});
	},
	
	insertAtCaret: function (pInput, pValue) {
		try {
			var inp = $(pInput)[0];
			if (document.all && inp.createTextRange && inp.caretPos) {
				var cPos = inp.caretPos;
				cPos.text = '' == cPos.text.charAt(cPos.text.length - 1) ? pValue + '' : pValue
			} else if (inp.setSelectionRange) {
				var selStart = inp.selectionStart,
					selEnd = inp.selectionEnd,
					left = inp.value.substring(0, selStart),
					right = inp.value.substring(selEnd);
				inp.value = left + pValue + right;
				inp.focus();
				var len = pValue.length;
				inp.setSelectionRange(selStart + len, selStart + len);
				//inp.blur()
			} else {
				inp.value += pValue;
			}
			$(pInput).change();
		} catch (err) {
			debugger;
		}
	},	
}
