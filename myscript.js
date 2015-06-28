

var infoFromBunker = {
    thereInBunker : true,
    status : 'Не крутим',
    reportingDate : '12 Март 2015'
    };

function createMessage(infoFromBunker) {
    if (!infoFromBunker.thereInBunker) { return 'Нет в базе!'; }
    return 'Есть в базе. Статус продвижения - ' + infoFromBunker.status + ', отчетная дата - ' + infoFromBunker.reportingDate + '.';    
}

console.log(createMessage(infoFromBunker));