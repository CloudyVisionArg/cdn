/*
app7-global
Funciones varias de JavaScript del APP7

Inventario de metodos:

resolveRoute(pArgs)
logAndToast(pMsg)
dbExec(pSql, pArgs, pSuccessCallback, pErrorCallback)
dbRead(pSql, pArgs, pSuccessCallback, pErrorCallback)
logDateTime(pDate)
closeConsole()
showConsole(allowClose)
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
convertSqliteResultSet(pRes)
convertSqliteAccounts(pRes)
clearTextSelection()
getFile(pFileURL)
*/

// Incluye jslib como dependencia
(function () {
	include('jslib', function () {
		var n = document.getElementById('script_app7-global');
		n._hasdep = false;
	});
})();


window.deviceServices = {
    takePhoto: async function () {
        let me = this;
        var files = [];

        const opts = me.cameraOptions('CAMERA'); // PROMPT, CAMERA, PHOTOS
        const hasPermission = await me.requestCameraPermissions('camera'); // camera, photos
        if (hasPermission) {
            var file =  await Capacitor.Plugins.Camera.getPhoto(opts);
            file.filename = file.path.replace(/^.*[\\\/]/, '');
            files.push({
                uri: file.path,
                name: file.filename,
                size: file.size,
            });
            return files;

        } else {
            throw new Error('Se necesita permiso de acceso a la camara');
        }
    },

    cameraOptions: function (source) {
        return {
            quality: 50,
            saveToGallery: true,    
            source: source,
            //encodingType: Camera.EncodingType.JPEG,
            //mediaType: Camera.MediaType.ALLMEDIA,
            //allowEdit: (device.platform == 'iOS'),
            correctOrientation: true, // Corrects Android orientation quirks
            resultType: 'uri', // uri, base64, dataUrl
            //targetWidth: Width in pixels to scale image. Must be used with targetHeight. Aspect ratio remains constant.
            //targetHeight: 
            //saveToPhotoAlbum: Save the image to the photo album on the device after capture.
            //cameraDirection: Choose the camera to use (front- or back-facing). Camera.Direction.BACK/FRONT
        }
    },

    requestCameraPermissions: async function (permission) {
        let res = await Capacitor.Plugins.Camera.requestPermissions({ permissions: permission });
        return (res[permission] == 'granted' || res[permission] == 'limited');
    },

    // Options: https://capacitorjs.com/docs/apis/camera#galleryimageoptions
    pickImages: async function (options) {
        let me = this;
        let files = [];

        let opt = {
			//quality: 50,
        }
		Object.assign(opt, options);

        let perm = await me.requestCameraPermissions('photos');
        if (perm) {
            let res = await Capacitor.Plugins.Camera.pickImages(opt);
            res.photos.forEach(file => {
                file.name = file.path.replace(/^.*[\\\/]/, '');
                files.push(file);
            });
            return files;

        } else {
            throw new Error('Se necesita permiso de acceso a imagenes');
        }
    },

    // Options: https://capawesome.io/plugins/file-picker/#pickfilesoptions
    pickFiles: async function (options) {
        let me = this;

        let opt = {
			//limit: 1,
        }
		Object.assign(opt, options);

        let res = await Capacitor.Plugins.FilePicker.pickFiles(options);
        return res.files;
    },

    recordAudio: function () {
        return new Promise((resolve, reject) => {
            let mediaRec, interv, timer, save;

            let $sheet = $(`<div class="sheet-modal">
                <div class="swipe-handler"></div>
                <div class="block">
                    <div data-role="timer" class="text-align-center" 
                    style="font-size: 40px; font-weight: bold; padding: 30px; opacity: 20%">0:00</div>
            
                    <div data-role="rec-row" class="row">
                        <button data-role="record" class="col button button-large button-round button-fill color-pink">Grabar</button>
                    </div>
                    <div data-role="save-row" class="row" style="display: none;">
                        <button data-role="cancel" class="col button button-large button-round button-outline">Cancelar</button>
                        <button data-role="save" class="col button button-large button-round button-fill">Guardar</button>
                    </div>
                </div>
            </div>`);

            $sheet.find('button[data-role="record"]').click(recordClick);
            $sheet.find('button[data-role="save"]').click(saveClick);
            $sheet.find('button[data-role="cancel"]').click(cancelClick);
            let $timer = $sheet.find('div[data-role="timer"]');
            let $recRow = $sheet.find('div[data-role="rec-row"]');
            let $saveRow = $sheet.find('div[data-role="save-row"]');

            // Abre el sheet
            let sheet = app7.sheet.create({
                swipeToClose: true,
                content: $sheet[0],
            }).open();
        
            async function recordClick() {
                //TODO: https://github.com/tchvu3/capacitor-voice-recorder
                //Evaluar mejor los permisos 
                let perm = await Capacitor.Plugins.VoiceRecorder.requestAudioRecordingPermission();
                if (perm.value) {
                    save = false;
                    
                    let stat = await Capacitor.Plugins.VoiceRecorder.getCurrentStatus();
                    if (stat.status != 'NONE'){
                        let stopRes = await Capacitor.Plugins.VoiceRecorder.stopRecording();
                    }
                    let startRes = await Capacitor.Plugins.VoiceRecorder.startRecording();
                    updControls(true);
                }
            }

            async function saveClick() {
                let recData = await Capacitor.Plugins.VoiceRecorder.stopRecording();
                var now = new Date();
                let millis = recData.value.msDuration;
                let minutes = Math.floor(millis / 60000);
                let seconds = ((millis % 60000) / 1000).toFixed(0);
                let durationString = (seconds == 60) ?
                    (minutes + 1) + ':00' :
                    minutes + ':' + (seconds < 10 ? '0' : '') + seconds
                let fileName = 'audio_' + ISODate(now) + '_' + ISOTime(now).replaceAll(':', '-') + '_min_' + durationString.replaceAll(':', '-') + '.aac';

                let res = await Capacitor.Plugins.Filesystem.writeFile({
                    path : fileName,
                    data : recData.value.recordDataBase64,
                    directory: 'CACHE',
                });
                debugger;

                /*
            
                writeFileInCache(fileName, recData.value.recordDataBase64).then(
                    res => {
                        Capacitor.Plugins.Filesystem.stat({ path: res.uri }).then(
                            file => {
                                file.localURL = file.uri;
                                file.name = fileName;
                                resolve(file);
                            },
                            err => {
                                reject(err);
                            }
                        );
                    },
                    err => {
                        reject(err)
                    }
                );
                */
               
                clearInterval(interv);
                sheet.close();
            }

            async function cancelClick() {
                clearInterval(interv);
                updControls(false);

                const stat = await Capacitor.Plugins.VoiceRecorder.getCurrentStatus();
                console.log('VoiceRecorder.getCurrentStatus: ' + stat.status);
                if (stat.status != 'NONE') {
                    const stopRes = await Capacitor.Plugins.VoiceRecorder.stopRecording();
                    console.log('VoiceRecorder.stopRecording: ' + stopRes.value);
                    //Evaluar el resultado para logearlo
                }
            }

            function updControls(recording) {
                if (recording) {
                    $recRow.hide();
                    $saveRow.show();
                    $timer.css('opacity', '100%');
                    
                    timer = new Date();
                    interv = setInterval(function () {
                        var secs = Math.trunc((new Date() - timer) / 1000);
                        var mins = Math.trunc(secs / 60);
                        secs = secs - mins * 60;
                        $timer.html(mins + ':' + leadingZeros(secs, 2));
                    }, 200);

                } else {
                    $timer.html('0:00');
                    $timer.css('opacity', '20%');
                    $recRow.show();
                    $saveRow.hide();        
                }
            }
        })
    },

    openFile: function (uri) {
        Capacitor.Plugins.FileOpener.open({filePath : uri}).then(
            () => { },
            err => {
                logAndToast('FileOpener error: ' + dSession.utils.errMsg(err));
            }
        );
    }
};


