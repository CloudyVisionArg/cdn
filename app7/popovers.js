
var popoversFolder;
var arrPopoversfijos = [];

function btnClosePopover(btn){
    app7.popover.close(btn.closest(".popover"));
}

injectCSS(`
    .popover-inner{
        padding: 0px 4vmin;
    }

    .popover-custom-body{
        padding: 0px;
        margin: 4vmin 0.4vmin;
    }

    .popover-custom-body-text{
        font-size: 1.17em;
    }

    .popover-custom-title-text{
        padding-left: 0.3em;
    }

    .popover-custom-button{
        margin-left: 70%;
        width: 30%;
    }

    .popover-custom-button-container{
        margin-bottom: 4vmin;        
    }
`);

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
    //divInner.style = "padding: 0px 1vmin"
    div.append(divInner);
    
    /*const closeBtnIconMD = document.createElement("i");
    closeBtnIconMD.classList.add("material-icons", "md-only","float-right");    
    closeBtnIconMD.innerText = "close"
    closeBtnIconMD.setAttribute("onclick","btnClosePopover(this)");
    divInner.append(closeBtnIconMD);

    const closeBtnIconIOS = document.createElement("i");
    closeBtnIconIOS.classList.add("f7-icons", "ios-only","float-right");    
    closeBtnIconIOS.innerText = "xmark"
    closeBtnIconIOS.setAttribute("onclick","btnClosePopover(this)");
    divInner.append(closeBtnIconIOS);*/

    
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
    elTitleText.classList.add("popover-custom-title-text")
    elTitleText.innerText = pCartel["title"]
    elTitle.append(elTitleText);

    const divBlock = document.createElement("div");
    divBlock.classList.add("block","popover-custom-body");
    divInner.append(divBlock);

    const elTextCartel = document.createElement("p");      
    elTextCartel.innerHTML = pCartel["text"];
    elTextCartel.classList.add("popover-custom-body-text");
    divBlock.append(elTextCartel);

    const elButtonOk_container = document.createElement("div");
    elButtonOk_container.classList.add("popover-custom-button-container")
    const elButtonOk = document.createElement("button");
    elButtonOk.setAttribute("type","button");
    elButtonOk.classList.add("popover-custom-button","button","button-fill");
    elButtonOk.setAttribute("onclick","btnClosePopover(this)");
    elButtonOk.innerText = "Ok"
    elButtonOk_container.append(elButtonOk);
    divInner.append(elButtonOk_container);


    const text = div.outerHTML;
    const dynamicPopover = app7.popover.create({
        content: text,
        on: {       
            open: function () {
                console.log('Popover open ' + pCartel["popover_id"]);
            },
            opened: function () {
                console.log('Popover opened ' + pCartel["popover_id"]);
            },
            close: function () {
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
    
   
    for (let i = 0; i < arrCartelesVista.length; i++) {                

        arrCartelesVista[i].on('beforeOpen', function () {
            if($(arrCartelesVista[i]["selector"]).length > 0){
                arrCartelesVista[i].open(arrCartelesVista[i]["selector"]);
            }else{
                arrCartelesVista[i].emit("closedWithoutDisplay");
            }
        });

        //encadenar la apertura automatica de los popovers
        //en el cierre del popover anterior
        if(i < arrCartelesVista.length-1){  //el ultimo elemento no
            arrCartelesVista[i].on('closed', function () {
                arrCartelesVista[i+1].emit("beforeOpen");
            });

            arrCartelesVista[i].on('closedWithoutDisplay', function () {
                console.log("close without display: " + arrCartelesVista[i]["selector"])
                arrCartelesVista[i+1].emit("beforeOpen");            
            });
        }
    } 

    if(arrCartelesVista.length > 0){
        arrCartelesVista[0].emit("beforeOpen");            
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
        console.log("existe popoversFolder")
        DoorsAPI.folderSearch(popoversFolder.FldId, "*", finalFormula, "order", 0, false, 0).then(
            function(res){            
                for(let idx = 0; idx < res.length; idx++){
                    Object.keys(res[idx]).forEach((key)=>{
                        res[idx][key.toLowerCase()] = res[idx][key];
                        delete res[idx][key]
                    })
                }
                
                if(res.length > 0){                    
                    renderPopovers([...arrCartelesFijos,...res]);
                    console.log("trajo carteles desde carpeta")
                }else{
                    renderPopovers(arrCartelesFijos);
                    console.log("no trajo carteles desde carpeta")
                }
            },
            function(err){
                console.log(err);
            }
        );
    }else{
        console.log("no existe popoversFolder")
        renderPopovers(arrCartelesFijos);
    }
}

function injectCSS(css){
    let el = document.createElement('style');
    el.type = 'text/css';
    el.innerHTML = css;
    document.head.appendChild(el);
    return el;
};