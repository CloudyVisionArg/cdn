'use strict';

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
var app7;
var db;
var doorsapi2;
/** @type {import('../doorsapi2.mjs').Session} */
var dSession;
const changePasswordException =
    'Gestar.Doors.API.ObjectModelW.UserMustChangePasswordException';

var initScripts = [];

initScripts.push({ id: 'doorsapi' });
initScripts.push({ id: 'app7-global' });
initScripts.push({ id: 'app7-controls' });
initScripts.push({
    id: 'app7-sync',
    depends: ['jslib', 'app7-global', 'app7-doorsapi'],
});
initScripts.push({ id: 'lib-numeral' });
initScripts.push({ id: 'lib-numeral-locales', depends: ['lib-numeral'] });
initScripts.push({ id: 'lib-moment' });
initScripts.push({ id: 'lib-cryptojs-aes' });
initScripts.push({ id: 'lib-filesaver' });
initScripts.push({ id: 'app7-index.css' });

(async () => {
    // https://docs.sheetjs.com/docs/
    include(
        'xlsx',
        'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
    );

    await include(initScripts);

    doorsapi2 = await import(scriptSrc('doorsapi2'));
    var sessionMod = await import(scriptSrc('app7-session'));
    dSession = new sessionMod.AppSession();

    app.initialize();
})();

window.crm = {};