// Devuelve el route en funcion del UrlRaw del Form
function formUrlRoute(url) {
    if (url.indexOf('_id=generic6') >= 0) {
        return '/generic6/';
    } else {
        return '/generic/';
    }
}

/*
Utilizar esta funcion para resolver la Promise de una ruta
Soporta las versiones 5 y 6 de F7

En F7 v5 se resuelve asi:

resolve({
    component: {
    	render: function () {
    		return $page;
    	},
    	on: {
	        pageInit: function(e, page) {
                ...
            },
    	},        
    }
});

Usando la funcion:

resolveRoute({
    resolve: resolve,
    pageEl: $page,
    pageInit: function (e, page) {
        ...
    }
});
*/
function resolveRoute(pArgs) {
    var options = {};

    var f7v;
    if (typeof(f7version) != 'undefined') f7v = f7version;
    
    if (document._f7version >= 6 || f7v >= 6) {
        options.on = {};
        if (typeof pArgs.pageInit == 'function') {
            options.on.pageInit = pArgs.pageInit;
        }
        if (typeof pArgs.pageBeforeOut == 'function') {
            options.on.pageBeforeOut = pArgs.pageBeforeOut;
        }
        pArgs.resolve({ content: $(pArgs.pageEl)[0] }, options);

    } else {
        options.component = {};
        options.component.on = {};
        options.component.render = () => $(pArgs.pageEl)[0];
        if (typeof pArgs.pageInit == 'function') {
            options.component.on.pageInit = pArgs.pageInit;
        }
        if (typeof pArgs.pageBeforeOut == 'function') {
            options.component.on.pageBeforeOut = pArgs.pageBeforeOut;
        }
        pArgs.resolve(options);
    }
}

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
                    console.error(errMsg(err));
                    if (pErrorCallback) pErrorCallback(err, tx);
                }
            )
        },
        function (err) {
            console.error(errMsg(err));
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
                    console.error(errMsg(err));
                    if (pErrorCallback) pErrorCallback(err, tx);
                }
            )
        },
        function (err) {
            console.error(errMsg(err));
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
    var popupConsole = app7.popup.get($('#popupConsole').last()[0]);
    if (popupConsole) popupConsole.close();
}

