/*
Object model

Session
    Folders
        Documents
            Fields
            Attachments
        Views
        SubFolders
    Forms
        Fields
    Directory
        Accounts
            Users


swagger: http://w3.cloudycrm.net/apidocs
types para intelliSense: https://github.com/DefinitelyTyped/DefinitelyTyped
async constructors: https://dev.to/somedood/the-proper-way-to-write-async-constructors-in-javascript-1o8c
*/

var _mainlib, _moment, _numeral, _CryptoJS, _serializeError,
    _fastXmlParser, _URL, _htmlEntities, _contentDisposition, _incjs;

let serverTimeZone = 'America/Argentina/Cordoba';

export { _moment as moment };
export { _numeral as numeral };
export { _CryptoJS as CryptoJS };
export { _serializeError as serializeError }
export { _fastXmlParser as fastXmlParser }
export { _htmlEntities as htmlEntities }
export { _contentDisposition as contentDisposition }

const fileAtS3 = 'This file is at S3';

//await loadUtils();
var utilsPromise = loadUtils();
var utilsNotLoadedErr = `Utils not loaded, call 'await dSession.utils.load()' before.`

/*
todo: Safari soporta await at module top level recien en la v15
https://caniuse.com/?search=top%20level%20await
Cuando esta sea estandar reemplazar la linea anterior por:

await loadUtils();

Mientras tanto, si en algun metodo da error xq no esta el modulo esperar la promise asi:

await utilsPromise;
*/

async function loadUtils() {

    // mainlib

    try {
        if (inNode()) {
            if (typeof(ctx) == 'object' && ctx.mainlib) {
                _mainlib = ctx.mainlib;
            } else {
                let mod = await import('../mainlib.mjs');
                _mainlib = mod.default ? mod.default : mod;
            }
        }

    } catch(err) {
        console.error('Error loading mainlib', err);
    }


    // include

    try {
        if (!inNode()) {
            if (window.include === undefined) {
                var res = await fetch('https://cdn.cloudycrm.net/ghcv/cdn/include.js');
                var code = await res.text();
                eval(`
                    ${ code }
                    window.include = include;
                    window.scriptSrc = scriptSrc;
                    window.gitCdn = gitCdn;
                    window.ghCodeUrl = ghCodeUrl;
                `);
            }
        } else {
            _incjs = {};
            let code = await _mainlib.gitCdn({ repo: 'cdn', path: 'include.js' });
            eval(`
                ${ code }
                _incjs.include = include;
                _incjs.scriptSrc = scriptSrc;
                _incjs.gitCdn = gitCdn;
                _incjs.ghCodeUrl = ghCodeUrl;
            `);
        }

    } catch(err) {
        console.error('Error loading include', err);
    }


    // moment - https://momentjs.com/docs/

    try {
        if (inNode()) {
            res = await import('moment-timezone');
            _moment = res.default;
        } else {
            await include('lib-moment');
            await include('lib-moment-timezone');
            _moment = moment;
        }
        _moment.tz.setDefault(serverTimeZone);

    } catch(err) {
        console.error('Error loading moment', err);
    }


    // numeral - http://numeraljs.com/

    try {
        if (typeof(numeral) == 'undefined') {
            if (inNode()) {
                res = await import('numeral');
                await import('numeral/locales/es.js');
                _numeral = res.default;
            } else {
                await include('lib-numeral');
                await include('lib-numeral-locales');
                _numeral = numeral;
            }
        } else {
            _numeral = numeral;
        }

    } catch(err) {
        console.error('Error loading numeral', err);
    }


    // CryptoJS - https://code.google.com/archive/p/crypto-js/

    try {
        if (typeof(CryptoJS) == 'undefined') {
            if (inNode()) {
                res = await import('crypto-js');
                _CryptoJS = res.default;
            } else {
                await include('lib-cryptojs-aes');
                _CryptoJS = CryptoJS;
            }
        } else {
            _CryptoJS = CryptoJS;
        }

    } catch(err) {
        console.error('Error loading crypto-js', err);
    }


    // serialize-error - https://github.com/sindresorhus/serialize-error

    try {
        if (typeof(_serializeError) == 'undefined') {
            if (inNode()) {
                res = await import('serialize-error');
                _serializeError = res;
            } else {
                if (window.serializeError) {
                    _serializeError = window.serializeError;
                } else {
                    res = await import('https://cdn.jsdelivr.net/npm/serialize-error-cjs/+esm');
                    _serializeError = res.default;
                    window.serializeError = _serializeError;
                }
            }
        }

    } catch(err) {
        console.error('Error loading serialize-error', err);
    }


    // fast-xml-parser - https://github.com/NaturalIntelligence/fast-xml-parser

    try {
        if (typeof(_fastXmlParser) == 'undefined') {
            if (inNode()) {
                var res = await import('fast-xml-parser');
                _fastXmlParser = res.default;
            } else {
                if (window.fastXmlParser) {
                    _fastXmlParser = window.fastXmlParser;
                } else {
                    var res = await import('https://cdn.jsdelivr.net/npm/fast-xml-parser/+esm');
                    _fastXmlParser = res.default ? res.default : res;
                    window.fastXmlParser = _fastXmlParser;
                }
            }
        }

    } catch(err) {
        console.error('Error loading fast-xml-parser', err);
    }


    // html-entities - https://github.com/mdevils/html-entities

    try {
        if (inNode()) {
            if (typeof(_htmlEntities) == 'undefined') {
                var res = await import('html-entities');
                _htmlEntities = res.default;
            }
        }

    } catch(err) {
        console.error('Error loading html-entities', err);
    }


    // content-disposition - https://github.com/jshttp/content-disposition

    try {
        if (typeof(_contentDisposition) == 'undefined') {
            if (inNode()) {
                var res = await import('content-disposition');
                _contentDisposition = res.default;
            } else {
                if (window.contentDisposition) {
                    _contentDisposition = window.contentDisposition;
                } else {
                    var res = await import('https://cdn.jsdelivr.net/npm/content-disposition/+esm');
                    _contentDisposition = res.default;
                    window.contentDisposition = _contentDisposition;
                }
            }
        }

    } catch(err) {
        console.error('Error loading content-disposition', err);
    }


    // URL

    try {
        if (typeof(_URL) == 'undefined') {
            if (inNode()) {
                var res = (await import('url'));
                _URL = res.default.URL;
            } else {
                _URL = window.URL;
            }
        }

    } catch(err) {
        console.error('Error loading url', err);
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

    return true;
};


export function inNode() {
    return (typeof(window) == 'undefined' && typeof(process) != 'undefined');
}

/**
Map Case Insensitive
*/
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

    /** Alias de set */
    add(key, value) {
        return this.set(key, value);
    }

    delete(key) {
        return super.delete(this._parseKey(key));
    }

    /** Alias de has */
    exists(key) {
        return this.has(key);
    }

    /**
    Busca y retorna un elemento.
    @example
    map.find((value, key) => {
        if ... return true
    }
    */
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

    /** Alias de get */
    item(key) {
        return this.get(key);
    }

    /** Alias de size */
    get length() {
        return this.size;
    }

    /** Alias de delete */
    remove(key) {
        return this.delete(key);
    }

    set(key, value) {
        return super.set(this._parseKey(key), value);
    }
};


/*
Esta es una implementacion simplificada de la clase Buffer de node
Si hace falta algo mas completo usar https://github.com/feross/buffer

    await include('buffer', 'https://bundle.run/buffer@6.0.3');
    resolve(buffer.Buffer.from(await res.arrayBuffer()));
*/
export class SimpleBuffer extends Uint8Array {
    arrayBuffer() {
        return new Promise((resolve, reject) => {
            resolve(this.buffer);
        });
    }

    toString(encoding) {
        /*
        TODO: Hay que terminar de implementar los encodings, falta el start/end tb
        https://nodejs.org/api/buffer.html#buftostringencoding-start-end
        https://nodejs.org/api/buffer.html#buffers-and-character-encodings
        utf8/utf-8, utf16le/utf-16le, latin1, base64, base64url, hex, ascii, binary/latin1, ucs2/ucs-2/utf16le
        */
        let enc = encoding ? encoding.toLowerCase() : encoding;

        if (enc == 'base64') {
            // Ver: https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
            let bin = Array.from(this, (byte) => String.fromCodePoint(byte)).join('');
            return btoa(bin);

        } else {
            let td = new TextDecoder('utf-8');
            return td.decode(this);
        }
    }   
}


export class Session {
    #restClient;
    #v8Client;
    #directory;
    #serverUrl;
    #authToken;
    #apiKey;
    #db;
    #utils;
    #currentUser;
    #push;
    #instance;
    #node;
    #doorsVersion;
    #billing;
    
    constructor(serverUrl, authToken) {
        this.#restClient = new RestClient(this);
        this.#v8Client = new V8Client(this);
        this.#serverUrl = serverUrl;
        this.#authToken = authToken;
    }
    
    _reset() {
        this.#apiKey = undefined;
        this.#authToken = undefined;
        this.#currentUser = undefined;
        this.#instance = undefined;
        this.#utils = undefined;
        this.#doorsVersion = undefined;
        this.#billing = undefined;
    }

    async _userChange() {
        let me = this;

        await utilsPromise;
        _numeral.locale('es'); // es / en
        _numeral.defaultFormat('0,0.[00]');
        _moment.locale('es');
        _moment.tz.setDefault(serverTimeZone);

        if (await me.isLogged) {
            let usr = await me.currentUser;
            // if (usr.timeDiff != 0) // Que hago?
            // No coincide el utc del server con el del cliente, q hago?
            // if (_moment().utcOffset() != _moment().tz(serverTimeZone).utcOffset())
        };
    }

    /**
    @returns {string}
    */
    get apiKey() {
        return this.#apiKey;
    }
    set apiKey(value) {
        this._reset();
        this.#apiKey = value;
        this._userChange();
    }

    asyncEventsDisabled(value) {
        let url = 'session/asyncevents/disabled';
        if (value === undefined) {
            return this.restClient.fetch(url, 'GET', '', '');
        } else {
            return this.restClient.fetch(url + (value ? '/true' : '/false'), 'POST', {}, '');
        }
    };

    /**
    @returns {string}
    */
    get authToken() {
        return this.#authToken;
    }
    set authToken(value) {
        this._reset();
        this.#authToken = value;
        this._userChange();
    }

