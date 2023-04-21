
/*
app7-generic
generic del APP7

Documentacion:
Cordova: https://cordova.apache.org/docs/en/latest/
Framework7: https://framework7.io/docs/
*/

var fld_id, doc_id, cacheDir;
var doc, docJson, folder, folderJson;
var controlsFolder, controls, controlsRights;
var $page, $navbar, f7Page, pageEl, saving;

var pStuff = {}; // Deprecado, usar pageEl.crm

/*
pageEl.crm sirve para guardar variables y funciones de UNA INSTANCIA de pagina.
Al estar guardadas en el nodo de la pagina se pueden acceder desde otras paginas. Ej:

En el BeforeRender:

    pageEl.crm.myVar = 5;
    pageEl.crm.myFunc = function () {
        alert('myVar is ' + pageEl.crm.myVar.toString());
    }

Y luego en el app7_script de un textbox:

    $input.change(function () {
        pageEl.crm.myVar = $(this).val()
        pageEl.crm.myFunc();
    });

Y usar la misma function en el AfterRender (que se dispara al finalizar el abrir o guardar)

    pageEl.crm.myFunc();

Y tambien llamarla desde otra pagina de esta forma:

    $('#view-myview .page[id*="generic_"]')[0].crm.myFunc()

pageEl.crm tendra precargadas algunas variables y funciones de la pagina como el documento, folder, etc
*/

// Parametros del query string
fld_id = routeTo.query.fld_id;
doc_id = routeTo.query.doc_id;

app7.preloader.show();

function errMgr(pErr) {
    console.log(pErr);
    app7.preloader.hide();
    resolve({
        content: errPage(pErr)
    });
}

// Directorio para guardar adjuntos
if (device.platform != 'browser') {
    window.resolveLocalFileSystemURL(cordova.file.cacheDirectory,
        function (dir) {
            cacheDir = dir;
        },
        function (err) {
            console.log('resolveLocalFileSystemURL error: ' + err.code);
        }
    );
}

(async () => {
    try {
        folder = await dSession.folder(fld_id);
        folderJson = folder.toJSON();

        if (doc_id) {
            doc = await folder.documents(doc_id);
        } else {
            doc = await folder.documentsNew();
        }
        docJson = doc.toJSON();

        loadControls();

    } catch (err) {
        errMgr(err)
    }
})();

async function loadControls() {
    var cf = objPropCI(doc.tags, 'controlsFolder');

    try {
        if (cf) {
            controlsFolder = await folder.app.folders(cf);
        } else {
            controlsFolder = await folder.folders('controls');
        }
        controls = await controlsFolder.search({ order: 'parent, order, column', maxTextLen: 0 });
        getControlsRights(controls);
        renderPage();    

    } catch(err) {
        renderPage(); // Dibuja igual, sin controles
    }
}

function getControlsRights(pControls) {
    var cr = objPropCI(doc.tags, 'controlsRights');
    if (cr) {
        try {
            controlsRights = $.parseXML(cr);
        } catch (err) {
            console.log('Error parsing controlsRights: ' + errMsg(err));
        }
    }

    var ctl;
    if (controlsRights) {
        var $cr = $(controlsRights);
        var name, r, w;
        $cr.find('item').each(function (ix, el) {
            name = el.getAttribute('control').toLowerCase();
            r = el.getAttribute('r');
            w = el.getAttribute('w');
            if (r || w) {
                ctl = controls.find(function (el) {
                    if (el['NAME']) return el['NAME'].toLowerCase() == name;
                });
                if (ctl) {
                    if (r) ctl['R'] = r;
                    if (w) ctl['W'] = w;
                }
            }
        });
    }

    // Setea todo lo que no se especifico a 1
    controls.forEach(ctl => {
        if (!ctl['R']) ctl['R'] = '1';
        if (!ctl['W']) ctl['W'] = '1';
    })
}