// Muestra la Consola como popup
async function showConsole(allowClose) {
    var popup;
    var $console = $('#popupConsole');

    if ($console.length > 0) {
        popup = app7.popup.get($console[0]);

        if (!allowClose) {
            $console.find('#close').hide();
        } else {
            $console.find('#close').show();
        }

        popup.open();
        return popup;

    } else {
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

        //  Support actions
        var supportActions = app7.actions.create({
            buttons: [
                {
                    text: 'Enviar reporte de problema',
                    onClick: function () {
                        supportMail();
                    }
                },
                {
                    text: 'serverConsole',
                    onClick: function () {
                        var dt = dSession.utils.cDate(localStorage.getItem('serverConsole'));
                        if (dt && new Date() < dt) {
                            localStorage.setItem('serverConsole', '');
                            toast('serverConsole desactivado');
                        } else {
                            localStorage.setItem('serverConsole', moment().add(1, 'h').toJSON());
                            toast('serverConsole activado por 1 hr');
                        }
                    }
                },
                {
                    text: 'Cancel',
                    color: 'red',
                    close: true,
                },
            ]
        });

        function supportMail() {
            debugger;
            var mail = {
                subject: 'Cloudy CRM - App issue',
                body: 'Por favor describanos su problema',
            }

            mail.to = ['soporte@cloudycrm.net'];
            mail.attachments = [
                {
                    type: 'base64',
                    path: window.btoa(localStorage.getItem('consoleLog')),
                    name: "console.txt"
                },
                {
                    type: 'base64',
                    path: localStorageBase64(),
                    name: "localStorage.txt"
                }
            ]
            Capacitor.Plugins.EmailComposer.open(mail);
                
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
        }

        var data = await $.get(scriptSrc('app7-console'));
        popup = app7.popup.create({
            content: data,
            closeByBackdropClick: false,
            on: {
                open: onPopupOpen,

                close: function (popup) {
                    clearInterval(this.intervalId);
                },
            }
        });
        popup.open();
        return popup;


        function onPopupOpen(popup) {
            $get('#close').click(function () {
                popup.close();
            });

            if (!allowClose) {
                $get('#close').hide();
            } else {
                $get('#close').show();
            }

            this.intervalId = setInterval(function () {
                if (popup.opened) {
                    var log = localStorage.getItem('consoleLog');
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
                var $act = $(supportActions.actionsHtml);
                var $butt = $($act.find('div.actions-button-text')[1]);

                var dt = dSession.utils.cDate(localStorage.getItem('serverConsole'));
                if (dt && new Date() < dt) {
                    $butt.html('Desactivar serverConsole');
                } else {
                    $butt.html('Activar serverConsole por 1 hr');
                }

                supportActions.actionsHtml = $act[0].outerHTML;
                supportActions.open();
            });

            $get('#restart').click(function (e) {
                location.href = 'index.html';
            });

            function $get(pSelector) {
                return $(pSelector, popup.el);
            }
        };
    }
}

// Muestra la pantalla de Login como popup
async function showLogin() {
    var popup;
    var $login = $('div.login-screen');
    
    if ($login.length > 0) {
        popup = app7.popup.get($login[0]);

        /*
        var $cancel = $login.find('#cancel').closest('li');
        if (allowClose) $cancel.show();
        else $cancel.hide();
        */

        popup.open();
        return popup;
    
    } else {
        var data = await $.get(scriptSrc('app7-login'));
        popup = app7.popup.create({
            content: data,
            closeByBackdropClick: false,
            on: {
                open: onPopupOpen,
            }
        });
        popup.open();
        return popup;

        function onPopupOpen(popup) {
            var view = app7.views.create($get('.view')[0], {
                routes: [
                    {
                        path: '/chpass/',
                        url: scriptSrc('app7-chpass'),
                        on: {
                            pageInit: chpassInit,
                        },
                    },
                    {
                        path: '/signin/',
                        url: scriptSrc('app7-signin'),
                        on: {
                            pageInit: signinInit,
                        },
                    },
                    {
                        path: '/resetpass/',
                        url: scriptSrc('app7-resetpass'),
                        on: {
                            pageInit: resetpassInit,
                        },
                    },
                ],
            });
                
            popup.el.crm = {};
            popup.el.crm.corpToggle = app7.toggle.create({ el: $get('#corpversion').parent()[0] });
            popup.el.crm.corpToggle.on('change', function () {
                setCorpVersion(this.checked);
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

            $get('#signin').click(function (e) {
                view.router.navigate('/signin/');
            });

            $get('#resetpass').click(function (e) {
                view.router.navigate('/resetpass/');
            });

            $get('#console').click(function (e) {
                showConsole(true);
            });

            $get('#cancel').click(function (e) {
                popup.close();
                view.destroy();
            });

            fillControls();

            function $get(pSelector) {
                return $(pSelector, popup.el);
            }

            function fillControls() {
                $get('#message').hide()

                var userName = localStorage.getItem('userName');
                var instance = localStorage.getItem('instance');
                var endPoint = localStorage.getItem('endPoint');
                var appName = localStorage.getItem('appName');
        
                $get('#logon').closest('li').hide();
                $get('#logoff').closest('li').hide();
                $get('#chpass').closest('li').hide();
                $get('#signin').closest('li').hide();
                $get('#resetpass').closest('li').hide();

                setInputVal($get('#username'), userName);
                setInputVal($get('#instance'), instance);
                setInputVal($get('#endpoint'), endPoint);
                setInputVal($get('#appname'), appName ? appName : 'default');

                popup.el.crm.corpToggle.checked = (instance && instance.toLowerCase() != dSession.freeVersion.instance.toLowerCase());
                setCorpVersion(popup.el.crm.corpToggle.checked);
            
                if (userName && instance && endPoint) {
                    dSession.checkToken(function () {
                        // token valido
                        disableInputs(true);
                        setIsLogged(true);
                        
                    }, function (err) {
                        setMessage(errMsg(err));
                        disableInputs(false);
                        setIsLogged(false);
                        if (err.doorsException && err.doorsException.ExceptionType == changePasswordException) {
                            $get('#chpass').closest('li').show();
                        }
                    })

                } else {
                    disableInputs(false);
                    setIsLogged(false);
                }
            }

            function logon() {
                disableInputs(true);
                $get('#logon').closest('li').addClass('disabled');
                $get('#signin').closest('li').addClass('disabled');
                $get('#chpass').closest('li').hide();
                $get('#resetpass').closest('li').addClass('disabled');

                localStorage.setItem('instance', $get('#instance').val());
                localStorage.setItem('endPoint', $get('#endpoint').val());
                localStorage.setItem('appName', $get('#appname').val());
                localStorage.setItem('userName', $get('#username').val());
                localStorage.setItem('userPassword', dSession.encryptPass($get('#password').val()));
                
                dSession.appLogon(function () {
                    setMessage('Sincronizando datos... aguarde por favor', 'white');

                    try {
                        sync.sync(true, function() {
                            location.href = 'index.html';
                        })
                    } catch(err) {
                        setMessage(errMsg(err));
                        console.error(errMsg(err));
                        fillControls();
                    }
                }, function (err) {
                    console.error(errMsg(err));
                    setMessage(errMsg(err));
                    if (err.doorsException && err.doorsException.ExceptionType == changePasswordException) {
                        $get('#chpass').closest('li').show();
                    }
                    disableInputs(false);
                    $get('#logon').closest('li').removeClass('disabled');
                    $get('#signin').closest('li').removeClass('disabled');
                    $get('#resetpass').closest('li').removeClass('disabled');
                });
            }

            function logoff() {
                pushUnreg();
                cleanDb(function () {
                    dSession.appLogoff();
                    app7.dialog.alert('Se ha cerrado la sesion y eliminado los datos locales',
                        function () {
                            location.href = 'index.html';
                        }
                    );
                });
            }

            function disableInputs(pDisable) {
                if (pDisable) {
                    $get('#corpversion').parent().addClass('disabled');
                } else {
                    $get('#corpversion').parent().removeClass('disabled');
                }
                inputDisabled($get('#instance'), pDisable);
                inputDisabled($get('#endpoint'), pDisable);
                inputDisabled($get('#appname'), pDisable);
                inputDisabled($get('#username'), pDisable);
                inputDisabled($get('#password'), pDisable);
            }

            function setCorpVersion(set) {
                if (set) {
                    var $inst = $get('#instance');
                    if ($inst.val() == dSession.freeVersion.instance) setInputVal($inst, '');
                    var $endp = $get('#endpoint');
                    if ($endp.val() == dSession.freeVersion.endpoint) setInputVal($endp, '');
                    $get('.free-item').hide();
                    $get('.corp-item').show();
                } else {
                    setInputVal($get('#instance'), dSession.freeVersion.instance);
                    setInputVal($get('#endpoint'), dSession.freeVersion.endpoint);
                    setInputVal($get('#appname'), 'default');
                    $get('.free-item').show();
                    $get('.corp-item').hide();
                }
            };

            function setIsLogged(logged) {
                if (logged) {
                    $get('.logged-item').show();
                    $get('.not-logged-item').hide();
                } else {
                    $get('.logged-item').hide();
                    $get('.not-logged-item').show();
                }
            }

            function setMessage(pMessage, pColor) {
                var $msg = $get('#message');
                $msg.html(pMessage);
                if (pColor) {
                    $msg.attr('style', 'color: ' + pColor + ' !important;');
                } else {
                    $msg.removeAttr('style');
                }
                if (pMessage) $msg.show();
                else $msg.hide();
            }
        }

        function chpassInit(e, page) {
            $get('#chpass').click(function (e) {
                var $new = $get('#newpass');
                var pwdLen = dSession.freeVersion.minPasswordLen || 6;
        
                if ($new.val().length < pwdLen) {
                    app7.dialog.alert('La contrase&ntilde;a debe tener al menos ' + pwdLen + ' caracteres', function (dialog, e) {
                        $new.focus();
                        app7.input.focus($new);
                    });
                    return false;
                }
                if ($new.val() != $get('#newpass2').val()) {
                    app7.dialog.alert('Las contrase&ntilde;as nuevas no coinciden', function (dialog, e) {
                        $new.focus();
                        app7.input.focus($new);
                    });
                    return false;
                }
            
                $get('#chpass').addClass('disabled');
            
                var userName = localStorage.getItem('userName');
                var instance = localStorage.getItem('instance');
            
                dSession.changePassword(userName, $get('#oldpass').val(), $new.val(), instance).then(
                    function () {
                        localStorage.setItem('userPassword', dSession.encryptPass($new.val()));
                        app7.dialog.alert('Se ha cambiado su contrase&ntilde;a', function (dialog, e) {
                            //page.router.back();
                            location.href = 'index.html';
                        });
            
                    }, function (err) {
                        console.error(errMsg(err));
                        app7.dialog.alert(errMsg(err));
                        $get('#chpass').removeClass('disabled');
                    }
                );
            });

            $get('#cancel').click(function (e) {
                page.router.back();
            });
        
            function $get(pSelector) {
                return $(pSelector, page.el);
            };

            function setMessage(pMessage) {
                var $msg = $get('#message');
                $msg.html(pMessage);
                if (pMessage) $msg.show();
                else $msg.hide();
            }
        }

        function signinInit(e, page) {
            $get('#signin').click(async function (e) {
                $get('#signin').closest('li').addClass('disabled');

                disableInputs(true);

                try {
                    var fv = dSession.freeVersion;
                    dSession.serverUrl = fv.endpoint;
                    await dSession.logon(fv.login, fv.password, fv.instance);

                    var fld = await dSession.foldersGetFromId(fv.signinFolder);
                    var doc = await fld.documentsNew();
                    doc.fields('empresa').value = $get('#empresa').val();
                    doc.fields('creator_email').value = $get('#email').val();
                    doc.fields('creator_nombre').value = $get('#nombre').val();
                    await doc.save();
                    setMessage('Registro correcto!<br>Le enviaremos a su email las credenciales de acceso, recuerde checkear el correo no deseado.', 'white');
                    await dSession.logoff();

                } catch (err) {
                    onError(err);
                }

                function onError(pErr) {
                    setMessage(errMsg(pErr));
                    disableInputs(false);
                    $get('#signin').closest('li').removeClass('disabled');
                    dSession.logoff();
                }

            });

            $get('#cancel').click(function (e) {
                page.router.back();
            });
        
            function $get(pSelector) {
                return $(pSelector, page.el);
            };

            function disableInputs(pDisable) {
                inputDisabled($get('#email'), pDisable);
                inputDisabled($get('#nombre'), pDisable);
                inputDisabled($get('#empresa'), pDisable);
            }

            function setMessage(pMessage, pColor) {
                var $msg = $get('#message');
                $msg.html(pMessage);
                if (pColor) {
                    $msg.attr('style', 'color: ' + pColor + ' !important;');
                } else {
                    $msg.removeAttr('style');
                }
                if (pMessage) $msg.show();
                else $msg.hide();
            }
        }

        function resetpassInit(e, page) {
            setMessage('instrucciones', '');
            setMessage('instrucciones2', '');
            setMessage('message', '');

            $get('#sendcode').click(async function (e) {
                setMessage('message', '');

                if (!$get('#email').val()) {
                    setMessage('instrucciones', 'Ingrese su Usuario');
                    $get('#email').focus();
                    return false;
                }

                disableInputs(true);
            
                try {
                    var fv = dSession.freeVersion;
                    dSession.serverUrl = fv.endpoint;
                    await dSession.logon(fv.login, fv.password, fv.instance);

                    var fld = await dSession.foldersGetFromId(fv.resetPassFolder);
                    var doc = await fld.documentsNew();
                    doc.fields('email').value = $get('#email').val();
                    await doc.save();

                    setMessage('instrucciones', 'Recibir&aacute; un mensaje con un c&oacute;digo de confirmaci&oacute;n. ' + 
                        'Ingr&eacute;selo a continuaci&oacute;n. Si no ha recibido el mensaje puede enviar el c&oacute;digo nuevamente. ' +
                        'Si ha enviado su c&oacute;digo varias veces ingrese el &uacute;ltimo recibido.');
                    disableInputs(false);
                    dSession.logoff();

                } catch (err) {
                    onError(err);
                }

            });

            $get('#confirmcode').click(async function (e) {
                setMessage('message', '');

                if (!$get('#email').val() || !$get('#code').val()) {
                    setMessage('message', 'Ingrese usuario y c&oacute;digo de confirmaci&oacute;n');
                    return false;
                }

                disableInputs(true);

                try {
                    var fv = dSession.freeVersion;
                    dSession.serverUrl = fv.endpoint;
                    await dSession.logon(fv.login, fv.password, fv.instance);

                    var fld = await dSession.foldersGetFromId(fv.resetPassFolder);
                    var res = await fld.search({
                        fields: 'doc_id, codigo',
                        formula: 'confirmado is null and email = \'' + $('#email').val() + '\'',
                        order: 'doc_id desc',
                        maxDocs: 1,
                    });

                    if (!res.length) {
                        onError('No se encontraron solicitudes de desbloqueo pendientes para este usuario');
        
                    } else if (res[0]['CODIGO'] != $('#code').val().toUpperCase()) {
                            onError('C&oacute;digo incorrecto');
        
                    } else {
                        var doc = await fld.documents(res[0]['DOC_ID']);
                        doc.fields('confirmado').value = 1;
                        await doc.save();

                        setMessage('instrucciones2', 'Recibir&aacute; un mensaje con su nueva contrase&ntilde;a.' +
                            'Presione SALIR para regresar a la pantalla de Login.');
                        dSession.logoff();
                    }

                } catch (err) {
                    onError(err);
                }
            });

            $get('#cancel').click(function (e) {
                page.router.back();
            });
        
            function $get(pSelector) {
                return $(pSelector, page.el);
            };

            function onError(pErr) {
                console.error(errMsg(pErr));
                setMessage('message', errMsg(pErr));
                disableInputs(false);
                dSession.logoff();
            }

            function disableInputs(pDisable) {
                inputDisabled($get('#email'), pDisable);
                inputDisabled($get('#code'), pDisable);
                if (pDisable) {
                    $get('#sendcode').closest('li').addClass('disabled');
                    $get('#confirmcode').closest('li').addClass('disabled').show();
                } else {
                    $get('#sendcode').closest('li').removeClass('disabled');
                    $get('#confirmcode').closest('li').removeClass('disabled').show();
                }
            }

            function setMessage(pId, pMessage) {
                var $msg = $get('#' + pId);
                $msg.html(pMessage);
                if (pMessage) $msg.parent().show();
                else $msg.parent().hide();
            }

        }
    }
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

    return $page[0];
}

// Borra los datos locales
function cleanDb(pCallback) {
    var arrExc = ['consoleLog', 'scripts', 'popoversLeidos'];
    for (var key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            if (arrExc.indexOf(key) < 0) localStorage.removeItem(key);
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
                    function (tx, err) { console.error(errMsg(err)); }
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
                function (tx, err) { console.error(errMsg(err)); }
            );
        },
        function (tx, err) { console.error(errMsg(err)); }
        );
    });
}

