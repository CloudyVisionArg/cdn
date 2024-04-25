'use strict';

var fld_id, folder, doc_id, doc;
var utils, urlParams, preldr;

var inApp = typeof app7 == 'object';

(async () => {
    if (inApp) {
        fld_id = routeTo.query.fld_id;
        doc_id = routeTo.query.doc_id;
    
        preldr = app7.preloader;
        preldr.show();
        
    } else {
        await include([
            { id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' },
            { id: 'bootstrap', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js' },
            { id: 'bootstrap-css', depends: ['bootstrap'], src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css' },
            { id: 'web-javascript', depends: ['jquery', 'bootstrap'] },
        ]);

        preldr = preloader;
        preldr.show();

        if (!window.doorsapi2) window.doorsapi2 = await import(scriptSrc('doorsapi2'));
        if (!window.dSession) {
            window.dSession = new doorsapi2.Session();
            if (!await dSession.webSession() || !await dSession.isLogged) {
                errMgr(new Error('La sesion no ha sido iniciada'));
                return;
            }
        }

        await include([
            // { id: 'web-controls' },
            { id: 'tempus-dominus', depends: ['jquery', 'lib-moment'], src: 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/js/tempusdominus-bootstrap-4.min.js' },
            { id: 'tempus-dominus-css', src: 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.39.0/css/tempusdominus-bootstrap-4.min.css' },
            { id: 'bootstrap-select', depends: ['jquery', 'bootstrap', 'bootstrap-css'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/js/bootstrap-select.min.js' },
            { id: 'bootstrap-select-css', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/css/bootstrap-select.min.css' },
            // todo: esto deberia ser segun el lng_id
            { id: 'bootstrap-select-lang', depends: ['bootstrap-select'], src: 'https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta2/dist/js/i18n/defaults-es_ES.min.js' },
        ]);
    
        include([
            { id: 'bootstrap-icons', src: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css' },
            { id: 'font-awesome', src: 'https://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.css' },
            { id: 'ckeditor', src: '/c/inc/ckeditor-nov2016/ckeditor.js' },
            { id: 'lib-filesaver' },
        ]);
    
        await dSession.runSyncEventsOnClient(false);
        
        urlParams = new URLSearchParams(window.location.search);
        fld_id = urlParams.get('fld_id');
        doc_id = urlParams.get('doc_id');
    }

    utils = dSession.utils;

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
                errMgr(new Error('La carpeta ' + fld_id + ' no es una carpeta de documentos'));
            }

        } catch (err) {
            errMgr(err)
        }
    } else {
        errMgr(new Error('Se requiere fld_id'));

    }
})();

function errMgr(pErr) {
    if (inApp) {
        console.error(pErr);
        app7.preloader.hide();
        resolve({ content: errPage(dSession.utils.errMsg(pErr)) });

    } else {
        console.error(pErr);
        toast(dSession.utils.errMsg(pErr), { delay: 10000 });
        preloader.hide();
    }
}

function loadControls() {
    toast('hola');
    preldr.hide();
}