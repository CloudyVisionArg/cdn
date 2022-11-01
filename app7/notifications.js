class CustomAppNotification {
    constructor(Id,DevicePlatform,ReadDate,EraseDate,DeliveryDate,Title,Body,ExtraData) {
        this.Id=Id;
        this.DevicePlatform=DevicePlatform;
        this.ReadDate=ReadDate;
        this.EraseDate=EraseDate;
        this.DeliveryDate=DeliveryDate;
        this.Title=Title;
        this.Body=Body;
        this.ExtraData=ExtraData;
    };
    
    get readicon_ios(){
        return this.ReadDate == null ? "envelope" : "envelope_open";
    }

    get readicon_md(){
        return this.ReadDate == null ? "email" : "drafts";
    }

    get readclass() {
        return this.ReadDate == null ? "msgunread" : "msgread";
    }

    Parse(pNotification) {
        let oMessage;
        this.Id=pNotification.Id;
        this.DevicePlatform=pNotification.DevicePlatform;
        this.ReadDate=pNotification.ReadDate;
        this.EraseDate=pNotification.EraseDate;
        this.DeliveryDate=pNotification.DeliveryDate;

        oMessage= this.ParseMessage(pNotification.Message,pNotification.DevicePlatform);

        if(oMessage!==undefined) {
            this.Title = htmlEncode(oMessage.Title.replace(/<[^>]*>/g, ""))
            this.Body = oMessage.Body;
            this.ExtraData = oMessage.Data;
        }
    };

    ParseMessage(pMessage,pPlataform) {
        let oMsj;
        try {
            oMsj=JSON.parse(pMessage);
        }
        catch(err) {
            console.log("Error al procesar campo message en notificacion: ",err);
        }
        if(typeof (oMsj)==="object"&&oMsj!==null) {
            let payload={};
            switch(pPlataform) {
                case 'Web':
                    payload.Title=oMsj.message.webpush.notification.title;
                    payload.Body=oMsj.message.webpush.notification.body;
                break;
                case 'Android':
                    payload.Title=oMsj.message.android.data.title;
                    payload.Body=oMsj.message.android.data.body;
                break;
                case 'iOS':
                    payload.Title=oMsj.message.apns.payload.aps.alert.title;
                    payload.Body=oMsj.message.apns.payload.aps.alert.body;
                break;
            }
            payload.Data=oMsj.message.data;
            return payload;
        } else {
            return undefined;
        }
    };

}


console.log("notifications")

var $page =   getPage({
                id: 'notifications' + getGuid(),
                title: "Notificaciones",
                leftbutton: 'search',
                searchbar: 2,
                subnavbar: false,
                pulltorefresh: true
            });

$pageCont = $page.find('.page-content');
//todo: cargar la pag en iframe (ver codelib pruebas)

// Evento del Pull To Refresh
$pageCont.on('ptr:refresh', function (e) {
    pageInitMembers(e, globalPage);
    e.originalEvent.detail(); // done
});


var $btn = $page.find('.navbar-inner .left .link')
$btn.attr('id', 'buttonSearch');
$btn.click(function (e) {
    searchBar.enable();
})


// Inicializa el Searchbar
var timeout;
var searchBar = app7.searchbar.create({
    el: $page.find('.searchbar'),
    customSearch: true,
    on: {
        search: function (e, query, previousQuery) {
            // Espera un rato antes de buscar
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                if(query!=""){ 
                    let items = $notificationsVirtualList.items
                    var found = [];
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].Title.toLowerCase().indexOf(query.toLowerCase()) >= 0 || items[i].Body.toLowerCase().indexOf(query.toLowerCase()) >= 0 || query.trim() === '') found.push(i);
                    }
                    $notificationsVirtualList.filterItems(found);
                }else{
                    $notificationsVirtualList.resetFilter();
                }
            }, 800);
        },
        enable: function (sb) {
            // Si le doy el foco de una se corre la pantalla
            setTimeout(function () { sb.inputEl.focus(); }, 200);
        }
    }
});

var $notificationsVirtualList
var $pageCont = $page.find(".page-content");
var $divActions = $("<div/>").appendTo($pageCont);
var $listMembers = $("<div/>", {"class": "list virtual-list media-list chevron-center text-select-none", "style" : "margin-top:0px"}).appendTo($pageCont);
var $ulMembers = $("<ul/>").appendTo($listMembers);

$ulMembers.on("click",(ev)=>{
    if(ev.target.tagName === "I"){
         if(ev.target.classList.contains("btnRead")){
            clickOnEnvelope(ev);
        }else if(ev.target.classList.contains("btnDelete")){
            clickOnTrash(ev);
       }
    }else{
        clickOnAnchor(ev);
    }
})

