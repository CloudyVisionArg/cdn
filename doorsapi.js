; //REQUIERE JQuery y Moment.js
Array.prototype.contains = function (v) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].toString().trim().indexOf(v) !== -1 && this[i].toString().trim().length == v.length)
            return true;
    }
    return false;
};

Array.prototype.unique = function () {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i].toString().trim())) {
            arr.push(this[i].toString().trim());
        }
    }
    return arr;
};

//DEFINICION DE LAS FUNCIONES STARTSWITH Y ENDSWITH, PARA MANEJO DE STRINGS
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}
if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return this.slice(-str.length) == str;
    };
}
if (typeof String.prototype.replaceAll != 'function') {
    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    };
}
// Only modify if toLocaleString adds decimal places
if (/\D/.test((1).toLocaleString())) {

    Number.prototype.toLocaleString = (function () {

        // Store built-in toLocaleString
        var _toLocale = Number.prototype.toLocaleString;

        // Work out the decimal separator
        var _sep = /\./.test((1.1).toLocaleString()) ? '.' : ',';

        // Regular expression to trim decimal places
        var re = new RegExp('\\' + _sep + '\\d+$');

        return function () {

            // If number is an integer, call built-in function and trim decimal places
            // if they're added
            if (parseInt(this) == this) {
                return _toLocale.call(this).replace(re, '');
            }

            // Otherwise, just convert to locale
            return _toLocale.call(this);
        };
    }());
}

function toLocaleStringSupportsLocales() {
    var number = 0;
    try {
        number.toLocaleString('i');
    } catch (e) {
        return e.name === 'RangeError';
    }
    return false;
}
if (typeof Number.prototype.toUserLocaleString !== 'function') {
    Number.prototype.toUserLocaleString = function () {
        var dsep = (1 / 2).toString().charAt(1);

        var thousandsep, decimalsep, rexFindThousands, rexFindDecimal;

        thousandsep = (1200).toLocaleString().replace(/\d/g, '').substring(0, 1);
        decimalsep = (1.2).toLocaleString().replace(/\d/g, '').substring(0, 1);

        var englishLocale = decimalsep === "." ? true : false;

        var matchesLocale = (englishLocale && (Gestar.Settings.UserState.LangId == 1033 || Gestar.Settings.UserState.LangId == 2052)) ||
            (!englishLocale && (Gestar.Settings.UserState.LangId == 3082 || Gestar.Settings.UserState.LangId == 2070));

        if (matchesLocale) {
            if (toLocaleStringSupportsLocales()) {
                var locale = Gestar.Tools.getLocaleFromUserLngId(Gestar.Settings.UserState.LangId);
                return this.toLocaleString(locale);
            } else {
                return this.toLocaleString();
            }
        }
        var replaceThoud = "";
        var replaceDec = "";
        if (Gestar.Settings.UserState.LangId == 3082 || Gestar.Settings.UserState.LangId == 2070) {
            replaceThoud = ".";
            replaceDec = ",";
        } else if (Gestar.Settings.UserState.LangId == 1033 || Gestar.Settings.UserState.LangId == 2052) {
            replaceThoud = ",";
            replaceDec = ".";
        }
        /*}
        else {
            return this.toLocaleString();
        }*/

        var numStr = this.toLocaleString();
        numStrSplit = numStr.split(decimalsep);
        var intPart = numStrSplit[0];

        var decPart = "";
        if (numStrSplit.length > 1) {
            decPart = numStrSplit[1];
        } else {
            replaceDec = "";
        }
        return intPart.replace(new RegExp("[\"" + thousandsep + "]", 'g'), replaceThoud) + replaceDec + decPart;
    };
}

if (typeof Date.prototype.toUserLocaleString !== 'function') {
    Date.prototype.toUserLocaleString = function (handleDateAndTime) {

        value = this;
        /*dateString = "";
        var day = value.getDate() < 10 ? "0" + value.getDate() : value.getDate();
        var month = value.getMonth() + 1 < 10 ? "0" + (value.getMonth() + 1) : value.getMonth() + 1;

        if (Gestar.Settings.UserState.LangId == 3082) {
            dateString = day + "/" + month + "/" + value.getFullYear();
        }
        else if (Gestar.Settings.UserState.LangId == 1033) {
            dateString = month + "/" + day + "/" + value.getFullYear();
        }

        var hoursString = ("0" + value.getHours()).slice(-2) + ":" + ("0" + value.getMinutes()).slice(-2) + ":" + ("0" + value.getSeconds()).slice(-2);
        return dateString + " " + hoursString;*/
        var mome = moment(value);
        //var locale = Gestar.Tools.getLocaleFromUserLngId(Gestar.Settings.UserState.LangId);
        //mome.locale(locale);
        var locale = Gestar.Tools.getLocaleFromUserLngId(Gestar.Settings.UserState.LangId);
        moment.updateLocale(locale, {
            longDateFormat: {
                LTS: "HH:mm:ss"
            }
        });

        if (handleDateAndTime) {
            if (value.getFullYear() <= 1900) {
                return mome.format("LTS");
            }
            if (value.getHours() == 0 && value.getMinutes() == 0 && value.getSeconds() == 0) {
                return mome.format("L");
            }
        }
        return mome.format("L") + " " + mome.format("LTS");
    };
}

if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}
if (typeof String.prototype.removeHtml != 'function') {
    String.prototype.removeHtml = function () {
        //Reemplaza los <br> por nuevas lineas y quita el resto del html.
        return this.replace(/<br\s*\/?>/mg, "\n").replace(/<\/?[^>]+(>|$)/g, "");
    };
}
if (typeof String.prototype.encodeHtml != 'function') {
    String.prototype.encodeHtml = function () {
        //create a in-memory div, set it's inner text(which jQuery automatically encodes)
        //then grab the encoded contents back out.  The div never exists on the page.
        return jQuery('<div/>').text(this).html();
    };
}
if (typeof String.prototype.removeWhiteSpaces != 'function') {
    String.prototype.removeWhiteSpaces = function () {
        return this != null ? this.replace(/\s+/g, '') : this;
    };
}
if (typeof String.prototype.capitalize != "function") {
    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
}

function customDateToString() {
    return Gestar.Tools.dateTimeDoors(this.getTime());
}
// Register the new function
//Date.prototype.toString = customDateToString;

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/ ) {
        var len = this.length >>> 0;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ?
            Math.ceil(from) :
            Math.floor(from);
        if (from < 0)
            from += len;
        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}

(function ($) {
    $.fn.hasScrollBar = function () {
        return this.get(0).scrollHeight > this.height();
    };
    $.fn.hasHorizontalScrollBar = function () {
        return this.get(0).scrollWidth > this.width();
    };
})(jQuery);

//Definicion de namespaces
var Gestar = Gestar || {};
window.Gestar = Gestar;

Gestar = Gestar || {};
Gestar.Tools = Gestar.Tools || {};
Gestar.HtmlTools = Gestar.HtmlTools || {};
Gestar.Tools.StringsHelper = Gestar.Tools.StringsHelper || {};
Gestar.ErrorHandling = Gestar.ErrorHandling || {};

