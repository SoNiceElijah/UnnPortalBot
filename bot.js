 
const yaml = require('yaml'); 
const fs = require('fs');
const vkBot = require('node-vk-bot-api')
const config = yaml.parse(fs.readFileSync('config.yaml','utf-8'));

const path = require('path');

const mongoose = require('mongoose');

const User = require('./user');
const portal = require('./portal');
const editor = require('./text');

const keyboards = require('./keyboards');

const special = require('./special');

let COMMANDS = yaml.parse(fs.readFileSync(path.resolve(__dirname,'local','commands.yaml'),'utf-8'));
COMMANDS = COMMANDS.commands;

let LOCAL = yaml.parse(fs.readFileSync(path.resolve(__dirname,'local','ru_RU.yaml'),'utf-8'));

main();
async function main() {

    await mongoose.connect
    (
        config.connection, 
        { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );

    const bot = new vkBot({
        token : config.vktoken,
        group_id : config.vkgroup
    });


    // Auth
    bot.use(async (ctx,next) => {

        let u = await User.findByVkid(ctx.message.from_id);
        if(!u) 
        {
            u = new User({ vkid : ctx.message.from_id });
            u.save();
        }

        ctx.user = u;
        next();    
        
    });

    bot.use((ctx,next) => {
        if( ctx.message.text === '' 
            && ctx.message.attachments.length === 1
            && ctx.message.attachments[0].type === 'sticker')
        {
            return ctx.reply(LOCAL.sticker_refuse)
        }
        next();
    })

    bot.use((ctx,next) => {
        let s = special.specialAnswers(ctx);
        if(s) return ctx.reply(s);
        next();
    })

    bot.command(COMMANDS.group.triggers, async (ctx) => {
        let gname = ctx.message.text.substring(6).trim();
        if(!gname) return ctx.reply(LOCAL.group_wrong_cmnd)
        gname = gname.trim();
        let gid = await portal.getGroupIdByName(gname);
        if(!gid) return ctx.reply(LOCAL.group_not_found);
        ctx.user.gid = gid;
        ctx.user.gname = gname;
        await ctx.user.save();
        ctx.reply(LOCAL.group_changed, null, keyboards.main);
    })

    bot.command(COMMANDS.hi.triggers, async(ctx) => {
        if(ctx.user.gid) return ctx.reply( LOCAL.hi_authorized + ctx.user.gname,null, keyboards.main);
        let text = LOCAL.hi_not_authorized;
        ctx.reply(text, null, keyboards.hello);
    });

    bot.command(COMMANDS.commands.triggers, async(ctx) => {
        ctx.reply(editor.getCommandList(), null, keyboards.info);
    });

    bot.command(COMMANDS.information.triggers, async(ctx) => {
        ctx.reply(editor.getInformation(), null, keyboards.commands);
    });

    bot.command(COMMANDS.portal.triggers, async (ctx) => {
        ctx.reply('https://portal.unn.ru/');
    });

    bot.command(COMMANDS.bug.triggers, async (ctx) => {
        ctx.reply(LOCAL.bug_ty);
    });

    bot.command(COMMANDS.info.triggers, async (ctx) => {
        ctx.reply(LOCAL.info_ty);
    });

    bot.command(COMMANDS.help.triggers, async (ctx) => {
        ctx.reply(LOCAL.help_ty);
    });

    bot.command(COMMANDS.keysup.triggers, async (ctx) => {
        ctx.reply('&#128071;', null, keyboards.main);
    });

    bot.command(COMMANDS.keysdown.triggers, async (ctx) => {
        ctx.reply('&#128077;', null, keyboards.none);
    });

    bot.use((ctx,next) => {
        let text = LOCAL.none_group_warning;            
        if(!ctx.user.gid) return ctx.reply(text)
        next();
    });
    
    bot.command(COMMANDS.today.triggers, async (ctx) => {
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let info = await tt.today();
        let model = portal.makeViewModel(info);
        ctx.reply(editor.createMsg(model));
    })

    bot.command(COMMANDS.tommorow.triggers, async (ctx) => {
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let info = await tt.tommorow();
        let model = portal.makeViewModel(info);
        ctx.reply(editor.createMsg(model));
    })

    bot.command(COMMANDS.week.triggers, async (ctx) => {
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let info = await tt.week();
        let model = portal.makeViewModel(info);
        ctx.reply(editor.createMsg(model));
    })

    bot.command(COMMANDS.week2.triggers, async (ctx) => {
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let info = await tt.week2();
        let model = portal.makeViewModel(info);
        let resp = editor.createMsg(model).split('<=>');

        ctx.reply(resp[0]);
        if(resp[1]) setTimeout(() => {ctx.reply(resp[1]);}, 2000);         
    })

    bot.command(COMMANDS.when.triggers, async (ctx) => {
        let s = special.whenEgorMode(ctx);
        if(s) return ctx.reply(s);
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let command = ctx.message.text.substring(6);
        command = command.trim();
        if(!command.length) return ctx.reply(LOCAL.when_wrong_cmnd)
        let info = await tt.when(command);
        if(!(info && info.length)) return ctx.reply(LOCAL.when_not_found)
        ctx.reply(editor.createWhenMsg(info));
    });

    bot.command(COMMANDS.where.triggers, async (ctx) => {
        let s = special.whereEgorMode(ctx);
        if(s) return ctx.reply(s);
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let command = ctx.message.text.substring(4);
        command = command.trim();
        if(!command.length) return ctx.reply(LOCAL.where_wrong_cmnd)
        let info = await tt.where(command);
        if(!info) return ctx.reply(LOCAL.where_not_found)
        ctx.reply(editor.createWhereMsg(info));
    });

    bot.command(COMMANDS.date.triggers, async (ctx) => {
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let command = ctx.message.text.substring(5);
        command = command.trim();
        let date = Date.parse(command);
        if(isNaN(date)) return ctx.reply(LOCAL.date_wrong_cmnd)
        date = new Date(command);
        let info = await tt.date(date);
        if(info.error) return ctx.reply(LOCAL.date_portal_error);
        let model = portal.makeViewModel(info);
        ctx.reply(editor.createMsg(model));
    });

    bot.command(COMMANDS.remove.triggers, async(ctx) => {
        await ctx.user.delete();
        ctx.reply(LOCAL.delete_cmnd);
    });

    bot.use((ctx,next) => {
        ctx.reply(LOCAL.cmnd_not_found, null, keyboards.commands);
    });

    bot.startPolling(() => { console.log(`OnLiNe ${config.vkgroup}`);  });

}