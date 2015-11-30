/*jshint bitwise: true, globals: true, forin: true, nonew: true, undef: true, unused: true, strict: true, latedef: true, browser: true, devel: true, browserify: true, maxdepth: 3, maxlen: 80, indent: 4*/

var APIblackList = 'http://mihail.ves-yug.ru/black_list_sites/api/',
    APIBunker = 'http://bunker-yug.ru/seo_status.php?',
    chromeStorageName = 'CallManagersAssistant';

    banners = {
        incorrectLogin : {
            text : 'Логин или пароль введены неверно или не введены вообще. Введите их, нажав на иконку с красной телефонной трубкой справа от адресной строки.',
            notAlertTodayCheckbox : false
        },
        inMain : {
            text : 'Есть упоминание об этом сайте в главных!'
        },
        inCustomer : {
            text : 'Есть в базе. Статус продвижения - <ins>%status%</ins>, отчетная дата - %repDate%.'
        },
        inBlackList : {
            text : 'Этот сайт есть в ЧС!!',
            priority : 1
        }
    },

    bunkerApiErrors = {
        '002': 'Ошибка базы данных бункера',
        '004': 'Не задан домен при запросе к бд бункера',
        '005': 'Вы не уложилось во время работы бункера',
        '006': 'Не правильный логин или пароль'
    };
