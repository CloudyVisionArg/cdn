;var Doors = Doors || {};
Doors.REST = Doors.REST || { };
Doors.REST.Model = Doors.REST.Model || { };
(function () {
    this.FolderSearchParam = function () {
        this.FldId = 0;
        this.Fields = "";
        this.Formula = "";
        this.Totals = "";
        this.Groups = "";
        this.Order = "";
        this.MaxDocs = 0;
        this.Recursive = false;
        this.GroupsOrder = "";
        this.TotalsOrder = "";
        this.MaxDescriptionLenght = 0;
    };
    this.GlobalSearchFilter = function () {
        this.SearchByModified = true;
        this.SearchText = "";
        this.SearchForms = [0, 1];
        this.FromDate = new Date();
        this.ToDate = new Date();
        this.Orders = [new Doors.REST.Model.SearchOrderItem()];
        this.Formula = "";
        this.ParseQuery = true;
    };
    this.SearchOrderItem = function () {
        this.Field = "";
        this.Direction = 0;
    };
    this.DataViewSearchFilter = function () {
        this.FolderId = 0;
        this.ViewId = 0;
        this.MaxDescValueLength = 0;
        this.AdditionalFields = ["", ""];
        this.Formula = "";
        this.GroupValues = [null];
        this.MaxDocs = null;
    };
    this.ViewDefinitionFieldItem = function () {
        this.Field = "";
        this.Width = 0;
        this.MaxLength = null;
        this.Format = new Doors.REST.Model.ViewDefinitionFieldFormat();
        this.IsVisible = true;
        this.Description = "";
        this.FormDescription = "";
        this.IsImage = false;
        this.FieldAlias = "";
    };
    this.ViewDefinitionFieldFormat = function () {
        this.FormatId = 0;
        this.FormatValue = "None";
    };
    this.ViewDefinitionFieldFormatEnum = function () {
        this.NONE = 0;
        this.REMOVEHTML = 1;
        this.REMOVETAGS = 2;
        this.MASK = 3;
    };
    this.ViewDefinitionFilterItem = function () {
        this.Field = "";
        this.Operator = "";
        this.Value = "";
    };
    this.ViewDefinitionGroupItem = function () {
        this.Field = "";
        this.Description = "";
    };
    this.ViewDefinitionOrderItem = function () {
        this.Field = "";
        this.Direction = 0;
    };
    this.DataDocument = function () {
        this.Values = [];
        this.Add = function (key, value) {
            this.Values.push(new Doors.REST.Model.DictionaryItem(key, value));
        };
        this.AddItem = function (dictionaryItem) {
            this.Values.push(dictionaryItem);
        };
    };
    this.DictionaryItem = function (key, value) {
        this.Key = key;
        this.Value = value;
    };
    this.DoorsObjectTypesEnum = {
        CustomForm: 1,
        Document: 2,
        Folder: 3,
        View: 4
    };
    this.FolderTypeEnum = {
        DocumentFolder: 1,
        LinkFolder: 2,
        VirtualFolder: 3
    };
    this.ViewTypeEnum = {
        DataView: 1,
        ScheduleView: 2,
        CustomView: 3,
        ChartView: 4
    };
    this.ExportFormatEnum = {
        ExcelXml : 0,
        OpenXml : 1
    };
    this.AclParameter = function () {
        this.ObjectType = 0;
        this.AccountId = null;
        this.Access = "";
        this.Inherits = null;
    };
    this.AclSaveParameter = function () {
        this.parent = Doors.REST.Model.AclParameter;
        this.parent();
        this.Acl = null;
    };
    this.AclCustomFormParameter = function () {
        //Propiedad __type debe ser la primera del objeto.
        this.__type = "AclCustomFormParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.AclParameter;
        this.parent();
        this.ObjectType = Doors.REST.Model.DoorsObjectTypesEnum.CustomForm;
        this.FrmId = -1;
    };
    this.AclViewParameter = function () {
        this.__type = "AclViewParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.AclParameter;
        this.parent();
        this.ObjectType = Doors.REST.Model.DoorsObjectTypesEnum.View;
        this.FldId = -1;
        this.ViewId = -1;
    };
    this.AclFolderParameter = function () {
        this.__type = "AclFolderParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.AclParameter;
        this.parent();
        this.ObjectType = Doors.REST.Model.DoorsObjectTypesEnum.Folder;
        this.FldId = -1;
    };
    this.AclDocumentParameter = function () {
        this.__type = "AclDocumentParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.AclParameter;
        this.parent();
        this.ObjectType = Doors.REST.Model.DoorsObjectTypesEnum.Document;
        this.DocId = -1;
    };
    this.AclSaveCustomFormParameter = function () {
        this.__type = "AclSaveCustomFormParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.AclSaveParameter;
        this.parent();
        this.ObjectType = Doors.REST.Model.DoorsObjectTypesEnum.CustomForm;
        this.FrmId = -1;
    };
    this.AclSaveViewParameter = function () {
        this.__type = "AclSaveViewParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.AclSaveParameter;
        this.parent();
        this.ObjectType = Doors.REST.Model.DoorsObjectTypesEnum.View;
        this.FldId = -1;
        this.ViewId = -1;
    };
    this.AclSaveFolderParameter = function () {
        this.__type = "AclSaveFolderParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.AclSaveParameter;
        this.parent();
        this.ObjectType = Doors.REST.Model.DoorsObjectTypesEnum.Folder;
        this.FldId = -1;
    };
    this.AclSaveDocumentParameter = function () {
        this.__type = "AclSaveDocumentParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.AclSaveParameter;
        this.parent();
        this.ObjectType = Doors.REST.Model.DoorsObjectTypesEnum.Document;
        this.DocId = -1;
    };
    this.AclItem = function () {
        this.AccountId = -4;
        this.Permissions = [];
    };
    this.AclPermissionItem = function () {
        this.OwnedValue = false;
        this.InheritedValue = false;
        this.Name = "";
        this.Description = "";
    };
    this.AclPermissions = {
        Admin: "admin",
        Read: "read",
        Delete: "delete",
        Modify: "modify",
        FolderCreate: "fld_create",
        FolderRead: "fld_read",
        FolderView: "fld_view",
        FolderAdmin: "fld_admin",
        DocCreate: "doc_create",
        DocRead: "doc_read",
        DocModify: "doc_modify",
        DocDelete: "doc_delete",
        DocAdmin: "doc_admin",
        ViewCreate: "vie_create",
        ViewRead: "vie_read",
        ViewModify: "vie_modify",
        ViewDelete: "vie_delete",
        ViewAdmin: "vie_admin",
        ViewCreatePrivate: "vie_create_priv"
    };
    this.PropertiesParameter = function() {
        this.ObjectType = 0;
        this.ObjectId = 0;
        this.IsNew = false;
    };
    this.SinglePropertyParameter = function() {
        //Propiedad __type debe ser la primera del objeto.
        this.__type = "SinglePropertyParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.PropertiesParameter;
        this.parent();
        this.Name = "";
        this.Value = "";
    };
    this.MultiplePropertiesParameter = function() {
        //Propiedad __type debe ser la primera del objeto.
        this.__type = "MultiplePropertiesParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.PropertiesParameter;
        this.parent();
        this.Properties = [];
    };
    this.ViewSinglePropertyParameter = function() {
        //Propiedad __type debe ser la primera del objeto.
        this.__type = "ViewSinglePropertyParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.SinglePropertyParameter;
        this.parent();
        this.FldId = 0;
    };
    this.ViewMultiplePropertiesParameter = function() {
        //Propiedad __type debe ser la primera del objeto.
        this.__type = "ViewMultiplePropertiesParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.MultiplePropertiesParameter;
        this.parent();
        this.FldId = 0;
    };
    this.FieldSinglePropertyParameter = function() {
        //Propiedad __type debe ser la primera del objeto.
        this.__type = "FieldSinglePropertyParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.SinglePropertyParameter;
        this.parent();
        this.Name = "";
    };
    this.FieldMultiplePropertiesParameter = function() {
        //Propiedad __type debe ser la primera del objeto.
        this.__type = "FieldMultiplePropertiesParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.MultiplePropertiesParameter;
        this.parent();
        this.Name = "";
    };
    this.ViewSearchFilter = function() {
        //this.__type = "ViewSearchFilter:#Gestar.Doors.API.ObjectModelW";
        this.FolderId = -1;
        this.ViewId = -1;
        this.MaxDescValueLength = 0;
        this.AdditionalFields = [];
        this.Formula = "";
    };
    this.ChartViewSearchFilter = function() {
        this.__type = "ChartViewSearchFilter:#Gestar.Doors.API.ObjectModelW";
        this.parent = Doors.REST.Model.ViewSearchFilter;
        this.parent();
        this.Groups = [];
        this.Formula = "";
    };
    this.DataViewSearchFilter = function() {
        this.__type = "DataViewSearchFilter:#Gestar.Doors.API.ObjectModelW";
        this.parent = Doors.REST.Model.ViewSearchFilter;
        this.parent();
        this.GroupValues = [];
    };
    this.RestSessionParameter = function () {
        this.SettingName = "";
        this.SettingValue = "";
    };
    this.ExportParameter = function() {
        this.FldId = -1;
        this.VieId = -1;
        this.ExportFormat = 0;
        this.SelectedDocs = null;
        this.Filter = null;
        this.ColumnsNamesOnly = false;
    };
}).apply(Doors.REST.Model);
;//Requiere GlobalFunctions y GlobalSettings
Doors = Doors || {};
Doors.REST = Doors.REST || {};
(function () {
    
    this.ServerUrl = "";
    this.AuthToken = "";
    this.ServiceUnhandledErrorFunction = function (err) { alert(err); };
    this.ResponseResultEnum =
    {
        Sucess: 0,
        SessionTimeOutError: 1,
        Exception: 2
    };
    this.CurrentCalls = [];
    this.cancelPendingCalls = function () {
        for (var i = 0; i < Doors.REST.CurrentCalls.length; i++) {
            var xhr = Doors.REST.CurrentCalls[i];
            if (xhr && xhr.readyState != 4) {
                xhr.abort();
            }
        }
    };
    //$(document).ready(function() {
    try {
        $(window).on('beforeunload', Doors.REST.cancelPendingCalls);
    } catch(e) {

    }
    try {
        $(window).on('beforeunload', Doors.REST.cancelPendingCalls);
    } catch (e) {

    }
    //});
    
    this.call = function (callingMethod, httpMethod, parameters, parameterName, successFunction, errorFunction) {
        return Doors.REST.asyncCall(callingMethod, httpMethod, parameters, parameterName, successFunction, errorFunction, false);
    };


    this.asyncCallXmlHttp = function (callingMethod, httpMethod, data) {
        var dataSend = null;
        if (data) {
            dataSend = data;
        }
        var completeUrl = Doors.RESTFULL.ServerUrl + "/" + callingMethod;

        var prom = jQuery.Deferred();
        var xhr = new XMLHttpRequest();
        xhr.open(httpMethod, completeUrl, true);
        xhr.setRequestHeader("AuthToken", Doors.RESTFULL.AuthToken);
        (httpMethod == "GET") ? xhr.responseType = "arraybuffer" : null;
        var _self = this;
        xhr.onreadystatechange = function (event) {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    _self.decrementCurrentCalls(xhr);
                    prom.resolve(this.response);
                } else {
                    _self.decrementCurrentCalls(xhr);
                    prom.reject(this.statusText);
                }
            }
        };
        xhr.send(dataSend);
        this.CurrentCalls.push(xhr);
        return prom.promise()
    };

    this.asyncCall = function (callingMethod, httpMethod, parameters, parameterName, successFunction, errorFunction, async) {
        var data = null;
        var completeUrl = Doors.REST.ServerUrl + "/" + callingMethod;
        if (parameters != undefined && parameters != null) {
            //URL parameters
            if (Object.prototype.toString.call(parameters) == "[object String]") {
                var others = "";
                var nexus = "";
                //NOTE: Esto ya no aplica, ya que el token se pasa por header.
                //var token = "?authToken=" + restCallOptions.authToken;
                if (parameters != "") {
                    nexus = "?";
                    others = parameters;
                }
                completeUrl = completeUrl + nexus + others;
            } else {
                //Javascript parameters
                var restParam = Doors.REST.constructJSONParameter(parameters, parameterName);
                data = restParam;
            }
        }
        //In case caller doesn't want to handle error.
        if (errorFunction == undefined) {
            errorFunction = Doors.REST.ServiceUnhandledErrorFunction;
        }
        
        var req = $.ajax({
            type: httpMethod,
            url: completeUrl,
            data: data,
            beforeSend: function (xhr, settings) {
                var tk = Doors.REST.AuthToken;
                //var encoded = encodeURIComponent(tk);
                xhr.setRequestHeader("AuthToken", tk);
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json customJson",
            converters: {
                "json customJson": function (result) {
                    //In case a complex object is received.
                    if (result.InternalObject === undefined) {
                        result = result[callingMethod + "Result"];
                    }
                    result.InternalObject = tryParseDateComplex(result.InternalObject);
                    return result;
                }
            },
            cache: false,
            async: async,
            processdata: false,
            success: function (result, textStatus, xhr) {
                //In case a complex object is received.
                if (result.InternalObject === undefined) {
                    result = result[callingMethod + "Result"];
                }
                //If it still does not contains de correct structure, throw error;
                if (result.InternalObject === undefined) {
                    var err = new Gestar.ErrorHandling.ExceptionObject();
                    err.Message = "Response object missformed. Method: " + callingMethod;
                    err.Method = callingMethod;
                    errorFunction(err);
                    return;
                }
                if (Doors.REST.hasException(result, callingMethod, errorFunction)) {
                    return;
                }
                successFunction(handleResultObject(result.InternalObject));
            },
            error: function (xhr, textStatus, errorThrown) {
                if (textStatus != "abort") {
                    var err = new Gestar.ErrorHandling.ExceptionObject();
                    err.DoorsExceptionType = null;
                    err.Message = "REST Api Error - Method: " + callingMethod + " Status Code: " + xhr.status + " - Message: " + errorThrown;
                    err.Type = Doors.REST.ResponseResultEnum.Exception;
                    err.Method = callingMethod;
                    errorFunction(err);
                }
            },
            complete: function (xhr, textStatus) {
                /*var index = Gestar.REST.CurrentCalls.indexOf(xhr);
                Gestar.REST.CurrentCalls.splice(index, 1);*/
                var index = Doors.REST.CurrentCalls.indexOf(xhr);
                if (index !== -1) {
                    Doors.REST.CurrentCalls.splice(index, 1);
                }
            }
        });
        this.CurrentCalls.push(req);
        return req;
    };
    var handleResultObject = function(operationResult) {
        if (Object.prototype.toString.call(operationResult) == "[object String]") {
            try {
                return JSON.parse(operationResult);
            } catch(ex) {
                return operationResult;
            }
        }
        return operationResult;
    };

    /*var tryParseDate = function(simpleObject) {
        for (var i in simpleObject) {
            if (Gestar.Tools.isNumber(parseInt(i))) {
                tryParseDate(simpleObject[0]);
            } else {
                if (Object.prototype.toString.call(simpleObject[i]) == "[object Array]") {
                    tryParseDate(simpleObject[i]);
                } else {
                    if (typeof simpleObject[i] == "string" && simpleObject[i].substring(0, 6) == "/Date(") {
                        var d = new Date(parseInt(simpleObject[i].replace("/Date(", "").replace(")/", ""), 10));
                        var minutes = d.getTimezoneOffset();
                        simpleObject[i] = new Date(d.getTime()); // + minutes * 60000);
                        //simpleObject[i] = new Date(parseInt(simpleObject[i].substr(6)));
                    } else if (Object.prototype.toString.call(simpleObject[i]) == "[object Date]") {
                        //TODO ZONA HORARIA
                        var date = "\/Date(" + simpleObject[i].getTime() + "-0000)\/";
                        simpleObject[i] = date;
                    }
                }
            }
        }
    };*/
    //TODO Revisar performance de tryParseDate
    var tryParseDateComplex = function(arrayObject) {
        //FIX para objetos que vienen del servidor como string pero son objetos JSON (SearchGroups x ej)
        if (Object.prototype.toString.call(arrayObject) == "[object String]" && (arrayObject.startsWith("{") || arrayObject.startsWith("["))) {
            arrayObject = JSON.parse(arrayObject);
        }

        if (Object.prototype.toString.call(arrayObject) == "[object Array]") {
            tryParseDateInArray(arrayObject);
        } else if (Object.prototype.toString.call(arrayObject) == "[object Object]") {
            tryParseInObject(arrayObject);
        } else {
            arrayObject = parseDate(arrayObject);
        }
        return arrayObject;
    };
    
    var tryParseDateInArray = function(array) {
        for (var p = 0; p < array.length; p++) {
            if (Object.prototype.toString.call(array[p]) == "[object Object]") {
                tryParseInObject(array[p]);
            }
            else if (Object.prototype.toString.call(array[p]) == "[object Array]") {
                tryParseDateInArray(array[p]);
            } else {
                array[p] = parseDate(array[p]);
            }
        }
    };
    var tryParseInObject = function (simpleObject) {
        for (var i in simpleObject) {
            if (Object.prototype.toString.call(simpleObject[i]) == "[object Array]") {
                tryParseDateInArray(simpleObject[i]);
            } else {
                simpleObject[i] = parseDate(simpleObject[i]);
            }
        }
    };
    var parseDate = function (string) {
        var result = string;
        if (typeof string == "string" && string.substring(0, 6) == "/Date(") {
            var dateString = string.replace("/Date(", "").replace(")/", "");
            var d = new Date(parseInt(dateString, 10));
            var minutes = d.getTimezoneOffset();
            var dtStringSplitted = dateString.split("-");
            var minus = -1;
            if(dtStringSplitted.length == 1) {
                dtStringSplitted = dateString.split("+");
                minus = 1;
            }
            var spltIndx = 1;
            if (dtStringSplitted.length == 3) {
                spltIndx = 2;
            }
            var offset = dtStringSplitted[spltIndx];
            var dateMinutesOffset = parseInt(offset.substring(0, 2)) * 60;
            dateMinutesOffset *= minus;
            minutes = dateMinutesOffset + minutes;
            var sum = minutes * 60000;
            result = new Date(d.getTime() + sum);
        } else if (Object.prototype.toString.call(string) == "[object Date]") {
            //TODO Change for correct UTC hours
            var date = "\/Date(" + string.getTime() + Gestar.Settings.ServerTimeZone + ")\/";
            result = date;
        }
        return result;
    };
    this.hasException = function(responseObject, callingMethod, errorFunction) {
        if (responseObject.ResponseResult == Doors.REST.ResponseResultEnum.SessionTimeOutError) {
            Gestar.ErrorHandling.handleSessionExpired();
            return true;
        }
        if (responseObject.ResponseResult == Doors.REST.ResponseResultEnum.Exception) {
            
            var ex = new Gestar.ErrorHandling.ExceptionObject();
            ex.Message = responseObject.ExceptionMessage;
            ex.Type = Doors.REST.ResponseResultEnum.Exception;
            ex.DoorsExceptionType = responseObject.ExceptionType;
            ex.Method = callingMethod;
            errorFunction(ex);
            return true;
        }
        return false;
    };

    this.constructJSONParameter = function(param, parameterName) {
        //NOTE Se copia el objeto para no modificar la referencia al enviarse al server
        var clone = Gestar.Tools.cloneObject(param);
        if (Object.prototype.toString.call(param) === '[object Array]') {
            clone = Gestar.Tools.cloneArray(param);
        }

        clone = tryParseDateComplex(clone);
        var paramName = param.ParameterName;
        if (param.ParameterName === undefined || param.ParameterName == undefined || param.ParameterName == null || param.ParameterName == "") {
            paramName = parameterName;
        }
        var stringParam = "{ \"" + paramName + "\": { \"AuthToken\":\"" + Doors.REST.AuthToken + "\", \"Param\": " + JSON.stringify(clone) +
            " } }";
        return stringParam;
    };
}).apply(Doors.REST);