async function renderPage() {
    var $tabbar, $tabbarInner, $tabs;

    // page
    $page = getPage({
        id: 'generic_' + getGuid(),
        title: 'Cargando...',
        leftbutton: 'exit',
        rightbutton: 'save',
    });

    $page.find('.navbar-inner .left .link').on('click', function (e) {
        // todo: ver si se puede detectar si hubo cambios
        /*
        app7.dialog.confirm('Perdera los cambios relizados', (dialog) => {
            f7Page.view.router.back();
        }
        */
        if (!pageEl.crm.saved) {
            // Si nunca guarde evito el refresh del explorer
            $(f7Page.pageFrom.pageEl).find('.refresh-on-focus').each((ix, el) => {
                $(el).removeClass('refresh-on-focus');
            })
        }
        f7Page.view.router.back();
    });

    $page.find('.navbar-inner .right .link').on('click', function (e) {
        saveDoc();
    });

    // Boton Guardar y salir
    var $nbRight = $page.find('.navbar-inner .right');

    var $saveExitBtn = $('<a/>', {
        href: '#',
        class: 'link icon-only',
        style: app7.theme == 'ios' ? 'margin-left: 8px;' : 'margin-right: 6px;',
    }).appendTo($nbRight);
    $saveExitBtn.append('<i class="material-icons-outlined" style="font-size: 30px;">cloud_done</i>');

    $saveExitBtn.click(function () {
        saveDoc(true);
    });

    // Page Content
    var $pageCont = $page.find('.page-content');

    if (!controls) {

        // SIN CONTROLES

        var $tabMain, $tabHeader, $tabHist, $div, $ul, $ctl;

        // TABBAR

        $tabbar = $('<div/>', {
            class: 'toolbar tabbar toolbar-top',
            style: 'top: 0;',
        }).appendTo($pageCont);

        $tabbarInner = $('<div/>', {
            class: 'toolbar-inner',
        }).appendTo($tabbar);

        $('<a/>', {
            class: 'tab-link tab-link-active',
            href: '#' + $page.attr('id') + ' #tabMain',
        }).append('Datos').appendTo($tabbarInner);

        $('<a/>', {
            class: 'tab-link',
            href: '#' + $page.attr('id') + ' #tabHeader',
        }).append('Header').appendTo($tabbarInner);

        $('<a/>', {
            class: 'tab-link',
            href: '#' + $page.attr('id') + ' #tabHist',
        }).append('Historial').appendTo($tabbarInner);


        // TABS

        $tabs = $('<div/>', {
            class: 'tabs',
        }).appendTo($pageCont);


        // tabMain

        $tabMain = $('<div/>', {
            class: 'tab tab-active',
            id: 'tabMain',
        }).appendTo($tabs);

        $div = $('<div/>', {
            class: 'list no-hairlines-md',
            style: 'margin-top: 0;',
        }).appendTo($tabMain);

        $ul = $('<ul/>').appendTo($div);

        for (let [key, field] of doc.fields()) {
            if (field.custom && !field.headerTable && field.name != 'DOC_ID') {
                getDefaultControl(field).appendTo($ul);
            }
        }

        $ctl = getAttachments('attachments', 'Adjuntos').appendTo($ul);
        $ctl.find('.list').on('click', 'a', downloadAtt);
        $ctl.on('swipeout:deleted', 'li.swipeout', deleteAtt);
        $ctl.find('div.row').on('click', 'button', addAtt);


        // tabHeader

        $tabHeader = $('<div/>', {
            class: 'tab',
            id: 'tabHeader',
        }).appendTo($tabs);

        $div = $('<div/>', {
            class: 'list no-hairlines-md',
            style: 'margin-top: 0;',
        }).appendTo($tabHeader);

        $ul = $('<ul/>').appendTo($div);

        for (let [key, field] of doc.fields()) {
            if (!field.custom && field.headerTable) {
                getDefaultControl(field).appendTo($ul);
            }
        }

        // tabHist

        $tabHist = $('<div/>', {
            class: 'tab',
            id: 'tabHist',
        }).appendTo($tabs);

        $('<div/>', {
            'data-doclog': 1,
        }).append('Cargando...').appendTo($tabHist);

    } else {

        // CON CONTROLES

        try {
            // Control Event BeforeRender
            var ev = getEvent('BeforeRender');
            if (ev) await evalCode(ev);

        } catch(err) {
            console.error(err);
            toast('BeforeRender error: ' + dSession.utils.errMsg(err));
        }

        // Membrete

        $ul = $('<ul/>')
        await renderControls($ul, '[NULL]');

        if ($ul.html()) {
            $('<div/>', {
                class: 'list no-hairlines-md',
                style: 'margin-top: 0;',
            }).append($ul).appendTo($pageCont);
        }

        // TABS

        var tabs = controls.filter(function (el) {
            return el['CONTROL'].toUpperCase() == 'TAB' && el['DONOTRENDER'] != 1 &&
                el['R'] != '0' && el['HIDEINAPP'] != '1'
        });

        if (tabs.length > 0) {
            $tabbar = $('<div/>', {
                class: 'toolbar tabbar toolbar-top',
                style: 'top: 0;',
            }).appendTo($pageCont);

            $tabbarInner = $('<div/>', {
                class: 'toolbar-inner',
            }).appendTo($tabbar);

            $tabs = $('<div/>', {
                class: 'tabs',
            }).appendTo($pageCont);

            var tab, label, $tab, $ul;
            for (var i = 0; i < tabs.length; i++) {
                tab = tabs[i];
                label = tab['DESCRIPTION'] ? tab['DESCRIPTION'] : tab['NAME'];
                $('<a/>', {
                    class: 'tab-link' + (i == 0 ? ' tab-link-active' : ''),
                    href: '#' + $page.attr('id') + ' #' + tab['NAME'],
                }).append(label).appendTo($tabbarInner);

                $tab = $('<div/>', {
                    class: 'tab' + (i == 0 ? ' tab-active' : ''),
                    id: tab['NAME'],
                }).appendTo($tabs);

                $ul = $('<ul/>')
                await renderControls($ul, tab['NAME']);

                if ($ul.html()) {
                    $('<div/>', {
                        class: 'list no-hairlines-md',
                        style: 'margin-top: 0;',
                    }).append($ul).appendTo($tab);
                }
            }
        }
    }

    resolveRoute({ resolve: resolve, pageEl: $page, pageInit: pageInit });
}