    get billing() {
        let me = this;
        return new Promise(async (resolve, reject) => {
            try {
                if (!me.#billing) {
                    let modBil = await me.import({ repo: 'Global', path: 'billing/billing.mjs' });
                    me.#billing = new modBil.Billing(me);
                }
                resolve(me.#billing);

            } catch(err) {
                reject(err);
            }
        });
    }

    /**
    Cambia la contraseña del usuario logueado.
    @returns {Promise}
    */
    async changePassword(login, oldPassword, newPassword, instance) {
        let me = this;
        let url = 'session/changepassword';

        let data = {
            login: login,
            oldPassword: oldPassword,
            newPassword: newPassword,
            instanceName: instance,
        };
        let ret = await this.restClient.fetch(url, 'POST', data, '');

        // Sacar esto cdo este resuelto el issue #2 del 2021 ...
        //await me.utils.execVbs(`dSession.Db.Execute "update SYS_ACC_USERS set PASSWORD = '" & dSession.Encrypt("${ newPassword}", "${ newPassword.reverse() }") & "' where ACC_ID = ${ (await me.currentUser).id }"`);
        
        return ret;
    };

    /**
    Devuelve el usuario logueado.
    @returns {Promise<User>}
    */
    get currentUser() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#currentUser) {
                var url = 'session/loggedUser';
                me.restClient.fetch(url, 'GET', '', '').then(
                    res => {
                        me.#currentUser = new User(res, me);
                        resolve(me.#currentUser);
                    },
                    reject
                )
            } else {
                resolve(me.#currentUser);
            }
        });
    }

    /**
    Metodos de base de datos.
    @returns {Database}
    */
    get db() {
        if (!this.#db) {
            this.#db = new Database(this);
        };
        return this.#db;
    }

    /** Alias de directory */
    get dir() {
        return this.directory;
    }

    /**
    Metodos de manejo del directorio.
    @returns {Directory}
    */
    get directory() {
        if (!this.#directory) {
            this.#directory = new Directory(this);
        };
        return this.#directory;
    }

    /** Alias de documentsGetFromId */
    doc(docId) {
        return this.documentsGetFromId(docId);
    }

    /** Alias de documentsGetFromId */
    document(docId) {
        return this.documentsGetFromId(docId);
    }

    /** Alias de documentsGetFromId */
    documents(docId) {
        return this.documentsGetFromId(docId);
    }

    /**
    Obtiene un documento por su doc_id.
    @returns {Promise<Document>}
    */
    documentsGetFromId(docId) {
        var me = this;
        return new Promise(async (resolve, reject) => {
            let url = 'documents/' + docId;
            me.restClient.fetch(url, 'GET', '', '').then(
                async res => {
                    let doc = new Document(res, me);
                    await doc._dispatchEvent('Document_Open');
                    resolve(doc);
                },
                reject
            )
        });
    }

    get doorsVersion() {
        var me = this;
        return new Promise(async (resolve, reject) => {
            if (me.#doorsVersion !== undefined) {
                resolve(me.#doorsVersion);

            } else {
                let url = 'doorsversion';
                me.restClient.fetch(url, 'GET', '', '').then(
                    async res => {
                        let ver = res.split('.');
                        ver.forEach((el, ix) => {
                            ver[ix] = me.utils.lZeros(el, 3);
                        });
                        me.#doorsVersion = ver.join('.');
                        resolve(me.#doorsVersion);
                    },
                    reject
                );
            }        
        });
    }

    /**
    Llama a foldersGetFromId o foldersGetFromPath (segun los parametros).
    Almacena en cache por 60 segs.
    @returns {Promise<Folder>}
    */
    folder(folder, curFolderId) {
        var key = 'folder|' + folder + '|' + curFolderId;
        var cache = this.utils.cache(key);
        if (cache === undefined) {
            if (!isNaN(parseInt(folder))) {
                cache = this.foldersGetFromId(folder);
            } else {
                cache = this.foldersGetFromPath(folder, curFolderId);
            }
            this.utils.cache(key, cache, 60); // Cachea por 60 segundos
        };
        return cache;
    }

    /** Alias de folder */
    folders(folder, curFolderId) {
        return this.folder(folder, curFolderId);
    }

    /**
    Retorna un folder por su fld_id.
    @returns {Promise<Folder>}
    */
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

    /**
    Retorna un folder por su path.
    Si curFolderId no se envia se asume 1001.
    @returns {Promise<Folder>}
    */
    foldersGetFromPath(fldPath, curFolderId) {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'folders/' + (curFolderId ? curFolderId : 1001) + '/children?folderpath=' + me.utils.encUriC(fldPath);
            me.restClient.fetch(url, 'GET', '', '').then(
                res => {
                    resolve(new Folder(res, me));
                },
                reject
            )
        })
    };

    /**
    Alias de utils.import
    */
    import(module) {
        return this.utils.import(module);
    };

    /**
    Retorna el arbol de carpetas.
    @returns {Promise<Object>}
    */
    /*
    foldersTree() {
        //todo
    }
    */

    /**
    Retorna la lista de formularios, o un formulario si especifico el id.
    @returns {Promise<DoorsMap>|Promise<Form>}
    */
    /*
    forms(id) {
        //todo
    }
    */

    /**
    Crea un nuevo formulario.
    @returns {Promise<Form>}
    */
    /*
    formsNew() {
        //todo
    }
    */

    /**
    searchForms As String, searchText As String, [Formula As String], [orderField As String], [orderDirection As DoorsOrderFieldDirection])
    */
    /*
    globalSearch(options) {
        //todo
    }
    */

    /**
    Retorna la instancia actual.
    @returns {Promise<Object>}
    { 
        AdfsLogon, Description, Disabled, GoogleLogon, InsId, 
        MaxConnections, Name, SupportedDomanis, Theme, WinLogon
    }
    */
    get instance() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#instance) {
                var url = 'instance';
                me.restClient.fetch(url, 'GET', '', '').then(
                    res => {
                        me.#instance = res;
                        resolve(me.#instance);
                    },
                    reject
                )
            } else {
                resolve(me.#instance);
            }
        });
    }

    /**
    Devuelve true si estoy logueado.
    @returns {Promise<boolean>}
    */
    get isLogged() {
        var url = 'session/islogged';
        return this.restClient.fetch(url, 'POST', {}, '');
    };

    /*
    get liteMode() {
        //todo
    }
    */

    /**
    Cierra la sesion.
    @returns {Promise}
    */
    logoff() {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'session/logoff';
            me.restClient.fetch(url, 'POST', {}, '').then(
                res => {
                    me._reset();
                    resolve(res);
                },
                reject
            )
        })
    };

    /**
    Inicia la sesion. Devuelve el authToken.
    @returns {Promise<string>}
    */
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

    /**
    Ejecucion de codigo en el servidor.
    @returns {Node}
    */
    get node() {
        if (!this.#node) {
            this.#node = new Node(this);
        };
        return this.#node;
    }

    /**
    Metodos para manejo de notificaciones push.
    @returns {Push}
    */
    get push() {
        if (!this.#push) {
            this.#push = new Push(this);
        };
        return this.#push;
    }

    /** Backward compat. Usar dSession.push.register. */
    pushRegistration(settings) {
        return this.push.register(settings);
    }

    /** Backward compat. Usar dSession.push.unreg. */
    pushUnreg(regType, regId) {
        return this.push.unreg(regType, regId);
    }

    get restClient() {
        return this.#restClient;
    }

    /**
    Devuelve o setea runSyncEventsOnClient.
    @returns {Promise}
    */
    runSyncEventsOnClient(value) {
        if (value === undefined) {
            var url = 'session/syncevents/runOnClient';
            return this.restClient.fetch(url, 'GET', '', '');
        } else {
            var url = 'session/syncevents/runOnClient/' + (value ? 'true' : 'false');
            return this.restClient.fetch(url, 'POST', {}, '');
        }
    }
    
    /**
    @returns {string}
    */
    get serverUrl() {
        return this.#serverUrl;
    }
    set serverUrl(value) {
        this._reset();
        this.#serverUrl = value;
    }

    /**
    Devuelve o setea un setting de instancia.
    @returns {Promise}
    */
    settings(setting, value) {
        var url = 'settings';
        var method, param, paramName;

        if (value === undefined) {
            url += '/' + this.utils.encUriC(setting);
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

    syncEventsDisabled(value) {
        let url = 'session/syncevents/disabled';
        if (value === undefined) {
            return this.restClient.fetch(url, 'GET', '', '');
        } else {
            return this.restClient.fetch(url + (value ? '/true' : '/false'), 'POST', {}, '');
        }
    };

    /**
    Devuelve o setea tags de session.
    @returns {Promise<Object>}
    */
    tags(key, value) {
        var me = this;
        return new Promise((resolve, reject) => {
            if (value === undefined) {
                // Devuelve
                var url = 'session/tags';
                me.restClient.fetch(url, 'GET', '', '').then(
                    res => {
                        if (key === undefined) {
                            resolve(res);
                        } else {
                            resolve(res[key]);
                        }
                    },
                    reject
                )
            } else {
                // Setea
                var url = 'session/tags';
                me.restClient.fetch(url, 'POST', { key, value }, '').then(
                    res => { resolve(res) },
                    reject
                )
            } 
        })
    }

    tagsAdd(key, value) {
        console.warn('Metodo deprecado, usar dSession.tags');
        return this.tags(key, value);
    }

    /**
    Agrega un token de sesion
    */
    async tokensAdd(token, value) {
        return this.utils.execVbs(`dSession.TokensAdd ${ this.utils.vbsEncodeString(token) }, ${ this.utils.vbsEncodeString(value) }`);
    }

    /**
    Borra un token de sesion
    */
    tokensDelete(token) {
        return this.utils.execVbs(`dSession.TokensDelete ${ this.utils.vbsEncodeString(token) }`);
    }

    /**
    Reemplaza los tokens de text
    @returns {Promise<string>}
    */
    tokensReplace(text) {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'session/tokens/replaced?text=' + encodeURIComponent(text ? text : '');
            me.restClient.fetch(url, 'POST', {}, '').then(
                res => { resolve(res) },
                reject
            )
        })
    }        

    /**
    Devuelve o setea un setting de usuario.
    @returns {Promise}
    */
    userSettings(setting, value) {
        var url = 'user/settings/' + this.utils.encUriC(setting);
        var method, param, paramName;

        if (value === undefined) {
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


    /**
    Metodos varios.
    @returns {Utilities}
    */
    get utils() {
        if (!this.#utils) {
            this.#utils = new Utilities(this);
        };
        return this.#utils;
    }

    get v8Client() {
        return this.#v8Client;
    }

    /**
    Obtiene serverUrl del window.location y authToken de las cookies.
    @returns {Promise<boolean>}
    */
    webSession() {
        var me = this;
        return new Promise(async (resolve, reject) => {
            me.serverUrl = window.location.origin + '/restful';

            let tkn = me.utils.cookie('AuthToken');
            if (tkn) {
                me.authToken = tkn;
                resolve(true);
            } else {
                try {
                    let res = await fetch('/c/tkn.asp');
                    let txt = await res.text();
                    if (txt.length < 70) { // Cdo no hay sesion viene el chorizazo del error
                        me.authToken = txt;
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } catch(err) {
                    reject(err);
                }
            }
        });
    }
};


export class Account {
    static objectType = 6;
    #json;
    #session;
    #properties;
    #userProperties;

    constructor(account, session) {
        this.#json = account;
        this.#session = session;
    }

    /** Metodo interno, no usar */
    _accountsGet(listFunction, account) {
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
                            //console.log('Account not found: ' + account);
                            resolve(undefined);
                        }
                    }
                },
                reject
            )
        });
    }

    /** Metodo interno, no usar */
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

    /** Metodo interno, no usar */
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

    /**
    Convierte a User
    @returns {User}
    */
    cast2User() {
        if (this.type == 1) {
            return new User(this.#json, this.#session);
        } else {
            throw new Error('User account required')
        }
    }

    /**
    @example
    childAccounts() // Devuelve un map de cuentas hijas.
    childAccounts(account) // Devuelve una cuenta hija. Puedo pasar name o id. Si no esta devuelve undefined.
    @returns {(Promise<Account>|Promise<DoorsMap>)}
    */
    childAccounts(account) {
        if (account === undefined) {
            return this._accountsList('ChildAccountsList', 'childAccounts');
        } else {
            return this._accountsGet('childAccounts', account);
        }
    }

    /**
    Agrega una o varias (array) cuentas hijas.
    @returns {Promise}
    */
    async childAccountsAdd(accounts) {
        var accs = Array.isArray(accounts) ? accounts : [accounts];
        var url = 'accounts/' + this.id + '/childAccounts';
        var res = await this.session.restClient.fetch(url, 'PUT', accs, 'arrayChildAccountIds');
        this.#json.ChildAccountsList = undefined;
        return res;
    }

    /**
    @example
    childAccountsRecursive() // Devuelve un map de cuentas hijas recursivo.
    childAccountsRecursive(account) // Devuelve una cuenta hija. Puedo pasar name o id. Si no esta devuelve undefined.
    @returns {(Promise<Account>|Promise<DoorsMap>)}
    */
    childAccountsRecursive(account) {
        if (account === undefined) {
            return this._accountsList('ChildAccountsRecursive', 'childAccountsRecursive');
        } else {
            return this._accountsGet('childAccountsRecursive', account);
        }
    }

    /**
    Quita una o varias cuentas hijas.
    @returns {Promise}
    */
    async childAccountsRemove(accounts) {
        var accs = Array.isArray(accounts) ? accounts : [accounts];
        var url = 'accounts/' + this.id + '/childAccounts';
        var res = await this.session.restClient.fetch(url, 'DELETE', accs, 'arrayChildAccountIds');
        this.#json.ChildAccountsList = undefined;
        return res;
    }

    /**
    Borra la cuenta.
    @returns {Promise}
    */
    delete(expropiateObjects) {
        var expObj = expropiateObjects ? true : false;
        var url = 'accounts/' + this.id + '?expropiateObjects=' + expObj;
        return this.session.restClient.fetch(url, 'DELETE', '', '');
    }

    /**
    @returns {string}
    */
    get description() {
        return this.#json.Description;
    }
    set description(value) {
        this.#json.Description = value;
    }

    /**
    @returns {string}
    */
    get email() {
        return this.#json.Email;
    }
    set email(value) {
        this.#json.Email = value;
    }

    /**
    Devuelve true si la tiene de hija. account puede ser name o id.
    @returns {Promise<boolean>}
    */
    async hasChild(account, recursive) {
        var acc = await this['childAccounts' + (recursive ? 'Recursive' : '')](account, true);
        return acc ? true : false;
    }

    /**
    Devuelve true si la tiene de padre. account puede ser name o id.
    @returns {Promise<boolean>}
    */
    async hasParent(account, recursive) {
        var acc = await this['parentAccounts' + (recursive ? 'Recursive' : '')](account, true);
        return acc ? true : false;
    }

    /**
    @returns {number}
    */
    get id() {
        return this.#json.AccId;
    }

    /**
    @returns {boolean}
    */
    get isAdmin() {
        return this.#json.IsAdmin;
    }

    /**
    @returns {boolean}
    */
    get isNew() {
        return this.#json.IsNew;
    }

    /**
    @returns {string}
    */
    get name() {
        return this.#json.Name;
    }
    set name(value) {
        this.#json.Name = value;
    }

    /**
    @returns {number}
    */
    get objectType() {
        return Account.objectType;
    }

    /**
    @example
    parentAccounts() // Devuelve un map de cuentas padre.
    parentAccounts(account) // Devuelve una cuenta padre. Puedo pasar name o id. Si no esta devuelve undefined.
    @returns {(Promise<Account>|Promise<DoorsMap>)}
    */
    parentAccounts(account) {
        if (account === undefined) {
            return this._accountsList('ParentAccountsList', 'parentAccounts');
        } else {
            return this._accountsGet('parentAccounts', account);
        }
    }

    /**
    Agrega una o varias cuentas padre.
    @returns {Promise}
    */
    async parentAccountsAdd(accounts) {
        var accs = Array.isArray(accounts) ? accounts : [accounts];
        var url = 'accounts/' + this.id + '/parentAccounts';
        var res = await this.session.restClient.fetch(url, 'PUT', accs, 'arrayParentAccounts');    
        this.#json.ParentAccountsList = undefined;
        return res;
    }

    /**
    @example
    parentAccountsRecursive() // Devuelve un map de cuentas padre recursivo.
    parentAccountsRecursive(account) // Devuelve una cuenta padre. Puedo pasar name o id. Si no esta devuelve undefined.
    @returns {(Promise<Account>|Promise<DoorsMap>)}
    */
    parentAccountsRecursive(account) {
        if (account === undefined) {
            return this._accountsList('ParentAccountsRecursive', 'parentAccountsRecursive');
        } else {
            return this._accountsGet('parentAccountsRecursive', account);
        }
    }

    /**
    Quita una o varias cuentas hijas.
    @returns {Promise}
    */
    async parentAccountsRemove(accounts) {
        var accs = Array.isArray(accounts) ? accounts : [accounts];
        var url = 'accounts/' + this.id + '/parentAccounts';
        var res = await this.session.restClient.fetch(url, 'DELETE', accs, 'arrayParentAccounts');    
        this.#json.ParentAccountsList = undefined;
        return res;
    }

    /**
    @example
    properties() // Devuelve la coleccion.
    properties(property) // Devuelve el valor de la property.
    properties(property, value) // Setea el valor de la property.
    @returns {(Properties|Promise<string>)}
    */
    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    /**
    Guarda.
    @returns {Promise<Account>}
    */
    save() {
        var me = this;
        return new Promise((resolve, reject) => {
            var type = me instanceof User ? 'user' : 'account';
            var url, method;
            if (me.isNew || me.id === undefined) {
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

    /**
    @returns {Session}
    */
    get session() {
        return this.#session;
    }

    //todo: retorna bool o number?
    get system() {
        return this.#json.System;
    }

    /**
    @returns {Object}
    */
    get tags() {
        if (!this.#json.Tags) this.#json.Tags = {};
        return this.#json.Tags;
    }

    /**
    @returns {string}
    */
    toJSON() {
        return this.#json;
    }

    /**
    @returns {number}
    */
    get type() {
        return this.#json.Type;
    }

    /**
    @example
    userProperties() // Devuelve la coleccion.
    userProperties(property) // Devuelve el valor de la userProperty.
    userProperties(property, value) // Setea el valor de la userProperty.
    @returns {(Properties|Promise<string>)}
    */
    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }
}


export class Application {
    #parent;
    #rootFolder;

    constructor(parent) {
        this.#parent = parent
    }

    /**
    Retorna un folder por su path.
    @returns {Promise<Folder>}
    */
    folder(folderPath) {
        return this.session.folder(folderPath, this.rootFolderId);
    }

    /**
    Alias de folder.
    @returns {Promise<Folder>}
    */
    folders(folderPath) {
        return this.folder(folderPath);
    }

    /**
    @returns {Folder}
    */
    get parent() {
        return this.#parent;
    }

    /**
    Retorna el root folder del app.
    @returns {Promise<Folder>}
    */
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

    /**
    Retorna el root folder id del app.
    @returns {number}
    */
    get rootFolderId() {
        return this.#parent.rootFolderId;
    }

    /**
    @returns {Session}
    */
    get session() {
        return this.parent.session;
    }
}


export class Attachment {
    static objectType = 7;
    #parent; // Document
    #json;
    #properties;
    #userProperties;
    #owner;

    constructor(attachment, document) {
        this.#json = attachment;
        this.#parent = document;
    }

    /**
    @returns {Date}
    */
    get created() {
        return this.session.utils.cDate(this.#json.Created);
    }

    /**
    Borra el adjunto inmediatamente.
    @returns {Promise}
    */
    delete() {
        var me = this;
        return new Promise(async (resolve, reject) => {
            try {
                if (await me.session.doorsVersion < '008.000.000.000') {
                    if (!me.isNew) {
                        let url = 'documents/' + me.parent.id + '/attachments';
                        await me.session.restClient.fetch(url, 'DELETE', [me.id], 'arrayAttId');
                    }
                }
                me.parent._attRemove(me);
                resolve(true);

            } catch(er) {
                reject(er);
            }
        });
    }

    /**
    @returns {string}
    */
    get description() {
        return this.#json.Description;
    }
    set description(value) {
        if (!this.isNew) throw new Error('Read-only property');
        this.#json.Description = value;
    }

    /**
    @returns {string}
    */
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

    /**
    @returns {Promise<ArrayBuffer>}
    */
    get fileStream() {
        var me = this;

        return new Promise((resolve, reject) => {
            if (!me.#json.File) {
                var url = 'documents/' + me.parent.id + '/attachments/' + me.id;
                me.session.restClient.fetchRaw(url, 'GET', '').then(
                    async res => {
                        me.#json.File = await res.arrayBuffer();
                        debugger;
                        resolve(me.#json.File);
                    },
                    reject
                )

            } else {
                let file = me.#json.File;

                if (typeof(file) == 'string') {
                    // Es base64
                    let bf;
                    if (me.session.node.inNode) {
                        bf = Buffer.from(atob(file), 'binary');
                    } else {
                        bf = me.session.utils.base64ToBuffer(me.#json.File);
                    }
                    resolve(bf);

                } else {
                    resolve(file);
                }
            }
        });
    }
    set fileStream(value) {
        let me = this;

        //todo: el retorno de los setters no se devuelve
        return new Promise(async (resolve, reject) => {
            if (!me.isNew) throw new Error('Readonly property');
            let buf = await me.session.utils.arrBuffer(value);
            me.#json.File = new SimpleBuffer(buf).toString('base64');
            me.#json.Size = buf.byteLength;
        });
    }

    async fileStream2(value, onProgress) {
        let me = this;
        if (!me.isNew) throw new Error('Readonly property');

        let modS3 = await me.session.import({ repo: 'Global', path: 's3.mjs', fresh: true }); //todo: sacar fresh
        await modS3.setContext({ dSession: me.session, fresh: true }); //todo: sacar fresh
        await modS3.upload({
            attachment: me,
            file: value,
            onProgress,
        });

        debugger
        me.#json.File = new SimpleBuffer(fileAtS3.split('').map(el => el.charCodeAt(0))).toString('base64');
        me.#json.Size = (await me.session.utils.arrBuffer(value)).byteLength;
    }

    /**
    @returns {string}
    */
    get group() {
        return this.#json.group;
    }
    set group(value) {
        if (!this.isNew) throw new Error('Readonly property');
        this.#json.group = value;
    }

    /**
    @returns {number}
    */
    get id() {
        return this.#json.AttId;
    }

    get isNew() {
        return this.#json.IsNew;
    }
    set isNew(value) {
        this.#json.IsNew = value;
    }

    /**
    @returns {string}
    */
    get name() {
        return this.#json.Name;
    }

    get objectType() {
        return Attachment.objectType;
    }

    /**
    Creador del adjunto.
    @returns {Promise<User>}
    */
    get owner() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#owner) {
                me.session.directory.accounts(me.ownerId).then(
                    res => {
                        me.#owner = res.cast2User();
                        resolve(me.#owner);
                    },
                    reject
                )
            } else {
                resolve(me.#owner);
            }
        });
    }

    /**
    ACC_ID del creador del adjunto.
    @returns {number}
    */
    get ownerId() {
        return this.#json.AccId
    }

    /**
    NAME del creador del adjunto.
    @returns {string}
    */
    get ownerName() {
        return this.#json.AccName
    }

    /**
    @returns {Document}
    */
    get parent() {
        return this.#parent;
    }

    /**
    @example
    properties() // Devuelve la coleccion.
    properties(property) // Devuelve el valor de la property.
    properties(property, value) // Setea el valor de la property.
    @returns {(Properties|Promise<string>)}
    */
    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    /** Alias de delete */
    remove() {
        return this.delete();
    }

    /**
    Guarda el adjunto inmediatamente.
    @returns {Promise}
    */
    save() {
        if (!this.isNew) throw new Error('I\'m not new');

        var me = this;
        return new Promise(async (resolve, reject) => {
            if (await me.session.doorsVersion < '008.000.000.000') {
                var formData = new FormData();
                var fs = await me.fileStream;
                var blob = (fs instanceof Blob ? fs : new Blob([fs]));
                formData.append('attachment', blob, me.name);
                if (me.description || me.description == 0) formData.append('description', me.description);
                if (me.group || me.group == 0) formData.append('group', me.group);
                var url = 'documents/' + me.parent.id + '/attachments';
                me.session.restClient.fetchRaw(url, 'POST', formData).then(
                    async res => {
                        let resJson = await res.json();
                        let newId = Math.max(...resJson.InternalObject.map(el => el.AttId));
                        let newJson = resJson.InternalObject.find(el => el.AttId == newId);
                        if (me.name != newJson.Name) reject(new Error('Same name expected'));
                        Object.assign(me.#json, newJson);
                        me.#json.AccName = (await me.session.currentUser).name;
                        //me.#json.File = fs; // Para que no se postee cdo grabe el doc
                        //me.parent.toJSON().Attachments.push(newJson);
                        resolve(me);
                    },
                    reject
                );

            } else {
                resolve(undefined);
            }
        });
    }

    /**
    @returns {Session}
    */
    get session() {
        return this.parent.session;
    }

    /**
    @returns {number}
    */
    get size() {
        return this.#json.Size;
    }

    /**
    @returns {Object}
    */
    get tags() {
        if (!this.#json.Tags) this.#json.Tags = {};
        return this.#json.Tags;
    }

    get toDelete() {
        return this.#json.toDelete;
    }
    set toDelete(value) {
        this.#json.toDelete = value;
        if (value) this.parent.attachmentsDelete(this.name);
    }

    /**
    @returns {string}
    */
    toJSON() {
        return this.#json;
    }

    /** Alias de toDelete */
    get toRemove() {
        return this.toDelete;
    }
    set toRemove(value) {
        this.toDelete = value;
    }

    /**
    @example
    userProperties() // Devuelve la coleccion.
    userProperties(property) // Devuelve el valor de la userProperty.
    userProperties(property, value) // Setea el valor de la userProperty.
    @returns {(Properties|Promise<string>)}
    */
    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }
}

export class Database {
    #session;
    
    constructor(session) {
        this.#session = session;
    }

    /**
    Ejecuta un sql y devuelve los registros afectados.
    @returns {Promise<number>}
    */
    async execute(sql) {
        var res = await this.session.utils.execVbs(`
            Dim aff
            dSession.Db.Execute ${ this.session.utils.vbsEncodeString(sql) }, aff
            Response.Write aff
        `);

        return parseInt(await res.text());
    }

    /**
    Obtiene el siguiente valor de la secuencia.
    @returns {Promise<number>}
    */
    async nextVal(sequence) {
        var res = await this.session.utils.execVbs(`
            Response.Write dSession.Db.NextVal(${ this.session.utils.vbsEncodeString(sequence) })
        `);

        return parseInt(await res.text());
    }

    /**
    Ejecuta una consulta a la base de datos.
    @returns {Promise<Object[]>}
    */
    async openRecordset(sql) {
        let me = this;

        var res = await this.session.utils.execVbs(`
            Set rcs = dSession.Db.OpenRecordset(${ this.session.utils.vbsEncodeString(sql) })
            rcs.Save Response, 1
            rcs.Close
        `);

        var txt = await res.text();
        return me.parseAdoRecordsetXml(txt);
    }

    parseAdoRecordsetXml(xml) {
        let me = this;
        // fastXmlParser - https://github.com/NaturalIntelligence/fast-xml-parser/blob/HEAD/docs/v4/2.XMLparseOptions.md
        let parser = new me.session.utils.fastXmlParser.XMLParser({
            ignoreAttributes: false,
            ignoreDeclaration: true,
            removeNSPrefix: true,
            trimValues: true,
            parseAttributeValue: true,
            attributeNamePrefix : '',
            attributesGroupName : 'attributes',
        });
        let json = parser.parse(xml);

        let ret = [];
        let rows = json.xml.data.row;
        if (rows) {
            if (Array.isArray(rows)) {
                rows.forEach((el, ix) => {
                    ret.push(el.attributes);
                });
            } else {
                ret.push(rows.attributes);
            }
        }
        return ret;
    }

    /** Alias de sqlEncode */
    sqlEnc(value, type) {
        return this.sqlEncode(value, type);
    }

    /**
    Encodea un valor para SQL. type: 1=char / 2=date / 3=number.
    @returns {string}
    */
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
                throw new Error('sqlEncode error - Unknown type: ' + type);
            }
        };
    }
    
    /**
    @returns {Session}
    */
    get session() {
        return this.#session;
    }

    /** No implementado aun */
    /*
    setVal(sequence, value) {
        // todo
    }
    */
}

export class Directory {
    #session;
    
    constructor(session) {
        this.#session = session;
    }

    /**
    Devuelve el email de un account, por name o id.
    Formato: "name" <email>
    @returns {Promise<string>}
    */
    async accountEmail(account) {
        var me = this;
        if (account || account == 0) {
            let fil;
            if (isNaN(parseInt(account))) {
                fil = 'name = ' + me.session.db.sqlEnc(account, 1);
            } else {
                fil = 'acc_id = ' + account;
            }
            let res = await me.accountsSearch(fil);
            if (res.length == 0) {
                throw new Error('Account not found (' + account + ')');
            } else if (res.length > 1) {
                throw new Error('Vague expression (' + account + ')');
            } else {
                return `"${ res[0]['Name'] }" <${ res[0]['Email'] }>`;
            }
        } else {
            throw new Error('Invalid account spec: ' + account);
        }
    }

    /**
    Alias de accountEmail.
    @returns {Promise<string>}
    */
    accEmail(account) {
        return this.accountEmail(account);
    }

    /**
    Devuelve un account por name o id.
    @returns {Promise<Account>}
    */
    accounts(account) {
        var me = this;
        return new Promise((resolve, reject) => {
            var url;
            if (account || account == 0) {
                if (isNaN(parseInt(account))) {
                    url = 'accounts/name=' + me.session.utils.encUriC(account);
                    //url = 'accounts/name/' + me.session.utils.encUriC(account);
                } else {
                    // todo: cambiar por /accounts/{accId}
                    url = 'accounts?accIds=' + account;
                }

            } else {
                reject(new Error('Invalid account spec: ' + account));
            }

            me.session.restClient.fetch(url, 'GET', '', '').then(
                res => {
                    if (Array.isArray(res)) {
                        if (res.length == 0) {
                            reject(new Error('Account not found (' + account + ')'));
                        } else if (res.length > 1) {
                            reject(new Error('Vague expression (' + account + ')'));
                        } else {
                            resolve(new Account(res[0], me.session));
                        }
                    } else {
                        resolve(new Account(res, me.session));
                    }
                },
                reject
            )
        });
    }

    /**
    Crea un nuevo account. type: 1=User / 2=Group.
    @returns {(Promise<User>|Promise<Account>)}
    */
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

    /**
    Busca accounts.
    @returns {Promise<Object[]>}
    */
    accountsSearch(filter, order) {
        let utils = this.session.utils;
        let key = 'accountsSearch|' + filter + '|' + order;
        let cache = utils.cache(key);
        if (cache === undefined) {
            let url = '/accounts/search?filter=' + utils.encUriC(filter) + 
                '&order=' + utils.encUriC(order);
            cache = this.session.restClient.fetch(url, 'GET', '', '');
            utils.cache(key, cache, 60); // Cachea por 60 segundos
        }
        return cache;
    }

    /**
    @returns {Session}
    */
    get session() {
        return this.#session;
    }
};


/**
{
    "AclInfo": null,
    "AclInherits": true,
    "Attachments": [
        {
            "AccId": 462,
            "AttId": 9271,
            "Created": "2024-09-05T14:22:05.183Z",
            "Description": "tag1",
            "DocId": 443188,
            "Extension": null,
            "External": false,
            "File": null,
            "Group": "tag1",
            "Name": "2024-08 - Vidacel - Propuesta Valvulas Cardiacas.pdf",
            "Size": 423845,
            "IsNew": false,
            "Tags": null
        },
    ],
    "CustomFields": [
        {
            "Value": "Daniel Aguilera;Daniel Paz",
            "ValueOld": "Daniel Aguilera;Daniel Paz",
            "ValueChanged": false,
            "Computed": false,
            "Custom": true,
            "Description": null,
            "DescriptionRaw": null,
            "HeaderTable": false,
            "Id": 509,
            "Length": 400,
            "Name": "ACTEXT",
            "Nullable": true,
            "Precision": 0,
            "Scale": 0,
            "Type": 1,
            "Updatable": true,
            "IsNew": false,
            "Tags": null
        },
    ],
    "DocId": 443188,
    "HeadFields": [
        // Igual que CustomFields pero con HeaderTable = true
    ],
    "IsNew": false,
    "Tags": { },
}
*/
export class Document {
    static objectType = 2;
    #parent;
    #session;
    #json;
    #fieldsMap;
    #attachmentsMap;
    #properties;
    #userProperties;
    #owner;
    #form;
    #log;

    constructor(document, session, folder) {
        this.#json = document;
        this.#session = session;
        if (folder) this.#parent = folder;
    }

    /**
    Este metodo se usa desde att.delete para sacar el adjunto de los maps
    cdo se borra
    */
    _attRemove(att) {
        if (this.#attachmentsMap.find((value, key) => value == att))
            this.#attachmentsMap.delete(att.name);

        let atts = this.#json.Attachments;
        let ix = atts.findIndex(el => el.AttId == att.id);
        if (ix >= 0) atts.splice(ix, 1);
    }

    _reset() {
        this.#parent = undefined;
        this.#fieldsMap = undefined;
        this.#attachmentsMap = undefined;
        this.#properties = undefined;
        this.#userProperties = undefined;
        this.#owner = undefined;
        this.#form = undefined;
        this.#log = undefined;
    }

    /**
    Este metodo no lo hago privado xq se llama desde Session.
    Dispara el evento si esta configurado en el folder.
    */
    async _dispatchEvent(event) {
        // A partir de la version 7.4.38.1 los dispara el server
        try { var ver = await this.session.doorsVersion } catch(err) {};
        if (ver === undefined || ver >= '007.004.038.001') return;

        var me = this;
        var fld = await me.parent;
        var code = {};
        var prop = await fld.properties('NODE_CONFIG');
        try {
            let jsn = JSON.parse(prop);
            //todo: ver nuevo esquema
            code.path = jsn[event];
        } catch(err) {}

        if (code.path) {
            prop = await fld.userProperties('NODE_CONFIG');
            try {
                let jsn = JSON.parse(prop);
                let assDef = me.session.utils.assignDefined;
                assDef(code, jsn[event], 'ref');
                assDef(code, jsn[event], 'fresh');
            } catch(err) {}

            await me.nodeEvent(code, event);
        }
    }

    /**
    Access Control List propio y heredado.
    @returns {Promise<Object[]>}
    */
    acl() {
        var url = 'documents/' + this.id + '/acl/';
        return this.session.restClient.fetch(url, 'GET', '', '');
    }

    /**
    Otorga el permiso access a la cuenta account (id).
    Access: read / modifiy / delete / admin.
    @returns {Promise}
    */
    aclGrant(account, access) {
        var url = 'documents/' + this.id + '/acl/' + access + '/grant/' + account;
        return this.session.restClient.fetch(url, 'POST', {}, '');
    }

    /**
    Access Control List heredado.
    @returns {Promise<Object[]>}
    */
    aclInherited() {
        var url = 'documents/' + this.id + '/aclinherited/';
        return this.session.restClient.fetch(url, 'GET', '', '');
    }

    /**
    Devuelve o establece si se heredan permisos.
    @returns {Promise<boolean>}
    */
    aclInherits(value) {
        if (value === undefined) {
            return (this.fields('inherits').value ? true : false);
        } else {
            var me = this;
            return new Promise((resolve, reject) => {
                var url = 'documents/' + this.id + '/aclinherits/' + value;
                this.session.restClient.fetch(url, 'POST', {}, '').then(
                    res => {
                        if (res) {
                            me.#json.AclInherits = (value ? true : false);
                            me.fields('inherits').toJSON().Value = (value ? 1 : 0);
                        }
                        resolve(res);
                    },
                    err => {
                        reject(err);
                    }
                )
            });
        }
    }

    /**
    Access Control List propio.
    @returns {Promise<Object[]>}
    */
    aclOwn() {
        var url = 'documents/' + this.id + '/aclown/';
        return this.session.restClient.fetch(url, 'GET', '', '');
    }

    /**
    Revoca el permiso access a la cuenta account (id).
    Access: read / modifiy / delete / admin.
    @returns {Promise}
    */
    aclRevoke(account, access) {
        var url = 'documents/' + this.id + '/acl/' + access + '/revoke/' + account;
        return this.session.restClient.fetch(url, 'DELETE', {}, '');
    }

    /**
    Revoca todos los permisos de la cuenta account (id).
    Si account no se especifica revoca todos los permisos de todas las cuentas.
    @returns {Promise}
    */
    aclRevokeAll(account) {
        var url = 'documents/' + this.id + '/acl/revokeAll';
        if (account) {
            // Si viene account es un revokeAll para esa cuenta
            url += '/' + account;
        }
        return this.session.restClient.fetch(url, 'DELETE', {}, '');
    }

    /**
    Devuelve la coleccion de adjuntos, o uno en particular si se especifica attachment (name).
    @returns {(Promise<DoorsMap>|Promise<Attachment>)}
    */
    attachments(attachment) {
        var me = this;

        return new Promise(async (resolve, reject) => {
            if (attachment == undefined) {
                // Devuelve la coleccion
                if (!me.#attachmentsMap) {
                    let map = new DoorsMap();
                    let atts = me.#json.Attachments;
                    var ids = atts.map(att => att.AccId);
                    // Saca los repetidos
                    ids = ids.filter((el, ix) => ids.indexOf(el) == ix);
                    // Levanta los accounts para completar el AccName
                    let accs = await me.session.directory.accountsSearch('acc_id in (' + ids.join(',') + ')'); 
                    atts.forEach(el => {
                        el.AccName = accs.find(acc => acc['AccId'] == el.AccId)['Name'];
                        map.set(el.Name, new Attachment(el, me));
                    });
                    me.#attachmentsMap = map;
                }
                resolve(me.#attachmentsMap);

            } else {
                // Devuelve un adjunto
                let map = me.attachments();
                let ret;
                if (typeof(attachment) == 'number') {
                    // Busca por id
                    for (let att of map.values()) {
                        if (att.id == attachment) {
                            ret = att;
                            break;
                        }
                    }
                } else {
                    // Busca por name
                    ret = map.get(attachment);
                }
                if (ret) {
                    resolve(ret);
                } else {
                    reject(new Error('Attachment not found: ' + attachment));
                }
            }
        });
    }

    /**
    Crea y devuelve un nuevo adjunto con nombre name.
    @returns {Attachment}
    */
    attachmentsAdd(name) {
        let me = this;

        if (!name) throw new Error('name is required');

        let attJson = {
            Name: name,
            IsNew: true,
            DocId: me.id,
        };

        // Obtiene el ID
        me.session.restClient.fetch('documents/' + me.id + '/attachments/new', 'GET', '').then(
            res => {
                attJson.AttId = res.AttId;
                attJson.Created = res.Created;
            }
        );

        // Completa el creador
        me.session.currentUser.then(
            res => {
                attJson.AccId = res.id;
                attJson.AccName = res.name;
            }
        )

        let ix = name.lastIndexOf('.');
        if (ix >= 0) attJson.Extension = name.substring(ix + 1);

        let atts = me.#json.Attachments || [];
        // Verifica que no exista un adjunto con el mismo nombre
        if (atts.find(att => att.Name.toUpperCase() == name.toUpperCase())) {
            throw new Error('Attachment with name "' + name + '" already exists');
        }
        atts.push(attJson);

        let att = new Attachment(attJson, me);
        this.#attachmentsMap.set(name, att);
        return att;
    }

    /**
    Marca un adjunto para borrar cdo se haga el save
    @returns {Attachment}
    */
    attachmentsDelete(attachment) {
        let me = this;
        let att;
        if (typeof(attachment) == 'number') {
            // Busca por id
            for (let el of me.#attachmentsMap.values()) {
                if (el.id == attachment) {
                    att = el;
                    break;
                }
            }
        } else {
            // Busca por name
            att = me.#attachmentsMap.get(attachment);
        }

        if (att) {
            me._attRemove(att);
            return att;
        } else {
            throw new Error('Not found');
        }
    }

    /**
    Alias de attachmentsAdd
    */
    attachmentsNew(attachment) {
        return this.attachmentsAdd(attachment);
    }

    /** No implementado aun */
    /*
    copy(folder) {
        //todo
    }
    */

    /**
    @returns {Date}
    */
    get created() {
        return this.fields('created').value;
    }

    /**
    Devuelve true si el currentUser tiene el acceso indicado en el documento
    @param {string} access - read / modify / delete / admin
    @returns {Promise<boolean>}
    */
    currentAccess(access) {
        let url = `/documents/${ this.id }/acl/${ access }`;
        return this.session.restClient.fetch(url, 'GET', '', '');
    }

    /**
    Borra el documento, si purge=true no se envia a la papelera
    @returns {Promise}
    */
    delete(purge) {
        var url = 'folders/' + this.parentId + '/documents/?tobin=' + 
            this.session.utils.encUriC(purge == true ? false : true);
        return this.session.restClient.fetch(url, 'DELETE', [this.id], 'docIds');
        //todo: en q estado queda el objeto?
    }

    /**
    @example
    fields() // Devuelve la coleccion.
    fields(name) // Devuelve el field (undefined si no lo encuentra).
    fields(name, value) // Setea el valor del field.
    @returns {(DoorsMap|Field)}
    */
    fields(attachment, value) {
        var me = this;

        if (attachment) {
            // Devuelve un field
            var field = me.fields().get(attachment);
            if (field) {
                if (value !== undefined) field.value = value;
                return field;
            } else {
                if (attachment.toUpperCase() != '[NULL]') console.log('Field not found: ' + attachment);
                return undefined;
            }

        } else {
            // Devuelve la coleccion
            if (!me.#fieldsMap) {
                var map = new DoorsMap();
                me.#json.HeadFields.forEach(el => {
                    map.set(el.Name, new Field(el, me));
                });
                me.#json.CustomFields.forEach(el => {
                    map.set(el.Name, new Field(el, me));
                });
                me.#fieldsMap = map;
            }
            return me.#fieldsMap;
        }
    }

    /** Alias de parent */
    get folder() {
        return this.parent
    }

    /** Alias de parentId */
    get folderId() {
        return this.parentId
    }

    /**
    @returns {Promise<Form>}
    */
    get form() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#form) {
                var url = 'forms/' + me.formId;
                me.session.restClient.fetch(url, 'GET', '', '').then(
                    res => {
                        me.#form = new Form(res, me.session);
                        resolve(me.#form);
                    },
                    reject
                )
            } else {
                resolve(me.#form);
            }
        });
    }

    /**
    @returns {number}
    */
    get formId() {
        return this.fields('frm_id').value;
    }

    /**
    @returns {string}
    */
    get icon() {
        return this.fields('icon').value;
    }

    /**
    @returns {string}
    */
    /*
    get iconRaw() {
        //todo
    }
    set iconRaw(value) {
        //todo
    }
    */

    /**
    @returns {number}
    */
    get id() {
        return this.#json.DocId;
    }

    /**
    @returns {boolean}
    */
    get isNew() {
        return this.#json.IsNew;
    }

    /**
    Log de cambios.
    @returns {Promise<Object[]>}
    */
    log() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#log) {
                var url = 'documents/' + me.id + '/fieldslog';
                me.session.restClient.fetch(url, 'GET', '', '').then(
                    res => {
                        me.#log = res;
                        resolve(me.#log);
                    },
                    reject
                )
            } else {
                resolve(me.#log);
            }
        });
    }

    /**
    @returns {number}
    */
    get objectType() {
        return Document.objectType;
    }

    /**
    @returns {Date}
    */
    get modified() {
        return this.fields('modified').value;
    }

    /** No implementado aun */
    /*
    move(folder) {
        //todo
    }
    */

    /**
    Ejecuta un evento node de documento.
    Es la alternativa JavaScript a los eventos sincronos VbScript.
    @example
    await doc.nodeEvent({ owner, repo, path, ref, fresh });
    */
    async nodeEvent(code, attachment) {
        this.#json = await this.session.node.exec({
            code: code,
            payload: {
                eventName: attachment,
            },
            doc: this.toJSON(),
        });
        this._reset();
    }

    /**
    Creador del documento.
    @returns {Promise<User>}
    */
    get owner() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#owner) {
                me.session.directory.accounts(me.ownerId).then(
                    res => {
                        me.#owner = res.cast2User();
                        resolve(me.#owner);
                    },
                    reject
                )
            } else {
                resolve(me.#owner);
            }
        });
    }

    /**
    ACC_ID del creador del documento.
    @returns {number}
    */
    get ownerId() {
        return this.fields('acc_id').value;
    }

    /**
    Retorna la carpeta contenedora.
    @returns {Promise<Folder>}
    */
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

    /**
    Retorna el FLD_ID de la carpeta contenedora.
    @returns {number}
    */
    get parentId() {
        return this.fields('fld_id').value;
    }

    /**
    @example
    properties() // Devuelve la coleccion.
    properties(property) // Devuelve el valor de la property.
    properties(property, value) // Setea el valor de la property.
    @returns {(Properties|Promise<string>)}
    */
    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    /**
    Ejecuta un codigo en un contexto elevado.

    options = {
        code, // Codigo a ejecutar
        lang, // Lenguaje del codigo (js, vbs) (def js)
        evnId, // Id del evento asincrono de la carpeta, con las credenciales que se usaran
    }
    */
    async runElevated(options) {
        let me = this;
        options.docId = me.id;
        return (await me.parent).runElevated(options);
    }

    /**
    Guarda el documento.
    @returns {Promise<Document>}
    */
    save() {
        var me = this;
        return new Promise(async (resolve, reject) => {
            try {
                await me._dispatchEvent('Document_BeforeSave');
            } catch(err) {
                reject(err);
            }
            var tags = me.#json.Tags;

            // Saco el File de los adjuntos que no son nuevos
            var atts = me.#json.Attachments;
            for (let att of atts) {
                if (!att.IsNew) delete att.File;
            };

            var url = 'documents';
            me.session.restClient.fetch(url, 'PUT', me.#json, 'document').then(
                res => {
                    // Esta peticion se hace xq la ref q vuelve del PUT no esta actualizada (issue #237)
                    var url = 'documents/' + me.id;
                    me.session.restClient.fetch(url, 'GET', '', '').then(
                        async res => {
                            me.#json = res;
                            me.#json.Tags = tags; // Restauro los tags para el afterSave

                            try {
                                await me._dispatchEvent('Document_AfterSave');
                            } catch(err) {
                                reject(err);
                            }

                            me._reset();
                            resolve(me);
                        },
                        reject
                    )
                },
                reject
            );
        });
    }

    /**
    Guarda los adjuntos.
    */
    async saveAttachments() {
        let me = this;
        let utils = me.session.utils;
        let ret = [];

        if (await me.session.doorsVersion >= '008.000.000.000') {
            console.warn('document.saveAttachments no dispara los eventos sincronos de documento, no deberia usarse a partir de Doors 8');
        }

        /*
        // 1ro borrar
        let atts = this.#deletedAttsMap
        let keys = Array.from(atts.keys());
        await utils.asyncLoop(keys.length, async loop => {
            let att = atts.get(keys[loop.iteration()]);
            let res = {
                action: 'delete',
                attachment: attInfo(att),
            }
            try {
                await att.delete();
                res.result = 'OK';
            } catch (err) {
                res.result = err;
            } finally {
                ret.push(res);
            }
            loop.next();
        });
        */

        // 2do agregar
        atts = await this.attachments();
        keys = Array.from(atts.keys());
        await utils.asyncLoop(keys.length, async loop => {
            let att = atts.get(keys[loop.iteration()]);
            if (att.isNew) {
                let res = {
                    action: 'add',
                    attachment: attInfo(att),
                }
                try {
                    await att.save();
                    res.result = 'OK';
                } catch (err) {
                    res.result = err;
                } finally {
                    ret.push(res);
                }
            }
            loop.next();
        })

        function attInfo(att) {
            return {
                id: att.id,
                name: att.name,
                size: att.size,
                isNew: att.isNew,
            }
        }

        return ret;
    }

    /**
    @returns {Session}
    */
    get session() {
        return this.#session;
    }
    set session(value) {
        this.#session = value;
    }

    /**
    @returns {string}
    */
    get subject() {
        return this.fields('subject').value;
    }
    set subject(value) {
        this.fields('subject').value = value;
    }

    /**
    @returns {Object}
    */
    get tags() {
        if (!this.#json.Tags) this.#json.Tags = {};
        return this.#json.Tags;
    }

    /**
    Agrega msg como entrada de log, con los minutos y segundos,
    en un tag llamado log.
    */
    tagLog(msg) {
        var log = this.tags.log;
        if (!log) log = '';
        
        var dt = new Date();
        var dts = this.session.utils.lZeros(dt.getSeconds(), 2) + '.' + dt.getMilliseconds();
        log = log.substring(0, 1024*64) + (log ? '\n' : '') + dts + ' - ' + this.session.utils.errMsg(msg);
        this.tags.log = log;
    }

    /**
    Convierte a JSON
    @returns {string}
    */
    toJSON() {
        return this.#json;
    }

    /**
    @example
    userProperties() // Devuelve la coleccion.
    userProperties(property) // Devuelve el valor de la userProperty.
    userProperties(property, value) // Setea el valor de la userProperty.
    @returns {(Properties|Promise<string>)}
    */
    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }
};


