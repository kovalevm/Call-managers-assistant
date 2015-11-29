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

CallManagersAssistant.prototype.addBannerToPage =
    function addBannerToPage (text, notAlertTodayCheckbox, color) {

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
 * @param   {string} hostname
 * @returns {boolean}
 */
CallManagersAssistant.prototype.hasHostname =
    function hasHostname(hostname) {
     return this.BD[hostname] ? true : false;
};