async function renderControls(pCont, pParent) {
    var ctl, type, $this, domAttr, label, $input, aux, f7ctl;
    var tf, textField, vf, valueField;

    var subset = controls.filter(function (el) {
        return el['PARENT'] == pParent && el['CONTROL'].toUpperCase() != 'TAB' &&
            el['CONTROL'].toUpperCase() != 'EVENT' && el['DONOTRENDER'] != 1 &&
            el['R'] != '0' && el['HIDEINAPP'] != '1'
    });

    for (var i = 0; i < subset.length; i++) {
        ctl = subset[i];
        type = ctl['CONTROL'].toUpperCase();
        domAttr = undefined;
        if (ctl['XMLATTRIBUTES']) {
            try {
                domAttr = $.parseXML(ctl['XMLATTRIBUTES']);
            } catch (err) {
                console.log('Error parsing ' + ctl['NAME'] + '.XMLATTRIBUTES: ' + errMsg(err));
            }
        };
        ctl.domAttr = domAttr;
        ctl.attr = function (attribute) {
            if (this.domAttr) return this.domAttr.documentElement.getAttribute(attribute);
        };

        label = ctl['DESCRIPTION'] ? ctl['DESCRIPTION'] : ctl['NAME'];
        $this = undefined;
        $input = undefined;
        f7ctl = undefined;

        tf = undefined;
        textField = undefined;
        vf = undefined;
        valueField = undefined;

        var tf = ctl.attr('textfield');
        if (tf && tf != '[NULL]') {
            textField = doc.fields(tf);
        };

        var vf = ctl.attr('valuefield');
        if (vf && vf != '[NULL]') {
            valueField = doc.fields(vf);
        };


        // todo: revisar que esten soportadas todas las properties de controls3

        // -- Textbox --

        if (type == 'TEXTBOX') {
            if (ctl.attr('mode') == '2') { // Multiline
                $this = getTextarea(ctl['NAME'], label);
                $input = $this.find('textarea');

            } else {
                $this = getInputText(ctl['NAME'], label);
                $input = $this.find('input');
                if (ctl.attr('mode') == '3') $input.attr('type', 'password');
                if (ctl.attr('isnumber') == '1') $input.attr('data-numeral', numeral.options.defaultFormat);
            }

            $input.attr('data-textfield', tf);

            if (ctl.attr('maxlength')) {
                $input.attr('maxlength', ctl.attr('maxlength'));
            } else if (textField && textField.type == 1 && textField.length > 0) {
                $input.attr('maxlength', textField.length);
            }

            if (textField && textField.type == 3) {
                $input.attr('data-numeral', numeral.options.defaultFormat)
            }

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                inputReadonly($input, true);
            }

            if (ctl.attr('datalist') == '1' && ctl.attr('mode') == '1' && textField) {
                f7ctl = inputDataList($input, {
                    folder: fld_id,
                    field: tf
                });
            }

            if (ctl.attr('buttons') == 'phone') addPhoneButtons($this);
            if (ctl.attr('buttons') == 'email') addEmailButton($this);


        // -- DTPicker --

        } else if (type == 'DTPICKER') {
            var mode = 'date';
            if (ctl.attr('mode') == '2') {
                mode = 'datetime-local';
            } else if (ctl.attr('mode') == '3') {
                mode = 'time';
            }
            $this = getDTPicker(ctl['NAME'], label, mode)
            $input = $this.find('input');
            $input.attr('data-textfield', tf);
            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                inputReadonly($input, true);
            }


        // -- HtmlRaw --

        } else if (type == 'HTMLRAW') {
            $this = $('<li/>')
            $('<div/>', {
                id: ctl['NAME'],
                name: ctl['NAME'],
            }).appendTo($this);


        // -- Select --

        } else if (type == 'SELECT') {
            $this = getSmartSelect(ctl['NAME'], label, ctl.attr('multiple') == '1');
            $input = $this.find('select');
            f7ctl = app7.smartSelect.get($this.find('.smart-select')[0]);

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $this.find('.smart-select').addClass('disabled');
            }


        // -- SelectFolder --

        } else if (type == 'SELECTFOLDER') {
            $this = getSmartSelect(ctl['NAME'], label);
            $input = $this.find('select');
            f7ctl = app7.smartSelect.get($this.find('.smart-select')[0]);

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $this.find('.smart-select').addClass('disabled');
            }

            $input.attr('data-textfield', tf);
            $input.attr('data-valuefield', vf);

            $input.attr('data-fill', '1');
            $input.attr('data-fill-folder', ctl.attr('searchfolder'));
            $input.attr('data-fill-fields', ctl.attr('fieldlist'));
            $input.attr('data-fill-formula', ctl.attr('searchfilter'));
            $input.attr('data-fill-order', ctl.attr('searchorder'));
            $input.attr('data-fill-withoutnothing', ctl.attr('withoutnull') == '1' ? '1' : '0');

            if (ctl.attr('searchbar') == '1') {
                f7ctl.params.openIn = 'popup';
                f7ctl.params.searchbar = true;
            }


        // -- SelectKeywords --

        } else if (type == 'SELECTKEYWORDS') {
            $this = getSmartSelect(ctl['NAME'], label);
            $input = $this.find('select');
            f7ctl = app7.smartSelect.get($this.find('.smart-select')[0]);

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $this.find('.smart-select').addClass('disabled');
            }

            $input.attr('data-textfield', tf);
            $input.attr('data-valuefield', vf);

            $input.attr('data-fill', '1');
            $input.attr('data-fill-folder', ctl.attr('folder'));
            $input.attr('data-fill-fields', 'DESCRIPTION, ID');
            $input.attr('data-fill-formula', 'TYPE = ' + sqlEncode(ctl.attr('keywordtype'), 1) +
                ' and (DISABLED = 0 OR DISABLED is NULL)');
            aux = ctl.attr('order');
            $input.attr('data-fill-order', (aux ? aux : 'DESCRIPTION'));
            $input.attr('data-fill-withoutnothing', ctl.attr('withoutnull') == '1' ? '1' : '0');
            /*
            Si hacen falta los XFIELD agregarlos en el script asi:
                $input.attr('data-fill-fields', $input.attr('data-fill-fields') + ', xfield1') 
            */

            if (ctl.attr('searchbar') == '1') {
                f7ctl.params.openIn = 'popup';
                f7ctl.params.searchbar = true;
            }


        // -- DocumentLog --

        } else if (type == 'DOCUMENTLOG') {
            $this = $('<li/>');
            
            $('<div/>', {
                id: ctl['NAME'],
                name: ctl['NAME'],
                class: 'block',
                'data-doclog': 1,
            }).append('Cargando...').appendTo($this);


        // -- HtmlArea --

        } else if (type == 'HTMLAREA') {
            $this = getTextEditor(ctl['NAME'], label);
            $input = $this.find('.text-editor');

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $input.addClass('disabled');
            }

            $input.attr('data-textfield', tf);


        // -- Checkbox --

        } else if (type == 'CHECKBOX') {
            $this = getToggle(ctl['NAME'], label);
            $input = $this.find('input');
            f7ctl = app7.toggle.get($this.find('.toggle')[0]);

            $input.attr('data-textfield', tf);
            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $this.find('.toggle').addClass('disabled');
            }


        // -- Hidden --

        } else if (type == 'HIDDEN') {
            $this = $('<input/>', {
                type: 'hidden',
                name: ctl['NAME'],
                id: ctl['NAME'],
                'data-textfield': tf
            })


        // -- Fieldset --

        } else if (type == 'FIELDSET') {
            $this = getCollapsible(ctl['NAME'], ctl['DESCRIPTION']);

            var $ul = $('<ul/>')
            await renderControls($ul, ctl['NAME']);

            if ($ul.html()) {
                $('<div/>', {
                    class: 'list no-hairlines-md',
                    style: 'margin-top: 0;',
                }).append($ul).appendTo($this.find('.accordion-item-content'));
            }


        // -- SelectMultiple --

        } else if (type == 'SELECTMULTIPLE') {
            $this = getSmartSelect(ctl['NAME'], label, true);
            $input = $this.find('select');
            f7ctl = app7.smartSelect.get($this.find('.smart-select')[0]);

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $this.find('.smart-select').addClass('disabled');
            }

            if (ctl.attr('searchbar') == '1') {
                f7ctl.params.openIn = 'popup';
                f7ctl.params.searchbar = true;
            }


        // -- SelectMultipleFolder --

        } else if (type == 'SELECTMULTIPLEFOLDER') {
            $this = getSmartSelect(ctl['NAME'], label, true);
            $input = $this.find('select');
            f7ctl = app7.smartSelect.get($this.find('.smart-select')[0]);

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $this.find('.smart-select').addClass('disabled');
            }

            $input.attr('data-textfield', tf);
            $input.attr('data-valuefield', vf);

            $input.attr('data-fill', '1');
            $input.attr('data-fill-folder', ctl.attr('searchfolder'));
            $input.attr('data-fill-fields', ctl.attr('fieldlist'));
            $input.attr('data-fill-formula', ctl.attr('searchfilter'));
            $input.attr('data-fill-order', ctl.attr('searchorder'));
            $input.attr('data-fill-withoutnothing', '1');

            if (ctl.attr('searchbar') == '1') {
                f7ctl.params.openIn = 'popup';
                f7ctl.params.searchbar = true;
            }


        // -- LookupboxAccounts --

        } else if (type == 'LOOKUPBOXACCOUNTS') {
            $this = getSmartSelect(ctl['NAME'], label, ctl.attr('mode') == '2');
            $input = $this.find('select');
            f7ctl = app7.smartSelect.get($this.find('.smart-select')[0]);

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $this.find('.smart-select').addClass('disabled');
            }

            $input.attr('data-textfield', tf);
            $input.attr('data-valuefield', vf);

            aux = '(disabled = 0 or disabled is null) and system = 0';
            if (ctl.attr('formula')) {
                aux = aux + ' and (' + ctl.attr('formula') + ')';
            }
            $input.attr('data-fill', '1');
            $input.attr('data-fill-folder', 'accounts');
            $input.attr('data-fill-formula', aux);
            $input.attr('data-fill-order', 'name');
            $input.attr('data-fill-withoutnothing',
                (ctl.attr('withoutnull') == '1' || ctl.attr('mode') == '2') ? '1' : '0');

            if (ctl.attr('searchbar') == '1') {
                f7ctl.params.openIn = 'popup';
                f7ctl.params.searchbar = true;
            }


        // -- Autocomplete --

        } else if (type == 'AUTOCOMPLETE') {
            // todo: faltan editurl y addurl

            $this = getAutocomplete(ctl['NAME'], label, {
                folder: ctl.attr('searchfolder'),
                rootFolder: folder.rootFolderId,
                searchFields: ctl.attr('searchfields'),
                extraFields: ctl.attr('returnfields'),
                formula: ctl.attr('searchfilter'),
                order: ctl.attr('searchorder'),
            }, ctl.attr('mode') == '1');

            $input = $this.find('[data-autocomplete]');
            f7ctl = app7.autocomplete.get($input[0]);

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                if ($input[0].tagName == 'INPUT') {
                    inputReadonly($input, true);
                } else {
                    $input.addClass('disabled');
                }
            }

            $input.attr('data-textfield', tf)
            f7ctl.params.textSource = ctl.attr('textsource');

            $('<input/>', {
                type: 'hidden',
                'data-valuefield': vf,
            }).appendTo($this);
            f7ctl.params.valueSource = ctl.attr('valuesource');

            $('<input/>', {
                type: 'hidden',
                'data-xmlfield': ctl.attr('xmlfield'),
            }).appendTo($this);

            f7ctl.on('change', function (value) {
                var self = this;

                if (self.inputEl) {
                    // Dropdown (simple)
                    var $li = $(self.inputEl).closest('li')
                } else {
                    // Popup (multiple)
                    var $li = $(self.openerEl).closest('li')
                    var $t = $(self.openerEl).find('.item-after');
                    var ts = self.params.textSource.toUpperCase();
                    var ta = [];
                }
                var $v = $li.find('[data-valuefield]');
                var vs = self.params.valueSource.toUpperCase();
                var va = [];

                var $x = $li.find('[data-xmlfield]');
                var dom = $.parseXML('<root/>');

                if (value.length > 0) {
                    var $it;
                    value.forEach(el => {
                        va.push(el[vs]);
                        if ($t) ta.push(el[ts]);
                        var $it = $('<item/>', dom);
                        Object.keys(el).forEach(prop => {
                            $it.attr(prop.toLowerCase(), el[prop]);
                        });
                        $it.appendTo(dom.documentElement);
                    })
                    $v.val(va.join(';'));
                    if ($t) $t.html(ta.join(';'));
                    $x.val((new XMLSerializer()).serializeToString(dom));

                } else {
                    $v.val('');
                    $x.val('');
                    if ($t) $t.empty();
                };
            });


        // -- Attachments --

        } else if (type == 'ATTACHMENTS') {
            $this = getAttachments(ctl['NAME'], label);
            $this.find('.list').on('click', 'a.item-content', downloadAtt);
            $this.on('swipeout:deleted', 'li.swipeout', deleteAtt);
            $this.find('div.row').on('click', 'button', addAtt);

            if (ctl['W'] == 0 || ctl.attr('readonly') == '1') {
                $this.attr('readonly', true);
                $this.find('div.row').hide();
            }

            // El TAG se setea en el APP7_SCRIPT asi:
            // $this.attr('data-attachments', 'miTag');


        } else if (type == 'TIMEINTERVAL') {
            /*
            Set this = getTimeInterval (oNode, oProperties)
            executeScriptBeforeRender oNode
            If oNode.getAttribute("w") & "" <> "1" Then this.Readonly = True
            oStrBuilder.Append getLabel(oNode)
            */

        } else if (type == 'LINK') {
            /*
            Set this = getLink (oNode, oProperties)
            executeScriptBeforeRender oNode
            If oNode.getAttribute("w") & "" <> "1" Then this.Readonly = True
            oStrBuilder.Append "<label style='width:100%'> </label>"
            */

        } else if (type == 'BUTTONSBAR') {
            /*
            Set this = getButtonsBar(oNode, oProperties)
            executeScriptBeforeRender oNode
            'If oNode.getAttribute("w") & "" <> "1" Then this.Readonly = True
            'oStrBuilder.Append this.Render
            */

        } else if (type == 'BUTTON') {
            /*
            Set this = getButton(oNode, oProperties)
            executeScriptBeforeRender oNode
            If oNode.getAttribute("w") & "" <> "1" Then this.Readonly = True
            */
        }

        try {
            if (ctl['APP7_SCRIPT']) await evalCode(ctl['APP7_SCRIPT']);
        } catch (err) {
            console.error(err);
            toast(ctl['NAME'] + ' error: ' + dSession.utils.errMsg(err));
        }
        /*
        Objetos disponibles en este script:
            doc: El objeto Document que se esta abriendo
            folder: La carpeta actual
            controlsFolder: La carpeta de controles
            controls: El search a la carpeta de controles completo
            ctl: El row del control que se esta dibujando
            ctl.attr: Function que devuelve un atributo de XMLATTRIBUTES
            $this: El control completo JQuery (inluido el <li>)
            $input: El input, textarea, select, etc, dentro del control
                (puede ser undefined en caso de los raw y otros)
            f7ctl: El control Framework7 (depende del control)
            textField: El objeto Field bindeado con textField (depende del control)
            valueField: El objeto Field bindeado con valueField (depende del control)
        */

        if ($this) $this.appendTo(pCont);
    }

    // evalCode con context de renderControls
    async function evalCode(code) {
        var pipe = {};
        eval(`pipe.fn = async () => {\n\n${code}\n};`);
        await pipe.fn();
    }
}

