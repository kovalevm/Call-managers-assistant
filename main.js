/*jshint bitwise: true, globals: true, forin: true, nonew: true, undef: true, unused: true, strict: true, latedef: true, browser: true, devel: true, browserify: true, maxdepth: 3, maxlen: 80, indent: 4*/
"use strict";


//Хостнейм есть в списке игнорируемых?
if (in_array(window.location.hostname.replace('www.', ''), CMAconf.ignoreHostnames)) {
    throw new Error('Этот домен в списке игнорируемых. Прерываем скрипт.');
}

//Берем в памяти chromeStorageName
getStorage(CMAconf.chromeStorageName, function(storage) {

    var CMA = new CallManagersAssistant();
    CMA.init(storage);
    log('CallManagersAssistant:');
    log(CMA);

    //Проверяем авторизацию пользователя
    if (!!!CMA.logAndPassСorrectly || !CMA.logAndPassСorrectly) {
        var incorrectLoginBanner = new Banner(CMAconf.banners.incorrectLogin);
        incorrectLoginBanner.notAlertTodayCheckbox = false;
        CMA.addBannerToPage(incorrectLoginBanner);
        log('Ошибка с логином и паролем. Прерываем скрипт.');
        return;
    }

    //Начинаем манипуляции с хостнеймом.
    var hostnameStr = window.location.hostname.replace('www.', '');
//    hostnameStr = punycode.toUnicode(hostnameStr);

    //1. Есть ли он в нашей storage?
    //(Если есть то возвращает объект, если нет - false)
    var hostnameObj = CMA.hasHostname(hostnameStr);

    //Если hostnameObj = false и протокол https, то выход
    if (!hostnameObj && location.protocol === 'https:') {
        log('В storage нет информации о таком хостнейме + https. ' +
            'Прерываем скрипт.');
        return;
    }

    if (!hostnameObj) hostnameObj = {};

    //Если отмечено "не оповещать меня сегодня" - выход.
    if (hostnameObj.notAlertClickTime) {
        log('Отмечено "Не оповещать сегодня". Прерываем скрипт.');
        return;
    }

    if (location.protocol === 'https:') {

        var banner = CMA.chooseBanner(hostnameObj, CMAconf.banners);
        if (!banner) {
            log('Не вешаем никакой баннер. Прерываем скрипт.');
            return;
        }

        log('Есть такой сайт в одной из бд. Вешаем баннер.');
        CMA.addBannerToPage(banner);
        log('Повесили баннер. Прерываем скрипт.');

        return;
    }

    //2. Такого хостнейма нет в нашей storage и это не https
    //Делаем аяксы к нашим бд
    CMA.ajax(
        CMAconf.APIblackList,
        CMAconf.paramsBlackList(hostnameStr)
    );

    CMA.ajax(
        CMAconf.APIBunker,
        CMAconf.paramsBunker(CMA.login, CMA.pass, hostnameStr)
    );


    /*
    new Ajax(APIblackList + hostnameStr).send(this, function (response) {
        var handler = new APIResponseHandler();
        var host = handler.responseHandler('blacklist', response);

        var banner = CMA.chooseBanner(host, banners);
        if (!banner) {
            log('Не вешаем никакой баннер. Прерываем скрипт.');
            return;
        }

        log('Есть такой сайт в одной из бд. Вешаем баннер.');
        CMA.addBannerToPage(banner);
        log('Повесили баннер.');
    });

    var paramsBunker =
        'login=' + CMA.login +
        '&pass=' + CMA.pass +
        '&d=' + punycode.toUnicode(hostnameStr);
    new Ajax(APIBunker + paramsBunker).send(this, function (response) {

        var handler = new APIResponseHandler();
        var host = handler.responseHandler('bunker', response);

        var banner = CMA.chooseBanner(host, banners);
        if (!banner) {
            log('Не вешаем никакой баннер. Прерываем скрипт.');
            return;
        }

        log('Есть такой сайт в одной из бд. Вешаем баннер.');
        CMA.addBannerToPage(banner);
        log('Повесили баннер.');
    });
    */
});













/*
        //если есть такой сайт в черном листе
        if (hostnameObj.thereInBlackList) {
            log('Есть такой сайт в ЧС. Вешаем баннер.');
            CMA.addBannerToPage(new Banner(banners.inBlackList));
            log('Повесили баннер (ЧС). Прерываем скрипт.');
            return;
        }

        //если сайт находиться в бункере
        if (hostnameObj.thereInBunker) {
            log('Есть такой сайт в бункере');
            //если в главных
            if (hostnameObj.status === 'in_main') {
                log('Есть такой сайт в бункере в главных. Вешаем баннер.');
                CMA.addBannerToPage(new Banner(banners.inMain));
                log('Повесили баннер (глав). Прерываем скрипт.');
                return; //выход
            }

            //если сайт находиться в основной базе
            var inCustomerBanner = new Banner(banners.inCustomer);
            var status = hostnameObj.status == '4' ?
                'не продвигается' : 'продвигается';
            inCustomerBanner.text = inCustomerBanner.text
                .replace('%status%', status)
                .replace('%repDate%', hostnameObj.reportingDate);
            inCustomerBanner.color = status === 'не продвигается' ?
                'green' : 'red';
            log('Есть такой сайт в бункере в основной базе. Вешаем баннер.');
            CMA.addBannerToPage(inCustomerBanner);
            log('Повесили баннер (основ). Прерываем скрипт.');
            return;
        }
        */
