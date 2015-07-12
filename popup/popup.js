$('#cleanBD').click(function () {
    chrome.storage.local.remove('CallManagersAssistant', function () {});
});

$(document).ready(function () {
    chrome.storage.local.get('CallManagersAssistant', function (result) {
        var CallManagersAssistant = result['CallManagersAssistant'];
        //console.log(CallManagersAssistant);
        CallManagersAssistant = JSON.parse(CallManagersAssistant);
        $('.bunker-form #bunkerLogin').val(CallManagersAssistant.login);
    })
});

function defineLoginAndPass() {
    bunker = {
        login: $('.bunker-form #bunkerLogin').val(),
        pass: $('.bunker-form #bunkerPassword').val()
    }
    return bunker;
}

function validateLoginAndPass(bunker) {
    var russianSymbols = /[а-яА-Я]/g;
    //console.log(bunker);
    if (bunker.login === '' || bunker.login.match(russianSymbols) != null) return false;
    if (bunker.pass === '' || bunker.pass.match(russianSymbols) != null) return false;
    return true;
}

function saveLoginAndPass(bunker) {


    chrome.storage.local.get('CallManagersAssistant', function (result) {
        var CallManagersAssistant = result['CallManagersAssistant'];

        //Есть такой объект в памяти?
        if (!!!CallManagersAssistant) {
            CallManagersAssistant = new Object();
            CallManagersAssistant.BD = new Object();
        } else CallManagersAssistant = JSON.parse(CallManagersAssistant);

        CallManagersAssistant.login = bunker.login;
        CallManagersAssistant.pass = bunker.pass;
        CallManagersAssistant.logAndPassСorrectly = bunker.logAndPassСorrectly;
        chrome.storage.local.set({
            'CallManagersAssistant': JSON.stringify(CallManagersAssistant)
        });
    });

}

$('#bunkerBtn').click(function () {
    var bunker = defineLoginAndPass();
    if (!validateLoginAndPass(bunker)) {
        message = 'Недопустимый логин или пароль!';
        console.log(message);
        $('.bunker-message').text(message);
        return;
    }

    /*    var bunkerResponse = $.ajax({
            url: "http://bunker-yug.ru/seo_status.php",
            data: "login=" + bunker.login + "&pass=" + bunker.pass,
            async: false
        }).responseText;*/

    $.get(
        "http://bunker-yug.ru/seo_status.php", {
            login: bunker.login,
            pass: bunker.pass
        },
        function (bunkerResponse) {

            bunkerResponse = JSON.parse(bunkerResponse);
            if (bunkerResponse.code === '004') {
                message = 'Логин и пароль введены верно. Можно приступать к работе. Удачи!';
                bunker.logAndPassСorrectly = true;
            } else if (bunkerResponse.code === '005') {
                message = 'Сейчас бункер не работает, повторите попытку с 07:00 до 19:00 в будний день.';
                bunker.logAndPassСorrectly = '005';
            } else {
                message = 'Логин или пароль введены не верно.';
                bunker.logAndPassСorrectly = false;
            }
            console.log(message);
            saveLoginAndPass(bunker);
            $('.bunker-message').text(message);
        });
});
