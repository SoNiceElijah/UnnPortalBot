
const axios = require('axios');

const LEC_TYPES = [
    262,
    264,
    263
];

const EMOJI = {
    t262 : '&#128215;',
    t264 : "&#128217;",
    t263 : "&#128216;",
    undef : "&#128211;"
}

const MONTHS = [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек'
]

const BASE_URL = "https://portal.unn.ru/ruzapi/";
async function exec(method, option, querry) {

    if(!querry) querry = {};

    let params = '?';
    for(let prop in querry)
        params += `${prop}=${encodeURIComponent(querry[prop])}&`;

    
    
    params = params.substring(0,params.length - 1);
    let res = await axios.get(BASE_URL + `${method}/${option}${params}`);

    return res.data;

}

async function search(param,type) {

    return await exec('search','', { term : param, type : type });

}

async function timetable(type, id, from, to) {

    let method = `schedule/${type}`;

    if(!to) to = new Date(from);
    
    let start = buildDateString(from);
    let finish = buildDateString(to);    

    return await exec(method, id, { start : start, finish : finish, lng : 1 });
    
}

async function getGroupIdByName(name) {
    
    let answer = null;
    let response = await search(name, "group");
    
    if(response && response.length) answer = response[0].id;

    return answer;

}

function makeInnerBlock(data) {

    if(!data || !data.length) return [];
    
    let block = [];

    while(data.length)
    {
        let line = [data.shift()];
        while(data.length && line[0].date === data[0].date) 
            line.push(data.shift())

        block.push(line);
    }

    return block;

}

function buildDateString(date) {
    return date.getFullYear().toString(10).padStart(4,'0') + '.'
           + (date.getMonth()+1).toString(10).padStart(2,'0') + '.'
           + date.getDate().toString(10).padStart(2,'0');
}

function smallModels(e) {

    let teachersign = e.lecturer.trim().split(' ');
    let tsign = teachersign[0];
    if(teachersign[1]) tsign += ' ' + teachersign[1][0];
    if(teachersign[2]) tsign += '.' + teachersign[2][0] + '.';

    let d = e.date.split('.');
    let obj = {
        id : e.disciplineOid,
        from : e.beginLesson,
        to : e.endLesson,
        num : e.lessonNumberStart,
        type : LEC_TYPES.indexOf(e.kindOfWorkOid),
        typename : e.kindOfWork,
        name : e.discipline,
        rootname : e.discipline.match(/[^\)]+(\(|$)/gu).join('').replace(/\(/gu,''),
        teacher : e.lecturer,
        tsign : tsign,
        emoji : EMOJI['t' + e.kindOfWorkOid] ? EMOJI['t' + e.kindOfWorkOid] : EMOJI['undef'],
        place : e.auditorium,
        building : e.building,
        sub : e.subGroup,
        date : e.date,
        day : e.dayOfWeekString,
        dnum : e.dayOfWeek,
        short : e.discipline
            .match(/[^\)]+(\(|$)/gu).join('').replace(/\(/gu,'')
            .match(/(?<=[\s,.:;"']|^)([а-яА-Я]|[a-zA-Z])/gu).join('')
            .toUpperCase(),
        readabledate : d[2].replace(/^0+/g,'') + ' ' + MONTHS[parseInt(d[1], 10) - 1] + ' ' + d[0] 
    };

    return obj;
}

function makeViewModel(block) {

    block = makeInnerBlock(block);
    let model = [];

    for(let part of block)
    {
        part = part.map(smallModels);
        let first = part[0];
        let info = {
            day : first.day,
            date : first.date,
            today : first.date === buildDateString(new Date()),
            readabledate : first.readabledate,
            content : part
        }

        model.push(info);
    }

    return model;




}

function filterByName(name) {
    name = name.toUpperCase().trim();
    return function(e) {
        return e.name.toUpperCase().trim() === name
            || e.short.trim() === name
            || e.rootname.toUpperCase().trim() === name
            || e.teacher.trim().toUpperCase() === name
            || e.teacher.split(' ')[0].trim().toUpperCase() === name
        }
}

// Time table by group id
class TTGroup {

    constructor(gid, time) {
        this.gid = gid;
        this.time = time * 1000;

        this.type = 'group';
    }

    async today() {

        let time = new Date(this.time);
        return await timetable(this.type, this.gid, time);
    }

    async tommorow() {
        let time = new Date(this.time);
        time.setDate(time.getDate() + 1);
        return await timetable(this.type, this.gid, time);
    }

    async week() {
        let from = new Date(this.time);
        from.setDate(from.getDate() - from.getDay());

        let to = new Date(this.time);
        to.setDate(to.getDate() + (6 - to.getDay()));

        return await timetable(this.type, this.gid, from, to);
    }

    async week2() {
        let from = new Date(this.time);
        from.setDate(from.getDate() - from.getDay());

        let to = new Date(this.time);
        to.setDate(to.getDate() + 7 + (6 - to.getDay()));

        return await timetable(this.type, this.gid, from, to);
    }

    async when(name) {

        let from = new Date(this.time);
        let to = new Date(this.time);
        to.setDate(to.getDate() + 7 + 6);

        let data =  await timetable(this.type, this.gid, from, to);
        let filtered = data.map(smallModels);
        filtered = filtered.filter(filterByName(name));
        filtered = filtered.map((e) => {

            let today = new Date(this.time);
            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0);
            today.setMilliseconds(0);
            let target = new Date(e.date);

            let dt = Math.floor((target.getTime() - today.getTime()) / (1000 * 3600 * 24));

            e.distance = dt;
            return e;

        });
        return filtered;
    }

    async where(name) {
        let from = new Date(this.time);
        let to = new Date(this.time);
        to.setDate(to.getDate() + 7 + 6);

        let data =  await timetable(this.type, this.gid, from, to);
        let filtered = data.map(smallModels);
        filtered = filtered.filter(filterByName(name));

        let obj = {};
        if(!filtered.length) return null;

        let type0 = filtered.filter(e => e.type === 0);
        let type1 = filtered.filter(e => e.type === 1);
        let type2 = filtered.filter(e => e.type === 2);
        let typeundef = filtered.filter(e => e.type === -1);

        if(type0.length) obj.type0 = type0;
        if(type1.length) obj.type1 = type1;
        if(type2.length) obj.type2 = type2;
        if(typeundef.length) obj.typeundef = typeundef;

        for(let prop in obj)
        {
            let array = obj[prop];
            array.sort((a,b) => a.dnum - b.dnum);
            array = array.map(e => `В ${e.day} => ${e.place} [${e.building}] `);
            array = array.filter((e,i,arr) => arr.indexOf(e) === i);
            obj[prop] = array;
        }

        return obj;

    }

    async date(date) {
        return await timetable(this.type, this.gid, date);
    }

}


module.exports = {
    TTGroup,
    getGroupIdByName,
    makeViewModel
}




