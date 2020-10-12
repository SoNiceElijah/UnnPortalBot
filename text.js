
// Здесь вся работа с текстом

// &#12288; - проебл

const { version } = require('./package.json');


const yaml = require('yaml'); 
const fs = require('fs');
const config = yaml.parse(fs.readFileSync('config.yaml','utf-8'));

const TXS = yaml.parse(fs.readFileSync('./local/shared.yaml','utf-8'));
const SPACE = TXS.space;

function createMsg(model) {

    let n = 0;

    let output = "";
    for(let e of model)
    {
        if(n >= 10) { output += '<=>'; n = 0}

        let text = 
        `${e.today ? TXS.today : TXS.date } [${e.readabledate}] ${e.day}\n` +
        `////////////////////////////\n\n` +
        `${e.content.map(fromElement).join('')}\n\n`;

        output += text;
        ++n;
    }

    if(output === '') output = "Нет пар"

    return output;

}

function fromElement(e) {

    let types = TXS.marks_big;
    types['-1'] = TXS.marks_big_undef;

    let mark = TXS.marks_small;
    mark['-1'] = TXS.marks_small_undef;

    let text = 
    `${types[e.type]} ${e.from} - ${e.to} ${e.sub ? '/// ' + e.sub : ''}\n` +
    `${e.name}\n` +
    `${mark[e.type]} ${e.teacher}\n` +
    `${mark[e.type]} ${e.place} [${e.building}]\n\n`;

    return text;
}

function createWhenMsg(model) {

    let output = `${model[0].name}:\n`;
    
    let types = TXS.marks_small;
    types['-1'] = TXS.marks_small_undef;

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

    let types = TXS.marks_small;
    types['-1'] = TXS.marks_small_undef;

    if(model.type0) { output += 'Лекции'; for(let str of model.type0) output += `\n${types['0']} ${str}`; }
    if(model.type1) { output += '\n\nПрактики'; for(let str of model.type1) output += `\n${types['1']} ${str}`; }
    if(model.type2) { output += '\n\nЛабы'; for(let str of model.type2) output += `\n${types['2']} ${str}`; }
    if(model.typeundef) {  output += '\n\nОстальное'; for(let str of model.typeundef) output += `\n${types['-1']} ${str}`; }

    return output;

}

function getCommandList() {
    let text = 
        `${TXS.command_list} Список команд`

        + `\n\n${TXS.mark_neutral} [Сегодня] = Расписание на сегодня`
        + `\n${TXS.mark_neutral} [Завтра] = Расписание на завтра`
        + `\n${TXS.mark_neutral} [Неделя] = Расписание на неделю`
        + `\n${TXS.mark_neutral} [Все] = Расписание на 2 недели вперед (включая текущую)`
        + `\n${TXS.mark_neutral} [Дата <дата MM.DD.YYYY или DD Mon YYYY>] = Расписание на 2 недели вперед (включая текущую)`

        + `\n\n${TXS.mark_neutral} [Когда <полное название предмета>] = Когда будет предмет в обозримом будущем (на 2 недели вперед)`
        + `\n${TXS.mark_neutral} [Где <полное название предмета>] = Где нужно искать пару`

        + `\n\n${TXS.mark_neutral} [Группа <код группы как на портале>] = Устанавливает группу, за расписанием которой ты следишь.`

        + `\n\n${TXS.mark_neutral} [Команды] = Список доступных команд`
        + `\n${TXS.mark_neutral} [Информация] = Информация о том, что тут вообще творится`

        + `\n\n${TXS.mark_neutral} [~+] = Поднимает клавиатуру`
        + `\n${TXS.mark_neutral} [~-] = Убирает клавиатуру`

        + `\n\n${TXS.mark_neutral} [#bug <сообщение>] = Что-то сломалось`
        + `\n${TXS.mark_neutral} [#info <сообщение>] = Хочешь нам что-то сообщить? Давай`
        + `\n${TXS.mark_neutral} [#help <сообщение>] = Нужна помощь? Напиши эту команду, и админы придут на помощь, наверное... (вряд ли)`

        + `\n\nПримеры сложных команд, до которых никто не допирает:`
        + `\n${TXS.marks_small[1]}Группа 382003-2 <===> Меняет группу на 382003-2`
        + `\n${TXS.marks_small[1]}Дата 20 sep 2020 <===> Показывает расписание в этот день (дата ток на английском работает)`
        + `\n${TXS.marks_small[1]}Дата 10.20.2020 <===> Расписание на 20 октября, а не то что ты подумал(а)!`   

        + `\n\nМожешь еще посмотреть на информацию. Не зря ж я ее писал пол ночи.`

    return text;
}

function getInformation() {
    let text = 

        `${TXS.logo}`
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