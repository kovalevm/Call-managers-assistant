var App = function (login, pass) {
    this.hostname = window.location.hostname.replace('www.', '');
    this.login = login;
    this.pass = pass;

    this.APIblackList = 'http://mihail.ves-yug.ru/black_list_sites/api/';
    this.ParamsblackList =/* 'hostname=' +*/ this.hostname;
//    this.BlackListAjax =
//        new Ajax(this.APIblackList, 'POST', this.ParamsblackList);
    this.BlackListAjax =
        new Ajax(this.APIblackList + this.ParamsblackList);

    this.APIBunker = 'http://bunker-yug.ru/seo_status.php?' +
        'login=' + this.login +
        '&pass=' + this.pass +
        '&d=' + this.hostname;
    this.BunkerAjax = new Ajax(this.APIBunker);

    this.messages = {
        incorrectLogin: 'Логин или пароль введены неверно или не введены вообще. Введите их, нажав на иконку с красной телефонной трубкой справа от адресной строки.',
        inMain: 'Есть упоминание об этом сайте в главных!',
        inCustomer: 'Есть в базе. Статус продвижения - <ins>%status%</ins>, отчетная дата - %repDate%.',
        inBlackList: 'Этот сайт есть в ЧС!!'
    }

    this.bunkerErrors = {
        '002': 'Ошибка баз данных бункера',
        '004': 'Не задан домен при запросе к бд бункера',
        '005': 'Вы не уложилось во время работы бункера',
        default: 'Неизвестная ошибка'
    }
}


App.prototype.hostnameInStorage = function (storage) {
    return storage.BD[this.hostname] ? true : false;
}

App.prototype.chooseMessageAndShowBanner = function (host) {
    console.log('Началось chooseMessageAndShowBanner c host:');
    console.log(host);
    var milisecInDay = (24 * 60 * 60 * 1000);

    //если у него стоить галочка 'Не оповещать сегодня'
    if ((host.notAlertClickTime + (milisecInDay / 2)) > (new Date()).getTime())
        return; //выход
    console.log('\tПрошли проверку на галку Не оповещать сегодня')

    //если сайт находиться в бункере
    if (host.thereInBunker) {
        console.log('\tЕсть такой сайт в бункере');
        //если в главных
        if (host.status === 'in_main') {
            this.addBannerToPage(this.messages['inMain']);
            return; //выход
        }

        //если сайт находиться в основной базе
        var status = host.status == '4' ? 'не продвигается' : 'продвигается';
        var message = this.messages['inCustomer']
            .replace('%status%', status)
            .replace('%repDate%', host.reportingDate);
        var color = status === 'не продвигается' ? 'green' : 'red';
        this.addBannerToPage(message, true, color);
        return; //выход
    }

    //если есть такой сайт в черном листе
    if (host.thereInBlackList) {
        console.log('\tЕсть такой сайт в ЧС');
        this.addBannerToPage(this.messages['inBlackList']);
        return; //выход
    }
}

App.prototype.parseStorage = function (result) {
    if (isEmptyObject(result)) {
        result = new Object();
        result.BD = new Object();
    } else {
        result = JSON.parse(result);
    }
    return result;
}

App.prototype.checkLoginAndPass = function (CMA) {
    if (!!!CMA.logAndPassСorrectly || CMA.logAndPassСorrectly === false) {
        this.addBannerToPage(this.messages['incorrectLogin'], false);
        return false;
    }
    return true;
}

App.prototype.checkHostname = function (CMA) {

    //если есть такой сайт в CMA
    if (this.hostnameInStorage(CMA) && (CMA.BD[this.hostname].thereInBlackList !== undefined || CMA.BD[this.hostname].thereInBunker !== undefined)) {
        this.chooseMessageAndShowBanner(CMA.BD[this.hostname]);
    }

    if (location.protocol == 'https:') return;
    if (!this.hostnameInStorage(CMA)) CMA.BD[this.hostname] = {};

    if (CMA.BD[this.hostname].thereInBlackList === undefined) {
        this.BlackListAjax.send(this, function (response) {
            console.group('Началось BlackListAjax.send');
            console.log(response);
            var resp = JSON.parse(response);

            if (resp.code === 0) {
                console.log('Ошибка в бд черного листа');
                console.groupEnd();
                return;
            }

            CMA.BD[this.hostname].ajaxTime = (new Date()).getTime();
            CMA.BD[this.hostname].notAlertClickTime = 0;


            if (resp.code === 2) {
                CMA.BD[this.hostname].thereInBlackList = true;
            } else {
                CMA.BD[this.hostname].thereInBlackList = false;
                //BLcomment: bunResp.status,
            }


            chrome.storage.local.set({
                'CallManagersAssistant': JSON.stringify(CMA)
            });
            console.groupEnd();
            this.chooseMessageAndShowBanner(CMA.BD[this.hostname]);

        });
    }
    if (CMA.BD[this.hostname].thereInBunker === undefined) {
        this.BunkerAjax.send(this, function (response) {
            console.group('Началось BunkerAjax.send');
            var bunResp = JSON.parse(response);

            if (bunResp.result === 'err') {
                console.log('Ошибка АПИ бункера: ' + this.bunkerErrors[bunResp.code]);
                console.log(bunResp);
                console.groupEnd();
                return;
            }

            if (bunResp.result === 'ok' || bunResp.result_2 === 'ok') {

                CMA.BD[this.hostname].ajaxTime = (new Date()).getTime();
                CMA.BD[this.hostname].notAlertClickTime = 0;

                if (bunResp.code === '002') {

                    CMA.BD[this.hostname].thereInBunker = true;
                    CMA.BD[this.hostname].status = bunResp.status;
                    CMA.BD[this.hostname].reportingDate = bunResp.date;

                } else if (bunResp.code_2 === '002') {
                    CMA.BD[this.hostname].thereInBunker = true;
                    CMA.BD[this.hostname].status = 'in_main';
                    CMA.BD[this.hostname].reportingDate = '';

                } else {
                    CMA.BD[this.hostname].thereInBunker = false;
                }
            }

            //console.log(CMA);
            chrome.storage.local.set({
                'CallManagersAssistant': JSON.stringify(CMA)
            });
            this.chooseMessageAndShowBanner(CMA.BD[this.hostname]);
            console.groupEnd();
        });
    }
}

App.prototype.addBannerToPage = function (text, notAlertTodayCheckbox, color) {
    console.log('Началось addBannerToPage');
    //Проверяем есть ли сейчас уже баннер
    if (document.getElementById('mkmessage')) return;

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

    document.getElementById('notAlertToday').addEventListener('click', function (el) {
        var hostname = window.location.hostname.replace('www.', '');
        var today = new Date();
        chrome.storage.local.get('CallManagersAssistant', function (result) {
            var CMA = result['CallManagersAssistant'];
            CMA = JSON.parse(CMA);
            //console.log(CMA.BD);
            CMA.BD[hostname].notAlertClickTime = today.getTime();
            console.log(CMA);
            chrome.storage.local.set({
                'CallManagersAssistant': JSON.stringify(CMA)
            });
        });
        document.getElementById('mkmessage').setAttribute('class', 'hideMK');
    })
}

chrome.storage.local.get('CallManagersAssistant', function (result) {
    var app = new App();
    var CMA = app.parseStorage(result['CallManagersAssistant']);
    console.log(CMA);

    if (! app.checkLoginAndPass(CMA) ) return;

    app.checkHostname(CMA);
});

function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
}

