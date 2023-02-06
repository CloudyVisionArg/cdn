
var popoversFolder;
var arrPopoversfijos = [];

fetch('https://cloudycrm.net/c/gitcdn.asp?path=/app7/popovers.json') // Dani, hay q cambiar esto, lo veamos
.then(response => {
    if (!response.ok) {
        throw new Error("HTTP error " + response.status);
    }    
    return response.json();
})
.then(json => {
    arrPopoversfijos = json;
})
.catch(err => {
    console.log("ObtenerPopoversFijos -> Error " + err);
})

//se está llamando a generarCartelesVista antes de que esto esté resuelto
// ya no hace falta llamarlo desde las codelibs, se llama desde los eventos de las paginas
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
            const arrCartelesFijos = arrPopoversfijos.filter((item)=>{
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
            const arrCartelesFijos = arrPopoversfijos.filter((item)=>{
                return (item["SCOPE"] == pScope || item["SCOPE"] == 'toolbar');
            });
            if(res.length > 0){
                renderPopovers([...arrCartelesFijos, ...res]);
            }else{
                renderPopovers(arrCartelesFijos);
            }
        },
        function(err){
            console.log(err);
        }
    );
}