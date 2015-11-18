var App = function (login, pass) {
    this.hostname = window.location.hostname.replace('www.', '');
    this.login = login;
    this.pass = pass;
    this.config = new Config();

    this.ParamsblackList = this.hostname;
    this.BlackListAjax =
        new Ajax(this.config.APIblackList + this.ParamsblackList);

    this.ParamsBunker =
        'login=' + this.login +
        '&pass=' + this.pass +
        '&d=' + this.hostname;
    this.BunkerAjax = new Ajax(this.config.APIBunker + this.ParamsBunker);

}


App.prototype.hostnameInStorage = function (storage) {
    return storage.BD[this.hostname] ? true : false;
}

App.prototype.chooseMessageAndShowBanner = function (host) {
    log('Началось chooseMessageAndShowBanner c host:');
    log(host);
    var milisecInDay = (24 * 60 * 60 * 1000);

    //если у него стоить галочка 'Не оповещать сегодня'
    if ((host.notAlertClickTime + (milisecInDay / 2)) > (new Date()).getTime()) {
        log('Стоит галочка "Не оповещать сегодня". Прерываем скрипт.')
        return false; //выход
    }


    //если есть такой сайт в черном листе
    if (host.thereInBlackList) {
        log('Есть такой сайт в ЧС');
        this.addBannerToPage(this.config.bannerMessages['inBlackList']);
        return true; //выход
    }

    //если сайт находиться в бункере
    if (host.thereInBunker) {
        log('Есть такой сайт в бункере');
        //если в главных
        if (host.status === 'in_main') {
            this.addBannerToPage(this.config.bannerMessages['inMain']);
            return true; //выход
        }

        //если сайт находиться в основной базе
        var status = host.status == '4' ? 'не продвигается' : 'продвигается';
        var message = this.config.bannerMessages['inCustomer']
            .replace('%status%', status)
            .replace('%repDate%', host.reportingDate);
        var color = status === 'не продвигается' ? 'green' : 'red';
        this.addBannerToPage(message, true, color);
        return true; //выход
    }

}

App.prototype.checkHostname = function (CMA) {

    //если есть такой сайт в CMA
    if (
        this.hostnameInStorage(CMA)
        && (
            CMA.BD[this.hostname].thereInBlackList !== undefined
            || CMA.BD[this.hostname].thereInBunker !== undefined
            || CMA.BD[this.hostname].notAlertClickTime > 0
            )
       ) {
        if (! this.chooseMessageAndShowBanner(CMA.BD[this.hostname]) )
            {
                return; //выход
            }
    }

    if (location.protocol == 'https:') return;
    if (!this.hostnameInStorage(CMA)) CMA.BD[this.hostname] = {};

    if (CMA.BD[this.hostname].thereInBlackList === undefined) {
        this.BlackListAjax.send(this, function (response) {

            var handler = new APIResponseHandler();
            CMA.BD[this.hostname] =
                handler.responseHandler('blacklist', response, CMA.BD[this.hostname]);

//            chrome.storage.local.set({
//                'CallManagersAssistant': JSON.stringify(CMA)
//            });
            this.chooseMessageAndShowBanner(CMA.BD[this.hostname]);

        });
    }

    if (CMA.BD[this.hostname].thereInBunker === undefined) {
        this.BunkerAjax.send(this, function (response) {

            var handler = new APIResponseHandler();
            CMA.BD[this.hostname] =
                handler.responseHandler('bunker', response, CMA.BD[this.hostname]);

//            chrome.storage.local.set({
//                'CallManagersAssistant': JSON.stringify(CMA)
//            });
            this.chooseMessageAndShowBanner(CMA.BD[this.hostname]);

        });
    }
}

App.prototype.addBannerToPage = function (text, notAlertTodayCheckbox, color) {
    log('Началось addBannerToPage c текстом:' + text);
    //Проверяем есть ли сейчас уже баннер
    if (document.getElementById('mkmessage')) {
        if (text === this.config.bannerMessages['inBlackList']) {
            document.getElementById('mkmessage').remove();
        } else {
            return;
        }
    }

    if (notAlertTodayCheckbox === undefined)
        notAlertTodayCheckbox = true;

    var div = document.createElement('div');
    div.setAttribute("id", "mkmessage");
    if (color === 'green')
        div.className = "mk-back-green";
    else
        div.className = "mk-back-red";
    div.innerHTML =
        '<span id="mk_close" >X</span>\
        <p>' + text + '</p>';
    if (notAlertTodayCheckbox)
        div.innerHTML += '<p id="notAlertToday">Не оповещать меня сегодня об этом</p>';

    document.body.insertBefore(div, document.body.firstChild);


    document.getElementById('mk_close').addEventListener('click', function (el) {
        document.getElementById('mkmessage').setAttribute('class', 'hideMK');
    })

    if (notAlertTodayCheckbox) {
        document.getElementById('notAlertToday').addEventListener('click', function (el) {
            var hostname = window.location.hostname.replace('www.', '');
            var today = new Date();
            chrome.storage.local.get('CallManagersAssistant', function (result) {
                var CMA = result['CallManagersAssistant'];
                CMA = JSON.parse(CMA);
                //log(CMA.BD);
                if ( isEmptyObject(CMA.BD[hostname]) ) CMA.BD[hostname] = {};
                CMA.BD[hostname].notAlertClickTime = today.getTime();
                log(CMA);
                chrome.storage.local.set({
                    'CallManagersAssistant': JSON.stringify(CMA)
                });
            });
            document.getElementById('mkmessage').setAttribute('class', 'hideMK');
        })
    }
}

//
//App.prototype.parseStorage = function (result) {
//    if (isEmptyObject(result)) {
//        result = new Object();
//        result.BD = new Object();
//    } else {
//        result = JSON.parse(result);
//    }
//    return result;
//}


//App.prototype.checkLoginAndPass = function (CMA) {
//    if (!!!CMA.logAndPassСorrectly || CMA.logAndPassСorrectly === false) {
//        this.addBannerToPage(this.messages['incorrectLogin'], false);
//        return false;
//    }
//    this.login = CMA.login;
//    this.pass = CMA.pass;
//    return true;
//}
