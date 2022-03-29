'use strict';

// https://fontawesome.com/v4/icons/ para buscar iconos

var urlParams, fld_id, folder, doc_id, doc;
var constrolsFolder, controls, controlsRights;

var arrScripts = [];
arrScripts.push({ id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' });
arrScripts.push({ id: 'bootstrap', src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js' });
arrScripts.push({ id: 'app7-doorsapi', depends: ['jquery'] });
arrScripts.push({ id: 'javascript', version: 0 });

includeJs(arrScripts, function () {
	Doors.RESTFULL.ServerUrl = window.location.origin + '/restful';
	//Doors.RESTFULL.AuthToken = getCookie('AuthToken');
	Doors.RESTFULL.AuthToken = 'B3ECBFD9E08A25A73CC243F662099323865DD9CBCCB62121C37A68D53F6430D2';

	DoorsAPI.islogged().then(
		function (res) {
		},
		function (err) {
			console.log(err);
		}
	);
	
	urlParams = new URLSearchParams(window.location.search);
	fld_id = urlParams.get('fld_id');
	doc_id = urlParams.get('doc_id');
	
	if (fld_id) {
		DoorsAPI.foldersGetById(fld_id).then(
			function (res) {
				folder = res;
				getDoc();
			},
			errMgr
		)
	}

});

function errMgr(pErr) {
	console.log(pErr);
	alert(errMsg(pErr));
};

function getDoc() {
	if (doc_id) {
		DoorsAPI.documentsGetById(doc_id).then(
			function (res) {
				doc = res;
				getControlsFolder();
			},
			errMgr
		);

	} else {
		DoorsAPI.documentsNew(fld_id).then(
			function (res) {
				doc = res;
				getControlsFolder();
			},
			errMgr
		);
	}
}

function getControlsFolder() {
	var cf = objProp(doc.Tags, 'controlsFolder', true);
	
	if (cf) {
		DoorsAPI.foldersGetByPath(folder.RootFolderId, cf).then(
			function (res) {
				controlsFolder = res;
				loadControls();
			},
			function (err) {
				renderPage(); // Dibuja igual, sin controles
			}
		);
		
	} else {
		DoorsAPI.foldersGetByName(fld_id, 'controls').then(
			function (res) {
				controlsFolder = res;
				loadControls();
			},
			function (err) {
				renderPage(); // Dibuja igual, sin controles
			}
		);
	};
}

function loadControls() {
	folderSearch(controlsFolder['FldId'], '', '', 'parent, order, column').then(
		function (res) {
			controls = res;
			getControlsRights(controls);
			renderPage();
		},
		function (err) {
			console.log(pErr);
			renderPage(); // Dibuja igual, sin controles
		}
	)
}

function getControlsRights(pControls) {
	var cr = objProp(doc.Tags, 'controlsRights', true);
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

function renderPage() {
    var $body = $('body');

    var $cont = $('<div/>', {
        class: 'container-fluid',
    }).appendTo($body);

    $cont.append(`
        <div class="btn-group" role="group" aria-label="..." style="position:fixed; top:10px; right:10px; z-index:1000;">
            <button type="button" id="print" class="btn btn-primary" onclick="printForm();">
                <i class="fa fa-print"></i>
                <span class="d-none d-sm-inline-block"> Imprimir</span>
            </button>
            <button type="button" id="save" class="btn btn-primary" onclick="submitForm('save');">
                <i class="fa fa-cloud-upload"></i>
                <span class="d-none d-sm-inline-block"> Guardar</span>
            </button>
            <button type="button" id="saveexit" class="btn btn-primary" onclick="submitForm('saveexit');">
                <i class="fa fa-cloud-upload"></i> +
                <i class="fa fa-sign-out"></i>
                <span class="d-none d-sm-inline-block"> Guardar y salir</span>
            </button>
            <button type="button" id="cancel" class="btn btn-primary" onclick="exitForm(false);">
                <i class="fa fa-sign-out"></i>
                <span class="d-none d-sm-inline-block"> Salir</span>
            </button>
    </div>
    `);

    $cont.append(`
        <div id="title" class="row" style="padding-top: 8px;">
            <h4>Cargando...</h4>
        </div>
        <hr>
    `);
    
    if (!controls) {

        // SIN CONTROLES

        $cont.append(`
            <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item">
                    <button type="button" class="nav-link active" role="tab" data-bs-toggle="tab" aria-current="page">Datos</button>
                </li>
                <li class="nav-item">
                    <button type="button" class="nav-link" role="tab" data-bs-toggle="tab">Header</button>
                </li>
                <li class="nav-item">
                    <button type="button" class="nav-link" role="tab" data-bs-toggle="tab">Historial</button>
                </li>
            </ul>
        `);

$cont.append(        `
<div class="tab-content">
  <div class="tab-pane fade show active" id="tabMain" role="tabpanel" aria-labelledby="home-tab">1</div>
  <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">2</div>
  <div class="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">3</div>
</div>
`);
/*
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

        doc.CustomFields.forEach(field => {
            if (!field.HeaderTable && field.Name != 'DOC_ID') {
                getDefaultControl(field).appendTo($ul);
            }
        });

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

        doc.CustomFields.forEach(field => {
            if (field.HeaderTable) {
                getDefaultControl(field).appendTo($ul);
            }
        })

        doc.HeadFields.forEach(field => {
            getDefaultControl(field).appendTo($ul);
        })

        // tabHist

        $tabHist = $('<div/>', {
            class: 'tab',
            id: 'tabHist',
        }).appendTo($tabs);

        $('<div/>', {
            'data-doclog': 1,
        }).append('Cargando...').appendTo($tabHist);
*/

    } else {
/*
        // CON CONTROLES

        // Evento BeforeRender
        var ev = getEvent('BeforeRender');
        if (ev) {
            try {
                eval(ev);
            } catch (err) {
                console.log('Error in BeforeRender: ' + errMsg(err));
            }
        };
*/
    };
    
}