(function () {
    this.dp = function (message, obj) {
        try {
            //TODO DebugMode
            if (console != undefined && console.log != undefined) {
                console.log(message, obj);
            }
        } catch (ex) {}
    };
    this.er = function (errMessage, obj) {
        try {
            if (console != undefined && console.error != undefined) {
                console.error(this.dateTimeDoors(new Date()) + " - " + errMessage, obj);
            }
        } catch (ex) {}
    };
    this.Browser = {
        Version: function () {
            var version = 999;
            // we assume a sane browser    
            if (navigator.appVersion.indexOf("MSIE") != -1) {
                // bah, IE again, lets downgrade version number      
                version = parseFloat(navigator.appVersion.split("MSIE")[1]);
            }
            return version;
        },
        isIE: function () {
            ///Checks IE Version, returns -1 if not IE
            var rv = -1;
            if (navigator.appName == 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent;
                var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat(RegExp.$1);
            } else if (navigator.appName == 'Netscape') {
                var usa = navigator.userAgent;
                var reg = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
                if (reg.exec(usa) != null)
                    rv = parseFloat(RegExp.$1);
            }
            return rv;
        }
    };
    this.defer = function (fn, args) {
        setTimeout(function () {
            fn(args);
        }, 0);
    };
    this.inIframe = function () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    };
    this.isNumber = function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
    this.cloneObject = function (obj) {
        var newObject = jQuery.extend(true, {}, obj);
        return newObject;
    };
    this.cloneArray = function (arr) {
        var newArray = jQuery.extend(true, [], arr);
        return newArray;
    };
    this.url = function (relativeUrl) {
        var completePath = "";
        var initialNexus = "";
        var middleNexus = "";
        var locationPath = Gestar.Settings.BaseUrl;

        if (!locationPath.startsWith("/")) {
            initialNexus = "/";
        }
        if (!relativeUrl.startsWith("/")) {
            if (!locationPath.endsWith("/")) {
                middleNexus = "/";
            }
        }
        if (relativeUrl.startsWith("/") && locationPath.endsWith("/")) {
            locationPath = locationPath.substring(0, locationPath.length - 1);
            middleNexus = "";
        }

        completePath = locationPath + middleNexus + relativeUrl;
        return completePath;
    };
    this.xmlToString = function (dom) {
        var ret = null;
        if (dom != null) {
            if (dom.xml == undefined) {
                var serializer = new XMLSerializer();
                ret = serializer.serializeToString(dom);
            } else {
                ret = dom.xml;
            }
        }
        return ret;
    };
    this.stringToXml = function (xmlString) {
        var oDom = null;
        //if (document.implementation.createDocument)
        // -->  Esta era la evaluacion que haciamos antes de IE9, ya que IE9 tiene document.implementation.createDocument
        //		pero no DOMParser y por lo tanto debemos si o si crear un objeto ActiveX para poder efectuar busquedas con XPATH
        //		por lo que ahora evaluamos el metodo document.evaluate que no esta disponible en IE9, IE8 o IE7

        if (document.evaluate) {
            var parser = new DOMParser();
            if (xmlString != '' && xmlString != undefined) {
                oDom = parser.parseFromString(xmlString, "text/xml");
            } else {
                oDom = document.implementation.createDocument("", "", null);
            }
        } else if (window.ActiveXObject || "ActiveXObject" in window) {
            oDom = new ActiveXObject("Microsoft.XMLDOM");
            if (xmlString != "" && xmlString != undefined) {
                oDom.async = "false";
                oDom.loadXML(xmlString);
            }
        }
        if (xmlString == "" || xmlString == undefined) {
            var xmlRoot = oDom.createElement('root');
            oDom.appendChild(xmlRoot);
        }
        return oDom;
    };
    this.getUrlParameterByName = function (name, url) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var results = null;
        if (url !== undefined)
            results = regex.exec(url);
        else
            results = regex.exec(location.search);
        if (results == null) {
            return "";
        } else {
            var ss = results[1].replace(/\+/g, " ");
            try {
                return decodeURIComponent(ss);
            } catch (e) {
                return Gestar.Tools.urlDecodeAdvanced(ss);
            }
        }
    };
    this.urlDecodeAdvanced = function (val) {
        var state = "none"; //setRadio();
        var len = val.length;
        var backlen = len;
        var i = 0;

        var newStr = "";
        var frag = "";
        var encval = "";
        var original = val;

        if (state == "none") // needs to be converted to normal chars
        {
            while (backlen > 0) {
                lastpercent = val.lastIndexOf("%");
                if (lastpercent != -1) // we found a % char. Need to handle
                {
                    // everything *after* the %
                    frag = val.substring(lastpercent + 1, val.length);
                    // re-assign val to everything *before* the %
                    val = val.substring(0, lastpercent);
                    if (frag.length >= 2) // end contains unencoded
                    {
                        //  alert ("frag is greater than or equal to 2");
                        encval = frag.substring(0, 2);
                        newStr = frag.substring(2, frag.length) + newStr;
                        //convert the char here. for now it just doesn't add it.
                        if ("01234567890abcdefABCDEF".indexOf(encval.substring(0, 1)) != -1 &&
                            "01234567890abcdefABCDEF".indexOf(encval.substring(1, 2)) != -1) {
                            encval = String.fromCharCode(parseInt(encval, 16)); // hex to base 10
                            newStr = encval + newStr; // prepend the char in
                        }
                        // if so, convert. Else, ignore it.
                    }
                    // adjust length of the string to be examined
                    backlen = lastpercent;
                    // alert ("backlen at the end of the found % if is: " + backlen);
                } else {
                    newStr = val + newStr;
                    backlen = 0;
                } // if there is no %, just leave the value as-is
            } // end while
        } // end 'state=none' conversion
        else // value needs to be converted to URL encoded chars
        {
            for (i = 0; i < len; i++) {
                if (val.substring(i, i + 1).charCodeAt(0) < 255) // hack to eliminate the rest of unicode from this
                {
                    if (isUnsafe(val.substring(i, i + 1)) == false) {
                        newStr = newStr + val.substring(i, i + 1);
                    } else {
                        newStr = newStr + convert(val.substring(i, i + 1));
                    }
                } else // woopsie! restore.
                {
                    alert("Found a non-ISO-8859-1 character at position: " + (i + 1) + ",\nPlease eliminate before continuing.");
                    document.forms[0].state.value = "none";
                    document.forms[0].enc[0].checked = true; // set back to "no encoding"
                    newStr = original;
                    i = len; // short-circuit the loop and exit
                }
            }

        }
        return newStr;
    };
    this.roundNumber = function (num, dec) {
        var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
        return result;
    };
    this.dateTimeDoors = function (valor) {
        var value;
        value = new Date(valor);
        var day = value.getDate() < 10 ? "0" + value.getDate() : value.getDate();
        var month = value.getMonth() + 1 < 10 ? "0" + (value.getMonth() + 1) : value.getMonth() + 1;
        var hours = value.getHours() < 10 ? "0" + value.getHours() : value.getHours();
        var minutes = value.getMinutes() < 10 ? "0" + value.getMinutes() : value.getMinutes();
        var seconds = value.getSeconds() < 10 ? "0" + value.getSeconds() : value.getSeconds();
        return value.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    };
    this.getDaysInAMonth = function (year, month) {
        return new Date(year, month, 0).getDate();
    };
    this.compareByDescriptionAndName = function (a, b) {
        if (a.Description == null || a.Description == "") {
            if (b.Description == null || b.Description == "") {
                if (a.Name < b.Name)
                    return -1;
                if (a.Name > b.Name)
                    return 1;
                return 0;
            } else {
                if (a.Name < b.Description)
                    return -1;
                if (a.Name > b.Description)
                    return 1;
                return 0;
            }
        } else {
            if (b.Description == null || b.Description == "") {
                if (a.Description < b.Name)
                    return -1;
                if (a.Description > b.Name)
                    return 1;
                return 0;
            } else {
                if (a.Description < b.Description)
                    return -1;
                if (a.Description > b.Description)
                    return 1;
                return 0;
            }
        }
    };
    this.getObjDescription = function (obj) {
        return (obj.Description != null && obj.Description != "" ? obj.Description : obj.Name);
    };
    this.setDocumentValue = function (doc, fieldName, fieldValue) {
        //TODO Computed
        //TODO Updatable
        //TODO TypeValidation
        var found = false;
        for (var o = 0; o < doc.CustomFields.length; o++) {
            var field = doc.CustomFields[o];
            if (field.Name.toLowerCase() == fieldName.toLowerCase()) {
                found = true;
                field.Value = fieldValue;
                field.ValueChanged = true;
                break;
            }
        }
        if (!found) {
            for (var o = 0; o < doc.HeadFields.length; o++) {
                var field = doc.HeadFields[o];
                if (field.Name.toLowerCase() == fieldName.toLowerCase()) {
                    found = true;
                    field.Value = fieldValue;
                    field.ValueChanged = true;
                    break;
                }
            }
        }
    };
    this.getDocumentValue = function (doc, fieldName) {
        var found = false;
        var value = null;
        for (var o = 0; o < doc.CustomFields.length; o++) {
            var field = doc.CustomFields[o];
            if (field.Name.toLowerCase() == fieldName.toLowerCase()) {
                found = true;
                value = field.Value;
                break;
            }
        }
        if (!found) {
            for (var o = 0; o < doc.HeadFields.length; o++) {
                var field = doc.HeadFields[o];
                if (field.Name.toLowerCase() == fieldName.toLowerCase()) {
                    found = true;
                    value = field.Value;
                    break;
                }
            }
        }
        //TODO Langstring
        if (!found) throw "Campo no encontrado";

        return value;
    };
    this.loadScript = function (scriptName, callback) {

        if (!jsArray[scriptName]) {
            var promise = jQuery.Deferred();

            // adding the script tag to the head as suggested before
            var body = document.getElementsByTagName('body')[0],
                script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = scriptName;

            // then bind the event to the callback function
            // there are several events for cross browser compatibility
            script.onload = function () {
                promise.resolve();
            };

            // fire the loading
            body.appendChild(script);

            // clear DOM reference
            //body = null;
            //script = null;

            jsArray[scriptName] = promise.promise();

        } else if (debugState)
            root.root.console.log("This script was already loaded %c: " + scriptName, debugStyle_warning);

        jsArray[scriptName].then(function () {
            if (typeof callback === 'function')
                callback();
        });
    };
    this.printHtmlContent = function (htmlContent, url, title, cssArray) {
        var windowUrl = "about:blank";
        if (url != undefined) {
            windowUrl = url;
        }
        var uniqueName = new Date();
        var windowName = 'Print' + uniqueName.getTime();
        if (title != undefined) {
            windowName = title;
            if (Gestar.Tools.Browser.Version() <= 9) {
                windowName = windowName.removeWhiteSpaces();
            }
        }
        var printWindow = window.open(windowUrl, windowName, 'left=200,top=200,width=800,height=600');

        printWindow.document.write('<html>\n');
        printWindow.document.write('<head>\n');
        if (cssArray != undefined && cssArray != null) {
            if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {

            } else {

                for (var d = 0; d < cssArray.length; d++) {
                    printWindow.document.write('<link href="' + cssArray[d] + '" rel="Stylesheet" type="text/css" />\n');
                }

            }
        }
        printWindow.document.write('<script type="text/javascript">\n');
        if (cssArray != undefined && cssArray != null) {
            if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
                for (var k = 0; k < cssArray.length; k++) {
                    printWindow.document.write('var chromeCss' + k + ' = document.createElement("link");\n');
                    printWindow.document.write('chromeCss' + k + '.rel = "stylesheet";\n');
                    printWindow.document.write('chromeCss' + k + '.href = "' + cssArray[k] + '";\n');
                    printWindow.document.write('document.getElementsByTagName("head")[0].appendChild(chromeCss' + k + ');\n');
                }
            }
        }

        printWindow.document.write('function winPrint()\n');
        printWindow.document.write('{\n');
        printWindow.document.write('window.focus();\n');

        if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
            printWindow.document.write('printChrome();\n');
        } else {
            printWindow.document.write('window.print();\n');
        }

        if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
            printWindow.document.write('window.close();\n');
        } else {
            printWindow.document.write('chkstate();\n');
        }
        printWindow.document.write('}\n');
        printWindow.document.write('function chkstate()\n');
        printWindow.document.write('{\n');
        printWindow.document.write('if(document.readyState=="complete")');
        printWindow.document.write('{\n');
        printWindow.document.write('window.close();\n');
        printWindow.document.write('}\n');
        printWindow.document.write('else{\n');
        printWindow.document.write('setTimeout("chkstate();",3000);\n');
        printWindow.document.write('}\n');
        printWindow.document.write('}\n');
        printWindow.document.write('function printChrome()\n');
        printWindow.document.write('{\n');
        printWindow.document.write('if(document.readyState=="complete")');
        printWindow.document.write('{\n');
        printWindow.document.write('window.print();\n');
        printWindow.document.write('}\n');
        printWindow.document.write('else{\n');
        printWindow.document.write('setTimeout("printChrome();",3000);\n');
        printWindow.document.write('}\n');
        printWindow.document.write('}\n');
        printWindow.document.write('</scr');
        printWindow.document.write('ipt>');
        printWindow.document.write('<style>body{-webkit-print-color-adjust: exact;}</style>');
        printWindow.document.write('</head>');
        printWindow.document.write('<body onload="winPrint()" >');
        printWindow.document.write(htmlContent);
        printWindow.document.write('</body>');
        printWindow.document.write('</html>');
        printWindow.document.close();
    };
    this.getFolderIcon = function (iconName) {
        switch (iconName) {
            case "accept":
                return "check-circle";
            case "activity":
                return "thumb-tack";
            case "add":
                return "plus-circle";
            case "anchor":
                return "anchor";
            case "application-add":
                return "plus-square";
            case "application-cascade":
                return "folder-o";
            case "application-delete":
                return "minus-square";
            case "application-double":
                return "folder-o";
            case "application-edit":
                return "desktop";
            case "application-error":
                return "desktop";
            case "application-form-add":
                return "desktop";
            case "application-form-delete":
                return "desktop";
            case "application-form-edit":
                return "desktop";
            case "application-form-magnify":
                return "desktop";
            case "application-form":
                return "desktop";
            case "application-get":
                return "desktop";
            case "application-go":
                return "desktop";
            case "application-home":
                return "desktop";
            case "application-key":
                return "desktop";
            case "application-lightning":
                return "desktop";
            case "application-link":
                return "desktop";
            case "application-osx-terminal":
                return "terminal";
            case "application-osx":
                return "apple";
            case "application-put":
                return "desktop";
            case "application-side-boxes":
                return "desktop";
            case "application-side-contract":
                return "desktop";
            case "application-side-expand":
                return "desktop";
            case "application-side-list":
                return "desktop";
            case "application-side-tree":
                return "desktop";
            case "application-split":
                return "desktop";
            case "application-tile-horizontal":
                return "desktop";
            case "application-tile-vertical":
                return "desktop";
            case "application-view-columns":
                return "desktop";
            case "application-view-detail":
                return "desktop";
            case "application-view-gallery":
                return "desktop";
            case "application-view-icons":
                return "desktop";
            case "application-view-list":
                return "desktop";
            case "application-view-tile":
                return "desktop";
            case "application-xp-terminal":
                return "terminal";
            case "application-xp":
                return "desktop";
            case "application":
                return "desktop";
            case "arrow-branch":
                return "folder-o";
            case "arrow-divide":
                return "folder-o";
            case "arrow-down":
                return "arrow-down";
            case "arrow-inout":
                return "folder-o";
            case "arrow-in":
                return "folder-o";
            case "arrow-join":
                return "folder-o";
            case "arrow-left":
                return "arrow-left";
            case "arrow-merge":
                return "folder-o";
            case "arrow-out":
                return "arrows-alt";
            case "arrow-redo":
                return "repeat";
            case "arrow-refresh-small":
                return "refresh";
            case "arrow-refresh":
                return "refresh";
            case "arrow-right":
                return "arrow-right";
            case "arrow-rotate-anticlockwise":
                return "folder-o";
            case "arrow-rotate-clockwise":
                return "folder-o";
            case "arrow-switch":
                return "folder-o";
            case "arrow-turn-left":
                return "folder-o";
            case "arrow-turn-right":
                return "folder-o";
            case "arrow-undo":
                return "undo";
            case "arrow-up":
                return "arrow-up";
            case "asterisk-orange":
                return "asterisk";
            case "asterisk-yellow":
                return "asterisk";
            case "attach":
                return "paperclip";
            case "award-star-add":
                return "star";
            case "award-star-bronze-1":
                return "star bronze";
            case "award-star-bronze-2":
                return "star bronze";
            case "award-star-bronze-3":
                return "star bronze";
            case "award-star-delete":
                return "star red";
            case "award-star-gold-1":
                return "star gold";
            case "award-star-gold-2":
                return "star gold";
            case "award-star-gold-3":
                return "star gold";
            case "award-star-silver-1":
                return "star silver";
            case "award-star-silver-2":
                return "star silver";
            case "award-star-silver-3":
                return "star silver";
            case "basket-add":
                return "cart-plus";
            case "basket-delete":
                return "cart";
            case "basket-edit":
                return "cart";
            case "basket-error":
                return "cart";
            case "basket-go":
                return "cart";
            case "basket-put":
                return "cart";
            case "basket-remove":
                return "cart-arrow-down";
            case "basket":
                return "folder-o";
            case "bell-add":
                return "bell";
            case "bell-delete":
                return "bell-slash";
            case "bell-error":
                return "bell";
            case "bell-go":
                return "bell";
            case "bell-link":
                return "bell";
            case "bell":
                return "bell";
            case "bin-closed":
                return "trash";
            case "bin-empty":
                return "trash";
            case "bin":
                return "trash";
            case "bomb":
                return "bomb";
            case "book-addresses":
                return "users";
            case "book-add":
                return "bookkey";
            case "book-delete":
                return "book";
            case "book-edit":
                return "book";
            case "book-error":
                return "book";
            case "book-go":
                return "book";
            case "book-key":
                return "book";
            case "book-link":
                return "book";
            case "book-next":
                return "book";
            case "book-open":
                return "book";
            case "book-previous":
                return "book";
            case "book":
                return "book";
            case "box":
                return "archive";
            case "brick-add":
                return "folder-o";
            case "brick-delete":
                return "folder-o";
            case "brick-edit":
                return "folder-o";
            case "brick-error":
                return "folder-o";
            case "brick-go":
                return "folder-o";
            case "brick-link":
                return "folder-o";
            case "bricks":
                return "folder-o";
            case "brick":
                return "folder-o";
            case "briefcase":
                return "briefcase";
            case "bug-add":
                return "bug";
            case "bug-delete":
                return "bug";
            case "bug-edit":
                return "bug";
            case "bug-error":
                return "bug";
            case "bug-go":
                return "bug";
            case "bug-link":
                return "bug";
            case "bug":
                return "bug";
            case "building-add":
                return "building";
            case "building-delete":
                return "building";
            case "building-edit":
                return "building";
            case "building-error":
                return "building";
            case "building-go":
                return "building";
            case "building-key":
                return "building";
            case "building-link":
                return "building";
            case "building":
                return "building";
            case "bullet-add":
                return "plus-circle";
            case "bullet-arrow-bottom":
                return "folder-o";
            case "bullet-arrow-down":
                return "caret-down";
            case "bullet-arrow-top":
                return "folder-o";
            case "bullet-arrow-up":
                return "caret-up";
            case "bullet-black":
                return "squarecircle";
            case "bullet-blue":
                return "dot-circle-o blue";
            case "bullet-delete":
                return "minus-circle red";
            case "bullet-disk":
                return "folder-o";
            case "bullet-error":
                return "folder-o";
            case "bullet-feed":
                return "folder-o";
            case "bullet-go":
                return "folder-o";
            case "bullet-green":
                return "dot-circle-o green";
            case "bullet-key":
                return "folder-o";
            case "bullet-orange":
                return "dot-circle-o orange";
            case "bullet-picture":
                return "folder-o";
            case "bullet-pink":
                return "dot-circle-o pink";
            case "bullet-purple":
                return "dot-circle-o purple";
            case "bullet-red":
                return "dot-circle-o red";
            case "bullet-star":
                return "star-o";
            case "bullet-toggle-minus":
                return "minus-square";
            case "bullet-toggle-plus":
                return "plus-square";
            case "bullet-white":
                return "dot-circle-o";
            case "bullet-wrench":
                return "dot-circle-o";
            case "bullet-yellow":
                return "dot-circle-o yellow";
            case "cake":
                return "birthday-cake";
            case "calculator-add":
                return "calculator";
            case "calculator-delete":
                return "calculator";
            case "calculator-edit":
                return "calculator";
            case "calculator-error":
                return "calculator";
            case "calculator-link":
                return "calculator";
            case "calculator":
                return "calculator";
            case "calendar-add":
                return "calendar";
            case "calendar-delete":
                return "calendar";
            case "calendar-edit":
                return "calendar";
            case "calendar-link":
                return "calendar";
            case "calendar-view-day":
                return "calendar";
            case "calendar-view-month":
                return "calendar";
            case "calendar-view-week":
                return "calendar";
            case "calendar":
                return "calendar";
            case "camera-add":
                return "camera";
            case "camera-delete":
                return "camera-retro";
            case "camera-edit":
                return "camera-retro";
            case "camera-error":
                return "camera-retro";
            case "camera-go":
                return "camera-retro";
            case "camera-link":
                return "camera-retro";
            case "camera-small":
                return "camera-retro";
            case "camera":
                return "camera-retro";
            case "cancel":
                return "times-circle";
            case "car-add":
                return "car";
            case "car-delete":
                return "car";
            case "cart-add":
                return "cart-plus";
            case "cart-delete":
                return "shopping-cart";
            case "cart-edit":
                return "shopping-cart";
            case "cart-error":
                return "shopping-cart";
            case "cart-go":
                return "shopping-cart";
            case "cart-put":
                return "cart-arrow-down";
            case "cart-remove":
                return "shopping-cart";
            case "cart":
                return "shopping-cart";
            case "car":
                return "car";
            case "cd-add":
                return "no hay";
            case "cd-burn":
                return "no hay";
            case "cd-delete":
                return "no hay";
            case "cd-edit":
                return "no hay";
            case "cd-eject":
                return "no hay";
            case "cd-go":
                return "no hay";
            case "cd":
                return "no hay";
            case "chart-bar-add":
                return "bar-chart";
            case "chart-bar-delete":
                return "bar-chart";
            case "chart-bar-edit":
                return "bar-chart";
            case "chart-bar-error":
                return "bar-chart";
            case "chart-bar-link":
                return "bar-chart";
            case "chart-bar":
                return "bar-chart";
            case "chart-curve-add":
                return "area-chart";
            case "chart-curve-delete":
                return "area-chart";
            case "chart-curve-edit":
                return "area-chart";
            case "chart-curve-error":
                return "area-chart";
            case "chart-curve-go":
                return "area-chart";
            case "chart-curve-link":
                return "area-chart";
            case "chart-curve":
                return "area-chart";
            case "chart-line-add":
                return "line-chart";
            case "chart-line-delete":
                return "line-chart";
            case "chart-line-edit":
                return "line-chart";
            case "chart-line-error":
                return "line-chart";
            case "chart-line-link":
                return "line-chart";
            case "chart-line":
                return "line-chart";
            case "chart-organisation-add":
                return "site-map";
            case "chart-organisation-delete":
                return "site-map";
            case "chart-organisation":
                return "site-map";
            case "chart-pie-add":
                return "pie-chart";
            case "chart-pie-delete":
                return "pie-chart";
            case "chart-pie-edit":
                return "pie-chart";
            case "chart-pie-error":
                return "pie-chart";
            case "chart-pie-link":
                return "pie-chart";
            case "chart-pie":
                return "pie-chart";
            case "chpass":
                return "key";
            case "clock-add":
                return "clock-o";
            case "clock-delete":
                return "clock-o";
            case "clock-edit":
                return "clock-o";
            case "clock-error":
                return "clock-o";
            case "clock-go":
                return "clock-o";
            case "clock-link":
                return "clock-o";
            case "clock-pause":
                return "clock-o";
            case "clock-play":
                return "clock-o";
            case "clock-red":
                return "clock-o";
            case "clock-stop":
                return "clock-o";
            case "clock":
                return "clock-o";
            case "cog-add":
                return "cog";
            case "cog-delete":
                return "cog";
            case "cog-edit":
                return "cog";
            case "cog-error":
                return "cog";
            case "cog-go":
                return "cog";
            case "cog":
                return "cog";
            case "coins-add":
                return "Ver para que se usa?";
            case "coins-delete":
                return "Ver para que se usa?";
            case "coins":
                return "Ver para que se usa?";
            case "color-swatch":
                return "no hay";
            case "color-wheel":
                return "bullseye";
            case "comment-add":
                return "comment";
            case "comment-delete":
                return "comment";
            case "comment-edit":
                return "comment";
            case "comments-add":
                return "comments";
            case "comments-delete":
                return "comments";
            case "comments":
                return "comments";
            case "comment":
                return "comment";
            case "compress":
                return "compress";
            case "computer-add":
                return "laptop";
            case "computer-delete":
                return "laptop";
            case "computer-edit":
                return "laptop";
            case "computer-error":
                return "laptop";
            case "computer-go":
                return "laptop";
            case "computer-key":
                return "laptop";
            case "computer-link":
                return "laptop";
            case "computer":
                return "laptop";
            case "connect":
                return "link";
            case "contact":
                return "users";
            case "contrast-decrease":
                return "adjust";
            case "contrast-high":
                return "adjust";
            case "contrast-increase":
                return "adjust";
            case "contrast-low":
                return "adjust";
            case "contrast":
                return "adjust";
            case "control-eject-blue":
                return "eject blue";
            case "control-eject":
                return "eject";
            case "control-end-blue":
                return "step-forward";
            case "control-end":
                return "step-forward";
            case "control-equalizer-blue":
                return "folder-o";
            case "control-equalizer":
                return "folder-o";
            case "control-fastforward-blue":
                return "forward";
            case "control-fastforward":
                return "forward";
            case "control-pause-blue":
                return "pause";
            case "control-pause":
                return "pause";
            case "control-play-blue":
                return "play";
            case "control-play":
                return "play";
            case "control-repeat-blue":
                return "repeat";
            case "control-repeat":
                return "repeat";
            case "control-rewind-blue":
                return "backward";
            case "control-rewind":
                return "backward";
            case "control-start-blue":
                return "step-backward";
            case "control-start":
                return "step-backward";
            case "control-stop-blue":
                return "stop";
            case "control-stop":
                return "stop";
            case "controller-add":
                return "gamepad";
            case "controller-delete":
                return "gamepad";
            case "controller-error":
                return "gamepad";
            case "controller":
                return "gamepad";
            case "controlpanel":
                return "tachometer";
            case "creditcards":
                return "credit-card";
            case "cross":
                return "times";
            case "css-add":
                return "css3";
            case "css-delete":
                return "css3";
            case "css-go":
                return "css3";
            case "css-valid":
                return "css3";
            case "css":
                return "css3";
            case "ctrpanel":
                return "tachometer";
            case "cup-add":
                return "coffee";
            case "cup-delete":
                return "coffee";
            case "cup-edit":
                return "coffee";
            case "cup-error":
                return "coffee";
            case "cup-go":
                return "coffee";
            case "cup-key":
                return "coffee";
            case "cup-link":
                return "coffee";
            case "cup":
                return "coffee";
            case "cursor":
                return "hand-o-up";
            case "cut-red":
                return "scissors";
            case "cut":
                return "scissors";
            case "database-add":
                return "database";
            case "database-connect":
                return "database";
            case "database-delete":
                return "database";
            case "database-edit":
                return "database";
            case "database-error":
                return "database";
            case "database-gear":
                return "database";
            case "database-go":
                return "database";
            case "database-key":
                return "database";
            case "database-lightning":
                return "database";
            case "database-link":
                return "database";
            case "database-refresh":
                return "database";
            case "database-save":
                return "database";
            case "database-table":
                return "database";
            case "database":
                return "database";
            case "date-add":
                return "calendar-o";
            case "date-delete":
                return "calendar-o";
            case "date-edit":
                return "calendar-o";
            case "date-error":
                return "calendar-o";
            case "date-go":
                return "calendar-o";
            case "date-link":
                return "calendar-o";
            case "date-magnify":
                return "calendar-o";
            case "date-next":
                return "calendar-o";
            case "date-previous":
                return "calendar-o";
            case "date":
                return "calendar-o";
            case "deck":
                return "folder-o";
            case "default":
                return "folder-o";
            case "delete":
                return "minus-circle";
            case "disconnect":
                return "chain-broken";
            case "disk-multiple":
                return "floppy-o";
            case "disk":
                return "floppy-o";
            case "dms":
                return "files-o";
            case "documentblack":
                return "folder";
            case "document":
                return "file-o";
            case "door-in":
                return "folder-o";
            case "door-open":
                return "folder-o";
            case "door-out":
                return "folder-o";
            case "door":
                return "folder-o";
            case "drink-empty":
                return "glass";
            case "drink":
                return "glass";
            case "drive-add":
                return "hdd-o";
            case "drive-burn":
                return "hdd-o";
            case "drive-cd-empty":
                return "hdd-o";
            case "drive-cd":
                return "hdd-o";
            case "drive-delete":
                return "hdd-o";
            case "drive-disk":
                return "hdd-o";
            case "drive-edit":
                return "hdd-o";
            case "drive-error":
                return "hdd-o";
            case "drive-go":
                return "hdd-o";
            case "drive-key":
                return "hdd-o";
            case "drive-link":
                return "hdd-o";
            case "drive-magnify":
                return "hdd-o";
            case "drive-network":
                return "hdd-o";
            case "drive-rename":
                return "hdd-o";
            case "drive-user":
                return "hdd-o";
            case "drive-web":
                return "hdd-o";
            case "drive":
                return "hdd-o";
            case "dvd-add":
                return "folder-o";
            case "dvd-delete":
                return "folder-o";
            case "dvd-edit":
                return "folder-o";
            case "dvd-error":
                return "folder-o";
            case "dvd-go":
                return "folder-o";
            case "dvd-key":
                return "folder-o";
            case "dvd-link":
                return "folder-o";
            case "dvd":
                return "folder-o";
            case "email-add":
                return "envelope";
            case "email-attach":
                return "envelope";
            case "email-delete":
                return "envelope";
            case "email-edit":
                return "envelope";
            case "email-error":
                return "envelope";
            case "email-go":
                return "envelope";
            case "email-link":
                return "envelope";
            case "email-link_open":
                return "envelope";
            case "email-open-image":
                return "envelope";
            case "email-open":
                return "envelope";
            case "email":
                return "envelope";
            case "emoticon-evilgrin":
                return "folder-o";
            case "emoticon-grin":
                return "folder-o";
            case "emoticon-happy":
                return "folder-o";
            case "emoticon-smile":
                return "smile-o";
            case "emoticon-surprised":
                return "folder-o";
            case "emoticon-tongue":
                return "folder-o";
            case "emoticon-unhappy":
                return "frown-o";
            case "emoticon-waii":
                return "folder-o";
            case "emoticon-wink":
                return "folder-o";
            case "error-add":
                return "exclamation-triangle";
            case "error-delete":
                return "exclamation-triangle";
            case "error-go":
                return "exclamation-triangle";
            case "error":
                return "exclamation-triangle";
            case "exclamation":
                return "exclamation-circle red";
            case "eye":
                return "eye";
            case "feed-add":
                return "rss-square";
            case "feed-delete":
                return "rss-square";
            case "feed-disk":
                return "rss-square";
            case "feed-edit":
                return "rss-square";
            case "feed-error":
                return "rss-square";
            case "feed-go":
                return "rss-square";
            case "feed-key":
                return "rss-square";
            case "feed-link":
                return "rss-square";
            case "feed-magnify":
                return "rss-square";
            case "feed":
                return "rss-square";
            case "female":
                return "venus";
            case "film-add":
                return "film";
            case "film-delete":
                return "film";
            case "film-edit":
                return "film";
            case "film-error":
                return "film";
            case "film-key":
                return "film";
            case "film-link":
                return "film";
            case "film-save":
                return "film";
            case "film":
                return "film";
            case "find":
                return "binoculars";
            case "flag-blue":
                return "flag";
            case "flag-green":
                return "flag";
            case "flag-orange":
                return "flag";
            case "flag-pink":
                return "flag";
            case "flag-purple":
                return "flag";
            case "flag-red":
                return "flag";
            case "flag-yellow":
                return "flag";
            case "folder-add":
                return "folder";
            case "folder-bell":
                return "folder";
            case "folder-brick":
                return "folder";
            case "folder-bug":
                return "folder";
            case "folder-camera":
                return "folder";
            case "folder-database":
                return "folder";
            case "folder-delete":
                return "folder";
            case "folder-edit":
                return "folder";
            case "folder-error":
                return "folder";
            case "folder-explore":
                return "folder";
            case "folder-feed":
                return "folder";
            case "folder-find":
                return "folder";
            case "folder-go":
                return "folder";
            case "folder-heart":
                return "folder";
            case "folder-image":
                return "folder";
            case "folder-key":
                return "folder";
            case "folder-lightbulb":
                return "folder";
            case "folder-link":
                return "folder";
            case "folder-magnify":
                return "folder";
            case "folder-page-white":
                return "folder";
            case "folder-page":
                return "folder";
            case "folder-palette":
                return "folder";
            case "folder-picture":
                return "folder";
            case "folder-star":
                return "folder";
            case "folder-table":
                return "folder";
            case "folder-user":
                return "folder";
            case "folder-wrench":
                return "folder";
            case "folder":
                return "folder";
            case "font-add":
                return "font";
            case "font-delete":
                return "font";
            case "font-go":
                return "font";
            case "font":
                return "font";
            case "formal":
                return "folder-o";
            case "group-add":
                return "users";
            case "group-delete":
                return "users";
            case "group-edit":
                return "users";
            case "group-error":
                return "users";
            case "group-gear":
                return "users";
            case "group-go":
                return "users";
            case "group-key":
                return "users";
            case "group-link":
                return "users";
            case "group":
                return "users";
            case "heart-add":
                return "heart";
            case "heart-delete":
                return "heart";
            case "heart":
                return "heart";
            case "help":
                return "question-circle";
            case "hourglass-add":
                return "folder-o";
            case "hourglass-delete":
                return "folder-o";
            case "hourglass-go":
                return "folder-o";
            case "hourglass-link":
                return "folder-o";
            case "hourglass":
                return "folder-o";
            case "house-go":
                return "home";
            case "house-link":
                return "home";
            case "house":
                return "home";
            case "html-add":
                return "html5";
            case "html-delete":
                return "html5";
            case "html-go":
                return "html5";
            case "html-valid":
                return "html5";
            case "html":
                return "html5";
            case "image-add":
                return "picture-o";
            case "image-delete":
                return "picture-o";
            case "image-edit":
                return "picture-o";
            case "image-link":
                return "picture-o";
            case "images":
                return "picture-o";
            case "image":
                return "picture-o";
            case "information":
                return "info-circle";
            case "ipod-cast-add":
                return "headphones";
            case "ipod-cast-delete":
                return "headphones";
            case "ipod-cast":
                return "headphones";
            case "ipod-sound":
                return "headphones";
            case "ipod-sound_open":
                return "headphones";
            case "ipod":
                return "headphones";
            case "joystick-add":
                return "gamepad";
            case "joystick-delete":
                return "gamepad";
            case "joystick-error":
                return "gamepad";
            case "joystick":
                return "gamepad";
            case "key-add":
                return "key";
            case "key-delete":
                return "key";
            case "key-go":
                return "key";
            case "keyboard-add":
                return "keyboard-o";
            case "keyboard-delete":
                return "keyboard-o";
            case "keyboard-magnify":
                return "keyboard-o";
            case "keyboard":
                return "keyboard-o";
            case "key":
                return "key";
            case "layers":
                return "folder-o";
            case "layout-add":
                return "file-text?";
            case "layout-content":
                return "file-text?";
            case "layout-delete":
                return "file-text?";
            case "layout-edit":
                return "file-text?";
            case "layout-error":
                return "file-text?";
            case "layout-header":
                return "file-text?";
            case "layout-link":
                return "file-text?";
            case "layout-sidebar":
                return "file-text?";
            case "layout":
                return "file-text?";
            case "license":
                return "certificate";
            case "license_open":
                return "certificate";
            case "lightbulb-add":
                return "certificate";
            case "lightbulb-delete":
                return "lightbulb-o";
            case "lightbulb-off":
                return "lightbulb-o";
            case "lightbulb":
                return "lightbulb-o";
            case "lightning-add":
                return "bolt";
            case "lightning-delete":
                return "bolt";
            case "lightning-go":
                return "bolt";
            case "lightning":
                return "bolt";
            case "link-add":
                return "link";
            case "link-break":
                return "link";
            case "link-delete":
                return "link";
            case "link-edit":
                return "link";
            case "link-error":
                return "link";
            case "link-go":
                return "link";
            case "link":
                return "link";
            case "lock-add":
                return "lock";
            case "lock-break":
                return "unlock-alt";
            case "lock-delete":
                return "lock";
            case "lock-edit":
                return "lock";
            case "lock-go":
                return "lock";
            case "lock-open":
                return "unlock";
            case "lock":
                return "lock";
            case "lorry-add":
                return "truck";
            case "lorry-delete":
                return "truck";
            case "lorry-error":
                return "truck";
            case "lorry-flatbed":
                return "truck";
            case "lorry-go":
                return "truck";
            case "lorry-link":
                return "truck";
            case "lorry":
                return "truck";
            case "magifier-zoom-out":
                return "search-minus";
            case "magnifier-zoom-in":
                return "search-plus";
            case "magnifier":
                return "search";
            case "male":
                return "mars";
            case "map-add":
                return "globe";
            case "map-delete":
                return "globe";
            case "map-edit":
                return "globe";
            case "map-go":
                return "globe";
            case "map-magnify":
                return "globe";
            case "map":
                return "globe";
            case "medal-bronze-1":
                return "certificate bronze";
            case "medal-bronze-2":
                return "certificate bronze";
            case "medal-bronze-3":
                return "certificate bronze";
            case "medal-bronze-add":
                return "certificate bronze";
            case "medal-bronze-delete":
                return "certificate bronze";
            case "medal-gold-1":
                return "certificate gold";
            case "medal-gold-2":
                return "certificate gold";
            case "medal-gold-3":
                return "certificate gold";
            case "medal-gold-add":
                return "certificate gold";
            case "medal-gold-delete":
                return "certificate gold";
            case "medal-silver-1":
                return "certificate silver";
            case "medal-silver-2":
                return "certificate silver";
            case "medal-silver-3":
                return "certificate silver";
            case "medal-silver-add":
                return "certificate silver";
            case "medal-silver-delete":
                return "certificate silver";
            case "money-add":
                return "money";
            case "money-delete":
                return "money";
            case "money-dollar":
                return "usd";
            case "money-euro":
                return "eur";
            case "money-pound":
                return "gbp";
            case "money-yen":
                return "yen";
            case "money":
                return "money green";
            case "monitor-add":
                return "desktop";
            case "monitor-delete":
                return "desktop";
            case "monitor-edit":
                return "desktop";
            case "monitor-error":
                return "desktop";
            case "monitor-go":
                return "desktop";
            case "monitor-lightning":
                return "desktop";
            case "monitor-link":
                return "desktop";
            case "monitor":
                return "desktop";
            case "mouse-add":
                return "folder-o";
            case "mouse-delete":
                return "folder-o";
            case "mouse-error":
                return "folder-o";
            case "mouse":
                return "folder-o";
            case "music":
                return "music";
            case "newspaper-add":
                return "newspaper-o";
            case "newspaper-delete":
                return "newspaper-o";
            case "newspaper-go":
                return "newspaper-o";
            case "newspaper-link":
                return "newspaper-o";
            case "newspaper":
                return "newspaper-o";
            case "new":
                return "?";
            case "note-add":
                return "?";
            case "note-delete":
                return "?";
            case "note-edit":
                return "pencil-square-o";
            case "note-error":
                return "?";
            case "note-go":
                return "file?";
            case "note":
                return "file";
            case "opportunity":
                return "folder-o";
            case "overlays":
                return "folder-o";
            case "package-add":
                return "archive";
            case "package-delete":
                return "archive";
            case "package-go":
                return "archive";
            case "package-green":
                return "archive green";
            case "package-link":
                return "archive";
            case "package":
                return "archive";
            case "page-add":
                return "file-o";
            case "page-attach":
                return "paperclip";
            case "page-code":
                return "file-code-o";
            case "page-copy":
                return "files-o";
            case "page-delete":
                return "file-o";
            case "page-edit":
                return "file-o";
            case "page-error":
                return "file-o";
            case "page-excel":
                return "file-excel-o";
            case "page-find":
                return "file-o";
            case "page-gear":
                return "file-o";
            case "page-go":
                return "file-o";
            case "page-green":
                return "file-o";
            case "page-key":
                return "file-o";
            case "page-lightning":
                return "file-o";
            case "page-link":
                return "file-o";
            case "page-paintbrush":
                return "file-o";
            case "page-paste":
                return "clipboard";
            case "page-red":
                return "file-o";
            case "page-refresh":
                return "file-o";
            case "page-save":
                return "floppy-o";
            case "page-white-acrobat":
                return "file-pdf-o";
            case "page-white-actionscript":
                return "file-code-o";
            case "page-white-add":
                return "folder-o";
            case "page-white-camera":
                return "file-video-o";
            case "page-white-cd":
                return "folder-o";
            case "page-white-code-red":
                return "file-code-o red";
            case "page-white-code":
                return "file-code-o blue";
            case "page-white-coldfusion":
                return "folder-o";
            case "page-white-compressed":
                return "file-archive-o";
            case "page-white-copy":
                return "folder-o";
            case "page-white-cplusplus":
                return "file-code-o";
            case "page-white-csharp":
                return "file-code-o";
            case "page-white-cup":
                return "folder-o";
            case "page-white-c":
                return "file-code-o";
            case "page-white-database":
                return "folder-o";
            case "page-white-delete":
                return "folder-o";
            case "page-white-dvd":
                return "folder-o";
            case "page-white-edit":
                return "folder-o";
            case "page-white-error":
                return "folder-o";
            case "page-white-excel":
                return "file-excel-o";
            case "page-white-find":
                return "folder-o";
            case "page-white-flash":
                return "folder-o";
            case "page-white-freehand":
                return "folder-o";
            case "page-white-gear":
                return "folder-o";
            case "page-white-get":
                return "folder-o";
            case "page-white-go":
                return "folder-o";
            case "page-white-horizontal":
                return "folder-o";
            case "page-white-h":
                return "folder-o";
            case "page-white-key":
                return "folder-o";
            case "page-white-lightning":
                return "folder-o";
            case "page-white-link":
                return "folder-o";
            case "page-white-magnify":
                return "folder-o";
            case "page-white-medal":
                return "folder-o";
            case "page-white-office":
                return "folder-o";
            case "page-white-paintbrush":
                return "folder-o";
            case "page-white-paint":
                return "folder-o";
            case "page-white-paste":
                return "clipboard";
            case "page-white-php":
                return "file-code-o";
            case "page-white-picture":
                return "file-image-o";
            case "page-white-powerpoint":
                return "file-powerpoint-o";
            case "page-white-put":
                return "folder-o";
            case "page-white-ruby":
                return "folder-o";
            case "page-white-stack":
                return "folder-o";
            case "page-white-star":
                return "folder-o";
            case "page-white-swoosh":
                return "folder-o";
            case "page-white-text-width":
                return "folder-o";
            case "page-white-text":
                return "folder-o";
            case "page-white-tux":
                return "folder-o";
            case "page-white-vector":
                return "folder-o";
            case "page-white-visualstudio":
                return "file-code-o";
            case "page-white-width":
                return "folder-o";
            case "page-white-word":
                return "file-word-o";
            case "page-white-world":
                return "folder-o";
            case "page-white-wrench":
                return "folder-o";
            case "page-white-zip":
                return "file-archive-o";
            case "page-white":
                return "file";
            case "page-word":
                return "file-word-o";
            case "page-world":
                return "folder-o";
            case "page":
                return "folder-o";
            case "paintbrush":
                return "paint-brush";
            case "paintcan":
                return "folder-o";
            case "palette":
                return "paint-brush";
            case "paste-plain":
                return "clipboard";
            case "paste-word":
                return "clipboard";
            case "pencil-add":
                return "pencil";
            case "pencil-delete":
                return "pencil";
            case "pencil-go":
                return "pencil";
            case "pencil":
                return "pencil";
            case "people":
                return "users";
            case "phone-add":
                return "phone-square";
            case "phone-delete":
                return "phone-square";
            case "phone-sound":
                return "phone-square";
            case "phone":
                return "phone-square";
            case "photo-add":
                return "picture-o";
            case "photo-delete":
                return "picture-o";
            case "photo-link":
                return "picture-o";
            case "photos":
                return "picture-o";
            case "photo":
                return "picture-o";
            case "picture-add":
                return "file-image-o";
            case "picture-delete":
                return "file-image-o";
            case "picture-edit":
                return "file-image-o";
            case "picture-empty":
                return "file-image-o";
            case "picture-error":
                return "file-image-o";
            case "picture-go":
                return "file-image-o";
            case "picture-key":
                return "file-image-o";
            case "picture-link":
                return "file-image-o";
            case "picture-save":
                return "file-image-o";
            case "pictures":
                return "file-image-o";
            case "picture":
                return "file-image-o";
            case "pilcrow":
                return "paragraph";
            case "pill-add":
                return "medkit";
            case "pill-delete":
                return "medkit";
            case "pill-go":
                return "medkit";
            case "pill":
                return "medkit";
            case "plugin-add":
                return "puzzle-piece";
            case "plugin-delete":
                return "puzzle-piece";
            case "plugin-disabled":
                return "puzzle-piece";
            case "plugin-edit":
                return "puzzle-piece";
            case "plugin-error":
                return "puzzle-piece";
            case "plugin-go":
                return "puzzle-piece";
            case "plugin-link":
                return "puzzle-piece";
            case "plugin":
                return "puzzle-piece";
            case "printer-add":
                return "print";
            case "printer-delete":
                return "print";
            case "printer-empty":
                return "print";
            case "printer-error":
                return "print";
            case "printer":
                return "print";
            case "rainbow":
                return "folder-o";
            case "report-add":
                return "list-alt";
            case "report-delete":
                return "list-alt";
            case "report-disk":
                return "list-alt";
            case "report-edit":
                return "list-alt";
            case "report-go":
                return "list-alt";
            case "report-key":
                return "list-alt";
            case "report-link":
                return "list-alt";
            case "report-magnify":
                return "list-alt";
            case "report-picture":
                return "list-alt";
            case "report-user":
                return "list-alt";
            case "report-word":
                return "list-alt";
            case "report":
                return "list-alt";
            case "resultset-first":
                return "step-backward";
            case "resultset-last":
                return "step-forward";
            case "resultset-next":
                return "chevron-circle-right";
            case "resultset-previous":
                return "chevron-circle-left";
            case "rosette":
                return "certificate";
            case "rss-add":
                return "rss";
            case "rss-delete":
                return "rss";
            case "rss-go":
                return "rss";
            case "rss-valid":
                return "rss";
            case "rss":
                return "rss";
            case "ruby-add":
                return "diamond red";
            case "ruby-delete":
                return "diamond red";
            case "ruby-gear":
                return "diamond red";
            case "ruby-get":
                return "diamond red";
            case "ruby-go":
                return "diamond red";
            case "ruby-key":
                return "diamond red";
            case "ruby-link":
                return "diamond red";
            case "ruby-put":
                return "diamond red";
            case "ruby":
                return "diamond red";
            case "sales":
                return "envelope";
            case "script-add":
                return "file-code-o";
            case "script-code-red":
                return "file-code-o";
            case "script-code":
                return "file-code-o";
            case "script-delete":
                return "file-code-o";
            case "script-edit":
                return "file-code-o";
            case "script-error":
                return "file-code-o";
            case "script-gear":
                return "file-code-o";
            case "script-go":
                return "file-code-o";
            case "script-key":
                return "file-code-o";
            case "script-lightning":
                return "file-code-o";
            case "script-link":
                return "file-code-o";
            case "script-palette":
                return "file-code-o";
            case "script-save":
                return "file-code-o";
            case "script":
                return "file-code-o";
            case "server-add":
                return "server";
            case "server-chart":
                return "server";
            case "server-compressed":
                return "server";
            case "server-connect":
                return "server";
            case "server-database":
                return "server";
            case "server-delete":
                return "server";
            case "server-edit":
                return "server";
            case "server-error":
                return "server";
            case "server-go":
                return "server";
            case "server-key":
                return "server";
            case "server-lightning":
                return "server";
            case "server-link":
                return "server";
            case "server-uncompressed":
                return "server";
            case "server":
                return "server";
            case "service":
                return "cogs";
            case "shading":
                return "folder-o";
            case "shape-align-bottom":
                return "folder-o";
            case "shape-align-center":
                return "align-center";
            case "shape-align-left":
                return "align-left";
            case "shape-align-middle":
                return "folder-o";
            case "shape-align-right":
                return "align-right";
            case "shape-align-top":
                return "folder-o";
            case "shape-flip-horizontal":
                return "folder-o";
            case "shape-flip-vertical":
                return "folder-o";
            case "shape-group":
                return "folder-o";
            case "shape-handles":
                return "folder-o";
            case "shape-move-backwards":
                return "folder-o";
            case "shape-move-back":
                return "folder-o";
            case "shape-move-forwards":
                return "folder-o";
            case "shape-move-front":
                return "folder-o";
            case "shape-rotate-anticlockwise":
                return "repeat";
            case "shape-rotate-clockwise":
                return "undo";
            case "shape-square-add":
                return "folder-o";
            case "shape-square-delete":
                return "folder-o";
            case "shape-square-edit":
                return "folder-o";
            case "shape-square-error":
                return "folder-o";
            case "shape-square-go":
                return "folder-o";
            case "shape-square-key":
                return "folder-o";
            case "shape-square-link":
                return "folder-o";
            case "shape-square":
                return "square";
            case "shape-ungroup":
                return "folder-o";
            case "sharedfolder":
                return "folder-open";
            case "shield-add":
                return "shield";
            case "shield-delete":
                return "shield";
            case "shield-go":
                return "shield";
            case "shield":
                return "shield";
            case "shutdown":
                return "power-off red";
            case "sitemap-color":
                return "sitemap";
            case "sitemap":
                return "sitemap";
            case "sound-add":
                return "volume-up";
            case "sound-delete":
                return "volume-down";
            case "sound-low":
                return "volume-down";
            case "sound-mute":
                return "volume-off";
            case "sound-none":
                return "volume-off";
            case "sound":
                return "volume-off";
            case "spellcheck":
                return "folder-o";
            case "sport-8ball":
                return "folder-o";
            case "sport-basketball":
                return "dribbble";
            case "sport-football":
                return "futbol-o";
            case "sport-golf":
                return "folder-o";
            case "sport-raquet":
                return "folder-o";
            case "sport-shuttlecock":
                return "folder-o";
            case "sport-soccer":
                return "futbol-o";
            case "sport-tennis":
                return "folder-o";
            case "star":
                return "star";
            case "status-away":
                return "folder-o";
            case "status-busy":
                return "user red";
            case "status-offline":
                return "user gray";
            case "status-online":
                return "user green";
            case "stop":
                return "times-circle";
            case "style-add":
                return "font";
            case "style-delete":
                return "font";
            case "style-edit":
                return "font";
            case "style-go":
                return "font";
            case "style":
                return "font";
            case "sum":
                return "folder-o";
            case "systemasyncevent":
                return "clock-o";
            case "systemconnections":
                return "link";
            case "systemcustomfolder":
                return "folder";
            case "systemforms":
                return "list-alt";
            case "systemsettingsmanager":
                return "wrench";
            case "tab-add":
                return "folder-o";
            case "tab-delete":
                return "folder-o";
            case "tab-edit":
                return "folder-o";
            case "tab-go":
                return "folder-o";
            case "table-add":
                return "table";
            case "table-delete":
                return "table";
            case "table-edit":
                return "table";
            case "table-error":
                return "table";
            case "table-gear":
                return "table";
            case "table-go":
                return "table";
            case "table-key":
                return "table";
            case "table-lightning":
                return "table";
            case "table-link":
                return "table";
            case "table-multiple":
                return "table";
            case "table-refresh":
                return "table";
            case "table-relationship":
                return "table";
            case "table-row-delete":
                return "table";
            case "table-row-insert":
                return "table";
            case "table-save":
                return "table";
            case "table-sort":
                return "table";
            case "table":
                return "table";
            case "tab":
                return "tag";
            case "tag-blue-add":
                return "tag blue";
            case "tag-blue-delete":
                return "tag blue";
            case "tag-blue-edit":
                return "tag blue";
            case "tag-blue":
                return "tag blue";
            case "tag-green":
                return "tag green";
            case "tag-orange":
                return "tag orange";
            case "tag-pink":
                return "tag pink";
            case "tag-purple":
                return "tag purple";
            case "tag-red":
                return "tag red";
            case "tag-yellow":
                return "tag yellow";
            case "tag":
                return "tag";
            case "task":
                return "pencil-square-o";
            case "telephone-add":
                return "phone";
            case "telephone-delete":
                return "phone";
            case "telephone-edit":
                return "phone";
            case "telephone-error":
                return "phone";
            case "telephone-go":
                return "phone";
            case "telephone-key":
                return "phone";
            case "telephone-link":
                return "phone";
            case "telephone":
                return "phone";
            case "television-add":
                return "desktop";
            case "television-delete":
                return "desktop";
            case "television":
                return "desktop";
            case "text-align-center":
                return "align-center";
            case "text-align-justify":
                return "align-justify";
            case "text-align-left":
                return "align-left";
            case "text-align-right":
                return "align-right";
            case "text-allcaps":
                return "folder-o";
            case "text-bold":
                return "bold";
            case "text-columns":
                return "columns";
            case "text-dropcaps":
                return "folder-o";
            case "text-heading-1":
                return "folder-o";
            case "text-heading-2":
                return "folder-o";
            case "text-heading-3":
                return "folder-o";
            case "text-heading-4":
                return "folder-o";
            case "text-heading-5":
                return "folder-o";
            case "text-heading-6":
                return "folder-o";
            case "text-horizontalrule":
                return "folder-o";
            case "text-indent-remove":
                return "outdent";
            case "text-indent":
                return "indent";
            case "text-italic":
                return "italic";
            case "text-kerning":
                return "folder-o";
            case "text-letter-omega":
                return "folder-o";
            case "text-letterspacing":
                return "text-width";
            case "text-linespacing":
                return "text-height";
            case "text-list-bullets":
                return "list";
            case "text-list-numbers":
                return "list-ol";
            case "text-lowercase":
                return "folder-o";
            case "text-padding-bottom":
                return "folder-o";
            case "text-padding-left":
                return "folder-o";
            case "text-padding-right":
                return "folder-o";
            case "text-padding-top":
                return "folder-o";
            case "text-replace":
                return "folder-o";
            case "text-signature":
                return "pencil-square";
            case "text-smallcaps":
                return "folder-o";
            case "text-strikethrough":
                return "strikethrough";
            case "text-subscript":
                return "subscript";
            case "text-superscript":
                return "superscript";
            case "text-underline":
                return "underline";
            case "text-uppercase":
                return "folder-o";
            case "textfield-add":
                return "folder-o";
            case "textfield-delete":
                return "folder-o";
            case "textfield-key":
                return "folder-o";
            case "textfield-rename":
                return "folder-o";
            case "textfield":
                return "folder-o";
            case "textfield_open":
                return "folder-o";
            case "thumb-down":
                return "thumbs-down";
            case "thumb-up":
                return "thumbs-up";
            case "tick":
                return "check";
            case "time-add":
                return "clock-o";
            case "time-delete":
                return "clock-o";
            case "time-go":
                return "clock-o";
            case "timeline-marker":
                return "folder-o";
            case "time":
                return "clock-o";
            case "transmit-add":
                return "wifi";
            case "transmit-blue":
                return "wifi";
            case "transmit-delete":
                return "wifi";
            case "transmit-edit":
                return "wifi";
            case "transmit-error":
                return "wifi";
            case "transmit-go":
                return "wifi";
            case "transmit":
                return "wifi";
            case "tux":
                return "linux";
            case "user-add":
                return "user-plus";
            case "user-comment":
                return "comment";
            case "user-delete":
                return "user-times";
            case "user-edit":
                return "user";
            case "user-female":
                return "female";
            case "user-go":
                return "user";
            case "user-gray":
                return "user";
            case "user-green":
                return "user";
            case "user-orange":
                return "user";
            case "user-red":
                return "user";
            case "user-suit":
                return "user";
            case "user":
                return "user";
            case "vcard-add":
                return "folder-o";
            case "vcard-delete":
                return "folder-o";
            case "vcard-edit":
                return "folder-o";
            case "vcard":
                return "folder-o";
            case "vector-add":
                return "folder-o";
            case "vector-delete":
                return "folder-o";
            case "vector":
                return "folder-o";
            case "virtualfolder":
                return "external-link???";
            case "wand":
                return "magic";
            case "weather-clouds":
                return "cloud";
            case "weather-cloudy":
                return "cloud";
            case "weather-lightning":
                return "bolt";
            case "weather-rain":
                return "tint blue";
            case "weather-snow":
                return "folder-o";
            case "weather-sun":
                return "sun-o";
            case "webcam-add":
                return "video-camera";
            case "webcam-delete":
                return "video-camera";
            case "webcam-error":
                return "video-camera";
            case "webcam":
                return "video-camera";
            case "world-add":
                return "globe";
            case "world-delete":
                return "globe";
            case "world-edit":
                return "globe";
            case "world-go":
                return "globe";
            case "world-link":
                return "globe";
            case "world":
                return "globe";
            case "wrench-orange":
                return "wrench";
            case "wrench":
                return "wrench";
            case "xhtml-add":
                return "code";
            case "xhtml-delete":
                return "code";
            case "xhtml-go":
                return "code";
            case "xhtml-valid":
                return "code";
            case "xhtml":
                return "code";
            case "zoom-in":
                return "search-plus";
            case "zoom-out":
                return "search-minus";
            case "zoom":
                return "search";
            default:
                return "folder-o";
        }
    };
    this.getFormattedValueString = function (format, value) {
        switch (format) {
            case "currency": {
                if (!this.isNumber(value)) {
                    return "";
                }
                var n = value,
                    c = 2, //isNaN(c = Math.abs(c)) ? 2 : c,
                    d = ",", //d == undefined ? "." : d,
                    t = ".", //t == undefined ? "," : t,
                    s = n < 0 ? "-" : "",
                    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
                    j = (j = i.length) > 3 ? j % 3 : 0;
                return s + "$ " + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
                //return "$ " + this.roundNumber(value, 2).toFixed(2).toLocaleString();
            }
            break;
        case "numeric": {
            if (!this.isNumber(value)) {
                return "";
            }
            return this.roundNumber(value, 2).toLocaleString();
        }
        break;
        case "percentage": {
            if (!this.isNumber(value)) {
                return "";
            }
            return this.roundNumber(value, 2).toLocaleString() + "%";
        }
        break;
        case "date": {
            if (value == null || value == "") return "";
            var day = value.getDate() < 10 ? "0" + value.getDate() : value.getDate();
            var month = value.getMonth() + 1 < 10 ? "0" + (value.getMonth() + 1) : value.getMonth() + 1;
            var dateString = day + "/" + month + "/" + value.getFullYear();
            return dateString;
        }
        break;
        case "dateinverted": {
            if (value == null || value == "") return "";
            var day = value.getDate() < 10 ? "0" + value.getDate() : value.getDate();
            var month = value.getMonth() + 1 < 10 ? "0" + (value.getMonth() + 1) : value.getMonth() + 1;
            var dateString = value.getFullYear() + "/" + month + "/" + day;
            return dateString;
        }
        break;
        case "monthyear": {
            if (value == null || value == "") return "";
            var month = value.getMonth() + 1 < 10 ? "0" + (value.getMonth() + 1) : value.getMonth() + 1;
            var dateString = month + "/" + value.getFullYear();
            return dateString;
        }
        break;
        case "monthyeardash": {
            if (value == null || value == "") return "";
            var month = value.getMonth() + 1 < 10 ? "0" + (value.getMonth() + 1) : value.getMonth() + 1;
            var dateString = month + "-" + value.getFullYear();
            return dateString;
        }
        break;
        case "yearmonth": {
            if (value == null || value == "") return "";
            var month = value.getMonth() + 1 < 10 ? "0" + (value.getMonth() + 1) : value.getMonth() + 1;
            var dateString = value.getFullYear() + "/" + month;
            return dateString;
        }
        break;
        case "yearmonthdash": {
            if (value == null || value == "") return "";
            var month = value.getMonth() + 1 < 10 ? "0" + (value.getMonth() + 1) : value.getMonth() + 1;
            var dateString = value.getFullYear() + "-" + month;
            return dateString;
        }
        break;
        case "year": {
            if (value == null || value == "") return "";
            var dateString = value.getFullYear();
            return dateString;
        }
        break;
        case "timeonly": {
            if (value == null || value == "") return "";
            var hoursString = ("0" + value.getHours()).slice(-2) + ":" + ("0" + value.getMinutes()).slice(-2) + ":" + ("0" + value.getSeconds()).slice(-2);
            return hoursString;
        }
        break;
        default: {
            return value;
        }
        }

    };
    //Obtiene el locale en base a la configuracion de idioma del usuario.
    //Por el momento 4 soportados, sino toma automaticamente es
    this.getLocaleFromUserLngId = function (lngId) {
        switch (lngId) {
            case 3082:
                return "es";
            case 2052:
                return "zh-cn";
            case 1033:
                return "en";
            case 2070:
                return "pt-br";
            default:
                return "es";
        }
    };
    this.getJqueryLocaleFromUserLngId = function (lngId) {
        switch (lngId) {
            case 3082:
                return "es";
            case 2052:
                return "zh-TW";
            case 1033:
                return "en";
            case 2070:
                return "pt-BR";
            default:
                return "es";
        }
    };
    this.setCookie = function (cname, cvalue, hours) {
        var d = new Date();
        d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }
    this.getCookie = function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }
}).apply(Gestar.Tools);