function getDefaultControl(pField) {
    var $ret, $input;

    if (pField.type == 1) {
        if (pField.length > 0 && pField.length < 500) {
            $ret = getInputText(pField.name, pField.label);
            $input = $ret.find('input');
        } else {
            $ret = getTextarea(pField.name, pField.label);
            $input = $ret.find('textarea');
        }

    } else if (pField.type == 2) {
        $ret = getDTPicker(pField.name, pField.label, 'datetime-local');
        $input = $ret.find('input');

    } else if (pField.type == 3) {
        $ret = getInputText(pField.name, pField.label);
        $input = $ret.find('input');
        $input.attr('data-numeral', numeral.options.defaultFormat);
    };

    if (!pField.updatable) inputReadonly($input, true);
    if ($input) $input.attr('data-textfield', pField.name.toLowerCase())

    return $ret;
}

function pageInit(e, page) {
    f7Page = page;
    pageEl = page.pageEl;

    // En ios el navbar esta fuera del page
    $navbar = (f7Page.navbarEl ? $(f7Page.navbarEl) : $(f7Page.pageEl).find('.navbar'))

    // Validacion de numero
    $get('[data-numeral]').change(function (e) {
        var $this = $(this);
        var n = numeral($this.val());
        if (n.value()) {
            setInputVal($this, n.format($this.attr('data-numeral')));
        } else {
            setInputVal($this, '');
            toast('Ingrese un numero valido');
        }
    });

    // Llena controles Select
    $get('[data-fill]').each(function (ix, el) {
        var $el = $(el);
        $el.removeAttr('data-fill');
        $el.attr('data-filling', '1');
        var fld = $el.attr('data-fill-folder');

        if (fld == 'accounts') {
            fillSelect($el,
                accountsSearch($el.attr('data-fill-formula'), $el.attr('data-fill-order')),
                $el.attr('data-fill-withoutnothing') == '1', 'name', 'accid', 'type').then(
                function (res) {
                    $el.find('option').each(function (ix, el) {
                        var $e = $(el);
                        var type = $e.attr('data-field-type');
                        if (type == '1') {
                            $e.attr('data-option-icon-ios', 'f7:person');
                            $e.attr('data-option-icon-md', 'material:person_outline');
                        } else if (type == '2') {
                            $e.attr('data-option-icon-ios', 'f7:person_2_fill');
                            $e.attr('data-option-icon-md', 'material:group');
                        }
                    })
                }
            );

        } else {
            folder.app.folder($el.attr('data-fill-folder')).then(
                function (fld) {
                    var arrFields, textField, valueField, dataFields;

                    var arrFields = $el.attr('data-fill-fields').split(',');
                    if (arrFields.length > 0) textField = arrFields.shift().trim();
                    if (arrFields.length > 0) valueField = arrFields.shift().trim();
                    if (arrFields.length > 0) dataFields = arrFields.join(',');

                    fillSelect($el,
                        fld.search({ fields: $el.attr('data-fill-fields'),
                            formula: $el.attr('data-fill-formula'), order: $el.attr('data-fill-order')
                        }),
                        $el.attr('data-fill-withoutnothing') == '1', textField, valueField, dataFields
                    );
                },
                function (err) {
                    console.log(err);
                }
            )
        }
    });

    // Bug de fecha read-only de Safari
    // https://stackoverflow.com/questions/25928605/in-ios8-safari-readonly-inputs-are-handled-incorrectly
    if (device.platform == 'iOS') {
        $get('input[type=\'date\'][readonly], input[type=\'time\'][readonly], input[type=\'datetime-local\'][readonly]')
            .focus(function (e) {
                $(this).trigger('blur');
            }
        );
    }

    // Espera que se terminen de llenar todos los controles antes de hacer el fill
    setTimeout(async function waiting() {
        if ($page.find('[data-filling]').length > 0) {
            setTimeout(waiting, 100);
        } else {
            await fillControls();

            // Evento afterPageInit
            $page[0].dispatchEvent(new CustomEvent('afterPageInit'));
            
            app7.preloader.hide();
        }
    }, 0);

    pageEl.crm = {
        fillControls,
        saveDoc,
        fld_id,
        folder,
        folderJson,
        doc_id,
        doc,
        docJson,
        $navbar,
    };
}

