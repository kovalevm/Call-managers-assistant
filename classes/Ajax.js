var Ajax = function (handlerPath, method, params) {
    if (!handlerPath) throw new Error('Не задан адрес для ajax запроса');

    this.r = new XMLHttpRequest();
    this.path = handlerPath;
    this.m = method ? method : 'GET';
    this.p = params ? params : null;
    //  this.async = async ? async : true;
}


Ajax.prototype.send = function (obj, success) {
    log(this);
    this.r.open(this.m, this.path, true);
//    this.r.setRequestHeader("If-Modified-Since", 'Last-Modified');
    if (this.m === 'POST') {
        this.r.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded"
        );
    }

    this.r.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                success.call(obj, this.responseText);
                //console.log('send2 - ' + this.responseText);
            } else {
                console.log("Не удалось получить данные при ajax запросе:\n" + this.statusText);
            }
        }
    };
    this.r.send(this.p);
}

/*
var a = new Ajax(
    'http://strikerdeveloper.myjino.ru/blackList.php',
    'POST',
    'action=api&hostname=dominoauto.ru'
);

a.send2(function(request) {
    console.log('sux - ' + request);
});

//a.send2();
*/
