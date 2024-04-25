'use strict';

var fld_id, folder, doc_id, doc;

var inApp = typeof app7 == 'object';
var utils = dSession.utils;

if (inApp) {
    fld_id = routeTo.query.fld_id;
    doc_id = routeTo.query.doc_id;

    app7.preloader.show();
    
} else {
}

(async () => {
    if (fld_id) {
        try {
            folder = await dSession.folder(fld_id);
            folder.form; // Para q vaya cargando el form

            if (folder.type == 1) {
                if (doc_id) {
                    doc = await folder.documents(doc_id);
                } else {
                    doc = await folder.documentsNew();
                }

                loadControls();
            } else {
                errMgr('La carpeta ' + fld_id + ' no es una carpeta de documentos');
            }

        } catch (err) {
            errMgr(err)
        }
    } else {
        errMgr('Se requiere fld_id');

    }
})();

function errMgr(pErr) {
    if (inApp) {
        console.error(pErr);
        app7.preloader.hide();
        resolve({ content: errPage(pErr) });

    } else {
        console.error(pErr);
        toast(utils.errMsg(pErr), { delay: 10000 });
        preloader.hide();
    }
}