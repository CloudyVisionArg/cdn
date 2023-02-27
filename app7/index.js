'use strict';

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
var app7;
var db;
var doorsapi2, dSession;

var initScripts = [];

initScripts.push({ id: 'doorsapi' });
initScripts.push({ id: 'app7-global' });
initScripts.push({ id: 'app7-controls' });
initScripts.push({ id: 'app7-sync', depends: ['jslib', 'app7-global', 'app7-doorsapi'] });
initScripts.push({ id: 'lib-numeral' });
initScripts.push({ id: 'lib-numeral-locales', depends: ['lib-numeral'] });
initScripts.push({ id: 'lib-moment' });
initScripts.push({ id: 'lib-cryptojs-aes' });
initScripts.push({ id: 'lib-filesaver' });
initScripts.push({ id: 'app7-index.css' });

(async () => {
    // https://docs.sheetjs.com/docs/
    include('xlsx', 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
    
    await include(initScripts);
    
    doorsapi2 = await import(scriptSrc('doorsapi2'));
    var sessionMod = await import(scriptSrc('app7-session'));
    dSession = new sessionMod.Session();

    app.initialize();    
})();

window.crm = {};

var app = {
    self: undefined,

    // Application Constructor
    initialize: function() {
        console.log('app.init');
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        document.addEventListener('pause', this.onPause.bind(this), false);
        document.addEventListener('resume', this.onResume.bind(this), false);

        self = this;

        var theme = window.localStorage.getItem('theme');
        if (!theme) theme = 'auto';

        if (window.localStorage.getItem('darkTheme') == 'on') $(document.body).addClass('dark');

        //todo: deberian setearse al loguearse, segun el lngId del User
        moment.locale('es');
        numeral.locale('es'); // http://numeraljs.com/
        numeral.defaultFormat('0,0.[00]');

        // Verificacion de plugins
        if (!window.BackgroundFetch) console.log('Plugin error: cordova-plugin-background-fetch');
        if (!navigator.camera) console.log('Plugin error: cordova-plugin-camera');
        if (!device) console.log('Plugin error: cordova-plugin-device');
        if (!cordova.plugins.email) console.log('Plugin error: cordova-plugin-email-composer');
        if (!cordova.file) console.log('Plugin error: cordova-plugin-file');
        if (!cordova.InAppBrowser) console.log('Plugin error: cordova-plugin-inappbrowser');
        if (typeof StatusBar == 'undefined') console.log('Plugin error: cordova-plugin-statusbar');
        if (!window.sqlitePlugin) console.log('Plugin error: cordova-sqlite-storage');
        if (typeof PushNotification == 'undefined') console.log('Plugin error: cordova-plugin-push');
        if (typeof BuildInfo == 'undefined') console.log('Plugin error: cordova-plugin-buildinfo');
        if (!window.ContactsX) console.log('Plugin error: cordova-plugin-contacts-x');
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
                        var context = getRouterContext(arguments);
                        loadJS(scriptSrc('app7-explorer'), context.to, context.from, context.resolve, context.reject);
                    }
                },
                {
                    path: '/generic/',
                    async: function () {
                        var context = getRouterContext(arguments);
                        loadJS(scriptSrc('app7-generic'), context.to, context.from, context.resolve, context.reject);
                    }
                },
                {
                    path: '/cdn/',
                    async: function () {
                        var context = getRouterContext(arguments);
                        var script = context.to.query.script;
                        loadJS(scriptSrc(script), context.to, context.from, context.resolve, context.reject);
                    }
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
                            'select code from ' + sync.tableName('codelib7') + ' where name = ?',
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
                                        } catch(err) {
                                            console.log(err);
                                            resolve({ content: errPage(err) });
                                        }
                                    }
                                } else {
                                    resolve({ content: errPage('Codelib not found: ' + code) });
                                }
                            },
                            function (err) {
                                resolve({ content: errPage(err) });
                            }
                        );
                    }
                },
            ]
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
                    reject: pArgs[3]
                };
            }
        };

        function loadJS(url, routeTo, routeFrom, resolve, reject) {
            $.ajax({
                url: url,
                dataType: 'text',
            }).done(function (data, textStatus, jqXHR) {
                if (device.platform == 'browser') {
                    eval(data);
                } else {
                    try {
                        eval(data);
                    } catch(err) {
                        console.log(err);
                        resolve({ content: errPage(err) });
                    }
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                debugger;
            });
        }

        //showConsole();

        var path = location.pathname;
        self.rootPath = path.substring(0, path.lastIndexOf('/'));

        console.log(
            'device.cordova: ' + device.cordova + ' / ' +
            'device.platform: ' + device.platform + ' / ' +
            'device.model: ' + device.model + ' / ' +
            'device.version: ' + device.version + ' / ' +
            'device.uuid: ' + device.uuid);

        if (device.platform == 'browser'){
            db = window.openDatabase(
                'DbName', '', 'Db Display Name', 5*1024*1024,
                function (db) { console.log('invoked on creation'); }
            );
        } else {
            db = window.sqlitePlugin.openDatabase({
                name: 'DbName',
                location: 'default',
                },
                function(db) {
                    console.log('openDatabase OK');
                },
                function(err) {
                    console.log('openDatabase Err: ' + JSON.stringify(err));        
                }
            );
        };
    
        /*
        // Background fetch
        if (device.platform == 'iOS') {
            // https://github.com/transistorsoft/cordova-plugin-background-fetch

            // Your background-fetch handler.
            var fetchFunctionIos = function () {
                console.log('bgFetch initiated');
                executeCode('bgFetch');
            }

            var fetchFailureIos = function (error) {
                console.log('bgFetch failed', error);
            };

            //stopOnTerminate: false  // <-- true is default no existe mas esta opcion revisar doc    
            window.BackgroundFetch.configure( {
                minimumFetchInterval: 15
            },fetchFunctionIos, fetchFailureIos);

        } else if (device.platform == 'Android') {
            var androidServiceReference = AndroidSingleton.getInstance();
            androidServiceReference.fetchSuccessFunction(fetchFunctionAndroid);
            //androidServiceReference.fetchFailure(fetchFailure);

            androidServiceReference.initialize();

            function fetchFunctionAndroid(data) {
                console.log('bgFetch initiated');
                if (data.LatestResult != null) {
                    console.log('bgFetch before exec');
                    executeCode('bgFetch',
                        function (){
                            console.log('bgFetch exec success');
                        },
                        function (err){
                            console.log('bgFetch exec failure');
                        }
                    );
                }
            }
    
            // todo: monky, esto no se usa?
            //todo: todavia no pero tenemos que manejar el error al menos para saber, yo lo completo.
            function fetchFailureAndroid(data) {
                if (data.LatestResult != null) {
                    console.log('bgFetch failure');
                }
            }
        }
        */

        // https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-statusbar/
        var val = window.localStorage.getItem('statusBar');
        statusBar(val != 'off');

        f7AppEvents();

        // Muestra la pantalla de Login o ejecuta onDeviceReady
        if (!window.localStorage.getItem('userName')) {
            showLogin();
        } else {
            if (app7.online) {
                dSession.checkToken(
                    () => {
                        execOnDeviceReady();
                        sessionMsg();
                    },
                    function (err) {
                        console.log(err);
                        showLogin();
                    }
                );
            } else {
                execOnDeviceReady();
            }
        };

        function execOnDeviceReady() {
            pushReg();

            executeCode('onDeviceReady', 
                function () {
                    sync.sync(false);
                },
                function (err) {
                    // Sincroniza full y despues inicia
                    console.log('onDeviceReady error, full syncing...');
                    sync.sync(true, function () {
                        // todo: aca seria mejor recargar el app con un parametro para que si vuelve a fallar haga un stop
                        executeCode('onDeviceReady',
                            function () {
                            },
                            function (err) {
                                console.log('onDeviceReady error, app stopped');
                            }
                        );
                    });
                }
            );
        };
    },

    onPause: function() {
        executeCode('onPause');
    },

    onResume: function() {
        if (app7.online) {
            var ls = window.localStorage;
            if (ls.getItem('userName') && ls.getItem('instance') && ls.getItem('endPoint')) {
                dSession.checkToken(
                    function () {
                        sync.sync(false);
                        if (window.refreshNotifications) window.refreshNotifications();
                        executeCode('onResume');
                        sessionMsg();
                    },
                    function (err) {
                        console.log(err);
                        toast(errMsg(err));
                        showLogin();
                    }
                )
            }
        } else {
            executeCode('onResume');
        };
    },
};

