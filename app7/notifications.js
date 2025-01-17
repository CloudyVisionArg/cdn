/*
Panel de notificaciones del APP
Para incluirlo, agregar la opcion de menu de la sig forma:

    tabs.push({
        viewid: 'view-notifications',
        label: 'Notificaciones',
        url: '/cdn/?script=app7-notifications',
        iosicon: '<div class="icon">bell</div>',
        mdicon: '<div class="icon">notifications</div>',
    });

IMPORTANTE: Los iconos deben estar wrappeados en el DIV para que funcione la animacion
*/
var pageActions, selModeActions;

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


var selectionMode = false;

console.log("notifications")

injectCSS(`
    .notifications .list.media-list .item-title, .notifications .list.media-list .item-subtitle {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden !important;
        text-overflow: ellipsis;
        white-space: pre-wrap;
        -webkit-line-clamp: 2;
    }

    .notifications .msgunread{
        background: rgba(var(--f7-theme-color-rgb), 0.3);
    }

    .notifications .msgread{
        background-color: transparent;
    }

    .notifications .btnRead, .notifications .btnDelete{
        margin-left: 1rem;
        color: var(--f7-tabbar-link-inactive-color);
    }

    .animated-bell div.icon{
        animation: ringing-bell 4s .7s ease-in-out infinite;
    }

    @keyframes ringing-bell {
    0% { transform: rotate(0); }
    1% { transform: rotate(30deg); }
    3% { transform: rotate(-28deg); }
    5% { transform: rotate(34deg); }
    7% { transform: rotate(-32deg); }
    9% { transform: rotate(30deg); }
    11% { transform: rotate(-28deg); }
    13% { transform: rotate(26deg); }
    15% { transform: rotate(-24deg); }
    17% { transform: rotate(22deg); }
    19% { transform: rotate(-20deg); }
    21% { transform: rotate(18deg); }
    23% { transform: rotate(-16deg); }
    25% { transform: rotate(14deg); }
    27% { transform: rotate(-12deg); }
    29% { transform: rotate(10deg); }
    31% { transform: rotate(-8deg); }
    33% { transform: rotate(6deg); }
    35% { transform: rotate(-4deg); }
    37% { transform: rotate(2deg); }
    39% { transform: rotate(-1deg); }
    41% { transform: rotate(1deg); }
    43% { transform: rotate(0); }
    100% { transform: rotate(0); }
    }
`);

var $page =   getPage({
                id: 'notifications' + getGuid(),
                title: "Notificaciones",
                leftbutton: 'search',
                rightbutton: 'menu',
                searchbar: 2,
                subnavbar: false,
                pulltorefresh: true,
            });

$page.addClass('notifications');

var $navbar = $page.find('.navbar');

$pageCont = $page.find('.page-content');
//todo: cargar la pag en iframe (ver codelib pruebas)

// Evento del Pull To Refresh
$pageCont.on('ptr:refresh', function (e) {
    if (selectionMode) {
        toast('Refresh disabled in selection mode');
    } else {
        pageInitMembers(e, globalPage);        
    }
    e.originalEvent.detail(); // done
});


var $btn = $page.find('.navbar-inner .left .link')
$btn.attr('id', 'buttonSearch');
$btn.click(function (e) {
    searchBar.enable();
})

 // Boton Cancelar Selection Mode
// $btn = getLink({ text: 'Cancelar' });
// $btn.attr('id', 'buttonCancel');
// $btn.appendTo($page.find('.navbar-inner .right'));
//  $btn.on('click', function (e) {
//     //  toggleSelectionMode();
//  });
// $btn.hide();

// Boton Acciones
$btn = getLink({ iosicon: 'menu', mdicon: 'menu' });
$btn.attr('id', 'buttonActions');
$btn.appendTo($page.find('.navbar-inner .left'));
$btn.on('click', function (e) {
    selModeActions.open();
});
$btn.css('margin-left', '0px');
$btn.hide();


// Boton Menu (fldActions)
$btn = $page.find('.navbar-inner .right .link')
$btn.attr('id', 'buttonMenu');
$btn.on('click', function (e) {
    pageActions.open();
});

 // Acciones de carpeta
 var stdPageActions = [
    {
        text: 'Borrar Todas',
        onClick: notificationsDeleteAll,
    },
    {
        text: 'Marcar Todas como le&iacute;das',
        onClick: notificationsReadAll,
        
    },
    {
        text: 'Cancelar',
        color: 'red',
        close: true,
    },
];


