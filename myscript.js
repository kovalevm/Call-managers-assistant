var hostname = window.location.hostname;
$(document).ready(function() {
    chrome.storage.local.get('CallManagersAssistant', function(result) {
         var CallManagersAssistant = result['CallManagersAssistant'];
         if ($.isEmptyObject(CallManagersAssistant)) {
             var CallManagersAssistant = new Object();
         }

        CallManagersAssistant = JSON.parse(CallManagersAssistant);
        console.log(CallManagersAssistant);
        if ($.isEmptyObject(CallManagersAssistant.BD[hostname])) {

             $.ajax({
        	type: "GET",
            url: "http://bunker-yug.ru/seo_status.php",
            data: "d="+ hostname +"&psw=Ob_k0j_WBeu95fJIPUdv",
            cache: false,
            success: function(data){

                data = JSON.parse(data);
                console.log(data);
                if (data.result == 'err') {
                    console.log('CallManagersAssistant error, server answer - ' + data);
                    CallManagersAssistant.BD[hostname].thereInBunker = false;
                } else if (data.code == '001')  {
                    CallManagersAssistant.BD[hostname].thereInBunker = false;
                }
                else if (data.result == 'ok' && data.code == '002') {
                    CallManagersAssistant.BD[hostname] = {
                      thereInBunker : true,
                      status : data.status,
                      reportingDate : data.date,
                      notAlertClickTime : 0
                  }
                } else {
                     CallManagersAssistant.BD[hostname].thereInBunker = false;
                }

                checkNeedBannerOrNot(CallManagersAssistant.BD[hostname]);
            }
            });


        }




        chrome.storage.local.set({'CallManagersAssistant': JSON.stringify(CallManagersAssistant)});
     });
 });


 function checkNeedBannerOrNot(hostnameInfo)  {
        if ( hostnameInfo.thereInBunker) {
            var today = new Date();
            if (!(  (hostnameInfo.notAlertClickTime + (12*60*60*1000)) > today.getTime()   )) {
                    showBanner(hostnameInfo);
                }
        }
    }

function showBanner(infoFromBunker) {
    console.log(createMessage(infoFromBunker));
    addBannerToTopPage(createMessage(infoFromBunker));

    $('#mk_close').click( function(){ // ловим клик по крестику
        $('#mkmessage').css('display', 'none');
    });

    $('#notAlertToday').click( function() {
        var today = new Date();
        chrome.storage.local.get('CallManagersAssistant', function(result) {
             var CallManagersAssistant = result['CallManagersAssistant'];
            CallManagersAssistant = JSON.parse(CallManagersAssistant);
            CallManagersAssistant.BD[hostname].notAlertClickTime = today.getTime();
            chrome.storage.local.set({'CallManagersAssistant': JSON.stringify(CallManagersAssistant)});
        });
    });
}


function createMessage(infoFromBunker) {
    if (!infoFromBunker.thereInBunker) { return 'Нет в базе!'; }
    return 'Есть в базе. Статус продвижения - ' + infoFromBunker.status + ', отчетная дата - ' + infoFromBunker.reportingDate + '.';    
}

function addBannerToTopPage(message) {
    $('body').prepend(
    '<div id="mkmessage" ><span id="mk_close" >X</span><p >'+ message +'</p> <p style="margin:0; font-size:15px;"> <label for="notAlertToday"><input type="checkbox" id="notAlertToday">Не оповещать меня сегодня об этом</label></p></div>'
    )
}
