/*
Changelog:
2022-05-23: JP - Se eliminan las funciones de jslib y se agrega la dependencia
2022-02-11: JP - ChangeLog e Inventario de metodos

Funciones varias de JavaScript del APP7

Inventario de metodos:

logAndToast(pMsg)
dbExec(pSql, pArgs, pSuccessCallback, pErrorCallback)
dbRead(pSql, pArgs, pSuccessCallback, pErrorCallback)
logDateTime(pDate)
closeConsole()
showConsole(allowClose)
loadLoginCustomJS()
showLogin(allowClose)
errPage(err)
cleanDb(pCallback)
pushRegistration(pPushSetings, pCallback)
pushUnreg(pCallback)
getFormField(pForm, pFieldName)
saveDoc(pTable, pFields, pCallback, pSkipServer)
saveDoc2(pTable, pKeyName, pKeyVal, pCallback)
encrypt(pString, pPass)
decrypt(pString, pPass)
executeCode(pCode, pSuccess, pFailure)
getCodelib(pCode)
statusBar(pShow)
formatNumber(pValue)
formatPesos(pValue)
scalablePage(scalable)
goTop()
toast(message, duration, position)
getURLParameter(name, url)
getGuid()
ifNull(pValue, pDefault)
getObjProp(pObj, pProp)
f7AppEvents()
getFolderElements(pFolder)
folderSearch(fldId, fields, formula, order, limit, maxLen, forceOnline)
folderSearchGroups(fldId, groups, totals, formula, order, limit, forceOnline)
accountsSearch(filter, order, forceOnline)
convertSqliteResultSet(pRes)
convertSqliteAccounts(pRes)
clearTextSelection()
fileSize(size)
cameraOptions(pSource)
getFile(pFileURL)
audioRecorder(pCallback)
*/

// Incluye jslib como dependencia
(function () {
	include('jslib', function () {
		var n = document.getElementById('script_app7-global');
		n._hasdep = false;
	});
})();

function logAndToast(pMsg) {
    console.log(pMsg);
    toast(pMsg);
}

function dbExec(pSql, pArgs, pSuccessCallback, pErrorCallback) {
    db.transaction(
        function (tx) {
            tx.executeSql(pSql, pArgs,
                function (tx, rs) {
                    if (pSuccessCallback) pSuccessCallback(rs, tx);
                },
                function (tx, err) {
                    err.sqlStatement = pSql;
                    err.arguments = pArgs;
                    console.log(err);
                    if (pErrorCallback) pErrorCallback(err, tx);
                }
            )
        },
        function (err) {
            console.log(err);
            if (pErrorCallback) pErrorCallback(err);
        }
    );
}

function dbRead(pSql, pArgs, pSuccessCallback, pErrorCallback) {
    db.readTransaction(
        function (tx) {
            tx.executeSql(pSql, pArgs,
                function (tx, rs) {
                    if (pSuccessCallback) pSuccessCallback(rs, tx);
                },
                function (tx, err) {
                    err.sqlStatement = pSql;
                    err.arguments = pArgs;
                    console.log(err);
                    if (pErrorCallback) pErrorCallback(err, tx);
                }
            )
        },
        function (err) {
            console.log(err);
            if (pErrorCallback) pErrorCallback(err);
        }
    );
}

function logDateTime(pDate) {
    var dt;
    if (Object.prototype.toString.call(pDate) === '[object Date]') {
        dt = pDate;
    } else {
        dt = new Date(pDate);
    }
    return dt.getDate() + '/' + (dt.getMonth() + 1) + ' ' + ISOTime(dt, true);
}

// Cierra la Consola
function closeConsole() {
    var popupConsole = app7.popup.get($('#popupConsole').last());
    if (popupConsole) popupConsole.close();
}