function pushReg() {
    (_isCapacitor()) //Si esta disponible Capacitor
    ? pushRegistrationCapacitor()
    : pushRegCordova(); //Legacy
}

function pushUnreg(pCallback) {
    (_isCapacitor()) //Si esta disponible Capacitor
    ? pushUnregCapacitor(pCallback)
    : pushUnregCordova(pCallback);
}

/**
    Capacitor
 */
// Registra el dispositivo para notificaciones Push
async function pushRegistrationCapacitor(pCallback) {
    console.log('pushRegistrationCapacitor begin');
    await addListenersCapacitor(pCallback);
    await registerNotificationsCapacitor();
}

async function addListenersCapacitor (pCallback) {
    await Capacitor.Plugins.PushNotifications.addListener('registration', token => {
        console.info('Registration token: ', token.value);
        const data = { 
            registrationId : token.value,
            registrationType : "FCM" // Para APNS?
        };
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
            console.log('pushRegistration end');
            if (pCallback) pCallback();
        });
    });

    await Capacitor.Plugins.PushNotifications.addListener('registrationError', err => {
        console.error('Registration error: ', err.error);
    });

    await Capacitor.Plugins.PushNotifications.addListener('pushNotificationReceived', async (notification) => {
        let data = JSON.parse(JSON.stringify(notification.data));
        //NOTE: Normalizar a formato cordova.push.notifications por las implementaciones en el click.
        //https://github.com/havesource/cordova-plugin-push/blob/master/docs/API.md#pushonnotification-callback
        const status = await Capacitor.Plugins.App.getState();
        console.log("pushNotificationReceived -status: " + status);
        console.log(notification);
        /* Utilizo el formato legacy de mensajes para las app en cordova */
        data.title = notification.data.title;
        data.body = notification.data.body;
        data.additionalData = notification.data;
        data.additionalData.foreground = status.isActive;
        //TODO: data.additionalData.coldstart = 
        //TODO: data.additionalData.dismissed = 

        if (window.refreshNotifications) window.refreshNotifications();
        
        var notifEv = new CustomEvent('pushNotification', { detail: { data } });
        window.dispatchEvent(notifEv)

        const clickEv = new CustomEvent('pushNotificationClick', { detail: { data } });
        //App in foreground    
        if(status.isActive){
            app7.notification.create({
                title: "CLOUDY CRM 7",
                subtitle: data.title,
                text: data.body,
                closeOnClick : true,
                on: {
                    click: function (notif) {
                        notif.close();
                        window.dispatchEvent(clickEv);
                    }
                }
            }).open();
        }
        else{
            window.dispatchEvent(clickEv);
            console.log("llego en background: " + new Date());
        }
    });
    

    await Capacitor.Plugins.PushNotifications.addListener('pushNotificationActionPerformed', ev => {
        console.log('Push notification action performed', ev.actionId, ev.inputValue);
        console.log('ev.actionId: '+ ev.actionId);
        console.log('ev.inputValue: '+ ev.inputValue);
        console.log('ev.notification: '+ JSON.stringify(ev.notification));
        if(ev.actionId == "tap"){
            const notification = ev.notification;
            let data = JSON.parse(JSON.stringify(notification.data));
            //NOTE: Normalizar a formato cordova.push.notifications por las implementaciones en el click.
            //https://github.com/havesource/cordova-plugin-push/blob/master/docs/API.md#pushonnotification-callback
            console.log("pushNotificationActionPerformed actionId: tap");
            /* Utilizo el formato legacy de mensajes para las app en cordova */
            data.title = notification.title;
            data.body = notification.body;
            data.additionalData = notification.data;
            data.additionalData.foreground = true;
            window.dispatchEvent(new CustomEvent('pushNotificationClick', { detail: { data } }));
        }
    });

    let permStatus = await Capacitor.Plugins.PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
        permStatus = await Capacitor.Plugins.PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
    }

    await Capacitor.Plugins.PushNotifications.register();
}