// Usar solo despues del pageInit
function $get(pSelector) {
    return $(pSelector, f7Page.pageEl);
}

async function fillControls() {
    if (!doc.isNew) {
        var title = doc.fields('subject').value;
        if (!title) title = 'Doc #' + doc.id;
        $navbar.find('.title').html(title);

        var $docLog = $get('[data-doclog]');
        if ($docLog.length > 0) {
            getDocLog(doc_id, function (table) {
                $docLog.html(table);
            });
        }

    } else {
        $navbar.find('.title').html('Nuevo documento');
        $get('[data-doclog]').empty();
    }

    app7.navbar.size($navbar); // Para que se ajuste bien el titulo

    $get('[data-textfield], [data-valuefield], [data-xmlfield]').each(function (ix, el) {
        var tf, textField, text;
        var vf, valueField, value;
        var xf, xmlField, xml;
        var $el = $(el);

        tf = $el.attr('data-textfield');
        if (tf && tf != '[NULL]') {
            textField = doc.fields(tf);
            text = textField ? textField.value : null;
        };

        vf = $el.attr('data-valuefield');
        if (vf && vf != '[NULL]') {
            valueField = doc.fields(vf);
            value = valueField ? valueField.value : null;
        };

        xf = $el.attr('data-xmlfield');
        if (xf && xf != '[NULL]') {
            xmlField = doc.fields(xf);
            xml = xmlField ? xmlField.value : null;
        };

        if (el.tagName == 'INPUT') {
            var type = $el.attr('type').toLowerCase();
            if (type == 'text') {
                var format = $el.attr('data-numeral');
                if (format) {
                    var n = numeral(text);
                    if (n.value() != null) {
                        setInputVal($el, n.format(format));
                    } else {
                        setInputVal($el, '');
                    }
                } else {
                    if ($el.hasClass('maps-autocomplete')) {
                        el._text(text);
                        el._value(value);
        
                    } else {
                        if (textField && textField.type == 2) {
                            if (text) {
                                setInputVal($el, formatDate(text));
                            } else {
                                setInputVal($el, '');
                            }
                        } else {
                            setInputVal($el, text);
                        }
                    }
                }

            } else if (type == 'date' || type == 'time' || type == 'datetime-local') {
                setDTPickerVal($el, text);

            } else if (type == 'checkbox') {
                el.checked = (text == '1');

            } else if (type == 'hidden') {
                if (textField) {
                    $el.val(text);
                } else if (valueField) {
                    $el.val(value);
                } else if (xmlField) {
                    $el.val(xml);
                }
            }

        } else if (el.tagName == 'TEXTAREA') {
            setInputVal($el, text);

        } else if (el.tagName == 'SELECT') {
            if ($el.attr('multiple')) {
                var t = text ? text.split(';') : null;
                var v = value ? value.split(';') : null;
                setSelectVal($el, t, v);
            } else {
                setSelectVal($el, text, value);
            }

        } else if (el.tagName == 'DIV') {
            if ($el.hasClass('text-editor')) {
                app7.textEditor.get($el[0]).setValue(text);
            }

        } else if (el.tagName == 'A') {
            if ($el.attr('data-autocomplete')) {
                $el.find('.item-after').html(text);
            }
        }
    });

    $get('[data-autocomplete]').each(function (ix, el) {
        var $el = $(el);
        var ac = app7.autocomplete.get($el[0]);
        var $li = $el.closest('li');
        var $v = $li.find('[data-valuefield]');
        var $x = $li.find('[data-xmlfield]');
        if ($x.val()) {
            try {
                var $dom = $($.parseXML($x.val()));
                var values = [];
                $dom.find('item').each(function (ix, el) {
                    var value = {};
                    for (var i = 0; i < el.attributes.length; i++) {
                        var attr = el.attributes[i];
                        value[attr.name.toUpperCase()] = attr.value;
                    };
                    values.push(value);
                });
                ac.value = values;

            } catch (err) {
                console.log('Error setting autocomplete value: ' + errMsg(err));
            }
 
        } else if ($el.val() || $v.val()) {
            var txts = ($el.val() != '' ? $el.val().split(';') : []);
            var vals = ($v.val() != '' ? $v.val().split(';') : []);
            var values = [];
            var ts = ac.params.textSource.toUpperCase();
            var vs = ac.params.valueSource.toUpperCase();
            var i = 0;
            while (txts[i] != undefined || vals[i] != undefined) {
                var value = {};
                if (ts && txts[i] != undefined) {
                    value[ts] = txts[i];
                }
                if (vs && vals[i] != undefined) {
                    value[vs] = txts[i];
                }
                values.push(value);
                i++;
            }
            ac.value = values;
 
        } else {
            ac.value = [];
        }
        //ac.emit('change', ac.value);
    })

    // Inicializa los chats de Whatsapp
    var $wappChats = $get('div.wapp-chat');
    if ($wappChats.length > 0) {
        include('whatsapp', function () {
            wapp.ready(function () {
                $wappChats.each(function () {
                    var $this = $(this);
                    setFieldAttr($this, 'data-internal-name');
                    setFieldAttr($this, 'data-internal-number');
                    setFieldAttr($this, 'data-external-name');
                    setFieldAttr($this, 'data-external-number');
                    wapp.init($this);

                    function setFieldAttr(pCont, pAttr) {
                        var field = pCont.attr(pAttr + '-field');
                        if (field) {
                            pCont.attr(pAttr, doc.fields(field).value);
                        }
                    }
                });
            });
        });
    }

    $get('[data-attachments]').each(function (ix, el) {
        fillAttachments($(el));
    });

    try {
        // Evento afterFillControls
        $page[0].dispatchEvent(new CustomEvent('afterFillControls'));

        // Control Event AfterRender
        var ev = getEvent('AfterRender');
        if (ev) await evalCode(ev);

    } catch (err) {
        console.error(err);
        toast('AfterRender error: ' + dSession.utils.errMsg(err));
    }
}