var app = {
    self: undefined,

    // Application Constructor
    initialize: function () {
        console.log('app.init');
        document.addEventListener(
            'deviceready',
            this.onDeviceReady.bind(this),
            false
        );
    },

    onDeviceReady: function () {
        document.addEventListener('pause', this.onPause.bind(this), false);
        document.addEventListener('resume', this.onResume.bind(this), false);

        self = this;

        var theme = window.localStorage.getItem('theme');
        if (!theme) theme = 'auto';

        if (window.localStorage.getItem('darkTheme') == 'on')
            $(document.body).addClass('dark');

        //todo: deberian setearse al loguearse, segun el lngId del User
        moment.locale('es');
        numeral.locale('es'); // http://numeraljs.com/
        numeral.defaultFormat('0,0.[00]');

        // Verificacion de plugins
        if (typeof Capacitor != 'undefined') {
            console.log('Capacitor App');
            if (!Capacitor.Plugins.Camera)
                console.error('Plugin error: @capacitor/camera');
            if (!Capacitor.Plugins.StatusBar)
                console.error('Plugin error: @capacitor/status-bar');
            if (!Capacitor.Plugins.FileOpener)
                console.error('Plugin error: @capacitor-community/file-opener');
            if (!Capacitor.Plugins.Contacts)
                console.error('Plugin error: @capacitor/contacts');
            if (!Capacitor.Plugins.PushNotifications)
                console.error('Plugin error:  @capacitor/push-notifications');
            if (!Capacitor.Plugins.EmailComposer)
                console.error(
                    'Plugin error:  https://github.com/EinfachHans/capacitor-email-composer'
                );
        } else {
            console.log('Cordova App');
            if (typeof PushNotification == 'undefined')
                console.error('Plugin error: cordova-plugin-push');
            if (!window.ContactsX)
                console.error('Plugin error: cordova-plugin-contacts-x');
            if (!cordova.file)
                console.error('Plugin error: cordova-plugin-file');
            if (!window.BackgroundFetch)
                console.error('Plugin error: cordova-plugin-background-fetch');
            if (!navigator.camera)
                console.error('Plugin error: cordova-plugin-camera');
            if (!cordova.file)
                console.error('Plugin error: cordova-plugin-file');
            if (typeof StatusBar == 'undefined')
                console.error('Plugin error: cordova-plugin-statusbar');
            if (!cordova.plugins.email)
                console.error('Plugin error: cordova-plugin-email-composer');
        }

        //Comunes o compatibles entre Cordova y Capacitor
        if (!device) console.error('Plugin error: cordova-plugin-device');
        if (!window.BackgroundFetch)
            console.error('Plugin error: cordova-plugin-background-fetch');
        if (!cordova.InAppBrowser)
            console.error('Plugin error: cordova-plugin-inappbrowser');
        if (!window.sqlitePlugin)
            console.error('Plugin error: cordova-sqlite-storage');
        if (typeof BuildInfo == 'undefined')
            console.error('Plugin error: cordova-plugin-buildinfo');

        // Fin verificacion de plugins

        // Custom
        self.custom = new URLSearchParams(window.location.search).get('custom');
        if (!self.custom) {
            if (BuildInfo.packageName == 'net.cloudycrm7.promaps') {
                self.custom = 'promaps';
            } else if (BuildInfo.packageName == 'net.cloudycrm7.agd') {
                self.custom = 'agd';
            } else if (BuildInfo.packageName == 'net.cloudycrm7.sade') {
                self.custom = 'sade';
            } else {
                self.custom = 'cloudy';
            }
        }

        include('app7-' + self.custom + '-index');
        include('app7-' + self.custom + '-index.css');

        // Initialize Framework7 app
        app7 = new Framework7({
            // App root element
            el: '#app',
            root: '#app',
            // App Name
            name: BuildInfo.name,
            // App id
            id: BuildInfo.packageName,
            version: BuildInfo.version,
            theme: theme,
            pushState: true,
            touch: {
                tapHold: true, // enable tap hold events
            },
            swipeout: {
                removeElements: false,
            },
            routes: [
                {
                    path: '/explorer/',
                    async: function () {
                        let context = getRouterContext(arguments);
                        loadJS(
                            scriptSrc('app7-explorer'),
                            context.to,
                            context.from,
                            context.resolve,
                            context.reject
                        );
                    },
                },
                {
                    path: '/generic/',
                    async: function () {
                        let context = getRouterContext(arguments);
                        loadJS(
                            scriptSrc('app7-generic'),
                            context.to,
                            context.from,
                            context.resolve,
                            context.reject
                        );
                    },
                },
                {
                    path: '/generic6/',
                    async: function () {
                        let context = getRouterContext(arguments);
                        loadJS(
                            scriptSrc('generic6'),
                            context.to,
                            context.from,
                            context.resolve,
                            context.reject
                        );
                    },
                },
                {
                    path: '/cdn/',
                    async: function () {
                        let context = getRouterContext(arguments);
                        let script = context.to.query.script;
                        loadJS(
                            scriptSrc(script),
                            context.to,
                            context.from,
                            context.resolve,
                            context.reject
                        );
                    },
                },
                {
                    path: '/gh/:owner/:repo/:path+/',
                    async: function () {
                        var context = getRouterContext(arguments);
                        let params = context.to.params;
                        let url =
                            'https://cdn.cloudycrm.net/gh/' +
                            params.owner +
                            '/' +
                            params.repo +
                            '/' +
                            params.path;
                        /*
                        Esto es para poder enviar file.js!_fresh=1 y que se lea como file.js?_fresh=1
                        Si lo pasas con ? se rompe
                        */
                        url = url.replace('!', '?');
                        loadJS(
                            url,
                            context.to,
                            context.from,
                            context.resolve,
                            context.reject
                        );
                    },
                },
                {
                    path: '/ghcv/:repo/:path+/',
                    async: function () {
                        var context = getRouterContext(arguments);
                        let params = context.to.params;
                        let url =
                            'https://cdn.cloudycrm.net/ghcv/' +
                            params.repo +
                            '/' +
                            params.path;
                        url = url.replace('!', '?');
                        loadJS(
                            url,
                            context.to,
                            context.from,
                            context.resolve,
                            context.reject
                        );
                    },
                },
                {
                    path: '/codelib/',
                    async: function () {
                        var context = getRouterContext(arguments);
                        var routeTo = context.to;
                        var routeFrom = context.from;
                        var resolve = context.resolve;
                        var reject = context.reject;

                        var code = routeTo.query.code;
                        dbRead(
                            'select code from ' +
                                sync.tableName('codelib7') +
                                ' where name = ?',
                            [code],
                            function (rs) {
                                if (rs.rows.length) {
                                    var row = rs.rows.item(0);
                                    if (device.platform == 'browser') {
                                        // No lo atrapo para verlo mas facil en desa
                                        eval(row['code']);
                                    } else {
                                        try {
                                            eval(row['code']);
                                        } catch (err) {
                                            console.error(errMsg(err));
                                            resolve({ content: errPage(err) });
                                        }
                                    }
                                } else {
                                    resolve({
                                        content: errPage(
                                            'Codelib not found: ' + code
                                        ),
                                    });
                                }
                            },
                            function (err) {
                                resolve({ content: errPage(err) });
                            }
                        );
                    },
                },
            ],
        });

        function getRouterContext(pArgs) {
            if (pArgs.length == 1) {
                // F7 v7
                return pArgs[0];
            } else {
                // F7 v5
                return {
                    to: pArgs[0],
                    from: pArgs[1],
                    resolve: pArgs[2],
                    reject: pArgs[3],
                };
            }
        }

        function loadJS(url, routeTo, routeFrom, resolve, reject) {
            $.ajax({
                url: url,
                dataType: 'text',
            })
                .done(function (data, textStatus, jqXHR) {
                    if (device.platform == 'browser') {
                        eval(data);
                    } else {
                        try {
                            eval(data);
                        } catch (err) {
                            console.error(errMsg(err));
                            resolve({ content: errPage(err) });
                        }
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.log(url, jqXHR.responseText);
                    debugger;
                });
        }

        //showConsole();

        /* Para que funcione el boton back "fisico" de android */
        var onBackKeyDown = function () {
            var leftp = app7.panel.left && app7.panel.left.opened;
            var rightp = app7.panel.right && app7.panel.right.opened;

            if ($$('.modal-in').length > 0) {
                app7.dialog.close();
                app7.popup.close();
                app7.popover.close();
                return false;
            } else if (leftp || rightp) {
                app7.panel.close();
                return false;
            } else if (app7.view.current.history.length == 1) {
                navigator.app.exitApp();
            } else {
                app7.view.current.router.back();
            }
        };
        document.addEventListener('backbutton', onBackKeyDown, false);

        var path = location.pathname;
        self.rootPath = path.substring(0, path.lastIndexOf('/'));

        console.log(
            'device.cordova: ' +
                device.cordova +
                ' / ' +
                'device.platform: ' +
                device.platform +
                ' / ' +
                'device.model: ' +
                device.model +
                ' / ' +
                'device.version: ' +
                device.version +
                ' / ' +
                'device.uuid: ' +
                device.uuid
        );

        // sqlite Db
        db = window.sqlitePlugin.openDatabase(
            {
                name: 'DbName',
                location: 'default',
            },
            function (db) {
                console.log('openDatabase OK');
            },
            function (err) {
                console.error('openDatabase Err: ' + errMsg(err));
            }
        );

        window.localStorage.setItem('syncing', '0');

        if (typeof Capacitor != 'undefined') {
            Capacitor.Plugins.SplashScreen.hide();
        }

        // https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-statusbar/
        var val = window.localStorage.getItem('statusBar');
        statusBar(val != 'off');

        f7AppEvents();

        // Muestra la pantalla de Login o ejecuta onDeviceReady
        if (!window.localStorage.getItem('userName')) {
            showLogin();
        } else {
            if (app7.online) {
                checkToken(
                    () => {
                        execOnDeviceReady();
                        sessionMsg();
                    },
                    (err) => {
                        if (
                            err.doorsException &&
                            err.doorsException.ExceptionType ==
                                changePasswordException
                        ) {
                            showLogin();
                        } else {
                            showConsole();
                        }
                    }
                );
                // dSession.checkToken(
                //     () => {
                //         execOnDeviceReady();
                //         sessionMsg();
                //     },
                //     function (err) {
                //         console.error(errMsg(err));
                //         if (
                //             err.doorsException &&
                //             err.doorsException.ExceptionType ==
                //                 changePasswordException
                //         ) {
                //             showLogin();
                //         } else {
                //             showConsole();
                //         }
                //     }
                // );
            } else {
                execOnDeviceReady();
            }
        }

        function execOnDeviceReady() {
            pushReg();
            includeJs('app7-popovers');

            executeCode(
                'onDeviceReady',
                function () {
                    sync.sync(false);
                },
                function (err) {
                    // Sincroniza full y despues inicia
                    console.error('onDeviceReady error, full syncing...');
                    sync.sync(true, function () {
                        // todo: aca seria mejor recargar el app con un parametro para que si vuelve a fallar haga un stop
                        executeCode(
                            'onDeviceReady',
                            function () {},
                            function (err) {
                                showConsole();
                                console.error(
                                    'onDeviceReady error: ' + errMsg(err)
                                );
                                toast(
                                    'Error al iniciar la aplicacion, contacte a soporte',
                                    5000
                                );
                            }
                        );
                    });
                }
            );
        }
    },

    onPause: function () {
        executeCode('onPause');
    },

    onResume: function () {
        if (app7.online) {
            var ls = window.localStorage;
            if (
                ls.getItem('userName') &&
                ls.getItem('instance') &&
                ls.getItem('endPoint')
            ) {
                checkToken(
                    (res) => {
                        executeCode('onResume');
                        sessionMsg();
                    },
                    (err) => {
                        if (
                            err.doorsException &&
                            err.doorsException.ExceptionType ==
                                changePasswordException
                        ) {
                            showLogin();
                        } else {
                            showConsole();
                        }
                    }
                );
            }
        } else {
            executeCode('onResume');
        }
    },
};

async function checkToken(pCallback, pFailure) {
    let idToken = window.localStorage.getItem('idToken');
    if (idToken) {
        try {
            let jwt = await getGoogleJwt(idToken);
            localStorage.setItem('idToken', jwt);
        } catch (err) {
            console.error(err);
        }
    }
    dSession.checkToken(
        function () {
            sync.sync(false);
            if (window.refreshNotifications) window.refreshNotifications();
            pCallback();
        },
        function (err) {
            console.error(errMsg(err));
            toast(errMsg(err), 5000);
            pFailure(err);
        }
    );
}

function sessionMsg() {
    dSession.tags().then((res) => {
        if (res.service_paused == '1' && dSession.loggedUser()['AccId'] != 0) {
            app7.dialog.alert(res.message, () => {
                location.href = 'index.html';
            });
        }

        if (res.message) {
            let last = new Date(localStorage.getItem('lastMessageTime'));
            // Cada 1 hr vuelve a mostrar
            if (isNaN(last.getTime()) || new Date() - last > 60 * 60 * 1000) {
                app7.toast
                    .create({
                        text: res.message,
                        closeTimeout: 15000,
                        position: 'center',
                        closeButton: false,
                        icon: '<i class="f7-icons">exclamationmark_triangle</i>',
                    })
                    .open();

                localStorage.setItem('lastMessageTime', new Date().toJSON());
            }
        }
    });
}

function pushRegCordova() {
    if (device.platform != 'browser') {
        var pushSettings = {
            android: {},
            ios: {
                alert: true,
                badge: true,
                sound: true,
            },
            browser: {
                pushServiceURL: 'http://push.api.phonegap.com/v1/push',
            },
        };

        pushRegistration(pushSettings, function (push) {
            if (push) {
                push.on('notification', function (data) {
                    if (window.refreshNotifications)
                        window.refreshNotifications();

                    var notifEv = new CustomEvent('pushNotification', {
                        detail: { data },
                    });
                    window.dispatchEvent(notifEv);

                    var clickEv = new CustomEvent('pushNotificationClick', {
                        detail: { data },
                    });

                    if (data.additionalData.foreground) {
                        app7.notification
                            .create({
                                title: 'CLOUDY CRM7',
                                subtitle: data.title,
                                text: data.message,
                                closeTimeout: 10000,
                                on: {
                                    click: function (notif) {
                                        notif.close();
                                        window.dispatchEvent(clickEv);
                                    },
                                },
                            })
                            .open();
                    } else {
                        window.dispatchEvent(clickEv);
                    }
                });
            }
        });
    }
}