(function () {
    this.getSelectOptions = function (objectArray, valuePropery, textProperty, selectedValue, textFormat) {
        var html = "";
        for (var i = 0; i < objectArray.length; i++) {
            var item = objectArray[i];
            var value = "";
            var text = "";
            if (item.hasOwnProperty(valuePropery)) {
                value = item[valuePropery];
            } else {
                Gestar.Tools.dp("Object doesn't have the value property: " + valuePropery + ". Gestar.HtmlTools.getSelectOptions.");
            }
            if (Object.prototype.toString.call(textProperty) == "[object String]") {
                if (item.hasOwnProperty(textProperty)) {
                    text = item[textProperty];
                } else {
                    Gestar.Tools.dp("Object doesn't have the text property: " + valuePropery + ". Gestar.HtmlTools.getSelectOptions.");
                }
            } else if (Object.prototype.toString.call(textProperty) == "[object Array]") {
                if (textFormat) {
                    var formatResult = textFormat;
                    var text = formatResult
                    for (var u = 0; u < textProperty.length; u++) {
                        var prop = textProperty[u];
                        text = text.replaceAll("{" + u + "}", item[prop]);
                    }
                }
            }
            var selectedText = "";
            if (selectedValue && selectedValue != null) {
                if (selectedValue.toString().toLowerCase() == value.toLowerCase()) {
                    selectedText = " selected=\"selected\" ";
                }
            }
            html += "<option value=\"" + value + "\" " + selectedText + ">" + text + "</option>";
        }
        return html;
    };
}).apply(Gestar.HtmlTools);

