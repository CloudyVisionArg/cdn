// todo: recibir una señal de refresh, dps de modif un doc

let folder2;

var folder, f7Page, pageEl;
var $page, $navbar, $subnavbar, $title, $views, $pageCont, $viewDiv;
var searchBar, docActions, actionsPopup, fldActions;

var fld_id = routeTo.query.fld_id;
var forceOnline = routeTo.query.online;
var arrOfflineCols;
if (!forceOnline) {
    sync.getDbFields('folder_' + fld_id, function (cols) {
        arrOfflineCols = cols;
    });
}
var selectionMode = false;

var propEditPage = 'App7_editPage';
var propViewItemRenderer = 'App7_viewItemRenderer';
var propFldActions = 'App7_fldActions';
var propDocActions = 'App7_docActions';
var propViewsFilter = 'App7_viewsFilter';
var propInit = 'App7_explorerInit';
var propImport = 'App7_import';
var maxLen = 200;

(async () => {
    folder2 = await dSession.folder(fld_id);
    folder = folder2.toJSON();
    getFolderElements(folder);



    await Promise.all(proms);
    debugger;
})();

actionsPopup = getActionsPopup();


dSession.foldersGetFromId(fld_id).then(
    function (fld) {
        folder = fld.toJSON(); // TODO: cambiar a doorsapi2
        getFolderElements(folder);

        // -- Documents Folder --

        if (folder.Type == 1) {
            $page = getPage({
                id: 'explorer_' + getGuid(),
                title: (folder.Description ? folder.Description : folder.Name),
                leftbutton: 'search',
                rightbutton: 'menu',
                searchbar: 2,
                subnavbar: true,
                pulltorefresh: true,
            });

            var $nbLeft = $page.find('.navbar-inner .left');
            
            // Boton Buscar
            var $btn = $page.find('.navbar-inner .left .link')
            $btn.attr('id', 'buttonSearch');
            $btn.click(function (e) {
                searchBar.enable();
            });

            if (routeTo.query.back == '1') {
                $btn.css('margin-left', '0px');

                // Boton Back
                var $backBtn = $('<a/>', {
                    href: '#',
                    class: 'link icon-only',
                }).prependTo($nbLeft);
                $backBtn.append('<i class="f7-icons ios-only">chevron_left</i>' + 
                    '<i class="material-icons md-only">arrow_back</i>');

                $backBtn.click(function () {
                    f7Page.view.router.back();
                });
            }
            
            // Boton Acciones
            $btn = getLink({ iosicon: 'menu', mdicon: 'menu' });
            $btn.attr('id', 'buttonActions');
            $btn.appendTo($page.find('.navbar-inner .left'));
            $btn.on('click', function (e) {
                docActions.open();
            });
            $btn.css('margin-left', '0px');
            $btn.hide();
            
            // Inicializa el Searchbar
            var timeout;
            searchBar = app7.searchbar.create({
                el: $page.find('form.searchbar')[0],
                customSearch: true,
                on: {
                    search: function (e, query, previousQuery) {
                        // Espera un rato antes de buscar
                        clearTimeout(timeout);
                        timeout = setTimeout(function () {
                            var $input = $(e.$inputEl[0]);
                            $input.prop('readonly', true);
                            reloadView(function () {
                                $input.prop('readonly', false);
                            });
                        }, 800);
                    },
                    enable: function (sb) {
                        // Si le doy el foco de una se corre la pantalla
                        setTimeout(function () { sb.inputEl.focus(); }, 200);
                    }
                }
            });
            
            // Boton Menu (fldActions)
            $btn = $page.find('.navbar-inner .right .link')
            $btn.attr('id', 'buttonMenu');
            $btn.on('click', function (e) {
                fldActions.open();
            });

            // Boton Nuevo - fab
            var $fab = $('<div/>', {
                id: 'fabAdd',
                class: 'fab fab-right-bottom',
            }).appendTo($page);

            $btn = $('<a/>', {
                href: '#',
            }).appendTo($fab);

            $btn.append('<i class="icon f7-icons">plus</i>');
            $btn.on('click', newDoc);

            // Boton Cancelar Selection Mode
            $btn = getLink({ text: 'Cancelar' });
            $btn.attr('id', 'buttonCancel');
            $btn.appendTo($page.find('.navbar-inner .right'));
            $btn.on('click', function (e) {
                toggleSelectionMode();
            });
            $btn.hide();
            
            // Vistas (Smart Select)
            $subnavbar = $page.find('.subnavbar');
            
            $subnavbar.append(`
            <div class="subnavbar-inner no-padding">
                <div class="list" style="width: 100%;">
                    <ul/>
                </div>
            </div>
            `);
            
            getSmartSelect(null, 'Vista').appendTo($subnavbar.find('ul'));
            $views = $subnavbar.find('select');
            $views.change(function (e) {
                if ($(this).val() != '-1') {
                    window.localStorage.setItem('folderView_' + fld_id, $(this).val());
                    reloadView();
                }
            });
            // Fin Vistas

            $pageCont = $page.find('.page-content');
            
            // Evento del Pull To Refresh
            $pageCont.on('ptr:refresh', function (e) {
                if (selectionMode) {
                    toast('Refresh disabled in selection mode');
                } else {
                    reloadView();
                }
                e.originalEvent.detail(); // done
            });
            
            // Accordion Ajax
            $viewDiv = $('<div/>', {
                class: 'accordion-ajax',
            }).appendTo($pageCont);
            // Setea la funcion que carga el acordion (ver f7AppEvents en global.js)
            $viewDiv[0].loadAccordionContent = loadViewSection;
            
            $viewDiv.on('click', 'a', function (e) {
                var $list = $(this).closest('div.list');
                if ($list.hasClass('media-list')) {
                    if ($list.attr('clicked') != 1) {
                        $list.attr('clicked', 1);
                        var $li = $(this).closest('li');
                        var doc_id = $li.attr('doc_id');
                        var prop = findProp(folder.UserProperties, propEditPage);
                        if (prop == undefined) prop = findProp(folder.Properties, propEditPage);
                        if (prop == undefined) prop = findProp(folder.Form.Properties, propEditPage);
                        if (prop) {
                            prop += (prop.indexOf('?') >= 0 ? '&' : '?');
                            if (prop.indexOf('fld_id=') < 0) prop += 'fld_id=' + fld_id + '&';
                            f7Page.view.router.navigate(prop + 'doc_id=' + doc_id);
                        } else {
                            f7Page.view.router.navigate(formUrlRoute(folder.Form.UrlRaw) + '?fld_id=' + fld_id + '&doc_id=' + doc_id);
                        }
                        $li.addClass('refresh-on-focus');
                        $list.removeAttr('clicked');
                    }
                }
            });
            
            // Evento taphold
            if (device.platform == 'browser' || device.platform == 'Android') {
                // El taphold no anda en el browser
                // En Android tampoco funciona el taphold
                $viewDiv.on('contextmenu', 'a', taphold);
            } else {                 
                $viewDiv.on('taphold', 'a', taphold);
            };
            
            // Fin Accordion Ajax

        
        // -- Link Folder --

        } else if (folder.Type == 2) {
            $page = getPage({
                id: 'explorer_' + getGuid(),
                title: folder.Description ? folder.Description : folder.Name,
                pulltorefresh: true,
            });

            $pageCont = $page.find('.page-content');
            //todo: cargar la pag en iframe (ver codelib pruebas)
            
            // Evento del Pull To Refresh
            $pageCont.on('ptr:refresh', function (e) {
                toast('todo: refrescar la pagina');
                e.originalEvent.detail(); // done
            });
        }

        // Seleccion de Folder en el Titulo
        $title = $page.find('.title');
        if (routeTo.query.fixed == '0') {
            $title.css('cursor', 'pointer');
            $title.click(function () {
                var fld = prompt('Ingrese el fldId'); // todo: mostrar popup con el treeview para elegir la carpeta
                if (fld) f7Page.view.router.navigate('/explorer/?fld_id=' + fld + '&fixed=0&back=1');
            });
        }

        // Espera que se termine de llenar el Folder y resuelve
        setTimeout(function waiting() {
            if (folder.pendingCalls) {
                setTimeout(waiting, 100);
            } else {
                resolveRoute({ resolve: resolve, pageEl: $page, pageInit: pageInit });
            }
        }, 0);
    },

    function (err) {
        console.log(err);
        throw err;
    }
);

