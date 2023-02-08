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
        this.#restClient.AuthToken = value;
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
        return this.#restClient.asyncCall(url, 'POST', data, '');
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
                function (res) {
                    resolve(new Folder(res, me));
                },
                reject
            )
        })
    };

    get isLogged() {
        var url = 'session/islogged';
        return this.#restClient.asyncCall(url, 'POST', {}, '');
    };

    logoff() {
        var me = this;
        return new Promise((resolve, reject) => {
            var url = 'session/logoff';
            me.#restClient.asyncCall(url, 'POST', {}, '').then(
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
            me.#restClient.asyncCall(url, 'POST', data, '').then(
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

    get serverUrl() {
        return this.#serverUrl;
    }

    set serverUrl(value) {
        this.#serverUrl = value;
        this.#restClient.ServerBaseUrl = value;
    }
};

class Directory {
    #session;
    
    constructor(session) {
        this.#session = session;
    }

    get session() {
        return this.#session;
    }
};

export class Document {
    #parent;
    #session;
    #doc;
    #fieldsMap;

    constructor(document, session, folder) {
        this.#doc = document;
        this.#session = session;
        if (folder) this.#parent = folder;
    }

    delete(toRecycleBin) {
        var me = this;
        return new Promise((resolve, reject) => {
            debugger;
            var url = 'folders/' + me.#doc.FldId + '/documents/?tobin=' + 
                encodeURIComponent(toRecycleBin == false ? false : true);
            me.session.restClient.asyncCall(url, 'DELETE', me.id, 'docIds').then(
                res => {
                    me.#doc = res;
                    resolve(me);
                },
                reject
            )
        });

        /*
        var sendRecycleBin = (sendRecycleBin === undefined ? true : sendRecycleBin);
        var url = "folders/" + fldId + "/documents/?tobin=" + encodeURIComponent(sendRecycleBin);
        return Doors.RESTFULL.asyncCall(url, "DELETE", [docId], "docIds");
        */
    }

    get id() {
        return this.#doc.DocId;
    }

    fields(name) {
        var me = this;
        var field;
        field = me.#doc.CustomFields.find(it => it['Name'].toLowerCase() == name.toLowerCase());
        if (!field) field = me.#doc.HeadFields.find(it => it['Name'].toLowerCase() == name.toLowerCase());
        if (field) {
            return new Field(field, me);
        } else {
            throw new Error('Field not found: ' + name);
        }
    }

    get fieldsMap() {
        var me = this;
        if (me.#fieldsMap) {
            return me.#fieldsMap;

        } else {
            var map = new CIMap();
            debugger; // sacar luego de revisar
            me.#doc.HeadFields.forEach(it => {
                map.set(it.Name, new Field(it, me.session));
            });
            me.#doc.CustomFields.forEach(it => {
                map.set(it.Name, new Field(it, me.session));
            });
            me.#fieldsMap = map;
            return map;
        }
    }

    get folder() {
        return this.parent
    }

    get folderId() {
        return this.parentId
    }

    get parent() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#parent) {
                me.#session.foldersGetFromId(me.parentId).then(
                    function (res) {
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
        return this.#doc.HeadFields.find(it => it.Name == 'FLD_ID').Value;
    }

    save() {
        var me = this;
        return new Promise((resolve, reject) => {
            debugger;
            var url = 'documents';
            me.session.restClient.asyncCall(url, 'PUT', me.#doc, 'document').then(
                res => {
                    // Esta peticion se hace xq la ref q vuelve del PUT no esta actualizada (issue #237)
                    var url = 'documents/' + me.id;
                    me.restClient.asyncCall(url, 'GET', '', '').then(
                        res => {
                            me.#doc = res;
                            resolve(me);
                        },
                        reject
                    )
                },
                reject
            )
        });
    }

    get session() {
        return this.#session;
    }

    toJSON() {
        return this.#doc;
    }
};

class Field {
    #parent; // Document
    #field;

    constructor(field, document) {
        this.#field = field;
        this.#parent = document;
    }

