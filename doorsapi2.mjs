/*moment
todo: reemplazar los _metodo con #metodo cdo safari implemente 
metodos privados: https://caniuse.com/?search=private%20field

swagger: http://tests.cloudycrm.net/apidocs
*/

var incjs = {};
var _moment, _numeral, _CryptoJS, _serializeError;

export { _moment as moment };
export { _numeral as numeral };
export { _CryptoJS as CryptoJS };
export { _serializeError as serializeError }

await (async () => {
    if (inNode()) {
        var importCache = await import ('./../import-cache.mjs');
        var fs = await import('fs');
    }

    // include

    var res = await fetch('https://w1.cloudycrm.net/c/gitcdn.asp?path=/include.js');
    var code = await res.text();
    eval(`
        ${code}
        incjs.include = include;
        incjs.scriptSrc = scriptSrc;
    `);

    // moment - https://momentjs.com/docs/

    if (typeof(moment) == 'undefined') {
        if (inNode()) {
            res = await importCache.webImport('https://cdn.jsdelivr.net/npm/moment@2.29.4/min/moment-with-locales.min.js/+esm');
            _moment = res.default;
        } else {
            await incjs.include('lib-moment');
            _moment = moment;
        }
    } else {
        _moment = moment;
    }

    
    // numeral - http://numeraljs.com/

    if (typeof(numeral) == 'undefined') {
        if (inNode()) {
            // todo: si da problemas levantar como el crypto
            res = await importCache.webImport('https://cdn.jsdelivr.net/npm/numeral@2.0.6/+esm');
            _numeral = res.default;
        } else {
            await incjs.include('lib-numeral');
            _numeral = numeral;
        }
    } else {
        _numeral = numeral;
    }

    if (!_numeral.locales.es) {
        _numeral.register('locale', 'es', {
            delimiters: {
                thousands: '.',
                decimal: ','
            },
            abbreviations: {
                thousand: 'k',
                million: 'mm',
                billion: 'b',
                trillion: 't'
            },
            ordinal: function (number) {
                var b = number % 10;
                return (b === 1 || b === 3) ? 'er' :
                    (b === 2) ? 'do' :
                    (b === 7 || b === 0) ? 'mo' :
                    (b === 8) ? 'vo' :
                    (b === 9) ? 'no' : 'to';
            },
            currency: {
                symbol: '$'
            }
        });
    }


    // CryptoJS - https://code.google.com/archive/p/crypto-js/

    if (typeof(CryptoJS) == 'undefined') {
        if (inNode()) {
            // todo: usar cdnImport con localPath
            res = await importCache.cdnImport({ id: 'lib-cryptojs-aes', localPath: true });
            code = await fs.readFileSync('./service/' + res);
            //code = await res.text();
            debugger;
            eval(`
                ${code}
                _CryptoJS = CryptoJS;
            `);
        } else {
            await incjs.include('lib-cryptojs-aes');
            _CryptoJS = CryptoJS;
        }
    } else {
        _CryptoJS = CryptoJS;
    }


    // serialize-error - https://github.com/sindresorhus/serialize-error

    if (typeof(_serializeError) == 'undefined') {
        if (inNode()) {
            res = await importCache.webImport('https://cdn.jsdelivr.net/npm/serialize-error-cjs@0.1.3/+esm');
            _serializeError = res.default;
        } else {
            res = await import('https://cdn.jsdelivr.net/npm/serialize-error-cjs@0.1.3/+esm');
            _serializeError = res.default;
            window.serializeError = _serializeError;
        }
    }

    // string.reverse
    if (typeof String.prototype.reverse !== 'function') {
        String.prototype.reverse = function () {
            return this.split('').reverse().join('');
        };
    }

    // string.replaceAll
    if (typeof String.prototype.replaceAll !== 'function') {
        String.prototype.replaceAll = function (search, replacement) {
            var me = this;
            return me.replace(new RegExp(search, 'g'), replacement);
        };
    }

    // string.repeat
    if (typeof String.prototype.repeat !== 'function') {
        String.prototype.repeat = function (count) {
            var me = this;
            var ret = '';
            for (var i = 0; i < count; i++) ret += me;
            return ret;
        };
    }
})();


export function inNode() {
    return (typeof(window) == 'undefined' && typeof(process) != 'undefined');
}


export class DoorsMap extends Map {
    _parseKey(key) {
        var k;
        if (typeof key === 'string') {
            k = key.toUpperCase();
        } else if (typeof key == 'number') {
            k = Array.from(super.keys())[key];
        }
        return k;
    }

    // Alias de set
    add(key, value) {
        return this.set(key, value);
    }

    delete(key) {
        return super.delete(this._parseKey(key));
    }

    // Alias de has
    exists(key) {
        return this.has(key);
    }

    find(cbFunc) {
        var me = this;
        for (let [key, value] of super.entries()) {
            if (cbFunc(value, key, me)) {
                return value;
            }
        }
        return undefined;
    }

    get(key) {
        return super.get(this._parseKey(key));
    }

    has(key) {
        return super.has(this._parseKey(key));
    }

    // Alias de get
    item(key) {
        return this.get(key);
    }

    // Alias de size
    get length() {
        return super.size;
    }

    // Alias de delete
    remove(key) {
        return this.delete(key);
    }

    set(key, value) {
        return super.set(this._parseKey(key), value);
    }
};


export class Session {
    #restClient;
    #directory;
    #serverUrl;
    #authToken;
    #tags;
    #db;
    #utils;
    #loggedUser;
    
    constructor(serverUrl, authToken) {
        this.#restClient = new RestClient(serverUrl, authToken, this);
        this.#serverUrl = serverUrl;
        this.#authToken = authToken;

        // todo: setear a partir del lngId
        _moment.locale('es'); 
        _numeral.locale('es');
        _numeral.defaultFormat('0,0.[00]');
    }
    
    get authToken() {
        return this.#authToken;
    }

    set authToken(value) {
        this.#authToken = value;
        this.restClient.AuthToken = value;
        this.#tags = undefined;
    }

    // Cambia la contraseña del usuario logueado
    changePassword(login, oldPassword, newPassword, instance) {
        var url = 'session/changepassword';

        var data = {
            login: login,
            oldPassword: oldPassword,
            newPassword: newPassword,
            instanceName: instance,
        };
        return this.restClient.fetch(url, 'POST', data, '');
    };

    // Metodos de base de datos
    get db() {
        if (!this.#db) {
            this.#db = new Database(this);
        };
        return this.#db;
    }

    // Alias de directory
    get dir() {
        return this.directory;
    }

    // Metodos de manejo del directorio
    get directory() {
        if (!this.#directory) {
            this.#directory = new Directory(this);
        };
        return this.#directory;
    }

    // Alias de documentsGetFromId
    doc(docId) {
        return this.documentsGetFromId(docId);
    }

