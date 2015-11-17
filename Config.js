var Config = function () {
    this.APIblackList = 'http://mihail.ves-yug.ru/black_list_sites/api/';
    this.APIBunker = 'http://bunker-yug.ru/seo_status.php?'

    this.bannerMessages = {
        incorrectLogin: 'Логин или пароль введены неверно или не введены вообще. Введите их, нажав на иконку с красной телефонной трубкой справа от адресной строки.',
        inMain: 'Есть упоминание об этом сайте в главных!',
        inCustomer: 'Есть в базе. Статус продвижения - <ins>%status%</ins>, отчетная дата - %repDate%.',
        inBlackList: 'Этот сайт есть в ЧС!!'
    }

    this.bunkerApiErrors = {
        '002': 'Ошибка базы данных бункера',
        '004': 'Не задан домен при запросе к бд бункера',
        '005': 'Вы не уложилось во время работы бункера',
        '006': 'Не правильный логин или пароль'
    }
}