// Muestra la Consola como popup
function showConsole(allowClose) {
    //  Sync actions
    var syncActions = app7.actions.create({
        buttons: [
            {
                text: 'Quick sync',
                onClick: function () {
                    sync.sync();
                }
            },
            {
                text: 'Full sync',
                onClick: function () {
                    sync.sync(true);
                }
            },
            {
                text: 'Reset sync status',
                onClick: function () {
                    sync.syncing(false);
                    toast("Sync status reseted");
                }
            },
            {
                text: 'Cancel',
                color: 'red',
                close: true,
            },
        ]
    });

    $.get(scriptSrc('app7-console'), function (data) {
        var popup = app7.popup.create({
            content: data,
            closeByBackdropClick: false,
            on: {
                open: function (popup) {
                    if (!allowClose) {
                        $get('#close').remove();
                    } else {
                        $get('#close').click(function () {
                            popup.close();
                        });
                    }

                    this.intervalId = setInterval(function () {
                        if (popup.opened) {
                            var log = window.localStorage.getItem('consoleLog');
                            if ($get('#log').html() != log) {
                                $get('#log').html(log);
                            }
                        }
                    }, 250);
        
                    $get('#credentials').click(function (e) {
                        showLogin(true);
                    });

                    $get('#sync').click(function (e) {
                        syncActions.open();
                    });

                    $get('#support').click(function (e) {
                        cordova.plugins.email.open({
                            to: 'soporte@cloudycrm.net',
                            subject: 'Cloudy CRM - App issue',
                            body: 'Por favor describanos su problema',
                            attachments: [
                                'base64:console.txt//' + window.btoa(window.localStorage.getItem('consoleLog')),
                                'base64:localStorage.txt//' + localStorageBase64(),
                            ],
                        });
            
                        function localStorageBase64() {
                            var arr = new Array();
                            for (var i = 0; i < localStorage.length; i++) {
                                if (localStorage.key(i) != 'consoleLog') {
                                    arr.push(localStorage.key(i));
                                }
                            }
                            var arrOrd = arr.sort();
                    
                            var ret = '';
                            for (var i = 0; i < arrOrd.length; i++) {
                                ret += arrOrd[i] + ': ' + localStorage.getItem(arrOrd[i]) + '\n';
                            }
                            return window.btoa(ret);
                        }
                    });

                    $get('#restart').click(function (e) {
                        location.href = 'index.html';
                    });

                    function $get(pSelector) {
                        return $(pSelector, popup.el);
                    }
                },

                close: function (popup) {
                    clearInterval(this.intervalId);
                },
            }
        });
        popup.open();
        return popup;
    });
}

function loadLoginCustomJS() {
    var el = document.createElement('script');
    el.setAttribute('type', 'text/javascript');
    el.setAttribute('src', 'custom/' + self.custom + '/login.js');
    document.getElementsByTagName('head')[0].appendChild(el);
}

