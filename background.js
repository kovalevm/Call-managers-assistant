chrome.storage.local.get('CallManagersAssistant', function (result) {
    function isEmptyObject(obj) {
        var name;
        for (name in obj) {
            return false;
        }
        return true;
    }

    var CMA = result['CallManagersAssistant'];

    //проверяем есть ли такой объект и последняя проверка не моложе недели
    if (CMA === undefined) return;
    CMA = JSON.parse(CMA);
    var week = (24 * 60 * 60 * 1000) * 7;
    var now = (new Date()).getTime();
    if (
        CMA.BD === undefined || isEmptyObject(CMA.BD) || (CMA.lastCheckRelevanceBD + week) < now
    ) return;

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

//    var ajax = new Ajax(
//        'http://mihail.ves-yug.ru/black_list_sites/api',
//        'POST',
//        'hostname=getallhttps'
//    )

        var ajax = new Ajax(
        'http://mihail.ves-yug.ru/black_list_sites/api?hostname=getallhttps');

    if (CMA.lastModifiedHTTPS === undefined)
        CMA.lastModifiedHTTPS = 0;

    ajax.send(this, function (resonse) {
        var resp = JSON.parse(response);
        console.log(resp);
        //if (resp.lastModified <= CMA.lastModifiedHTTPS) return;

        for (var host in resp.actualHosts) {
            if (CMA.BD[host] !== undefined) continue
            CMA.BD[host] = {
                thereInBlackList: true,
                ajaxTime: now,
                notAlertClickTime: 0
            }
        }

        for (var host in resp.deletedHosts) {
            if (CMA.BD[host] === undefined) continue;
            delete CMA.BD[host];
        }

        CMA.lastCheckRelevanceBD = now;
        chrome.storage.local.set({
            'CallManagersAssistant': JSON.stringify(CMA)
        });
    })
})

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
        console.log(host);
    }
console.log('');

*/
