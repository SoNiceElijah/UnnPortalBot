const Markup = require('node-vk-bot-api/lib/markup');

const yaml = require('yaml'); 
const fs = require('fs');
const path = require('path');
let COMMANDS = yaml.parse(fs.readFileSync(path.resolve(__dirname,'..','local','commands.yaml'),'utf-8'));
COMMANDS = COMMANDS.commands;

const hello = (idx = 0) => 
    Markup.keyboard([
        [
            Markup.button(COMMANDS.commands.triggers[idx], 'secondary'),
        ],
        [
            Markup.button(COMMANDS.information.triggers[idx], 'secondary'),
        ]
    ]).inline();

const info = (idx = 0) => 
    Markup.keyboard([
        [
            Markup.button(COMMANDS.information.triggers[idx], 'secondary'),
        ]
    ]).inline();

const commands = (idx = 0) => 
    Markup.keyboard([
        [
            Markup.button(COMMANDS.commands.triggers[idx], 'secondary'),
        ]
    ]).inline();

const main = (idx = 0) => 
    Markup.keyboard([
        [
            Markup.button(COMMANDS.today.triggers[idx], 'secondary'),
            Markup.button(COMMANDS.tommorow.triggers[idx], 'secondary'),
        ],
        [
            Markup.button(COMMANDS.week.triggers[idx], 'secondary'),
            Markup.button(COMMANDS.week2.triggers[idx], 'secondary'),
        ]
    ]);

const none = (idx = 0) => Markup.keyboard([]);

module.exports = {
    hello,
    info,
    commands,
    main,
    none
}