
var popoversFolder;
var arrPopoversfijos = [];

fetch(scriptSrc('app7-popovers.json'))
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
        let context = e.el.id.replace(/_*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, "");
        generarCarteles(context);
    }
})


app7.on('pageTabShow', function (e) {
    if(e.className.includes("page-current")){
        let context = e.id.replace(/_*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, "");
        generarCarteles(context);                
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
    elIconMD.innerText = pCartel["icon_md"]
    elTitle.append(elIconMD);

    const elIconIOS = document.createElement("i");
    elIconIOS.classList.add("f7-icons", "ios-only");    
    elIconIOS.innerText = pCartel["icon_ios"]
    elTitle.append(elIconIOS);

    const elTitleText = document.createElement("span");
    elTitleText.innerText = pCartel["title"]
    elTitle.append(elTitleText);

    const elTextCartel = document.createElement("p");      
    elTextCartel.innerHTML = pCartel["text"];
    divBlock.append(elTextCartel);

    const text = div.outerHTML;
    const dynamicPopover = app7.popover.create({
        //targetEl: pCartel["VIEW"] + " " + pCartel["selector"],
        // Events
        content: text,
        on: {
            open: function (popover) {
                console.log('Popover open ' + pCartel["popover_id"]);
            },
            opened: function (popover) {
                console.log('Popover opened ' + pCartel["popover_id"]);
            },
            close: function (popover) {
                var read = window.localStorage.getItem("popoversLeidos");
                if (read) read += ',';
                read += pCartel["popover_id"];
                window.localStorage.setItem("popoversLeidos", read);
            },  
        }
    });
    
    dynamicPopover["context"] = pCartel["context"]

    dynamicPopover["selector"] = pCartel["selector"]

    return dynamicPopover;
    
}


function renderPopovers(pArrPopovers){
    var read = window.localStorage.getItem("popoversLeidos");
    const arrRead = read ? read.split(",") : [];

    const arrFiltrados = pArrPopovers.filter((item)=>{
        return arrRead.findIndex((x)=>x==item["popover_id"]) < 0;
    });

    const arrCartelesVista = arrFiltrados.map(crearCarteles)
    debugger;
    for (let i = 0; i < arrCartelesVista.length-1; i++) {                
        arrCartelesVista[i].on('closed', function (popover) {
            arrCartelesVista[i+1].open(arrCartelesVista[i+1]["selector"]);
        });
    } 
    if(arrCartelesVista.length > 0){
        arrCartelesVista[0].open(arrCartelesVista[0]["selector"]);
    }
}


function generarCarteles(pScope){
    const contextformula =  pScope ? "context LIKE '" + pScope + "' OR context LIKE 'toolbar'" : "context LIKE 'toolbar'";

    var read = window.localStorage.getItem("popoversLeidos");
    const cartelFormula = read ? "popover_id not in (" + read + ")" : "";
    let conector = ""
    if(contextformula !== "" && cartelFormula !== ""){
        conector = " and "
    }
    const finalFormula = contextformula + conector + cartelFormula

    DoorsAPI.folderSearch(popoversFolder.FldId, "*", finalFormula, "order", 0, false, 0).then(
        function(res){            
            const arrCartelesFijos = arrPopoversfijos.filter((item)=>{
                return (item["context"] == pScope || item["context"] == 'toolbar');
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




/*
function generarCartelesVista(pVista){
    const vistaformula =  pVista ? "view LIKE '" + pVista + "'" : "";

    var read = window.localStorage.getItem("popoversLeidos");
    const cartelFormula = read ? "popover_id not in (" + read + ")" : "";
    let conector = ""
    if(vistaformula !== "" && cartelFormula !== ""){
        conector = " and "
    }
    const finalFormula = vistaformula + conector + cartelFormula

    DoorsAPI.folderSearch(popoversFolder.FldId, "*", finalFormula, "order", 0, false, 0).then(
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
*/