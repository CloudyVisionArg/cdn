var popoversFolder;
DoorsAPI.foldersGetByName(dSession.appsFolder(), 'popovers').then(
    function (res) {
        popoversFolder = res;
    }
);

function iniciarTour() {
    var read = window.localStorage.getItem("popoversLeidos");
    const cartelFormula = read ? "cartel_id not in (" + read + ")" : "";
    DoorsAPI.folderSearch(popoversFolder.FldId, "doc_id,cartel_id,view,selector,text,orden", cartelFormula, "orden", 0, false, 0).then(
        function(res){
            if(res.length > 0){
                const arrCarteles = res.map(crearCarteles)
                for (let i = 0; i < arrCarteles.length-1; i++) {                
                    arrCarteles[i].on('closed', function (popover) {
                        app7.tab.show(arrCarteles[i+1]["VIEW"]);
                        arrCarteles[i+1].open(arrCarteles[i+1]["SELECTOR"]);
                    });
                } 
                //después cuando ya arme el array de lo que tengo que 
                //mostrar lo dibujo en orden
                app7.tab.show(arrCarteles[0]["VIEW"])
                arrCarteles[0].open(arrCarteles[0]["SELECTOR"]);
            }
        },
        function(err){
            console.log(err);
        }
    );
}

function iniciarTourFijo() {
    const arrPopoverFijos = crearPopoversFijos();
    if(arrPopoverFijos.length > 0){
        renderPopovers(arrPopoverFijos);
    }    
}

function crearCarteles(pCartel,index,array){
    //pId,pView,pSelector,pTexto

    const div = document.createElement("div");
    div.classList.add("popover");

    const divInner = document.createElement("div");
    divInner.classList.add("popover-inner");
    div.append(divInner);

    const divBlock = document.createElement("div");
    divBlock.classList.add("block");
    divBlock.innerHTML = pCartel["TEXT"];
    divInner.append(divBlock);

    const text = div.outerHTML;
    const dynamicPopover = app7.popover.create({
        //targetEl: pCartel["VIEW"] + " " + pCartel["SELECTOR"],
        // Events
        content: text,
        on: {
            open: function (popover) {
                console.log('Popover open ' + pCartel["CARTEL_ID"]);
            },
            opened: function (popover) {
                console.log('Popover opened ' + pCartel["CARTEL_ID"]);
            },
            close: function (popover) {
                var read = window.localStorage.getItem("popoversLeidos");
                if (read) read += ',';
                read += pCartel["CARTEL_ID"];
                window.localStorage.setItem("popoversLeidos", read);
            },  
        }
    });
    dynamicPopover["VIEW"] = pCartel["VIEW"]
    dynamicPopover["SELECTOR"] = pCartel["SELECTOR"]

    return dynamicPopover;
    
}


function generarCartelesVista(pVista){
    const vistaformula =  pVista ? "view LIKE '" + pVista + "'" : "";

    var read = window.localStorage.getItem("popoversLeidos");
    const cartelFormula = read ? "cartel_id not in (" + read + ")" : "";
    let conector = ""
    if(vistaformula !== "" && cartelFormula !== ""){
        conector = " and "
    }
    const finalFormula = vistaformula + conector + cartelFormula

    DoorsAPI.folderSearch(popoversFolder.FldId, "doc_id,cartel_id,view,selector,text,orden", finalFormula, "orden", 0, false, 0).then(
        function(res){            
            if(res.length > 0){
                renderPopovers(res)
            }
        },
        function(err){
            console.log(err);
        }
    );
}


function renderPopovers(pArrPopovers){
    var read = window.localStorage.getItem("popoversLeidos");
    const arrRead = read ? read.split(",") : [];

    const arrFiltrados = pArrPopovers.filter((item)=>{
        debugger;
        arrRead.indexOf(item["CARTEL_ID"]) < 0;
    });

    const arrCartelesVista = arrFiltrados.map(crearCarteles)
    for (let i = 0; i < arrCartelesVista.length-1; i++) {                
        arrCartelesVista[i].on('closed', function (popover) {
            app7.tab.show(arrCartelesVista[i+1]["VIEW"]);
            arrCartelesVista[i+1].open(arrCartelesVista[i+1]["SELECTOR"]);
        });
    } 
    //después cuando ya arme el array de lo que tengo que 
    //mostrar lo dibujo en orden
    if(arrCartelesVista.length > 0){
        app7.tab.show(arrCartelesVista[0]["VIEW"])
        arrCartelesVista[0].open(arrCartelesVista[0]["VIEW"] + " " + arrCartelesVista[0]["SELECTOR"]);
    }
}

function obtenerVistaExplorer(){
    //encuentra la primera vista explorer
    for(var idx = 0; idx < app7.views.length; idx++){
        if(app7.views[idx].router.currentPageEl.id.startsWith("explorer")){
            return app7.views[idx].el.id;
        }
    }
    return undefined;
}

function crearPopoversFijos(){
    const arrPopoversfijos = [
        {        
            CARTEL_ID: 100000001,
            VIEW: "#" + obtenerVistaExplorer(),
            SELECTOR: "#" + obtenerVistaExplorer() + " .subnavbar",
            TEXT: ` <h3 class="popover-title">
                        <i class="material-icons md-only">arrow-up</i> 
                        <i class="f7-icons ios-only">arrow-up</i>
                        <span> Vistas</span>
                    </h3>
                    <p>Pulse aquí para elegir la vista</p>`,
            ORDEN: "1"
        },  
    ]
    
    return arrPopoversfijos;
}