export class Field {
    static objectType = 5;
    #parent; // Document / Form / Folder
    #json;
    #properties;
    #userProperties;

    constructor(field, parent) {
        this.#json = field;
        this.#parent = parent;
    }

    get computed() {
        return this.#json.Computed;
    }

    get custom() {
        return this.#json.Custom;
    }

    /**
    @returns {string}
    */
    get description() {
        return this.#json.Description;
    }

    /**
    @returns {string}
    */
    get descriptionRaw() {
        return this.#json.DescriptionRaw;
    }
    /*
    set descriptionRaw(value) {
        //todo
    }
    */

    get field() {
        return this.#json.Field;
    }

    get formId() {
        debugger; // chequear
        return this.#json.Id;
    }

    get headerTable() {
        return this.#json.HeaderTable;
    }

    /*
    get isNew() {
        //todo
    }
    */

    /**
    Retorna description si existe, sino el name con la 1ra letra en mayuscula.
    @returns {string}
    */
    get label() {
        var ret = this.description;
        if (!ret) ret = this.name.substring(0, 1).toUpperCase() + this.name.substring(1).toLowerCase();
        return ret;
    }

    get length() {
        return this.#json.Length;
    }
    /*
    set length(value) {
        //todo
    }
    */

    get name() {
        return this.#json.Name;
    }