    documentsGetFromId(docId) {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'documents/' + docId;
            me.restClient.fetch(url, 'GET', '', '').then(
                res => {
                    resolve(new Document(res, me));
                },
                reject
            )
        });
    }

    /*
    Llama a foldersGetFromId o foldersGetFromPath (segun los parametros)
    Almacena en cache por 60 segs
    */
    folder(folder, curFolderId) {
        var key = 'folder|' + folder + '|' + curFolderId;
        var cache = this.utils.cache(key);
        if (cache == undefined) {
            if (!isNaN(parseInt(folder))) {
                cache = this.foldersGetFromId(folder);
            } else {
                cache = this.foldersGetFromPath(folder, (curFolderId ? curFolderId : 1001));
            }
            this.utils.cache(key, cache, 60); // Cachea por 60 segundos
        };
        return cache;
    }

    // Alias de folder
    folders(folder, curFolderId) {
        return this.folder(folder, curFolderId);
    }

    foldersGetFromId(fldId) {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'folders/' + fldId + '';
            me.restClient.fetch(url, 'GET', '', '').then(
                res => {
                    resolve(new Folder(res, me));
                },
                reject
            )
        })
    };

    foldersGetFromPath(fldPath, curFolderId) {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'folders/' + (curFolderId ? curFolderId : 1001) + '/children?folderpath=' + encURIC(fldPath);
            me.restClient.fetch(url, 'GET', '', '').then(
                res => {
                    resolve(new Folder(res, me));
                },
                reject
            )
        })
    };

    get isLogged() {
        var url = 'session/islogged';
        return this.restClient.fetch(url, 'POST', {}, '');
    };

    get loggedUser() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#loggedUser) {
                var url = 'session/loggedUser';
                me.restClient.fetch(url, 'GET', '', '').then(
                    res => {
                        me.#loggedUser = new User(res, me);
                        resolve(me.#loggedUser);
                    },
                    reject
                )
            } else {
                resolve(me.#loggedUser);
            }
        });
    }

    logoff() {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'session/logoff';
            me.restClient.fetch(url, 'POST', {}, '').then(
                res => { me.authToken = undefined },
                reject
            )
        })
    };

    logon(login, password, instance, liteMode) {
        var me = this;
        var url = 'session/logon';
        var data = {
            loginName: login,
            password: password,
            instanceName: instance,
            liteMode: liteMode ? true : false,
        };
        return new Promise((resolve, reject) => {
            me.restClient.fetch(url, 'POST', data, '').then(
                token => {
                    me.authToken = token;
                    resolve(token);
                },
                reject
            );
        });
    };

    pushRegistration(settings) {
        var url = 'notifications/devices';
        return this.restClient.fetch(url, 'POST', settings, 'notificationReceiver');
    }

    pushUnreg(regType, regId) {
        var url = 'notifications/devices';
        var params = 'providerType=' + encURIC(regType) + '&registrationId=' + encURIC(regId);
        return this.restClient.fetch(url, 'DELETE', params, '');
    }

    get restClient() {
        return this.#restClient;
    }

    runSyncEventsOnClient(value) {
        if (value == undefined) {
            var url = 'session/syncevents/runOnClient';
            return this.restClient.fetch(url, 'GET', '', '');
        } else {
            var url = 'session/syncevents/runOnClient/' + (value ? 'true' : 'false');
            return this.restClient.fetch(url, 'POST', {}, '');
        }
    }

    get serverUrl() {
        return this.#serverUrl;
    }

    set serverUrl(value) {
        this.#serverUrl = value;
        this.restClient.ServerBaseUrl = value;
        this.#tags == undefined
    }

    settings(setting, value) {
        var url = 'settings';
        var method, param, paramName;

        if (value == undefined) {
            url += '/' + encURIC(setting);
            method = 'GET';
            param = '';
            paramName = ''
        } else {
            method = 'POST';
            param = { 
                Setting: setting,
                Value: value
            };
            paramName = 'setting';
        }

        return this.restClient.fetch(url, method, param, paramName);
    }

    get tags() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (me.#tags == undefined) {
                var url = 'session/tags';
                me.restClient.fetch(url, 'GET', '', '').then(
                    res => {
                        me.#tags = res;
                        resolve(me.#tags);
                    },
                    reject
                )
            } else {
                resolve(me.#tags);
            }
        })
    }

    // Metodos varios
    get utils() {
        if (!this.#utils) {
            this.#utils = new Utilities(this);
        };
        return this.#utils;
    }
};


class Account {
    static objectType = 6;
    #json;
    #session;
    #properties;
    #userProperties;

    constructor(account, session) {
        this.#json = account;
        this.#session = session;
    }

    _accountsGet(listFunction, account, has) {
        var me = this;
        return new Promise((resolve, reject) => {
            me[listFunction]().then(
                res => {
                    if (res.has(account)) {
                        resolve(res.get(account));

                    } else {
                        // Busca por id
                        var acc;
                        if (!isNaN(parseInt(account)) && (acc = res.find(el => el.id == account))) {
                            resolve(acc);
                        } else {
                            if (has) {
                                resolve(undefined);
                            } else {
                                reject(new Error('Account not found'));
                            }
                        }
                    }
                },
                reject
            )
        });
    }

