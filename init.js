chrome.storage.local.get('CallManagersAssistant', function (result) {

    var CMA = result['CallManagersAssistant'];
    if (isEmptyObject(CMA)) {
        CMA = new Object();
        CMA.BD = new Object();
    } else {
        CMA = JSON.parse(CMA);
    }

    if (!!!CMA.logAndPassСorrectly || CMA.logAndPassСorrectly === false) {
        this.addBannerToPage(this.messages['incorrectLogin'], false);
        log('Ошибка с логином и паролем. Выход');
        return false;
    }

    var app = new App(CMA.login, CMA.pass);

    app.checkHostname(CMA);

});
