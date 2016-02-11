/*jshint bitwise: true, globals: true, forin: true, nonew: true, undef: true, unused: true, strict: true, latedef: true, browser: true, devel: true, browserify: true, maxdepth: 3, maxlen: 80, indent: 4*/
"use strict";

var CallManagersAssistant = function CallManagersAssistant() {
    this.BD = {};
    this.lastCheckRelevanceBD = 0;
    this.lastModifiedHTTPS = 0;
    this.logAndPassСorrectly =  '';
    this.login = '';
    this.pass =  '';
};

CallManagersAssistant.prototype.ajax =
    function ajax (api, params) {

        new Ajax(api + params).send(this, function (response) {

            log('Был совершен запрос на - ' + api + ' Ответ:');
            log(response);

            var handler = new APIResponseHandler();
            var host = handler.responseHandler(api, response);

            var banner = this.chooseBanner(host, CMAconf.banners);
            if (!banner) {
                log('Не вешаем никакой баннер. Прерываем скрипт.');
                return;
            }

            log('Есть такой сайт в одной из бд. Вешаем баннер.');
            this.addBannerToPage(banner);
            log('Повесили баннер.');
        });

}

CallManagersAssistant.prototype.chooseBanner =
    function chooseBanner (host, banners) {

        //если есть такой сайт в черном листе
        if (host.thereInBlackList) {
            return new Banner(banners.inBlackList);
        }

        //если сайт находиться в бункере
        if (host.thereInBunker) {
            //если в главных
            if (host.status === 'in_main') {
               return new Banner(banners.inMain);
            }

            //если сайт находиться в основной базе
            var inCustomerBanner = new Banner(banners.inCustomer);
            var status = host.status == '4' ?
                'не продвигается' : 'продвигается';
            inCustomerBanner.text = inCustomerBanner.text
                .replace('%status%', status)
                .replace('%repDate%', host.reportingDate);
            inCustomerBanner.color = status === 'не продвигается' ?
                'green' : 'red';
            return inCustomerBanner;

        }
    return false;
};

//CallManagersAssistant.prototype.haveBannerNow =
//    function haveBannerNow () {
//
//    return document.getElementById('mkmessage') ? true : false;
//};


CallManagersAssistant.prototype.addBannerToPage =
    function addBannerToPage (banner) {

    //Сначала проверим:
    //1.не установлен ли уже баннер?
    //2.если да, то его приритет ниже того баннера, который мы сейчас хотим разместить
    var currentBanner = document.getElementById('mkmessage');
    if (currentBanner !== null) {
        log(currentBanner.getAttribute('priority'));
        if (banner.priority <= currentBanner.getAttribute('priority')) {
            console.warn('CMA. Попытка повесить баннер меньший по приоритету.');
            return;
        } else {
            currentBanner.parentNode.removeChild(currentBanner);
        }
    }

    banner.color = banner.color || 'red';

    var div = document.createElement('div');
    div.setAttribute('id', 'mkmessage');
    div.setAttribute('priority', banner.priority);
    div.className = 'mk-back-' + banner.color;

    div.innerHTML =
        '<span id="mk_close" >X</span>' +
        '<p>' + banner.text + '</p>';

    div.innerHTML += banner.notAlertTodayCheckbox ?
        '<p id="notAlertToday">Не оповещать меня сегодня об этом</p>' : '' ;

    document.body.insertBefore(div, document.body.firstChild);
    this.scriptsForBanner(CMAconf.chromeStorageName, banner.notAlertTodayCheckbox);
};


CallManagersAssistant.prototype.scriptsForBanner =
    function scriptsForBanner(chromeStorageName, notAlertTodayCheckbox) {

    var hideBanner = function hideBanner () {
        document.getElementById('mkmessage').setAttribute('class', 'hideMK');
    };

    document.getElementById('mk_close').addEventListener('click', hideBanner);


    if (! notAlertTodayCheckbox) return;
    document.getElementById('notAlertToday')
        .addEventListener('click', function (mouse) {

        var hostname = window.location.hostname.replace('www.', '');
        var today = new Date();

        getStorage(chromeStorageName, function(storage) {
            if (storage.BD[hostname] == null) storage.BD[hostname] = {};
            storage.BD[hostname].notAlertClickTime = today.getTime();
            return storage;
        });

        hideBanner();
    });
};


CallManagersAssistant.prototype.init = function init(obj) {
    if (obj.BD) this.BD = obj.BD;
    if (obj.login) this.login = obj.login;
    if (obj.pass) this.pass = obj.pass;

    if (obj.lastCheckRelevanceBD)
        this.lastCheckRelevanceBD = obj.lastCheckRelevanceBD;

    if (obj.lastModifiedHTTPS)
        this.lastModifiedHTTPS = obj.lastModifiedHTTPS;

    if (obj.logAndPassСorrectly)
        this.logAndPassСorrectly = obj.logAndPassСorrectly;
};


/**
 * Проверяем, существует ли hostname в базе
 * и если он существует, то возвращаем его
 * @param   {string} hostname
 * @returns {boolean|obj}
 */
CallManagersAssistant.prototype.hasHostname =
    function hasHostname(hostname) {

     return this.BD[hostname] ? this.BD[hostname] : false;
};

