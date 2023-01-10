//se está llamando a generarCartelesVista antes de que esto esté resuelto
var popoversFolder;
DoorsAPI.foldersGetByName(dSession.appsFolder(), 'popovers').then(
    function (res) {
        popoversFolder = res;
    }
);

app7.on('pageAfterIn', function (e) {
    if(e.el.closest('.tab-active')){
        let scope = obtenerScope(e.el);
        if(scope == 'custom'){
            generarCartelesVista("#" + e.el.closest('.view').id)
        }else{
            generarCarteles(scope);
        }        
    }
})

app7.on('pageTabShow', function (e) {
    if(e.className.includes("page-current")){
        let scope = obtenerScope(e);
        if(scope == 'custom'){
            generarCartelesVista("#" + e.closest('.view').id)
        }else{
            generarCarteles(scope);
        }        
    }
})  


function crearCarteles(pCartel,index,array){
    //pId,pView,pSelector,pTexto

    const div = document.createElement("div");
    div.classList.add("popover");

    const divInner = document.createElement("div");
    divInner.classList.add("popover-inner");
    div.append(divInner);

    const divBlock = document.createElement("div");
    divBlock.classList.add("block");
    //divBlock.innerHTML = pCartel["TEXT"];
    divInner.append(divBlock);

    const elTitle = document.createElement("h3");
    elTitle.classList.add("popover-title");    
    divBlock.append(elTitle);

    const elIconMD = document.createElement("i");
    elIconMD.classList.add("material-icons", "md-only");    
    elIconMD.innerText = pCartel["ICON_MD"]
    elTitle.append(elIconMD);

    const elIconIOS = document.createElement("i");
    elIconIOS.classList.add("f7-icons", "ios-only");    
    elIconIOS.innerText = pCartel["ICON_IOS"]
    elTitle.append(elIconIOS);

    const elTitleText = document.createElement("span");
    elTitleText.innerText = pCartel["TITLE"]
    elTitle.append(elTitleText);

    const elTextCartel = document.createElement("p");      
    elTextCartel.innerHTML = pCartel["TEXT"];
    divBlock.append(elTextCartel);

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
    
    dynamicPopover["SCOPE"] = pCartel["SCOPE"]
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

    DoorsAPI.folderSearch(popoversFolder.FldId, "*", finalFormula, "orden", 0, false, 0).then(
        function(res){            
            const arrCartelesFijos = crearPopoversFijos().filter((item)=>{
                return item["VIEW"] == pVista;
            });
            if(res.length > 0){
                renderPopovers([...res, ...arrCartelesFijos]);
            }else{
                renderPopovers(arrCartelesFijos);
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
        return arrRead.findIndex((x)=>x==item["CARTEL_ID"]) < 0;
    });

    const arrCartelesVista = arrFiltrados.map(crearCarteles)

    for (let i = 0; i < arrCartelesVista.length-1; i++) {                
        arrCartelesVista[i].on('closed', function (popover) {
            arrCartelesVista[i+1].open(arrCartelesVista[i+1]["SELECTOR"]);
        });
    } 
    if(arrCartelesVista.length > 0){
        arrCartelesVista[0].open(arrCartelesVista[0]["SELECTOR"]);
    }
}

function obtenerScope(page){
    if(page.id.includes('explorer')){
        return 'explorer';
    }else if(page.id.includes('generic')){
        return 'generic';
    }else{
        return 'custom';
    }
}

function generarCarteles(pScope){
    console.log("generar carteles por scope")
    const scopeformula =  pScope ? "scope LIKE '" + pScope + "' OR scope LIKE 'toolbar'" : "scope LIKE 'toolbar'";

    var read = window.localStorage.getItem("popoversLeidos");
    const cartelFormula = read ? "cartel_id not in (" + read + ")" : "";
    let conector = ""
    if(scopeformula !== "" && cartelFormula !== ""){
        conector = " and "
    }
    const finalFormula = scopeformula + conector + cartelFormula

    DoorsAPI.folderSearch(popoversFolder.FldId, "*", finalFormula, "orden", 0, false, 0).then(
        function(res){            
            const arrCartelesFijos = crearPopoversFijos().filter((item)=>{
                return (item["SCOPE"] == pScope || item["SCOPE"] == 'toolbar');
            });
            if(res.length > 0){
                renderPopovers([...res, ...arrCartelesFijos]);
            }else{
                renderPopovers(arrCartelesFijos);
            }
        },
        function(err){
            console.log(err);
        }
    );
}


function crearPopoversFijos(){
    const arrPopoversfijos = [
        {        
            CARTEL_ID: 100000001,
            SCOPE: "explorer",
            VIEW: null,
            SELECTOR: ".subnavbar",
            TITLE: " Vistas",
            ICON_MD: "arrow_upward",
            ICON_IOS: "arrow_up",
            TEXT: "Presione aqu&iacute; para elegir la vista",
            ORDEN: "1"
        },  
        {        
            CARTEL_ID: 100000002,
            SCOPE: "explorer",
            VIEW: null,
            SELECTOR: "#buttonSearch",
            TITLE: " Buscar Contactos",
            ICON_MD: "search",
            ICON_IOS: "search",
            TEXT: "Presione aqu&iacute; para buscar",
            ORDEN: "2"
        },  
        {        
            CARTEL_ID: 100000003,
            SCOPE: "explorer",
            VIEW: null,
            SELECTOR: "#fabAdd",
            TITLE: " Agregar",
            ICON_MD: "add",
            ICON_IOS: "plus",
            TEXT: "Presione aquí para agregar o importar",
            ORDEN: "3"
        },  
        {        
            CARTEL_ID: 100000004,
            SCOPE: "toolbar",
            VIEW: null,
            SELECTOR: "a[href='#view-notifications']",
            TITLE: " Notificaciones",
            ICON_MD: "notifications",
            ICON_IOS: "bell",
            TEXT: "Aqui podra consultar notificaciones acerca de los contactos asignados",
            ORDEN: "4"
        },  
    ]
    
    return arrPopoversfijos;
}



/* function iniciarTour() {
    var read = window.localStorage.getItem("popoversLeidos");
    const cartelFormula = read ? "cartel_id not in (" + read + ")" : "";
    DoorsAPI.folderSearch(popoversFolder.FldId, "doc_id,cartel_id,view,selector,text,orden", cartelFormula, "orden", 0, false, 0).then(
        function (res) {
            if (res.length > 0) {
                const arrCarteles = res.map(crearCarteles)
                for (let i = 0; i < arrCarteles.length - 1; i++) {
                    arrCarteles[i].on('closed', function (popover) {
                        app7.tab.show(arrCarteles[i + 1]["VIEW"]);
                        arrCarteles[i + 1].open(arrCarteles[i + 1]["SELECTOR"]);
                    });
                }
                //después cuando ya arme el array de lo que tengo que 
                //mostrar lo dibujo en orden
                app7.tab.show(arrCarteles[0]["VIEW"])
                arrCarteles[0].open(arrCarteles[0]["SELECTOR"]);
            }
        },
        function (err) {
            console.log(err);
        }
    );
} */