function sessionMsg() {
    dSession.tags.then(
        res => {
            if (res.message) {
                app7.toast.create({
                    text: res.message,
                    closeTimeout: 15000,
                    position: 'center',
                    closeButton: false,
                    icon: '<i class="f7-icons">exclamationmark_triangle</i>',
                }).open();
            }
        }
    )
}

function pushReg() {
    if (device.platform != 'browser') {
        var pushSettings = {
            android: {
            },
            ios: {
                alert: true,
                badge: true,
                sound: true,
            },
            browser : {
                pushServiceURL: 'http://push.api.phonegap.com/v1/push',
            }
        };
        
        pushRegistration(pushSettings, function (push) {
            if (push) {
                push.on('notification', function (data) {
                    if (window.refreshNotifications) window.refreshNotifications();

                    var notifEv = new CustomEvent('pushNotification', { detail: { data } });
                    window.dispatchEvent(notifEv)

                    var clickEv = new CustomEvent('pushNotificationClick', { detail: { data } });

                    if (data.additionalData.foreground) {
                        app7.notification.create({
                            title: 'CLOUDY CRM7',
                            subtitle: data.title,
                            text: data.message,
                            closeTimeout: 10000,
                            on: {
                                click: function (notif) {
                                    notif.close();
                                    window.dispatchEvent(clickEv);
                                }
                            }
                        }).open();
                        
                    } else {
                        window.dispatchEvent(clickEv);
                    }
                });
            }	
        });
    }
}