// Crea un nuevo documento
function newDoc(e) {
    var prop = findProp(folder.Properties, propEditPage);
    if (!prop) prop = findProp(folder.Form.Properties, propEditPage);
    if (prop) {
        f7Page.view.router.navigate(prop);
    } else {
        f7Page.view.router.navigate(formUrlRoute(folder.Form.UrlRaw) + '?fld_id=' + fld_id);
    };
    $viewDiv.addClass('refresh-on-focus');
}
            
function pageInit(e, page) {
    f7Page = page;
    pageEl = page.pageEl;
    pageEl.drs = {};
    pageEl.crm = pageEl.drs; // bg compat

	// En ios el navbar esta fuera del page
    $navbar = (f7Page.navbarEl ? $(f7Page.navbarEl) : $(f7Page.pageEl).find('.navbar'));

    if (folder.Type == 1) {
        // Carga el Select de vistas
        var $option, arrFil, privSep = false;

        var fil = findProp(folder.Properties, propViewsFilter);
        if (fil) {
            arrFil = fil.split(',');
            arrFil.forEach(function (el, ix) { arrFil[ix] = parseInt(el); });
        }

        folder.Views.forEach(view => {
            if (view['Private'] && !privSep) {
                // Separador
                $option = $('<option/>', { 'value': '-1' });
                $option.html('--- Vistas privadas ---');
                $option.appendTo($views);
                privSep = true;
            }
            if (view['Private'] || !arrFil || arrFil.find(function (el) { return el == view['VieId']; })) {
                $option = $('<option/>', { 'value': view['VieId'] });
                $option.html(view['Description'] ? view['Description'] : view['Name']);
                $option.appendTo($views);
            }
        })

        setSelectVal($views, null, window.localStorage.getItem('folderView_' + fld_id), 0);

        // Acciones de carpeta
        var stdFldActions = [
            {
                text: 'Nuevo documento',
                onClick: newDoc,
            },
            {
                text: 'Pivotear',
                onClick: () => {
                    f7Page.view.router.navigate('/ghcv/Global/client/pivotable.js/?fld_id=' + fld_id);
                },
            },
            {
                text: 'Importar desde Excel',
                onClick: () => {
                    f7Page.view.router.navigate('/cdn/?script=app7-import&fld_id=' + fld_id);
                },
            },
            {
                text: 'Ayuda',
                onClick: () => {
                    let url = 'https://docs.google.com/document/d/e/2PACX-1vTuWhEtDMWT9z6wCxrhyBUwxVzAUgZtTj_b8x4vuJFYQZQXg9sDJKkgf4V6Ew5fOn5my02XJMmSDWja/pub';
                    cordova.InAppBrowser.open(url, '_system', 'location=yes');
                },
            },
            {
                text: 'Cancelar',
                color: 'red',
                close: true,
            },
        ];

        var prop = findProp(folder.Properties, propImport);
        if (prop) {
            try { var importProp = JSON.parse(prop) } catch(err) { console.error(err) };
            if (importProp && importProp.disabled) {
                stdFldActions.splice(1, 1);
            }
        }

        if (!fldActions) fldActions = app7.actions.create({ buttons: stdFldActions });

        var prop = findProp(folder.Properties, propFldActions);
        if (!prop) prop = findProp(folder.Form.Properties, propFldActions);
        if (prop) {
            evalCode(prop).then(
                function (res) {
                    if (Array.isArray(res)) {
                        fldActions = app7.actions.create({ buttons: [res, stdFldActions] });
                    }
                },
                function (err) { console.error(err) }
            )
        }


        // Acciones de documento
        var stdDocActions = [
            {
                text: 'Borrar',
                onClick: deleteClick,
            },
            {
                text: 'Cancelar',
                color: 'red',
                close: true,
            },
        ];

        if (!docActions) docActions = app7.actions.create({ buttons: stdDocActions });

        var prop = findProp(folder.Properties, propDocActions);
        if (!prop) prop = findProp(folder.Form.Properties, propDocActions);
        if (prop) {
            evalCode(prop).then(
                function (res) {
                    if (Array.isArray(res)) {
                        docActions = app7.actions.create({ buttons: [res, stdDocActions] });
                    }
                },
                function (err) { console.error(err) }
            )
        }


        // Evento Init
        var prop = findProp(folder.Properties, propInit);
        if (!prop) prop = findProp(folder.Form.Properties, propInit);
        if (prop) {
            try {
                eval(prop);
            } catch (err) {
                console.log('Error in explorerInit: ' + errMsg(err));
            }
        };

    } else if (folder.Type == 2) {

        // todo: ver como pasamos las credenciales
        var $iframe = $('<iframe/>', {
            height: '100%',
            width: '100%',
            src: folder.Href
        }).appendTo($pageCont);
        
        $iframe.on('load', function (e) {
            //debugger;
        })
    }

    if (!pageEl.drs) pageEl.drs = {};
    Object.assign(pageEl.drs, {
        reloadView, toggleSelectionMode, refreshOnFocus,
        folder, $navbar, import: importProp, f7Page,
    });
    pageEl.crm = pageEl.drs; // bg compat
}