async function registerNotificationsCapacitor() {

}

function pushUnregCapacitor(pCallback) {
    if (app.pushData) {
        Capacitor.Plugins.PushNotifications.removeAllListeners().then(
            (e)=>{
                console.log("Notifications listeners removed");
                DoorsAPI.pushUnreg(app.pushData.registrationType, app.pushData.registrationId).then(
                    function (res) {
                        if (pCallback) pCallback();
                    },
                    function (err) {
                        console.error(errMsg(err));
                        if (pCallback) pCallback();
                    }
                );
            },
            (err) => {
                console.error('Error removing notifications listeners: ' + errMsg(err));
                if (pCallback) pCallback();
            }
        );
    }
}

/**
    Cordova
 */
// Registra el dispositivo para notificaciones Push
// https://github.com/havesource/cordova-plugin-push/blob/master/docs/API.md
function pushRegistration(pPushSetings, pCallback) {
    console.log('pushRegistration begin');

    app.push = PushNotification.init(pPushSetings);
    
    app.push.on('registration', function (data) {
        app.pushData = data;

        console.log('push regId: ' + data.registrationId);
        console.log('push regType: ' + data.registrationType);
        
        dSession.pushRegistration({
            'AppVersion': app7.version,
            'DeviceModel': device.model,
            'DevicePlatform': device.platform,
            'DeviceVersion': device.version,
            'Login': dSession.loggedUser()['Login'],
            'RegistrationId': data.registrationId,
            'RegistrationType': data.registrationType,

        }).then(function (res) {
            console.log('pushRegistration end');
            if (pCallback) pCallback(app.push);
        });
    });

    app.push.on('error', (e) => {
        console.error('pushRegistration error: ' + errMsg(e));
    });
}