    get nullable() {
        return this.#json.Nullable;
    }
    /*
    set nullable(value) {
        //todo
    }
    */

    get objectType() {
        return Field.objectType;
    }

    get parent() {
        return this.#parent;
    }

    get precision() {
        return this.#json.Precision;
    }
    /*
    set precision(value) {
        //todo
    }
    */

    // todo: solo para field de form, add o remove igual
    /**
    @example
    properties() // Devuelve la coleccion.
    properties(property) // Devuelve el valor de la property.
    properties(property, value) // Setea el valor de la property.
    @returns {(Properties|Promise<string>)}
    */
    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    get scale() {
        return this.#json.Scale;
    }
    /*
    set scale(value) {
        //todo
    }
    */

    /**
    @returns {Session}
    */
    get session() {
        return this.parent.session;
    }

    get table() {
        return this.#json.Table;
    }

    get tableAlias() {
        return this.#json.TableAlias;
    }

    /**
    @returns {string}
    */
    toJSON() {
        return this.#json;
    }
    
    get type() {
        return this.#json.Type;
    }
    /*
    set type(value) {
        //todo
    }
    */

    get updatable() {
        //return this.#json.Updatable; // Dejar esta cdo este el issue #287
        return this.#json.Updatable && !this.computed;
    }

    /**
    @example
    userProperties() // Devuelve la coleccion.
    userProperties(property) // Devuelve el valor de la userProperty.
    userProperties(property, value) // Setea el valor de la userProperty.
    @returns {(Properties|Promise<string>)}
    */
    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }

    get value() {
        if (this.type == 2) {
            return this.session.utils.cDate(this.#json.Value);
        } else {
            return this.#json.Value;
        }
    }
    set value(value) {
        if (!this.updatable || this.computed) throw new Error('Field not updatable: ' + this.name);
        if ((value === null || value === undefined) && !this.nullable) throw new Error('Field not nullable: ' + this.name);
        
        if (this.type == 1) {
            this.#json.Value = (value === undefined || value == null || value == '') ? null : value.toString();
        } else if (this.type == 2) {
            var dt = this.session.utils.cDate(value);
            this.#json.Value = dt ? dt.toJSON() : null;
        } else if (this.type == 3) {
            this.#json.Value = this.session.utils.cNum(value);
        } else {
            this.#json.Value = value;
        }
        this.valueChanged; // Para actualizar valueChanged en el JSON
    }

    get valueChanged() {
        this.#json.ValueChanged = (this.#json.Value !== this.#json.ValueOld);
        return this.#json.ValueChanged;
    }

    /**
    Retorna true si value es null, undefined o ''.
    @returns {boolean}
    */
    get valueEmpty() {
        return (this.value == null || this.value === undefined || this.value == '');
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
    #form;
    #foldersMap;
    #viewsMap;
    #owner;
    #fieldsMap;

    constructor(folder, session, parent) {
        this.#json = folder;
        this.#session = session;
        if (parent) this.#parent = parent;
    }

    /**
    Access Control List propio y heredado.
    @returns {Promise<Object[]>}
    */
    /*
    acl() {
        //todo
    }
    */

    /**
    Otorga el permiso access a la cuenta account (id).
    Access: fld_create / fld_read / fld_view / fld_admin / doc_create / doc_read / doc_modify / 
    doc_delete / doc_admin / vie_create / vie_create_priv / vie_read / vie_modify / vie_admin.
    @returns {Promise}
    */
    /*
    aclGrant(account, access) {
        // todo
        var url = 'documents/' + this.id + '/acl/' + access + '/grant/' + account;
        return this.session.restClient.fetch(url, 'POST', {}, '');
    }
    */

    /**
    Access Control List heredado.
    @returns {Promise<Object[]>}
    */
    /*
    aclInherited() {
        //todo
    }
    */

    /**
    Devuelve o establece si se heredan permisos.
    @returns {Promise}
    */
    /*
    aclInherits(value) {
        //todo
    }
    */

    /**
    Access Control List propio.
    @returns {Promise<Object[]>}
    */
    /*
    aclOwn() {
        //todo
    }
    */

    /**
    Revoca el permiso access a la cuenta account (id).
    Access: fld_create / fld_read / fld_view / fld_admin / doc_create / doc_read / doc_modify / 
    doc_delete / doc_admin / vie_create / vie_create_priv / vie_read / vie_modify / vie_admin.
    @returns {Promise}
    */
    /*
    aclRevoke(account, access) {
        //todo
        var url = 'documents/' + this.id + '/acl/' + access + '/revoke/' + account;
        return this.session.restClient.fetch(url, 'DELETE', {}, '');
    }
    */

    /**
    Revoca todos los permisos de la cuenta account (id).
    Si account no se especifica revoca todos los permisos de todas las cuentas.
    @returns {Promise}
    */
    /*
    aclRevokeAll(account) {
        //todo
        var url = 'documents/' + this.id + '/acl/revokeAll';
        if (account) {
            // Si viene account es un revokeAll para esa cuenta
            url += '/' + account;
        }
        return this.session.restClient.fetch(url, 'DELETE', {}, '');
    }
    */

    /*
    ancestors() {
        //todo
    }
    */

    /**
    @returns {Application}
    */
    get app() {
        if (!this.#app) {
            this.#app = new Application(this);
        }
        return this.#app;
    }

    /**
    Retorna la lista de eventos asincronos

    @returns {Promise<Object[]>}
    [{
        Class, Code, CodeTimeOut, CodeType, Created, Disabled, EvnId, FldId, HasCode, 
        InsId, IsCom, IsNew, Login, Method, Modified, Password, Recursive, Tags, TimerFrecuence, 
        TimerMode, TimerNextRun, TimerTime, TriggerEvent, TriggerPropertyName, Type
    }]
    */
    asyncEvents() {
        let me = this;
        let url = 'folders/' + me.id + '/asyncevents';        
        return me.session.restClient.fetch(url, 'GET', '', '');
    }

    /*
    get charData() {
        //todo
    }
    set charData(value) {
        //todo
    }
    */

    /*
    get comments() {
        //todo
    }
    set comments(value) {
        //todo
    }
    */

    /*
    copy() {
        //todo
    }
    */

    /*
    get created() {
        //todo
    }
    */

    /*
    currentAccess(access, explicit) {
        //todo
    }
    */

    /*
    delete() {
        //todo
    }
    */

    /*
    descendants() {
        //todo
    }
    */

    get description() {
        return this.#json.Description;
    }

    get descriptionRaw() {
        return this.#json.DescriptionRaw;
    }
    set descriptionRaw(value) {
        this.#json.DescriptionRaw = value;
    }

    /**
    Alias de documents.
    @returns {Promise<Document>}
    */
    doc(document) {
        return this.documents(document);
    }
    
    /**
    Obtiene un documento. document puede ser el id o una formula que devuelva un solo elemento.
    @returns {Promise<Document>}
    */
    documents(document) {
        var me = this;
        return new Promise(async (resolve, reject) => {
            try {
                //todo: Para evitar esta llamada seria necesario un endpoint con docId y fldId
                var formula = isNaN(parseInt(document)) ? document : 'doc_id = ' + document;
                var res = await me.search({ fields: 'doc_id', formula });

                if (res.length == 0) {
                    reject(new Error('Document not found (' + formula + ')'));
                } else if (res.length > 1) {
                    reject(new Error('Vague expression (' + formula + ')'));
                } else {
                    let docId = res[0]['DOC_ID'];
                    resolve(await me.session.doc(docId));
                }

            } catch(err) {
                reject(err);
            }
        });
    }

    documentsCount() {
        //todo
    }

    /**
    Borra multiples documentos. documents puede ser un array de ids o una formula.
    @returns {Promise}
    */
    documentsDelete(documents, purge) {
        if (!isNaN(parseInt(documents)) || Array.isArray(documents)) {
            // id o array de ids
            var url = 'folders/' + this.id + '/documents/?tobin=' + 
                this.session.utils.encUriC(purge == true ? false : true);
            return this.session.restClient.fetch(url, 'DELETE', 
                Array.isArray(documents) ? documents : [documents], 'docIds');

        } else {
            // formula
            // todo: tobin??
            var url = 'folders/' + this.id + '/documents/' + this.session.utils.encUriC(documents);
            return this.session.restClient.fetch(url, 'DELETE', {}, '');
        }
    }

    /**
    Crea un nuevo documento.
    @returns {Promise<Document>}
    */
    documentsNew() {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'folders/' + me.id + '/documents/new';
            me.session.restClient.fetch(url, 'GET', '', '').then(
                async res => {
                    let doc = new Document(res, me.session, me);
                    await doc._dispatchEvent('Document_Open');
                    resolve(doc);
                },
                reject
            );
        })
    }

    /*
    events() {
        //todo
    }
    */

    /*
    eventsList() {
        //todo
    }
    */

    /*
    get externalAttachments() {
        //todo
    }
    set externalAttachments(value) {
        //todo
    }
    */

    async fields(field) {
        var me = this;

        if (field) {
            return (await me.fields()).get(field);

        } else {
            // Devuelve la coleccion
            if (!me.#fieldsMap) {
                let url = 'folders/' + me.id + '/fields';
                let res = await me.session.v8Client.fetch(url, { method: 'GET' });
                var map = new DoorsMap();
                res.forEach(el => {
                    map.set(el.Name, new Field(el, me));
                });
                me.#fieldsMap = map;
            }
            return me.#fieldsMap;
        }
    }

    /**
    @example
    folder() // Devuelve la lista de carpetas hijas.
    folder(name) // Devuelve la carpeta hija con nombre name.
    @returns {Promise<Folder>}
    */
    folder(name) {
        let me = this;
        return new Promise((resolve, reject) => {
            if (name !== undefined) {
                /*
                No la devuelvo de la coleccion xq a veces no vienen todas
                calculo debe ser por el permiso read/view
                */
                let url = 'folders/' + me.id + '/children?foldername=' + me.session.utils.encUriC(name);
                me.session.restClient.fetch(url, 'GET', '', '').then(
                    res => {
                        resolve(new Folder(res, me.session, me));
                    },
                    reject
                )  
            } else {
                // Devuelve la coleccion
                if (!me.#foldersMap) {
                    let url = 'folders/' + me.id + '/childrens';
                    me.session.restClient.fetch(url, 'GET', '', '').then(
                        res => {
                            me.#foldersMap = new DoorsMap();
                            for (let el of res) {
                                me.#foldersMap.set(el.Name, new Folder(el, me.session, me));
                            }
                            resolve(me.#foldersMap);
                        },
                        reject
                    )  
                }
            }
        });
    }

    /** Alias de folder */
    folders(name) {
        return this.folder(name);
    }
    
    /*
    foldersNew() {
        //todo
    }
    */

    /** Alias de type */
    get folderType() {
        return this.type;
    }

    /**
    Retorna el form relacionado
    @returns {Promise<Form>}
    */
    get form() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#form) {
                var url = 'forms/' + me.formId;
                me.session.restClient.fetch(url, 'GET', '', '').then(
                    res => {
                        me.#json.Form = res;
                        me.#form = new Form(res, me.session);
                        resolve(me.#form);
                    }
                ),
                reject
            } else {
                resolve(me.#form);
            }
        });
    }

    /**
    Retorna el id del form relacionado
    @returns {number}
    */
    get formId() {
        return this.#json.FrmId;
    }

    /*
    get haveDocuments() {
        //todo
    }
    */

    /*
    get haveFolders() {
        //todo
    }
    */

    /*
    get haveViews() {
        //todo
    }
    */

    get href() {
        return this.#json.Href;
    }

    get hrefRaw() {
        return this.#json.HrefRaw;
    }
    set hrefRaw(value) {
        this.#json.HrefRaw = value;
    }

    get icon() {
        return this.#json.Icon;
    }

    get iconRaw() {
        return this.#json.IconRaw;
    }
    set iconRaw(value) {
        this.#json.IconRaw = value;
    }

    get iconVector() {
        return this.#json.IconVector;
    }
    set iconVector(value) {
        this.#json.IconVector = value;
    }

    /**
    @returns {number}
    */
    get id() {
        return this.#json.FldId;
    }

    /*
    get isEmpty() {
        //todo
    }
    */

    get isNew() {
        return this.#json.IsNew;
    }

    /**
    @returns {Object[]}
    */
    get logConf() {
        return this.#json.LogConf;
    }
    set logConf(value) {
        this.#json.LogConf = value;
    }

    get modified() {
        return this.session.utils.cDate(this.#json.Modified);
    }

    /*
    move() {
        //todo
    }
    */

    /**
    @returns {string}
    */
    get name() {
        return this.#json.Name;
    }
    set name(value) {
        this.#json.Name = value;
    }

    /** Alias de documentsNew */
    newDoc() {
        return this.documentsNew();
    }

    /**
    @returns {number}
    */
    get objectType() {
        return Folder.objectType;
    }

    /**
    Creador del Folder.
    @returns {Promise<User>}
    */
    get owner() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#owner) {
                me.session.directory.accounts(me.ownerId).then(
                    res => {
                        me.#owner = res.cast2User();
                        resolve(me.#owner);
                    },
                    reject
                )
            } else {
                resolve(me.#owner);
            }
        });
    }

    /**
    ACC_ID del creador del Folder.
    @returns {number}
    */
    get ownerId() {
        return this.#json.AccId
    }

    /**
    Retorna la carpeta padre.
    @returns {Promise<Folder>}
    */
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

    /**
    Retorna el id de la carpeta padre.
    @returns {number}
    */
    get parentId() {
        return this.#json.ParentFolder;
    }

    /*
    path(onlyNames) {
        //todo
    }
    */

    /**
    @example
    properties() // Devuelve la coleccion.
    properties(property) // Devuelve el valor de la property.
    properties(property, value) // Setea el valor de la property.
    @returns {(Properties|Promise<string>)}
    */
    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    /**
    Retorna el id de la carpeta raiz de la aplicacion.
    @returns {number}
    */
    get rootFolderId() {
        return this.#json.RootFolderId;
    }

    /**
    Ejecuta un codigo en un contexto elevado.

    options = {
        docId, // Opcional, documento sobre el cual se ejecuta el codigo
        code, // Codigo a ejecutar
        lang, // Lenguaje del codigo (js, vbs) (def js)
        evnId, // Id del evento asincrono de la carpeta, con las credenciales que se usaran
    }
    //todo: permitir q se pase el json del doc, y la sesion elevada
    */
    async runElevated(options) {
        let me = this;

        let opt = Object.assign({
            lang: 'js',
        }, options);
        opt.lang = opt.lang.toLowerCase();

        let evnList = await me.asyncEvents();
        let evn = evnList.find(el => el.EvnId == opt.evnId);
        if (!evn) throw new Error('Async event not found: ' + opt.evnId);

        let elvSession = new Session(me.session.serverUrl);
        await elvSession.logon(evn.Login, evn.Password, (await me.session.instance).Name);

        try {
            let ret;

            if (opt.lang == 'js') {
                let folder = await elvSession.folder(me.id);
                let doc = opt.docId ? await folder.doc(opt.docId) : undefined;
                
                let pipe = {};
                eval(`pipe.fn = async (dSession, folder, doc) => { ${ opt.code }\n};`);
                ret = await pipe.fn(elvSession, folder, doc);

            } else if (opt.lang == 'vbs') {
                let code = 'Set Folder = dSession.FoldersGetFromId(' + me.id + ')\n';
                if (opt.docId) code += 'Set Document = Folder.Documents(' + opt.docId + ')\nSet Doc = Document\n';
                code += opt.code;
                ret = await elvSession.utils.execVbs(code);
            }

            return ret;

        } catch(err) {
            throw err;
        } finally {
            await elvSession.logoff();
        }
    }

    /*
    save() {
        //todo
    }
    */

    /**
    Busca documentos.
    @example
    search({
        fields, // Lista de campos separados por coma (vacio devuelve todos).
        formula, // Filtro SQL.
        order, // Campos de orden.
        maxDocs, // Cant max de documentos. Def 1000. 0 = sin limite.
        recursive, // Busca tb en carpetas hijas con el mismo form.
        maxTextLen, // Largo max de los campos de texto. Def 100. 0 = sin limite.
        v8, // Utiliza el motor v8 para hacer el search.
    }
    @returns {Promise<Object[]>}
    */
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

        var encUriC = this.session.utils.encUriC;
        var url = 'folders/' + this.id + '/documents';
        var params = 'fields=' + encUriC(opt.fields) + '&formula=' + encUriC(opt.formula) + 
            '&order=' + encUriC(opt.order) + '&maxDocs=' + encUriC(opt.maxDocs) + 
            '&recursive=' + encUriC(opt.recursive) + '&maxDescrLength=' + encUriC(opt.maxTextLen);

        return opt.v8 ? this.session.v8Client.fetch(url, { method: 'GET', params }) :
            this.session.restClient.fetch(url, 'GET', params, '')
    }

    /**
    Busqueda agrupada de documentos.
    @example
    searchGroups({
        groups, // Campos de grupo separados por coma.
        totals: 'count(*) as totals',
        formula, // Filtro SQL.
        order: 'totals desc', // Por defecto se ordena con los mismos campos de group.
        maxDocs, // Cant max de documentos. Def 1000. 0 = sin limite.
        recursive, //
        groupsOrder, //
        totalsOrder, //
        v8, // Utiliza el motor v8 para hacer el search.
    }
    @returns {Promise<Object[]>}
    */
    searchGroups(options) {
        var opt = {
            groups: undefined,
            totals: '',
            formula: '',
            order: '',
            maxDocs: 1000,
            recursive: false,
            groupsOrder: '',
            totalsOrder: '',
        }
        Object.assign(opt, options);

        var encUriC = this.session.utils.encUriC;
        var url = 'folders/' + this.id + '/documents/grouped';
        var params = 'groups=' + encUriC(opt.groups) + '&totals=' + encUriC(opt.totals) +
            '&formula=' + encUriC(opt.formula) + '&order=' + encUriC(opt.order) + 
            '&maxDocs=' + encUriC(opt.maxDocs) + '&recursive=' + encUriC(opt.recursive) + 
            '&groupsOrder=' + encUriC(opt.groupsOrder) + '&totalsOrder=' + encUriC(opt.totalsOrder);

        return opt.v8 ? this.session.v8Client.fetch(url, { method: 'GET', params }) :
            this.session.restClient.fetch(url, 'GET', params, '')
    }

    /**
    @returns {Session}
    */
    get session() {
        return this.#session;
    }
    set session(value) {
        this.#session = value;
    }

    /*
    get sourceFolder() {
        //todo
    }
    */

    /*
    get styleScriptActiveCode() {
        //todo
    }
    */

    /*
    get styleScriptDefinition() {
        //todo
    }
    set styleScriptDefinition(value) {
        //todo
    }
    */

    /*
    get system() {
        //todo
    }
    */

    /**
    @returns {Object}
    */
    get tags() {
        if (!this.#json.Tags) this.#json.Tags = {};
        return this.#json.Tags;
    }

    /*
    get target() {
        //todo
    }
    */

    /**
    @returns {string}
    */
    toJSON() {
        return this.#json;
    }

    /**
    @returns {number}
    */
    get type() {
        return this.#json.Type;
    }

    /**
    @example
    userProperties() // Devuelve la coleccion.
    userProperties(property) // Devuelve el valor de la userProperty.
    userProperties(property, value) // Setea el valor de la userProperty.
    @returns {Properties|Promise<string>)}
    */
    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }

    /**
    @example
    views() // Devuelve la coleccion.
    views(name) // Devuelve la vista name.
    @returns {(Promise<DoorsMap>|Promise<View>)}
    */
    views(name) {
        var me = this;
        return new Promise((resolve, reject) => {
            if (name !== undefined) {
                me.views().then(
                    res => {
                        if (res.has(name)) {
                            resolve(res.get(name));
                        } else {
                            reject(new Error('View not found: ' + name));
                        }
                    },
                    reject
                )
            } else {
                if (!me.#viewsMap) {
                    var url = 'folders/' + me.id + '/views';
                    me.session.restClient.fetch(url, 'GET', '', '').then(
                        res => {
                            // Ordena
                            res.sort(function (a, b) {
                                // Privadas al ult
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

                            me.#viewsMap = new DoorsMap();
                            for (var el of res) {
                                me.#viewsMap.set(el.Name, new View(el, me.session, me));
                            }
                            resolve(me.#viewsMap);
                        },
                        reject
                    )

                } else {
                    resolve(me.#viewsMap);
                }

            }
        })
    }

    /** Alias de viewsNew. */
    viewsAdd() {
        return new this.viewsNew();
    }

    /**
    Crea una nueva vista.
    @returns {Promise<View>}
    */
    async viewsNew() {
        var url = 'folders/' + this.id + '/views/new';
        var res = await this.session.restClient.fetch(url, 'GET', '', '');
        this.#viewsMap = undefined;
        return new View(res, this.session, this);
    }
};

/*
todo: terminar
JSON del folder:

AccId: 462
AclInfo: null
AclInherits: false
Actions: [] (0)
Application: ""
AssemblyMetaData: {IsEnabled: false, IsNet: false, Items: []}
Created: "2024-04-25T15:29:45.02Z"
Description: ""
DescriptionRaw: ""
EntityId: 0
Events: [Object, Object, Object, Object, Object, Object, Object, Object, Object] (9)
Fields: [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, …] (33)
FrmId: 504
Guid: "0a69e91e-3f94-4fa8-8a43-db3d2ffb4db1"
Icon: ""
IconRaw: ""
IsNew: false
Modified: "2024-06-06T15:49:51.29Z"
Name: "gen6"
Owner: null
Properties: [] (0)
ReadOnly: false
StyleScriptDefinition: {Override: false, Inherits: false, Code: "", InheritedCode: null, Fields: [], …}
Tags: null
Url: "/c/form.htm?_id=generic6"
UrlRaw: "[APPVIRTUALROOT]/form.htm?_id=generic6"
UserProperties: [] (0)
*/

export class Form {
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
    
    /*
    acl() {
        //todo
    }
    */

    /*
    aclGrant(account, access) {
        //todo
        var url = 'documents/' + this.id + '/acl/' + access + '/grant/' + account;
        return this.session.restClient.fetch(url, 'POST', {}, '');
    }
    */

    /*
    aclRevoke(account, access) {
        //todo
        var url = 'documents/' + this.id + '/acl/' + access + '/revoke/' + account;
        return this.session.restClient.fetch(url, 'DELETE', {}, '');
    }
    */

    /*
    aclRevokeAll(account) {
        //todo
        var url = 'documents/' + this.id + '/acl/revokeAll';
        if (account) {
            // Si viene account es un revokeAll para esa cuenta
            url += '/' + account;
        }
        return this.session.restClient.fetch(url, 'DELETE', {}, '');
    }
    */

    /*
    actions() {
        //todo
    }
    */

    /*
    get application() {
        //todo
    }
    set application(value) {
        //todo
    }
    */

    /*
    copy() {
        //todo
    }
    */

    /*
    get created() {
        //todo
    }
    */

    /*
    currentAccess(access, explicit) {
        //todo
    }
    */

    /*
    delete() {
        //todo
    }
    */

    get description() {
        return this.#json.Description;
    }
    /*
    set description(value) {
        //todo
    }
    */

    /*
    events() {
        //todo
    }
    */

    /*
    eventsList() {
        //todo
    }
    */

    fields(field) {
        var me = this;

        if (field) {
            return me.fields().get(field);

        } else {
            // Devuelve la coleccion
            if (!me.#fieldsMap) {
                var map = new DoorsMap();
                me.#json.Fields.forEach(el => {
                    map.set(el.Name, new Field(el, me));
                });
                me.#fieldsMap = map;
            }
            return me.#fieldsMap;
        }
    }

    get guid() {
        return this.#json.Guid.replaceAll('-', '');
    }
    set guid(value) {
        this.#json.Guid = value;
    }

    /*
    get icon() {
        //todo
    }
    */

    /*
    get iconRaw() {
        //todo
    }
    set iconRaw(value) {
        //todo
    }
    */

    get id() {
        return this.#json.FrmId;
    }

    /*
    get isNew() {
        //todo
    }
    */

    /*
    get modified() {
        //todo
    }
    */

    get name() {
        return this.#json.Name;
    }
    set name(value) {
        this.#json.Name = value;
    }

    get objectType() {
        return Form.objectType;
    }

    /**
    Creador del Form.
    @returns {Promise<User>}
    */
    /*
    get owner() {
        //todo
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#owner) {
                me.session.directory.accounts(me.ownerId).then(
                    res => {
                        me.#owner = res.cast2User();
                        resolve(me.#owner);
                    },
                    reject
                )
            } else {
                resolve(me.#owner);
            }
        });
    }
    */

    /**
    ACC_ID del creador del Form.
    @returns {number}
    */
    /*
    get ownerId() {
        //todo
        return this.#json.AccId
    }
    */

    /**
    @example
    properties() // Devuelve la coleccion.
    properties(property) // Devuelve el valor de la property.
    properties(property, value) // Setea el valor de la property.
    @returns {(Properties|Promise<string>)}
    */
    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    /*
    get readonly() {
        //todo
    }
    */

    /*
    save() {
        //todo
    }
    */

    /*
    search() {
        //todo
    }
    */

    /*
    searchGroups() {
        //todo
    }
    */

    get session() {
        return this.#session;
    }

    /*
    get styleScriptActiveCode() {
        //todo
    }
    */

    /*
    get styleScriptDefinition() {
        //todo
    }
    set styleScriptDefinition(value) {
        //todo
    }
    */

    get tags() {
        if (!this.#json.Tags) this.#json.Tags = {};
        return this.#json.Tags;
    }

    toJSON() {
        return this.#json;
    }

    get url() {
        return this.#json.Url;
    }

    get urlRaw() {
        return this.#json.UrlRaw;
    }
    /*
    set urlRaw(value) {
        //todo
    }
    */
    
    /**
    @example
    userProperties() // Devuelve la coleccion.
    userProperties(property) // Devuelve el valor de la userProperty.
    userProperties(property, value) // Setea el valor de la userProperty.
    @returns {(Properties|Promise<string>)}
    */
    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }
};


export class Node {
    #session;
    #debug;
    #config;
    
    constructor(session) {
        this.#session = session;
        this.#debug = false;
    }

    /**
    Completa las opciones de code con config (owner, repo, ref y fresh).
    Las opciones no se pisan, solo se completan las que no estan.
    */
    async codeOptions(code) {
        var cfg = await this.config;
        var assDef = this.session.utils.assignDefined;
        assDef(code, cfg, 'owner');
        assDef(code, cfg, 'repo');
        // ref y fresh solo se asigna si es el mismo owner y repo de la config
        let codeOwner = code.owner ? code.owner.toLowerCase() : code.owner;
        let cfgOwner = cfg.owner ? cfg.owner.toLowerCase() : cfg.owner;
        let codeRepo = code.repo ? code.repo.toLowerCase() : code.repo;
        let cfgRepo = cfg.repo ? cfg.repo.toLowerCase() : cfg.repo;
        if (codeOwner == cfgOwner && codeRepo == cfgRepo) {
            assDef(code, cfg, 'ref');
            assDef(code, cfg, 'fresh');
        }
        return code;
    }

    /**
    Levanta la configuracion de node del setting NODE_CONFIG
    Si no esta devuelve con los valores por defecto
    */
    get config() {
        var me = this;

        if (me.#config) {
            return me.#config;

        } else {
            return new Promise(async (resolve, reject) => {
                let cfg = {
                    server: 'https://node.cloudycrm.net',
                    debugServer: 'https://nodedev.cloudycrm.net',
                };

                if (me.session.serverUrl && await me.session.isLogged) {
                    // setting y userSetting
                    parseSetting(cfg, await me.session.settings('NODE_CONFIG'))
                    parseSetting(cfg, await me.session.userSettings('NODE_CONFIG'))
                }

                me.#config = cfg;
                resolve(me.#config);
            });
        }

        function parseSetting(target, setting) {
            try {
                let jsn = JSON.parse(setting);
                try { target.server = origin(jsn.server) } catch(err) {};
                try { target.debugServer = origin(jsn.debugServer) } catch(err) {};
                if (jsn.repo !== undefined) target.repo = jsn.repo;
                if (jsn.ref !== undefined) target.ref = jsn.ref;

            } catch(err) {};
        }

        function origin(value) {
            var url = new me.session.utils.URL(value);
            return url.origin;
        }
    }

    set config(value) {
        this.#config = value;
    }

    get debug() {
        return this.#debug;
    }
    set debug(value) {
        this.#debug = value ? true : false;
    }

    /**
    Ejecuta un codigo node en el servidor de eventos.
    Si se pasa doc, se simulara la ejecucion de un evento sincrono js,
    devolviendo el json del doc con los cambios que haya realizado el codigo.

    @example
    exec({ code: `console.log('Hello world')` });
    o
    exec({
        code: {
            owner, // Opcional, def CloudyVisionArg
            repo, // Opcional, def cdn
            ref, // Opcional, branch o tag. def el main del repo.
            path, // Requerido
            fresh, // Opcional, def false
        },
        payload, // Informacion para el codigo que se va a ejecutar
        apiKey, // Opcional, para hacer la llamada con este apiKey (sino se utiliza authToken o apiKey de la sesion)
        url, // Pasar true para obtener la url, que ejecuta el job con GET
        doc, // Opcional, el id o json de un documento
        folder, // Opcional, el id o json de un folder
        returnFetch, // Opcional, def false. Devuelve el fetch en vez de la respuesta
    });
    */
    exec(options) {
        let me = this;
        let utils = me.session.utils;

        if (typeof(options.code) == 'string') {
            // Vino el codigo
            return me.exec({
                code: {
                    repo: 'Global',
                    path: 'server/evalapi.js',
                },
                payload: options,
            });

        } else {
            return new Promise(async (resolve, reject) => {
                let data = {
                    serverUrl: me.session.serverUrl,
                    //events: await me.codeOptions(options.code),
                    doc: options.doc,
                    folder: options.folder,
                    payload: options.payload,
                }

                if (me.session.apiKey || options.apiKey) {
                    data.apiKey = options.apiKey ? options.apiKey : me.session.apiKey;
                } else if (me.session.authToken) {
                    data.authToken = me.session.authToken;
                }

                let code = await me.codeOptions(structuredClone(options.code));
                code.exec = true;
                let srv = await me.server;
                if (srv) code.server = srv;

                let url = me.inNode ? _incjs.ghCodeUrl(code) : ghCodeUrl(code);

                if (options.url) {
                    url += '?msg=' + encodeURIComponent(utils.jsonStringify(data));
                    resolve(url);

                } else {
                    let args = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: utils.jsonStringify(data),
                    };

                    if (options.returnFetch) {
                        resolve(fetch(url, args));
                        
                    } else {
                        let res = await fetch(url, args);

                        if (res.ok) {
                            let buf = new SimpleBuffer(await res.arrayBuffer());
                            try {
                                let json = utils.jsonParse(buf.toString());
                                if (json.__type__) {
                                    resolve(json.__type__ == 'Date' ? new Date(json.__value__) : json.__value__);
                                } else {
                                    resolve(json);
                                }

                            } catch(err) {
                                resolve(buf);
                            }

                        } else {
                            let err;
                            try {
                                let txt = await res.text();
                                let json = JSON.parse(txt);
                                err = utils.deserializeError(json);
                        
                            } catch(e) {
                                err = new Error(res.status + ' (' + res.statusText + ')');
                            }
                            reject(err);
                        }
                    }
                }
            });
        }
    }

    get inNode() {
        return inNode();
    }

    /**
    Permite llamar un metodo de un modulo mjs del servidor

    @example
    modCall({
        module: {
            owner // Opcional, def CloudyVisionArg
            repo // Opcional, def cdn
            path // Requerido
            fresh // Opcional, def false
        },
        method, // Nombre del metodo
        args, // Argumentos para el metodo. Si el metodo tiene multiples argumentos enviarlos como un array.
        doc, // Opcional, id o json del documento para el seteo de contexto en el server
        folder, // Opcional, id o json del folder para el seteo de contexto en el server
    });
    */
    async modCall(options) {
        //todo: soporte para apiKey y url
        let xOpt = {
            code: { repo: 'Global', path: 'server/modproxy.js' },
            payload: options,
        };
        if (options.doc) {
            xOpt.doc = options.doc;
            delete options.doc;
        }
        if (options.folder) {
            xOpt.folder = options.folder;
            delete options.folder;
        }
        return await this.exec(xOpt);
    }

    get server() {
        var me = this;
        return new Promise(async (resolve, reject) => {
            var cfg = await me.config;
            resolve(me.debug ? cfg.debugServer : cfg.server);
        })
    }

    /**
    Devuelve un EventSource suscripto a los eventos del servidor
    https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events

    @example
    const serverEvents = await dSession.node.serverEvents();

    // Recibe eventos de un tipo especifico
    serverEvents.addEventListener('event_type', (ev) => {
        let data = ev.data;
        // procesar ...
    })

    // Recibe eventos sin tipo
    serverEvents.onmessage = (ev) => {
        let data = ev.data;
        // procesar ...
    })
    */
    async serverEvents() {
        let me = this;
        if (typeof(EventSource) == 'function' && typeof(window) == 'object') {
            let ins = (await me.session.instance).Name;
            if (!window.drsServerEvents) {
                let es = new EventSource(await me.server + 
                    '/ssevents?ins=' + encodeURIComponent(ins));
                window.drsServerEvents = es;

                /*
                todo: mejorar la reconexion
                https://www.npmjs.com/package/reconnecting-eventsource

                es.onerror = ev => {
                    console.log('error', es.readyState);
                }
                es.onopen = ev => {
                    console.log('open', es.readyState);
                }
                setInterval(() => {
                    console.log('readyState', es.readyState);
                }, 1000);
                */
            }
            return window.drsServerEvents;

        } else {
            throw new Error('serverEvents runs only on client side');
        }
    }

    /**
    Dispara un evento del servidor
    https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
    
    @example
    dSession.node.serverEventsDispatch({
        type: 'myEvnType',
        data: 'string or object with event info',
    });
    */
    async serverEventsDispatch(options) {
        let me = this;
        let ins = (await me.session.instance).Name;
        if (options.instance == undefined) options.instance = ins;
        return await fetch(await me.server + '/ssevents' , {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(options),
        });
    }

    /**
    @returns {Session}
    */
    get session() {
        return this.#session;
    }    
}


export class Properties extends DoorsMap {
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
            '&objectName=' + this.session.utils.encUriC(restArgs.objName);

        this.#loadProm = this.session.restClient.fetch(this.#restUrl, 'GET', '', '');
        this.#loadProm.then(
            res => {
                if (Array.isArray(res)) {
                    res.forEach(el => {
                        var prop = new Property(el, me);
                        super.set(prop.name, prop);
                    })
                }
            },
            err => {
                // No hago nada, queda la coleccion vacia
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

    has(key) {
        var me = this;
        return new Promise((resolve, reject) => {
            me.#loadProm.then(
                () => { resolve(super.has(key)) },
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
        var me = this;

        if (key === undefined) {
            return this; // La coleccion

        } else if (value === undefined) {
            // El value
            return new Promise((resolve, reject) => {
                me.get(key).then(
                    prop => {
                        resolve(prop ? prop.value() : undefined);
                    },
                    reject
                );
            });

        } else {
            // Setea
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

    get size() {
        var me = this;
        return new Promise((resolve, reject) => {
            me.#loadProm.then(
                () => { resolve(super.size) },
                reject
            )
        });
    }

    get user() {
        return this.#user;
    }
}


export class Property {
    #parent;
    #json;

    constructor(property, parent) {
        this.#json = property;
        this.#parent = parent;
    }

    get created() {
        return this.session.utils.cDate(this.#json.Created);
    }

    get modified() {
        return this.session.utils.cDate(this.#json.Modified);
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

    value(value) {
        if (value === undefined) {
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


export class Push {
    #session;
    
    constructor(session) {
        this.#session = session;
    }

    register(settings) {
        var url = 'notifications/devices';
        return this.session.restClient.fetch(url, 'POST', settings, 'notificationReceiver');
    }

    // todo dejar esta cdo se cierre el issue 251
    /*
    send(msg) {
        msg.to = Array.isArray(msg.to) ? msg.to : [msg.to];

        var nots = [];

        var notW = {};
        notW.Title = msg.title;
        notW.Body = msg.body;
        if (msg.data) {
            if (!msg.data.guid) msg.data.guid = this.session.utils.getGuid();
            notW.JsonExtraParameters = this.stringifyData(msg.data);
        }

        for (var el of msg.to) {
            var n = {};
            Object.assign(n, notW);
            n.AccId = el;
            //notW.LoginName = 'jorge@cloudy.ar'; // todo: en q casos se usa?
            nots.push(n);
        }

        var url = '/notification';
        return this.session.restClient.fetch(url, 'PUT', nots, 'notificationsW');
    }
    */

    /**
    Envia una notificacion push
    @example
    send({
        to // accId (pueden ser grupos), puede ser un array
        title // Titulo.
        body // Cuerpo.
        data: { // Los datos que quiera agregar, ej:
            doc_id: 555,
            fld_id: 111,
            // (el guid se genera solo)
        }
    }
    @returns {Promise}
    */
    async send(msg) {
        msg.to = Array.isArray(msg.to) ? msg.to : [msg.to];
        for (var el of msg.to) {
            var notW = {};
            notW.to = el;
            notW.title = msg.title;
            notW.body = msg.body;
            if (msg.data) {
                if (!msg.data.guid) msg.data.guid = this.session.utils.getGuid();
                notW.JsonExtraParameters = this.stringifyData(msg.data);
            }

            var url = '/notification';
            await this.session.restClient.fetch(url, 'PUT', notW, 'notificationW');
        }
    }

    get session() {
        return this.#session;
    }
    
    stringifyData(data) {
        if (typeof(data) == 'string') {
            return data;
        } else {
            return JSON.stringify(data, (key, value) => {
                if (key == '' || typeof(value) == 'string') return value;
                if (typeof(value) == 'number' || typeof(value) == 'boolean') return value.toString();
            });
        }
    }

    /** Alias de unregister. */
    unreg(regType, regId) {
        return this.unregister(regType, regId);
    }

    unregister(regType, regId) {
        var url = 'notifications/devices';
        var params = 'providerType=' + this.session.utils.encUriC(regType) + 
            '&registrationId=' + this.session.utils.encUriC(regId);
        return this.session.restClient.fetch(url, 'DELETE', params, '');
    }
}


export class User extends Account {
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


export class Utilities {
    #session;
    #cache;
    #execapiAcao;
    
    constructor(session) {
        this.#session = session;
        this.#cache = new DoorsMap();
    }

    /**
    Devuelve el ArrayBuffer de un Blob, Buffer o Uint8Array
    */
    async arrBuffer(value) {
        let ret;
        if (value instanceof Blob) {
            ret = await value.arrayBuffer();
        } else if (value instanceof Buffer) {
            //todo: chequear
            ret = value.buffer;
        } else if (value instanceof ArrayBuffer) {
            ret = value;
        } else if (value instanceof Uint8Array) {
            ret = value.buffer;
        }
        return ret;
    }

    /**
    Asigna la property del objeto source al objeto target, solo si tiene valor.
    Override indica si se sobreescribe la prop en target, o si se asigna
    solo si no esta definida.
    */
    assignDefined(target, source, property, override) {
        if (source && source[property] !== undefined && (target[property] === undefined || override)) {
            target[property] = source[property];
        }
    }

    /**
    Loop asincrono, utilizar cuando dentro del loop tengo llamadas asincronas
    que debo esperar antes de realizar la prox iteracion.
    Si en iterations paso undefined, se repite el loop hasta loop.break()
    La funcion de callback es opcional, puedo hacer await del loop.

    @example
    await asyncLoop(10,
        function (loop) {
            console.log(loop.iteration()); // Nro de iteracion
            setTimeout(function () {
                loop.next(); // Ejecuta la prox iteracion
            }, 0);
            
            //loop.break(); // Finaliza el loop
        },
        function() {
            // Opcional
            console.log('Loop terminado')
        }
    );
    */
    asyncLoop(iterations, loopFunc, callback) {
        return new Promise((resolve, reject) => {
            var index = 0;
            var done = false;
            var loop = {
                next: function() {
                    if (done) return;
            
                    if (iterations === undefined || index < iterations) {
                        index++;
                        loopFunc(loop);
                    } else {
                        done = true;
                        if (callback) callback();
                        resolve(true);
                    }
                },
            
                iteration: function() {
                    return index - 1;
                },
            
                break: function() {
                    done = true;
                    if (callback) callback();
                    resolve(false);
                }
            };
            loop.next();
        });
    }

    base64ToBuffer(value) {
        return this.newSimpleBuffer(Array.from(atob(value), el => { return el.charCodeAt(0) }));
    }

    /**
    Cache de uso gral. El cache se almacena en la instancia del objeto Session,
    y solo trabaja en el ambito de la misma.
    @example
    cache('myKey'); // Obtiene el valor almacenado en el cache, devuelve undefined si no esta o expiró
    cache('myKey', myValue, 60); // Almacena myValue con la clave myKey por 60 segundos.
    cache('myKey', myValue); // Almacena por 300 segs (5 mins), valor por defecto de seconds.
    */
    cache(key, value, seconds) {
        if (value === undefined) {
            // get
            if (this.#cache.has(key) && this.#cache.get(key).expires > Date.now()) {
                //console.log('Cache hit: ' + key);
                return this.#cache.get(key).value;
            }

        } else {
            // set
            this.#cache.set(key, {
                value: value,
                expires: Date.now() + (seconds ? seconds * 1000 : 300000),
            });
        }
    }

    /** Alias de cBoolean */
    cBool(number) {
        return this.cBoolean(number);
    }

    /**
    Convierte a Boolean
    @returns {Boolean}
    */
    cBoolean(value) {
        let v = value;
        if (v === undefined || v === null) return false;
        if (typeof(v) == 'boolean') return v;
        if (typeof(v) == 'string') {
            v = v.trim().toLowerCase();
            return v == 'false' || value == '0' || v == '' ? false : true;
        }
        return Boolean(value);
    }

    /**
    Convierte a Date
    @returns {Date}
    */
    cDate(date, format) {
        let me = this;
        var dt;
        if (date == null || date === undefined) return null;

        if (Object.prototype.toString.call(date) === '[object Date]') {
            dt = date;
        } else if (me.moment.isMoment(date)) {
            dt = date.toDate();
        } else {
            if (this.isIsoDate(date)) {
                dt = new Date(date);
            } else {
                let f = format ? format : 'L LTS';
                dt = me.moment(date, f).toDate(); // moment con locale
                if (isNaN(dt.getTime())) dt = me.moment(date).toDate(); // moment sin format
                if (isNaN(dt.getTime())) dt = new Date(date); // nativo
            }
        }
        if(!isNaN(dt.getTime())) {
            return dt;
        } else {
            return null;
        }
    }

    /** Alias de cNumber */
    cNum(number) {
        return this.cNumber(number);
    }

    /**
    Convierte a number
    @returns {number}
    */
    cNumber(number) {
        var num;
        if (Object.prototype.toString.call(number) === '[object Number]') {
            num = number;
        } else {
            num = this.numeral(number).value();
        }
        return num;
    }

    /** https://github.com/jshttp/content-disposition */
    get contentDisposition() {
        if (!_contentDisposition) throw new Error(utilsNotLoadedErr);
        return _contentDisposition;
    }
    
    /**
    Devuelve el valor de una cookie, solo para la web.
    */
    cookie(name) {
        var cookies = decodeURIComponent(document.cookie).split('; ');
        var key = name + '=';
        var ret;
        cookies.forEach(val => {
            if (val.indexOf(key) === 0) {
                ret = val.substring(key.length);
            }
        })
        return ret;
    }

    /** https://code.google.com/archive/p/crypto-js/ */
    get cryptoJS() {
        if (!_CryptoJS) throw new Error(utilsNotLoadedErr);
        return _CryptoJS;
    }

    /**
    Convierte a buffer un binario en base64 con prefijo
    */
    decodeBuffer(str) {
        let me = this;
        let prefix = '__base64__=>';

        if (typeof str == 'string' && str.substring(0, prefix.length) == prefix) {
            if (me.session.node.inNode) {
                return Buffer.from(atob(str.substring(prefix.length)), 'binary');
            } else {
                // Devuelve un SimpleBuffer
                return me.base64ToBuffer(str.substring(prefix.length));
            }
        } else {
            return str;
        }
    }

    decrypt(pString, pPass) {
        let pwd = pPass === undefined ? '' : pPass;
        return this.cryptoJS.AES.decrypt(pString, pwd).toString(this.cryptoJS.enc.Utf8)
	}

    /**
    Object.assign recursivo
    https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
    */
    deepAssign(target, ...sources) {
        let me = this;
        if (!sources.length) return target;
        const source = sources.shift();
      
        if (me.isObject(target) && me.isObject(source)) {
            for (const key in source) {
                if (me.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    me.deepAssign(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        return me.deepAssign(target, ...sources);
    }

    deserializeError(err) {
        if (!_serializeError) throw new Error(utilsNotLoadedErr);
        return _serializeError.deserializeError(err);
    }

    /**
    Convierte un buffer binario a base64 con prefijo
    */
    encodeBuffer(value) {
        let me = this;
        let prefix = '__base64__=>';
        let cls = value && value.constructor ? value.constructor.name : undefined;

        if (cls == 'SimpleBuffer') {
            return prefix + value.toString('base64');

        } else if (cls == 'Uint8Array') {
            return prefix + me.newSimpleBuffer(value.buffer).toString('base64');

        } else if (cls == 'ArrayBuffer') {
            return prefix + me.newSimpleBuffer(value).toString('base64');

        } else {
            //todo: Falta Buffer de node
            return value;
        }
    }

    encrypt(pString, pPass) {
        let pwd = pPass === undefined ? '' : pPass;
        return this.cryptoJS.AES.encrypt(pString, pwd).toString();
    }

    /**
    Hace un encodeURIComponent, devolviendo '' si value es null o undefined.
    @returns {string}
    */
    encUriC(value) {
        return (value == null || value === undefined) ? '' : encodeURIComponent(value);
    }

    /** Devuelve el mensaje de un objeto err */
    errMsg(err) {
        if (typeof(err) == 'string') {
            return err;
        } else if (typeof(err) == 'object') {
            if (err instanceof Error) {
                return err.constructor.name + (err.message ? ': ' + err.message : '');
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

    /**
    Hace una peticion de prueba a execapi.asp para determinar si hay agregar
    el header Access-Control-Allow-Origin. Esto es porque si el server lo esta
    haciendo y la execapi lo agrega de nuevo da el error
    Access-Control-Allow-Origin cannot contain more than one origin.
    */
    get execapiAcao() {
        var me = this;
        return new Promise(async (resolve, reject) => {
            if (me.#execapiAcao !== undefined) {
                resolve(me.#execapiAcao);

            } else {
                // Peticion de prueba sin ACAO
                var data = 'AuthToken=' + encodeURIComponent(this.session.authToken) +
                '&code=' + encodeURIComponent('Response.Write "OK"');
                
                try {
                    var res = await fetch(this.session.serverUrl.replace('/restful', '/c/execapi.asp'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                        body: data,
                    });
                    me.#execapiAcao = 0;

                } catch(err) {
                    me.#execapiAcao = 1;
                }
                resolve(me.#execapiAcao);
            }
        });
    }

    async execNode(options) {
        console.log('Metodo deprecado, usar dSession.node.exec');
        return this.session.node.exec(options);
    }

    /**
    Ejecuta un codigo vbs via execapi.asp.
    payload es un objeto con pares clave-valor que se agregan al body
    */
    async execVbs(code, payload) {
        //todo: soporte para apiKey
        var data = 'AuthToken=' + encodeURIComponent(this.session.authToken) +
            '&code=' + encodeURIComponent(code) +
            '&addACAO=' + encodeURIComponent(await this.execapiAcao);
        
        if (payload) {
            for (let key of Object.keys(payload)) {
                data += '&' + key + '=' + encodeURIComponent(payload[key]);
            }
        }
    
        var res = await fetch(this.session.serverUrl.replace('/restful', '/c/execapi.asp'), {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
            body: data,
        })
    
        if (!res.ok) {
            var txt = await res.text();
            var err;
            try {
                var js = JSON.parse(txt);
                err = new Error();
                err.name = js.source;
                err.message = js.description + ' at line ' + js.line + '\n' + js.code;
                err.lineNumber = js.line;
            } catch (e) {
                console.error(e);
                err = new Error(txt);
            }
            throw err;
    
        } else {
            return res;
        }
    }

    /** https://github.com/NaturalIntelligence/fast-xml-parser */
    get fastXmlParser() {
        if (!_fastXmlParser) throw new Error(utilsNotLoadedErr);
        return _fastXmlParser;
    }

    getGuid() {
        var uuid = '', i, random;
        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;
    
            if (i == 8 || i == 12 || i == 16 || i == 20) {
                uuid += '-';
            }
            uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    }

    /** Alias de htmlEncode */
    htmlEnc(text, options) {
        return this.htmlEncode(text, options);
    }

    /**
    options se usa solo en node. Ver detalle: https://github.com/mdevils/html-entities
    */
    htmlEncode(text, options) {
        if (this.session.node.inNode) {
            return this.htmlEntities.encode(text, options);

        } else {
            // todo: conviene hacerlo con htmlEntities?
            var sp = document.createElement('span');
            sp.textContent = text;
            return sp.innerHTML;
        }
    }

    /** https://github.com/mdevils/html-entities */
    get htmlEntities() {
        if (!_htmlEntities) throw new Error(utilsNotLoadedErr);
        return _htmlEntities;
    }

    /**
    Importa un modulo.
    Se puede usar desde el cliente o el servidor.
    module puede ser un string, o un objeto para códigos del repo.
    @example
    // server
    let mod = await dSession.utils.import('fast-xml-parser');
    // client
    let mod = await dSession.utils.import('https://cdn.jsdelivr.net/npm/fast-xml-parser/+esm');
    // repo
    let mod = await dSession.utils.import({ repo: 'Global', path: 'workflow.mjs' });
    */
    async import(module) {
        let me = this;

        await utilsPromise;

        let ret;
        if (typeof(module) == 'object') {
            if (me.session.node.inNode) {
                // Server
                ret = await _mainlib.gitImport(module);
            } else {
                // Client
                ret = await import(window.gitCdn(Object.assign({ url: true }, module)));
            }
        } else {
            ret = await import(module);
        }

        if (ret.default) ret = ret.default;
        return ret;
    }

    inNode() {
        console.log('Metodo deprecado, usar dSession.node.inNode');
        return this.session.node.inNode();
    }

    /** Devuelve true si es un string con formato fecha ISO8601 valido */
    isIsoDate(str) {
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str) 
            && !/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/.test(str)) return false;
        const d = new Date(str); 
        return d instanceof Date && !isNaN(d.getTime())
            && d.toISOString().substring(0, 19) === str.substring(0, 19); // Corto los ms xq el search no los trae
    }

    /** Retorna true si value es un objeto puro {} */
    isObject(value) {
        return (value && value.constructor && value.constructor.name == 'Object');
    }

    /** Devuelve la fecha en formato YYYY-MM-DD */
    isoDate(date) {
        var dt = this.cDate(date);
        if (dt) {
            return dt.getFullYear() + '-' + this.lZeros(dt.getMonth() + 1, 2) + '-' +
                this.lZeros(dt.getDate(), 2);
        } else {
            return null;
        }
    }

    /** Devuelve la hora en formato HH:MM:SS */
    isoTime(date, seconds) {
        var dt = this.cDate(date);
        if (dt) {
            return this.lZeros(dt.getHours(), 2) + ':' + this.lZeros(dt.getMinutes(), 2) +
                (seconds ? ':' + this.lZeros(dt.getSeconds(), 2) : '');
        } else {
            return null;
        }
    }    

    /**
    Recorre el json y convierte a buffer los binarios en base64
    */
    jsonBuffers(json) {
        var me = this;

        for (var key in json) {
            if (typeof json[key] == 'object' && json[key] !== null)
                me.jsonBuffers(json[key]);
            else if (typeof json[key] == 'string') {
                json[key] = me.decodeBuffer(json[key]);
            }
        }
    }

    /**
    Parse con soporte para buffers binarios en base64 y funciones
    */
    jsonParse(value) {
        var me = this;
        let fnPrefix = '__function__=>';

        return JSON.parse(value, (key, val) => {
            if (typeof val == 'string') {
                if (val.substring(0, fnPrefix.length) == fnPrefix) {
                    let fn;
                    eval('fn = ' + val.substring(fnPrefix.length));
                    return fn;
                } else {
                    return me.decodeBuffer(val);
                }
            } else {
                return val;
            }
        });
    }

    /**
    Replacer para JSON.stringify que incluye el path.
    @example
    // Incluye solo algunas propiedades raiz completas
    JSON.stringify(myObject, dSession.utils.jsonReplacerWithPath(function (key, value, path) {
        let rootProps = ['prop1', 'prop2', ...];
        let root = path.split('.')[0];
        if (path == '' || rootProps.indexOf(root) >= 0) return value;
    }))
    */
    jsonReplacerWithPath(replacer) {
        let m = new Map();
      
        return function(key, value) {
            let path = m.get(this) + (Array.isArray(this) ? `[${key}]` : '.' + key); 
            if (value === Object(value)) m.set(value, path);  
            return replacer.call(this, key, value, path.replace(/undefined\.\.?/,''));
        }
    }
    
    /**
    Stringify con soporte para buffers binarios (los pasa a base64) y funciones
    */
    jsonStringify(value) {
        let me = this;
        let fnPrefix = '__function__=>';

        return JSON.stringify(value, (key, val) => {
            if (typeof(val) == 'function') {
                return fnPrefix + val.toString();
            } else {
                return me.encodeBuffer(val);
            }
        });
    }

    async load() {
        await utilsPromise;
    }

    /** Completa con ceros a la izquierda */
    lZeros(string, length) {
        return ('0'.repeat(length) + string).slice(-length);
    }

    /** https://momentjs.com/docs/ */
    get moment() {
        if (!_moment) throw new Error(utilsNotLoadedErr);
        return _moment;
    }

    /**
    @returns {DoorsMap}
    */
    newDoorsMap() {
        return new DoorsMap();
    }

    newErr(err) {
        console.warn('Metodo deprecado');

        var e;
        if (err instanceof Error) {
            e = err;
        } else {
            e = new Error(this.errMsg(err));
        }
        return e;
    }

    /**
    @returns {Session}
    */
    newSession() {
        let constructor = this.session.constructor.name == 'AppSession'
            ? Object.getPrototypeOf(this.session.constructor)
            : this.session.constructor;
        return new constructor(...arguments);
    }

    /**
    @returns {SimpleBuffer}
    */
    newSimpleBuffer() {
        return new SimpleBuffer(...arguments);
    }

    /** http://numeraljs.com/ */
    get numeral() {
        if (!_numeral) throw new Error(utilsNotLoadedErr);
        return _numeral;
    }

    /** Devuelve una property de un objeto (Case Insensitive) */
    objPropCI(obj, prop) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].toLowerCase() == prop.toLowerCase()) {
                return obj[keys[i]];
            }
        }
    }

    /**
    Parsea un header Content-Disposition 
    https://github.com/jshttp/content-disposition
    */
    parseContentDisposition(contentDisposition) {
        let me = this;
        let cd = contentDisposition;
        // Si tiene ; al ult lo saco
        if (cd.substring(cd.length - 1) == ';') cd = cd.slice(0, -1);
        return me.contentDisposition.parse(cd);
    }

    /** https://github.com/sindresorhus/serialize-error */
    serializeError(err) {
        if (!_serializeError) throw new Error(utilsNotLoadedErr);
        return _serializeError.serializeError(err);
    }

    /**
    Devuelve la fecha del server
    options:
        'app': La fecha del servidor de aplicaciones
        'db': La fecha del servidor de base de datos
        'earliest' (def): La menor de las 2
        'latest': La mayor de las 2
    */
    async serverDate(options) {
        let me = this;
        let appDate, dbDate;
        let opt = options === undefined ? 'earliest' : options.toLowerCase();

        if (opt != 'db') {
            let appRes = await me.execVbs('Response.Write dSession.Xml.XmlEncode(Now, 2)');
            appDate = me.xmlDec(await appRes.text(), 2);
        }
        if (opt != 'app') {
            let dbRes = await me.session.db.openRecordset('select getdate() dt')
            dbDate = me.cDate(dbRes[0]['dt']);
        }

        if (opt == 'app') {
            return appDate;
        } else if (opt == 'db') {
            return dbDate;
        } else if (opt == 'earliest') {
            return appDate < dbDate ? appDate : dbDate;
        } else if (opt == 'latest') {
            return appDate > dbDate ? appDate : dbDate;
        } else {
            throw new Error('Unknown option: ' + opt);
        }
    }

    /**
    @returns {Session}
    */
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

    get URL() {
        return _URL;
    }

    /**
    Retorna la fecha actual sin hora, para asignar a un campo.
    Es equivalente al Date de vbs.
    @example
    doc.fields('DIA').value = dSession.utils.today();
    */
    today() {
        //todo: el timeDiff no deberia estar hardcode
        //todo: lo dejo en 0 pero no tengo claro tema timediff
        return new Date(new Date().setHours(0, 0, 0, 0));
        //return new Date((new Date()).setHours(-3, 0, 0, 0));
    }

    /**
    Encodea un string de vbs agregando las comillas dobles al comienzo y final
    y escapando comillas dobles, \r y \n
    @returns {string}
    */
    vbsEncodeString(text) {
        let ret = text;
        ret = ret.replaceAll('"', '""');
        ret = ret.replaceAll('\r\n', '" & vbCrLf & "');
        ret = ret.replaceAll('\r', '" & vbCr & "');
        ret = ret.replaceAll('\n', '" & vbLf & "');
        ret = '"' + ret + '"';
        if (ret.substring(0, 5) == '"" & ') ret = ret.substring(5);
        if (ret.substring(ret.length - 5) == ' & ""') ret = ret.substring(0, ret.length - 5);
        return ret;
    }

    /** Alias de xmlDecode */
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
            throw new Error('Unknown type: ' + type);
        }
    }

    /** Alias de xmlEncode */
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
             new Error('Unknown type: ' + type);
        }
    }

    /**
    options: https://github.com/NaturalIntelligence/fast-xml-parser/blob/HEAD/docs/v4/2.XMLparseOptions.md
    */
    xmlParser(options) {
        return new this.fastXmlParser.XMLParser(options);
    }
}


export class View {
    static objectType = 4;
    #json;
    #parent;
    #session;
    #properties;
    #userProperties;
    #hasFilter;
    #owner;
    #loaded;

    //var url = 'folders/' + me.id + '/views/' + 4795;
    //no estan {"Inherits":true,"FldIdOld":0, "AclInfo":null,"AclInherits":false,"IsNew":false}


    constructor(view, session, folder) {
        this.#json = view;
        this.#hasFilter = view.HasFilter;
        this.#session = session;
        if (folder) this.#parent = folder;
        this.#loaded = view.Definition ? true : false;
    }

    async _asyncGet(property) {
        await this._load();
        return this.#json[property];
    }

    async _load() {
        if (!this.#loaded) {
            var url = 'folders/' + this.parentId + '/views/' + this.id;
            var res = await this.session.restClient.fetch(url, 'GET', '', '');
            // Para no pisar las que puedan haber cambiado
            Object.assign(res, this.#json);
            this.#json = res;
            if (!this.#json.Tags) this.#json.Tags = {};
            this.#loaded = true;
        }
        return this.#json;
    }

    /*
    acl() {
        //todo
    }
    */

    /*
    aclGrant(account, access) {
        //todo
        var url = 'documents/' + this.id + '/acl/' + access + '/grant/' + account;
        return this.session.restClient.fetch(url, 'POST', {}, '');
    }
    */

    /*
    aclInherited() {
        //todo
    }
    */

    /*
    get aclInherits() {
        //todo
    }
    */

    /*
    aclOwn() {
        //todo
    }
    */

    /*
    aclRevoke(account, access) {
        //todo
        var url = 'documents/' + this.id + '/acl/' + access + '/revoke/' + account;
        return this.session.restClient.fetch(url, 'DELETE', {}, '');
    }
    */

    /*
    aclRevokeAll(account) {
        //todo
        var url = 'documents/' + this.id + '/acl/revokeAll';
        if (account) {
            // Si viene account es un revokeAll para esa cuenta
            url += '/' + account;
        }
        return this.session.restClient.fetch(url, 'DELETE', {}, '');
    }
    */
    
    get created() {
        return this.session.utils.cDate(this.#json.Created);
    }

    get comments() {
        return this.#json.Comments;
    }
    set comments(value) {
        this.#json.Comments = value;
    }

    get definition() {
        return this._asyncGet('Definition');
    }
    set definition(value) {
        this.#json.Definition = value;
    }

    get description() {
        return this.#json.Description;
    }
    set description(value) {
        this.#json.Description = value;
    }

    get descriptionRaw() {
        return this._asyncGet('DescriptionRaw');
    }
    set descriptionRaw(value) {
        this.#json.DescriptionRaw = value;
    }

    get folder() {
        return this.parent
    }

    get folderId() {
        return this.parentId
    }

    get hasFilter() {
        return this.#hasFilter;
    }

    get id() {
        return this.#json.VieId;
    }

    get modified() {
        return this.session.utils.cDate(this.#json.Modified);
    }

    get name() {
        return this.#json.Name;
    }
    set name(value) {
        this.#json.Name = value;
    }

    get objectType() {
        return View.objectType;
    }

    get owner() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#owner) {
                me.session.directory.accounts(me.ownerId).then(
                    res => {
                        me.#owner = res.cast2User();
                        resolve(me.#owner);
                    },
                    reject
                )
            } else {
                resolve(me.#owner);
            }
        });
    }

    get ownerId() {
        return this.#json.AccId;
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
        return this.#json.FldId;
    }

    get private() {
        return this.#json.Private;
    }
    set private(value) {
        this.#json.Private = value;
    }

    /**
    @example
    properties() // Devuelve la coleccion.
    properties(property) // Devuelve el valor de la property.
    properties(property, value) // Setea el valor de la property.
    @returns {(Properties|Promise<string>)}
    */
    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.set(property, value);
    }

    async save() {
        var url = 'folders/' + this.parentId + '/views';
        var res = await this.session.restClient.fetch(url, 'POST', this.#json, 'view');
        var id = res.VieId;
        // Actualiza el json
        url = 'folders/' + this.parentId + '/views/' + id;
        res = await this.session.restClient.fetch(url, 'GET', '', '');
        this.#json = res;
        this.#hasFilter = res.HasFilter;
        this.#loaded = res.Definition ? true : false;
    }

    get session() {
        return this.#session;
    }

    get styleScript() {
        return this._asyncGet('StyleScriptDefinition');
    }
    set styleScript(value) {
        this.#json.StyleScriptDefinition = value;
    }

    get tags() {
        return this._asyncGet('Tags');
    }

    get type() {
        return this.#json.Type;
    }
    set type(value) {
        this.#json.Type = value;
    }

    /**
    @example
    userProperties() // Devuelve la coleccion.
    userProperties(property) // Devuelve el valor de la userProperty.
    userProperties(property, value) // Setea el valor de la userProperty.
    @returns {(Properties|Promise<string>)}
    */
    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.set(property, value);
    }
}


class RestClient {
    #session;

    constructor(session) {
        this.#session = session;
    }

    fetch(url, method, parameters, parameterName) {
        var me = this;
        let data = null;
        //TODO Check if ends with /
        let completeUrl = me.session.serverUrl + '/' + url;

        var headers = me.credentials();
        headers['Content-Type'] = 'application/json';

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
            // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
            fetch(completeUrl, {
                method: method,
                cache: 'no-cache',
                headers: headers,
                body: data != null ? data : null,
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
                    let parsedJson;
                    try {
                        parsedJson = JSON.parse(textBody);
                    } catch(err) {
                        debugger;
                        console.warn('Cannot parse server response', completeUrl, textBody);
                    }
                    if (response.ok) {
                        resolve(parsedJson.InternalObject);
                    } else {
                        if (parsedJson) {
                            let err = new Error(me.session.utils.errMsg(parsedJson));
                            err.doorsException = parsedJson;
                            reject(err);
                        } else {
                            reject(new Error(response.status + ' (' + response.statusText + ')'))
                        }
                    }
                });
            }).catch((error) => {
                debugger;
                reject(error);
            });
        });
    }

    fetchRaw(url, method, data) {
        var me = this;
        var completeUrl = me.session.serverUrl + '/' + url;
        var headers = me.credentials();

        return new Promise((resolve, reject) => {
            // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
            fetch(completeUrl, {
                method: method,
                cache: 'no-cache',
                headers: headers,
                body: data ? data : null,

            }).then(
                response => {
                    if (response.ok) {
                        resolve(response);
                    } else {
                        response.text().then(
                            res => {
                                debugger;
                                let json = JSON.parse(res);
                                reject(new Error(me.session.utils.errMsg(json)));
                            }
                        );
                    }
                },
                err => {
                    debugger;
                    reject(err);
                }
            )
        });


    };

    /**
    @returns {Session}
    */
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

    credentials() {
        var ret = {};
        if (this.session.authToken) {
            ret.AuthToken = this.session.authToken;
        } else if (this.session.apiKey) {
            ret.ApiKey = this.session.apiKey;
        }
        return ret;
    }
};


class V8Client {
    #session;

    constructor(session) {
        this.#session = session;
    }

    credentials() {
        var ret = {};
        if (this.session.authToken) {
            ret.AuthToken = this.session.authToken;
        } else if (this.session.apiKey) {
            ret.ApiKey = this.session.apiKey;
        }
        ret.ServerUrl = this.session.serverUrl;
        return ret;
    }

    /*
    options = {
        method: 'GET',
        params: {}, // Parametros
    }
    */
    async fetch(url, options) {
        let me = this;
        await utilsPromise;

        let opt = Object.assign({
            method: 'GET',
        }, options);

        try {
            let fullUrl = (await me.session.node.server) + '/restful/' + url;
            let body;
            let params = typeof(opt.params) != 'string' ? JSON.stringify(opt.params) : opt.params;
            let method = opt.method.toUpperCase();
            if (method == 'GET' || method == 'DELETE') {
                if (params) fullUrl += '?' + params;
            } else {
                body = params;
            }
            let headers = me.credentials();
            headers['Content-Type'] = 'application/json';

            let res = await fetch(fullUrl, {
                method, headers, body,
                cache: 'no-store',
            });
            if (res.ok) {
                let resJson = await res.json();
                return resJson.InternalObject;
            } else {
                let resTxt = await res.text();
                let resJson;
                try { resJson = JSON.parse(resTxt) } catch (e) {};
                if (resJson) {
                    let err = me.session.utils.deserializeError(resJson);
                    throw err;
                } else {
                    throw new Error(resTxt);
                }
            }

        } catch(er) {
            console.error(er, { url, options });
            throw er;
        }
    }

    /**
    @returns {Session}
    */
    get session() {
        return this.#session;
    }
};