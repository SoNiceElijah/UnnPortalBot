
const axios = require('axios');

const LEC_TYPES = [
    "Лекция",
    "Практика",
    "Лабораторная"
];

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
    return {
        from : e.beginLesson,
        to : e.endLesson,
        num : e.lessonNumberStart,
        type : LEC_TYPES.indexOf(e.kindOfWork),
        name : e.discipline,
        teacher : e.lecturer,
        place : e.auditorium,
        building : e.building,
        sub : e.subGroup,
        date : e.date,
        day : e.dayOfWeekString,
        dnum : e.dayOfWeek
    };
}

function makeViewModel(block) {

    block = makeInnerBlock(block);
    let model = [];

    for(let part of block)
    {
        let first = part[0];
        let info = {
            day : first.dayOfWeekString,
            date : first.date,
            today : first.date === buildDateString(new Date()),
            content : part.map(smallModels)
        }

        model.push(info);
    }

    return model;




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
        let filtered = data.filter(e => e.discipline.toUpperCase() === name.toUpperCase()).map(smallModels);
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
        let filtered = data.filter(e => e.discipline.toUpperCase() === name.toUpperCase()).map(smallModels);

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

}


module.exports = {
    TTGroup,
    getGroupIdByName,
    makeViewModel
}