function pushUnregCordova(pCallback){
    if (app.pushData) {
        app.push.unregister(
            function () {
                console.log('pushUnreg ok');
                dSession.pushUnreg(app.pushData.registrationType, app.pushData.registrationId).then(
                    function (res) {
                        if (pCallback) pCallback();
                    },
                    function (err) {
                        console.error(errMsg(err));
                        if (pCallback) pCallback();
                    }
                );
            },
            function () {
                console.error('pushUnreg error');
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
                            console.error(errMsg(err));
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
                            console.error(errMsg(err));
                            if (pCallback) pCallback(2, err);
                        }
                    );
                }
            },
            function (err) {
                console.error(errMsg(err));
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
                            console.error(errMsg(err));
                            if (pCallback) pCallback(1, err);
                        }
                    )
                }
            },
            function (err) {
                console.error(errMsg(err));
                if (pCallback) pCallback(2, err);
            }
        );

    } else {
        if (pCallback) pCallback(1, 'sync busy');
    }
}

/*
Sobrecarga console.log y console.error para dejarlo guardado en el localStorage
y enviarlo al server
*/
(function() {
    console._origLog = console.log;
    console.log = function () {
        console._origLog.apply(this, arguments);
        appConsole('log', arguments);
    }
    
    console._origWarn = console.warn;
    console.warn = function () {
        console._origWarn.apply(this, arguments);
        appConsole('warn', arguments);
    }
    
    console._origError = console.error;
    console.error = function () {
        console._origError.apply(this, arguments);
        appConsole('error', arguments);
    }

    function appConsole(method, args) {
        // Consola en localSettings
        scriptLoaded('jslib', function () {
            var log = localStorage.getItem('consoleLog');
            if (!log) log = '';
            newLog = logDateTime(new Date()) + ' -' + (method == 'log' ? '' : ' ' + method.toUpperCase() + ':');
            for (var i = 0; i < args.length; i++) {
                newLog += ' ' + errMsg(args[i]);
            };
            newLog += '\n' + log.substring(0, 1024*128);
            localStorage.setItem('consoleLog', newLog);
        });

        // Consola del server
        var dt = new Date(localStorage.getItem('serverConsole'));
        if (dt && dt.getTime() && new Date() < dt) {
            var arrArgs = [];
            for (var i = 0; i < args.length; i++) {
                arrArgs.push(args[i]);
            }
            arrArgs.push({
                consoleTag1: 'App',
                consoleTag2: localStorage.getItem('instance'),
                consoleTag3: localStorage.getItem('userName'),
            });
            var body = {};
            body.method = method;
            body.args = arrArgs;

            fetch('https://node.cloudycrm.net/console', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
        }
    }
})();

/*
CryptoJS
https://code.google.com/archive/p/crypto-js/
https://stackoverflow.com/questions/18279141/javascript-string-encryption-and-decryption
*/
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
                // En el browser va sin try catch para detectarlo mas facil
                eval(res);
                console.log('exec ' + pCode + ' ok');
                if (pSuccess) pSuccess();
            } else {
                try {
                    eval(res);
                    console.log('exec ' + pCode + ' ok');
                    if (pSuccess) pSuccess();
                } catch(err) {
                    console.error(call + ' error: ' + errMsg(err));
                    if (pFailure) pFailure(err);
                }
            }
        },
        function (err) {
            console.error(call + ' error: ' + errMsg(err));
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
            console.error(call + ' error: ' + errMsg(err));
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
                        console.error(err);
                        reject(err);
                    }
                },
                function (err) {
                    console.error(call + ' error: ' + errMsg(err));
                    reject(err);
                }
            );
        };
    });
}