var restCallOptions = {
    serverUrl: "",
    authToken: ""
};

;//Requiere GlobalFunctions y GlobalSettings
Doors = Doors || {};
Doors.RESTFULL = Doors.RESTFULL || {};
(function () {
    
    this.ServerUrl = "";
    this.AuthToken = "";
    this.ApiKey = null;
    this.ServiceUnhandledErrorFunction = null;
    this.ResponseResultEnum =
    {
        Sucess: 0,
        SessionTimeOutError: 1,
        Exception: 2
    };
    this.CurrentCalls = [];
    this.cancelPendingCalls = function () {
        for (var i = 0; i < Doors.RESTFULL.CurrentCalls.length; i++) {
            var xhr = Doors.RESTFULL.CurrentCalls[i];
            if (xhr && xhr.readyState != 4) {
                xhr.abort();
            }
        }
    };
    $(document).ready(function() {
        //document.body.onbeforeunload = Doors.RESTFULL.cancelPendingCalls;
        //window.onbeforeunload = Doors.RESTFULL.cancelPendingCalls;

        $(window).on('beforeunload', Doors.RESTFULL.cancelPendingCalls);
    });
    
    /*this.call = function (callingMethod, httpMethod, parameters, parameterName, successFunction, errorFunction) {
        return Gestar.RESTFULL.asyncCall(callingMethod, httpMethod, parameters, parameterName, successFunction, errorFunction, false);
    };*/

    this.asyncCallXmlHttp = function (callingMethod, httpMethod, data) {
        var dataSend = null;
        if (data) {
            dataSend = data;
        }
        var completeUrl = Doors.RESTFULL.ServerUrl + "/" + callingMethod;

        var prom = jQuery.Deferred();
        var xhr = new XMLHttpRequest();
        xhr.open(httpMethod, completeUrl, true);
        if (Doors.RESTFULL.ApiKey != null) {
            xhr.setRequestHeader("ApiKey", Doors.RESTFULL.ApiKey);
        }
        else {
            xhr.setRequestHeader("AuthToken", Doors.RESTFULL.AuthToken);
        }
        (httpMethod == "GET") ? xhr.responseType = "arraybuffer" : null;
        var _self = this;
        xhr.onreadystatechange = function (event) {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    prom.resolve(this.response);
                } else {
                    prom.reject(this.statusText);
                }
                var index = Doors.RESTFULL.CurrentCalls.indexOf(xhr);
                if (index !== -1) {
                    Doors.RESTFULL.CurrentCalls.splice(index, 1);
                }
            }
        };
        xhr.send(dataSend);
        this.CurrentCalls.push(xhr);
        return prom.promise()
    };

    this.asyncCall = function (callingMethod, httpMethod, parameters, parameterName) {
        var data = null;
        var completeUrl = Doors.RESTFULL.ServerUrl + "/" + callingMethod;
        if (parameters != undefined && parameters != null) {
            //URL parameters
            if (Object.prototype.toString.call(parameters) == "[object String]") {
                var others = "";
                var nexus = "";
                //NOTE: Esto ya no aplica, ya que el token se pasa por header.
                //var token = "?authToken=" + restCallOptions.authToken;
                if (parameters != "") {
                    nexus = "?";
                    others = parameters;
                }
                completeUrl = completeUrl + nexus + others;
            } else {
                //Javascript parameters
                var restParam = Doors.RESTFULL.constructJSONParameter(parameters, parameterName);
                data = restParam;
            }
        }        
        
        var prom = $.Deferred();
        var req = $.ajax({
            type: httpMethod,
            url: completeUrl,
            data: data,
            beforeSend: function(xhr, settings) {
                var tk = Doors.RESTFULL.AuthToken;
                //var encoded = encodeURIComponent(tk);
                //xhr.setRequestHeader("AuthToken", tk);
                if (Doors.RESTFULL.ApiKey != null) {
                    xhr.setRequestHeader("ApiKey", Doors.RESTFULL.ApiKey);
                }
                else {
                    xhr.setRequestHeader("AuthToken", Doors.RESTFULL.AuthToken);
                }
            },
            contentType: "application/json",
            dataType: "json customJson",
            converters: {
                "json customJson": function(result) {

                    //result = tryParseDateComplex(result);
                    return result;
                }
            },
            cache: false,
            async: true,
            processdata: false,
            success: function(result, textStatus, xhr) {
                //If does not contains de correct structure, throw error;
                if (result.InternalObject === undefined) {
                    var err = {
                        ExceptionMessage: "Response object missformed. Method: " + callingMethod,
                        Message: "Response object missformed. Method: " + callingMethod,
                        Method: callingMethod
                    }
                    prom.reject(err);
                    return;
                }
                if (Doors.RESTFULL.hasException(result, callingMethod)) {
                    if (Doors.RESTFULL.ServiceUnhandledErrorFunction != null) {
                        Doors.RESTFULL.ServiceUnhandledErrorFunction(result);
                        Gestar.Tools.dp(result.ExceptionMessage, result);
                    }
                    else {
                        Gestar.Tools.er(result.ExceptionMessage, result);
                    }

                    prom.reject(result);
                    return;
                }
                prom.resolve(result.InternalObject);

            },
            error: function(xhr, textStatus, errorThrown) {
                if (xhr.readyState == 0) {
                    if (xhr.statusText === 'abort') {
                        return;
                    }
                    else if (!xhr.responseText || xhr.status == 404) {
                        prom.reject({
                            ExceptionMessage: "Request Error",
                            Message: "Request Error",
                            Method: callingMethod
                        });
                        return;
                    }
                }
                var responseObj = JSON.parse(xhr.responseText);
                /*var err = new Gestar.ErrorHandling.ExceptionObject();
                err.DoorsExceptionType = null;
                err.Message = "REST Api Error - Method: " + callingMethod + " Status Code: " + xhr.status + " - Message: " + errorThrown;
                err.Type = Gestar.REST.ResponseResultEnum.Exception;
                err.Method = callingMethod;*/

                if (responseObj.ResponseResult == Doors.RESTFULL.ResponseResultEnum.SessionTimeOutError) {
                    Gestar.ErrorHandling.handleSessionExpired();
                }
                $.extend(responseObj, responseObj, {
                    Message: responseObj.ExceptionMessage,
                    Type: Doors.RESTFULL.ResponseResultEnum.Exception,
                    DoorsExceptionType: responseObj.ExceptionType,
                    Method: callingMethod
                });
                prom.reject(responseObj);

            },
            complete: function (xhr, textStatus) {
                /*var index = Gestar.REST.CurrentCalls.indexOf(xhr);
                Gestar.REST.CurrentCalls.splice(index, 1);*/
                var index = Doors.RESTFULL.CurrentCalls.indexOf(xhr);
                if (index !== -1) {
                    Doors.RESTFULL.CurrentCalls.splice(index, 1);
                }
            }
        });
        this.CurrentCalls.push(req);
        return prom.promise();
    };
    var handleResultObject = function(operationResult) {
        if (Object.prototype.toString.call(operationResult) == "[object String]") {
            try {
                return JSON.parse(operationResult);
            } catch(ex) {
                return operationResult;
            }
        }
        return operationResult;
    };
    
    //TODO Revisar performance de tryParseDate
    var tryParseDateComplex = function (arrayObject) {
        //FIX para objetos que vienen del servidor como string pero son objetos JSON (SearchGroups x ej)
        if (Object.prototype.toString.call(arrayObject) == "[object String]" && (arrayObject.startsWith("{") || arrayObject.startsWith("["))) {
            arrayObject = JSON.parse(arrayObject);
        }

        if (Object.prototype.toString.call(arrayObject) == "[object Array]") {
            tryParseDateInArray(arrayObject);
        } else if (Object.prototype.toString.call(arrayObject) == "[object Object]") {
            tryParseInObject(arrayObject);
        } else {
            arrayObject = parseDate(arrayObject);
        }
        return arrayObject;
    };

    var tryParseDateInArray = function (array) {
        for (var p = 0; p < array.length; p++) {
            if (Object.prototype.toString.call(array[p]) == "[object Object]") {
                tryParseInObject(array[p]);
            }
            else if (Object.prototype.toString.call(array[p]) == "[object Array]") {
                tryParseDateInArray(array[p]);
            } else {
                array[p] = parseDate(array[p]);
            }
        }
    };
    var tryParseInObject = function (simpleObject) {
        for (var i in simpleObject) {
            if (Object.prototype.toString.call(simpleObject[i]) == "[object Array]") {
                tryParseDateInArray(simpleObject[i]);
            } else {
                simpleObject[i] = parseDate(simpleObject[i]);
            }
        }
    };
    var parseDate = function (string) {
        var result = string;
        if (typeof string == "string" && string.substring(0, 6) == "/Date(") {
            var dateString = string.replace("/Date(", "").replace(")/", "");
            var d = new Date(parseInt(dateString, 10));
            var minutes = d.getTimezoneOffset();
            var dtStringSplitted = dateString.split("-");
            var minus = -1;
            if (dtStringSplitted.length == 1) {
                dtStringSplitted = dateString.split("+");
                minus = 1;
            }
            var spltIndx = 1;
            if (dtStringSplitted.length == 3) {
                spltIndx = 2;
            }
            var offset = dtStringSplitted[spltIndx];
            var dateMinutesOffset = parseInt(offset.substring(0, 2)) * 60;
            dateMinutesOffset *= minus;
            minutes = dateMinutesOffset + minutes;
            var sum = minutes * 60000;
            result = new Date(d.getTime() + sum);
        } else if (Object.prototype.toString.call(string) == "[object Date]") {
            //TODO Change for correct UTC hours
            var date = string.toISOString();//"\/Date(" + string.getTime() + Gestar.Settings.ServerTimeZone + ")\/";
            result = date;
        }
        return result;
    };
    
    this.hasException = function(responseObject, callingMethod) {
        if (responseObject.ResponseResult == Doors.RESTFULL.ResponseResultEnum.SessionTimeOutError) {
            Gestar.ErrorHandling.handleSessionExpired();
            return true;
        }
        if (responseObject.ResponseResult == Doors.RESTFULL.ResponseResultEnum.Exception) {
            
            $.extend(responseObject, responseObject, {
                Message: responseObject.ExceptionMessage,
                Type: Doors.RESTFULL.ResponseResultEnum.Exception,
                DoorsExceptionType: responseObject.ExceptionType,
                Method: callingMethod
            });
            
            return true;
        }
        return false;
    };

    this.constructJSONParameter = function(param, parameterName) {
        //NOTE Se copia el objeto para no modificar la referencia al enviarse al server
        var clone = Gestar.Tools.cloneObject(param);
        if (Object.prototype.toString.call(param) === '[object Array]') {
            clone = Gestar.Tools.cloneArray(param);
        }

        clone = tryParseDateComplex(clone);
        var paramName = param.ParameterName;
        if (param.ParameterName === undefined || param.ParameterName == undefined || param.ParameterName == null || param.ParameterName == "") {
            paramName = parameterName;
        }
        var stringParam = "{ \"" + paramName + "\": " + JSON.stringify(clone) + " }";
        if (paramName == "") {
            stringParam = JSON.stringify(clone);
        }
        return stringParam;
    };
}).apply(Doors.RESTFULL);
;Doors = Doors || {};
Doors.API = Doors.API || function () {};

