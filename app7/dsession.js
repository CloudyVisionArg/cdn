var dSession = new DSession();

function DSession() {
    this.freeVersion = {}
    this.freeVersion.endpoint = 'https://freeversion.cloudycrm.net/restful';
    this.freeVersion.login = 'anonimo';
    this.freeVersion.password = 'gTfy4#j0/x';
    this.freeVersion.instance = 'FREEVERSION';
    this.freeVersion.signinFolder = 5217;
    this.freeVersion.resetPassFolder = 5269;
    this.freeVersion.minPasswordLen = 6;
    
    var tokenTimeout = 120; //minutos
    Doors.RESTFULL.ServerUrl = window.localStorage.getItem('endPoint');
    
    var self = this;
    
    this.instanceDescription = function() {
        return window.localStorage.getItem('instanceDesc');
    }

    this.checkToken = function (pSuccess, pFailure) {
        var authToken = getToken();

        if (!authToken) {
            self.logon(pSuccess, pFailure);
        } else {
            Doors.RESTFULL.AuthToken = authToken;
            DoorsAPI.islogged().then(function (res) {
                if (!res) {
                    self.logon(pSuccess, pFailure);
                } else {
                    if (pSuccess) pSuccess();
                }
            }, function (err) {
                console.log(err);
                if (pFailure) pFailure(err);
            });
        }
    }

    this.logon = function (pSuccess, pFailure) {
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

        Doors.RESTFULL.ServerUrl = endPoint;
        var password = this.decryptPass(window.localStorage.getItem('userPassword'));

        DoorsAPI.logon(userName, password, instance).then(function (token) {
            Doors.RESTFULL.AuthToken = token;
            setToken(token);
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

    this.logoff = function () {
        DoorsAPI.logoff();
        Doors.RESTFULL.AuthToken = '';
        Doors.RESTFULL.ServerUrl = '';
        window.localStorage.setItem('instance', '');
        window.localStorage.setItem('instanceDesc', '');
        window.localStorage.setItem('endPoint', '');
        window.localStorage.setItem('appName', '');
        window.localStorage.setItem('userName', '');
        window.localStorage.setItem('userPassword', '');
        window.localStorage.setItem('authToken', '');
        window.localStorage.setItem('authTokenTime', '');
        window.localStorage.setItem('sync_table', ''); 
    }

    this.loggedUser = function () {
        // Correccion del nombre de este item
        if (window.localStorage.getItem('loggedUser') == null) {
            if (window.localStorage.getItem('loggerUser') != null) {
                window.localStorage.setItem('loggedUser', window.localStorage.getItem('loggerUser'));
                window.localStorage.removeItem('loggerUser');
            }
        }
        return JSON.parse(window.localStorage.getItem('loggedUser'));
    }

    this.hasGroup = function (pGroup) {
        var grp = this.loggedUser().ParentAccountsRecursive;
        if (typeof(pGroup) == 'number') {
            return grp.find(el => el['AccId'] == pGroup);
        } else {
            return grp.find(el => el['Name'].toUpperCase() == pGroup.toUpperCase());
        }
    }

    this.appsFolder = function () {
        return window.localStorage.getItem('appsFolder');
    }

    function getToken() {
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
                if (dif > tokenTimeout) {
                    return null
                } else {
                    window.localStorage.setItem('authTokenTime', (new Date).toJSON());
                    return tk;
                }
            }
        }
    }

    function setToken(pToken) {
        window.localStorage.setItem('authToken', pToken);
        window.localStorage.setItem('authTokenTime', (new Date).toJSON());
    }

    this.encryptPass = function (pPass) {
        return '__' + encrypt(pPass, '__');
    }

    this.decryptPass = function (pPass) {
        if (!pPass) pPass = '';
        if (pPass.substr(0, 2) == '__') {
            return decrypt(pPass.substr(2), '__')
        } else {
            return pPass;
        }
    }
}
