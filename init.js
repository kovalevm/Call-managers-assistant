chrome.storage.local.get('CallManagersAssistant', function (result) {

    var config = new Config();
    if ( window.location.hostname.replace('www.', '') === 'yandex.ru') {
        log('Это Яндекс. Прерываем скрипт.');
        return;
    }

    var CMA = result['CallManagersAssistant'];
    if (isEmptyObject(CMA)) {
        CMA = new Object();
        CMA.BD = new Object();
    } else {
        CMA = JSON.parse(CMA);
    }
    log(CMA);

    var app = new App(CMA.login, CMA.pass);

    if (!!!CMA.logAndPassСorrectly || CMA.logAndPassСorrectly === false) {
        app.addBannerToPage(config.bannerMessages['incorrectLogin'], false);
        log('Ошибка с логином и паролем. Прерываем скрипт.');
        return false;
    }



    app.checkHostname(CMA);

});