    _accountsList(property, endPoint) {
        var me = this;
        return new Promise((resolve, reject) => {
            if (me.#json[property]) {
                resolve(me._accountsMap(me.#json[property]));

            } else {
                var url = 'accounts/' + me.id + '/' + endPoint;
                me.session.restClient.fetch(url, 'GET', '', '').then(
                    res => {
                        me.#json[property] = res;
                        resolve(me._accountsMap(me.#json[property]));
                    },
                    reject
                )
            }
        });
    }

    _accountsMap(accounts) {
        var me = this;
        var map = new DoorsMap();
        accounts.forEach(el => {
            var acc = new Account(el, me.session);
            map.set(acc.name, acc);
        });
        return map;
    }

    get accountType() {
        return this.type;
    }

    cast2User() {
        if (this.type == 1) {
            return new User(this.#json, this.#session);
        } else {
            throw new Error('User account required')
        }
    }

    /*
    childAccounts() -> Devuelve un map de cuentas hijas
    childAccounts(account) -> Devuelve una cuenta hija. Puedo pasar name o id. Da error si no esta.
    childAccounts(account, true) -> Igual que el anterior, pero si no esta devuelve undefined.

    Los metodos childAccountsRecursive, parentAccounts y parentAccountsRecursive trabajan igual
    */
    childAccounts(account, has) {
        if (account == undefined) {
            return this._accountsList('ChildAccountsList', 'childAccounts');
        } else {
            return this._accountsGet('childAccounts', account, has);
        }
    }

    childAccountsAdd(accounts) {
        var accs = Array.isArray(accounts) ? accounts : [accounts];
        var url = 'accounts/' + this.id + '/childAccounts';
        return this.session.restClient.fetch(url, 'PUT', accs, 'arrayChildAccountIds');
    }

    childAccountsRecursive(account, has) {
        if (account == undefined) {
            return this._accountsList('ChildAccountsRecursive', 'childAccountsRecursive');
        } else {
            return this._accountsGet('childAccountsRecursive', account, has);
        }
    }

    childAccountsRemove(accounts) {
        var accs = Array.isArray(accounts) ? accounts : [accounts];
        var url = 'accounts/' + this.id + '/childAccounts';
        return this.session.restClient.fetch(url, 'DELETE', accs, 'arrayChildAccountIds');    
    }

    delete(expropiateObjects) {
        var expObj = expropiateObjects ? true : false;
        var url = 'accounts/' + this.id + '?expropiateObjects=' + expObj;
        return this.session.restClient.fetch(url, 'DELETE', '', '');
    }

    get description() {
        return this.#json.Description;
    }

    set description(value) {
        this.#json.Description = value;
    }

    get email() {
        return this.#json.Email;
    }

    set email(value) {
        this.#json.Email = value;
    }

    // account puede ser name o id
    async hasChild(account, recursive) {
        var acc = await this['childAccounts' + (recursive ? 'Recursive' : '')](account, true);
        return acc ? true : false;
    }

    async hasParent(account, recursive) {
        var acc = await this['parentAccounts' + (recursive ? 'Recursive' : '')](account, true);
        return acc ? true : false;
    }

    get id() {
        return this.#json.AccId;
    }

    get isAdmin() {
        return this.#json.IsAdmin;
    }

    get isNew() {
        return this.#json.IsNew;
    }

    get name() {
        return this.#json.Name;
    }

    set name(value) {
        this.#json.Name = value;
    }

    get objectType() {
        return Account.objectType;
    }

    parentAccounts(account, has) {
        if (account == undefined) {
            return this._accountsList('ParentAccountsList', 'parentAccounts');
        } else {
            return this._accountsGet('parentAccounts', account, has);
        }
    }

    parentAccountsAdd(accounts) {
        var accs = Array.isArray(accounts) ? accounts : [accounts];
        var url = 'accounts/' + this.id + '/parentAccounts';
        return this.session.restClient.fetch(url, 'PUT', accs, 'arrayParentAccounts');    
    }

    parentAccountsRecursive(account, has) {
        if (account == undefined) {
            return this._accountsList('ParentAccountsRecursive', 'parentAccountsRecursive');
        } else {
            return this._accountsGet('parentAccountsRecursive', account, has);
        }
    }

    parentAccountsRemove(accounts) {
        var accs = Array.isArray(accounts) ? accounts : [accounts];
        var url = 'accounts/' + this.id + '/parentAccounts';
        return this.session.restClient.fetch(url, 'DELETE', accs, 'arrayParentAccounts');    
    }

    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    save() {
        var me = this;
        return new Promise((resolve, reject) => {
            var type = me instanceof User ? 'user' : 'account';
            var url, method;
            if (me.isNew || me.id == undefined) {
                url = type + 's';
                method = 'PUT';
            } else {
                url = type + 's/' + me.id;
                method = 'POST';
            }
            me.session.restClient.fetch(url, method, me.toJSON(), type).then(
                res => {
                    me.#json = res;
                    resolve(me);
                },
                reject
            )
        })
    }

    get session() {
        return this.#session;
    }

    get system() {
        return this.#json.System;
    }

    get tags() {
        if (!this.#json.Tags) this.#json.Tags = {};
        return this.#json.Tags;
    }

    toJSON() {
        return this.#json;
    }

    get type() {
        return this.#json.Type;
    }

    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }
}


class Application {
    #parent;
    #rootFolder;

    constructor(parent) {
        this.#parent = parent
    }

    folders(folderPath) {
        return this.session.folder(folderPath, this.rootFolderId);
    }

    get parent() {
        return this.#parent;
    }

    get rootFolder() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#rootFolder) {
                me.session.folder(me.rootFolderId).then(
                    res => {
                        me.#rootFolder = res;
                        resolve(res);
                    },
                    reject
                );
            } else {
                resolve(me.#rootFolder);
            }
        })
    }

    get rootFolderId() {
        return this.#parent.toJSON().RootFolderId;
    }

    get session() {
        return this.parent.session;
    }
}


class Attachment {
    static objectType = 7;
    #parent; // Document
    #json;
    #properties;
    #userProperties;

    constructor(attachment, document) {
        this.#json = attachment;
        this.#parent = document;
    }

    get created() {
        return this.#json.Created;
    }

    get description() {
        return this.#json.Description;
    }

    set description(value) {
        if (!this.isNew) throw new Error('Read-only property');
        this.#json.Description = value;
    }

    get extension() {
        return this.#json.Extension;
    }

    set extension(value) {
        if (!this.isNew) throw new Error('Read-only property');
        this.#json.Extension = value;
    }

    get external() {
        return this.#json.External;
    }

    set external(value) {
        if (!this.isNew) throw new Error('Read-only property');
        this.#json.External = value;
    }

    get fileStream() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#json.File) {
                var url = 'documents/' + me.parent.id + '/attachments/' + me.id;
                me.session.restClient.fetchBuff(url, 'GET', '').then(
                    res => {
                        me.#json.File = res;
                        resolve(res);
                    },
                    reject
                )

            } else {
                resolve(me.#json.File);
            }
        });
    }

    set fileStream(value) {
        if (!this.isNew) throw new Error('Read-only property');
        this.#json.File = value;
    }

    get group() {
        return this.#json.group;
    }

    set group(value) {
        if (!this.isNew) throw new Error('Read-only property');
        this.#json.group = value;
    }

    get id() {
        return this.#json.AttId;
    }

    get isNew() {
        return this.#json.IsNew;
    }

    set isNew(value) {
        this.#json.IsNew = value;
    }

    get name() {
        return this.#json.Name;
    }

    get objectType() {
        return Attachment.objectType;
    }

    get owner() {
        //todo: retornar account
    }

    get ownerId() {
        return this.#json.AccId
    }

    get ownerName() {
        return this.#json.AccName
    }

    get parent() {
        return this.#parent;
    }

    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    get removed() {
        return this.#json.Removed;
    }

    remove() {
        this.#json.Removed = true;
    }

    get session() {
        return this.parent.session;
    }

    get size() {
        return this.#json.Size;
    }

    get tags() {
        if (!this.#json.Tags) this.#json.Tags = {};
        return this.#json.Tags;
    }

    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }
}

class Database {
    #session;
    
    constructor(session) {
        this.#session = session;
    }

    nextVal(sequence) {
        // todo
    }

    // Alias de sqlEncode
    sqlEnc(value, type) {
        return this.sqlEncode(value, type);
    }