var f7Page;
function pageInitMembers(e, page) {
    f7Page = page;

    $notificationsVirtualList = app7.virtualList.create({
        // List Element
        el: $get('.virtual-list')[0],
        // Pass array with items
        items: [],
        // usar renderItem
        renderItem: function(item){
            let iconTrash_ios = $("<i />", {"class":"btnDelete f7-icons ios-only", "contenedor_id":item.Id, "text":"trash"})
            let iconTrash_md = $("<i />", {"class":"btnDelete material-icons-outlined md-only", "contenedor_id":item.Id, "text":"delete"})
            let iconSobre_ios = $("<i />", {"class":"btnRead f7-icons ios-only", "contenedor_id":item.Id, "text":item.readicon_ios})
            let iconSobre_md = $("<i />", {"class":"btnRead material-icons-outlined md-only", "contenedor_id":item.Id, "text":item.readicon_md})
                    
            const fechaDelivery = new Date(item["DeliveryDate"])
            let fechaNotif = resolveDeliverydDate(fechaDelivery);

            let ul  = $("<ul />")
            let li  = $("<li />").appendTo(ul)

            let a   = $("<a />", {"class":"item-link item-content " + item.readclass, "extradata": JSON.stringify(item.ExtraData), "href":"#", "id":item.Id}).appendTo(li);
                    
            let contenedor = $("<div />",{"class":"item-inner "}).appendTo(a);
            
            let titleRow = $("<div />", {"class":"item-title-row"}).appendTo(contenedor);
            
            let subtitle = $("<div />", {"class":"item-title","text":item.Title})
            subtitle.appendTo(titleRow);
            
            let title = $("<div />", {"class":"item-after","text":fechaNotif})
            title.appendTo(titleRow);
            
            //let textRow = $("<div />", {"class":"item-row"}).appendTo(contenedor);
            let text = $("<div />", {"class":"item-text","text":item.Body});
            text.appendTo(contenedor);

            let iconRow = $("<div />", {"class":"item-row"}).appendTo(contenedor);
            let iconContainer = $("<div />", {"class":"item-cell","style":"text-align:end"});
            iconTrash_ios.appendTo(iconContainer);
            iconTrash_md.appendTo(iconContainer);
            iconSobre_ios.appendTo(iconContainer);
            iconSobre_md.appendTo(iconContainer);
            iconContainer.appendTo(iconRow);
            
            return ul.html();
        },
        height: (item)=>{
            //TODO obtener el item heigth dinamicamente
            //103 alto item            
            return  app7.theme === 'ios' ? 94.59 : (app7.theme === 'md' ? 103.00 : 103)            
        }
    });

    searchNotifications()

}


function clearMembers(){    
    ($divActions) ? $divActions.html(""):null;
    ($ulMembers) ? $ulMembers.html(""):null;
}

//Esta funcion pasar a algun lugar donde este fe
function searchNotifications(){
    DoorsAPI.notifications(getDevice()).then((res)=>{
        clearMembers();
        let notificationsArr = res.filter(n=>n.EraseDate == null)
        var arrCustomNot = []

        for(var idx=0; idx < notificationsArr.length; idx++){
            const notif = new CustomAppNotification();
            notif.Parse(notificationsArr[idx]);
            arrCustomNot.push(notif);
        }      

        renderMembers(arrCustomNot)
    })
}

/**
 * Expone la funcion refrehnotification para ser llamada cuando se recibe una nueva notificacion
 */
window.refreshNotificacions = searchNotifications;
console.log("refreshNotificacions defined" );

function renderMembers(notificationsArr){
    const listItems = app7.virtualList.get($get('.virtual-list')[0]);
    setNotificationUnReadCounter(notificationsArr.filter(n=>n.ReadDate == null).length);

    if(notificationsArr.length > 0){
        
        let contenedor = $("<div />",{"class":"item-cell"}).appendTo($divActions);
            
        let actionsRow = $("<div />", {"class":"item-row segmented"}).appendTo(contenedor);
            
        let bntDeleteAll = $("<button />", {"class":"button"})
        bntDeleteAll.text("Borrar todas").appendTo(actionsRow);

        let bntReadAll = $("<button />", {"class":"button"})
        bntReadAll.text("Leer todas").appendTo(actionsRow);

        bntReadAll.on("click", function(){
            DoorsAPI.notificationsReadAll().then(()=>{
                searchNotifications();
            })
        })

        bntDeleteAll.on("click", function(){
            app7.dialog.confirm('Esta acción no puede deshacerse','¿Desea borrar todas las notificaciones?', function () {
                DoorsAPI.notificationsDeleteAll().then(()=>{
                    searchNotifications();
                })
            });            
        })


    }else{
        let msjNoHayNotif = $("<div />", {"class":"list simple-list","style":"margin-top: 0;margin-bottom: 0;"}).appendTo($divActions);
        let ul = $("<ul />").appendTo(msjNoHayNotif);
        let li =  $("<li />")
        li.text("Sin notificaciones para mostrarrrr").appendTo(ul);
    }
    listItems.deleteAllItems();
    listItems.appendItems(notificationsArr); 
    
}