function _isCapacitor(){
    return (typeof(Capacitor) != 'undefined');
}

function statusBar(pShow) {
    var refStatusBarPLugin; 
    if (_isCapacitor()) {
        Capacitor.Plugins.SplashScreen.hide();
        refStatusBarPLugin = Capacitor.Plugins.StatusBar;
    } else {
        refStatusBarPLugin = StatusBar; //Cordova
    }

    if (pShow) {
        refStatusBarPLugin.show();
        if (device.platform == 'iOS') {
            //refStatusBarPLugin.styleDefault();
        } else {
            setTimeout(async () => {
                await refStatusBarPLugin.setOverlaysWebView({ overlay: false });
                await refStatusBarPLugin.setStyle({ style: 'DEFAULT' });
                return;
            }, 1000);
        }

    } else {
        refStatusBarPLugin.hide();
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
    // Acordion ajax
    app7.on('accordionBeforeOpen', function (el, prevent) {
        var $accAjax = $(el).closest('.accordion-ajax');
        if ($accAjax.length > 0) {
            var $cont = $(el).children('div.accordion-item-content');
            if (!$cont.html()) {
                prevent();
                if ($accAjax[0].loadAccordionContent) {
                    // Llama la funcion q carga el contenido del accordion (hay q programarla)
                    $accAjax[0].loadAccordionContent($cont, function () {
                        app7.accordion.open(el);
                    });
                }
            }
        }
    });

    app7.on('accordionClosed', function (el) {
        if ($(el).closest('.accordion-ajax').length > 0) {
            // Borra el contenido del accordion
            $(el).children('div.accordion-item-content').empty();
        }
    });

    app7.on('pageBeforeOut', function (page) {
        // Se ejecuta antes de salir de una pagina

        var pageId = page.$pageEl.attr('id');

        // En ios, antes de salir del explorer, oculto la searchbar a pata xq sino queda arriba de la pagina nueva
        if (app7.theme == 'ios' && pageId && pageId.substring(0, 9) == 'explorer_') {
            var searchbar = app7.searchbar.get(page.$navbarEl.find('.searchbar')[0]);
            if (searchbar && searchbar.enabled) {
                page.$navbarEl.removeClass('with-searchbar-expandable-enabled');
                searchbar.$el.hide();
            }
        };
    })

    app7.on('pageAfterIn', function (page) {
        // Se ejecuta despues de entrar a una pagina

        var pageId = page.$pageEl.attr('id');

        // En ios, despues de entrar al explorer muestro la searchbar si estaba activa
        if (app7.theme == 'ios' && pageId && pageId.substring(0, 9) == 'explorer_') {
            var searchbar = app7.searchbar.get(page.$navbarEl.find('.searchbar')[0]);
            if (searchbar && searchbar.enabled) {
                page.$navbarEl.addClass('with-searchbar-expandable-enabled');
                searchbar.$el.show();
            }
        };

        // Ejecuto el metodo refresh del explorer
        if (pageId && pageId.substring(0, 9) == 'explorer_') {
            page.pageEl.crm.refreshOnFocus();
        };
    })
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

    // Lee las UserProperties del Folder
    pFolder.pendingCalls++;
    DoorsAPI.folderUserPropertiesGet(pFolder.FldId).then(
        function (props) {
            pFolder.UserProperties = props;
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
        console.error(errMsg(err));
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


//Get file solo para uso de Cordova
function getFile(pFileURL) {
    return new Promise(function (resolve, reject) {
        if (device.platform == 'Android' && pFileURL.substring(0, 10) == 'content://') {
            window.FilePath.resolveNativePath(pFileURL, resLocalFile, errMgr);
        }    
        else {
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
            console.error(errMsg(pErr));
            reject(pErr);
        }
    });
};

async function getFileStatFromCache(pFileURL) {
    return new Promise(function (resolve, reject) {
        Capacitor.Plugins.Filesystem.stat({
            path :pFileURL,
            directory : Directory.Cache
        }).then(
            (statResultSucc)=>{
                resolve(statResultSucc);
            },
            (statResultErr)=>{
                reject(fileReadErr);
        });
    });
}

//Get file solo para uso de Capacitor
async function getFileFromCache(pFileName) {
    return new Promise(function (resolve, reject) {
        Capacitor.Plugins.Filesystem.readFile({
            path : pFileName,
            directory : Directory.Cache
        }).then(
            async (fileReadSucc)=>{
                let file = await getFileStatFromCache(pFileName)
                file.data = fileReadSucc.data;
                file.name = pFileName;
                resolve(file);
            },
            (fileReadErr)=>{
                reject(fileReadErr);
        });
    });
};

async function removeFileFromCache(fileName){
    if (_isCapacitor()) {
        try {
            const result = await Capacitor.Plugins.Filesystem.deleteFile({
                path: fileName,
                directory: Directory.Cache,
            });
            console.log('Archivo ' +  fileName + ' eliminado del cache del app');

        } catch(e) {
            console.log('Error intentando quitar el archivo ' +  fileName + ' del cache del app');
        }
    }else{
        let msg = "Borrado de archivos en cache no soportado para Cordova";
        console.log(msg);
        throw new Error(msg);
    }
}

async function writeFileInCache(pFileName, pFileData) {
    return Capacitor.Plugins.Filesystem.writeFile({
        path : pFileName,
        data : pFileData,
        directory: Directory.Cache
    });
}

async function writeFileInCachePath(pFilePath, pFileName) {
    var filename = pFilePath.replace(/^.*[\\\/]/, '');
    if(pFileName){
        filename = pFileName;
    }
    let readFileResult = await Capacitor.Plugins.Filesystem.readFile({
        path : pFilePath,
    });
    
    await Capacitor.Plugins.Filesystem.writeFile({
        path : filename,
        data : readFileResult.data,
        directory: Directory.Cache
    });
    return getFileFromCache(filename);
}


//FileSystem
const Directory ={
    Documents:	'DOCUMENTS',    //The Documents directory On iOS it's the app's documents directory. Use this directory to store user-generated content. On Android it's the Public Documents folder, so it's accessible from other apps. It's not accesible on Android 10 unless the app enables legacy External Storage by adding android:requestLegacyExternalStorage="true" in the application tag in the AndroidManifest.xml. It's not accesible on Android 11 or newer.	1.0.0
    Data:       'DATA',         //The Data directory On iOS it will use the Documents directory. On Android it's the directory holding application files. Files will be deleted when the application is uninstalled.	1.0.0
    Library:    'LIBRARY',	    //The Library directory On iOS it will use the Library directory. On Android it's the directory holding application files. Files will be deleted when the application is uninstalled.	1.1.0
    Cache:	    'CACHE',        //The Cache directory Can be deleted in cases of low memory, so use this directory to write app-specific files that your app can re-create easily.	1.0.0
    External:	'EXTERNAL', 	//The external directory On iOS it will use the Documents directory On Android it's the directory on the primary shared/external storage device where the application can place persistent files it owns. These files are internal to the applications, and not typically visible to the user as media. Files will be deleted when the application is uninstalled.	1.0.0
    ExternalStorage:  'EXTERNAL_STORAGE' //The external storage directory On iOS it will use the Documents directory On Android it's the primary shared/external storage directory. It's not accesible on Android 10 unless the app enables legacy External Storage by adding android:requestLegacyExternalStorage="true" in the application tag in the AndroidManifest.xml. It's not accesible on Android 11 or newer.
}