    get computed() {
        return this.#field.Computed;
    }

    get custom() {
        return this.#field.Custom;
    }

    get description() {
        return this.#field.Description;
    }

    get descriptionRaw() {
        return this.#field.DescriptionRaw;
    }

    get formId() {
        return this.#field.Id;
    }

    get headerTable() {
        return this.#field.HeaderTable;
    }

    get length() {
        return this.#field.Length;
    }

    get name() {
        return this.#field.Name;
    }

    get nullable() {
        return this.#field.Nullable;
    }

    get precision() {
        return this.#field.Precision;
    }

    get scale() {
        return this.#field.Scale;
    }

    get type() {
        return this.#field.Type;
    }

    get updatable() {
        return this.#field.Updatable;
    }

    get value() {
        return this.#field.Value;
    }

    set value(value) {
        if (!this.updatable || this.computed) throw new Error('Field not updatable: ' + this.name);
        if (!value && !this.nullable) throw new Error('Field not nullable: ' + this.name);
        this.#field.Value = value;
        this.valueChanged; // Actualiza valueChanged en el JSON
    }

    get valueChanged() {
        this.#field.ValueChanged = (this.#field.Value !== this.#field.ValueOld);
        return this.#field.ValueChanged;
    }

    get valueOld() {
        return this.#field.ValueOld;
    }
};

export class Folder {
    #folder;
    #session;

    constructor(folder, session) {
        this.#folder = folder;
        this.#session = session;
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

    get form() {
        var me = this;
        return new Promise((resolve, reject) => {
            if (!me.#folder.Form) {
                var url = 'forms/' + me.#folder.FrmId;
                me.session.restClient.asyncCall(url, 'GET', '', '').then(
                    frm => {
                        me.#folder.Form = frm;
                        resolve(new Form(frm, me.session));
                    }
                ),
                reject
            } else {
                resolve(new Form(me.#folder.Form, me.session));
            }
        });
    }

    get id() {
        return this.#folder.FldId;
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
        var params = 'fields=' + encodeURIComponent(opt.fields) + '&formula=' + encodeURIComponent(opt.formula) + 
            '&order=' + encodeURIComponent(opt.order) + '&maxDocs=' + encodeURIComponent(opt.maxDocs) + 
            '&recursive=' + encodeURIComponent(opt.recursive) + '&maxDescrLength=' + encodeURIComponent(opt.maxTextLen);

        return this.#session.restClient.asyncCall(url, 'GET', params, '');
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
        var params = 'groups=' + encodeURIComponent(opt.groups) + '&totals=' + encodeURIComponent(opt.totals) +
            '&formula=' + encodeURIComponent(opt.formula) + '&order=' + encodeURIComponent(opt.order) + 
            '&maxDocs=' + encodeURIComponent(opt.maxDocs) + '&recursive=' + encodeURIComponent(opt.recursive) + 
            '&groupsOrder=' + encodeURIComponent(opt.groupsOrder) + '&totalsOrder=' + encodeURIComponent(opt.totalsOrder);

        return this.#session.restClient.asyncCall(url, 'GET', params, '');
    }

    get session() {
        return this.#session;
    }

    toJSON() {
        return this.#folder;
    }
};

class Form {
    #form;
    #session;
    #fieldsMap;

    constructor(form, session) {
        this.#form = form;
        this.#session = session;
    }

    fields(name) {
        var me = this;
        var field;
        field = me.#form.Fields.find(it => it['Name'].toLowerCase() == name.toLowerCase());
        if (field) {
            return new Field(field, me);
        } else {
            throw new Error('Field not found: ' + name);
        }
    }

    get fieldsMap() {
        var me = this;
        if (me.#fieldsMap) {
            return me.#fieldsMap;

        } else {
            var map = new CIMap();
            me.#form.Fields.forEach(it => {
                map.set(it.Name, new Field(it, me.session));
            });
            me.#fieldsMap = map;
            return map;
        }
    }

    get session() {
        return this.#session;
    }

    toJSON() {
        return this.#form;
    }
};


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