async function fillAttachments(pEl) {
    var $ul = pEl.find('ul');
    $ul.empty();

    var readonly = pEl.attr('readonly') ? true : false;
    var tag = pEl.attr('data-attachments').toLowerCase();

    if (doc_id) {
        var atts = await doc.attachments();
        for (let [key, att] of atts) {
            //if (tag == 'all' || (att.group && att.group.toLowerCase() == tag)) { // todo: tiene q quedar esta cdo este group
            if (tag == 'all' || (att.description && att.description.toLowerCase() == tag)) {
                getAttachment(att, readonly).appendTo($ul);
            }
        }
    } else {
        noAttachs();
    }

    function noAttachs() {
        // Agrega la leyenda Sin adjuntos
        var $li = $('<li/>').appendTo($ul);

        var $itemCont = $('<div/>', {
            class: 'item-content',
        }).appendTo($li);

        var $itemInner = $('<div/>', {
            class: 'item-inner',
        }).appendTo($itemCont);

        var $itemTitle = $('<div/>', {
            class: 'item-title',
            style: 'white-space: normal;',
        }).appendTo($itemInner);

        $itemTitle.append('Sin adjuntos');
    }
}

async function downloadAtt(e) {
    var $att = $(this);
    var attId = $att.attr('data-att-id');
    var attName = $att.attr('data-att-name');
    var attURL = $att.attr('data-att-url');

    if (attURL) {
        // Ya se descargo antes o es nuevo
        openAtt(attURL);

    } else {
        app7.preloader.show();

        try {
            var att = (await doc.attachments()).find(el => el.id == attId);
            var fs = await att.fileStream;

            app7.preloader.hide();

            var blob = new Blob([fs]);

            if (device.platform == 'browser') {
                saveAs(blob, attName);

            } else {
                cacheDir.getFile(attName, { create: true },
                    function (file) {
                        file.createWriter(
                            function (fileWriter) {
                                fileWriter.onwriteend = function (e) {
                                    $att.attr('data-att-url', file.toURL());
                                    openAtt(file.toURL());
                                };

                                fileWriter.onerror = function (err) {
                                    console.error('fileWriter error: ' + errMsg(err));
                                };

                                fileWriter.write(blob);
                            },
                            function (err) {
                                logAndToast('createWriter error: ' + errMsg(err));
                            }
                        )
                    },
                    function (err) {
                        logAndToast('getFile error: ' + errMsg(err));
                    }
                )
            }

        } catch(err) {
            app7.preloader.hide();
            logAndToast('download att error: ' + errMsg(err))
        }
    }
}