    sqlEncode(value, type) {
        if (value == null) {
            return 'NULL';
        } else {
            if (type == 1) {
                return '\'' + value.replaceAll('\'', '\'\'') + '\'';
    
            } else if (type == 2) {
                var ret = this.session.utils.isoDate(value);
                if (ret == null) {
                    return 'NULL';
                } else {
                    return '\'' + ret + ' ' + this.session.utils.isoTime(value, true) + '\''; 
                }
    
            } else if (type == 3) {
                if (typeof value == 'number') {
                    return value.toString();
                } else {
                    var n = this.session.utils.cNumber(value);
                    if (n != null) {
                        return n.toString();
                    } else {
                        return 'NULL';
                    }
                };
    
            } else {
                throw 'Unknown type: ' + type;
            }
        };
    }
    
    get session() {
        return this.#session;
    }

    setVal(sequence, value) {
        // todo
    }
}

class Directory {
    #session;
    
    constructor(session) {
        this.#session = session;
    }

    accounts(account) {
        var me = this;
        return new Promise((resolve, reject) => {
            var url;
            if (isNaN(parseInt(account))) {
                url = 'accounts?accName=' + encURIC(account);
            } else {
                url = 'accounts?accIds=' + account;
            }
            me.session.restClient.fetch(url, 'GET', '', '').then(
                res => {
                    if (res.length == 0) {
                        reject(new Error('Account not found'));
                    } else if (res.length > 1) {
                        reject(new Error('Vague expression'));
                    } else {
                        resolve(new Account(res[0], me.session));
                    }
                },
                reject
            )
        });
    }

    accountsNew(type) {
        var me = this;
        return new Promise((resolve, reject) => {
            var url;
            if (type == 1) {
                url = 'users/new';
            } else if (type == 2) {
                url = 'groups/new';
            } else {
                reject(new Error('Invalid account type'));
            }

            me.session.restClient.fetch(url, 'GET', '', '').then(
                res => {
                    if (type == 1) {
                        resolve(new User(res, me.session));
                    } else if (type == 2) {
                        resolve(new Account(res, me.session));
                    }
                },
                reject
            )
        })
    }

    accountsSearch(filter, order) {
        let url = '/accounts/search?filter=' + encURIC(filter) + '&order=' + encURIC(order);
        return this.session.restClient.fetch(url, 'GET', '', '');
    }

    get session() {
        return this.#session;
    }
};


export class Document {
    static objectType = 2;
    #parent;
    #session;
    #json;
    #fieldsMap;
    #attachmentsMap;
    #properties;
    #userProperties;

    constructor(document, session, folder) {
        this.#json = document;
        this.#session = session;
        if (folder) this.#parent = folder;
        this.#attachmentsMap = new DoorsMap();
        this.#attachmentsMap._loaded = false;
    }

    aclGrant(account, access) {
        var url = 'documents/' + this.id + '/acl/' + access + '/grant/' + account;
        return this.session.restClient.fetch(url, 'POST', {}, '');
    }

    aclRevoke(account, access) {
        var url = 'documents/' + this.id + '/acl/' + access + '/revoke/' + account;
        return this.session.restClient.fetch(url, 'DELETE', {}, '');
    }

    aclRevokeAll(account) {
        var url = 'documents/' + this.id + '/acl/revokeAll';
        if (account) {
            // Si viene account es un revokeAll para esa cuenta
            url += '/' + account;
        }
        return this.session.restClient.fetch(url, 'DELETE', {}, '');
    }

    attachments(attachment) {
        var me = this;
        return new Promise((resolve, reject) => {
            if (attachment) {
                me.attachments().then(
                    res => {
                        if (res.has(attachment)) {
                            resolve(res.get(attachment));
                        } else {
                            reject(new Error('Attachment not found: ' + attachment));
                        }
                    },
                    reject
                )

            } else {
                // Devuelve la coleccion
                if (!me.#attachmentsMap._loaded) {
                    var url = 'documents/' + me.id + '/attachments';
                    me.session.restClient.fetch(url, 'GET', '', '').then(
                        res => {
                            if (res.length > 0) {
                                // Ordena descendente
                                res.sort(function (a, b) {
                                    return a.AttId >= b.AttId ? -1 : 1;
                                });
                            }
                            // Arma un array de AccId
                            var ids = res.map(att => att.AccId);
                            // Saca los repetidos
                            ids = ids.filter((el, ix) => ids.indexOf(el) == ix);
                            // Levanta los accounts y completa el nombre
                            me.session.directory.accountsSearch('acc_id in (' + ids.join(',') + ')').then(
                                accs => {
                                    res.forEach(el => {
                                        //todo: aca se podria setear un objecto account en vez del name solo
                                        el.AccName = accs.find(acc => acc['AccId'] == el.AccId)['Name'];
                                        me.#attachmentsMap.set(el.Name, new Attachment(el, me));
                                    });
                                    me.#attachmentsMap._loaded = true;
                                    resolve(me.#attachmentsMap);
        
                                }, reject
                            )
                        }, reject
                    );

                } else {
                    resolve(me.#attachmentsMap);
                }
            }
        });
    }

    attachmentsAdd(name) {
        if (!name) throw new Error('name is required');

        var att = new Attachment({
            Name: name,
            IsNew: true,
        }, this);

        this.#attachmentsMap.set(name, att);
        return att;
    }

    delete(purge) {
        var me = this;
        var url = 'folders/' + me.parentId + '/documents/?tobin=' + 
            encURIC(purge == true ? false : true);
        return me.session.restClient.fetch(url, 'DELETE', [me.id], 'docIds');
        //todo: en q estado queda el objeto?
    }

    get id() {
        return this.#json.DocId;
    }

    fields(name, value) {
        var me = this;

        if (name) {
            // Devuelve un field
            var field;
            field = me.#json.CustomFields.find(it => it['Name'].toLowerCase() == name.toLowerCase());
            if (!field) field = me.#json.HeadFields.find(it => it['Name'].toLowerCase() == name.toLowerCase());
            if (field) {
                var ret = new Field(field, me);
                if (value != undefined) ret.value = value;
                return ret;
            } else {
                throw new Error('Field not found: ' + name);
            }

        } else {
            // Devuelve la coleccion
            if (!me.#fieldsMap) {
                var map = new DoorsMap();
                me.#json.HeadFields.forEach(el => {
                    map.set(el.Name, new Field(el, me.session));
                });
                me.#json.CustomFields.forEach(el => {
                    map.set(el.Name, new Field(el, me.session));
                });
                me.#fieldsMap = map;
            }
            return me.#fieldsMap;
        }
    }

    get folder() {
        return this.parent
    }

    get folderId() {
        return this.parentId
    }

    get isNew() {
        return this.#json.IsNew;
    }

    get objectType() {
        return Document.objectType;
    }

    get parent() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#parent) {
                me.session.folder(me.parentId).then(
                    res => {
                        me.#parent = res;
                        resolve(res);
                    },
                    reject
                );
            } else {
                resolve(me.#parent);
            }
        });
    }

    get parentId() {
        return this.#json.HeadFields.find(it => it.Name == 'FLD_ID').Value;
    }

    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    save() {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'documents';
            me.session.restClient.fetch(url, 'PUT', me.#json, 'document').then(
                res => {
                    // Esta peticion se hace xq la ref q vuelve del PUT no esta actualizada (issue #237)
                    var url = 'documents/' + me.id;
                    me.session.restClient.fetch(url, 'GET', '', '').then(
                        res => {
                            me.#json = res;
                            saveAttachs(resolve, reject);
                        },
                        reject
                    )
                },
                reject
            );

            function saveAttachs(resolve, reject) {
                var proms = [];
                var rm = [];
                var attMap = me.#attachmentsMap;

                me.session.utils.asyncLoop(attMap.size, async loop => {
                    var key = Array.from(attMap.keys())[loop.iteration()];
                    var el = attMap.get(key);      

                    if (el.isNew) {
                        var formData = new FormData();
                        // todo: como subimos el Tag?
                        var arrBuf = await el.fileStream;
                        formData.append('attachment', new Blob([arrBuf]), el.name);
                        formData.append('description', el.description); // todo probar
                        //formData.append('group', el.group);
                        var url = 'documents/' + me.id + '/attachments';
                        proms.push(me.session.restClient.fetchBuff(url, 'POST', formData));

                    } else if (el.removed) {
                        rm.push(el.id);
                    }
                    loop.next();

                }, () => {
                    if (rm.length > 0) {
                        var url = 'documents/' + me.id + '/attachments';
                        proms.push(me.session.restClient.fetch(url, 'DELETE', rm, 'arrayAttId'));
                    }
    
                    Promise.all(proms).then(
                        res => {
                            //todo: actualizar el json de los attachs

                            attMap.forEach((el, key) => {
                                if (el.removed) {
                                    attMap.delete(key)
                                } else if (el.isNew) {
                                    el.isNew = false;
                                }
                            });

                            resolve(me)
                        },
                        err => {
                            debugger;
                            console.error(err);
                            reject(err);
                        }
                    )
                })
            }
        })
    }

    get session() {
        return this.#session;
    }

    subject() {
        return this.fields('subject').value;
    }

    get tags() {
        if (!this.#json.Tags) this.#json.Tags = {};
        return this.#json.Tags;
    }

    toJSON() {
        return this.#json;
    }

    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }
};


