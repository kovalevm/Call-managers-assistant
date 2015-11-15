chrome.storage.local.get('CallManagersAssistant', function (result) {
    var CMA = result['CallManagersAssistant'];
    CMA = JSON.parse(CMA);

    //проверяем есть ли такой объект и последняя проверка не моложе недели
    console.assert(CMA !== undefined, 'CMA undefined');
    if (CMA === undefined) return;

    var now = (new Date()).getTime();

    сheckRelevanceBD();
    сheckHTTPShosts();

    function сheckRelevanceBD() {
        var week = (24 * 60 * 60 * 1000) * 7;

        if (CMA.lastCheckRelevanceBD === undefined) CMA.lastCheckRelevanceBD = 0;

        console.assert(CMA.BD !== undefined, 'CMA.BD undefined');
        console.assert(!isEmptyObject(CMA.BD), 'CMA.BD isEmpty', CMA.BD);
        if (CMA.BD === undefined || isEmptyObject(CMA.BD) || (CMA.lastCheckRelevanceBD + week) > now)
            return;
        console.log(CMA)
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
    }




    function сheckHTTPShosts() {
        //    var ajax = new Ajax(
        //        'http://mihail.ves-yug.ru/black_list_sites/api',
        //        'POST',
        //        'hostname=getallhttps'
        //    )
        var ajax = new Ajax(
            'http://mihail.ves-yug.ru/public/black_list_sites/api/getallhttps');

        if (CMA.lastModifiedHTTPS === undefined)
            CMA.lastModifiedHTTPS = 0;

        ajax.send(this, function (response) {
            var resp = JSON.parse(response);
            console.log(resp);

            if (resp.lastModified <= CMA.lastModifiedHTTPS) return;

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
    }

})

function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
}

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
