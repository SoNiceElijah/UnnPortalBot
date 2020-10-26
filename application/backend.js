
const express = require('express');
const app = express();
const path = require('path');

const portal = require('../lib/portal');

app.set('views',path.resolve(__dirname,'page'));
app.set('view engine','pug');

app.use(express.static(path.resolve(__dirname,'..','media')))

app.get('/lsn/:id', async (req,res) => {
    
    //FIXME: temporary
    console.log(req.params.id);
    let obj = new portal.TTGroup(25009,Date.now()/1000);
    let data = await obj.week2();
    data = data.filter(d => d.disciplineOid == req.params.id);
    let modified = portal.makeViewModel(data);

    let info = {};
    if(modified.length) {
        let example =  modified[0].content[0]; 
        info.name = example.name;
        info.short = example.short;
    } 

    console.log(modified);
    
    let attachments = [{},{},{},{},{},{},{},{}];
    let events = [
        {
            title : "Лабаратарная работа №1",
            desc: "Лабораторная работа. Связана с графами", 
            proc: 36.2, 
            done: false, 
            pproc: 75.2 
        },
        {
            title : "Лабаратарная работа №2",
            desc: "Пока хз что там", 
            proc: 10.1, 
            done: false, 
            pproc: 2.2 
        }
    ];
        
    res.render('page', { info : info, tt : modified, a : attachments, e : events });
});

module.exports = app;