class Field {
    static objectType = 5;
    #parent; // Document / Form
    #json;
    #properties;
    #userProperties;

    constructor(field, document) {
        this.#json = field;
        this.#parent = document;
    }

    get computed() {
        return this.#json.Computed;
    }

    get custom() {
        return this.#json.Custom;
    }

    get description() {
        return this.#json.Description;
    }

    get descriptionRaw() {
        return this.#json.DescriptionRaw;
    }

    get formId() {
        return this.#json.Id;
    }

    get headerTable() {
        return this.#json.HeaderTable;
    }

    get length() {
        return this.#json.Length;
    }

    get name() {
        return this.#json.Name;
    }

    get nullable() {
        return this.#json.Nullable;
    }

    get objectType() {
        return Field.objectType;
    }

    get parent() {
        return this.#parent;
    }

    get precision() {
        return this.#json.Precision;
    }

    // todo: solo para form, add o remove igual
    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    get scale() {
        return this.#json.Scale;
    }

    get session() {
        return this.parent.session;
    }

    get type() {
        return this.#json.Type;
    }

    get updatable() {
        return this.#json.Updatable;
    }

    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }

    get value() {
        return this.#json.Value;
    }

    set value(value) {
        if (!this.updatable || this.computed) throw new Error('Field not updatable: ' + this.name);
        if (!value && !this.nullable) throw new Error('Field not nullable: ' + this.name);
        this.#json.Value = value;
        this.valueChanged; // Para actualizar valueChanged en el JSON
    }

    get valueChanged() {
        this.#json.ValueChanged = (this.#json.Value !== this.#json.ValueOld);
        return this.#json.ValueChanged;
    }

    get valueOld() {
        return this.#json.ValueOld;
    }
};


export class Folder {
    static objectType = 3;
    #json;
    #session;
    #app;
    #parent;
    #properties;
    #userProperties;

    constructor(folder, session, parent) {
        this.#json = folder;
        this.#session = session;
        if (parent) this.#parent = parent;
    }

    get app() {
        if (!this.#app) {
            this.#app = new Application(this);
        }
        return this.#app;
    }

    // Alias de documentsDelete
    delete(documents, purge) {
        return this.documentsDelete(documents, purge);
    }

    // Alias de documents
    doc(document) {
        return this.documents(document);
    }
    
    documents(document) {
        var me = this;
        return new Promise(async (resolve, reject) => {
            var res, docId;

            if (isNaN(document)) {
                res = await me.search({ fields: 'doc_id', formula: document });

                if (res.length == 0) {
                    reject(new Error('Document not found'));
                } else if (res.length > 1) {
                    reject(new Error('Vague expression'));
                } else {
                    docId = res[0]['DOC_ID'];
                }

            } else {
                docId = document;
            }

            let url = 'documents/' + docId;
            me.session.restClient.fetch(url, 'GET', '', '').then(
                res => {
                    resolve(new Document(res, me.session, me));
                },
                reject
            )
        });
    }

    documentsDelete(documents, purge) {
        if (!isNaN(parseInt(documents)) || Array.isArray(documents)) {
            var url = 'folders/' + this.id + '/documents/?tobin=' + 
                encURIC(purge == true ? false : true);
            return this.session.restClient.fetch(url, 'DELETE', 
                Array.isArray(documents) ? documents : [documents], 'docIds');

        } else {
            var url = 'folders/' + this.id + '/documents/' + encURIC(documents);
            return this.session.restClient.fetch(url, 'DELETE', {}, '');
        }
    }