function taphold(e) {
    var $list = $(this).closest('div.list');
    if ($list.hasClass('media-list')) {
        var $li = $(this).closest('li');
        toggleSelectionMode();
        $li.find('input:checkbox').prop('checked', true);
    };
};


function toggleSelectionMode() {
    var $itemContent;

    if (selectionMode) {
        // Desactivar
        selectionMode = false;

        $get('.media-list label.item-checkbox.item-content').replaceWith(function () {
            var $itemContent = getItemContent();
            $itemContent.append($(this).children(':not(input:checkbox, i.icon-checkbox)'));
            return $itemContent;
        });

        if (searchBar.enabled) {
            $navbar.addClass('with-searchbar-expandable-enabled');
            searchBar.$el.show();
        }
        $views.parent().removeClass('disabled');
        $navbar.find('#buttonSearch').show();
        $navbar.find('#buttonMenu').show();
        $navbar.find('#buttonActions').hide();
        $navbar.find('#buttonCancel').hide();

    } else {
        // Activar
        selectionMode = true;

        $get('.media-list a.item-link.item-content').replaceWith(function () {
            $itemContent = getItemContent();
            $itemContent.append($(this).contents());
            return $itemContent;
        });

        if (searchBar.enabled) {
            searchBar.$el.hide();
            $navbar.removeClass('with-searchbar-expandable-enabled');
        }
        $views.parent().addClass('disabled');
        $navbar.find('#buttonSearch').hide();
        $navbar.find('#buttonMenu').hide();
        $navbar.find('#buttonActions').show();
        $navbar.find('#buttonCancel').show();
    }

    app7.navbar.size($navbar);
}