function openAtt(pURL) {
    if (pURL.substring(0, 10) == 'cdvfile://' || pURL.includes("__cdvfile_")) {
        window.resolveLocalFileSystemURL(pURL,
            function (fileEntry) {
                openFile(fileEntry.nativeURL);
            },
            function (err) {
                logAndToast('resolveLocalFileSystemURL error: ' + errMsg(err));
            }
        )
    } else {
        openFile(pURL);
    }

    function openFile(pFile) {
        // Abre el archivo con fileOpener2
        cordova.plugins.fileOpener2.open(pFile, undefined, {
            success: function () {
                console.log('File opened');
            },
            error: function (err) {
                logAndToast('fileOpener2 error: ' + err.message);
            },
        });
    }
}

function deleteAtt(e) {
    var $this = $(this);
    var $att = $this.find('a.item-link');
    
    if ($att.attr('data-att-action') == 'save') {
        // Era uno nuevo, lo vuelo
        $this.remove();
    } else {
        $att.attr('data-att-action', 'delete');
    }
}

function addAtt(e) {
    var $this = $(this);
    var $attachs = $this.closest('li');
    var action = $this.attr('id');
    var att = {};

    if (action == 'camera') {
        navigator.camera.getPicture(
            function (fileURL) {
                getFile(fileURL).then(
                    function (file) {
                        att.URL = file.localURL;
                        att.Name = file.name;
                        att.Size = file.size;
                        renderNewAtt(att, $attachs);
                    },
                    errMgr
                )
            },
            errMgr,
            cameraOptions(Camera.PictureSourceType.CAMERA)
        )

    } else if (action == 'photo') {
        navigator.camera.getPicture(
            function (fileURL) {
                getFile(fileURL).then(
                    function (file) {
                        att.URL = file.localURL;
                        att.Name = file.name;
                        att.Size = file.size;
                        renderNewAtt(att, $attachs);
                    },
                    errMgr
                )
            },
            errMgr,
            cameraOptions(Camera.PictureSourceType.PHOTOLIBRARY)
        );
        
    } else if (action == 'doc') {
        if (device.platform == 'browser') {

            // El input para leer archivos
            let $file = $('<input/>', {
                type: 'file',
                style: 'display: none;'
            }).appendTo(document.body);

            $file.change(function (e) {
                let inp = e.target;
                if (inp.files.length > 0) {
                    var file = inp.files[0];
                    att.File = file;
                    att.Name = file.name;
                    att.Size = file.size;
                    renderNewAtt(att, $attachs);
                }
                $file.remove();
            })

            $file.click();
    
        } else {
            chooser.getFileMetadata().then(
                function (res) {
                    if (res) {
                        getFile(res.uri).then(
                            function (file) {
                                att.URL = file.localURL;
                                att.Name = res.name;
                                att.Size = file.size;
                                renderNewAtt(att, $attachs);
                            },
                            errMgr
                        )
                    }
                },
                errMgr
            )
        }
        
    } else if (action == 'audio') {
        audioRecorder(function (file) {
            var att = {};
            att.URL = file.localURL;
            att.Name = file.name;
            att.Size = file.size;
            renderNewAtt(att, $attachs);
        });
    };

    function errMgr(pErr) {
        logAndToast(errMsg(pErr));
    };
}

function renderNewAtt(pAtt, pCont) {
    pAtt.AccId = dSession.loggedUser()['AccId'];
    pAtt.AccName = dSession.loggedUser()['Name'];
    var $li = getAttachment(pAtt);
    var $att = $li.find('a.item-link');
    if (pAtt.URL) {
        $att.attr('data-att-url', pAtt.URL);
    } else if (pAtt.File) {
        $att[0]._file = pAtt.File;
    }
    $att.attr('data-att-action', 'save');
    $li.prependTo(pCont.find('ul'));
}

