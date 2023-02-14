export class Session {
    #restClient;
    #directory;
    #serverUrl;
    #authToken;
    
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
    changePassword(oldPassword, newPassword) {
        var url = 'session/changepassword';

        var data = {
            login: login,
            oldPassword: oldPassword,
            newPassword: newPassword,
            instanceName: instanceName
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

    get restClient() {
        return this.#restClient;
    }

    get runSyncEventsOnClient() {
        var url = 'session/syncevents/runOnClient';
        return this.restClient.asyncCall(url, 'GET', '', '');
    }

    set runSyncEventsOnClient(value) {
        var url = 'session/syncevents/runOnClient/' + (value ? 'true' : 'false');
        return this.restClient.asyncCall(url, 'POST', {}, '');
    }

    get serverUrl() {
        return this.#serverUrl;
    }

    set serverUrl(value) {
        this.#serverUrl = value;
        this.restClient.ServerBaseUrl = value;
    }
};

class Account {

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
    #parent; // Document
    #json; // { AccId, AccName, AttId, Created, Description, DocId, Extension, External, File, Group, IsNew, Name, Size, Tags }

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

    get name() {
        return this.#json.Name;
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

    get remove() {
        return this.#json.Remove;
    }

    set remove(value) {
        this.#json.Remove = value;
    }

    get session() {
        return this.parent.session;
    }

    get size() {
        return this.#json.Size;
    }

    get tags() {
        return this.#json.Tags;
    }
}

class Directory {
    #session;
    
    constructor(session) {
        this.#session = session;
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
    #parent;
    #session;
    #json;
    #fieldsMap;
    #attachmentsMap;

    constructor(document, session, folder) {
        this.#json = document;
        this.#session = session;
        if (folder) this.#parent = folder;
        this.#attachmentsMap = new CIMap();
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

    fields(field) {
        var me = this;

        if (field) {
            // Devuelve un field
            var field;
            field = me.#json.CustomFields.find(it => it['Name'].toLowerCase() == field.toLowerCase());
            if (!field) field = me.#json.HeadFields.find(it => it['Name'].toLowerCase() == field.toLowerCase());
            if (field) {
                return new Field(field, me);
            } else {
                throw new Error('Field not found: ' + field);
            }

        } else {
            // Devuelve la coleccion
            if (!me.#fieldsMap) {
                var map = new CIMap();
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
                }
            );

            function saveAttachs(resolve, reject) {
                //todo: guardar los attachs
                var proms = [];
                var rm = [];
                me.#attachmentsMap.forEach(async el => {
                    if (el.isNew) {
                        var formData = new FormData(); // cambiar por https://stackoverflow.com/questions/63576988/how-to-use-formdata-in-node-js-without-browser
                        //var formData = new URLSearchParams();
                        // todo: como subimos el Tag?
                        let blob = await el.fileStream;
                        formData.append('attachment', blob, el.name);
                        var url = 'documents/' + me.id + '/attachments';
                        proms.push(me.session.restClient.asyncCallXmlHttp(url, 'POST', formData));

                    } else if (el.remove) {
                        rm.push(el.id);
                    }
                });

                if (rm.length > 0) {
                    var url = 'documents/' + me.id + '/attachments';
                    proms.push(me.session.restClient.asyncCall(url, 'DELETE', rm, 'arrayAttId'));
                }

                Promise.all(proms).then(
                    res => { debugger; resolve(me) },
                    err => {
                        debugger;
                        console.error(err);
                        reject(new Error('saveAttachs error: ' + errMsg(err)));
                    }
                )
            }
        })
    }

    get session() {
        return this.#session;
    }

    get tags() {
        return this.#json.Tags;
    }

    toJSON() {
        return this.#json;
    }
};

class Field {
    #parent; // Document / Form
    #json;

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

    get parent() {
        return this.#parent;
    }

    get precision() {
        return this.#json.Precision;
    }

    get scale() {
        return this.#json.Scale;
    }

    get type() {
        return this.#json.Type;
    }

    get updatable() {
        return this.#json.Updatable;
    }

    get value() {
        return this.#json.Value;
    }

    set value(value) {
        if (!this.updatable || this.computed) throw new Error('Field not updatable: ' + this.name);
        if (!value && !this.nullable) throw new Error('Field not nullable: ' + this.name);
        this.#json.Value = value;
        this.valueChanged; // Actualiza valueChanged en el JSON
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
    #json;
    #session;
    #app;

    constructor(folder, session) {
        this.#json = folder;
        this.#session = session;
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
            var res
            if (isNaN(document)) {
                res = await me.search({ fields: 'doc_id', formula: document });
            } else {
                res = await me.search({ fields: 'doc_id', formula: 'doc_id = ' + document });
            }
            if (res.length == 0) {
                reject(new Error('Document not found'));
            } else if (res.length > 1) {
                reject(new Error('Expression returns more than one document'));

            } else {
                let url = 'documents/' + res[0]['DOC_ID'];
                let jsn = await me.session.restClient.asyncCall(url, 'GET', '', '');
                resolve(new Document(jsn, me.session, me));
            }
        });
    }

    documentsNew() {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'folders/' + me.id + '/documents/new';
            me.session.restClient.asyncCall(url, 'GET', '', '').then(
                doc => {
                    resolve(new Document(doc, me.session, me));
                },
                reject
            );
        })
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
                    frm => {
                        me.#json.Form = frm;
                        resolve(new Form(frm, me.session));
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

    toJSON() {
        return this.#json;
    }

    get type() {
        return this.#json.Type;
    }
};

class Form {
    #json;
    #session;
    #fieldsMap;

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
                var map = new CIMap();
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

    get session() {
        return this.#session;
    }

    toJSON() {
        return this.#json;
    }
};

class User {

}

class View {
    
}

class CIMap extends Map {    
    set(key, value) {
        if (typeof key === 'string') {
            key = key.toUpperCase();
        }
        return super.set(key, value);
    }

    get(key) {
        if (typeof key === 'string') {
            key = key.toUpperCase();
        }
        return super.get(key);
    }

    has(key) {
        if (typeof key === 'string') {
            key = key.toUpperCase();
        }
        return super.has(key);
    }
};

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