    documentsNew() {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'folders/' + me.id + '/documents/new';
            me.session.restClient.fetch(url, 'GET', '', '').then(
                res => {
                    resolve(new Document(res, me.session, me));
                },
                reject
            );
        })
    }

    folders(name) {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'folders/' + me.id + '/children?foldername=' + encURIC(name);
            me.session.restClient.fetch(url, 'GET', '', '').then(
                res => {
                    resolve(new Folder(res, me.session, me));
                },
                reject
            )    
        });
    }

    get folderType() {
        return this.type;
    }

    get form() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#json.Form) {
                var url = 'forms/' + me.#json.FrmId;
                me.session.restClient.fetch(url, 'GET', '', '').then(
                    res => {
                        me.#json.Form = res;
                        resolve(new Form(res, me.session));
                    }
                ),
                reject
            } else {
                resolve(new Form(me.#json.Form, me.session));
            }
        });
    }

    get id() {
        return this.#json.FldId;
    }

    // Alias de documentsNew
    newDoc() {
        return this.documentsNew();
    }

    get objectType() {
        return Folder.objectType;
    }

    get parent() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (me.#parent) {
                resolve(me.#parent);
            } else {
                if (me.#json.ParentFolder) {
                    me.session.folder(me.#json.ParentFolder).then(
                        res => {
                            me.#parent = res;
                            resolve(res);
                        },
                        reject
                    )
                } else {
                    resolve(null);
                }
            }
        });
    }

    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    // options: { fields, formula, order, maxDocs, recursive, maxTextLength }
    search(options) {
        var opt = {
            fields: '',
            formula: '',
            order: '',
            maxDocs: 1000,
            recursive: false,
            maxTextLen: 100,
        };
        Object.assign(opt, options);

        var url = 'folders/' + this.id + '/documents';
        var params = 'fields=' + encURIC(opt.fields) + '&formula=' + encURIC(opt.formula) + 
            '&order=' + encURIC(opt.order) + '&maxDocs=' + encURIC(opt.maxDocs) + 
            '&recursive=' + encURIC(opt.recursive) + '&maxDescrLength=' + encURIC(opt.maxTextLen);

        return this.session.restClient.fetch(url, 'GET', params, '');
    }

    // options: { groups, totals, formula, order, maxDocs, recursive, groupsOrder, totalsOrder }
    searchGroups(options) {
        var opt = {
            groups: undefined,
            totals: '',
            formula: '',
            order: '',
            maxDocs: '',
            recursive: false,
            groupsOrder: '',
            totalsOrder: '',
        }
        Object.assign(opt, options);

        var url = 'folders/' + this.id + '/documents/grouped';
        var params = 'groups=' + encURIC(opt.groups) + '&totals=' + encURIC(opt.totals) +
            '&formula=' + encURIC(opt.formula) + '&order=' + encURIC(opt.order) + 
            '&maxDocs=' + encURIC(opt.maxDocs) + '&recursive=' + encURIC(opt.recursive) + 
            '&groupsOrder=' + encURIC(opt.groupsOrder) + '&totalsOrder=' + encURIC(opt.totalsOrder);

        return this.session.restClient.fetch(url, 'GET', params, '');
    }

    get session() {
        return this.#session;
    }

    get tags() {
        if (!this.#json.Tags) this.#json.Tags = {};
        return this.#json.Tags;
    }

    toJSON() {
        return this.#json;
    }

    get type() {
        return this.#json.Type;
    }

    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }
};


class Form {
    static objectType = 1;
    #json;
    #session;
    #fieldsMap;
    #properties;
    #userProperties;

    constructor(form, session) {
        this.#json = form;
        this.#session = session;
    }

    get description() {
        return this.#json.Description;
    }

    fields(field) {
        var me = this;

        if (field) {
            // Devuelve un field
            var field;
            field = me.#json.Fields.find(it => it['Name'].toLowerCase() == field.toLowerCase());
            if (field) {
                return new Field(field, me);
            } else {
                throw new Error('Field not found: ' + field);
            }

        } else {
            // Devuelve la coleccion
            if (!me.#fieldsMap) {
                var map = new DoorsMap();
                me.#json.Fields.forEach(el => {
                    map.set(el.Name, new Field(el, me.session));
                });
                me.#fieldsMap = map;
            }
            return me.#fieldsMap;
        }
    }

    get name() {
        return this.#json.Name;
    }

    get objectType() {
        return Form.objectType;
    }

    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    get session() {
        return this.#session;
    }

    get tags() {
        if (!this.#json.Tags) this.#json.Tags = {};
        return this.#json.Tags;
    }

    toJSON() {
        return this.#json;
    }

    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }
};


class Properties extends DoorsMap {
    #parent;
    #user;
    #restUrl;
    #loadProm;

    constructor(parent, user) {
        super();
        var me = this;
        this.#parent = parent;
        this.#user = user ? true : false;

        var restArgs = { objType: parent.objectType };

        if (parent instanceof Field) {
            restArgs.objId = parent.parent.id;
            restArgs.objName = parent.name;
        } else {
            restArgs.objId = parent.id;
            restArgs.objName = '';
        }

        if (parent instanceof View) {
            restArgs.objParentId = parent.parent.id;
        } else {
            restArgs.objParentId = '';
        }

        this.#restUrl = (this.user ? 'user' : '') + 'properties?objectId=' + restArgs.objId + 
            '&objectType=' + restArgs.objType + '&objectParentId=' + restArgs.objParentId + 
            '&objectName=' + encURIC(restArgs.objName);

        this.#loadProm = this.session.restClient.fetch(this.#restUrl, 'GET', '', '');
        this.#loadProm.then(
            res => {
                res.forEach(el => {
                    var prop = new Property(el, me);
                    super.set(prop.name, prop);
                })
            },
            err => {
                throw err;
            }
        )
    }

    delete(key) {
        var me = this;
        return new Promise((resolve, reject) => {
            me.#loadProm.then(
                () => {
                    if (me.has(key)) {
                        var prop = super.get(key);
                        super.delete(key);
                        me.session.restClient.fetch(me.restUrl, 'DELETE', [prop.toJSON()], 'arrProperties')
                            .then(resolve, reject);
                    } else {
                        resolve(false);
                    }
                },
                reject
            )
        });
    }

    get(key) {
        var me = this;
        return new Promise((resolve, reject) => {
            me.#loadProm.then(
                () => { resolve(super.get(key)) },
                reject
            )
        });
    }

    get parent() {
        return this.#parent;
    }

    get restUrl() {
        return this.#restUrl;
    }

    get session() {
        return this.parent.session;
    }

    set(key, value) {
        if (key == undefined) {
            return this; // La coleccion
        } else if (value == undefined) {
            return this.get(key).value; // El value
        } else {
            var me = this;
            return new Promise((resolve, reject) => {
                me.#loadProm.then(
                    () => {
                        var prop;
                        if (super.has(key)) {
                            prop = super.get(key);
                        } else {
                            var prop = new Property({ name: key }, me);
                            super.set(key, prop);
                        }
                        prop.value(value).then(resolve, reject);
                    },
                    reject
                )
            });
        }
    }

    get user() {
        return this.#user;
    }
}


class Property {
    #parent;
    #json;

    constructor(property, parent) {
        this.#json = property;
        this.#parent = parent;
    }

    get created() {
        return this.#json.Created;
    }

    get modified() {
        return this.#json.Modified;
    }

    get name() {
        return this.#json.Name;
    }

    get parent() {
        return this.#parent;
    }

    get session() {
        return this.parent.session;
    }

    toJSON() {
        return this.#json;
    }

    get value() {
        
    }