(function () {
    this.ExceptionObject = function () {
        this.Type = Gestar.REST.ResponseResultEnum.Exception;
        this.Message = "";
        this.DoorsExceptionType = "";
        this.Method = "";
    };
    this.handleSessionExpired = function () {
        //top.location = Gestar.Tools.url("/auth/login");
        jQuery(document).trigger("session_expired");
    };
    this.handledServiceError = function () {};
    this.unhandledServiceError = function (exObj) {
        alert("Metodo: " + exObj.Method + " Mensaje: " + exObj.Message);
    };
    this.displayHandledError = function (exObj) {
        //TODO Hacer algo relativamente presentable
        alert("Error: " + exObj.Message);
    };
}).apply(Gestar.ErrorHandling);

(function () {
    //Funcion que busca todos los elementos con el attributo [lang-str] y [lang-str-tt](para tooltips) 
    //y le da el valor del respectivo langstring que tenga como valor ese atributo
    this.fillLangstrings = function () {
        resolveLangStrings(jQuery("[lang-str]"));
        resolveToolTips(jQuery("[lang-str-tt]"));
        resolvePlaceholders(jQuery("[lang-str-ph]"));
    };
    //Funcion que procesa los langstring de un elemento con el attributo [lang-str] y [lang-str-tt](para tooltips) 
    //y le da el valor del respectivo langstring que tenga como valor ese atributo
    this.processLangStrings = function (element) {
        var ele = element.find("[lang-str]");
        resolveLangStrings(ele);
        var eme = element.find("[lang-str-tt]");
        resolveToolTips(eme);
        var epe = element.find("[lang-str-ph]");
        resolvePlaceholders(epe);
    };
    //Funcion que procesa los langstring de una x cantidad de elementos con el attributo [lang-str] 
    //y le da el valor del respectivo langstring que tenga como valor ese atributo
    var resolveLangStrings = function (elements) {
        jQuery.each(elements, function (index, elem) {
            var langStringId = jQuery(elem).attr("lang-str");
            var result = Gestar.Tools.StringsHelper.getLangstring(langStringId);
            try {
                if (jQuery(elem).is("input[type=button]") || jQuery(elem).is("input[type=submit]")) {
                    jQuery(elem).val(result);
                } else {
                    jQuery(elem).text(result);
                }
            } catch (ex) {}
        });
    };
    //Funcion que procesa los langstring de una x cantidad de elementos con el attributo [lang-str-tt](para tooltips) 
    //y le da el valor al tooltip del respectivo langstring que tenga como valor ese atributo
    var resolveToolTips = function (tooltipElements) {
        jQuery.each(tooltipElements, function (index, ttElem) {
            var langStringId = jQuery(ttElem).attr("lang-str-tt");
            var result = Gestar.Tools.StringsHelper.getLangstring(langStringId);
            try {
                jQuery(ttElem).attr("title", result);
            } catch (ex) {}
        });
    };

    var resolvePlaceholders = function (placeHolderElements) {
        jQuery.each(placeHolderElements, function (index, ttElem) {
            var langStringId = jQuery(ttElem).attr("lang-str-ph");
            var result = Gestar.Tools.StringsHelper.getLangstring(langStringId);
            try {
                jQuery(ttElem).attr("placeholder", result);
            } catch (ex) {}
        });
    };

    //Funcion que obtiene un string de la base de datos master. Sirve para obtener strings sin estar logueado
    this.getMasterLangstring = function (stringId, success) {
        var stringValue = "";
        Gestar.REST.asyncCall("GetMasterLangString", "GET", "stringId=" + stringId, "", success);
        return stringValue;
    };
    //Funcion que obtiene strings por el id de la base instancia
    this.getLangstring = function (stringId) {
        var stringValue = "[String not found: " + stringId + "]";
        //var start = new Date().getTime();
        if (window.userLangStrings != undefined && window.userLangStrings != null) {
            if (window.userLangStrings[stringId]) {
                stringValue = window.userLangStrings[stringId];
            }
            /*var string = jQuery.grep(window.userLangStrings, function (sysString) { return sysString.StrId == stringId; });
            //var end = new Date().getTime();
            //var span = end - start;
            if (string.length > 0) {
                return string[0].String;
            }*/
        }
        return stringValue;
    };
}).apply(Gestar.Tools.StringsHelper);

