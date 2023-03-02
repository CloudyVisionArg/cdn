
var popoversFolder;
var arrPopoversfijos = [];

function btnClosePopover(btn){
    app7.popover.close(btn.closest(".popover"));
}

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

DoorsAPI.foldersGetByName(dSession.appsFolder(), 'popovers').then(
    function (res) {
        popoversFolder = res;
    },
    err => {
        popoversFolder = undefined;
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

    const div = document.createElement("div");
    div.classList.add("popover");

    const divInner = document.createElement("div");
    divInner.classList.add("popover-inner");
    divInner.style = "padding: 0px 1vmin"
    div.append(divInner);

    
    const elTitle = document.createElement("h3");
    elTitle.classList.add("popover-title");    
    //divBlock.append(elTitle);
    divInner.append(elTitle);

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

    const divBlock = document.createElement("div");
    divBlock.classList.add("block");
    divInner.append(divBlock);

    const elTextCartel = document.createElement("p");      
    elTextCartel.innerHTML = pCartel["text"];
    divBlock.append(elTextCartel);


    const elButton = document.createElement("button");
    elButton.classList.add("button"); 
    elButton.setAttribute("type","button");
    elButton.innerText = "Ok"
    elButton.setAttribute("onclick","btnClosePopover(this)");
    //divBlock.append(elButton);
    divInner.append(elButton);

    const text = div.outerHTML;
    const dynamicPopover = app7.popover.create({
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
    
    for (let i = 0; i < arrCartelesVista.length-1; i++) {                
        
        arrCartelesVista[i].on('closed', function (popover) {
            arrCartelesVista[i+1].open(arrCartelesVista[i+1]["selector"]);
        });
    } 

    debugger;
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

    const arrCartelesFijos = arrPopoversfijos.filter((item)=>{
        return (item["context"] == pScope || item["context"] == 'toolbar');
    });

    

    if (popoversFolder) {
        DoorsAPI.folderSearch(popoversFolder.FldId, "*", finalFormula, "order", 0, false, 0).then(
            function(res){            
                for(let idx = 0; idx < res.length; idx++){
                    Object.keys(res[idx]).forEach((key)=>{
                        res[idx][key.toLowerCase()] = res[idx][key];
                        delete res[idx][key]
                    })
                }
                
                if(res.length > 0) renderPopovers([...arrCartelesFijos,...res]);
            },
            function(err){
                console.log(err);
            }
        );
    }else{
        renderPopovers(arrCartelesFijos);
    }
}