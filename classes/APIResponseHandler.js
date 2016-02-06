/*jslint sloppy: true*/

var APIResponseHandler = function () {

};


/**
 * Обрабатывает ответ сервера в зависимости от сервера,
 * и возвращает результат в объекте
 * @param   {String} server   имя сервера откуда пришел response (bunker или blacklist)
 * @param   {String} response ответ сервера
 * @returns {Object} host
 */

APIResponseHandler.prototype.responseHandler = function (server, response) {
    logG('APIResponseHandler.responseHandler(server, response) started');
    log('server - ' + server);
    log('response - ' + response);

    var host = {};
    var r = {};
    //Валидируем пришедшие данные
    console.assert(in_array(server, [APIblackList, APIBunker]));
    console.assert(typeof host == 'object', 'host не является объектом');
    try {
        r = JSON.parse(response);
    } catch (e) {
        throw ('Ошибка! Невозможно отпарсить в json ответ сервера = ' + response);
    }


    if (server === APIBunker) {

        if (r.result === 'err') {
            log('Ошибка АПИ бункера: ' + bunkerApiErrors[r.code]);
        } else if (r.result === 'ok' || r.result_2 === 'ok') {

            host.ajaxTime = (new Date()).getTime();
            host.notAlertClickTime = 0;

            if (r.code === '002') {

                host.thereInBunker = true;
                host.status = r.status;
                host.reportingDate = r.date;

            } else if (r.code_2 === '002') {
                host.thereInBunker = true;
                host.status = 'in_main';
                host.reportingDate = '';

            } else {
                host.thereInBunker = false;
            }
        }

    } else if (server === APIblackList) {

        if (r.code === 0) {
            log('Ошибка в бд черного листа');
        } else {

            host.ajaxTime = (new Date()).getTime();
            host.notAlertClickTime = 0;
        }

        if (r.code === 2) {
            host.thereInBlackList = true;
        } else {
            host.thereInBlackList = false;
            //BLcomment: bunResp.status,
        }

    }


    log('Output host :');
    log(host);
    logGE();
    return host;
};


/* Tesing */

//var apiResp = new APIResponseHandler();
//var e = {};
//apiResp.responseHandler('{"result":"ok","code":"001","result_2":"ok","code_2":"002"}', e);
//apiResp.responseHandler('dfhdsjfhkjshfjsjfkl', e);
 //* @param   {Object}   host     объект в который сохраняются результаты обрабтки response