var DoorsAPI = new Doors.API();

//this.asyncCall = function (callingMethod, httpMethod, parameters, parameterName, successFunction, errorFunction, async) {
/*Global Functions*/

Doors.API.prototype.doorsVersion = function () {
    return Doors.RESTFULL.asyncCall("doorsversion", "GET", "", "");
};

var DoorsObjectTypesEnum = {
    CustomForm: {
        value: 1,
        name: "CustomForm"
    },
    Document: {
        value: 2,
        name: "Document"
    },
    Folder: {
        value: 3,
        name: "Folder"
    },
    View: {
        value: 4,
        name: "View"
    },
    Field: {
        value: 5,
        name: "Field"
    },
    Account: {
        value: 6,
        name: "Account"
    },
    Attachment: {
        value: 7,
        name: "Attachment"
    }
};

var AccountsTypeEnum = {
    UserAccount: {
        value: 1,
        name: "UserAccount"
    },
    GroupAccount: {
        value: 2,
        name: "GroupAccount"
    },
    SpecialAccount: {
        value: 3,
        name: "SpecialAccount"
    }
};
/*Session Functions*/

Doors.API.prototype.logon = function (user, pass, instance, isLite) {
    var url = "session/logon";
    var data = {
        loginName: user,
        password: pass,
        instanceName: instance,
        liteMode: isLite === undefined ? false : isLite
    };

    var promi = jQuery.Deferred();
    Doors.RESTFULL.asyncCall(url, "POST", data, "").then(function (token) {
        Doors.RESTFULL.AuthToken = token;
        promi.resolve(token);
    }, function (err) {
        promi.reject(err);
    });
    return promi;
};

