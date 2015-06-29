var hostname = window.location.hostname;
$(document).ready(function() {
    chrome.storage.local.get('CallManagersAssistant', function(result) {
         var CallManagersAssistant = result['CallManagersAssistant'];
         if ($.isEmptyObject(CallManagersAssistant)) {
             var CallManagersAssistant = new Object();
         }

        CallManagersAssistant = JSON.parse(CallManagersAssistant);

        if ($.isEmptyObject(CallManagersAssistant.BD[hostname])) {
             //запрос
            CallManagersAssistant.BD[hostname] = {
                  thereInBunker : true,
                  status : 'не крутим',
                  reportingDate : '14 апр 1147',
                  notAlertClickTime : 0
              }
        }

        if ( CallManagersAssistant.BD[hostname].thereInBunker) {
            var today = new Date();
            if (!(  (CallManagersAssistant.BD[hostname].notAlertClickTime + (12*60*60*1000)) > today.getTime()   )) {
                    showBanner(CallManagersAssistant.BD[hostname]);
                }
        }

        chrome.storage.local.set({'CallManagersAssistant': JSON.stringify(CallManagersAssistant)});
     });
 });



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
    '<div id="mkmessage" style="width: 100%; background-color: rgb(255, 74, 74);  position: fixed;  top: 0;  left: 0;  z-index: 100500000000; text-align: center; ">    <span id="mk_close" style="width: 23px;	height: 21px; position: absolute;	top: 5px;	right: 10px;	cursor: pointer;display: block;background-color: white;  border-radius: 50%;  font-size: 20px;">X</span>    <p style="margin:5px 0; font-size: 24px; color:black">'+ message +'</p> <p style="margin:0; font-size:15px; color:black"> <label for="notAlertToday"><input type="checkbox" id="notAlertToday">Не оповещать меня сегодня об этом</label></p></div>'
    )
}
