
// Здесь вся работа с текстом

// &#12288; - проебл

const { version } = require('../package.json');


const yaml = require('yaml'); 
const fs = require('fs');

const path = require('path');

const TXS = yaml.parse(fs.readFileSync(path.resolve(__dirname,'..','local','shared.yaml'),'utf-8'));
const SPACE = TXS.space;

const LOCAL = yaml.parse(fs.readFileSync(path.resolve(__dirname,'..','local','ru_RU.yaml'),'utf-8'));

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

    if(output === '') output = LOCAL.empty_response;

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
        if(line.distance === 0) w = LOCAL.today_str;
        else if(line.distance === 1) w = LOCAL.tomorrow_str;
        else if(line.distance < 5) w = LOCAL.days04_str.replace(/\$/g,line.distance);
        else w = LOCAL.days5_str.replace(/\$/g,line.distance) + ` [${line.readabledate}][${line.day}]`;  

        let text = 
        `${types[line.type]} ${w} ${LOCAL.time_article} ${line.from} ${line.sub ? '/// ' + line.sub : ''}\n`;

        output += text;
    }

    return output;
}

function createWhereMsg(model) {
    let output = '';

    let types = TXS.marks_small;
    types['-1'] = TXS.marks_small_undef;

    if(model.type0) { output += LOCAL.lectures; for(let str of model.type0) output += `\n${types['0']} ${str}`; }
    if(model.type1) { output += `\n\n${LOCAL.practices}`; for(let str of model.type1) output += `\n${types['1']} ${str}`; }
    if(model.type2) { output += `\n\n${LOCAL.labs}`; for(let str of model.type2) output += `\n${types['2']} ${str}`; }
    if(model.typeundef) {  output += `\n\n${LOCAL.other}`; for(let str of model.typeundef) output += `\n${types['-1']} ${str}`; }

    return output;

}

function createExamMsg(model) {
    let output = 'ЭКЗАМЕНЫ\n///////////////////\n\n';

    let types = TXS.marks_big;
    types['-1'] = TXS.marks_big_undef;

    for(let day of model) output += `${day.readabledate} ${day.day} [${day.content[0].typename}]\n${types[day.content[0].type]} ${day.content[0].name.toUpperCase()}\n\n`;

    return output;
}

function getCommandList() {

    let text = LOCAL.commands;
    return text;
}

function getInformation() {
    let text = 

        `${TXS.logo}`
        + `\n${version}`

        + LOCAL.information;

    return text;
}

module.exports = {
    createMsg,
    createWhenMsg,
    createWhereMsg,
    createExamMsg,
    getCommandList,
    getInformation
}