function searchLimit() {
    var ret = window.localStorage.getItem('explorerLimit');
    return ret ? ret : 200;
}

function evalCode(pCode) {
    return new Promise(async function (resolve, reject) {
        var pipe = {};
        eval(`pipe.fn = async (resolve, reject) => { ${ pCode }\n};`);
        pipe.fn(resolve, reject);
    });
}

// Usar solo despues del pageInit
function $get(pSelector) {
	return $(pSelector, f7Page.pageEl);
}

function reloadView(pCallback) {
    $viewDiv.empty();

    DoorsAPI.viewsGetById(fld_id, $views.val()).then(
        function (view) {
            getRenderer(view, folder, function (renderer) {
                view.ItemRenderer = renderer;
                $viewDiv[0].view = view;
                loadViewSection($viewDiv, pCallback);
            });
        },
        function (err) {
            console.log(err);
            $viewDiv.html('Error: ' + errMsg(err));
            if (pCallback) pCallback();
        }
    )
}

function loadViewSection(pContainer, pCallback) {
    var level, levelDrill, i, view, formula, order;

    app7.preloader.show();
    view = $viewDiv[0].view;

    if (view.Definition.CustomizedFormula) {
        formula = view.Definition.Formula;
    } else {
        var arrFils = [];
        view.Definition.Filters.Items.forEach(it => {
            var fieldObj = getFormField(folder.Form, it.Field);
            arrFils.push(it.Field + ' ' + it.Operator + ' ' + sqlEncode(it.Value, fieldObj.Type));
        });
        formula = arrFils.join(' and ');
    }
    formula = (formula ? '(' + formula + ')' : '');

    // Calcula el nivel y la formula de drill
    var $parents = pContainer.parents('li.accordion-item');
    level = $parents.length + 1;
    levelDrill = '';
    $parents.each(function (index) {
        var field = view.Definition.Groups.Items[level - 2 - index].Field;
        levelDrill += ' and ' + field;
        var value = $(this).attr('value');
        if (value == '__NULL__') {
            levelDrill += ' is null';
        } else {
            var fieldObj = getFormField(folder.Form, field);
            levelDrill += ' = ' + sqlEncode(value, fieldObj['Type']);
        };
    });
    if (levelDrill) {
        levelDrill = levelDrill.substring(5);
        if (formula) formula += ' and ';
        formula += '(' + levelDrill + ')';
    }

    // Filtro del searchBar
    if (searchBar.query) {
        var query = searchBar.query;
        if (formula) formula += ' and ';
        formula += '(' + textSearch(query) + ')';
    }

    if (view.Definition.Groups.Items.length < level) {
        //Search
        var arrFields = [];
        var field;
        for (i = 0; i < view.Definition.Fields.Items.length; i++) {
            field = view.Definition.Fields.Items[i].Field.toUpperCase();
            if (arrFields.indexOf(field) == -1) arrFields.push(field);
        };
        for (i = 0; i < view.StyleScriptDefinition.Fields.length; i++) {
            field = view.StyleScriptDefinition.Fields[i].toUpperCase();
            if (arrFields.indexOf(field) == -1) arrFields.push(field);
        };
        if (!view.StyleScriptDefinition.Override) {
            for (i = 0; i < view.StyleScriptDefinition.InheritedFields.length; i++) {
                field = view.StyleScriptDefinition.InheritedFields[i].toUpperCase();
                if (arrFields.indexOf(field) == -1) arrFields.push(field);
            };
        }
        if (arrFields.indexOf('DOC_ID') == -1) arrFields.push('DOC_ID');

        order = '';
        for (i = 0; i < view.Definition.Orders.Items.length; i++) {
            field = view.Definition.Orders.Items[i];
            order += ', ' + field.Field;
            if (field.Direction == 1) order += ' desc';
        };
        if (order) order = order.substring(2);

        folderSearch(fld_id, arrFields.join(', '), formula, order, searchLimit(), maxLen, forceOnline).then(
            async function (res) {
                if (res.length == 0) {
                    noResults().appendTo(pContainer);

                } else {
                    var $list, $ul, $li, $itemContent;
                    var row, style, styleScript, item, text;

                    $list = $('<div/>', {
                        class: 'list media-list chevron-center text-select-none',
                        style: 'margin-top: 0;',
                    }).appendTo(pContainer);

                    $ul = $('<ul/>').appendTo($list);

                    styleScript = view.StyleScriptDefinition.Code;
                    if (!view.StyleScriptDefinition.Override) {
                        styleScript = view.StyleScriptDefinition.InheritedCode + styleScript;
                    }

                    if (res.length == searchLimit()) searchLimitLegend().appendTo($ul);

                    for (i = 0; i < res.length; i++) {
                        row = res[i];
                        $li = $('<li/>', {
                            doc_id: row['DOC_ID'],
                        }).appendTo($ul);

                        // Ejecuta el styleScript
                        style = '';
                        if (styleScript) {
                            try {
                                eval(styleScript)
                            } catch (err) {
                                console.error('Error in styleScript: ' + errMsg(err));
                            }
                        };

                        var $itemContent = getItemContent();
                        $itemContent.appendTo($li);

                        if (view.ItemRenderer) {
                            try {
                                let pipe = {};
                                eval(`pipe.fn = async () => {\n\n${view.ItemRenderer}\n};`);
                                await pipe.fn();

                            } catch (err) {
                                renderItem({ text: errMsg(err) }, $itemContent);
                            }

                        } else {
                            // Muestra las 4 1ras columnas
                            item = {};

                            if (arrFields.length > 0) {
                                text = fieldToString(arrFields[0], row[arrFields[0]]);
                                if (style) text = '<span style="padding: 3px; ' + style + '">' + text + '</span>';
                                item.title = text;
                            };

                            if (arrFields.length > 1) {
                                item.subtitle = fieldToString(arrFields[1], row[arrFields[1]]);;
                            }
        
                            if (arrFields.length > 2) {
                                text = fieldToString(arrFields[2], row[arrFields[2]]);
                                if (arrFields.length > 3) {
                                    text += '<br/>' + fieldToString(arrFields[3], row[arrFields[3]]);
                                }
                                item.text = text;
                            }
                            renderItem(item, $itemContent);
                        }
                    };

                    function fieldToString(pField, pValue) {
                        var field = getFormField(folder.Form, pField);
                        var text = '';
                        if (field['Description']) {
                            text += field['Description'];
                        } else {
                            text += field['Name'].substring(0, 1).toUpperCase() + field['Name'].substring(1).toLowerCase();
                        }
                        text += ': ';
                        if (field['Type'] == 2) {
                            text += formatDate(pValue);
                        } else if (field['Type'] == 3) {
                            text += numeral(pValue).format();
                        } else {
                            text += htmlEncode(pValue);
                        }
                        return text;
                    }

                }
                app7.preloader.hide();
                if (pCallback) pCallback();

            },
            function (err) {
                console.log(err);
                pContainer.html('Error: ' + errMsg(err));
                app7.preloader.hide();
                if (pCallback) pCallback();
            }
        );

    } else {

        //SearchGroups
        var groupItem = view.Definition.Groups.Items[level - 1];
        var groupField = groupItem.Field;
        var formField = getFormField(folder.Form, groupField);

        var totals;
        var totField = view.Definition.Groups.STotals;
        if (totField) {
            if (view.Definition.Groups.Function == 1) {
                totals = 'avg(' + totField + ')';
            } else {
                totals = 'sum(' + totField + ')';
            }
        } else {
            totals = 'count(*)';
        }
        var totDesc = view.Definition.Groups.TotalsDescription;

        if (groupItem.OrderBy == 0) {
            order = groupField;
        } else {
            order = totals;
        };
        if (groupItem.Direction == 1) {
            order += ' desc';
        };

        var groupTitle = '';
        if (groupItem['Description']) {
            groupTitle = groupItem['Description'];
        } else if (formField['Description']) {
            groupTitle = formField['Description'];
        } else {
            groupTitle += groupField.substring(0, 1).toUpperCase() + groupField.substring(1).toLowerCase();
        }

        folderSearchGroups(fld_id, groupField, totals + ' as totals', formula, order, searchLimit(), forceOnline).then(
            function (res) {
                if (res.length == 0) {
                    noResults().appendTo(pContainer);

                } else {
                    var $list = $('<div/>', {
                        class: 'list',
                        style: 'margin-top: 0;',
                    }).appendTo(pContainer);

                    var $ul = $('<ul/>').appendTo($list);
                    
                    var $li, $a, $div, row, label, value;

                    // Nombre del grupo
                    $li = $('<li/>', {
                        class: 'accordion-item item-content',
                        style: 'background-color: var(--f7-list-item-divider-bg-color);',
                    }).appendTo($ul);

                    $div = $('<div/>', {
                        class: 'item-inner',
                    }).appendTo($li);

                    $('<div/>', {
                        class: 'item-title',
                    }).append(htmlEncode(groupTitle)).appendTo($div);

                    // Leyenda de limite de registros
                    if (res.length == searchLimit()) searchLimitLegend().appendTo($ul);

                    for (i = 0; i < res.length; i++) {
                        row = res[i];
                        value = row[groupField.toUpperCase()];

                        $li = $('<li/>', {
                            class: 'accordion-item',
                            style: 'background-color: var(--f7-list-item-divider-bg-color);',
                            value: (value == null ? '__NULL__' : value),
                        }).appendTo($ul);

                        $a = $('<a/>', {
                            href: '',
                            class: 'item-link item-content',
                        }).appendTo($li);

                        $div = $('<div/>', {
                            class: 'item-inner',
                        }).appendTo($a);

                        if (value == null) {
                            label = '(ninguno)';
                        } else if (formField.Type == 2) {
                            label = formatDate(value);
                        } else {
                            label = htmlEncode(value);
                        }
                        label = '<b>' + label + '</b> (';
                        var tot = (row['TOTALS'] == null ? 0 : row['TOTALS']);
                        var totStr = numeral(tot).format();
                        if (totDesc == '$') {
                            label += '$ ' + totStr + ')';
                        } else if (totDesc) {
                            label += totStr + ' ' + htmlEncode(totDesc) + ')';
                        } else {
                            label += totStr + ' ';
                            if (totField) {
                                label += totField + ')';
                            } else {
                                label += 'items)';
                            }
                        };

                        $('<div/>', {
                            class: 'item-title',
                        }).append(label).appendTo($div);

                        $('<div/>', {
                            class: 'accordion-item-content',
                            style: 'padding-left: 8px;',
                        }).appendTo($li);
                    }
                }
                app7.preloader.hide();
                if (pCallback) pCallback();
            },

            function (err) {
                console.log(err);
                pContainer.html('Error: ' + errMsg(err));
                app7.preloader.hide();
                if (pCallback) pCallback();
            }
        )
    }
}