Gestar.View = Gestar.View || {};
Gestar.View.DataProviderBase = function () {
    this.View = null;
    this.ViewId = -1;
    this.getData = function (groupValues, success, error) {};
    this.getParameter = function (groupValues) {};
    this.isGroupResult = function (result) {
        var propertyCount = 0;
        for (var prop in result[0]) {
            if (result[0].hasOwnProperty(prop)) {
                propertyCount++;
            }
        }
        if (propertyCount == 2 && result[0].hasOwnProperty("TOTAL"))
            return true;
        return false;
    };
};
Gestar.View.ViewDataProvider = function (view, filter) {
    this.Parent = Gestar.View.DataProviderBase;
    this.Parent();
    this.View = view;
    this.ViewId = view != null ? view.VieId : -1;
    this.Filter = filter || "";
    this.ErrFunct = function (exObj) {
        alert("Error al buscar. Por favor envie este error al administrador de sistema. Detalle: " + exObj.Message);
    };
    this.getData = function (groupValues, success, error, groupToSearch) {
        var searchParameters = this.getParameter(groupValues, groupToSearch);

        var err = error != undefined ? error : this.ErrFunct;
        return Gestar.REST.asyncCall("ViewSearch", "POST", searchParameters, "viewSearchParam", success, err, true);
    };

    this.getParameter = function (groupValues, groupToSearch) {
        var searchParameters = null;
        if (this.View.Type == Gestar.REST.Model.ViewTypeEnum.DataView) {
            searchParameters = new Gestar.REST.Model.DataViewSearchFilter();
        } else {
            searchParameters = new Gestar.REST.Model.ChartViewSearchFilter();
        }
        searchParameters.Formula = this.Filter;
        searchParameters.FolderId = this.View.FldId;
        searchParameters.ViewId = this.View.VieId;

        searchParameters.MaxDescValueLength = Gestar.Settings.MaxDescriptionLength;
        /*for (var f = 0; f < this.View.Definition.Fields.Items.length; f++) {
            var fiel = this.View.Definition.Fields.Items[f];
            if (fiel.MaxLength && fiel.MaxLength > searchParameters.MaxDescValueLength) {
                searchParameters.MaxDescValueLength = fiel.MaxLength;
            }
        }*/

        if (groupValues != null) {
            //Array of groups
            for (var i = 0; i < groupValues.length; i++) {
                if (groupValues[i] == "null") {
                    groupValues[i] = null;
                }
            }
            if (this.View.Type == Gestar.REST.Model.ViewTypeEnum.DataView) {
                searchParameters.GroupValues = groupValues;
            } else {
                searchParameters.Groups = groupValues;
            }
        }
        var inherited = [];
        var own = [];
        if (this.View.StyleScriptDefinition.InheritedFields && this.View.StyleScriptDefinition.InheritedFields.length > 0) {
            inherited = this.View.StyleScriptDefinition.InheritedFields;
        }
        if (this.View.StyleScriptDefinition.Fields && this.View.StyleScriptDefinition.Fields.length > 0) {
            own = this.View.StyleScriptDefinition.Fields;
        }

        var styleFields = inherited.concat(own).unique();
        searchParameters.AdditionalFields = styleFields;
        searchParameters.GroupToSearch = groupToSearch || "";
        return searchParameters;
    };
    this.isGroupResult = function (result) {
        var propertyCount = 0;
        for (var prop in result[0]) {
            if (result[0].hasOwnProperty(prop)) {
                propertyCount++;
            }
        }
        if (propertyCount == 2 && result[0].hasOwnProperty("TOTAL"))
            return true;
        return false;
    };
};
Gestar.View.FolderDataProvider = function (view, filter) {
    this.Parent = Gestar.View.DataProviderBase;
    this.Parent();
    this.View = view;
    this.ViewId = view != null ? view.VieId : -1;
    this.Filters = filter || "";
    this.Groups = view.Definition.Groups ? view.Definition.Groups.Items : [];
    this.ErrFunct = function (exObj) {
        alert("Error al buscar. Por favor envie este error al administrador de sistema. Detalle: " + exObj.Message);
    };
    this.getData = function (groupValues, success, error) {
        var methodName = "FolderSearchByGroupsNewObj";
        if (groupValues != null && groupValues.length == this.Groups.length) {
            methodName = "FolderSearchNewObj";
        }
        var paramName = "folderSearchParam";
        var err = error != undefined ? error : this.ErrFunct;
        var folderParams = this.getParameter(groupValues);
        return Gestar.REST.asyncCall(methodName, "POST", folderParams, paramName, success, err, true);
    };
    this.getParameter = function (groupValues) {
        var searchParam = new Gestar.REST.Model.FolderSearchParam();
        searchParam.FldId = this.View.FldId;
        var fields = "";
        var groups = [];
        var totals = "";
        var filters = "";
        var orders = "";
        /*if (groupValues.length < this.Groups.length) {
            searchParam.Groups = this.Groups[groupValues.length];
            if(typeof searchParam.Groups == "object") {
                searchParam.Groups = this.Groups[groupValues.length].field;
                searchParam.GroupsOrder = this.Groups[groupValues.length].order;
            }
        }*/
        //Lleno los campos
        var addDocId = true;
        var addFrmId = true;
        var addFldId = true;
        searchParam.MaxDescriptionLenght = 150;
        for (var d = 0; d < this.View.Definition.Fields.Items.length; d++) {
            var fItem = this.View.Definition.Fields.Items[d];
            var nex = ",";
            if (d == 0) nex = "";
            if (fItem.Field.toLowerCase() == "doc_id") {
                addDocId = false;
            }
            if (fItem.Field.toLowerCase() == "frm_id") {
                addFrmId = false;
            }
            if (fItem.Field.toLowerCase() == "fld_id") {
                addFldId = false;
            }
            fields += nex + fItem.Field;


            if (fItem.MaxLength && fItem.MaxLength > searchParam.MaxDescriptionLenght) {
                searchParam.MaxDescriptionLenght = fItem.MaxLength;
            }
        }
        var extraFields = "";
        extraFields += addDocId ? ",doc_id" : "";
        extraFields += addFrmId ? ",frm_id" : "";
        extraFields += addFldId ? ",fld_id" : "";
        searchParam.Fields = fields + extraFields;


        //LLENO LOS TOTALES
        totals = "SUM(1) as TOTAL";
        if (this.View.Definition.Groups.STotals != null && this.View.Definition.Groups.STotals != "") {
            totals = "SUM(" + this.View.Definition.Groups.STotals + ") as TOTAL";
        }
        searchParam.Totals = totals;

        var formula = this.View.Definition.Formula != null ? this.View.Definition.Formula : "";
        if (this.Filters != "") {
            var nexo = "";
            if (formula != "") {
                nexo = " AND ";
            }
            filters = formula + nexo + this.Filters;
        } else {
            filters = formula;
        }

        if (groupValues.length == this.Groups.length) {
            for (var l = 0; l < this.View.Definition.Orders.Items.length; l++) {
                var orderItem = this.View.Definition.Orders.Items[l];
                var order = orderItem.Direction == 1 ? "DESC" : "ASC";
                var nexu = ",";
                if (l == 0) nexu = "";
                orders += nexu + orderItem.Field + " " + order + " ";
            }
        } else {
            var currentGroup = null;
            currentGroup = this.View.Definition.Groups.Items[groupValues.length];
            searchParam.Groups = currentGroup.Field;
            if (currentGroup.OrderBy == 0) {
                searchParam.GroupsOrder = currentGroup.Direction == 1 ? "DESC" : "ASC";
            } else {
                searchParam.TotalsOrder = currentGroup.Direction == 1 ? "DESC" : "ASC";;
            }
            orders = currentGroup.Field + " " + (currentGroup.Direction == 1 ? "DESC" : "ASC");
        }
        var addToFilter = "";
        for (var i = 0; i < groupValues.length; i++) {
            var nexus = " AND ";
            if (addToFilter == "") {
                nexus = "";
            }
            var gValue = groupValues[i];
            var operand = " = ";
            if (gValue != null) {
                if (!isNumber(gValue)) {
                    if (Object.prototype.toString.call(gValue) == "[object Date]") {
                        gValue = "@DATECONVERT('" + Gestar.Tools.dateTimeDoors(gValue.getTime()) + "')";
                    } else {
                        gValue = "'" + gValue + "'";
                    }
                }
            } else {
                operand = " IS NULL ";
                gValue = "";
            }

            addToFilter += nexus + this.View.Definition.Groups.Items[i].Field + operand + gValue;
        }


        if (filters != "" && addToFilter != "") {
            addToFilter = " AND " + addToFilter;
        }
        searchParam.Formula = filters + addToFilter;

        searchParam.Order = orders;
        searchParam.MaxDocs = this.View.Definition.MaxDocs || 200;
        searchParam.Recursive = false;


        return searchParam;
    };
};
Gestar.View.CountMultiplesValuesProvider = function (view, filter, splitKey) {
    this.Parent = DataProviderBase;
    this.Parent();
    this.View = view;
    this.Filter = filter || "";
    this.SplitKey = splitKey || ",";
    this.ErrFunct = function (exObj) {
        alert("Error al buscar. Por favor envie este error al administrador de sistema. Detalle: " + exObj.message);
    };
    this.getData = function (groupValues, success, error) {
        var searchParameters = this.getParameter(groupValues);
        var successFn = success;
        var self = this;
        var err = error != undefined ? error : this.ErrFunct;
        return Gestar.REST.asyncCall("ViewSearch", "POST", searchParameters, "viewSearchParam", function (result) {
            debugger;
            if (result.length <= 0) {
                successFn(processedResult);
                return;
            }

            //var firstRow = result[0];
            processedResult = [];
            //var fields = self.Fields.split(",");
            var viewGroup = self.View.Definition.Groups.Items[0];

            var key = Object.keys(result[0])[0];
            for (var i = 0; i < result.length; i++) {
                var fieldValue = result[i][key];
                var fieldTotal = result[i]["TOTAL"];
                if (fieldValue != null) {
                    var arrValues = fieldValue.split(self.SplitKey);
                    arrValues.forEach(function (item) {
                        if (processedResult.length == 0) { //Primer elemento, lo cargo con el total
                            eval('var obj = { "' + key + '": "' + item + '", "TOTAL": ' + fieldTotal + ' }');
                            //processedResult.push({ key: item, "TOTAL": fieldTotal });
                            processedResult.push(obj);
                        } else {
                            var encontro = false;
                            for (var k = 0; k < processedResult.length; k++) { //Busco si ya esta cargado, si esta: Le sumo el total, si no esta: Lo agrego con el total
                                var currentValue = processedResult[k][key];
                                encontro = false;
                                if (currentValue == item) { //Encuentra el campo, lo busca en el array, le suma la cantidad y sale del for
                                    var currentTotal = processedResult[k]["TOTAL"];
                                    var total = currentTotal + fieldTotal;
                                    eval('var currObj = { "' + key + '": "' + item + '", "TOTAL": ' + total + ' }');
                                    processedResult[k] = currObj;
                                    encontro = true;
                                    break;
                                }
                            }
                            if (!encontro) { //No encuentra el campo, lo agrego al array con el total
                                eval('var currObj = { "' + key + '": "' + item + '", "TOTAL": ' + fieldTotal + ' }');
                                processedResult.push(currObj);
                            }
                        }
                    });
                } else {
                    var item = "(ninguno)";
                    eval('var obj = { "' + key + '": "' + item + '", "TOTAL": ' + fieldTotal + ' }');
                    processedResult.push(obj);
                }
            }

            /*

            for (var p = 0, len = fields.length; p < len; p++) {

                for (var u = 0; u < self.Form.Fields.length; u++) {
                    if (fields[p].toUpperCase() == self.Form.Fields[u].Name.toUpperCase()) {
                        eval('var obj = { "' + viewGroup.Field + '": self.Form.Fields[u].Description, TOTAL: 0 }');
                        processedResult.push(obj);
                    }
                }
            }
            //{ DEPORTE:"Golf", TOTAL:0}
            for (var y = 0, leng = result.length; y < leng; y++) {
                for (var r = 0, le = fields.length; r < le; r++) {
                    var fieldName = fields[r];
                    if (result[y][fieldName] == 1) {
                        processedResult[r].TOTAL += 1;
                    }
                }
            }*/
            //Orden por totales
            if (viewGroup.OrderBy == 1) {

                var compFn = function compare(a, b) {
                    if (a.TOTAL < b.TOTAL)
                        return -1;
                    if (a.TOTAL > b.TOTAL)
                        return 1;
                    return 0;
                };
                //Descendente
                if (viewGroup.Direction == 1) {
                    compFn = function compare(a, b) {
                        if (a.TOTAL > b.TOTAL)
                            return -1;
                        if (a.TOTAL < b.TOTAL)
                            return 1;
                        return 0;
                    };
                }
                processedResult.sort(compFn);
            }

            successFn(processedResult);
        }, err, true);
    }
    this.getParameter = function (groupValues) {
        var searchParameters = null;
        if (this.View.Type == Gestar.REST.Model.ViewTypeEnum.DataView) {
            searchParameters = new Gestar.REST.Model.DataViewSearchFilter();
        } else {
            searchParameters = new Gestar.REST.Model.ChartViewSearchFilter();
        }
        searchParameters.Formula = this.Filter;
        searchParameters.FolderId = this.View.FldId;
        searchParameters.ViewId = this.View.VieId;
        //TODO Get From view fields? Get From settings??
        searchParameters.MaxDescValueLength = 150;
        if (groupValues != null) {
            //Array of groups
            for (var i = 0; i < groupValues.length; i++) {
                if (groupValues[i] == "null") {
                    groupValues[i] = null;
                }
            }
            if (this.View.Type == Gestar.REST.Model.ViewTypeEnum.DataView) {
                searchParameters.GroupValues = groupValues;
            } else {
                searchParameters.Groups = groupValues;
            }
        }
        if (this.View.StyleScriptDefinition.Fields.length > 0) {
            /*var additionalFields = "";
            for (var i = 0; i < this.View.StyleScriptDefinition.Fields.length; i++) {
                additionalFields += "," + this.View.StyleScriptDefinition.Fields[i];
            }*/
            searchParameters.AdditionalFields = this.View.StyleScriptDefinition.Fields;
        }
        return searchParameters;
    };
    this.isGroupResult = function (result) {
        var propertyCount = 0;
        for (var prop in result[0]) {
            if (result[0].hasOwnProperty(prop)) {
                propertyCount++;
            }
        }
        if (propertyCount == 2 && result[0].hasOwnProperty("TOTAL"))
            return true;
        return false;
    };
};