// Muestra la pantalla de Login como popup
function showLogin(allowClose) {
    //undo
    $.get(scriptSrc('app7-login', 0), function (data) {
        var popup = app7.popup.create({
            content: data,
            closeByBackdropClick: false,
            on: {
                open: function (popup) {
                    var freeVersion = app7.toggle.create({ el: $get('#freeversion') });
                    debugger;
                    
                    if (!allowClose) $get('#cancel').closest('li').hide();

                    var view = app7.views.create($get('.view'), {
                        routes: [
                            {
                                path: '/chpass/',
                                url: scriptSrc('app7-chpass'),
                                on: {
                                    pageInit: chpassInit,
                                },
                            },
                        ],
                    });
                    
                    $get('#showpwd').click(function () {
                        var t = $('#password').attr('type');
                        if (t == 'password') {
                            $('#password').attr('type', 'text');
                            $(this).html('eye_slash');
                        } else if (t == 'text') {
                            $('#password').attr('type', 'password');
                            $(this).html('eye');
                        }
                        debugger;
                    });

                    $get('#freeversion').click(function () {
                        if (this.checked) {
                            setInputVal($get('#instance'), 'FREEVERSION');
                            setInputVal($get('#endpoint'), 'https://freeversion.cloudycrm.net/restful');
                            setInputVal($get('#appname'), 'default');
                        }
                    });

                    $get('#instance').change(function () {
                        if ($(this).val()) {
                            $(this).val($(this).val().trim()); /* quita espacios en blanco */
                            var newEp = 'https://' + $(this).val().toLowerCase() + '.cloudycrm.net/restful';
                            var $ep = $get('#endpoint');
                            if (!$ep.val() || !$ep.attr('manual')) {
                                setInputVal($ep, newEp);
                                $ep.removeAttr('manual');
                            }
                        }
                    });

                    $get('#endpoint').change(function () {
                        $(this).attr('manual', '1');
                    });

                    $get('#logon').click(function (e) {
                        logon();
                    });

                    $get('#logoff').click(function (e) {
                        logoff();
                    });

                    $get('#chpass').click(function (e) {
                        view.router.navigate('/chpass/');
                    });

                    $get('#console').click(function (e) {
                        showConsole(true);
                    });

                    $get('#cancel').click(function (e) {
                        popup.close();
                        view.destroy();
                    });

                    fillControls();
                    loadLoginCustomJS();

                    function $get(pSelector) {
                        return $(pSelector, popup.el);
                    }

                    function fillControls() {
                        $get('#message').hide()

                        var endPoint = window.localStorage.getItem('endPoint');
                
                        $get('#freeversion').parent().addClass('disabled');
                        $get('#logon').closest('li').hide();
                        $get('#logoff').closest('li').hide();
                        $get('#chpass').closest('li').hide();
                        $get('#signin').closest('li').hide();
                        $get('#resetpass').closest('li').hide();
                        setInputVal($get('#instance'), window.localStorage.getItem('instance'));
                        //todo: marcar el toggle free si instancia == freeversion
                        debugger;
                        setInputVal($get('#endpoint'), endPoint);
                        var val = window.localStorage.getItem('appName');
                        setInputVal($get('#appname'), val ? val : 'default');
                        setInputVal($get('#username'), window.localStorage.getItem('userName'));
                    
                        if (endPoint) {
                            dSession.checkToken(function () {
                                // token valido
                                disableInputs(true);
                                $get('#logoff').closest('li').show();
                                $get('#chpass').closest('li').show();
                                
                            }, function (err) {
                                setMessage(errMsg(err));
                                if (err.ExceptionType == 'Gestar.Doors.API.ObjectModelW.UserMustChangePasswordException') {
                                    $get('#chpass').closest('li').show();
                                }
                                disableInputs(false);
                                $get('#logon').closest('li').show();
                                $get('#freeversion').parent().removeClass('disabled');
                            })
                        } else {
                            disableInputs(false);
                            $get('#logon').closest('li').show();
                            $get('#freeversion').parent().removeClass('disabled');
                        }
                    }

                    function logon() {
                        disableInputs(true);
                        $get('#logon').closest('li').addClass('disabled');
                        $get('#signin').closest('li').addClass('disabled');
                        $get('#chpass').closest('li').hide();
                        $get('#resetpass').closest('li').addClass('disabled');

                        window.localStorage.setItem('instance', $get('#instance').val());
                        window.localStorage.setItem('endPoint', $get('#endpoint').val());
                        window.localStorage.setItem('appName', $get('#appname').val());
                        window.localStorage.setItem('userName', $get('#username').val());
                        window.localStorage.setItem('userPassword', dSession.encryptPass($get('#password').val()));
                        
                        dSession.logon(function () {
                            /*
                            if (version == "free") {
                                // En el Description del User va el appName (va a ser la empresa)
                                window.localStorage.setItem("appName", dSession.loggedUser().Description);
                            }
                            */
                           setMessage('Sincronizando datos... aguarde por favor');

                            try {
                                sync.sync(true, function() {
                                    location.href = 'index.html';
                                })
                            } catch(err) {
                                setMessage(errMsg(err));
                                console.log(err);
                                fillControls();
                            }
                        }, function (err) {
                            console.log(err);
                            setMessage(errMsg(err));
                            if (err.ExceptionType == 'Gestar.Doors.API.ObjectModelW.UserMustChangePasswordException') {
                                $get('#chpass').closest('li').show();
                            }
                            disableInputs(false);
                            $get('#logon').closest('li').removeClass('disabled');
                            $get('#signin').closest('li').removeClass('disabled');
                            $get('#resetpass').closest('li').removeClass('disabled');
                        });
                    }

                    function logoff() {
                        pushUnreg(function () {
                            cleanDb(function () {
                                dSession.logoff();
                                app7.dialog.alert('Se ha cerrado la sesion y eliminado los datos locales',
                                    function () {
                                        location.href = 'index.html';
                                    }
                                );
                            });
                        });
                    }

                    function disableInputs(pDisable) {
                        inputDisabled($get('#instance'), pDisable);
                        inputDisabled($get('#endpoint'), pDisable);
                        inputDisabled($get('#appname'), pDisable);
                        inputDisabled($get('#username'), pDisable);
                        inputDisabled($get('#password'), pDisable);
                    }

                    function setMessage(pMessage) {
                        var $msg = $get('#message');
                        $msg.html(pMessage);
                        if (pMessage) $msg.show();
                        else $msg.hide();
                    }

                    function chpassInit(e, page) {
                        $get('#chpass').click(function (e) {
                            var $new = $get('#newpass');
                    
                            if ($new.val().length < 4) {
                                app7.dialog.alert('La contraseña debe tener al menos 4 caracteres', function (dialog, e) {
                                    $new.focus();
                                    app7.input.focus($new);
                                });
                                return false;
                            }
                            if ($new.val() != $get('#newpass2').val()) {
                                app7.dialog.alert('Las contraseñas nuevas no coinciden', function (dialog, e) {
                                    $new.focus();
                                    app7.input.focus($new);
                                });
                                return false;
                            }
                        
                            $get('#chpass').addClass('disabled');
                        
                            var userName = window.localStorage.getItem('userName');
                            var instance = window.localStorage.getItem('instance');
                        
                            DoorsAPI.changePassword(userName, $get('#oldpass').val(), $new.val(), instance).then(function () {
                                window.localStorage.setItem('userPassword', dSession.encryptPass($new.val()));
                                app7.dialog.alert('Se ha cambiado su contraseña', function (dialog, e) {
                                    page.router.back();
                                });
                        
                            }, function (err) {
                                console.log(err);
                                app7.dialog.alert(errMsg(err));
                                $get('#chpass').removeClass('disabled');
                            });
                        });

                        $get('#cancel').click(function (e) {
                            page.router.back();
                        });
                    
                        function $get(pSelector) {
                            return $(pSelector, page.el);
                        };
                    }
                    
                },
            }
        });
        popup.open();
        return popup;
    });
}

