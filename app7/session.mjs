export class AppSession extends doorsapi2.Session {
    freeVersion;
    #tokenTimeout = 120;

    constructor() {
        let ep = window.localStorage.getItem('endPoint');
        super(ep);
        Doors.RESTFULL.ServerUrl = ep;

        // this.freeVersion = {
        //     endpoint: 'https://freeversion.cloudycrm.net/restful',
        //     login: 'anonimo',
        //     password: 'gTfy4#j0/x',
        //     instance: 'FREEVERSION',
        //     signinFolder: 5217,
        //     resetPassFolder: 5269,
        //     minPasswordLen: 6,
        // }
        this.freeVersion = {
            endpoint: 'http://monkeydev2.ddns.net/restful',
            login: 'anonimo',
            password: 'gTfy4#j0/x',
            instance: 'FREEVERSION',
            signinFolder: 5217,
            resetPassFolder: 5269,
            minPasswordLen: 6,
        }
    }

    instanceDescription() {
        return window.localStorage.getItem('instanceDesc');
    }

    checkToken(pSuccess, pFailure) {
        var me = this;
        var authToken = me.getToken();
        debugger;
        if (!authToken) {
            let idToken = window.localStorage.getItem('idToken');
            if (idToken) {
                me.appLogonGoogle(pSuccess, pFailure);
            } else {
                me.appLogon(pSuccess, pFailure);
            }
        } else {
            me.authToken = authToken;
            Doors.RESTFULL.AuthToken = authToken;
            me.isLogged.then(function (res) {
                if (!res) {
                    let idToken = window.localStorage.getItem('idToken');
                    if (idToken) {
                        me.appLogonGoogle(pSuccess, pFailure);
                    } else {
                        me.appLogon(pSuccess, pFailure);
                    }
                } else {
                    if (pSuccess) pSuccess();
                }
            }, function (err) {
                console.log(err);
                if (pFailure) pFailure(err);
            });
        }
    }

    appLogon(pSuccess, pFailure) {
        var me = this;

        var endPoint = window.localStorage.getItem('endPoint');
        if (!endPoint) {
            if (pFailure) pFailure('Falta el end point');
            return;
        };

        var instance = window.localStorage.getItem('instance');
        if (!instance) {
            if (pFailure) pFailure('Falta la instancia');
            return;
        };

        var userName = window.localStorage.getItem('userName');
        if (!userName) {
            if (pFailure) pFailure('Falta el usuario');
            return;
        };

        me.serverUrl = endPoint;
        Doors.RESTFULL.ServerUrl = endPoint;
        var password = this.decryptPass(window.localStorage.getItem('userPassword'));

        super.logon(userName, password, instance).then(function (token) {
            Doors.RESTFULL.AuthToken = token;
            me.setToken(token);
            DoorsAPI.loggedUser().then(function (user) {
                window.localStorage.setItem('loggedUser', JSON.stringify(user));
            });
            DoorsAPI.currentInstance().then(function (inst) {
                window.localStorage.setItem('instanceDesc', inst['Description']);
            });
            DoorsAPI.instanceSettingsGet('apps_folder').then(function (setting) {
                window.localStorage.setItem('appsFolder', setting ? setting : '');
                if (pSuccess) pSuccess();
            });

        }, function (err) {
            console.log(err);
            if (pFailure) pFailure(err);
        });
    }

    appLogoff() {
        super.logoff();
        Doors.RESTFULL.AuthToken = '';
        Doors.RESTFULL.ServerUrl = '';
        localStorage.removeItem('instance');
        localStorage.removeItem('instanceDesc');
        localStorage.removeItem('endPoint');
        localStorage.removeItem('appName');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPassword');
        localStorage.removeItem('authToken');
        localStorage.removeItem('authTokenTime');
        localStorage.removeItem('sync_table'); 
    }

    appLogonGoogle(pSuccess, pFailure) {
        var me = this;

        var endPoint = window.localStorage.getItem('endPoint');
        if (!endPoint) {
            if (pFailure) pFailure('Falta el end point');
            return;
        };

        var instance = window.localStorage.getItem('instance');
        if (!instance) {
            if (pFailure) pFailure('Falta la instancia');
            return;
        };

        var userName = window.localStorage.getItem('userName');
        if (!userName) {
            if (pFailure) pFailure('Falta el usuario');
            return;
        };

        var idToken = window.localStorage.getItem('idToken');
        if (!idToken) {
            if (pFailure) pFailure('Falta el idToken');
            return;
        };

        me.serverUrl = endPoint;
        Doors.RESTFULL.ServerUrl = endPoint;

        super.logonGoogle(userName, instance, idToken, "", false).then(
            function(token){
                Doors.RESTFULL.AuthToken = token;
                me.setToken(token);
                DoorsAPI.loggedUser().then(function (user) {
                    window.localStorage.setItem('loggedUser', JSON.stringify(user));
                });
                DoorsAPI.currentInstance().then(function (inst) {
                    window.localStorage.setItem('instanceDesc', inst['Description']);
                });
                DoorsAPI.instanceSettingsGet('apps_folder').then(function (setting) {
                    window.localStorage.setItem('appsFolder', setting ? setting : '');
                    if (pSuccess) pSuccess();
                });
            },
            function (err) {
                console.log(err);
                if (pFailure) pFailure(err);
            });
    }

    loggedUser() {
        return JSON.parse(window.localStorage.getItem('loggedUser'));
    }

    hasGroup(pGroup) {
        var grp = this.loggedUser().ParentAccountsRecursive;
        if (typeof(pGroup) == 'number') {
            return grp.find(el => el['AccId'] == pGroup);
        } else {
            return grp.find(el => el['Name'].toUpperCase() == pGroup.toUpperCase());
        }
    }

    appsFolder() {
        return window.localStorage.getItem('appsFolder');
    }

    getToken() {
        var me = this;

        var tk = window.localStorage.getItem('authToken');
        if (!tk) {
            return null;
        } else {
            var tkt = window.localStorage.getItem('authTokenTime');
            if (!tkt) {
                return null;
            } else {
                tkt = new Date(tkt);
                var dif = (Math.abs((new Date).getTime() - tkt.getTime())) / (1000 * 60);
                if (dif > me.#tokenTimeout) {
                    return null
                } else {
                    window.localStorage.setItem('authTokenTime', (new Date).toJSON());
                    return tk;
                }
            }
        }
    }

    setToken(pToken) {
        debugger;
        window.localStorage.setItem('authToken', pToken);
        window.localStorage.setItem('authTokenTime', (new Date).toJSON());
    }

    encryptPass(pPass) {
        return '__' + encrypt(pPass, '__');
    }

    decryptPass (pPass) {
        if (!pPass) pPass = '';
        if (pPass.substr(0, 2) == '__') {
            return decrypt(pPass.substr(2), '__')
        } else {
            return pPass;
        }
    }
}