function textSearch(pQuery) {
    var q;
    
    if (forceOnline || !arrOfflineCols) {
        if (pQuery.indexOf(' ') == -1) {
            q = 'contains(sys_fields.*, ' + sqlEncode('"' + pQuery + '*"', 1) + ')';
        } else {
            var arr = pQuery.split(' ');
            q = '';
            arr.forEach(el => { if (el) q += ' and contains(sys_fields.*, ' + sqlEncode('"' + el + '*"', 1) + ')'; });
            if (q) q = q.substring(5);
        }
        return q;

    } else {
        var arrTextCols = arrOfflineCols.filter(item => item.type == 'text').map(item => 'ifnull(' + item.name + ', \'\')');
        return '(' + arrTextCols.join(' || ') + ') like ' + sqlEncode('%' + pQuery + '%', 1);
    }
}

function getItemContent() {
    var $cont;

    if (selectionMode) {
        $cont = $('<label/>', {
            class: 'item-checkbox item-content',
        });
    
        $('<input/>', {
            type: 'checkbox',
        }).appendTo($cont);
    
        $('<i/>', {
            class: 'icon icon-checkbox',
        }).appendTo($cont);
    
    } else {
        $cont = $('<a/>', {
            href: '#',
            class: 'item-link item-content',
            draggable: 'false',
        });
    }

    return $cont;
}

