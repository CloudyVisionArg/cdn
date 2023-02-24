/*
todo: reemplazar los _metodo con #metodo cdo safari implemente 
metodos privados: https://caniuse.com/?search=private%20field
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
    
    constructor(serverUrl, authToken) {
        this.#restClient = new RestClient(serverUrl, authToken);
        this.#serverUrl = serverUrl;
        this.#authToken = authToken;
    }
    
    get authToken() {
        return this.#authToken;
    }

    set authToken(value) {
        this.#authToken = value;
        this.restClient.AuthToken = value;
    }

    /**
     * Cambia la contraseña del usuario logueado
     * @param {string} oldPassword
     * @param {string} newPassword
     * @returns Promise <bool>
     */
    changePassword(login, oldPassword, newPassword, instance) {
        var url = 'session/changepassword';

        var data = {
            login: login,
            oldPassword: oldPassword,
            newPassword: newPassword,
            instanceName: instance,
        };
        return this.restClient.asyncCall(url, 'POST', data, '');
    };

    /**
     * Devuelve el directory para acceder a informacion de usuarios
     */
    get directory() {
        if (!this.#directory) {
            this.#directory = new Directory(this);
        };
        return this.#directory;
    }

    documentsGetFromId(docId) {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'documents/' + docId;
            me.restClient.asyncCall(url, 'GET', '', '').then(
                res => {
                    resolve(new Document(res, me));
                },
                reject
            )
        });
    }

    foldersGetFromId(fldId) {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'folders/' + fldId + '';
            me.restClient.asyncCall(url, 'GET', '', '').then(
                res => {
                    resolve(new Folder(res, me));
                },
                reject
            )
        })
    };

    get isLogged() {
        var url = 'session/islogged';
        return this.restClient.asyncCall(url, 'POST', {}, '');
    };

    logoff() {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'session/logoff';
            me.restClient.asyncCall(url, 'POST', {}, '').then(
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
            me.restClient.asyncCall(url, 'POST', data, '').then(
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
        return this.restClient.asyncCall(url, 'POST', settings, 'notificationReceiver');
    }

    pushUnreg(regType, regId) {
        var url = 'notifications/devices';
        var params = 'providerType=' + encURIC(regType) + '&registrationId=' + encURIC(regId);
        return this.restClient.asyncCall(url, 'DELETE', params, '');
    }

    get restClient() {
        return this.#restClient;
    }

    runSyncEventsOnClient(value) {
        if (value == undefined) {
            var url = 'session/syncevents/runOnClient';
            return this.restClient.asyncCall(url, 'GET', '', '');
        } else {
            var url = 'session/syncevents/runOnClient/' + (value ? 'true' : 'false');
            return this.restClient.asyncCall(url, 'POST', {}, '');
        }
    }

    get serverUrl() {
        return this.#serverUrl;
    }

    set serverUrl(value) {
        this.#serverUrl = value;
        this.restClient.ServerBaseUrl = value;
    }

    settings(setting, value) {
        var url = 'settings';
        var method, params, parName;

        if (value == undefined) {
            url += '/' + encURIC(setting);
            method = 'GET';
            params = '';
            parName = ''
        } else {
            method = 'POST';
            params = { setting: {
                Setting: setting,
                Value: value
            } };
            params = { 
                Setting: setting,
                Value: value
            };
            parName = 'setting';
        }

        return this.restClient.asyncCall(url, method, params, parName);
    }

    get tags() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (me.#tags == undefined) {
                var url = 'session/tags';
                me.restClient.asyncCall(url, 'GET', '', '').then(
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
                            reject(new Error('Account not found'));
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
                me.session.restClient.asyncCall(url, 'GET', '', '').then(
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

    childAccounts(account) {
        return this._accountsGet('childAccountsList', account);
    }

    childAccountsAdd(accounts) {
        var accs = Array.isArray(accounts) ? accounts : [accounts];
        var url = 'accounts/' + this.id + '/childAccounts';
        return this.session.restClient.asyncCall(url, 'PUT', accs, 'arrayChildAccountIds');
    }

    childAccountsList() {
        return this._accountsList('ChildAccountsList', 'childAccounts');
    }

    childAccountsRecursive() {
        return this._accountsList('ChildAccountsListRecursive', 'childAccountsRecursive');
    }

    childAccountsRemove(accounts) {
        var accs = Array.isArray(accounts) ? accounts : [accounts];
        var url = 'accounts/' + this.id + '/childAccounts';
        return this.session.restClient.asyncCall(url, 'DELETE', accs, 'arrayChildAccountIds');    
    }

    delete(expropiateObjects) {
        var expObj = expropiateObjects ? true : false;
        var url = 'accounts/' + this.id + '?expropiateObjects=' + expObj;
        return this.session.restClient.asyncCall(url, 'DELETE', '', '');
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

    parentAccounts(account) {
        return this._accountsGet('parentAccountsList', account);
    }

    parentAccountsAdd(accounts) {
        var accs = Array.isArray(accounts) ? accounts : [accounts];
        var url = 'accounts/' + this.id + '/parentAccounts';
        return this.session.restClient.asyncCall(url, 'PUT', accs, 'arrayParentAccounts');    
    }

    parentAccountsList() {
        return this._accountsList('ParentAccountsList', 'parentAccounts');
    }

    parentAccountsRecursive() {
        return this._accountsList('ParentAccountsRecursive', 'parentAccountsRecursive');
    }

    parentAccountsRemove(accounts) {
        var accs = Array.isArray(accounts) ? accounts : [accounts];
        var url = 'accounts/' + this.id + '/parentAccounts';
        return this.session.restClient.asyncCall(url, 'DELETE', accs, 'arrayParentAccounts');    
    }

    properties(property, value) {
        if (!this.#properties) this.#properties = new Properties(this);
        return this.#properties.getSet(property, value);
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
            me.session.restClient.asyncCall(url, method, me.toJSON(), type).then(
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
        return this.#userProperties.getSet(property, value);
    }
}


class Application {
    #parent;
    #rootFolder;

    constructor(parent) {
        this.#parent = parent
    }

    folders(folderPath) {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'folders/' + me.rootFolderId + '/children?folderpath=' + encURIC(folderPath);
            me.session.restClient.asyncCall(url, 'GET', '', '').then(
                res => {
                    resolve(new Folder(res, me.session));
                },
                reject
            )
        });
    }

    get parent() {
        return this.#parent;
    }

    get rootFolder() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#rootFolder) {
                me.session.foldersGetFromId(me.rootFolderId).then(
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
                me.session.restClient.asyncCallXmlHttp(url, 'GET', '').then(
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
        return this.#properties.getSet(property, value);
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
        return this.#userProperties.getSet(property, value);
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
            me.session.restClient.asyncCall(url, 'GET', '', '').then(
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

            me.session.restClient.asyncCall(url, 'GET', '', '').then(
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
        return this.session.restClient.asyncCall(url, 'GET', '', '');
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
        return this.session.restClient.asyncCall(url, 'POST', {}, '');
    }

    aclRevoke(account, access) {
        var url = 'documents/' + this.id + '/acl/' + access + '/revoke/' + account;
        return this.session.restClient.asyncCall(url, 'DELETE', {}, '');
    }

    aclRevokeAll(account) {
        var url = 'documents/' + this.id + '/acl/revokeAll';
        if (account) {
            // Si viene account es un revokeAll para esa cuenta
            url += '/' + account;
        }
        return this.session.restClient.asyncCall(url, 'DELETE', {}, '');
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
                    me.session.restClient.asyncCall(url, 'GET', '', '').then(
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
        return me.session.restClient.asyncCall(url, 'DELETE', [me.id], 'docIds');
        //todo: en q estado queda el objeto?
    }

    get id() {
        return this.#json.DocId;
    }

    fields(name) {
        var me = this;

        if (name) {
            // Devuelve un field
            var field;
            field = me.#json.CustomFields.find(it => it['Name'].toLowerCase() == name.toLowerCase());
            if (!field) field = me.#json.HeadFields.find(it => it['Name'].toLowerCase() == name.toLowerCase());
            if (field) {
                return new Field(field, me);
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
                me.session.foldersGetFromId(me.parentId).then(
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
        return this.#properties.getSet(property, value);
    }

    save() {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'documents';
            me.session.restClient.asyncCall(url, 'PUT', me.#json, 'document').then(
                res => {
                    // Esta peticion se hace xq la ref q vuelve del PUT no esta actualizada (issue #237)
                    var url = 'documents/' + me.id;
                    me.session.restClient.asyncCall(url, 'GET', '', '').then(
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

                asyncLoop(attMap.size, async loop => {
                    var key = Array.from(attMap.keys())[loop.iteration()];
                    var el = attMap.get(key);      

                    if (el.isNew) {
                        var formData = new FormData(); //todo ver en node, URLSearchParams no anda, probar https://www.npmjs.com/package/form-data
                        // todo: como subimos el Tag?
                        var arrBuf = await el.fileStream;
                        formData.append('attachment', new Blob([arrBuf]), el.name);
                        formData.append('description', el.description);
                        //formData.append('group', el.group);
                        var url = 'documents/' + me.id + '/attachments';
                        proms.push(me.session.restClient.asyncCallXmlHttp(url, 'POST', formData));

                    } else if (el.removed) {
                        rm.push(el.id);
                    }
                    loop.next();

                }, () => {
                    if (rm.length > 0) {
                        var url = 'documents/' + me.id + '/attachments';
                        proms.push(me.session.restClient.asyncCall(url, 'DELETE', rm, 'arrayAttId'));
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
                            reject(new Error('saveAttachs error: ' + errMsg(err)));
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
        return this.#userProperties.getSet(property, value);
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
        return this.#properties.getSet(property, value);
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
        return this.#userProperties.getSet(property, value);
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
            me.session.restClient.asyncCall(url, 'GET', '', '').then(
                res => {
                    resolve(new Document(res, me.session, me));
                },
                reject
            )
        });
    }

    documentsNew() {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'folders/' + me.id + '/documents/new';
            me.session.restClient.asyncCall(url, 'GET', '', '').then(
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
            me.session.restClient.asyncCall(url, 'GET', '', '').then(
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
                me.session.restClient.asyncCall(url, 'GET', '', '').then(
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
                    me.session.foldersGetFromId(me.#json.ParentFolder).then(
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
        return this.#properties.getSet(property, value);
    }

    /**
     * 
     * @param {*} options: { fields, formula, order, maxDocs, recursive, maxValueLen, maxDescrLength }
     * @returns 
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

        var url = 'folders/' + this.id + '/documents';
        var params = 'fields=' + encURIC(opt.fields) + '&formula=' + encURIC(opt.formula) + 
            '&order=' + encURIC(opt.order) + '&maxDocs=' + encURIC(opt.maxDocs) + 
            '&recursive=' + encURIC(opt.recursive) + '&maxDescrLength=' + encURIC(opt.maxTextLen);

        return this.session.restClient.asyncCall(url, 'GET', params, '');
    }

    /**
     * 
     * @param {*} options: { groups, totals, formula, order, maxDocs, recursive, groupsOrder, totalsOrder }
     * @returns 
     */
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

        return this.session.restClient.asyncCall(url, 'GET', params, '');
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
        return this.#userProperties.getSet(property, value);
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
        return this.#properties.getSet(property, value);
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
        return this.#userProperties.getSet(property, value);
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

        this.#loadProm = this.session.restClient.asyncCall(this.#restUrl, 'GET', '', '');
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

    get(key) {
        var me = this;
        return new Promise((resolve, reject) => {
            me.#loadProm.then(
                () => { resolve(super.get(key)) },
                reject
            )
        });
    }

    async getSet(property, value) {
        if (property == undefined) {
            return this;
        } else if (value == undefined) {
            var prop = await this.get(property);
            if (prop) return prop.value();
        } else {
            return this.set(property, value);
        }
    }

    delete(key) {
        var me = this;
        return new Promise((resolve, reject) => {
            me.#loadProm.then(
                () => {
                    if (me.has(key)) {
                        var prop = super.get(key);
                        super.delete(key);
                        me.session.restClient.asyncCall(me.restUrl, 'DELETE', [prop.toJSON()], 'arrProperties')
                            .then(resolve, reject);
                    } else {
                        resolve(false);
                    }
                },
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
                    this.session.restClient.asyncCall(this.parent.restUrl, 'PUT', [this.#json], 'arrProperties')
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
        return this.#properties.getSet(property, value);
    }

    get tags() {
        if (!this.#json.Tags) this.#json.Tags = {};
        return this.#json.Tags;
    }

    userProperties(property, value) {
        if (!this.#userProperties) this.#userProperties = new Properties(this, true);
        return this.#userProperties.getSet(property, value);
    }

    //todo
}


class RestClient {
    AuthToken = null;
    ServerBaseUrl = null;

    constructor(serverUrl, authToken) {
        this.AuthToken = authToken;
        this.ServerBaseUrl = serverUrl;
    }

    asyncCall(url, method, parameters, parameterName) {
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
                    "AuthToken": this.AuthToken
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
                            reject(parsedJson);
                        }
                    }
                    resolve(parsedJson);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }

    //todo: pasar a fetch
    asyncCallXmlHttp(callingMethod, httpMethod, data) {
        var dataSend = null;
        if (data) {
            dataSend = data;
        }
        var completeUrl = this.ServerBaseUrl + "/" + callingMethod;

        var prom = jQuery.Deferred();
        var xhr = new XMLHttpRequest();
        xhr.open(httpMethod, completeUrl, true);
        xhr.setRequestHeader("AuthToken", this.AuthToken);
        /*
        if (Doors.RESTFULL.ApiKey != null) {
            xhr.setRequestHeader("ApiKey", Doors.RESTFULL.ApiKey);
        }
        else {
            xhr.setRequestHeader("AuthToken", this.AuthToken);
        }
        */
        (httpMethod == "GET") ? xhr.responseType = "arraybuffer" : null;
        var _self = this;
        xhr.onreadystatechange = function (event) {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    prom.resolve(this.response);
                } else {
                    prom.reject(this.statusText);
                }
            }
        };
        xhr.send(dataSend);
        return prom.promise()
    };

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

function asyncLoop(iterations, loopFunc, callback) {
    var index = 0;
    var done = false;
    var loop = {
        next: function() {
            if (done) {
                return;
            }
    
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