// Devuelve un nodo JQuery page con un msj de error (se usa para la ruta generic)
function errPage(err) {
    var $page, $navbar, $navbarInner, $div, $button, $block;

    $page = $page = $('<div/>', {
        class: 'page',
    })
    
    $navbar = $('<div/>', {
        class: 'navbar',
    }).appendTo($page);
    
    $navbarInner = $('<div/>', {
        class: 'navbar-inner',
    }).appendTo($navbar);
    
    var $div = $('<div/>', {
        class: 'left',
    }).appendTo($navbarInner);
    
    var $a = $('<a/>', {
        class: 'link back icon-only',
    }).appendTo($div);
    
    $('<i/>', {
        class: 'f7-icons ios-only',
    }).append('chevron_left').appendTo($a);
    
    $('<i/>', {
        class: 'material-icons md-only',
    }).append('arrow_back_ios').appendTo($a);

    $('<div/>', {
        class: 'title',
    }).append('Ups!').appendTo($navbarInner);
    
    var $pageCont = $('<div/>', {
        class: 'page-content',
    }).appendTo($page);
    
    $block = $('<div/>', {
        class: 'block block-strong inset',
    }).append(errMsg(err)).appendTo($pageCont);
    
    $block = $('<div/>', {
        class: 'block',
    }).appendTo($pageCont);

    $button = $('<button/>', {
        class: 'button button-fill button-large button-raised',
    }).append('Console').appendTo($block);
    
    $button.on('click', showConsole);

    return $page;
}

// Borra los datos locales
function cleanDb(pCallback) {
    for (var key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            if (key != 'consoleLog') localStorage.removeItem(key);
        }
    }

    var calls = 0;
    db.transaction(function (tx) {
        tx.executeSql('select * from sync_table',
        [],
        function (tx, rs) {
            var row;
            for (var i = 0; i < rs.rows.length; i++) {
                calls++;
                row = rs.rows.item(i);
                tx.executeSql(
                    'drop table ' + (row['folder'] == 3 ? 'accounts' : 'folder_' + row['folder']),
                    [],
                    function (tx, rs) {
                        if (--calls == 0) {
                            if (pCallback) pCallback();
                        }
                    },
                    function (tx, err) { console.log(err); }
                );
            };
            calls++;
            tx.executeSql(
                'drop table sync_table',
                [],
                function (tx, rs) {
                    if (--calls == 0) {
                        if (pCallback) pCallback();
                    }
                },
                function (tx, err) { console.log(err); }
            );
        },
        function (tx, err) { console.log(err); }
        );
    });
}

// Registra el dispositivo para notificaciones Push
// https://github.com/phonegap/phonegap-plugin-push/blob/master/docs/API.md
function pushRegistration(pPushSetings, pCallback) {
    app.push = PushNotification.init(pPushSetings);
    
    app.push.on('registration', function (data) {
        app.pushData = data;

        console.log('push regId: ' + data.registrationId);
        console.log('push regType: ' + data.registrationType);
        
        DoorsAPI.pushRegistration({
            'AppVersion': app7.version,
            'DeviceModel': device.model,
            'DevicePlatform': device.platform,
            'DeviceVersion': device.version,
            'Login': dSession.loggedUser()['Login'],
            'RegistrationId': data.registrationId,
            'RegistrationType': data.registrationType,

        }).then(function (res) {
            if (pCallback) pCallback(app.push);
        });
    });
}

function pushUnreg(pCallback) {
    if (app.pushData) {
        app.push.unregister(
            function () {
                console.log('pushUnreg ok');
                DoorsAPI.pushUnreg(app.pushData.registrationType, app.pushData.registrationId).then(
                    function (res) {
                        if (pCallback) pCallback();
                    },
                    function (err) {
                        console.log(err);
                        if (pCallback) pCallback();
                    }
                );
            },
            function () {
                console.log('pushUnreg error');
                if (pCallback) pCallback();
            }
        );
    } else {
        if (pCallback) pCallback();
    }
}

// Busca y devuelve un Field de un objeto Form
function getFormField(pForm, pFieldName) {
    var fie, i;
    for (i = 0; i < pForm.Fields.length; i++) {
        fie = pForm.Fields[i];
        if (fie['Name'].toLowerCase() == pFieldName.toLowerCase()) {
            return fie;
        }
    }
    return null;
}