function noResults() {
    var $list = $('<div/>', {
        class: 'list simple-list',
        style: 'margin-top: 0;',
    }).append('<ul><li class="no-results">Sin resultados</li></ul>');
    return $list;
}

function searchLimitLegend() {
    var $li = $('<li/>', { class: 'item-content' });
    renderItem({ text: 'Mostrando los primeros ' + searchLimit() + ' elementos' }, $li);
    return $li;
}

function getRenderer(pView, pFolder, pCallback) {
    // Busca en la vista
    DoorsAPI.viewPropertiesGet(pFolder.FldId, pView.VieId).then(
        function (props) {
            var rnd = findProp(props, propViewItemRenderer);
            if (rnd) {
                pCallback(rnd);
            } else {
                // Busca en el folder
                rnd = findProp(pFolder.Properties, propViewItemRenderer);
                if (rnd) {
                    pCallback(rnd);
                } else {
                    // Busca en el Form
                    rnd = findProp(pFolder.Form.Properties, propViewItemRenderer);
                    if (rnd) {
                        pCallback(rnd);
                    } else {
                        pCallback(undefined);
                    };
                }
            };
        },
        function (err) {
            console.log(err);
            pCallback(undefined);
        }
    )
}

function findProp(pProps, pFind) {
    for (var i = 0; i < pProps?.length; i++) {
        if (pProps[i].Name.toUpperCase() == pFind.toUpperCase()) {
            return pProps[i].Value;
        }
    }
}