Doors.API.prototype.logoff = function () {
    var url = "session/logoff";
    return Doors.RESTFULL.asyncCall(url, "POST", {}, "");
};

Doors.API.prototype.islogged = function () {
    var url = "session/islogged";
    return Doors.RESTFULL.asyncCall(url, "POST", {}, "");
};

Doors.API.prototype.loggedUser = function () {
    var url = "session/loggedUser";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.changePassword = function (login, oldPassword, newPassword, instanceName) {
    var url = "session/changepassword";

    var data = {
        login: login,
        oldPassword: oldPassword,
        newPassword: newPassword,
        instanceName: instanceName
    };
    return Doors.RESTFULL.asyncCall(url, "POST", data, "");
};

Doors.API.prototype.clearInstanceCache = function (providerEnumValue) {
    var url = "session/clearInstanceCache/" + providerEnumValue;
    return Doors.RESTFULL.asyncCall(url, "POST", {}, "");
};

Doors.API.prototype.connections = function () {
    var url = "session/connections";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.connectionsRemove = function (sessionGuid) {
    var url = "session/connections/remove/" + encodeURIComponent(sessionGuid);
    return Doors.RESTFULL.asyncCall(url, "DELETE", "", "");
};

Doors.API.prototype.connectionsLog = function (maxResults) {
    var url = "session/connections/logs?maxResults=" + encodeURIComponent(maxResults);
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.currentInstance = function () {
    var url = "instance";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.instances = function () {
    var url = "instances";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.userSettingsGet = function (settingName) {
    var url = "user/settings/" + encodeURIComponent(settingName);
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.userSettingsSet = function (settingName, settingValue) {
    var url = "user/settings/" + encodeURIComponent(settingName);
    var setting = {
        Setting: settingName,
        Value: settingValue,
        Description: ""
    };
    return Doors.RESTFULL.asyncCall(url, "POST", setting, "setting");
};

Doors.API.prototype.instanceSettingsGet = function (settingName) {
    var url = "settings/" + encodeURIComponent(settingName);
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.masterSettingsGet = function (settingName) {
    var url = "mastersettings/" + encodeURIComponent(settingName);
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.masterSettingsSet = function (settingName, settingValue) {
    var url = "mastersettings";
    var setting = {
        Setting: settingName,
        Value: settingValue,
        Description: ""
    };
    return Doors.RESTFULL.asyncCall(url, "POST", setting, "setting");
};

Doors.API.prototype.instanceSettingsRemove = function (settingName) {
    var url = "settings/" + encodeURIComponent(settingName);
    return Doors.RESTFULL.asyncCall(url, "DELETE", "", "");
};

Doors.API.prototype.sessionTags = function () {
    var url = "session/tags";
    return Doors.RESTFULL.asyncCall(url, "GET", {}, "");
};

Doors.API.prototype.tokensReplace = function (inputString) {
    var str = inputString ? inputString : "";
    var url = "session/tokens/replaced?text=" + encodeURIComponent(str);
    return Doors.RESTFULL.asyncCall(url, "POST", {}, "");
};

Doors.API.prototype.runSyncEventsOnClientSet = function (runOnClient) {
    var str = runOnClient === "true" || runOnClient === true || runOnClient === "1" ? "true" : "false";
    var url = "session/syncevents/runOnClient/" + str;
    return Doors.RESTFULL.asyncCall(url, "POST", {}, "");
};

Doors.API.prototype.runSyncEventsOnClientGet = function () {
    var url = "session/syncevents/runOnClient";
    return Doors.RESTFULL.asyncCall(url, "GET", {}, "");
};

Doors.API.prototype.syncEventsDisabledSet = function (disabled) {
    var str = disabled === "true" || disabled === true || disabled === "1" ? "true" : "false";
    var url = "session/syncevents/disabled/" + str;
    return Doors.RESTFULL.asyncCall(url, "POST", {}, "");
};

Doors.API.prototype.syncEventsDisabledGet = function () {
    var url = "session/syncevents/disabled";
    return Doors.RESTFULL.asyncCall(url, "GET", {}, "");
};

Doors.API.prototype.asyncEventsDisabledSet = function (disabled) {
    var str = disabled === "true" || disabled === true || disabled === "1" ? "true" : "false";
    var url = "session/asyncevents/disabled/" + str;
    return Doors.RESTFULL.asyncCall(url, "POST", {}, "");
};

Doors.API.prototype.asyncEventsDisabledGet = function () {
    var url = "session/asyncevents/disabled";
    return Doors.RESTFULL.asyncCall(url, "GET", {}, "");
};

/*Directory Functions*/
Doors.API.prototype.usersGetById = function (accId) {
    var url = "users/" + accId;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.accountsGetById = function (accId) {
    var url = "accounts/" + accId;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.accountSetPicture = function (accId, imageByteArray) {
    var url = "accounts/" + accId + "/picture";
    return Doors.RESTFULL.asyncCall(url, "POST", "imageByteArray", imageByteArray);
};

Doors.API.prototype.accountSetPictureData = function (accId, data, contentType) {
    var pictureProfile = {
        Data: data,
        File: null,
        Extension: null,
        Name: ""
    };
    var url = "accounts/" + accId + "/picture/data";
    return Doors.RESTFULL.asyncCall(url, "POST", pictureProfile, "pictureProfile");
};

Doors.API.prototype.accountGetPicture = function (accId) {
    var url = "accounts/" + accId + "/picture/data";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.accountChilds = function (accId) {
    var url = "accounts/" + accId + "/childAccounts";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.accountChildsRecursive = function (accId) {
    var url = "accounts/" + encodeURIComponent(accId) + "/childAccountsRecursive";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.accountDelete = function (accId, expropiateObjects) {
    if (!expropiateObjects) expropiateObjects = false;
    var url = "accounts/" + encodeURIComponent(accId) + "?expropiateObjects=" + expropiateObjects;
    return Doors.RESTFULL.asyncCall(url, "DELETE", "", "");
};

Doors.API.prototype.accountChildsAdd = function (accId, arrayChildAccounts) {
    var url = "accounts/" + accId + "/childAccounts";
    return Doors.RESTFULL.asyncCall(url, "PUT", arrayChildAccounts, "arrayChildAccountIds");
};

Doors.API.prototype.accountChildsRemove = function (accId, arrayChildAccounts) {
    var url = "accounts/" + accId + "/childAccounts";
    return Doors.RESTFULL.asyncCall(url, "DELETE", arrayChildAccounts, "arrayChildAccountIds");
};

Doors.API.prototype.userNew = function () {
    return DoorsAPI.newAccount(AccountsTypeEnum.UserAccount.value);
};

Doors.API.prototype.groupNew = function () {
    return DoorsAPI.newAccount(AccountsTypeEnum.GroupAccount.value);
};

Doors.API.prototype.newAccount = function (accountType) {
    var url;
    if (accountType === AccountsTypeEnum.UserAccount.value) {
        url = "users/new";
    } else if (accountType === AccountsTypeEnum.GroupAccount.value) {
        url = "groups/new";
    } else {
        return null;
    }
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.userSave = function (user) {
    var url = "users/" + user.AccId;
    var operation = "POST";
    if (user.AccId === undefined || user.AccId == null || user.IsNew) {
        operation = "PUT";
        url = "users";
    }
    return Doors.RESTFULL.asyncCall(url, operation, user, "user");

};

Doors.API.prototype.groupSave = function (account) {
    var url = "accounts/" + account.AccId;
    var operation = "POST";
    if (account.AccId === undefined || account.AccId == null) {
        operation = "PUT";
        url = "accounts";
    }
    return Doors.RESTFULL.asyncCall(url, operation, account, "account");

};

Doors.API.prototype.accountSave = function (account) {
    var url = "accounts/" + account.AccId + "";
    return Doors.RESTFULL.asyncCall(url, "POST", account, "account");
};

Doors.API.prototype.accountParentsRecursive = function (accId) {

    var url = "accounts/" + encodeURIComponent(accId) + "/parentAccountsRecursive";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.accountParents = function (accId) {

    var url = "accounts/" + encodeURIComponent(accId) + "/parentAccounts";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.accountParentsAdd = function (accId, arrParentAccounts) {
    accId = accId + "";
    var url = "accounts/" + encodeURIComponent(accId) + "/parentAccounts";
    return Doors.RESTFULL.asyncCall(url, "PUT", arrParentAccounts, "arrayParentAccounts");
};

Doors.API.prototype.accountParentsRemove = function (accId, arrParentAccounts) {
    accId = accId + "";
    var url = "accounts/" + encodeURIComponent(accId) + "/parentAccounts";
    return Doors.RESTFULL.asyncCall(url, "DELETE", arrParentAccounts, "arrayParentAccounts");
};

Doors.API.prototype.accountsGetById = function (accountsIds) {
    var url = "accounts?accIds=" + accountsIds;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.accountsGetByName = function (accName) {
    var url = "accounts?accName=" + accName;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.accountsSearch = function (filter, order) {
    var url = "/accounts/search?filter={filter}&order={order}";
    url = url.replace("{filter}", encodeURIComponent(filter))
        .replace("{order}", encodeURIComponent(order));
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.accounts = function () {
    var url = "accounts";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.generateApiKey = function (accId) {
    var url = "accounts/" + accId + "/apikey";
    return Doors.RESTFULL.asyncCall(url, "POST", "", "");
};

Doors.API.prototype.deleteApiKey = function (accId) {
    var url = "accounts/" + accId + "/apikey";
    return Doors.RESTFULL.asyncCall(url, "DELETE", "", "");
};

/*Folders Functions*/
Doors.API.prototype.foldersTree = function () {
    var url = "folders";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.folderParents = function (fldId) {
    var url = "folders/" + fldId + "/parents";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.foldersGetByName = function (parentFolderId, folderName) {
    var url = "folders/" + parentFolderId + "/children?foldername=" + encodeURIComponent(folderName);
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.foldersGetByPath = function (parentFolderId, folderPath) {
    var url = "folders/" + parentFolderId + "/children?folderpath=" + encodeURIComponent(folderPath);
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.foldersGetFromId = function (fldId) {
    var url = "folders/" + fldId + "";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.foldersList = function (fldIdsArray) {
    var fldIds = fldIdsArray;
    if (Object.prototype.toString.call(fldIdsArray) === "[object Array]") {
        fldIds = fldIdsArray.join(",");
    }
    var url = "folders?fldIds=" + fldIds;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.folderChilds = function (fldId) {
    var url = "folders/" + fldId + "/childrens";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

/*Views Functions*/
Doors.API.prototype.views = function (fldId) {
    var url = "folders/" + fldId + "/views";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.viewsNew = function (fldId) {
    var url = "folders/" + fldId + "/views/new";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.viewsGetByName = function (fldId, viewName) {
    var url = "folders/" + fldId + "/views?name=" + viewName;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.viewsGetById = function (fldId, viewId) {
    var url = "folders/" + fldId + "/views/" + viewId;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.viewCopy = function (fldId, viewId, targetFldId, asPrivate, newName) {
    if (!asPrivate || asPrivate == "") {
        asPrivate = false;
    }
    if (!newName || newName == "") {
        newName = "";
    }
    var url = "folders/" + fldId + "/views/" + viewId + "/copy/" + targetFldId +
        "?private=" + asPrivate + "&newName=" + newName;
    return Doors.RESTFULL.asyncCall(url, "POST", {}, "");
};

Doors.API.prototype.viewDelete = function (fldId, viewId, sendRecycleBin) {
    sendRecycleBin = (sendRecycleBin === undefined ? true : sendRecycleBin);
    var url = "folders/" + fldId + "/views/" + viewId + "?tobin=" + encodeURIComponent(sendRecycleBin);
    return Doors.RESTFULL.asyncCall(url, "DELETE", {}, "");
};

Doors.API.prototype.viewSave = function (view) {
    var url = "folders/" + fldId + "/views";
    return Doors.RESTFULL.asyncCall(url, "POST", view, "view");
};

Doors.API.prototype.viewSearch = function (fldId, viewId, viewType, groups, formula, maxDescValueLength, extraFields, groupToSearch) {
    var url = "folders/" + fldId + "/views/" + viewId +
        "/documents?groups=" + encodeURIComponent(groups) +
        "&formula=" + encodeURIComponent(formula) + "&maxMemoLength=" +
        maxDescValueLength + "&extraFields=" + extraFields + "&groupToSearch=" + groupToSearch;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.viewExport = function (fldId, viewId, exportFormat, onlyColumns, formula, docIds) {
    var colsOnly = false;
    if (onlyColumns)
        colsOnly = onlyColumns;
    if (!docIds)
        docIds = "";
    var url = "folders/" + fldId + "/views/" + viewId +
        "/download?format=" + exportFormat + "&onlyNames=" + colsOnly + "&formula=" +
        encodeURIComponent(formula) + "&docs=" + docIds;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.getExportUrl = function (fldId, viewId, exportFormat, onlyColumns, formula, docIds) {
    var colsOnly = false;
    if (onlyColumns)
        colsOnly = onlyColumns;
    if (!docIds)
        docIds = "";
    var url = "folders/" + fldId + "/views/" + viewId +
        "/download?format=" + exportFormat + "&onlyNames=" + colsOnly + "&formula=" +
        encodeURIComponent(formula) + "&docs=" + docIds;
    return url;
};

/*Form Functions*/
Doors.API.prototype.forms = function () {
    var url = "forms";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.formsNew = function () {
    var url = "forms/new";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.formSave = function (form) {
    var url = "forms";
    var action = "PUT";
    if (!form.IsNew) {
        action = "POST";
        url += "/" + form.FrmId;
    }
    return Doors.RESTFULL.asyncCall(url, action, form, "form");
};
Doors.API.prototype.formDelete = function (frmId) {
    var url = "forms/" + frmId;
    return Doors.RESTFULL.asyncCall(url, "DELETE", {}, "");
};

Doors.API.prototype.formsGetById = function (frmId) {
    var url = "forms/" + frmId;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.formsGetByFolderId = function (fldId) {
    var url = "forms?fldId=" + fldId;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.formsGetFullTextIndexed = function () {
    var url = "forms/fulltextindexed"
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.formsSearch = function (frmId, folders, fields, formula, order, maxDocs, recursive, maxDescriptionLength) {

    if (!frmId || !folders || !fields) {
        throw "frmId, folders and fields parameters are required";
    }

    if (!formula) formula = "";
    if (!order) order = "";
    if (!maxDocs) maxDocs = 1000;
    if (recursive === undefined) recursive = false;
    if (!maxDescriptionLength) maxDescriptionLength = 150;

    var url = "forms/" + frmId + "/documents?folders=" + folders +
        "&fields=" + fields + "&formula=" + formula + "&order=" + order +
        "&maxDocs=" + maxDocs + "&recursive=" + recursive + "&maxDescrLength=" + maxDescriptionLength;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.formsSearchGroups = function (frmId, folders, groups, totals, formula, maxDocs, recursive, groupsOrder, totalsOrder) {

    if (!frmId || !folders || !groups || !totals) {
        throw "frmId, folders, groups and totals parameters are required";
    }
    var fldIds = folders;
    if (Object.prototype.toString.call(folders) === "[object Array]") {
        fldIds = folders.join(",");
    }

    if (!formula) formula = "";
    if (!groupsOrder) groupsOrder = "";
    if (!totalsOrder) totalsOrder = "";
    if (!maxDocs) maxDocs = 1000;
    if (recursive === undefined) recursive = false;

    var url = "forms/" + frmId + "/documents/grouped?folders=" + fldIds +
        "&groups=" + groups + "&totals=" + totals + "&formula=" + formula + "&order=" +
        "&maxDocs=" + maxDocs + "&recursive=" + recursive + "&groupsOrder=" + groupsOrder +
        "&totalsOrder=" + totalsOrder;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.formsEvents = function (frmId) {
    var url = "forms/" + frmId + "/syncevents";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.formEventsSave = function (frmId, syncEvents) {
    var url = "form/" + frmId + "/syncevents";
    return Doors.RESTFULL.asyncCall(url, "POST", syncEvents, "syncEvents");
};

Doors.API.prototype.formEventSave = function (frmId, syncEvent) {
    var url = "form/" + frmId + "/syncevent";
    return Doors.RESTFULL.asyncCall(url, "POST", syncEvent, "syncEvent");
};
/*Folder Functions*/
Doors.API.prototype.foldersGetById = function (fldId) {
    var url = "folders/" + fldId + "";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.folderAncestors = function (fldId, bfldInclusive) {
    var url = "folders/" + fldId + "/parents?inclusive=" + bfldInclusive;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.folderDescendants = function (fldId) {
    var url = "folders/" + fldId + "/descendants";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.folderCopy = function (originFolderId, destinationFolderId, newFolderName) {
    var url = "folders/" + originFolderId + "/copy/" + destinationFolderId + "/newFolderName=" + encodeURIComponent(newFolderName);
    return Doors.RESTFULL.asyncCall(url, "POST", "", "");
};

Doors.API.prototype.foldersNew = function (parentFolderId, folderType, formId) {
    var url = "folders/new/parentFolderId=" + parentFolderId + "&folderType=" + folderType + "&formId=" + formId;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.folderSave = function (folder) {
    var url = "folders";
    var action = "PUT";
    if (!folder.IsNew) {
        action = "POST";
        url += "/" + folder.FldId;
    }
    return Doors.RESTFULL.asyncCall(url, action, folder, "folder");
};

Doors.API.prototype.folderMove = function (fldId, destinationParentFolderId) {
    var url = "folders/" + fldId + "/move/" + destinationParentFolderId;
    return Doors.RESTFULL.asyncCall(url, "POST", "", "");
};

Doors.API.prototype.folderDelete = function (fldId) {
    var url = "folders/" + fldId;
    return Doors.RESTFULL.asyncCall(url, "DELETE", {}, "");
};

Doors.API.prototype.folderEvents = function (fldId) {
    var url = "folders/" + fldId + "/syncevents";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.folderEventSave = function (fldId, syncEvent) {
    var url = "folders/" + fldId + "/syncevent";
    return Doors.RESTFULL.asyncCall(url, "POST", syncEvent, "syncEvent");
};

Doors.API.prototype.folderEventsSave = function (fldId, syncEvents) {
    var url = "folders/" + fldId + "/syncevents";
    return Doors.RESTFULL.asyncCall(url, "POST", syncEvents, "syncEvents");
};

Doors.API.prototype.folderAsyncEventsNew = function (fldId, eventType) {
    var url = "folders/" + fldId + "/asyncevents/" + eventType + "/new";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.folderAsyncEvents = function (fldId) {
    var url = "folders/" + fldId + "/asyncevents";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.folderSearch = function (fldId, fields, formula, order, maxDocs, recursive, maxDescrLength) {
    var url = "folders/" + fldId + "/documents";
    var rec = false;
    var maxLength = 100;
    if (recursive)
        rec = recursive;
    if (maxDescrLength !== undefined)
        maxLength = maxDescrLength;
    if (!maxDocs) {
        maxDocs = 1000;
    }
    if (!order) {
        order = "";
    }
    var parameters = "fields=" + encodeURIComponent(fields) +
        "&formula=" + encodeURIComponent(formula) + "&order=" + encodeURIComponent(order) +
        "&maxDocs=" + maxDocs + "&recursive=" + rec + "&maxDescrLength=" + maxLength;
    return Doors.RESTFULL.asyncCall(url, "GET", parameters, "");
};

Doors.API.prototype.folderSearchByPath = function (rootFolderId, folderPath, fields, formula, order, maxDocs, recursive, maxDescrLength) {
    folderPath = (folderPath.indexOf("/") >= 0) ? encodeURIComponent(folderPath) : folderPath
    var url = "folders/" + rootFolderId + "/" + encodeURIComponent(folderPath) + "/documents";
    var rec = false;
    var maxLength = 100;
    if (recursive)
        rec = recursive;
    if (maxDescrLength !== undefined)
        maxLength = maxDescrLength;
    if (!maxDocs) {
        maxDocs = 1000;
    }
    if (!order) {
        order = "";
    }
    var parameters = "fields=" + encodeURIComponent(fields) +
        "&formula=" + encodeURIComponent(formula) + "&order=" + encodeURIComponent(order) +
        "&maxDocs=" + maxDocs + "&recursive=" + rec + "&maxDescrLength=" + maxLength;
    return Doors.RESTFULL.asyncCall(url, "GET", parameters, "");
};

Doors.API.prototype.folderAsyncEventsSearch = function (filter, order) {
    var url = "folders/asyncevents/search";
    if (!order) {
        order = "created asc";
    }
    var parameters = "filter=" + encodeURIComponent(filter) +
        "&order=" + encodeURIComponent(order);
    return Doors.RESTFULL.asyncCall(url, "GET", parameters, "");
};

Doors.API.prototype.folderSyncEventsSearch = function (filter, order) {
    var url = "folders/syncevents/search";
    if (!order) {
        order = "created asc";
    }
    var parameters = "filter=" + encodeURIComponent(filter) +
        "&order=" + encodeURIComponent(order);
    return Doors.RESTFULL.asyncCall(url, "GET", parameters, "");
};


Doors.API.prototype.folderSearchDeleted = function (fields, formula, order, maxDocs, recursive, maxDescrLength) {
    /*
     Campos para formula:
        deleteDate = p.modified
        deleteUser = a2.name
        folder = f.root_fld_path
        doc_id = d.doc_id
        subject = d.subject
        modified = d.modified
        owner = a.name
     */
    var url = "folders/0/documents";
    var rec = false;
    var maxLength = 100;
    if (recursive)
        rec = recursive;
    if (maxDescrLength !== undefined)
        maxLength = maxDescrLength;
    if (!maxDocs) {
        maxDocs = 1000;
    }
    if (!order) {
        order = "";
    }
    var parameters = "fields=" + encodeURIComponent(fields) +
        "&formula=" + encodeURIComponent(formula) + "&order=" + encodeURIComponent(order) +
        "&maxDocs=" + maxDocs + "&recursive=" + rec + "&maxDescrLength=" + maxLength;
    return Doors.RESTFULL.asyncCall(url, "GET", parameters, "");
};

Doors.API.prototype.folderSearchGroups = function (fldId, groups, totals, formula, order, maxDocs, recursive, groupsOrder, totalsOrder) {
    var url = "folders/" + fldId + "/documents/grouped";
    var rec = false;

    if (recursive)
        rec = recursive;
    var parameters = "groups=" + encodeURIComponent(groups) +
        "&totals=" + (totals === undefined ? "" : encodeURIComponent(totals)) +
        "&formula=" + (formula === undefined ? "" : encodeURIComponent(formula)) +
        "&order=" + (order === undefined ? "" : encodeURIComponent(order)) +
        "&maxDocs=" + (maxDocs === undefined ? 100 : maxDocs) +
        "&recursive=" + rec +
        "&groupsOrder=" + (groupsOrder === undefined ? "" : encodeURIComponent(groupsOrder)) +
        "&totalsOrder=" + (totalsOrder === undefined ? "" : encodeURIComponent(totalsOrder));
    return Doors.RESTFULL.asyncCall(url, "GET", parameters, "");
};

Doors.API.prototype.folderSearchPivot = function (fldId, pivotField, crossField, formula, totalsField, totalsFunc, totalsOrder, crossFieldOrder, maxDocs) {
    var url = "folders/" + fldId + "/documents/pivot";
    var parameters = "pivotField=" + encodeURIComponent(pivotField) +
        "&crossField=" + encodeURIComponent(crossField) +
        "&formula=" + (formula === undefined ? "" : encodeURIComponent(formula)) +
        "&totalsField=" + (totalsField === undefined ? "" : encodeURIComponent(totalsField)) +
        "&totalsFunc=" + (totalsFunc === undefined ? "" : encodeURIComponent(totalsFunc)) +
        "&totalsOrder=" + (totalsOrder === undefined ? "" : encodeURIComponent(totalsOrder)) +
        "&crossFieldOrder=" + (crossFieldOrder === undefined ? "" : encodeURIComponent(crossFieldOrder)) +
        "&maxDocs=" + (maxDocs === undefined ? 30 : maxDocs);
    return Doors.RESTFULL.asyncCall(url, "GET", parameters, "");
};

/*Documents Functions*/

Doors.API.prototype.documentsNew = function (fldId) {

    var url = "folders/" + fldId + "/documents/new";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.documentsGetById = function (docId) {
    var url = "documents/" + docId;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.documentsFieldsLog = function (docId) {
    var url = "documents/" + docId + "/fieldslog";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.documentSave = function (document) {
    var url = "documents";
    return Doors.RESTFULL.asyncCall(url, "PUT", document, "document");
};

Doors.API.prototype.documentDelete = function (fldId, docId, sendRecycleBin) {
    var sendRecycleBin = (sendRecycleBin === undefined ? true : sendRecycleBin);
    var url = "folders/" + fldId + "/documents/?tobin=" + encodeURIComponent(sendRecycleBin);
    return Doors.RESTFULL.asyncCall(url, "DELETE", [docId], "docIds");
};

Doors.API.prototype.documentsDeleteByFormula = function (fldId, formula) {
    var url = "folders/" + fldId + "/documents/" + encodeURIComponent(formula);
    return Doors.RESTFULL.asyncCall(url, "DELETE", {}, "");
};

Doors.API.prototype.documentCurrentAccess = function (docId, access) {
    var url = "documents/" + docId + "/acl/" + encodeURIComponent(access);
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.documentCopy = function (destFldId, docId) {
    var url = "documents/" + docId + "/copy/" + destFldId;
    return Doors.RESTFULL.asyncCall(url, "POST", {}, "");
};

Doors.API.prototype.documentsRestore = function (docIds) {
    var url = "/folders/0/documents/restore";
    if (typeof (docIds) === "string") {
        docIds = docIds.split(",");
    }
    return Doors.RESTFULL.asyncCall(url, "POST", docIds, "docIds");
};

Doors.API.prototype.documentsPurge = function (docIds) {
    var url = "/folders/0/documents/purge";
    if (typeof (docIds) === "string") {
        docIds = docIds.split(",");
    }
    return Doors.RESTFULL.asyncCall(url, "POST", docIds, "docIds");
};

/*Attachments Functions*/

Doors.API.prototype.attachments = function (docId) {
    var url = "documents/" + docId + "/attachments";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.attachmentsGetById = function (docId, attId) {
    var url = "documents/" + docId + "/attachments/" + attId;
    return Doors.RESTFULL.asyncCallXmlHttp(url, "GET", "");
};

Doors.API.prototype.attachmentsGetByName = function (docId, attName) {
    var url = "documents/" + docId + "/attachments?name=" + encodeURIComponent(attName);
    return Doors.RESTFULL.asyncCallXmlHttp(url, "GET", "");
};

Doors.API.prototype.attachmentsDownload = function (docId, attId) {
    var url = "documents/" + docId + "/attachments/" + attId + "/download";
    return Doors.RESTFULL.asyncCallXmlHttp(url, "GET", "");
};

Doors.API.prototype.attachmentsSave = function (docId, formData) {
    var url = "documents/" + docId + "/attachments";
    return Doors.RESTFULL.asyncCallXmlHttp(url, "POST", formData);
};

Doors.API.prototype.attachmentsDelete = function (docId, arrayAttId) {
    var url = "documents/" + docId + "/attachments";
    return Doors.RESTFULL.asyncCall(url, "DELETE", arrayAttId, "arrayAttId");
};

/*Properties Functions*/

Doors.API.prototype.formPropertiesGet = function (frmId) {
    return DoorsAPI.propertiesGet(frmId, DoorsObjectTypesEnum.CustomForm.value, "", "");
};

Doors.API.prototype.formPropertiesSet = function (frmId, arrProperties) {
    return DoorsAPI.propertiesSet(frmId, DoorsObjectTypesEnum.CustomForm.value, "", "", arrProperties);
};

Doors.API.prototype.formtPropertiesRemove = function (frmId, arrProperties) {
    return DoorsAPI.propertiesRemove(frmId, DoorsObjectTypesEnum.CustomForm.value, "", "", arrProperties);
};

Doors.API.prototype.accountPropertiesGet = function (accId) {
    return DoorsAPI.propertiesGet(accId, DoorsObjectTypesEnum.Account.value, "", "");
};

Doors.API.prototype.accountPropertiesSet = function (accId, arrProperties) {
    return DoorsAPI.propertiesSet(accId, DoorsObjectTypesEnum.Account.value, "", "", arrProperties);
};

Doors.API.prototype.accountPropertiesRemove = function (accId, arrProperties) {
    return DoorsAPI.propertiesRemove(accId, DoorsObjectTypesEnum.Account.value, "", "", arrProperties);
};

Doors.API.prototype.folderPropertiesGet = function (fldId) {
    return DoorsAPI.propertiesGet(fldId, DoorsObjectTypesEnum.Folder.value, "", "");
};

Doors.API.prototype.folderPropertiesSet = function (fldId, arrProperties) {
    return DoorsAPI.propertiesSet(fldId, DoorsObjectTypesEnum.Folder.value, "", "", arrProperties);
};

Doors.API.prototype.folderPropertiesRemove = function (fldId, arrProperties) {
    return DoorsAPI.propertiesRemove(fldId, DoorsObjectTypesEnum.Folder.value, "", "", arrProperties);
};

Doors.API.prototype.viewPropertiesGet = function (fldId, vieId) {
    return DoorsAPI.propertiesGet(vieId, DoorsObjectTypesEnum.View.value, fldId, "");
};

Doors.API.prototype.viewPropertiesSet = function (fldId, vieId, arrProperties) {
    return DoorsAPI.propertiesSet(vieId, DoorsObjectTypesEnum.View.value, fldId, "", arrProperties);
};

Doors.API.prototype.viewPropertiesRemove = function (fldId, vieId, arrProperties) {
    return DoorsAPI.propertiesRemove(vieId, DoorsObjectTypesEnum.View.value, fldId, "", arrProperties);
};

Doors.API.prototype.documentPropertiesGet = function (docId) {
    return DoorsAPI.propertiesGet(docId, DoorsObjectTypesEnum.Document.value, "", "");
};

Doors.API.prototype.documentPropertiesSet = function (docId, arrProperties) {
    return DoorsAPI.propertiesSet(docId, DoorsObjectTypesEnum.Document.value, "", "", arrProperties);
};

Doors.API.prototype.documentPropertiesRemove = function (docId, arrProperties) {
    return DoorsAPI.propertiesRemove(docId, DoorsObjectTypesEnum.Document.value, "", "", arrProperties);
};

Doors.API.prototype.attachmentPropertiesGet = function (attId) {
    return DoorsAPI.propertiesGet(attId, DoorsObjectTypesEnum.Attachment.value, "", "");
};

Doors.API.prototype.attachmentPropertiesSet = function (attId, arrProperties) {
    return DoorsAPI.propertiesSet(attId, DoorsObjectTypesEnum.Attachment.value, "", "", arrProperties);
};

Doors.API.prototype.attachmentPropertiesRemove = function (attId, arrProperties) {
    return DoorsAPI.propertiesRemove(attId, DoorsObjectTypesEnum.Attachment.value, "", "", arrProperties);
};

Doors.API.prototype.fieldPropertiesGet = function (frmId, fieldName) {
    return DoorsAPI.propertiesGet(frmId, DoorsObjectTypesEnum.Field.value, "", fieldName);
};

Doors.API.prototype.fieldPropertiesSet = function (frmId, fieldName, arrProperties) {
    return DoorsAPI.propertiesSet(frmId, DoorsObjectTypesEnum.Field.value, "", fieldName, arrProperties);
};

Doors.API.prototype.fieldPropertiesRemove = function (frmId, fieldName, arrProperties) {
    return DoorsAPI.propertiesRemove(frmId, DoorsObjectTypesEnum.Field.value, "", fieldName, arrProperties);
};

Doors.API.prototype.propertiesGet = function (objId, objType, objParentId, objName) {
    if (!objParentId) {
        objParentId = "";
    }
    if (!objName) {
        objName = "";
    }
    var url = "properties?objectId=" + objId + "&objectType=" + objType +
        "&objectParentId=" + objParentId + "&objectName=" + encodeURIComponent(objName);
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.propertiesSet = function (objId, objType, objParentId, objName, arrProperties) {

    if (!objParentId) {
        objParentId = "";
    }
    if (!objName) {
        objName = "";
    }
    var url = "properties?objectId=" + objId + "&objectType=" + objType +
        "&objectParentId=" + objParentId + "&objectName=" + encodeURIComponent(objName);
    return Doors.RESTFULL.asyncCall(url, "PUT", arrProperties, "arrProperties");
};

Doors.API.prototype.propertiesRemove = function (objId, objType, objParentId, objName, arrProperties) {

    if (!objParentId) {
        objParentId = "";
    }
    if (!objName) {
        objName = "";
    }
    var url = "properties?objectId=" + objId + "&objectType=" + objType +
        "&objectParentId=" + objParentId + "&objectName=" + encodeURIComponent(objName);
    return Doors.RESTFULL.asyncCall(url, "DELETE", arrProperties, "arrProperties");
};

/*UserProperties Functions*/

Doors.API.prototype.formUserPropertiesGet = function (frmId) {
    return DoorsAPI.userPropertiesGet(frmId, DoorsObjectTypesEnum.CustomForm.value, "", "");
};

Doors.API.prototype.formUserPropertiesSet = function (frmId, arrProperties) {
    return DoorsAPI.userPropertiesSet(frmId, DoorsObjectTypesEnum.CustomForm.value, "", "", arrProperties);
};

Doors.API.prototype.formtUserPropertiesRemove = function (frmId, arrProperties) {
    return DoorsAPI.userPropertiesRemove(frmId, DoorsObjectTypesEnum.CustomForm.value, "", "", arrProperties);
};

Doors.API.prototype.accountUserPropertiesGet = function (accId) {
    return DoorsAPI.userPropertiesGet(accId, DoorsObjectTypesEnum.Account.value, "", "");
};

Doors.API.prototype.accountUserPropertiesSet = function (accId, arrProperties) {
    return DoorsAPI.userPropertiesSet(accId, DoorsObjectTypesEnum.Account.value, "", "", arrProperties);
};

Doors.API.prototype.accountUserPropertiesRemove = function (accId, arrProperties) {
    return DoorsAPI.userPropertiesRemove(accId, DoorsObjectTypesEnum.Account.value, "", "", arrProperties);
};

Doors.API.prototype.folderUserPropertiesGet = function (fldId) {
    return DoorsAPI.userPropertiesGet(fldId, DoorsObjectTypesEnum.Folder.value, "", "");
};

Doors.API.prototype.folderUserPropertiesSet = function (fldId, arrProperties) {
    return DoorsAPI.userPropertiesSet(fldId, DoorsObjectTypesEnum.Folder.value, "", "", arrProperties);
};

Doors.API.prototype.folderUserPropertiesRemove = function (fldId, arrProperties) {
    return DoorsAPI.userPropertiesRemove(fldId, DoorsObjectTypesEnum.Folder.value, "", "", arrProperties);
};

Doors.API.prototype.viewUserPropertiesGet = function (fldId, vieId) {
    return DoorsAPI.userPropertiesGet(vieId, DoorsObjectTypesEnum.View.value, fldId, "");
};

Doors.API.prototype.viewUserPropertiesSet = function (fldId, vieId, arrProperties) {
    return DoorsAPI.userPropertiesSet(vieId, DoorsObjectTypesEnum.View.value, "", fldId, arrProperties);
};

Doors.API.prototype.viewUserPropertiesRemove = function (fldId, vieId, arrProperties) {
    return DoorsAPI.userPropertiesRemove(vieId, DoorsObjectTypesEnum.View.value, fldId, "", arrProperties);
};

Doors.API.prototype.documentUserPropertiesGet = function (docId) {
    return DoorsAPI.userPropertiesGet(docId, DoorsObjectTypesEnum.Document.value, "", "");
};

Doors.API.prototype.documentUserPropertiesSet = function (docId, arrProperties) {
    return DoorsAPI.userPropertiesSet(docId, DoorsObjectTypesEnum.Document.value, "", "", arrProperties);
};

Doors.API.prototype.documentUserPropertiesRemove = function (docId, arrProperties) {
    return DoorsAPI.userPropertiesRemove(docId, DoorsObjectTypesEnum.Document.value, "", "", arrProperties);
};

Doors.API.prototype.attachmentUserPropertiesGet = function (attId) {
    return DoorsAPI.userPropertiesGet(attId, DoorsObjectTypesEnum.Attachment.value, "", "");
};

Doors.API.prototype.attachmentUserPropertiesSet = function (attId, arrProperties) {
    return DoorsAPI.userPropertiesSet(attId, DoorsObjectTypesEnum.Attachment.value, "", "", arrProperties);
};

Doors.API.prototype.attachmentUserPropertiesRemove = function (attId, arrProperties) {
    return DoorsAPI.userPropertiesRemove(attId, DoorsObjectTypesEnum.Attachment.value, "", "", arrProperties);
};

Doors.API.prototype.fieldUserPropertiesGet = function (frmId, fieldName) {
    return DoorsAPI.userPropertiesGet(frmId, DoorsObjectTypesEnum.Field.value, "", fieldName);
};

Doors.API.prototype.fieldUserPropertiesSet = function (frmId, fieldName, arrProperties) {
    return DoorsAPI.userPropertiesSet(frmId, DoorsObjectTypesEnum.Field.value, "", fieldName, arrProperties);
};

Doors.API.prototype.fieldUserPropertiesRemove = function (frmId, fieldName, arrProperties) {
    return DoorsAPI.userPropertiesRemove(frmId, DoorsObjectTypesEnum.Field.value, "", fieldName, arrProperties);
};

Doors.API.prototype.userPropertiesGet = function (objId, objType, objParentId, objName) {
    if (!objParentId) {
        objParentId = "";
    }
    if (!objName) {
        objName = "";
    }
    var url = "userproperties?objectId=" + objId + "&objectType=" + objType +
        "&objectParentId=" + objParentId + "&objectName=" + encodeURIComponent(objName);
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.userPropertiesRemove = function (objId, objType, objParentId, objName, arrProperties) {

    if (!objParentId) {
        objParentId = "";
    }
    if (!objName) {
        objName = "";
    }
    var url = "userproperties?objectId=" + objId + "&objectType=" + objType +
        "&objectParentId=" + objParentId + "&objectName=" + encodeURIComponent(objName);
    return Doors.RESTFULL.asyncCall(url, "DELETE", arrProperties, "arrProperties");
};

Doors.API.prototype.userPropertiesSet = function (objId, objType, objParentId, objName, arrProperties) {

    if (!objParentId) {
        objParentId = "";
    }
    if (!objName) {
        objName = "";
    }
    var url = "userproperties?objectId=" + objId + "&objectType=" + objType +
        "&objectParentId=" + objParentId + "&objectName=" + encodeURIComponent(objName);
    return Doors.RESTFULL.asyncCall(url, "PUT", arrProperties, "arrProperties");
};

/*Acl Functions*/
Doors.API.prototype.documentAcl = function (docId) {
    var url = "documents/" + docId + "/acl/";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.documentAclOwn = function (docId) {
    var url = "documents/" + docId + "/aclown/";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.documentInherited = function (docId) {
    var url = "documents/" + docId + "/aclinherited/";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.documentAclInherits = function (docId, inherits) {
    var url = "documents/" + docId + "/aclinherits/" + inherits;
    return Doors.RESTFULL.asyncCall(url, "POST", {}, "");
};

Doors.API.prototype.documentAclGrant = function (docId, access, accId) {
    var url = "documents/" + docId + "/acl/" + access + "/grant/" + accId;
    return Doors.RESTFULL.asyncCall(url, "POST", {}, "");
};

Doors.API.prototype.documentAclSave = function (docId, acl) {
    var url = "documents/" + docId + "/acl";
    var aclObj = {
        aclInformation: acl
    };
    return Doors.RESTFULL.asyncCall(url, "POST", aclObj, "");
};

Doors.API.prototype.documentAclRevoke = function (docId, access, accId) {
    var url = "documents/" + docId + "/acl/" + access + "/revoke/" + accId;
    return Doors.RESTFULL.asyncCall(url, "DELETE", {}, "");
};

Doors.API.prototype.documentAclRevokeAll = function (docId, accId) {
    /*En caso de que sea solo el docId, hace un revokeall AL objeto completo*/
    var url = "documents/" + docId + "/acl/revokeAll";
    if (accId !== undefined) {
        /*En caso de que venga el accId es un revoke all al objeto para esa cuenta*/
        url += "/" + accId;
    }
    return Doors.RESTFULL.asyncCall(url, "DELETE", {}, "");
};

Doors.API.prototype.viewAcl = function (fldId, viewId) {
    var url = "folders/" + fldId + "/views/" + viewId + "/acl";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.viewAclOwn = function (fldId, viewId) {
    var url = "folders/" + fldId + "/views/" + viewId + "/aclown";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.viewAclInherited = function (fldId, viewId) {
    var url = "folders/" + fldId + "/views/" + viewId + "/aclinherited";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.viewAclGrant = function (fldId, viewId, access, accId) {
    var url = "folders/" + fldId + "/views/" + viewId + "/acl/" + access + "/grant/" + accId;
    return Doors.RESTFULL.asyncCall(url, "POST", "", "");
};

Doors.API.prototype.viewAclRevoke = function (fldId, viewId, access, accId) {
    var url = "folders/" + fldId + "/views/" + viewId + "/acl/" + access + "/revoke/" + accId;
    return Doors.RESTFULL.asyncCall(url, "DELETE", "", "");
};

Doors.API.prototype.viewAclRevokeAll = function (fldId, viewId, accId) {
    /*En caso de que sea solo el fldId, hace un revokeall AL objeto completo*/
    var url = "folders/" + fldId + "/views/" + viewId + "/acl/revokeAll";
    if (accId !== undefined) {
        /*En caso de que venga el accId es un revoke all al objeto para esa cuenta*/
        url += "/" + accId;
    }
    return Doors.RESTFULL.asyncCall(url, "DELETE", "", "");
};

Doors.API.prototype.viewCurrentAccess = function (fldId, vieId, access, explicit) {
    var inherits = true;
    if (explicit !== "" && explicit === true) {
        inherits = false;
    }
    return DoorsAPI.currentAccess(access, vieId, DoorsObjectTypesEnum.Folder.value, inherits, fldId, "");
};

Doors.API.prototype.folderAcl = function (fldId) {
    var url = "folders/" + fldId + "/acl";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.folderAclOwn = function (fldId) {
    var url = "folders/" + fldId + "/aclown/";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.folderAclInherited = function (fldId) {
    var url = "folders/" + fldId + "/aclinherited";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.folderAclInherits = function (fldId, inherits) {
    var url = "folders/" + fldId + "/aclinherits/" + inherits;
    return Doors.RESTFULL.asyncCall(url, "POST", {}, "");
};

Doors.API.prototype.folderAclGrant = function (fldId, access, accId) {
    var url = "folders/" + fldId + "/acl/" + access + "/grant/" + accId;
    return Doors.RESTFULL.asyncCall(url, "POST", "", "");
};

Doors.API.prototype.folderAclRevoke = function (fldId, access, accId) {
    var url = "folders/" + fldId + "/acl/" + access + "/revoke/" + accId;
    return Doors.RESTFULL.asyncCall(url, "DELETE", {}, "");
};

Doors.API.prototype.folderAclRevokeAll = function (fldId, accId) {
    /*En caso de que sea solo el fldId, hace un revokeall AL objeto completo*/
    var url = "folders/" + fldId + "/acl/revokeall";
    if (accId !== undefined) {
        /*En caso de que venga el accId es un revoke all al objeto para esa cuenta*/
        url += "/account/" + accId;
    }
    return Doors.RESTFULL.asyncCall(url, "DELETE", {}, "");
};

Doors.API.prototype.folderAclSave = function (fldId, aclInformation) {
    var url = "folders/" + fldId + "/acl";
    return Doors.RESTFULL.asyncCall(url, "POST", aclInformation, "");
};

Doors.API.prototype.folderCurrentAccess = function (fldId, access, explicit) {
    var inherits = true;
    if (explicit !== "" && explicit) {
        inherits = false;
    }
    return DoorsAPI.currentAccess(access, fldId, DoorsObjectTypesEnum.Folder.value, inherits, "", "");
};

Doors.API.prototype.formAcl = function (frmGuid) {
    var url = "forms/" + frmGuid + "/acl";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.formAclGrant = function (frmGuid, access, accId) {
    var url = "forms/" + frmGuid + "/acl/" + access + "/grant/" + accId;
    return Doors.RESTFULL.asyncCall(url, "POST", "", "");
};

Doors.API.prototype.formAclRevoke = function (frmGuid, access, accId) {
    var url = "forms/" + frmGuid + "/acl/" + access + "/revoke/" + accId;
    return Doors.RESTFULL.asyncCall(url, "DELETE", "", "");
};

Doors.API.prototype.formAclRevokeAll = function (frmGuid, accId) {
    /*En caso de que sea solo el frmGuid, hace un revokeall AL objeto completo*/
    var url = "forms/" + frmGuid + "/acl/revokeAll";
    if (accId !== undefined) {
        /*En caso de que venga el accId es un revoke all al objeto para esa cuenta*/
        url += "/" + accId;
    }
    return Doors.RESTFULL.asyncCall(url, "DELETE", "", "");
};

Doors.API.prototype.formAclSave = function (frmGuid, acl) {
    var url = "forms/" + frmGuid + "/acl";
    var aclObj = {
        aclInformation: acl
    };
    return Doors.RESTFULL.asyncCall(url, "POST", aclObj, "");
};

Doors.API.prototype.formCurrentAccess = function (frmId, access, explicit) {
    var inherits = true;
    if (explicit !== "" && explicit === true) {
        inherits = false;
    }
    return DoorsAPI.currentAccess(access, frmId, DoorsObjectTypesEnum.CustomForm.value, inherits, "", "");
};

Doors.API.prototype.currentAccess = function (access, objId, objType, inherits, objParentId, accId) {
    if (!objParentId) {
        objParentId = "";
    }
    if (inherits === undefined) {
        inherits = "";
    }
    if (!accId) {
        accId = "";
    }
    var url = "acl/access?accId=" + accId + "&permission=" + access + "&objId=" + objId + "&objType=" + objType +
        "&inherits=" + inherits + "&objParentId=" + objParentId;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.GlobalSearch = function (searchForms, searchText, fromDate, toDate, formula, arrOrders, parseQuery) {
    var url = "documents/searchfulltextindexed";
    var searchFilter = {
        SearchText: searchText,
        SearchForms: searchForms,
        FromDate: fromDate,
        ToDate: toDate,
        Formula: formula,
        Orders: arrOrders,
        ParseQuery: parseQuery
    };
    return Doors.RESTFULL.asyncCall(url, "POST", searchFilter, "searchFilter");
}

Doors.API.prototype.formSyncEventsSearch = function (filter, order) {
    var url = "forms/syncevents/search";
    if (!order) {
        order = "created asc";
    }
    var parameters = "filter=" + encodeURIComponent(filter) +
        "&order=" + encodeURIComponent(order);
    return Doors.RESTFULL.asyncCall(url, "GET", parameters, "");
};

/*Notifications Functions*/

Doors.API.prototype.notificationDeviceRegister = function (notificationReceiver) {
    var url = "notifications/devices";
    return Doors.RESTFULL.asyncCall(url, "POST", notificationReceiver, "");
};

Doors.API.prototype.pushRegistration = function (regSettings) {
    var url = "notifications/devices";
    return Doors.RESTFULL.asyncCall(url, "POST", regSettings, "notificationReceiver");
};

Doors.API.prototype.pushUnreg = function (registrationType, registrationId) {
    var url = "notifications/devices";
    var parameters =
        "providerType=" + encodeURIComponent(registrationType) +
        "&registrationId=" + encodeURIComponent(registrationId);
    return Doors.RESTFULL.asyncCall(url, "DELETE", parameters, "");
};

Doors.API.prototype.notifications = function (devicePlatform, limit, lastDeliveryDate) {
    if (!limit) {
        limit = "100";
    }
    if (!lastDeliveryDate) {
        lastDeliveryDate = "";
    }
    var url = "notifications/loggeduser?devicePlatform=" + devicePlatform +"&limit=" + limit + "&lastDeliveryDate=" + lastDeliveryDate;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.notificationsByAccId = function (accId) {
    var url = "notifications/accounts/" + encodeURIComponent(accId);
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.notificationsByLogin = function (login) {
    var url = "notifications/accounts?login=" + encodeURIComponent(login);
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.notificationsRead = function (notificationId) {
    var url = "notifications/" + encodeURIComponent(notificationId) + "/status/read";
    return Doors.RESTFULL.asyncCall(url, "POST", "", "");
};

Doors.API.prototype.notificationsUnRead = function (notificationId) {
    var url = "notifications/" + encodeURIComponent(notificationId) + "/status/unread";
    return Doors.RESTFULL.asyncCall(url, "POST", "", "");
};

Doors.API.prototype.notificationsDelete = function (notificationId) {
    var url = "notifications/" + encodeURIComponent(notificationId) + "/status/erase";
    return Doors.RESTFULL.asyncCall(url, "POST", "", "");
};

Doors.API.prototype.notificationsReadAll = function () {
    var url = "notifications/loggeduser/status/readall";
    return Doors.RESTFULL.asyncCall(url, "POST", "", "");
};

Doors.API.prototype.notificationsDeleteAll = function () {
    var url = "notifications/loggeduser/status/eraseall";
    return Doors.RESTFULL.asyncCall(url, "POST", "", "");
};



Doors.API.prototype.notificationsSearch = function (to, status, devicePlatform, deliveryDateFrom, deliveryDateTo, readDateFrom, readDateTo, eraseDateFrom, eraseDateTo) {
    if (!to) {
        to = "";
    }
    if (!status) {
        status = "";
    }
    if (!devicePlatform) {
        devicePlatform = "";
    }
    if (!deliveryDateFrom) {
        deliveryDateFrom = "";
    }
    if (!deliveryDateTo) {
        deliveryDateTo = "";
    }
    if (!readDateFrom) {
        readDateFrom = "";
    }
    if (!readDateTo) {
        readDateTo = "";
    }
    if (!eraseDateFrom) {
        eraseDateFrom = "";
    }
    if (!eraseDateTo) {
        eraseDateTo = "";
    }
    const url =  "notifications?to="+ to + "&status="+ status + "&devicePlatform="+ devicePlatform + "&deliveryDateFrom="+ deliveryDateFrom + "" +
    "&deliveryDateTo="+ deliveryDateTo + "&readDateFrom="+ readDateFrom + "&readDateTo="+ readDateTo + "&eraseDateFrom="+ eraseDateFrom + "&eraseDateTo"+ eraseDateTo + "";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};
;Doors = Doors || {};
Doors.Session = Doors.Session || {};

var _loggedUser;

Doors.Session.init = function () {
    DoorsAPI.loggedUser()
        .then(
            function (obj) {
                _loggedUser = obj;
            },
            function (obj) {
                console.log("Error al cargar el usuario logueado Doors.Session.init");
            }
        );
};

Doors.Session.LoggedUser = function () {
    return _loggedUser;
};