function clickOnTrash(ev) {
    ev.stopPropagation();

    let notifPadre = $("a#" +  $(ev.target).attr("contenedor_id"));
    
    notifPadre.removeClass("msgread");
    notifPadre.removeClass("msgunread");
    notifPadre.addClass("msgdeleted");
    DoorsAPI.notificationsDelete( $(ev.target).attr("contenedor_id")).then(()=>{
        $("a#" +  $(ev.target).attr("contenedor_id")).parent().remove();
        setNotificationUnReadCounter($(".msgunread").length); 
    },
    (err)=>{
        let msg = "Error: La notificación no pudo ser eliminada.";
        console.log(err);
        console.log(msg);
        toast(msg);
    });
}

function clickOnEnvelope(ev) {
    console.log("read fired");
    console.log("rowid:" + $(ev.target).attr("contenedor_id"))
    ev.stopPropagation();
    if($("a#" + $(ev.target).attr("contenedor_id")).hasClass("msgread")){
        DoorsAPI.notificationsUnRead($(ev.target).attr("contenedor_id")).then(
            ()=>{
                $("a#" + $(ev.target).attr("contenedor_id")).removeClass("msgread");
                $("a#" + $(ev.target).attr("contenedor_id")).addClass("msgunread");
                if($(ev.target).hasClass("ios-only")){
                    $(ev.target).text("envelope")
                }else{
                    $(ev.target).text("mail")
                }                
                console.log("unread cliecked unread", $(".msgunread").length);
                setNotificationUnReadCounter($(".msgunread").length); 
            },
            (err)=>{
                let msg = "Error: La notificación no pudo marcada como leaída.";
                console.log(err);
                console.log(msg);
                toast(msg);
            }
        );
        
    }else{
        DoorsAPI.notificationsRead($(ev.target).attr("contenedor_id")).then(
            ()=>{
                console.log("read cliecked unread", $(".msgunread").length);
                $("a#" + $(ev.target).attr("contenedor_id")).removeClass("msgunread");
                $("a#" + $(ev.target).attr("contenedor_id")).addClass("msgread");
                if($(ev.target).hasClass("ios-only")){
                    $(ev.target).text("envelope_open")
                }else{
                    $(ev.target).text("drafts")
                }      
                setNotificationUnReadCounter($(".msgunread").length); 
            },
            (err)=>{
                let msg = "Error: La notificación no pudo marcada como no leaída.";
                console.log(err);
                console.log(msg);
                toast(msg);
            });
    } 
}

function clickOnAnchor(ev) {
    let ExtraData = JSON.parse($(ev.target).closest("a").attr("extradata"))
    let doc_id = ExtraData.doc_id;
    let fld_id = ExtraData.fld_id;
    DoorsAPI.notificationsRead($(ev.target).closest("a").attr("id"));
    searchNotifications()
    if(doc_id !== undefined && fld_id !== undefined){
        f7Page.view.router.navigate('/generic/?fld_id=' + fld_id + '&doc_id=' + doc_id); 
    }
    
};        

function setNotificationUnReadCounter(unReadCount){
    let prefixDevice = (getDevice()== "ios") ? ".ios-only" : ".md-only";
    let unReadCounterSelector = document.querySelector(prefixDevice + " .notifications-unread-counter");
    let parentIcon = document.querySelector("a[href='#view-notifications'] i" + prefixDevice);
    parentIcon.classList.add("icon");
    
    if(!unReadCounterSelector){
        unReadCounterSelector = document.createElement("span");
        unReadCounterSelector.setAttribute("class",  "notifications-unread-counter badge color-red");
        parentIcon.appendChild(unReadCounterSelector);
    }

    parentIcon.classList.remove("animated-bell");
    unReadCounterSelector.innerHTML = "";
    if(unReadCount > 0){
        parentIcon.classList.add("animated-bell");
        unReadCounterSelector.innerHTML = unReadCount;
    }else{
        unReadCounterSelector.remove();
    }
}

var globalPage;

resolveRoute({ resolve: resolve, pageEl: $page, pageInit: function (e, page) {
    globalPage = page;
    pageInitMembers(e, page);
    setNotificationUnReadCounter(0);
}});

function resolveDeliverydDate(deliveryDate) {
    const diffDays = moment().diff(deliveryDate, 'days') + 1;
    if (diffDays > 1) {
        return moment(deliveryDate).format("DD/MM/YYYY hh:mm");
    }
    return moment(deliveryDate).fromNow();
}

function getDevice(){
    if(app7.device.ios){
        return "ios"
    }else{
        return "android"
    }
}

// Usar solo despues del pageInit
function $get(pSelector) {
	return $(pSelector, f7Page.pageEl);
}
