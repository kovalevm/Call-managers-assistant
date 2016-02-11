/*jshint bitwise: true, curly: true, globals: true, forin: true, nonew: true, undef: true, unused: true, strict: true, latedef: true, browser: true, devel: true, browserify: true, maxdepth: 3, maxlen: 80, indent: 4*/

getStorage(CMAconf.chromeStorageName, function (storage) {

    var CMA = new CallManagersAssistant();
    CMA.init(storage);
    log('CallManagersAssistant:');
    log(CMA);

    //Удаляем из бд все хосты чьи notAlertClickTime находятся не в пределе последних 12 часов. Такое условие сделано для того чтобы отсечь notAlertClickTime равный null и т.д., потому что как выяснилось на практике такое бывает.
    var halfday = (12 * 60 * 60 * 1000),
        now = (new Date()).getTime();

    for (var host in CMA.BD) {
        var nACT = CMA.BD[host].notAlertClickTime;
        if (nACT > (now - halfday) && nACT < now) {} else {
            delete CMA.BD[host];
        }
    }

    var ajax = new Ajax(CMAconf.APIblackListHTTPS);

    ajax.send(this, function (response) {
        var resp = JSON.parse(response);

        resp.actualHosts.forEach(function(host, i) {
            CMA.BD[host] = { thereInBlackList: true };
        })

        setStorage(CMAconf.chromeStorageName, CMA);
    });
});
/*
chrome.storage.local.get('CallManagersAssistant', function (result) {
    "use strict";

    var CMA = result.CallManagersAssistant;
    if (isEmptyObject(CMA)) {
         firstStart(CMA);
    } else {
        CMA = JSON.parse(CMA);
    }

    //проверяем есть ли такой объект и последняя проверка не моложе недели
    //    console.assert(CMA !== undefined, 'CMA undefined');
    //    console.assert(CMA.BD !== undefined, 'CMA.BD undefined');
    //    console.assert(!isEmptyObject(CMA.BD), 'CMA.BD isEmpty');
    //    if (CMA === undefined) return;

    var now = (new Date()).getTime();

    сheckRelevanceBD();
    сheckHTTPShosts();

    function сheckRelevanceBD() {
        var week = (24 * 60 * 60 * 1000) * 7;

        CMA.lastCheckRelevanceBD = CMA.lastCheckRelevanceBD || 0;



        if (CMA.BD === undefined || isEmptyObject(CMA.BD) || (CMA.lastCheckRelevanceBD + week) > now)
            return;
        log(CMA);
            //Перебираем хосты, если ajaxTime больше месяца, то удаляем их из BD
        for (var host in CMA.BD) {
            if ((CMA.BD[host].ajaxTime + (week * 4)) < now) {
                delete CMA.BD[host];
            }
        }

        CMA.lastCheckRelevanceBD = now;
        chrome.storage.local.set({
            'CallManagersAssistant': JSON.stringify(CMA)
        });
    };




    function сheckHTTPShosts() {
        //    var ajax = new Ajax(
        //        'http://mihail.ves-yug.ru/black_list_sites/api',
        //        'POST',
        //        'hostname=getallhttps'
        //    )
        var ajax = new Ajax(
            'http://mihail.ves-yug.ru/black_list_sites/api/getallhttps');

        if (CMA.lastModifiedHTTPS === undefined)
            CMA.lastModifiedHTTPS = 0;

        ajax.send(this, function (response) {
            var resp = JSON.parse(response);
            log(resp);
            log(CMA.lastModifiedHTTPS);
            if (resp.lastModifiedHTTPS <= CMA.lastModifiedHTTPS) return;
            log(resp.actualHosts);
            for (var i = 0, host = resp.actualHosts[i]; i < resp.actualHosts.length; i++, host = resp.actualHosts[i]) {

                if (CMA.BD[host] !== undefined) continue;
                CMA.BD[host] = {
                    thereInBlackList: true,
                    ajaxTime: now,
                    notAlertClickTime: 0
                };
            }

            for (var i = 0, host = resp.deletedHosts[i]; i < resp.deletedHosts.length; i++, host = resp.deletedHosts[i]) {
                if (CMA.BD[host] === undefined) continue;
                delete CMA.BD[host];
            }

            CMA.lastModifiedHTTPS = resp.lastModifiedHTTPS;
            chrome.storage.local.set({
                'CallManagersAssistant': JSON.stringify(CMA)
            });
        });
    }

    function firstStart() {
        var CMA = {
            lastCheckRelevanceBD: 0,
            lastModifiedHTTPS: 0,
            logAndPassСorrectly: null,
            login: "",
            pass: ""
        };
        CMA.BD = {};
        return CMA;
    }

});


/*

 var now = 1447496925230;
    var week = (24 * 60 * 60 * 1000) * 7;
    var CMA = {};
    CMA.BD = {};
    //1445077725230
    CMA.BD['rap.ru'] = {
        thereInBunker: true,
        ajaxTime: 1445077725229,
        notAlertClickTime: 0
    }
    CMA.BD['rock.ru'] = {
        thereInBunker: true,
        ajaxTime: 1445077725202,
        notAlertClickTime: 0
    }
    CMA.BD['blues.ru'] = {
        thereInBunker: true,
        ajaxTime: 1445077725279,
        notAlertClickTime: 0
    }
    CMA.BD['utu.ru'] = {
        thereInBunker: true,
        ajaxTime: 1445077725210,
        notAlertClickTime: 0
    }


    for (var host in CMA.BD) {
        log(host);
    }
log('');

*/
