'use strict';

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
        class: 'container'
    }).appendTo($body);

    $cont.append(`
        <div class="btn-group" role="group" aria-label="Basic example">
            <button type="button" class="btn btn-primary">Left</button>
            <button type="button" class="btn btn-primary">Middle</button>
            <button type="button" class="btn btn-primary">Right</button>
        </div>

}

