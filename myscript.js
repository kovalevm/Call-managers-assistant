var hostname = punycode.toUnicode(window.location.hostname);
var hostnameBL = hostname;
if (hostname.indexOf("www.") === 0)
    hostnameBL = hostname.substr(4);
//console.log(hostname);
var milisecInDay = (24 * 60 * 60 * 1000);
var month = milisecInDay * 30;
console.log(hostname + ' ' + hostnameBL);


chrome.storage.local.get('CallManagersAssistant', function (result) {
    var CMA = result['CallManagersAssistant'];
    //console.log(CMA);
    if ($.isEmptyObject(CMA)) {
        CMA = new Object();
        CMA.BD = new Object();
    } else {
        CMA = JSON.parse(CMA);
    }

    if (!!!CMA.logAndPassСorrectly || CMA.logAndPassСorrectly === false) {
        inputLoginAndPasswordBitch();
        return; //выход
    }


    $.post(
        "http://strikerdeveloper.myjino.ru/blackList.php", {
            action: 'api',
            hostname: hostnameBL
        },
        function (resp) {
            //resp = JSON.parse(resp);
            console.log(resp);
            if (resp.code === 0) console.log('Ошибка в бд черного листа');
            if (resp.code === 2) {
                $(document).ready(function () {
                    $('body').prepend('<div id="mkmessage2" style="background-color:rgb(255, 2, 2)"><span id="mk_close2" >X</span><p>' + 'Этот сайт есть в ЧС!!' + '</p></div>');

                    $('#mk_close2').click(function () { // ловим клик по крестику
                        $('#mkmessage2').css('display', 'none');
                    });

                });
            }
        });
    //console.log(CMA);

    // Проверка есть ли инфа об этом сайте в памяти и не старше ли она месяца
    var todayTime = (new Date()).getTime();
    if (!!CMA.BD[hostname] && ((CMA.BD[hostname].ajaxTime + month) > todayTime)) {
        checkNeedBannerOrNot(CMA.BD[hostname]);
        return; //выход
    }

    /*
        var bunResp = $.ajax({
            url: "http://bunker-yug.ru/seo_status.php",
            data: "login=" + CMA.login + "&pass=" + CMA.pass + "&d=" + hostname,
            async: false
        }).responseText;
    */



    $.get(
        "http://bunker-yug.ru/seo_status.php", {
            login: CMA.login,
            pass: CMA.pass,
            d: hostname
        },
        function (bunResp) {
            bunResp = JSON.parse(bunResp);
            //console.log(bunResp);

            if (bunResp.result === 'err') {
                console.log(bunkerErrorHandler(bunResp.code));
                console.log(bunResp);
                return; //выход
                //            } else if (bunResp.code === '001') {
                //                CMA.BD[hostname] = {
                //                    thereInBunker: false
                //                };
            } else if (bunResp.result === 'ok' && bunResp.code === '002') {
                CMA.BD[hostname] = {
                    thereInBunker: true,
                    status: bunResp.status,
                    reportingDate: bunResp.date,
                    ajaxTime: (new Date()).getTime(),
                    notAlertClickTime: 0
                }
            } else if (bunResp.result_2 === 'ok' && bunResp.code_2 === '002') {
                CMA.BD[hostname] = {
                    thereInBunker: true,
                    status: 'in_main',
                    reportingDate: '',
                    ajaxTime: (new Date()).getTime(),
                    notAlertClickTime: 0
                }
            } else {
                CMA.BD[hostname].thereInBunker = false;
            }

            checkNeedBannerOrNot(CMA.BD[hostname]);
            chrome.storage.local.set({
                'CallManagersAssistant': JSON.stringify(CMA)
            });
        });
});



function checkNeedBannerOrNot(hostnameInfo) {
    if (hostnameInfo.thereInBunker) {
        var today = new Date();
        if (!((hostnameInfo.notAlertClickTime + (milisecInDay / 2)) > today.getTime())) {
            showBanner(hostnameInfo);
        }
    }
}

function showBanner(infoFromBunker) {
    $(document).ready(function () {
        addBannerToTopPage(createMessage(infoFromBunker), detectedStatus(infoFromBunker.status));

        $('#mk_close').click(function () { // ловим клик по крестику
            $('#mkmessage').css('display', 'none');
        });

        $('#notAlertToday').click(function () {
            saveAttr_notAlertClickTime();
        });
    });

}


function createMessage(infoFromBunker) {
    if (infoFromBunker.status === 'in_main') {
        return 'Есть в главных.';
    }
    var status = detectedStatus(infoFromBunker.status);
    return 'Есть в базе. Статус продвижения - <ins>' + status + '</ins>, отчетная дата - ' + infoFromBunker.reportingDate + '.';
}

function addBannerToTopPage(message, status) {
    var banner = '<div id="mkmessage" style="background-color:';
    if (status === 'продвигается') banner += 'rgb(255, 74, 74)';
    else banner += 'rgb(75, 240, 75)';
    $('body').prepend(
        banner + ' "><span id="mk_close" >X</span><p>' + message + '</p> <p style="margin:0; font-size:15px;"> <label for="notAlertToday"><input type="checkbox" id="notAlertToday">Не оповещать меня сегодня об этом</label></p></div>'
    );
}

function detectedStatus(statusNumber) {
    if (statusNumber === '4') return 'не продвигается';
    return 'продвигается'
}

function saveAttr_notAlertClickTime() {
    var today = new Date();
    chrome.storage.local.get('CallManagersAssistant', function (result) {
        var CMA = result['CallManagersAssistant'];
        CMA = JSON.parse(CMA);
        //console.log(CMA.BD);
        CMA.BD[hostname].notAlertClickTime = today.getTime();
        chrome.storage.local.set({
            'CallManagersAssistant': JSON.stringify(CMA)
        });
    });
}

function inputLoginAndPasswordBitch() {
    $(document).ready(function () {
        var banner = '<div id="mkmessage" style="background-color:';
        banner += 'rgb(255, 74, 74)';
        var message = 'Логин или пароль введены неверно или не введены вообще. Введите их, нажав на иконку с красной телефонной трубкой справа от адресной строки.';
        //console.log('banner go!');
        $('body').prepend(
            banner + ' "><p>' + message + '</p></div>'
        );
    });
}



function bunkerErrorHandler(errorCode) {
    switch (errorCode) {
        case '002':
            return 'Ошибка баз данных бункера'
        case '004':
            return 'Не задан домен при заапросе к бд бункера'
        case '005':
            return 'Вы не уложилось во время работы бункера'
        default:
            return 'Неизвестная ошибка с кодом ' + errorCode
    }
}