    value(value) {
        if (value == undefined) {
            return this.#json.Value;
        } else {
            var me = this;
            return new Promise((resolve, reject) => {
                if (this.value != value) {
                    this.#json.Value = value;
                    this.session.restClient.fetch(this.parent.restUrl, 'PUT', [this.#json], 'arrProperties')
                        .then(resolve, reject);
                } else {
                    resolve(true);
                }
            })
        }
    }
}


class User extends Account {
    get adfsLogon() {
        return this.toJSON().AdfsLogon;
    }

    set adfsLogon(value) {
        this.toJSON().AdfsLogon = value;
    }

    get business() {
        return this.toJSON().Business;
    }

    set business(value) {
        this.toJSON().Business = value;
    }

    get canNotChangePwd() {
        return this.toJSON().CanNotChangePwd;
    }

    set canNotChangePwd(value) {
        this.toJSON().CanNotChangePwd = value;
    }

    get changePwdNextLogon() {
        return this.toJSON().ChangePwdNextLogon;
    }

    set changePwdNextLogon(value) {
        this.toJSON().ChangePwdNextLogon = value;
    }

    get disabled() {
        return this.toJSON().Disabled;
    }

    set disabled(value) {
        this.toJSON().Disabled = value;
    }

    get fullName() {
        return this.toJSON().FullName;
    }

    set fullName(value) {
        this.toJSON().FullName = value;
    }

    get gestarLogon() {
        return this.toJSON().GestarLogon;
    }

    set gestarLogon(value) {
        this.toJSON().GestarLogon = value;
    }

    get hasApiKey() {
        return this.toJSON().HasApiKey;
    }

    set hasApiKey(value) {
        this.toJSON().HasApiKey = value;
    }

    get language() {
        return this.toJSON().LngId;
    }

    set language(value) {timeDiff
        this.toJSON().LngId = value;
    }

    get ldapLogon() {
        return this.toJSON().LDAPLogon;
    }

    set ldapLogon(value) {timeDiff
        this.toJSON().LDAPLogon = value;
    }

    get ldapServer() {
        return this.toJSON().LDAPServer;
    }

    set ldapServer(value) {timeDiff
        this.toJSON().LDAPServer = value;
    }

    get login() {
        return this.toJSON().Login;
    }

    set login(value) {
        this.toJSON().Login = value;
    }

    get password() {
        return this.toJSON().Password;
    }

    set password(value) {
        this.toJSON().Password = value;
    }

    get phone() {
        return this.toJSON().Phone;
    }

    set phone(value) {
        this.toJSON().Phone = value;
    }

    get pictureProfile() {
        return this.toJSON().PictureProfile;
    }

    set pictureProfile(value) {
        this.toJSON().PictureProfile = value;
    }

    get pwdChanged() {
        return this.toJSON().PwdChanged;
    }

    set pwdChanged(value) {
        this.toJSON().PwdChanged = value;
    }

    get pwdNeverExpires() {
        return this.toJSON().PwdNeverExpires;
    }

    set pwdNeverExpires(value) {
        this.toJSON().PwdNeverExpires = value;
    }

    get theme() {
        return this.toJSON().Theme;
    }

    set theme(value) {
        this.toJSON().Theme = value;
    }

    get timeDiff() {
        return this.toJSON().TimeDiff;
    }

    set timeDiff(value) {
        this.toJSON().TimeDiff = value;
    }

    get winLogon() {
        return this.toJSON().WinLogon;
    }

    set winLogon(value) {
        this.toJSON().WinLogon = value;
    }
}


class Utilities {
    #session;
    #cache;
    
    constructor(session) {
        this.#session = session;
        this.#cache = [];
    }

    /*
    Loop asincrono, utilizar cuando dentro del loop tengo llamadas asincronas
    que debo esperar antes de realizar la prox iteracion. Si en iterations
    paso undefined, se repite el loop hasta loop.break()

    asyncLoop(10,
        function (loop) {
            console.log(loop.iteration());
            setTimeout(function () {
                loop.next();
            }, 0);
            
            //loop.break(); // Para finalizar el loop
        },
        function() {
            console.log('cycle ended')
        }
    );
    */
    asyncLoop(iterations, loopFunc, callback) {
        var index = 0;
        var done = false;
        var loop = {
            next: function() {
                if (done) return;
        
                if (iterations == undefined || index < iterations) {
                    index++;
                    loopFunc(loop);
                } else {
                    done = true;
                    if (callback) callback();
                }
            },
        
            iteration: function() {
                return index - 1;
            },
        
            break: function() {
                done = true;
                if (callback) callback();
            }
        };
        loop.next();
        return loop;
    }

    /*
    Cache de uso gral
    dSession.cache('myKey', myValue, 60); // Almacena por 60 segundos
    myVar = dSession.cache('myKey'); // Obtiene el valor almacenado en el cache, devuelve undefined si no esta o expiro
    */
    cache(key, value, seconds) {
        let f = this.#cache.find(el => el.key == key);
        if (value == undefined) { // get
            if (f) {
                if (!f.expires || f.expires > Date.now()) {
                    console.log('Cache hit: ' + key);
                    return f.value;
                }
            }
        } else { // set
            var exp, sec = parseInt(seconds);
            if (!isNaN(sec)) {
                exp = Date.now() + sec * 1000;
            } else {
                exp = Date.now() + 300000; // 5' por defecto
            }
            if (f) {
                f.value = value;
                f.expires = exp;
            } else {
                this.#cache.push({ key: key, value: value, expires: exp });
            }
        }
    }

    // Convierte a Date
    cDate(date) {
        var dt;
        if (Object.prototype.toString.call(date) === '[object Date]') {
            dt = date;
        } else {
            dt = _moment(date, 'L LTS').toDate();
            if (isNaN(dt.getTime())) dt = new Date(date);
        }
        if(!isNaN(dt.getTime())) {
            return dt;
        } else {
            return null;
        }
    }

    // Alias de cNumber
    cNum(number) {
        return this.cNumber(number);
    }

    // Convierte a Number
    cNumber(number) {
        var num;
        if (Object.prototype.toString.call(number) === '[object Number]') {
            num = number;
        } else {
            num = _numeral(number).value();
        }
        return num;
    }

    get cryptoJS() {
        return _CryptoJS;
    }

    decrypt(pString, pPass) {
	    return _CryptoJS.AES.decrypt(pString, pPass).toString(_CryptoJS.enc.Utf8);
	}

    deserializeError(err) {
        return _serializeError.deserializeError(err);
    }

    encrypt(pString, pPass) {
        return _CryptoJS.AES.encrypt(pString, pPass).toString();
    }

    // Recibe un err, lo convierte a Error, loguea y dispara
    errMgr(err) {
        var e = this.newErr(err);
        console.error(e);
        throw e;
    }
   
    // Devuelve el mensaje de un objeto err
    errMsg(err) {
        if (typeof(err) == 'string') {
            return err;
        } else if (typeof(err) == 'object') {
            if (err instanceof Error) {
                return err.constructor.name + ': ' + err.message;
            } else if (err.constructor.name == 'SQLError') {
                return 'SQLError {code: ' + err.code + ', message: \'' + err.message + '\'}';
            } else if (err.ExceptionMessage) {
                // error de Doors
                return err.ExceptionMessage;            
            } else if (err.xhr) {
                return 'XHRError (readyState: ' + err.xhr.readyState 
                    + ', status: ' + err.xhr.status + ' - ' + err.xhr.statusText + ')';
            }
        }
        return JSON.stringify(err);
    }

    get inNode() {
        return inNode();
    }

    // Devuelve la fecha en formato YYYY-MM-DD
    isoDate(date) {
        var dt = this.cDate(date);
        if (dt) {
            return dt.toISOString().substring(0, 10);
        } else {
            return null;
        }
    }

    // Devuelve la hora en formato HH:MM:SS
    isoTime(date, seconds) {
        var dt = this.cDate(date);
        if (dt) {
            return this.lZeros(dt.getHours(), 2) + ':' + this.lZeros(dt.getMinutes(), 2) +
                (seconds ? ':' + this.lZeros(dt.getSeconds(), 2) : '');
        } else {
            return null;
        }
    }

    // Completa con ceros a la izquierda
    lZeros(string, length) {
        return ('0'.repeat(length) + string).slice(-length);
    }
    
    get moment() {
        return _moment;
    }

    newDoorsMap() {
        return new DoorsMap();
    }

    newErr(err) {
        var e;
        if (err instanceof Error) {
            e = err;
        } else {
            e = new Error(this.errMsg(err));
        }
        return e;
    }

    get numeral() {
        return _numeral;
    }

    serializeError(err) {
        return _serializeError.serializeError(err);
    }

    get session() {
        return this.#session;
    }

    get timeZone() {
        var ret = '';
        var dif = new Date().getTimezoneOffset();
        if (dif == 0) {
            return 'Z';
        } else if (dif > 0) {
            ret += '-';
        } else {
            ret += '+';
        }
        
        dif = Math.abs(dif);
        var h = parseInt(dif / 60);
        ret += this.lZeros(h, 2) + ':' + this.lZeros(dif - (h * 60), 2);
    
        return ret;	
    }

    // Alias de xmlDecode
    xmlDec(value, type) {
        return this.xmlDecode(value, type);
    }

    xmlDecode(value, type) {
        var val;

        if (type == 1) {
            return value;

        } else if (type == 2) {
            return this.cDate(new Date(value.replace(' ', 'T') + this.timeZone));

        } else if (type == 3) {
            val = parseFloat(value);
            return isNaN(val) ? null : value;

        } else {
            throw 'Unknown type: ' + type;
        }
    }

    // Alias de xmlEncode
    xmlEnc(value, type) {
        return this.xmlEncode(value, type);
    }

    xmlEncode(value, type) {
        var val;

        if (type == 1) {
            return value ? value : '';

        } else if (type == 2) {
            val = this.isoDate(value);
            return val ? val + ' ' + this.isoTime(value, true) : '';

        } else if (type == 3) {
            val = this.cNum(value);
            return val ? val.toString() : '';

        } else {
            throw 'Unknown type: ' + type;
        }
    }
}


class View {
    static objectType = 4;
    #json;
    #parent;
    #session;
    #properties;
    #userProperties;

    constructor(view, session, folder) {
        this.#json = view;
        this.#session = session;
        if (folder) this.#parent = folder;
    }

    get objectType() {
        return View.objectType;
    }

    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    get tags() {
        if (!this.#json.Tags) this.#json.Tags = {};
        return this.#json.Tags;
    }

    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }
}


class RestClient {
    AuthToken = null;
    ServerBaseUrl = null;
    #session;

    constructor(serverUrl, authToken, session) {
        this.AuthToken = authToken;
        this.ServerBaseUrl = serverUrl;
        this.#session = session;
    }

    fetch(url, method, parameters, parameterName) {
        var me = this;
        let data = null;
        //TODO Check if ends with /
        let completeUrl = this.ServerBaseUrl + "/" + url;

        if (parameters !== undefined && parameters !== null) {
            //URL parameters
            if (Object.prototype.toString.call(parameters) === "[object String]") {
                var others = "";
                var nexus = "";
                if (parameters !== "") {
                    nexus = "?";
                    others = parameters;
                }
                completeUrl = completeUrl + nexus + others;
            } else {
                //Javascript parameters
                var restParam = this.constructJSONParameter(parameters, parameterName);
                data = restParam;
            }
        }

        return new Promise((resolve, reject) => {
            // Opciones por defecto estan marcadas con un *
            fetch(completeUrl, {
                method: method, // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'omit', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json',
                    'AuthToken': this.AuthToken
                },
                redirect: 'manual', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: data != null ? data : null // body data type must match "Content-Type" header
            }).then((response) => {
                //TODO
                /* var firstCharCode = body.charCodeAt(0);
                if (firstCharCode === 65279) {
                    //console.log('First character "' + firstChar + '" (character code: ' + firstCharCode + ') is invalid so removing it.');
                    body = body.substring(1);
                }*/

                response.text().then(function (textBody) {
                    let firstCharCode = textBody.charCodeAt(0);
                    if (firstCharCode === 65279) {
                        //console.log('First character "' + firstChar + '" (character code: ' + firstCharCode + ') is invalid so removing it.');
                        textBody = textBody.substring(1);
                    }
                    let parsedJson = JSON.parse(textBody);
                    if (response.ok) {
                        if (parsedJson.InternalObject !== null) {
                            resolve(parsedJson.InternalObject);
                        }
                    }
                    else {

                        if (response.statusCode !== 200 || parsedJson.ExceptionMessage !== null) {
                            reject(me.session.utils.newErr(parsedJson));
                        }
                    }
                    resolve(parsedJson);
                });
            }).catch((error) => {
                reject(me.session.utils.newErr(error));
            });
        });
    }

    fetchBuff(url, method, data) {
        var completeUrl = this.ServerBaseUrl + '/' + url;

        /* todo: implementar ApiKey
        if (Doors.RESTFULL.ApiKey != null) {
            xhr.setRequestHeader("ApiKey", Doors.RESTFULL.ApiKey);
        }
        else {
            xhr.setRequestHeader("AuthToken", this.AuthToken);
        }
        */

        return new Promise((resolve, reject) => {
            // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
            fetch(completeUrl, {
                method: method,
                cache: 'no-cache',
                headers: {
                    'AuthToken': this.AuthToken
                },
                body: data ? data : null,

            }).then(
                response => {
                    if (response.ok) {
                        response.arrayBuffer().then(
                            res => {
                                resolve(res);
                            },
                            reject
                        )
                        } else {
                            reject(new Error(response.status + ' (' + response.statusText + ')'))
                        }
                },
                err => {
                    reject(me.session.utils.newErr(err));
                }
            )
        });


    };

    get session() {
        return this.#session;
    }

    constructJSONParameter(param, parameterName) {
        var clone = param; 
        var paramName = param.ParameterName;
        if (param.ParameterName === undefined || param.ParameterName === undefined || param.ParameterName === null || param.ParameterName === "") {
            paramName = parameterName;
        }
        var stringParam = "{ \"" + paramName + "\": " + JSON.stringify(clone) + " }";
        if (paramName === "") {
            stringParam = JSON.stringify(clone);
        }
        return stringParam;
    }
};

function encURIC(value) {
    return (value == null || value == undefined) ? '' : encodeURIComponent(value);
}
