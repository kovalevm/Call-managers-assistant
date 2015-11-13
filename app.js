var App = function (login, pass) {
    this.hostname = window.location.hostname.replace('www.', '');
    this.login = login;
    this.pass = pass;

    this.APIblackList = 'http://strikerdeveloper.myjino.ru/blackList.php';
    this.ParamsblackList = 'action=api&hostname=' + this.hostname;

    this.APIBunker = 'http://bunker-yug.ru/seo_status.php?' +
        'login=' + this.login +
        '&pass=' + this.pass +
        '&d=' + this.hostname;
}

App.prototype.ajax = function (method, handlerPath, params) {
    var request = new XMLHttpRequest(); // normal browser

    request.open(method, handlerPath, true);
    if (method === 'POST') {
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }

    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (request.status == 200) {
                console.log(request.responseText);
            } else {
                console.log("Не удалось получить данные:\n" + request.statusText);
            }
        }
    };
    request.send(params);
}


App.prototype.inBlackList = function () {
//    console.log('bk');
//    console.log(this);
    this.ajax('POST', this.APIblackList, this.ParamsblackList);
}

App.prototype.inBunker = function () {
//    console.log('bu');
//    console.log(this);
    this.ajax('GET', this.APIBunker, null);
}

var app = new App('mishako', '183_004');
app.inBlackList();
app.inBunker();
