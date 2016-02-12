// при загрузке попапа заполняем логин
document.addEventListener('DOMContentLoaded', function () {
    getStorage(CMAconf.chromeStorageName, function (storage) {
        document.getElementById('bunkerLogin').value = storage.login;
    })
})


//очищаем бд в нашей памяти
document.getElementById('cleanBD').addEventListener('click', function (el) {
    getStorage(CMAconf.chromeStorageName, function (storage) {
            storage.BD = {};
            return storage;
    })
    var m = document.getElementById('cleanBDspan');
    m.classList.add('success');
    m.innerHTML = 'ОК';
        //chrome.storage.local.remove('CallManagersAssistant', function () {});
})


//аутентификация в бункере
document.getElementById('bunkerBtn').addEventListener('click', function (el) {
    var bunker = defineLoginAndPass(),
        message = document.getElementById('bunker-message');

    if (!validateLoginAndPass(bunker)) {
        message.classList.add('error');
        message.innerHTML = 'Недопустимый логин или пароль!';
        return;
    }

    var ajax = new Ajax(
        CMAconf.APIBunker +
        CMAconf.paramsBunker(bunker.login, bunker.pass)
    );
    ajax.send(this, function (response) {
        var bunkerResponse = JSON.parse(response);

        if (bunkerResponse.code === '004') {
            message.classList.add('success');
            message.innerHTML = 'Логин и пароль введены верно. Можно приступать к работе. Удачи!';
            bunker.logAndPassСorrectly = true;
        } else if (bunkerResponse.code === '005') {
            message.innerHTML = 'Сейчас бункер не работает, повторите попытку с 07:00 до 19:00 в будний день.';
            bunker.logAndPassСorrectly = '005';
        } else {
            message.classList.add('error');
            message.innerHTML = 'Логин или пароль введены не верно.';
            bunker.logAndPassСorrectly = false;
        }
        saveLoginAndPass(bunker);
    })
});

//show/hide форму Сообщить о проблеме
document.getElementById('problemToggle').addEventListener('click', function (el) {
    document.getElementById('probleb-form').classList.toggle('hide');
})


//Отправляем проблему
document.getElementById('problemSend').addEventListener('click', function (el) {
    var text = document.getElementById('problemText').value,
        name = document.getElementById('name-problem').value,
        email = document.getElementById('email-problem').value,
        message = document.getElementById('problemSendSpan');


    if (text.length < 5 || name.length < 3 || email.length < 5) {
        message.classList.add('error');
        message.innerHTML = 'Не все поля заполнены корректно.'
        return;
    }
    //O8iAd9LpNFcodCuo3y7kmg
    getStorage(CMAconf.chromeStorageName, function (storage) {
        var ajax = new Ajax(
            'https://mandrillapp.com/api/1.0/messages/send.json',
            'POST',
            'application/json;charset=UTF-8',
            JSON.stringify({
                key: 'O8iAd9LpNFcodCuo3y7kmg',
                message : {
                    from_email : email,
                    to : [{'email': 'mihail.it7@gmail.com', 'type': 'to'}],
                    autotext : 'true',
                    subject : 'Сообщение о проблеме Call manager`s assistant',
                    html :
                    '<p>Сообщение от - ' + name + '</p>'
                    +'<p> Текст сообщения:</p><p>' + text + '</p>' +
                    + '<p> Память:</p><p>' + JSON.stringify(storage) + '</p>'
                }
            })
        );

        ajax.send(this, function (response) {
            log(response);
        })

    })
})


//вспомогательные функции
function saveLoginAndPass(bunker) {
    getStorage(CMAconf.chromeStorageName, function (storage) {
        storage.login = bunker.login;
        storage.pass = bunker.pass;
        storage.logAndPassСorrectly = bunker.logAndPassСorrectly;
        return storage;
    })
}

function defineLoginAndPass() {
    bunker = {
        login: document.getElementById('bunkerLogin').value,
        pass: document.getElementById('bunkerPassword').value
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

//chrome.storage.local.get('CallManagersAssistant', function (result) {
//    var CallManagersAssistant = result['CallManagersAssistant'];
//
//    //Есть такой объект в памяти?
//    if (!!!CallManagersAssistant) {
//        CallManagersAssistant = new Object();
//        CallManagersAssistant.BD = new Object();
//    } else CallManagersAssistant = JSON.parse(CallManagersAssistant);
//
//    CallManagersAssistant.login = bunker.login;
//    CallManagersAssistant.pass = bunker.pass;
//    CallManagersAssistant.logAndPassСorrectly = bunker.logAndPassСorrectly;
//    chrome.storage.local.set({
//        'CallManagersAssistant': JSON.stringify(CallManagersAssistant)
//    });
//});
//
//}

//    $.get(
//        "http://bunker-yug.ru/seo_status.php", {
//            login: bunker.login,
//            pass: bunker.pass
//        },
//        function (bunkerResponse) {
//
//            bunkerResponse = JSON.parse(bunkerResponse);
//            if (bunkerResponse.code === '004') {
//                message = 'Логин и пароль введены верно. Можно приступать к работе. Удачи!';
//                bunker.logAndPassСorrectly = true;
//            } else if (bunkerResponse.code === '005') {
//                message = 'Сейчас бункер не работает, повторите попытку с 07:00 до 19:00 в будний день.';
//                bunker.logAndPassСorrectly = '005';
//            } else {
//                message = 'Логин или пароль введены не верно.';
//                bunker.logAndPassСorrectly = false;
//            }
//            console.log(message);
//            saveLoginAndPass(bunker);
//            $('.bunker-message').text(message);
//        });
//});

//document.getElementById('cleanBD').addEventListener('click', function(el) {
//    chrome.storage.local.get('CallManagersAssistant', function (result) {
//        var CallManagersAssistant = result['CallManagersAssistant'];
//    })
//})

//$(document).ready(function () {
//    chrome.storage.local.get('CallManagersAssistant', function (result) {
//        var CallManagersAssistant = result['CallManagersAssistant'];
//        //console.log(CallManagersAssistant);
//        CallManagersAssistant = JSON.parse(CallManagersAssistant);
//        $('.bunker-form #bunkerLogin').val(CallManagersAssistant.login);
//    })
//});