function notificationsReadAll(){
    DoorsAPI.notificationsReadAll().then(()=>{
        searchNotifications();
    })
}

function notificationsDeleteAll(){
    DoorsAPI.notificationsDeleteAll().then(()=>{
        searchNotifications();
    })
}

pageActions = app7.actions.create({ buttons: stdPageActions });


function dummyClick(texto){
    console.log(texto);
}

// Inicializa el Searchbar
var timeout;
var searchBar = app7.searchbar.create({
    el: $page.find('form.searchbar')[0],
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
var $divActions = $("<div/>",{"class":"actions-container"}).appendTo($pageCont);
$divActions.hide();
var $listMembers = $("<div/>", {"class": "list virtual-list media-list chevron-center text-select-none", "style" : "margin-top:0px"}).appendTo($pageCont);
var $ulMembers = $("<ul/>").appendTo($listMembers);

$ulMembers.on("click",(ev)=>{
        if(ev.target.classList.contains("swipeoutBtnRead")){
            clickOnEnvelope(ev);
        }else if(ev.target.classList.contains("swipeoutBtnDel")){
            clickOnTrash(ev);
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
            const fechaDelivery = new Date(item["DeliveryDate"]);
            let fechaNotif = resolveDeliverydDate(fechaDelivery);

            let ul  = $("<ul />"); 
            let li  = $("<li />", {"class":"swipeout"}).appendTo(ul);
            
            let swipContent = $("<div/>",{"class":"swipeout-content"}).appendTo(li);
            let a   = $("<a />", {"class":"item-link item-content " + item.readclass, "extradata": JSON.stringify(item.ExtraData), "href":"#", "id":item.Id}).appendTo(swipContent);
                    
            let contenedor = $("<div />",{"class":"item-inner "}).appendTo(a);
            
            let titleRow = $("<div />", {"class":"item-title-row"}).appendTo(contenedor);
            
            let subtitle = $("<div />", {"class":"item-title","text":item.Title})
            subtitle.appendTo(titleRow);
            
            let title = $("<div />", {"class":"item-after","text":fechaNotif})
            title.appendTo(titleRow);
            
            let text = $("<div />", {"class":"item-subtitle","text":item.Body});
            text.appendTo(contenedor);
            
            //let swipActionLeft = $("<div/>",{"class":"swipeout-actions-left"}).appendTo(li);
            let swipActionRight = $("<div/>",{"class":"swipeout-actions-right"}).appendTo(li);
            
            let swipBtnMark = $("<a/>",{"class":"swipeoutBtnRead swipeout-close"}).appendTo(swipActionRight);
                        
            let iconSwipBtnMark_ios = $("<i/>",{"class":"f7-icons if-not-md","text":item.readicon_ios}).appendTo(swipBtnMark);
            let iconSwipBtnMark_android = $("<i/>",{"class":"material-icons md-only","text":item.readicon_md}).appendTo(swipBtnMark);
            
            let swipBtnDel = $("<a/>",{"class":"swipeoutBtnDel swipeout-overswipe swipeout-delete"}).appendTo(swipActionRight);

            let iconSwipBtnDel_ios = $("<i/>",{"class":"f7-icons if-not-md","text":"trash_fill"}).appendTo(swipBtnDel);
            let iconSwipBtnDel_android = $("<i/>",{"class":"material-icons md-only","text":"delete_sweep"}).appendTo(swipBtnDel);
            
            
            //let swipBtnClose = $("<a/>",{"class":"swipeout-overswipe swipeout-close","text":"Cerrar?"}).appendTo(swipActionLeft);

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
    if (!selectionMode){
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
}

/**
 * Expone la funcion refrehnotification para ser llamada cuando se recibe una nueva notificacion
 */
window.refreshNotifications = searchNotifications;
console.log("refreshNotificacions defined" );

function renderMembers(notificationsArr){
    const listItems = app7.virtualList.get($get('.virtual-list')[0]);
    setNotificationUnReadCounter(notificationsArr.filter(n=>n.ReadDate == null).length);

    if(notificationsArr.length > 0){
        $divActions.hide();
    }else{
        let msjNoHayNotif = $("<div />", {"class":"list simple-list","style":"margin-top: 0;margin-bottom: 0;"}).appendTo($divActions);
        let ul = $("<ul />").appendTo(msjNoHayNotif);
        let li =  $("<li class='no-results' />")
        li.text("Sin notificaciones").appendTo(ul);
        $divActions.show();
    }
    listItems.deleteAllItems();
    listItems.appendItems(notificationsArr); 
    
}



function getSelected(invertSelection = false) {
    var selected = [];
    if(!invertSelection){
        $('input[type="checkbox"]:checked', $listMembers).each(function (ix, el) {
            selected.push(parseInt($(this).closest('label').attr('id')));
        })
    }else{
        $('input[type="checkbox"]:not(:checked)', $listMembers).each(function (ix, el) {
            selected.push(parseInt($(this).closest('label').attr('id')));
        })
    }
    return selected;
}

function notificationsMenuSelectAll(){
    // toggleSelectionMode();
    let allNotif = $('input[type="checkbox"]', $listMembers);
    allNotif.prop("checked", true);
}

function notificationsReadSelected(){
    let arrSeleccionadas = getSelected();
    arrSeleccionadas.forEach((id)=>{
        DoorsAPI.notificationsRead(id).then(
            ()=>{
                $("#" + id).removeClass("msgunread");
                $("#" + id).addClass("msgread");
                setNotificationUnReadCounter($(".msgunread").length); 
            },
            (err)=>{
                let msg = "Error: La notificación no pudo ser marcada como no leída.";
                console.log(err);
                console.log(msg);
                toast(msg);
            });
    })
}

function notificationsUnReadSelected(){
    let arrSeleccionadas = getSelected();
    arrSeleccionadas.forEach((id)=>{
        DoorsAPI.notificationsUnRead(id).then(
            ()=>{
                $("#" + id).removeClass("msgread");
                $("#" + id).addClass("msgunread");
                setNotificationUnReadCounter($(".msgunread").length); 
            },
            (err)=>{
                let msg = "Error: La notificación no pudo ser marcada como no leída.";
                console.log(err);
                console.log(msg);
                toast(msg);
            });
    })
}

function notificationsDeleteSelected(){
    let arrSeleccionadas = getSelected()
    arrSeleccionadas.forEach((id)=>{
        let notifPadre = $("#" + id);
    
        notifPadre.removeClass("msgread");
        notifPadre.removeClass("msgunread");
        notifPadre.addClass("msgdeleted");
        DoorsAPI.notificationsDelete(id).then(()=>{
            $("#" + id).parent().remove();
            setNotificationUnReadCounter($(".msgunread").length); 
        },
        (err)=>{
            let msg = "Error: La notificación no pudo ser eliminada.";
            console.log(err);
            console.log(msg);
            toast(msg);
        });
    })
}

function clickOnTrash(ev) {
    console.log("CLICKONTRASH")
    ev.stopPropagation();

    let notifLink = $(ev.target).parent().siblings(".swipeout-content").find("a.item-link");
    
    notifLink.removeClass("msgread");
    notifLink.removeClass("msgunread");
    notifLink.addClass("msgdeleted");
    DoorsAPI.notificationsDelete(notifLink.attr("id")).then(()=>{
        //$("a#" +  $(ev.target).attr("contenedor_id")).parent().remove();
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
    debugger;
    console.log($(ev.target));
    let notifLink = $(ev.target).parent().siblings(".swipeout-content").find("a.item-link");

    if(notifLink.hasClass("msgread")){
        DoorsAPI.notificationsUnRead(notifLink.attr("id")).then(
            ()=>{
                notifLink.removeClass("msgread");
                notifLink.addClass("msgunread");

                $(ev.target).children('.if-not-md').text("envelope")
             
                $(ev.target).children('.md-only').text("mail")

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
        DoorsAPI.notificationsRead(notifLink.attr("id")).then(
            ()=>{
                console.log("read cliecked unread", $(".msgunread").length);
                notifLink.removeClass("msgunread");
                notifLink.addClass("msgread");
               
                $(ev.target).children('.if-not-md').text("envelope_open")
             
                $(ev.target).children('.md-only').text("drafts")
                 
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

async function clickOnAnchor(ev) {
    if(ev.target.closest("a")){
        if(ev.target.closest("a").hasAttribute("extradata")){
            let ExtraData = JSON.parse(ev.target.closest("a").getAttribute("extradata"))
            let doc_id = ExtraData.doc_id;
            let fld_id = ExtraData.fld_id;
            debugger;
            if($(ev.target).closest("a").hasClass("msgunread")){
                $(ev.target).closest("a").removeClass("msgunread");
                $(ev.target).closest("a").addClass("msgread");
                setNotificationUnReadCounter($(".msgunread").length);
            }
            DoorsAPI.notificationsRead($(ev.target).closest("a").attr("id"));
            searchNotifications()
            if(doc_id !== undefined && fld_id !== undefined){
                f7Page.view.router.navigate('/generic/?fld_id=' + fld_id + '&doc_id=' + doc_id);
                let folder = await DoorsAPI.foldersGetFromId(fld_id);
                let finalUrl = formUrlRoute(folder.Form.UrlRaw);
            }
        }
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
    var filterDeliveryDate = "DD/MM/YYYY hh:mm";
    if(moment().year() - moment(deliveryDate).year() > 0){
        filterDeliveryDate = "DD/MM hh:mm";
    }

    if (diffDays > 1) {
        return moment(deliveryDate).format(filterDeliveryDate);
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

function injectCSS(css){
    let el = document.createElement('style');
    el.type = 'text/css';
    el.innerHTML = css;
    document.head.appendChild(el);
    return el;
};


function getItemContent(obj) {
    var $cont;

    obj.classList.remove("item-checkbox","item-link")
   
    if (selectionMode) {
        $cont = $('<label/>', {
            class: 'item-checkbox',
        });
    
        $('<input/>', {
            type: 'checkbox',
        }).appendTo($cont);
    
        $('<i/>', {
            class: 'icon icon-checkbox',
        }).appendTo($cont);
    
    } else {
        $cont = $('<a/>', {
            href: '#',
            class: 'item-link',
        });
    }
    
    //para que no se pierdan los atributos custom del elemento
    obj.getAttributeNames().forEach((item)=>{
        if(item == "class"){
            $cont.addClass(obj.getAttribute(item))        
        }else if(item != "href"){
            $cont.attr(item, obj.getAttribute(item));
        }
    })

    return $cont;
}

const notifOnDeleted = () => {
    console.log('notifOnDeleted Triggered');
}


// function toggleSelectionMode() {
//     var $itemContent;

//     if (selectionMode) {
//         // Desactivar
//         selectionMode = false;

//         $get('.media-list label.item-checkbox.item-content').replaceWith(function () {
//             var $itemContent = getItemContent(this);
//             $itemContent.append($(this).children(':not(input:checkbox, i.icon-checkbox)'));
//             return $itemContent;
//         });

//         if (searchBar.enabled) {
//             $navbar.addClass('with-searchbar-expandable-enabled');
//             searchBar.el.show();
//         }
  
//         $divActions.hide();
//         $navbar.find('#buttonSearch').show();
//         $navbar.find('#buttonMenu').show();
//         $navbar.find('#buttonActions').hide();
//         $navbar.find('#buttonCancel').hide();

//     } else {
//         // Activar
//         selectionMode = true;

//         $get('.media-list a.item-link.item-content').replaceWith(function () {
//             $itemContent = getItemContent(this);
//             $itemContent.append($(this).contents());
//             return $itemContent;
//         });

//         if (searchBar.enabled) {
//             searchBar.el.hide();
//             $navbar.removeClass('with-searchbar-expandable-enabled');
//         }
  
//         $divActions.show();
//         $navbar.find('#buttonSearch').hide();
//         $navbar.find('#buttonMenu').hide();
//         $navbar.find('#buttonActions').show();
//         $navbar.find('#buttonCancel').show();
//     }

//     app7.navbar.size($navbar);
// }

// function taphold(e) {
//     console.log("TAPHOLD");
//     var $list = $(this).closest('div.list');
//     if ($list.hasClass('media-list')) {
//         var $li = $(this).closest('li');
//         toggleSelectionMode();
//         $li.find('input:checkbox').prop('checked', true);
//     };
// };