async function saveDoc(exitOnSuccess) {
    if (saving) return;
    saving = true;
    $navbar.find('.right .button').addClass('disabled');
    app7.preloader.show();

    $get('[data-textfield]').each(function (ix, el) {
        var $el = $(el);
        var field = doc.fields($el.attr('data-textfield'));

        if (field && field.updatable) {
            if (el.tagName == 'INPUT') {
                var type = $el.attr('type').toLowerCase();
                if (type == 'text') {
                    if ($el.attr('data-numeral')) {
                        field.value = numeral($el.val()).value();
                    } else {
                        field.value = $el.val();
                    };

                } else if (type == 'date' || type == 'time' || type == 'datetime-local') {
                    field.value = getDTPickerVal($el);

                } else if (type == 'checkbox') {
                    field.value = el.checked ? '1' : '0';

                } else if (type == 'hidden') {
                    field.value = $el.val();
                }

            } else if (el.tagName == 'SELECT') {
                var aux = getSelectText($el);
                field.value = Array.isArray(aux) ? aux.join(';') : aux;

            } else if (el.tagName == 'DIV') {
                if ($el.hasClass('text-editor')) {
                    field.value = app7.textEditor.get($el[0]).getValue();
                }

            } else if (el.tagName == 'A') {
                if ($el.attr('data-autocomplete')) {
                    field.value = $el.find('.item-after').html();
                }
            } else if(el.tagName == 'TEXTAREA') {
                field.value = $el.val();
            }
        }
    });

    $get('[data-valuefield]').each(function (ix, el) {
        var $el = $(el);
        var field = doc.fields($el.attr('data-valuefield'));

        if (field && field.updatable) {
            if (el.tagName == 'SELECT') {
                var aux = getSelectVal($el);
                field.value = Array.isArray(aux) ? aux.join(';') : aux;

            } else if (el.tagName == 'INPUT') {
                if ($el.hasClass('maps-autocomplete')) {
                    field.value = el._value();

                } else {
                    var type = $el.attr('type').toLowerCase();
                    if (type == 'hidden') {
                        field.value = $el.val();
                    }
                }
            }
        }
    });

    $get('[data-xmlfield]').each(function (ix, el) {
        var $el = $(el);
        var field = doc.fields($el.attr('data-xmlfield'));

        if (field && field.updatable) {
            if (el.tagName == 'INPUT') {
                var type = $el.attr('type').toLowerCase();
                if (type == 'hidden') {
                    field.value = $el.val();
                }
            }
        }
    });

    try {
        // Evento beforeSave
        $page[0].dispatchEvent(new CustomEvent('beforeSave'));

        // Control Event BeforeSave
        var ev = getEvent('BeforeSave');
        if (ev) await evalCode(ev);

        await doc.save();
        docJson = doc.toJSON();
        doc_id = doc.id;

        pageEl.crm.doc = doc;
        pageEl.crm.doc_id = doc.id;
        pageEl.crm.saved = true;

        try {
            await saveAtt();
        } catch (err) {
            var attErr = 'Algunos adjuntos no pudieron guardarse, consulte la consola para mas informacion';
            console.log(attErr);
            console.log(err);
        }

        try {
            // Evento afterSave
            $page[0].dispatchEvent(new CustomEvent('afterSave'));

            // Control Event AfterSave
            var ev = getEvent('AfterSave');
            if (ev) await evalCode(ev);

        } catch (err) {
            var asErr = 'AfterSave error: ' + dSession.utils.errMsg(err);
            console.error(err);
        }

        saving = false;
        app7.preloader.hide();
        $navbar.find('.right .button').removeClass('disabled');

        if (attErr) {
            toast(attErr, 0);
        } else if (asErr) {
            toast(asErr, 0);
        } else {
            toast('Cambios guardados');
        }

        if (exitOnSuccess) {
            f7Page.view.router.back();
        } else {
            await fillControls();
        }
        
    } catch (err) {
        errMgr(err);
    }

    function errMgr(pErr) {
        saving = false;
        app7.preloader.hide();
        $navbar.find('.right .button').removeClass('disabled');
        toast(dSession.utils.errMsg(pErr).replaceAll('\r\n', '<br>'), 0);
        console.error(pErr);
    }
}

function saveAtt() {
    return new Promise(async (resolve, reject) => {
        var errors = [];
        var $attsToSave = $get('li[data-attachments] [data-att-action]');
        var attMap = await doc.attachments();

        dSession.utils.asyncLoop($attsToSave.length, async loop => {
            var $this = $($attsToSave[loop.iteration()]);
            var tag = $this.closest('li.accordion-item').attr('data-attachments');
            tag = (tag == 'all' ? null : tag);
            var attName = $this.attr('data-att-name');
            var attAction = $this.attr('data-att-action');

            if (attAction == 'save') {
                var file;
                var attUrl = $this.attr('data-att-url');
                if (attUrl) {
                    file = await getFile($this.attr('data-att-url'));
                } else {
                    file = $this[0]._file;
                }
                var reader = new FileReader();
                reader.onloadend = async function (e) {
                    try {
                        var att = doc.attachmentsAdd(file.name);
                        att.fileStream = new Blob([this.result], { type: file.type });
                        att.description = tag;
                        att.group = tag;
                        await att.save();

                    } catch (err) {
                        errors.push({
                            file: attName,
                            action: 'save',
                            error: dSession.utils.errMsg(err),
                        });
                    }
                    loop.next();
                };
                reader.readAsArrayBuffer(file);

            } else if (attAction == 'delete') {
                var att = attMap.find(el => el.id == $this.attr('data-att-id'));
                if (att) {
                    try {
                        await att.delete();
                    } catch (err) {
                        errors.push({
                            file: attName,
                            action: 'delete',
                            error: err,
                        });
                    }
                }
                loop.next();
            }
        }, () => {
            if (errors.length == 0) {
                resolve(true);
            } else {
                reject(errors);
            }
        });

    });
}

function getEvent(pEvent) {
    if (controls) {
        var ev = controls.find(el => el['NAME'] && el['NAME'].toUpperCase() == pEvent.toUpperCase());
        if (ev) return ev['APP7_SCRIPT'];
    }
}

// evalCode con context root
async function evalCode(code) {
    var pipe = {};
    eval(`pipe.fn = async () => {\n\n${code}\n};`);
    await pipe.fn();
}

/*
Function getTimeInterval(pCtlNode, pProps)
	Dim ctl
	Dim vValue
	
	Set ctl = new clsTimeInterval
	
	With ctl
		.name = pCtlNode.getAttribute("name")
		.cssClass ="form-control"
		If pProps.getAttribute("unit") <> "" Then .unit = pProps.getAttribute("unit")
		vValue = getFieldValue(pProps.getAttribute("textfield"))
		IF vValue <> "" Then .text = vValue
	End With
	
	Set getTimeInterval = ctl
End Function

Function getLink (pCtlNode, pProps)
	Dim ctl
	Set ctl = new clsLink
	With ctl
		.name = pCtlNode.getAttribute("name")
		.text = pProps.getAttribute("text")
		.href = pProps.getAttribute("href")
		.target = pProps.getAttribute("target")
		'.imageUrl = pProps.getAttribute("imageurl")
		if pProps.getAttribute("textalways") = "1" then .textalways = true
        If pProps.getAttribute("showtooltip") & "" = "1" And pProps.getAttribute("tooltip") & "" <> "" Then
			.Tooltip = pProps.getAttribute("tooltip")
		End If
	End With
	Set getLink = ctl
End Function

Function getButtonsBar(pCtlNode, pProps)
	Dim ctl
	Set ctl = new clsButtonBar
	With ctl
		.name = pCtlNode.getAttribute("name")
	End With
	Set getButtonsBar = ctl
End Function

Function getButton(pCtlNode, pProps)
	Dim ctl
	Set ctl = new clsButton
	With ctl
		.name = pCtlNode.getAttribute("name")
		.text = pProps.getAttribute("text")
        If pProps.getAttribute("showtooltip") & "" = "1" And pProps.getAttribute("tooltip") & "" <> "" Then
			.Tooltip = pProps.getAttribute("tooltip")
		End If
	End With
	Set getButton = ctl
End Function
*/