function saveDoc(pTable, pFields, pCallback, pSkipServer) {
	/*
	Graba local e intenta subir al server
	pTable: nombre de la tabla local (ej: folder_99)
	pFields: objeto con propiedad: valor. Ej:
		{ 'doc_id': 999, 'estado': 'Derivado', 'notas': { 'arg': '? || ifnull(notas, \'\')', 'val': 'notas para agregar' } }
		
	Args del callback
		- status
			0: Ok local, Ok server
			1: Ok local, Fail server
            2: Fail local
            3: Ok local, Server skipped
		- message
	*/
	
    var keyName, keyVal;

    if (pFields['doc_id']) {
        keyName = 'doc_id';
        keyVal = pFields['doc_id'];
    } else {
        if (!pFields['guid']) {
            pFields['guid'] = getGuid(); // para nuevos
        }
        keyName = 'guid';
        keyVal = pFields['guid'];
    }

	if (!pFields.hasOwnProperty('modified_local')) {
		pFields['modified_local'] = (new Date()).toJSON();
	}

    db.transaction(function (tx) {
        tx.executeSql('select doc_id, guid from ' + pTable + ' where ' + keyName + ' = ?',
            [keyVal],
            function (tx, rs) {
                if (rs.rows.length == 0) {
                    // insert
                    var sFields = 'sync_status', sFieldsArgs = '?';
                    var arrValues = [logDateTime(new Date()) + ' - Inserted'];

					for (var fie in pFields) {
						if (pFields.hasOwnProperty(fie)) {
                            sFields += ', "' + fie + '"';
                            sFieldsArgs += ', ?';
                            if (pFields[fie] && pFields[fie]['arg']) {
                                arrValues.push(pFields[fie]['val']);
                            } else {
                                arrValues.push(pFields[fie]);
                            }
						}
					}

                    tx.executeSql('insert into ' + pTable + ' (' + sFields + ') values (' + sFieldsArgs + ')',
                        arrValues,
                        function (tx, rs) {
                            if (!pSkipServer) {
                                saveDoc2(pTable, keyName, keyVal, pCallback)
                            } else {
                                if (pCallback) pCallback(3);
                            }
                        },
                        function (tx, err) {
                            console.log(err);
                            if (pCallback) pCallback(2, err);
                        }
                    );

                } else {
                    // update
                    var sFields = 'sync_status = ? || x\'0d\' || x\'0a\' || ifnull(sync_status, \'\')';
                    var arrValues = [logDateTime(new Date()) + ' - Modified'];

					for (var fie in pFields) {
						if (pFields.hasOwnProperty(fie)) {
                            if (pFields[fie] && pFields[fie]['arg']) {
                                sFields += ', "' + fie + '" = ' + pFields[fie]['arg'];
                                arrValues.push(pFields[fie]['val']);
                            } else {
                                sFields += ', "' + fie + '" = ?';
                                arrValues.push(pFields[fie]);
                            }
						}
					}
                    arrValues.push(keyVal);
                    
                    tx.executeSql('update ' + pTable + ' set ' + sFields + ' where ' + keyName + ' = ?',
                        arrValues,
                        function (tx, rs) {
                            if (!pSkipServer) {
                                saveDoc2(pTable, keyName, keyVal, pCallback);
                            } else {
                                if (pCallback) pCallback(3);
                            }
                        },
                        function (tx, err) {
                            console.log(err);
                            if (pCallback) pCallback(2, err);
                        }
                    );
                }
            },
            function (err) {
                console.log(err);
                if (pCallback) pCallback(2, err);
            }
        )
    });
}

function saveDoc2(pTable, pKeyName, pKeyVal, pCallback) {
    if (!sync.syncing()) {
        // intenta subir al Server
        dbRead('select * from ' + pTable + ' where ' + pKeyName + ' = ?',
            [pKeyVal],
            function (rs) {
                if (rs.rows.length == 0) {
                    if (pCallback) pCallback(2, 'No se encontro el registro local');
                } else {
                    var row = rs.rows.item(0);
                    sync.saveDoc(row, pTable,
                        function (doc) {
                            if (pCallback) pCallback(0, 'Ok', doc);
                        },
                        function (err) {
                            console.log(err);
                            if (pCallback) pCallback(1, err);
                        }
                    )
                }
            },
            function (err) {
                console.log(err);
                if (pCallback) pCallback(2, err);
            }
        );

    } else {
        if (pCallback) pCallback(1, 'sync busy');
    }
}

// Sobrecarga el console.log para dejar guardado el log en el localStorage
(function() {
    var exLog = console.log;
    console.log = function(msg) {
        // Llamada al log estandar
        exLog.apply(this, arguments);

        scriptLoaded('jslib', function () {
            var log = window.localStorage.getItem('consoleLog');
            if (!log) log = '';
            log = logDateTime(new Date()) + ' - ' + errMsg(msg) + '\n' + log.substring(0, 1024*64);
            window.localStorage.setItem('consoleLog', log);
        });
    }
})();

