/*jslint sloppy: true*/

var debug = true;
var log, logG, logGE, logT, logTE;
var a = function (a) {};

if (debug) {
    log = console.log.bind(console);
    logG = console.group.bind(console);
    logGE = console.groupEnd.bind(console);
    logT = console.time.bind(console);
    logTE = console.timeEnd.bind(console);
}
else {
    log = a;
    logG = a;
    logGE = a;
    logT = a;
    logTE = a;
}

//function checkInputData(obj) {
//    var param;
//    for (param in obj) {
//
//    }
//}

function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
}

function in_array(value, array)
{
    for(var i = 0; i < array.length; i++)
    {
        if(array[i] === value) return true;
    }
    return false;
}