Gestar.DataProviderBase = function () {
    this.View = null;
    this.ViewId = -1;
    this.getData = function (groupValues, success, error) {};
    this.getParameter = function (groupValues) {};
    this.isGroupResult = function (result) {
        var propertyCount = 0;
        for (var prop in result[0]) {
            propertyCount++;
        }
        if (propertyCount == 2 && result[0].hasOwnProperty("TOTAL"))
            return true;
        return false;
    };
};
Gestar.FolderDataProvider = function (fldId, fieldsArr, groups, totals, filters, orders, maxDocs, maxDescrLength) {
    this.Parent = Gestar.DataProviderBase;
    this.Parent();
    this.FldId = fldId;
    this.Fields = fieldsArr;
    this.Groups = groups;
    this.Totals = totals;
    this.Filters = filters || "";
    this.Orders = orders;
    this.MaxDocs = maxDocs || 1000;
    this.MaxDescriptionLength = maxDescrLength || 200;
    this.ErrFunct = function (exObj) {
        alert("Error al buscar. Por favor envie este error al administrador de sistema. Detalle: " + exObj.Message);
    };
    this.getData = function (groupValues, success, error) {
        var methodName = "FolderSearchByGroupsNew";
        if (groupValues != null && groupValues.length == this.Groups.length) {
            methodName = "FolderSearchNewObj";
        }
        var paramName = "folderSearchParam";
        var err = error != undefined ? error : this.ErrFunct;
        var folderParams = this.getParameter(groupValues);
        return Gestar.REST.asyncCall(methodName, "POST", folderParams, paramName, success, err, true);
    };
    this.getParameter = function (groupValues) {
        var searchParam = new Gestar.REST.Model.FolderSearchParam();
        searchParam.FldId = this.FldId;
        searchParam.Fields = fieldsArr;
        if (groupValues.length < this.Groups.length) {
            searchParam.Groups = this.Groups[groupValues.length];
            /*if (typeof searchParam.Groups == "object") {
                searchParam.Groups = this.Groups[groupValues.length].field;
                searchParam.GroupsOrder = this.Groups[groupValues.length].order;
            }*/
        }
        var addToFilter = "";
        for (var i = 0; i < groupValues.length; i++) {
            var nexus = " AND ";
            if (this.Filters == "") {
                nexus = "";
            }
            var gValue = groupValues[i];
            if (!isNumber(gValue)) {
                gValue = "'" + gValue + "'";
            }
            addToFilter += nexus + this.Groups[i] + " = " + gValue;
        }
        //if (addToFilter != "") {
        //    addToFilter = " AND " + addToFilter;
        //}
        searchParam.Formula = this.Filters + addToFilter;
        searchParam.Totals = this.Totals;
        searchParam.Order = this.Orders;
        searchParam.MaxDocs = this.MaxDocs;
        searchParam.Recursive = false;
        searchParam.GroupsOrder = "";
        searchParam.TotalsOrder = "";
        searchParam.MaxDescriptionLenght = 0; //this.MaxDescriptionLength;

        return searchParam;
    };
};
Gestar.MultipleFieldsProvider = function (fldId, form, fields, filters, orders, maxDocs) {
    this.Parent = Gestar.FolderDataProvider;
    this.Parent(fldId, fields, [], "", filters, orders, maxDocs);
    this.FldId = fldId;
    this.Fields = fields;
    this.Form = form;
    this.Groups = [];
    this.Totals = "";
    this.Filters = filters;
    this.Orders = orders;
    this.MaxDocs = maxDocs || 1500;
    this.ErrFunct = function (exObj) {
        alert("Error al buscar. Por favor envie este error al administrador de sistema. Detalle: " + exObj.Message);
    };
    this.getData = function (groupValues, success, error) {
        var methodName = "FolderSearchNewObj";
        /*if (groupValues != null && groupValues.length == this.Groups.length) {
            methodName = "FolderSearchNewObj";
        }*/
        var paramName = "folderSearchParam";
        var err = error != undefined ? error : this.ErrFunct;
        var folderParams = this.getParameter([]);
        var successFn = success;
        var self = this;
        return Gestar.REST.asyncCall(methodName, "POST", folderParams, paramName, function (result) {
            self.ResultCount = result.length;
            processedResult = [];

            if (result.length <= 0) {
                successFn(processedResult);
                return;
            }



            var firstRow = result[0];

            var fields = self.Fields.split(",");
            var viewGroup = self.View.Definition.Groups.Items[0];
            for (var p = 0, len = fields.length; p < len; p++) {

                for (var u = 0; u < self.Form.Fields.length; u++) {
                    if (fields[p].toUpperCase() == self.Form.Fields[u].Name.toUpperCase()) {
                        eval('var obj = { "' + viewGroup.Field + '": self.Form.Fields[u].Description, TOTAL: 0 }');
                        processedResult.push(obj);
                    }
                }
            }
            //{ DEPORTE:"Golf", TOTAL:0}
            for (var y = 0, leng = result.length; y < leng; y++) {
                for (var r = 0, le = fields.length; r < le; r++) {
                    var fieldName = fields[r];
                    if (result[y][fieldName] == 1) {
                        processedResult[r].TOTAL += 1;
                    }
                }
            }
            //Orden por totales
            if (viewGroup.OrderBy == 1) {

                var compFn = function compare(a, b) {
                    if (a.TOTAL < b.TOTAL)
                        return -1;
                    if (a.TOTAL > b.TOTAL)
                        return 1;
                    return 0;
                };
                //Descendente
                if (viewGroup.Direction == 1) {
                    compFn = function compare(a, b) {
                        if (a.TOTAL > b.TOTAL)
                            return -1;
                        if (a.TOTAL < b.TOTAL)
                            return 1;
                        return 0;
                    };
                }
                processedResult.sort(compFn);
            }

            successFn(processedResult);
        }, err, true);
    };
    this.isGroupResult = function (result) {
        return true;
    };
};