// CryptoJS
// https://code.google.com/archive/p/crypto-js/
// https://stackoverflow.com/questions/18279141/javascript-string-encryption-and-decryption
function encrypt(pString, pPass) {
    return CryptoJS.AES.encrypt(pString, pPass).toString();
}
function decrypt(pString, pPass) {
    return CryptoJS.AES.decrypt(pString, pPass).toString(CryptoJS.enc.Utf8)
}

function executeCode(pCode, pSuccess, pFailure) {
    var call = 'executeCode(' + pCode + ')';
    getCodelib(pCode).then(
        function (res) {
            if (device.platform == 'browser') {
                eval(res);
                console.log('exec ' + pCode + ' ok');
                if (pSuccess) pSuccess();
            } else {
                try {
                    eval(res);
                    console.log('exec ' + pCode + ' ok');
                    if (pSuccess) pSuccess();
                } catch(err) {
                    console.log(call + ' error: ' + errMsg(err));
                    if (pFailure) pFailure(err);
                }
            }
        },
        function (err) {
            console.log(call + ' error: ' + errMsg(err));
            if (pFailure) pFailure(err);
        }
    )
}

function getCodelib(pCode) {
    var call = 'getCodelib(' + pCode + ')';
    return new Promise(function (resolve, reject) {
        try {
            var codeTable = sync.tableName('codelib7');
        } catch (err) {
            console.log(call + ' error: ' + errMsg(err));
            reject(err);
            return;
        }
    
        if (codeTable) {
            dbRead(
                'select code from ' + sync.tableName('codelib7') + ' where name = ?',
                [pCode],
                function (rs) {
                    if (rs.rows.length) {
                        var row = rs.rows.item(0);
                        resolve(row['code']);
                    } else {
                        var err = call + ': not found';
                        console.log(err);
                        reject(err);
                    }
                },
                function (err) {
                    console.log(call + ' error: ' + err);
                    reject(err);
                }
            );
        };
    });
}

function statusBar(pShow) {
    if (pShow) {
        StatusBar.show();
        if (device.platform == 'iOS') {
            StatusBar.styleDefault();
            StatusBar.backgroundColorByHexString('12A0D8');
            StatusBar.overlaysWebView(false);
        } else {
            StatusBar.styleLightContent();
        }
    } else {
        StatusBar.hide();
    }
}

function formatNumber(pValue) {
    return numeral(pValue).format();
}

// Backward compatibility
function formatPesos(pValue) {
    return formatNumber(pValue);
}

function scalablePage(scalable) {
    // https://forum.jquery.com/topic/jqm-hijacking-meta-viewport-sets-user-scalable-no-how-to-set-this-so-user-scalable-yes
    $('meta[name=viewport]').remove();
    $('<meta>', {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, user-scalable=' + (scalable ? 'yes, maximum-scale=5' : 'no'),
    }).appendTo('head');
}

function goTop() {
    if (device.platform == 'Android') {
        $('html,body').scrollTop(0);
    } else {
        // go top animado
        $('html,body').stop().animate({ scrollTop: 0 }, 200);
    }
}

function toast(message, duration, position) {
    //duration: milliseconds
    //position: 'top', 'center', 'bottom'

    if (duration === undefined) duration = 3000;
    if (position === undefined) position = 'bottom';

    app7.toast.create({
        text: message,
        closeTimeout: duration,
        position: position,
        closeButton: true,
    }).open();
}

function getURLParameter(name, url) {
	if (!url) url = window.location.href;
    return new URLSearchParams(url).get(name);
};

function getGuid() {
    var uuid = '', i, random;
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;

        if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += '-'
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
}

function ifNull(pValue, pDefault) {
    return (pValue ? pValue : pDefault);
}

function getObjProp(pObj, pProp) {
    if (pObj == undefined) return undefined;
    return pObj[pProp];
}

// Eventos de aplicacion de Framework7
function f7AppEvents() {
    app7.on('accordionBeforeOpen', function (el, prevent) {
        var $accAjax = $(el).closest('.accordion-ajax');
        if ($accAjax.length > 0) {
            var $cont = $(el).children('div.accordion-item-content');
            if (!$cont.html()) {
                prevent();
                if ($accAjax[0].loadAccordionContent) {
                    $accAjax[0].loadAccordionContent($cont, function () {
                        app7.accordion.open(el);
                    });
                }
            }
        }
    });

    app7.on('accordionClosed', function (el) {
        if ($(el).closest('.accordion-ajax').length > 0) {
            $(el).children('div.accordion-item-content').html('');
        }
    });
}

