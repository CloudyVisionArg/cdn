var sync = new Sync();

// todo: attachments

function Sync() {
    var appName;
    var syncFolder;
    var maxTextLen = 0;
    var maxRecords = 1000000; // todo: deberia ser 0 pero no lo toma el API Rest
    var logTime = 200; // Milisegundos a partir de los cuales loguea los SQL

    this.fullSyncInterval = 60 * 60 * 24; // segundos entre full sync (24 hs)

    // sqlite types: text, integer, real
    var syncExtraColumns = [
        { 'name': 'modified_local', 'type': 'text' },
        { 'name': 'sync_status', 'type': 'text' },
        { 'name': 'last_sync', 'type': 'text' },
        { 'name': 'guid', 'type': 'text' },
    ]

    var accColumns = [
        { 'name': 'acc_id', 'type': 'integer' },
        { 'name': 'accid', 'type': 'integer' }, // por compatib con el online
        { 'name': 'name', 'type': 'text' },
        { 'name': 'email', 'type': 'text' },
        { 'name': 'type', 'type': 'integer' },
        { 'name': 'system', 'type': 'integer' },
        { 'name': 'login', 'type': 'text' },
        { 'name': 'disabled', 'type': 'integer' },
        { 'name': 'child_acc', 'type': 'text' },
        { 'name': 'parent_acc', 'type': 'text' },
    ]

    this.syncing = function (pSyncing) {
        var ret;

        if (pSyncing == undefined) {
            var s = window.localStorage.getItem('syncing') == '1';
            if (!s) {
                ret = false;
            } else {
                var ts = window.localStorage.getItem('syncingTime');
                if (!ts) {
                    ret = false;
                } else {
                    ts = new Date(ts);
                    var dif = (Math.abs((new Date).getTime() - ts.getTime())) / 1000;
                    if (dif > 300) { // 5 min
                        ret = false;
                    } else {
                        ret = true;
                    }
                }
            }

        } else {
            window.localStorage.setItem('syncing', pSyncing ? '1' : '0');
            window.localStorage.setItem('syncingTime', (new Date).toJSON());
            ret = pSyncing;
        }

        return ret;
    }

    var self = this;

    this.sync = function (full, callback) {
        syncFolder = window.localStorage.getItem('appsFolder');
        if (!syncFolder) {
            console.log('APPS_FOLDER setting is required');
            if (callback) callback();
            return;
        }
        var val = window.localStorage.getItem('appName');
        appName = val ? val : 'default';
        
        if (self.syncing()) {
            console.log('Sync skipped');
            if (callback) callback();
            return;
        } else {
            self.syncing(true);
        }

        if (!app7.online) {
            console.log('Offline, sync skipped');
            if (callback) callback();
            return;
        }

        dSession.checkToken(function () {
            syncPriv(full, callback);
        }, function (err) {
            self.syncing(false);
            console.log(err);
            if (callback) callback();
        });
    }

    function syncPriv(full, callback) {
        console.log('Sync start');

        var fullSync = (full == true);
        self.syncing(true);

        syncSyncTable(fullSync, function () {
            dbRead('select * from sync_table where lower(app) = ? and enabled = 1',
                [appName.toLowerCase()],
                function (rs, tx) {
                    var arrRows = [];
                    var calls = 0;
                    var arrFolders = [];
                    var syncObj;
                    for (var i = 0; i < rs.rows.length; i++) {
                        var row = rs.rows.item(i);
                        arrRows.push(row);
                        arrFolders.push(row['folder']);

                        if (row['folder'] == 3) {
                            // sync accounts
                            var syncAcc = fullSync;
                            if (!syncAcc) {
                                var lastAccSync = window.localStorage.getItem('lastFullSync_accounts');
                                var dif;
                                if (lastAccSync != null) {
                                    lastAccSync = new Date(lastAccSync);
                                    dif = ((new Date).getTime() - lastAccSync.getTime()) / 1000;
                                    if (dif > self.fullSyncInterval) {
                                        syncAcc = true;
                                    }
                                } else {
                                    syncAcc = true;
                                }
                            }

                            if (syncAcc) {
                                console.log('sync accounts');
                                createAccTable(function () {
                                    calls++;
                                    syncAccounts(function () {
                                        self.syncing(--calls > 0);
                                        if (!self.syncing()) {
                                            console.log('Sync end');
                                            if (callback) callback();
                                        }
                                    });
                                })    
                            }

                        } else {
                            // sync folder
                            syncObj = {
                                'syncTable': 'folder_' + row['folder'],
                                'folder': row['folder'],
                                'fields': checkSyncFields(row['fields']),
                                'formula': row['formula'],
                                'resync': fullSync,
                                'last_sync': row['last_sync'],
                            }
                            createSyncTable(syncObj, function (pSyncObj) {
                                calls++;
                                syncTable(pSyncObj, function () {
                                    self.syncing(--calls > 0);
                                    if (!self.syncing()) {
                                        console.log('sync finished');
                                        if (callback) callback();
                                    }
                                });
                            })
                        }
                    }
                    window.localStorage.setItem('sync_table', JSON.stringify(arrRows));                        
                    deleteUnusedTables(arrFolders);
                },
                function (err, tx) {
                    if (!self.syncing()) {
                        console.log('sync finished with error');
                        if (callback) callback();
                    }
                }
            );
        });
    }

    function syncSyncTable(pFull, pCallback) {
        // sincroniza la sync table
        DoorsAPI.formsGetByFolderId(syncFolder).then(
            function (form) {
                var fields = form.Fields;
                var arrFields = [];
                for (var i = 0; i < fields.length; i++) {
                    if (fields[i]['Custom'])
                        arrFields.push(fields[i]['Name'].toLowerCase());
                };

                var syncObj = {
                    'syncTable': 'sync_table',
                    'folder': syncFolder,
                    'fields': checkSyncFields(arrFields.join(',')),
                    'formula': 'app = \'' + appName + '\' and enabled = 1',
                    'resync': pFull,
                };
                createSyncTable(syncObj, function (pSyncObj) {
                    syncTable(pSyncObj, function () {
                        pCallback();
                    });
                });
            },
            function (err) {
                console.log(err);
                pCallback();
            }
        );
    }

    function deleteUnusedTables(pFolders) {
        dbRead('SELECT name FROM sqlite_master WHERE type = \'table\' AND name like \'folder_%\'',
            [],
            function (rs, tx) {
                for (var i = 0; i < rs.rows.length; i++) {
                    var row = rs.rows.item(i);
                    var folder = parseInt(row['name'].substr(row['name'].lastIndexOf('_') + 1));
                    if (pFolders.indexOf(folder) < 0) {
                        dbExec('drop table ' + row['name']);
                    };
                };
            }
        );
    };

    function syncTable(pSyncObj, pCallback) {
        var formula = pSyncObj['formula'];
        if (formula == null) formula = '';

        saveTable(pSyncObj['syncTable'], function () {
            var fullSync = false;
            var lastFullSync = window.localStorage.getItem('lastFullSync_' + pSyncObj['folder']);
            var dif;
            if (lastFullSync != null) {
                lastFullSync = new Date(lastFullSync);
                dif = ((new Date).getTime() - lastFullSync.getTime()) / 1000;
                if (dif > self.fullSyncInterval) {
                    fullSync = true;
                }
            } else {
                fullSync = true;
            }
    
            if (!pSyncObj['resync'] && !fullSync) {
                var lastSync = window.localStorage.getItem('lastSync_' + pSyncObj['folder']);
                var dtLastSync = new Date(lastSync);
                if (lastSync != null && !isNaN(dtLastSync.getTime())) {
                    // si el registro de sync de Doors se modifico dps de la ult
                    // syncro hace resync
                    var syncModif = new Date(pSyncObj['last_sync']);
                    if (syncModif.getTime() > dtLastSync.getTime()) {
                        pSyncObj['resync'] = true;
                    } else {
                        if (formula != '') {
                            formula = '(' + formula + ') and ';
                        }
                        // Segundos desde el ult sync + 30
                        dif = 30 + ((new Date).getTime() - dtLastSync.getTime()) / 1000;
                        formula += 'datediff(ss, modified, getdate()) < ' + Math.round(dif);
                    }
                }
            }
    
            var tmr = (new Date).getTime();
            
            DoorsAPI.folderSearch(pSyncObj['folder'], pSyncObj['fields'], formula, 'doc_id', maxRecords, null, maxTextLen).then(
                function (result) {
                    if (!result.length) console.log(`syncing ${ pSyncObj['folder'] }: ${ result.length } updates in ${ (new Date).getTime() - tmr } secs`);
                    
                    var dt = (new Date).toJSON();
                    if (result.length == 0) {
                        window.localStorage.setItem('lastSync_' + pSyncObj['folder'], dt);
                        if (pSyncObj['resync'] || fullSync) {
                            window.localStorage.setItem('lastFullSync_' + pSyncObj['folder'], dt);
                        }
                        pCallback();
        
                    } else {

                        if (pSyncObj['resync'] || fullSync) {

                            console.log('full sync ' + pSyncObj['folder']);
                            
                            // borra todo
                            dbExec('delete from ' + pSyncObj['syncTable'], [],
                                function (rs, tx) {
                                    if (rs.rowsAffected) {
                                        console.log(rs.rowsAffected + ' rows deleted from ' + pSyncObj['syncTable']);
                                    }

                                    if (result.length > 0 ) {
                                        // inserta en batch
                                        var succ = true;                        
                                        var calls = 0;

                                        var row = result[0];
                                        var sqlIns = 'insert into ' + pSyncObj['syncTable'] + ' (last_sync';
                                        var sqlSel = 'select ?';
                                        var i = 1;
                                        for (var fie in row) {
                                            if (row.hasOwnProperty(fie)) {
                                                sqlIns += ', "' + fie + '"';
                                                sqlSel += ', ?';
                                                i++;
                                            }
                                        }
                                        sqlIns += ')';

                                        var batch = Math.floor(999 / i); // 999: SQLITE_MAX_VARIABLE_NUMBER
                                        
                                        var sql = '';
                                        var arrValues = [];
                                        var now = (new Date).toJSON();
                                        for (var d = 1; d <= result.length; d++) {
                                            row = result[d-1];

                                            if (sql == '') {
                                                sql = sqlIns + ' ' + sqlSel;
                                            } else {
                                                sql += ' union ' + sqlSel;
                                            }

                                            arrValues.push(now);
                                            for (var fie in row) {
                                                if (row.hasOwnProperty(fie)) {
                                                    arrValues.push(row[fie]);
                                                }
                                            }

                                            if (d % batch == 0 || d == result.length) {
                                                calls++;
                                                insertBatch(sql, arrValues, function (success) {
                                                    succ = (succ && success);
                                                    if (--calls == 0) {
                                                        if (succ) {
                                                            // si terminan bien todos los updates marco las lastSync
                                                            window.localStorage.setItem('lastSync_' + pSyncObj['folder'], dt);
                                                            window.localStorage.setItem('lastFullSync_' + pSyncObj['folder'], dt);
                                                            console.log(result.length + ' rows inserted in ' + pSyncObj['syncTable']);
                                                        }
                                                        pCallback();
                                                    }
                                                });
                                                var sql = '';
                                                var arrValues = [];
                                                var now = (new Date).toJSON();
                                            }
                                        }
                                    }
                                }
                            );

                        } else {
                            var succ = true;                        
                            var calls = 0;
                            
                            for (var d = 0; d < result.length; d++) {
                                calls++;
                                rowDown(pSyncObj['syncTable'], result[d], pSyncObj['resync'] || fullSync, function (success) {
                                    succ = (succ && success);
                                    if (--calls == 0) {
                                        if (succ) {
                                            // si terminan bien todos los updates marco las lastSync
                                            window.localStorage.setItem('lastSync_' + pSyncObj['folder'], dt);
                                        }
                                        pCallback();
                                    }
                                });
                            }
                        }
                    }
                },
                function (err) {
                    console.log(err);
                    pCallback();
                }
            );
        })
    }

    function insertBatch(pSql, pArgs, pCallback) {
        dbExec(pSql, pArgs,
            function (rs, tx) { pCallback(true) },
            function (err, tx) { pCallback(false) }
        );
    }

    // manda al server todos los documentos modificados de una tabla
    function saveTable(pTable, pCallback) {
        var calls = 0;
        dbRead('select * from ' + pTable + ' where modified_local is not null', [],
            function (rs, tx) {
                if (rs.rows.length > 0) {
                    for (var i = 0; i < rs.rows.length; i++) {
                        var row = rs.rows.item(i);
                        calls++;
                        self.saveDoc(row, pTable, 
                            function () {
                                if (--calls == 0) pCallback();
                            }, function () {
                                if (--calls == 0) pCallback();
                            }
                        );
                    }
                } else {
                    pCallback();
                }
            },
            function (err, tx) {
                pCallback();
            }
        );
    };

    // guarda un row de un search en la tabla local
    function rowDown(pSyncTable, pRemoteRow, pOverride, pCallback) {
        var tmr = (new Date).getTime();
        dbExec('select doc_id, modified, modified_local from ' + pSyncTable + ' where doc_id = ?',
            [pRemoteRow['DOC_ID']],
            function (rs, tx) {
                if (rs.rows.length > 0) {
                    // si lo encuentra
                    var row = rs.rows.item(0);
                    var dtLoc = new Date(row['modified']);
                    var dtRem = new Date(pRemoteRow['MODIFIED']);
                    // lo baja si override (fullSync) o si no tiene cambios locales
                    // y los modified difieren en mas de medio segundo
                    if (pOverride || (!row['modified_local'] && Math.abs(dtLoc.getTime() - dtRem.getTime()) > 500)) {
                        var sFields = 'last_sync = ?';
                        sFields += ', modified_local = null';
                        var arrValues = [(new Date).toJSON()];
                        for (var fie in pRemoteRow) {
                            if (pRemoteRow.hasOwnProperty(fie)) {
                                if (fie.toLowerCase() != 'doc_id') {
                                    sFields += ', "' + fie + '" = ?';
                                    arrValues.push(pRemoteRow[fie]);
                                }
                            }
                        }
                        arrValues.push(pRemoteRow['DOC_ID']);
                        tx.executeSql('update ' + pSyncTable + ' set ' + sFields + ' where doc_id = ?',
                            arrValues,
                            function (tx, rs) {
                                var tmrDiff = (new Date).getTime() - tmr;
                                if (tmrDiff >= logTime)
                                    console.log('update ' + pSyncTable + '(' + pRemoteRow['DOC_ID'] + '): ' + tmrDiff + ' ms');
                                pCallback(true);
                            },
                            function (tx, err) {
                                console.log(err);
                                pCallback(false);
                            }
                        );

                    } else {
                        pCallback(true);
                    }

                } else {
                    rowDownInsert(pSyncTable, pRemoteRow, pCallback);
                }
            },
            function (err, tx) {
                pCallback(false);
            }
        );
    }

    // inserta un row de un search en la tabla local
    function rowDownInsert(pSyncTable, pRemoteRow, pCallback) {
        var tmr = (new Date).getTime();
        var sFields = 'last_sync';
        var sArgs = '?';
        var arrValues = [(new Date).toJSON()];
        for (var fie in pRemoteRow) {
            if (pRemoteRow.hasOwnProperty(fie)) {
                sFields = sFields + ', "' + fie + '"';
                sArgs = sArgs + ', ?';
                arrValues.push(pRemoteRow[fie]);
            }
        };
    
        dbExec('insert into ' + pSyncTable + ' (' + sFields + ') values (' + sArgs + ')',
            arrValues,
            function (rs, tx) {
                var tmrDiff = (new Date).getTime() - tmr;
                if (tmrDiff >= logTime)
                    console.log('insert ' + pSyncTable + '(' + pRemoteRow['DOC_ID'] + '): ' + tmrDiff + ' ms');
                pCallback(true);
            },
            function (err, tx) {
                pCallback(false);
            }
        );
    }

    function createSyncTable(pSyncObj, pCallback) {
        self.tableExist(pSyncObj['syncTable'], function (pExist) {
            if (!pExist) {
                dbExec('create table ' + pSyncObj['syncTable'] + ' (doc_id integer)', [],
                    function (rs, tx) {
                        checkDbColumns(pSyncObj, pCallback);
                    }
                );
            } else {
                checkDbColumns(pSyncObj, pCallback);
            }
        })
    }

    this.tableExist = function (pTable, pCallback) {
        dbRead('SELECT name FROM sqlite_master WHERE type = \'table\' AND name = ?',
            [pTable],
            function (rs, tx) {
                pCallback(rs.rows.length > 0);
            }
        );
    }

    function checkDbColumns(pSyncObj, pCallback) {
        self.getDbFields(pSyncObj['syncTable'], function (arrDbFields) {
            var i;
            var arrCols = arrDbFields.map(function (item) { return item.name; })
            for (i = 0; i < syncExtraColumns.length; i++) {
                var col = syncExtraColumns[i];
                if (arrCols.indexOf(col['name']) < 0) {
                    pSyncObj['resync'] = true;
                    addColumn(pSyncObj['syncTable'], col['name'], col['type'], function () { });
                }
            }

            var arrSyncFields = pSyncObj['fields'].split(',');
            var arrMissing = [];
            for (i = 0; i < arrSyncFields.length; i++) {
                var fie = arrSyncFields[i].trim().toLowerCase();
                if (arrCols.indexOf(fie) < 0) {
                    arrMissing.push(fie);
                }
            }
            if (arrMissing.length > 0) {
                pSyncObj['resync'] = true;
                DoorsAPI.formsGetByFolderId(pSyncObj['folder']).then(
                    function (form) {
                        var calls = 0;
                        for (var i = 0; i < arrMissing.length; i++) {
                            calls++;
                            addColumn(pSyncObj['syncTable'], arrMissing[i], getFieldType(form, arrMissing[i]), function () {
                                if (--calls == 0) { pCallback(pSyncObj); }
                            })
                        }
                    },
                    function(err) {
                        console.log(err);
                        pCallback(pSyncObj);}
                    )
            } else {
                pCallback(pSyncObj);
            }
        })
    }

    function createAccTable(pCallback) {
        self.tableExist('accounts', function (pExist) {
            if (!pExist) {
                dbExec('create table accounts (acc_id integer)', [],
                    function (tx, rs) {
                        checkAccColumns(pCallback);
                    }
                );
            } else {
                checkAccColumns(pCallback);
            }
        })
    }

    function checkAccColumns(pCallback) {
        self.getDbFields('accounts', function (arrDbFields) {
            var i;
            var arrCols = arrDbFields.map(function (item) { return item.name; })
            for (i = 0; i < accColumns.length; i++) {
                var col = accColumns[i];
                if (arrCols.indexOf(col['name']) < 0) {
                    addColumn('accounts', col['name'], col['type'], function () { });
                }
            }
            if (pCallback) pCallback();
        })
    }

    function syncAccounts(pCallback) {
        DoorsAPI.accounts().then(
            function (rsAcc) {
                dbExec('delete from accounts', [],
                    function (rs, tx) {
                        if (rsAcc.length > 0) {
                            // inserta en batch
                            var succ = true;                        
                            var calls = 0;
                            var sqlIns = 'insert into accounts (acc_id, accid, name, email, type, system, login, disabled)';
                            var sqlSel = 'select ?, ?, ?, ?, ?, ?, ?, ?';
                            var batch = Math.floor(999 / 8); // 999: SQLITE_MAX_VARIABLE_NUMBER - 8: cant de ?
                            
                            var sql = '';
                            var arrValues = [];
                            var row;
                            for (var d = 1; d <= rsAcc.length; d++) {
                                row = rsAcc[d-1];

                                if (sql == '') {
                                    sql = sqlIns + ' ' + sqlSel;
                                } else {
                                    sql += ' union ' + sqlSel;
                                }

                                arrValues.push(row['AccId']);
                                arrValues.push(row['AccId']);
                                arrValues.push(row['Name']);
                                arrValues.push(row['Email']);
                                arrValues.push(row['Type']);
                                arrValues.push(row['System'] ? 1 : 0);
                                if (row['Type'] == 1) {
                                    arrValues.push(row['Login']);
                                    arrValues.push(row['Disabled'] ? 1 : 0);
                                } else {
                                    arrValues.push(null);
                                    arrValues.push(null);
                                }

                                if (d % batch == 0 || d == rsAcc.length) {
                                    calls++;
                                    insertBatch(sql, arrValues, function (success) {
                                        succ = (succ && success);
                                        if (--calls == 0) {
                                            if (succ) {
                                                // si terminan bien todos los updates marco las lastSync
                                                window.localStorage.setItem('lastFullSync_accounts', (new Date).toJSON());
                                            }
                                            pCallback();
                                        }
                                    });
                                    var sql = '';
                                    var arrValues = [];
                                    var now = (new Date).toJSON();
                                }
                            }
                        }
                    }
                );
            },
            function(err) {
                console.log(err);
                if (pCallback) pCallback();
            }
        );
    }

    function addColumn(pTable, pColumn, pType, pCallback) {
        dbExec('ALTER TABLE ' + pTable + ' ADD COLUMN "' + pColumn + '" ' + pType, [],
            function (rs, tx) { pCallback(); }
        );
    }

    function getFieldType(pForm, pField) {
        var fields = pForm.Fields;
        for (var i = 0; i < fields.length; i++) {
            if (fields[i]['Name'].toLowerCase() == pField.toLowerCase()) {
                if (fields[i]['Type'] == 1 || fields[i]['Type'] == 2) {
                    return 'TEXT';
                } else if (fields[i]['Type'] == 3 && fields[i]['Scale'] == 0) {
                    return 'INTEGER';
                } else if (fields[i]['Type'] == 3 && fields[i]['Scale'] > 0) {
                    return 'REAL';
                } else {
                    console.log('Unknown type: ' + fields[i]);
                }
            }
        }
    }

    function checkSyncFields(pFields) {
        var arr = pFields.split(',');
        for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i].trim().toLowerCase();
        }
        if (arr.indexOf('doc_id') < 0) {
            arr.push('doc_id')
        }
        if (arr.indexOf('created') < 0) {
            arr.push('created')
        }
        if (arr.indexOf('modified') < 0) {
            arr.push('modified')
        }
        return arr.join(',');
    }

    this.getDbFields = function (pTable, pCallback) {
        dbRead('SELECT sql FROM sqlite_master WHERE type = \'table\' AND name = ?',
            [pTable],
            function (rs, tx) {
                if (rs.rows.length > 0) {
                    var sql = rs.rows.item(0)['sql'];
                    var arrColParts = sql.replace(/^[^\(]+\(([^\)]+)\)/g, '$1').split(',');
                    var arrCols = [];
                    for (var i = 0; i < arrColParts.length; i++) {
                        if (typeof arrColParts[i] === 'string') {
                            var arr = arrColParts[i].trim().split(' ');
                            var fie = arr[0].toLowerCase();
                            arrCols.push({name: fie.replaceAll('"', ''), type: arr[1].toLowerCase()});
                        }
                    };
                    pCallback(arrCols);
                } else {
                    pCallback(null);
                };
            }
        );
    };

    this.saveDoc = function(pRow, pSyncTable, pCallback, pErrCallback) {
        if (pRow['doc_id']) {
            // Doc Existente
            DoorsAPI.documentsGetById(pRow['doc_id']).then(
                function (doc) {
                    // chequea que coincidan los modified
                    var dtLoc = new Date(pRow['modified']);
                    var dtRem = new Date(getDocField(doc, 'modified').Value);
                    // Hasta medio segundo de tolerancia en la diferencia
                    if (Math.abs(dtLoc.getTime() - dtRem.getTime()) > 500)  {
                        var sErr = 'El documento ha sido modificado en el server y ya no podra subirse. Copie la informacion antes del proximo full sync.';
                        self.logSyncStatus(pSyncTable, 'doc_id', pRow['doc_id'], sErr);
                        if (pErrCallback) pErrCallback(sErr);
                    } else {
                        // subir
                        var arrFields = self.tableSyncFields(pSyncTable).split(',');
                        var field;
                        for (var i = 0; i < arrFields.length; i++) {
                            field = getDocField(doc, arrFields[i]);
                            if (field['Updatable']) {
                                if (field['ValueChanged']) {
                                    if (pRow[arrFields[i]] != field['ValueOld']) {
                                        field['Value'] = pRow[arrFields[i]];
                                    }
                                } else {
                                    if (pRow[arrFields[i]] != field['Value']) {
                                        field['Value'] = pRow[arrFields[i]];
                                    }
                                }
                            }
                        }

                        //Save
                        DoorsAPI.documentSave(doc).then(
                            function (doc2) {
                                // grabo ok, actualizo el registro local
                                var now = (new Date).toJSON();
                                var sFields = 'last_sync = ?, modified_local = ?, sync_status = ? || x\'0d\' || x\'0a\' || ifnull(sync_status, \'\')';
                                var arrValues = [now, null, logDateTime(now) + ' - Synced!'];
                                for (var fie in pRow) {
                                    if (pRow.hasOwnProperty(fie)) {
                                        if (fie != 'doc_id' && fie != 'guid' && fie != 'last_sync' && fie != 'modified_local' && fie != 'sync_status') {
                                            sFields += ', "' + fie + '" = ?';
                                            field = getDocField(doc2, fie);
                                            if (field) {
                                                arrValues.push(field['Value']);
                                            } else {
                                                arrValues.push(null);
                                            }
                                        }
                                    }
                                }

                                arrValues.push(pRow['doc_id']);
                                dbExec('update ' + pSyncTable + ' set ' + sFields + ' where doc_id = ?',
                                    arrValues,
                                    function (rs, tx) {
                                        console.log(doc2.DocId + ' saved');
                                        if (pCallback) pCallback(doc2);
                                    },
                                    function (err, tx) {
                                        // err del update
                                        if (pErrCallback) pErrCallback(err);
                                    }
                                );
                            },
                            function (err) {
                                // err del Save
                                var sErr = 'docSave error: ' + errMsg(err);
                                console.log(err);
                                self.logSyncStatus(pSyncTable, 'doc_id', pRow['doc_id'], sErr);
                                if (pErrCallback) pErrCallback(err);
                            }
                        ); // cierre del Save

                    } // cierre del else

                },
                function (err) {
                    // err del getById
                    var sErr = 'docGetById error: ' + errMsg(err);
                    console.log(err);
                    self.logSyncStatus(pSyncTable, 'doc_id', pRow['doc_id'], sErr);
                    if (pErrCallback) pErrCallback(err);
                
                }
            ); // cierre del getById

        } else {
            // localRow no tiene doc_id
            // Doc New
            if (!pRow['guid']) {
                var sErr = 'GUID es requerido para documentos nuevos';
                if (pErrCallback) pErrCallback(sErr);
            } else {
                var fldId = pSyncTable.substr(7);
                DoorsAPI.documentsNew(fldId).then(
                    function(doc) {
                        // subir
                        var arrFields = self.tableSyncFields(pSyncTable).split(',');
                        var field;
                        for (var i = 0; i < arrFields.length; i++) {
                            field = getDocField(doc, arrFields[i]);
                            if (field['Updatable']) {
                                if (field['ValueChanged']) {
                                    if (pRow[arrFields[i]] != field['ValueOld']) {
                                        field['Value'] = pRow[arrFields[i]];
                                    }
                                } else {
                                    if (pRow[arrFields[i]] != field['Value']) {
                                        field['Value'] = pRow[arrFields[i]];
                                    }
                                }
                            }
                        }

                        //Save
                        DoorsAPI.documentSave(doc).then(
                            function (doc2) {
                                // grabo ok, actualizo el registro local
                                var now = (new Date).toJSON();
                                var sFields = 'doc_id = ?, last_sync = ?, modified_local = ?, sync_status = ? || x\'0d\' || x\'0a\' || ifnull(sync_status, \'\')';
                                var arrValues = [doc2.DocId, now, null, logDateTime(now) + ' - Synced!'];
                                for (var fie in pRow) {
                                    if (pRow.hasOwnProperty(fie)) {
                                        if (fie != 'doc_id' && fie != 'guid' && fie != 'last_sync' && fie != 'modified_local' && fie != 'sync_status') {
                                            sFields += ', "' + fie + '" = ?';
                                            field = getDocField(doc2, fie);
                                            if (field) {
                                                arrValues.push(field['Value']);
                                            } else {
                                                arrValues.push(null);
                                            }
                                        }
                                    }
                                }

                                arrValues.push(pRow['guid']);
                                dbExec('update ' + pSyncTable + ' set ' + sFields + ' where guid = ?',
                                    arrValues,
                                    function (rs, tx) {
                                        console.log(doc2.DocId + ' saved');
                                        if (pCallback) pCallback(doc2);
                                    },
                                    function (err, tx) {
                                        console.log(err);
                                        if (pErrCallback) pErrCallback(err);
                                    }
                                );

                            },
                            function (err) {
                                // err del Save
                                var sErr = 'docSave error: ' + errMsg(err);
                                console.log(err);
                                self.logSyncStatus(pSyncTable, 'guid', pRow['guid'], sErr);
                                if (pErrCallback) pErrCallback(err);
                            }
                        ); // cierre del Save
                    },
                    function (err) {
                        // err del New
                        var sErr = 'docNew error: ' + errMsg(err);
                        console.log(sErr);
                        self.logSyncStatus(pSyncTable, 'guid', pRow['guid'], sErr);
                        if (pErrCallback) pErrCallback(err);
                    }
                ); // cierre del new
            }
        }
    }

    this.logSyncStatus = function (pTable, pKeyName, pKeyValue, pText) {
        var sFields = 'sync_status = ? || x\'0d\' || x\'0a\' || ifnull(sync_status, \'\')';
        var arrValues = [logDateTime(new Date()) + ' - ' + pText];
        arrValues.push(pKeyValue);
        dbExec('update ' + pTable + ' set ' + sFields + ' where ' + pKeyName + ' = ?', arrValues);
    }

    this.tableName = function (pName) {
        return 'folder_' + self.tableId(pName);
    }    

    this.tableId = function (pName) {
        try {
            var rows = JSON.parse(window.localStorage.getItem('sync_table'));
        } catch (err) {
            throw 'Missing sync_table';
        }
        if (!rows) throw 'Missing sync_table';
        var ret = rows.find(el => el['name'].toLowerCase() == pName.toLowerCase());
        if (ret) {
            return ret['folder'];
        } else {
            throw 'Missing table ' + pName;
        }
    }    

    this.tableSyncFields = function (pLocalTable) {
        var rows = JSON.parse(window.localStorage.getItem('sync_table'));
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if ('folder_' + row['folder'] == pLocalTable.toLowerCase()) {
                return checkSyncFields(row['fields']);
            }
        }
        throw 'Missing table ' + pName;
    }    
}