var Browser = {
    Version: function () {
        var version = 999;
        // we assume a sane browser    
        if (navigator.appVersion.indexOf("MSIE") != -1) {
            // bah, IE again, lets downgrade version number      
            version = parseFloat(navigator.appVersion.split("MSIE")[1]);
        }
        return version;
    }
};

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function cloneObject(obj) {
    var newObject = jQuery.extend(true, {}, obj);
    return newObject;
}

function cloneArray(arr) {
    var newArray = jQuery.extend(true, [], arr);
    return newArray;
}

function handleSessionExpired() {
    window.location = Gestar.Tools.url("/auth/login");
}

function handledServiceError() {

}

function unhandledServiceError(exObj) {
    alert("Metodo: " + exObj.Method + " Mensaje: " + exObj.Message);
}

function url(relativeUrl) {
    var completePath = "";
    var initialNexus = "";
    var middleNexus = "";
    var locationPath = globalSettings.baseUrl;

    if (!locationPath.startsWith("/")) {
        initialNexus = "/";
    }
    if (!relativeUrl.startsWith("/")) {
        if (!locationPath.endsWith("/")) {
            middleNexus = "/";
        }
    }
    if (relativeUrl.startsWith("/") && locationPath.endsWith("/")) {
        locationPath = locationPath.substring(0, locationPath.length - 1);
        middleNexus = "";
    }

    completePath = locationPath + middleNexus + relativeUrl;
    return completePath;
}

function fillLangstrings() {
    resolveLangStrings(jQuery("[lang-str]"));
    resolveToolTips(jQuery("[lang-str-tt]"));
}

function processLangStrings(element) {
    var ele = element.find("[lang-str]");
    resolveLangStrings(ele);
    var eme = element.find("[lang-str-tt]");
    resolveToolTips(eme);
}

function resolveLangStrings(elements) {
    jQuery.each(elements, function (index, elem) {
        var langStringId = jQuery(elem).attr("lang-str");
        var result = getLangstring(langStringId);
        try {
            if (jQuery(elem).is("input[type=button]") || jQuery(elem).is("input[type=submit]")) {
                jQuery(elem).val(result);
            } else {
                jQuery(elem).text(result);
            }
        } catch (ex) {}
    });
}

function resolveToolTips(tooltipElements) {
    jQuery.each(tooltipElements, function (index, ttElem) {
        var langStringId = jQuery(ttElem).attr("lang-str-tt");
        var result = getLangstring(langStringId);
        try {
            jQuery(ttElem).attr("title", result);
        } catch (ex) {}
    });
}

function xmlToString(xmlData) {
    try {
        var xmlString;
        //IE9+, Chrome, Mozilla, Firefox, Opera, etc.
        xmlString = (new XMLSerializer()).serializeToString(xmlData[0]);
        return xmlString;
    } catch (ex) {
        return null;
    }
}

function displayHandledError(exObj) {
    //TODO Hacer algo relativamente presentable
    alert("Error: " + exObj.Message);
}

function getMasterLangstring(stringId) {
    var stringValue = "";
    Gestar.REST.call("GetMasterLangString", "GET", "stringId=" + stringId, "", function (result) {
        stringValue = result;
    });
    return stringValue;
}

function getLangstring(stringId) {
    var stringValue = "[String not found]";
    //var start = new Date().getTime();
    if (window.userLangStrings != undefined && window.userLangStrings != null) {
        stringValue = window.userLangStrings[stringId];
        /*var string = jQuery.grep(window.userLangStrings, function (sysString) { return sysString.StrId == stringId; });
        //var end = new Date().getTime();
        //var span = end - start;
        if (string.length > 0) {
            return string[0].String;
        }*/
        return stringValue;
    }
    Gestar.REST.call("GetLangString", "GET", "stringId=" + stringId, "", function (result) {
        stringValue = result;
    });
    return stringValue;
};
var Gestar = Gestar || {};
Gestar.Settings = Gestar.Settings || {};
Gestar.Settings.UserState = Gestar.Settings.UserState || {};
var globalSettings = {
    serviceUnhandledErrorFunction: null,
    baseUrl: ""
};
(function () {
    this.DebugMode = false;
    this.ServiceUnhandledErrorFunction = null;
    this.BaseUrl = "";
    this.VirtualRoot = "";
    this.LegacyVirtualRoot = "";
    this.NotificationsServerUrl = "";
    this.Theme = "default";
    this.ThemeUrl = "";
    this.LegacyUrl = "";
    this.VirtualizationLimit = 300;
    this.MaxDescriptionLength = -1;
    this.ServerTimeZone = '';
    this.setUserSetting = function (name, value) {
        if (typeof DoorsAPI === "object") {
            DoorsAPI.userSettingsSet(name, value).then(function (e) {}, function (err) {});
        } else {
            var settingPar = new Gestar.REST.Model.RestSessionParameter();
            settingPar.SettingName = name;
            settingPar.SettingValue = value;
            Gestar.REST.asyncCall("SetUserSetting",
                "POST",
                settingPar,
                "settingParam",
                function () {},
                function (ex) {},
                true);
        }
    };
    this.saveUserState = function () {
        //Gestar.REST.asyncCall("SETSETTING?")
        //Gestar.Settings.UserState = JSON.parse(setting);
    };
    this.getUserState = function () {
        var sett = JSON.stringify(Gestar.Settings.UserState);
        //Gestar.REST.asyncCall("GETSETTING?")
    };
}).apply(Gestar.Settings);