/*
Completa el Folder con las vistas publicas y priv propias ordenadas,
las properties y el form con sus properties
todo: manejar un cache local para folders offline
*/
function getFolderElements(pFolder) {
    pFolder.pendingCalls = 0;

    // Lee las Properties del Folder
    pFolder.pendingCalls++;
    DoorsAPI.folderPropertiesGet(pFolder.FldId).then(
        function (props) {
            pFolder.Properties = props;
            pFolder.pendingCalls--;
        },
        errFunction
    );

    if (pFolder.Type == 1) {
        // Lee el Form
        pFolder.pendingCalls++;
        DoorsAPI.formsGetById(pFolder.FrmId).then(
            function (frm) {
                pFolder.Form = frm;

                // Lee las Properties del Form
                DoorsAPI.formPropertiesGet(pFolder.FrmId).then(
                    function (props) {
                        pFolder.Form.Properties = props;
                        pFolder.pendingCalls--;
                    },
                    errFunction
                );
            },
            errFunction
        );

        // Lee las vistas del folder
        pFolder.pendingCalls++;
        DoorsAPI.views(pFolder.FldId).then(
            function (views) {
                var arrViews = [];
                for (var i = 0; i < views.length; i++) {
                    var view = views[i];
                    if (view['Type'] = 1 && (!view['Private'] || view['AccId'] == dSession.loggedUser()['AccId'])) {
                        arrViews.push({
                            VieId: view['VieId'],
                            Name: view['Name'],
                            Description: view['Description'],
                            Private: view['Private'],
                        });
                    };
                };

                // Ordena
                arrViews.sort(function (a, b) {
                    if (!a['Private'] && b['Private']) {
                        return -1;
                    } else if (a['Private'] && !b['Private']) {
                        return 1;
                    } else {
                        var aTitle = a['Description'] ? a['Description'] : a['Name'];
                        var bTitle = b['Description'] ? b['Description'] : b['Name'];
                        if (aTitle.toLowerCase() < bTitle.toLowerCase()) {
                            return -1;
                        } else {
                            return 1;
                        };
                    };
                });
                pFolder.Views = arrViews;
                pFolder.pendingCalls--;
            },
            errFunction
        );
    }

    function errFunction(err) {
        console.log(err);
        throw err;
    };
}


function folderSearch(fldId, fields, formula, order, limit, maxLen, forceOnline) {
    return new Promise(function (resolve, reject) {
        if (maxLen == undefined) maxLen = 0;

        if (forceOnline) {
            DoorsAPI.folderSearch(fldId, fields, formula, order, limit, null, maxLen).then(resolve, reject);

        } else {
            sync.tableExist('folder_' + fldId, function (res) {
                if (res) {
                    sync.getDbFields('folder_' + fldId, function (cols) {
                        // Delimita los campos con doble comilla
                        var arr = [];
                        for (var i = 0; i < cols.length; i++) {
                            arr.push('\\b' + cols[i].name + '\\b');
                        }
                        // Este regExp reemplaza palabras completas fuera de comillas
                        var regEx = new RegExp('(' + arr.join('|') + ')(?=(?:[^\']|\'[^\']*\')*$)', 'gi');
                        // con la misma palabra delimitada con doble comilla
                        var rep = '"$&"';
    
                        var sql = 'select ' + fields.replace(regEx, rep) + ' from ' + 'folder_' + fldId;
                        if (formula) sql += ' where ' + formula.replace(regEx, rep);
                        if (order) sql += ' order by ' + order.replace(regEx, rep);
                        if (limit) sql += ' limit ' + limit;
                        dbRead(sql, [],
                            function (rs) {
                                resolve(convertSqliteResultSet(rs));
                            },
                            function (err) {
                                reject(err);
                            }
                        )
                    });
    
                } else {
                    DoorsAPI.folderSearch(fldId, fields, formula, order, limit, null, maxLen).then(resolve, reject);
                }
            });
        }
    });
}

function folderSearchGroups(fldId, groups, totals, formula, order, limit, forceOnline) {
    return new Promise(function (resolve, reject) {
        if (forceOnline) {
            DoorsAPI.folderSearchGroups(fldId, groups, totals, formula, order, limit).then(resolve, reject);

        } else {
            sync.tableExist('folder_' + fldId, function (res) {
                if (res) {
                    sync.getDbFields('folder_' + fldId, function (cols) {
                        // Delimita los campos con doble comilla
                        var arr = [];
                        for (var i = 0; i < cols.length; i++) {
                            arr.push('\\b' + cols[i].name + '\\b');
                        }
                        // Este regExp reemplaza palabras completas fuera de comillas
                        var regEx = new RegExp('(' + arr.join('|') + ')(?=(?:[^\']|\'[^\']*\')*$)', 'gi');
                        // con la misma palabra delimitada con doble comilla
                        var rep = '"$&"';

                        var sql = 'select ' + groups.replace(regEx, rep) + ', ' + totals.replace(regEx, rep) + ' from ' + 'folder_' + fldId;
                        if (formula) sql += ' where ' + formula.replace(regEx, rep);
                        sql += ' group by ' + groups.replace(regEx, rep);
                        if (order) sql += ' order by ' + order.replace(regEx, rep);
                        if (limit) sql += ' limit ' + limit;
                        dbRead(sql, [],
                            function (rs) {
                                resolve(convertSqliteResultSet(rs));
                            },
                            function (err) {
                                reject(err);
                            }
                        )
                    });

                } else {
                    DoorsAPI.folderSearchGroups(fldId, groups, totals, formula, order, limit).then(resolve, reject);
                }
            });
        }
    });
}

