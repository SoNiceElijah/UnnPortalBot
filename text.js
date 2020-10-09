
// Здесь вся работа с текстом

// &#12288; - проебл

const { version } = require('./package.json');


const yaml = require('yaml'); 
const fs = require('fs');
const config = yaml.parse(fs.readFileSync('config.yaml','utf-8'));

const SPACE = "&#12288;";

function createMsg(model) {

    let n = 0;

    let output = "";
    for(let e of model)
    {
        if(n >= 10) { output += '<=>'; n = 0}

        let text = 
        `${e.today ? '&#11088;' : '&#128198;'} [${e.readabledate}] ${e.day}\n` +
        `--------------------------------\n\n` +
        `${e.content.map(fromElement).join('')}\n\n`;

        output += text;
        ++n;
    }

    if(output === '') output = "Нет пар"

    return output;

}

function fromElement(e) {

    let types = {
        '0' : "&#128215;",
        '1' : "&#128217;",
        '2' : "&#128216;",
        '-1' : "&#128211;"
    }

    let mark = {
        '0' : "&#127797;",
        '1' : "&#128312;",
        '2' : "&#128313;",
        '-1' : "&#9642;"
    }

    let text = 
    `${types[e.type]} ${e.from} - ${e.to} ${e.sub ? '/// ' + e.sub : ''}\n` +
    `${e.name}\n` +
    `${mark[e.type]} ${e.teacher}\n` +
    `${mark[e.type]} ${e.place} [${e.building}]\n\n`;

    return text;
}

function createWhenMsg(model) {

    let output = `${model[0].name}:\n`;
    let types = {
        '0' : "&#127797;",
        '1' : "&#128312;",
        '2' : "&#128313;",
        '-1' : "&#9642;"
    }

    for(let line of model)
    {
        let w;
        if(line.distance === 0) w = "Сегодня";
        else if(line.distance === 1) w = "Завтра";
        else if(line.distance < 5) w = `Через ${line.distance} дня`;
        else w = `Через ${line.distance} дней [${line.readabledate}][${line.day}]`;  

        let text = 
        `${types[line.type]} ${w} в ${line.from} ${line.sub ? '/// ' + line.sub : ''}\n`;

        output += text;
    }

    return output;
}

function createWhereMsg(model) {
    let output = '';
    let types = {
        '0' : "&#127797;",
        '1' : "&#128312;",
        '2' : "&#128313;",
        '-1' : "&#9642;"
    }

    if(model.type0) { output += 'Лекции'; for(let str of model.type0) output += `\n${types['0']} ${str}`; }
    if(model.type1) { output += '\n\nПрактики'; for(let str of model.type1) output += `\n${types['1']} ${str}`; }
    if(model.type2) { output += '\n\nЛабы'; for(let str of model.type2) output += `\n${types['2']} ${str}`; }
    if(model.typeundef) {  output += '\n\nОстальное'; for(let str of model.typeundef) output += `\n${types['-1']} ${str}`; }

    return output;

}

function getCommandList() {
    let text = 
        `&#8252; Список команд` 

        + `\n\n&#10133; - такая команда есть и точно работает`
        + `\n&#10134; - я такое умею в теории, но могут быть проблемы с исполнением`

        + `\n\n&#10133; [Сегодня] = Расписание на сегодня`
        + `\n&#10133; [Завтра] = Расписание на завтра`
        + `\n&#10133; [Неделя] = Расписание на неделю`
        + `\n&#10133; [Все] = Расписание на 2 недели вперед (включая текущую)`

        + `\n\n&#10133; [Когда <полное название предмета>] = Когда будет предмет в обозримом будущем (на 2 недели вперед)`
        + `\n&#10133; [Где <полное название предмета>] = Где нужно искать пару`

        + `\n\n&#10133; [Группа <код группы как на портале>] = Устанавливает группу, за расписанием которой ты следишь.`

        + `\n\n&#10133; [Команды] = Список доступных команд`
        + `\n&#10133; [Информация] = Информация о том, что тут вообще творится`

        + `\n\n&#10133; [~+] = Поднимает клавиатуру`
        + `\n&#10133; [~-] = Убирает клавиатуру`

        + `\n\n&#10133; [#bug <сообщение>] = Что-то сломалось`
        + `\n&#10133; [#info <сообщение>] = Хочешь нам что-то сообщить? Давай`
        + `\n&#10133; [#help <сообщение>] = Нужна помощь? Напиши эту команду, и админы придут на помощь, наверное... (вряд ли)`

        + `\n\nМожешь еще посмотреть на информацию. Не зря ж я ее писал пол ночи.`

    return text;
}

function getInformation() {
    let text = 

        `..::UNN BOT::..`
        + `\n${version}`

        + `\n\nБот предоставляет инфу о расписании, основываясь на данных с портала unn`

        + `\n\nНАШИ ПРАВИЛА:`
        + `\n&#128312; Хз`
        + `\n&#128312; Пока не придумал`
        + `\n&#128312; Но они явно есть (или появятся)`

        + `\n\nКак ты мог заметить, мы красим пары в разные цвета, вот что они заначат:`
        + `\n&#128215; = Лекция`
        + `\n&#128217; = Практика`
        + `\n&#128216; = Лаба`
        + `\n&#128211; = Мы понятия не имем какой тип у пары. Если ты такой нашел - напиши нам через #bug`
        
        + `\n\n Ну вот и все пока что. Глянь еще какие команды у нас есть`

    return text;
}

module.exports = {
    createMsg,
    createWhenMsg,
    createWhereMsg,
    getCommandList,
    getInformation
}