/*
{
    title: 'Titulo',
    after: 'Despues del titulo',
    subtitle: 'Subtitulo',
    text: 'Text (hasta 2 lineas)',
    media: '<img src="etc.jpg" />',
}
*/
function renderItem(pItem, pContainer) {
    if (pItem.media) {
        $('<div/>', {
            class: 'item-media',
        }).append(pItem.media).appendTo(pContainer); // ver si hace falta htmlEncode aca
    };

    var $itemInner = $('<div/>', {
        class: 'item-inner',
    }).appendTo(pContainer);
    
    if (pItem.title || pItem.after) {
        var $itemTitleRow = $('<div/>', {
            class: 'item-title-row',
        }).appendTo($itemInner);
        
        if (pItem.title) {
            $('<div/>', {
                class: 'item-title',
            }).append(pItem.title).appendTo($itemTitleRow);
        };

        if (pItem.after) {
            $('<div/>', {
                class: 'item-after',
            }).append(pItem.after).appendTo($itemTitleRow);
        };
    }

    if (pItem.subtitle) {
        $('<div/>', {
            class: 'item-subtitle',
        }).append(pItem.subtitle).appendTo($itemInner);
    };
    
    if (pItem.text) {
        $('<div/>', {
            class: 'item-text',
        }).append(pItem.text).appendTo($itemInner);
    };
};

