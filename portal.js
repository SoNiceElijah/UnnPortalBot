
const axios = require('axios');

const BASE_URL = "https://portal.unn.ru/ruzapi/";
async function exec(method, option, querry) {

    if(!querry) querry = {};

    let params = '?';
    for(let prop in querry)
        params += `${prop}=${encodeURIComponent(querry[prop])}&`;

    
    
    params = params.substring(0,params.length - 1);
    let res = await axios.get(BASE_URL + `${method}/${option}${params}`);

    console.log(BASE_URL + `${method}/${option}${params}`);

    return res.data;

}

async function search(param,type) {

    return await exec('search','', { term : param, type : type });

}

async function timetable(type, id, from, to) {

    let method = `schedule/${type}`;

    if(!to) to = new Date(from);
    
    let start = 
        from.getFullYear().toString(10).padStart(4,'0') + '.'
        + (from.getMonth()+1).toString(10).padStart(2,'0') + '.'
        + from.getDate().toString(10).padStart(2,'0');

    let finish =
        to.getFullYear().toString(10).padStart(4,'0') + '.'
        + (to.getMonth()+1).toString(10).padStart(2,'0') + '.'
        + to.getDate().toString(10).padStart(2,'0');

    

    return await exec(method, id, { start : start, finish : finish });
    
}

async function getGroupIdByName(name) {
    
    let answer = null;
    let response = await search(name, "group");
    
    if(response && response.length) answer = response[0].id;

    return answer;

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
        from.setDate(time.getDate() - from.getDay());

        let to = new Date(this.time);
        to.setDate(to.getDate() + (6 - to.getDay()));

        return await timetable(this.type, this.gid, from, to);
    }

    async week2() {
        let from = new Date(this.time);
        from.setDate(time.getDate() - from.getDay());

        let to = new Date(this.time);
        to.setDate(to.getDate() + 7 + (6 - to.getDay()));

        return await timetable(this.type, this.gid, from, to);
    }

}


module.exports = {
    TTGroup,
    getGroupIdByName

}