function accountsSearch(filter, order, forceOnline) {
    return new Promise(function (resolve, reject) {
        if (forceOnline) {
            DoorsAPI.accountsSearch(filter, order).then(resolve, reject);

        } else {
            sync.tableExist('accounts', function (res) {
                if (res) {
                    sync.getDbFields('accounts', function (cols) {
                        // Delimita los campos con doble comilla
                        var arr = [];
                        for (var i = 0; i < cols.length; i++) {
                            arr.push('\\b' + cols[i].name + '\\b');
                        }
                        // Este regExp reemplaza palabras completas fuera de comillas
                        var regEx = new RegExp('(' + arr.join('|') + ')(?=(?:[^\']|\'[^\']*\')*$)', 'gi');
                        // con la misma palabra delimitada con doble comilla
                        var rep = '"$&"';

                        var sql = 'select * from accounts';
                        if (filter) sql += ' where ' + filter.replace(regEx, rep);
                        if (order) sql += ' order by ' + order.replace(regEx, rep);
                        dbRead(sql, [],
                            function (rs) {
                                resolve(convertSqliteAccounts(rs));
                            },
                            function (err) {
                                reject(err);
                            }
                        )
                    });

                } else {
                    DoorsAPI.accountsSearch(filter, order).then(resolve, reject);
                }
            });
        }
    });
}

// Convierte el ResultSet de sqlite en uno igual al que retorna Doors
function convertSqliteResultSet(pRes) {
    var row, rowConv;
    var ret = [];
    for (var i = 0; i < pRes.rows.length; i++) {
        row = pRes.rows.item(i);
        rowConv = {};
        for (var key in row) {
            rowConv[key.toUpperCase()] = row[key];
        }
        ret.push(rowConv);
    }
    return ret;
}

// Convierte el Accounts de sqlite en uno igual al que retorna Doors
function convertSqliteAccounts(pRes) {
    var row, rowConv;
    var ret = [];
    for (var i = 0; i < pRes.rows.length; i++) {
        row = pRes.rows.item(i);
        rowConv = {};

        rowConv['AccId'] = row['acc_id'];
        rowConv['Name'] = row['name'];
        rowConv['Email'] = row['email'];
        rowConv['Type'] = row['type'];
        rowConv['System'] = row['system'];
        if (row['Type'] == 1) {
            rowConv['Login'] = row['login'];
            rowConv['Disabled'] = row['disabled'];
        }

        ret.push(rowConv);
    }
    return ret;
}

// Borra la seleccion de texto
function clearTextSelection() {
    if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome, Safari
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
        }
    }
}

function fileSize(size) {
    var cutoff, i, selectedSize, selectedUnit;
    var units = ['Tb', 'Gb', 'Mb', 'Kb', 'b'];

    for (i = 0; i < units.length; i++) {
        cutoff = Math.pow(1024, 4 - i);
        if (size + 1 >= cutoff) {
            selectedSize = size / cutoff;
            selectedUnit = units[i];
            break;
        }
    }
    selectedSize = Math.round(10 * selectedSize) / 10;
    return selectedSize + ' ' + selectedUnit;
};

function cameraOptions(pSource) {
	return {
		quality: 50,
		destinationType: Camera.DestinationType.FILE_URI,
		sourceType: pSource,
		encodingType: Camera.EncodingType.JPEG,
		mediaType: Camera.MediaType.ALLMEDIA,
		//allowEdit: (device.platform == 'iOS'),
		correctOrientation: true, //Corrects Android orientation quirks
		//targetWidth: Width in pixels to scale image. Must be used with targetHeight. Aspect ratio remains constant.
		//targetHeight: 
		//saveToPhotoAlbum: Save the image to the photo album on the device after capture.
		//cameraDirection: Choose the camera to use (front- or back-facing). Camera.Direction.BACK/FRONT
	};
};

function getFile(pFileURL) {
    return new Promise(function (resolve, reject) {
        if (device.platform == 'Android' && pFileURL.substring(0, 10) == 'content://') {
            window.FilePath.resolveNativePath(pFileURL, resLocalFile, errMgr);
        } else {
            resLocalFile(pFileURL);
        }

        function resLocalFile(pURL) {
            window.resolveLocalFileSystemURL(pURL,
                function (fileEntry) {
                    fileEntry.file(resolve, errMgr);
                },
                errMgr
            )
        }

        function errMgr(pErr) {
            console.log(pErr);
            reject(pErr);
        }
    });
};

function audioRecorder(pCallback) {
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
        content: $sheet,
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
}