function getSelected() {
    var selected = [];
    $('input[type="checkbox"]:checked', $viewDiv).each(function (ix, el) {
        selected.push(parseInt($(this).closest('li').attr('doc_id')));
    })
    return selected;
}

function getActionsPopup() {
    var $popup = $('<div/>', {
        class: 'popup',
    });
    
    var $view = $('<div/>', {
        class: 'view',
    }).appendTo($popup);
    
    var $page = $('<div/>', {
        class: 'page',
    }).appendTo($view);
    
    $page.append(`
    <div class="navbar">
        <div class="navbar-bg"></div>
        <div class="navbar-inner">
            <div class="title">actionsPopup</div>
            <div class="right">
                <a id="close" class="link popup-close">
                    <i class="f7-icons ios-only">xmark</i>
                    <i class="material-icons md-only">close</i>
                </a>
            </div>
        </div>
    </div>
    `);
    
    var $pageCont = $('<div/>', {
        class: 'page-content',
    }).appendTo($page);
    
    var popup = app7.popup.create({
        el: $popup[0],
        on: {
            closed: function () {
                $pageCont.empty();
            }
        }
    });

    return popup;
};

function deleteClick() {
	var selected = getSelected();
	if (!selected.length) {
    	app7.dialog.alert('Seleccione los documentos que desea borrar');
    	return;
	}

    app7.dialog.confirm('Confirma el borrado de ' + selected.length + ' documentos?',
        function (dialog) {
            var $closeBtn = $(actionsPopup.el).find('#close');
            $closeBtn.addClass('disabled');
            actionsPopup.on('close', function (popup) {
                toggleSelectionMode();
                reloadView();
            });

            actionsPopup.open();
            var $popup = $(actionsPopup.el);
            var $navbar = $popup.find('.navbar');
            $navbar.find('.title').html('Borrando ' + selected.length + ' documentos');
            app7.navbar.size($navbar);
        
            var $pageCont = $popup.find('.page-content');

            var $block = $('<div/>', {
                class: 'block',
            }).appendTo($pageCont);
        
            asyncLoop(selected.length,
                function (loop) {
                    $block.append('Borrando doc #' + selected[loop.iteration()] + ': ');
                    DoorsAPI.documentDelete(fld_id, selected[loop.iteration()]).then(
                        function (res) {
                            $block.append('OK!<br/>');
                            loop.next();
                        },
                        function (err) {
                            $block.append('<span style="color: red;">ERROR: ' + errMsg(err) + '</span><br/>');
                            loop.next();
                        }
                    )
                },
                function() {
                    $block.append('<br/><b>Proceso finalizado</b>');
                    $closeBtn.removeClass('disabled');
                }
            );
        }
    );
}

function refreshOnFocus() {
    if ($viewDiv.hasClass('refresh-on-focus')) {
        // Cuando haces nuevo
        $viewDiv.empty();
        loadViewSection($viewDiv);
    } else {
        $get('li.refresh-on-focus').each(function (index, el) {
            var $cont = $(el).closest('div.accordion-item-content');
            if ($cont.length) {
                // Vista con grupos
                $cont.empty();
                loadViewSection($cont);
                // todo: en este caso faltaria actualizar los totales
            } else {
                // Vista plana
                $viewDiv.empty();
                loadViewSection($viewDiv);
            }
        });
    }
}