(function () {
    //TODO Cambiar por defineProperty para el trigger de eventos
    this.CurrentFolder = null;
    this.CurrentFolderId = 1001;
    this.CurrentFolderType = -1;
    this.CurrentForm = null;
    this.CurrentFormId = -1;
    this.CurrentView = null;
    this.CurrentViewId = -1;
    this.CurrentViewFilter = "";
    this.CurrentViewViewer = "data";
    this.CurrentViewPosition = "";
    this.CurrentFolderProperties = null;
    this.CurrentFormProperties = null;
    this.Favorites = null;
    this.AllFolders = null;
    this.LangId = null;
    this.TimeDiff = 0;
}).apply(Gestar.Settings.UserState);;
var Doors = Doors || {};
Doors.REST = Doors.REST || {};
Doors.REST.Model = Doors.REST.Model || {};
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
    this.ViewTypeEnum = {
        DataView: 1,
        ScheduleView: 2,
        CustomView: 3,
        ChartView: 4
    };
    this.ExportFormatEnum = {
        ExcelXml: 0,
        OpenXml: 1
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
    this.PropertiesParameter = function () {
        this.ObjectType = 0;
        this.ObjectId = 0;
        this.IsNew = false;
    };
    this.SinglePropertyParameter = function () {
        //Propiedad __type debe ser la primera del objeto.
        this.__type = "SinglePropertyParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.PropertiesParameter;
        this.parent();
        this.Name = "";
        this.Value = "";
    };
    this.MultiplePropertiesParameter = function () {
        //Propiedad __type debe ser la primera del objeto.
        this.__type = "MultiplePropertiesParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.PropertiesParameter;
        this.parent();
        this.Properties = [];
    };
    this.ViewSinglePropertyParameter = function () {
        //Propiedad __type debe ser la primera del objeto.
        this.__type = "ViewSinglePropertyParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.SinglePropertyParameter;
        this.parent();
        this.FldId = 0;
    };
    this.ViewMultiplePropertiesParameter = function () {
        //Propiedad __type debe ser la primera del objeto.
        this.__type = "ViewMultiplePropertiesParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.MultiplePropertiesParameter;
        this.parent();
        this.FldId = 0;
    };
    this.FieldSinglePropertyParameter = function () {
        //Propiedad __type debe ser la primera del objeto.
        this.__type = "FieldSinglePropertyParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.SinglePropertyParameter;
        this.parent();
        this.Name = "";
    };
    this.FieldMultiplePropertiesParameter = function () {
        //Propiedad __type debe ser la primera del objeto.
        this.__type = "FieldMultiplePropertiesParameter:#Gestar.Doors.Services.RestServices";
        this.parent = Doors.REST.Model.MultiplePropertiesParameter;
        this.parent();
        this.Name = "";
    };
    this.ViewSearchFilter = function () {
        //this.__type = "ViewSearchFilter:#Gestar.Doors.API.ObjectModelW";
        this.FolderId = -1;
        this.ViewId = -1;
        this.MaxDescValueLength = 0;
        this.AdditionalFields = [];
        this.Formula = "";
    };
    this.ChartViewSearchFilter = function () {
        this.__type = "ChartViewSearchFilter:#Gestar.Doors.API.ObjectModelW";
        this.parent = Doors.REST.Model.ViewSearchFilter;
        this.parent();
        this.Groups = [];
        this.Formula = "";
    };
    this.DataViewSearchFilter = function () {
        this.__type = "DataViewSearchFilter:#Gestar.Doors.API.ObjectModelW";
        this.parent = Doors.REST.Model.ViewSearchFilter;
        this.parent();
        this.GroupValues = [];
    };
    this.RestSessionParameter = function () {
        this.SettingName = "";
        this.SettingValue = "";
    };
    this.ExportParameter = function () {
        this.FldId = -1;
        this.VieId = -1;
        this.ExportFormat = 0;
        this.SelectedDocs = null;
        this.Filter = null;
        this.ColumnsNamesOnly = false;
    };
}).apply(Doors.REST.Model);; //Requiere GlobalFunctions y GlobalSettings
Doors = Doors || {};
Doors.REST = Doors.REST || {};
(function () {

    this.ServerUrl = "";
    this.AuthToken = "";
    this.ServiceUnhandledErrorFunction = function (err) {
        alert(err);
    };
    this.ResponseResultEnum = {
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
    //jQuery(document).ready(function() {
    try {
        document.body.onbeforeunload = Doors.REST.cancelPendingCalls;
    } catch (e) {

    }
    try {
        window.onbeforeunload = Doors.REST.cancelPendingCalls;
    } catch (e) {

    }
    //});

    this.call = function (callingMethod, httpMethod, parameters, parameterName, successFunction, errorFunction) {
        return Doors.REST.asyncCall(callingMethod, httpMethod, parameters, parameterName, successFunction, errorFunction, false);
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

        var req = jQuery.ajax({
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
    var handleResultObject = function (operationResult) {
        if (Object.prototype.toString.call(operationResult) == "[object String]") {
            try {
                return JSON.parse(operationResult);
            } catch (ex) {
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
            } else if (Object.prototype.toString.call(array[p]) == "[object Array]") {
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
            var date = "\/Date(" + string.getTime() + Gestar.Settings.ServerTimeZone + ")\/";
            result = date;
        }
        return result;
    };
    this.hasException = function (responseObject, callingMethod, errorFunction) {
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

    this.constructJSONParameter = function (param, parameterName) {
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
//ResponseResultEnum =
//    {
//        Sucess: 0,
//        SessionTimeOutError: 1,
//        Exception: 2
//    };
//function RESTCall(callingMethod, httpMethod, parameters, parameterName, successFunction, errorFunction) {
//	RESTCallAsync(callingMethod, httpMethod, parameters, parameterName, successFunction, errorFunction,false);
//}
//function RESTCallAsync(callingMethod, httpMethod, parameters, parameterName, successFunction, errorFunction, async) {
//    var data = null;
//    var completeUrl = restCallOptions.serverUrl + "/" + callingMethod;
//    if (parameters != undefined && parameters != null) {
//        //URL parameters
//        if (Object.prototype.toString.call(parameters) == "[object String]") {
//            var others = "";
//            var nexus = "";
//            //NOTE: Esto ya no aplica, ya que el token se pasa por header.
//            //var token = "?authToken=" + restCallOptions.authToken;
//            if (parameters != "") {
//                nexus = "?";
//                others = parameters;
//            }
//            completeUrl = completeUrl + nexus + others;
//        } else {
//            //Javascript parameters
//            var restParam = constructJSONParameter(parameters, parameterName);
//            data = restParam;
//        }
//    }
//    //In case caller doesn't want to handle error.
//    if (errorFunction == undefined) {
//        errorFunction = globalSettings.serviceUnhandledErrorFunction;
//    }
//    
//    jQuery.ajax({
//        type: httpMethod,
//        url: completeUrl,
//        data: data,
//        beforeSend: function (xhr, settings) {
//            var tk = restCallOptions.authToken;
//            //var encoded = encodeURIComponent(tk);
//            xhr.setRequestHeader("AuthToken", tk);
//        },
//        contentType: "application/json; charset=utf-8",
//        dataType: "json customJson",
//        converters: {
//            "json customJson": function (result) {
//                //In case a complex object is received.
//                if (result.InternalObject === undefined) {
//                    result = result[callingMethod + "Result"];
//                }
//                tryParseDateComplex(result.InternalObject);
//                return result;
//            }
//        },
//        cache: false,
//        async: async,
//        processdata: false,
//        success: function (result, textStatus, xhr) {
//            //In case a complex object is received.
//            if (result.InternalObject === undefined) {
//                result = result[callingMethod + "Result"];
//            }
//            //If it still does not contains de correct structure, throw error;
//            if (result.InternalObject === undefined) {
//                var err = new ExceptionObject();
//                err.Message = "Response object missformed. Method: " + callingMethod;
//                err.Method = callingMethod;
//                errorFunction(err);
//                return;
//            }
//            if (hasException(result, callingMethod, errorFunction)) {
//                return;
//            }
//            successFunction(handleResultObject(result.InternalObject));
//        },
//        error: function (xhr, textStatus, errorThrown) {
//            var err = new ExceptionObject();
//            err.DoorsExceptionType = null;
//            err.Message = "REST Api Error - Method: " + callingMethod + " Status Code: " + xhr.status + " - Message: " + errorThrown;
//            err.Type = ResponseResultEnum.Exception;
//            err.Method = callingMethod;
//            errorFunction(err);
//        }
//    });
//}

//function handleResultObject(operationResult) {
//    if(Object.prototype.toString.call(operationResult) == "[object String]") {
//        try {
//            return JSON.parse(operationResult);
//        }
//        catch(ex) {
//            return operationResult;
//        }
//    }
//    return operationResult;
//}

//function tryParseDate(simpleObject) {
//    for (var i in simpleObject) {
//        if (typeof simpleObject[i] == "string" && simpleObject[i].substring(0, 6) == "/Date(") {
//            simpleObject[i] = new Date(parseInt(simpleObject[i].substr(6)));
//        } else if (Object.prototype.toString.call(simpleObject[i]) == "[object Date]") {
//            var date = "\/Date(" + simpleObject[i].getTime() + "-0000)\/";
//            simpleObject[i] = date;
//        }
//    }
//}
////TODO Revisar performance de tryParseDate
//function tryParseDateComplex(arrayObject) {
//    //FIX para objetos que vienen del servidor como string pero son objetos JSON (SearchGroups x ej)
//    if (Object.prototype.toString.call(arrayObject) == "[object String]" && (arrayObject.startsWith("{") || arrayObject.startsWith("["))) {
//        arrayObject = JSON.parse(arrayObject);
//    }
//    for (var i in arrayObject) {
//        if(Object.prototype.toString.call(arrayObject[i])  == "[object Array]") {
//            tryParseDateComplex(arrayObject[i]);
//        }
//        else {
//            if (typeof arrayObject[i] == "string" && arrayObject[i].substring(0, 6) == "/Date(") {
//                arrayObject[i] = new Date(parseInt(arrayObject[i].substr(6)));
//            } else if (Object.prototype.toString.call(arrayObject[i]) == "[object Date]") {
//                var date = "\/Date(" + arrayObject[i].getTime() + "-0000)\/";
//                arrayObject[i] = date;
//            }
//        }
//        tryParseDate(arrayObject[i]);
//    }
//}
//function hasException(responseObject, callingMethod, errorFunction) {
//    if(responseObject.ResponseResult == ResponseResultEnum.SessionTimeOutError) {
//        handleSessionExpired();
//        return true;
//    }
//    if (responseObject.ResponseResult == ResponseResultEnum.Exception) {
//        
//        var ex = new ExceptionObject();
//        ex.Message = responseObject.ExceptionMessage;
//        ex.Type = ResponseResultEnum.Exception;
//        ex.DoorsExceptionType = responseObject.ExceptionType;
//        ex.Method = callingMethod;
//        errorFunction(ex);
//        return true;
//    }
//    return false;
//}

//function constructJSONParameter(param, parameterName) {
//    //NOTE Se copia el objeto para no modificar la referencia al enviarse al server
//    var clone = cloneObject(param);
//    tryParseDateComplex(clone);
//    var paramName = param.ParameterName;
//    if (param.ParameterName === undefined || param.ParameterName == undefined || param.ParameterName == null || param.ParameterName=="") {
//        paramName = parameterName;
//    }
//    var stringParam = "{ \"" + paramName + "\": { \"AuthToken\":\"" + restCallOptions.authToken + "\", \"Param\": " + JSON.stringify(clone) +
//        " } }";
//    return stringParam;
//}
; //Requiere GlobalFunctions y GlobalSettings
Doors = Doors || {};
Doors.RESTFULL = Doors.RESTFULL || {};
(function () {

    this.ServerUrl = "";
    this.AuthToken = "";
    this.ServiceUnhandledErrorFunction = null;
    this.ResponseResultEnum = {
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
    jQuery(document).ready(function () {
        document.body.onbeforeunload = Doors.RESTFULL.cancelPendingCalls;
        window.onbeforeunload = Doors.RESTFULL.cancelPendingCalls;
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
        xhr.setRequestHeader("AuthToken", Doors.RESTFULL.AuthToken);
        (httpMethod == "GET") ? xhr.responseType = "arraybuffer": null;
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
        var _self = this;
        var prom = jQuery.Deferred();
        var req = jQuery.ajax({
            type: httpMethod,
            url: completeUrl,
            data: data,
            beforeSend: function (xhr, settings) {
                var tk = Doors.RESTFULL.AuthToken;
                //var encoded = encodeURIComponent(tk);
                xhr.setRequestHeader("AuthToken", tk);
            },
            contentType: "application/json",
            dataType: "json customJson",
            converters: {
                "json customJson": function (result) {

                    //result = tryParseDateComplex(result);
                    return result;
                }
            },
            cache: false,
            async: true,
            processdata: false,
            success: function (result, textStatus, xhr) {
                //If does not contains de correct structure, throw error;
                if (result.InternalObject === undefined) {
                    var err = {
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
                    } else {
                        Gestar.Tools.er(result.ExceptionMessage, result);
                    }

                    prom.reject(result);
                    return;
                }
                prom.resolve(result.InternalObject);

            },
            error: function (xhr, textStatus, errorThrown) {
                if (xhr.readyState == 0 || !xhr.responseText || xhr.status == 404) {
                    prom.reject({
                        Message: "Request Error",
                        Method: callingMethod,
                        xhr: xhr
                    });
                    return;
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
                prom.reject(responseObj);

            },
            complete: function (xhr, textStatus) {
                _self.decrementCurrentCalls(xhr);
            }
        });
        this.CurrentCalls.push(req);
        return prom.promise();
    };

    this.decrementCurrentCalls = function (xhr) {
        var index = Doors.RESTFULL.CurrentCalls.indexOf(xhr);
        if (index !== -1) {
            Doors.RESTFULL.CurrentCalls.splice(index, 1);
        }
    }

    var handleResultObject = function (operationResult) {
        if (Object.prototype.toString.call(operationResult) == "[object String]") {
            try {
                return JSON.parse(operationResult);
            } catch (ex) {
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
            } else if (Object.prototype.toString.call(array[p]) == "[object Array]") {
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
            var date = string.toISOString(); //"\/Date(" + string.getTime() + Gestar.Settings.ServerTimeZone + ")\/";
            result = date;
        }
        return result;
    };

    this.hasException = function (responseObject, callingMethod) {
        if (responseObject.ResponseResult == Doors.RESTFULL.ResponseResultEnum.SessionTimeOutError) {
            Gestar.ErrorHandling.handleSessionExpired();
            return true;
        }
        if (responseObject.ResponseResult == Doors.RESTFULL.ResponseResultEnum.Exception) {

            jQuery.extend(responseObject, responseObject, {
                Message: responseObject.ExceptionMessage,
                Type: Doors.RESTFULL.ResponseResultEnum.Exception,
                DoorsExceptionType: responseObject.ExceptionType,
                Method: callingMethod
            });

            return true;
        }
        return false;
    };

    this.constructJSONParameter = function (param, parameterName) {
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
}).apply(Doors.RESTFULL);;
Doors = Doors || {};
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

Doors.API.prototype.sessionTags = function () {
    var url = "session/tags";
    return Doors.RESTFULL.asyncCall(url, "GET", {}, "");
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

Doors.API.prototype.instanceSettingsRemove = function (settingName) {
    var url = "settings/" + encodeURIComponent(settingName);
    return Doors.RESTFULL.asyncCall(url, "DELETE", "", "");
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

Doors.API.prototype.accountChilds = function (accId) {
    var url = "accounts/" + accId + "/childAccounts";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.accountChildsRecursive = function (accId) {
    var url = "accounts/" + encodeURIComponent(accId) + "/childAccountsRecursive";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.accountDelete = function (accId, expropiateObjects) {
    var url = "accounts/" + encodeURIComponent(accId) + "";
    return Doors.RESTFULL.asyncCall(url, "DELETE", expropiateObjects, "expropiateObjects");
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
    if (user.AccId === undefined || user.IsNew) {
        operation = "PUT";
        url = "users";
    }
    return Doors.RESTFULL.asyncCall(url, operation, user, "user");

};

Doors.API.prototype.accountSave = function (account) {
    var url = "accounts/" + account.AccId + "";
    return Doors.RESTFULL.asyncCall(url, "POST", account, "account");
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

Doors.API.prototype.accountParentsRecursive = function (accId) {

    var url = "accounts/" + encodeURIComponent(accId) + "/parentAccountsRecursive";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
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
    var url = "/accounts/search?filter=";
    if (filter) url += encodeURIComponent(filter);
    url += "&order=";
    if (order) url += encodeURIComponent(order);
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.accounts = function () {
    var url = "accounts";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
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

Doors.API.prototype.viewDelete = function (fldId, viewId) {
    var url = "folders/" + fldId + "/views/" + viewId;
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

Doors.API.prototype.formsGetById = function (frmId) {
    var url = "forms/" + frmId;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.formsGetByFolderId = function (fldId) {
    var url = "forms?fldId=" + fldId;
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

/*Folder Functions*/
Doors.API.prototype.foldersGetById = function (fldId) {
    var url = "folders/" + fldId + "";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
};

Doors.API.prototype.foldersGetByPath = function (parentFolderId, folderPath) {
    var url = "folders/" + parentFolderId + "/children?folderpath=" + encodeURIComponent(folderPath);
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
    return Doors.RESTFULL.asyncCall(url, "DELETE", "", "");
};

Doors.API.prototype.folderEvents = function (fldId) {
    var url = "folders/" + fldId + "/syncevents";
    return Doors.RESTFULL.asyncCall(url, "GET", "", "");
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

Doors.API.prototype.folderSearchPivot = function (fldId, pivotField, crossField, formula, totalsField, totalsFunc, totalsOrder, maxDocs) {
    var url = "folders/" + fldId + "/documents/pivot";
    var parameters = "pivotField=" + encodeURIComponent(pivotField) +
        "&crossField=" + encodeURIComponent(crossField) +
        "&formula=" + (formula === undefined ? "" : encodeURIComponent(formula)) +
        "&totalsField=" + (totalsField === undefined ? "" : encodeURIComponent(totalsField)) +
        "&totalsFunc=" + (totalsFunc === undefined ? "" : encodeURIComponent(totalsFunc)) +
        "&totalsOrder=" + (totalsOrder === undefined ? "" : encodeURIComponent(totalsOrder)) +
        "&maxDocs=" + (maxDocs === undefined ? 30 : maxDocs);
    return Doors.RESTFULL.asyncCall(url, "GET", parameters, "");
};

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
    var url = "folders/" + fldId + "/documents?tobin=" + encodeURIComponent(sendRecycleBin);
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
    var url = "documents/" + docId + "/attachments/" + encodeURIComponent(attName);
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
    var url = "userproperties?objId=" + objId + "&objType=" + objType +
        "&objParentId=" + objParentId + "&objName=" + encodeURIComponent(objName);
    return Doors.RESTFULL.asyncCall(url, "DELETE", arrProperties, "arrProperties");
};

Doors.API.prototype.userPropertiesSet = function (objId, objType, objParentId, objName, arrProperties) {

    if (!objParentId) {
        objParentId = "";
    }
    if (!objName) {
        objName = "";
    }
    var url = "userproperties?objId=" + objId + "&objType=" + objType +
        "&objParentId=" + objParentId + "&objName=" + encodeURIComponent(objName);
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
Doors.API.prototype.documentAclSave = function (docId, aclInformation) {
    var url = "documents/" + docId + "/acl";
    return Doors.RESTFULL.asyncCall(url, "POST", aclInformation, "");
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

Doors.API.prototype.runSyncEventsOnClientSet = function (runOnClient) {
    var str = runOnClient === "true" || runOnClient === true || runOnClient === "1" ? "true" : "false";
    var url = "session/syncevents/runOnClient/" + str;
    return Doors.RESTFULL.asyncCall(url, "POST", {}, "");
};

Doors.API.prototype.runSyncEventsOnClientGet = function () {
    var url = "session/syncevents/runOnClient";
    return Doors.RESTFULL.asyncCall(url, "GET", {}, "");
};