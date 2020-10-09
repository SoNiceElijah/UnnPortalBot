 
const yaml = require('yaml'); 
const fs = require('fs');
const vkBot = require('node-vk-bot-api')
const config = yaml.parse(fs.readFileSync('config.yaml','utf-8'));

const mongoose = require('mongoose');

const User = require('./user');
const portal = require('./portal');
const editor = require('./text');

const keyboards = require('./keyboards');

const special = require('./special');

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
        let s = special.specialAnswers(ctx);
        if(s) return ctx.reply(s);
        next();
    })

    bot.command('группа', async (ctx) => {
        let gname = ctx.message.text.substring(6).trim();
        if(!gname) return ctx.reply("Проверь правильность комманды\nГруппа <название группы>")
        gname = gname.trim();
        let gid = await portal.getGroupIdByName(gname);
        if(!gid) return ctx.reply("Группа не найдена &#128532;");
        ctx.user.gid = gid;
        ctx.user.gname = gname;
        await ctx.user.save();
        ctx.reply("Группа успешно изменена &#128524;");
    })

    bot.command('привет', async(ctx) => {
        if(ctx.user.gid) return ctx.reply(`Привет!&#128515;\nТы сейчас следишь за группой ${ctx.user.gname}`);
        let text =
            `Привет! &#128515;\nВыбери группу для наблюдения` +
            `\n\nВот так\nГруппа <название группы>` +
            `\n\nНапример\nГруппа 382901-2` +
            `\n\nИли глянь список команд / информацию`;
        ctx.reply(text, null, keyboards.hello);
    });

    bot.command('команды', async(ctx) => {
        ctx.reply(editor.getCommandList(), null, keyboards.info);
    });

    bot.command('информация', async(ctx) => {
        ctx.reply(editor.getInformation(), null, keyboards.commands);
    });

    bot.command('портал', async (ctx) => {
        ctx.reply('https://portal.unn.ru/');
    });

    bot.command('#bug', async (ctx) => {
        ctx.reply('Спасибо! Мы скоро все починим');
    });

    bot.command('#info', async (ctx) => {
        ctx.reply('Спасибо за инфу');
    });

    bot.command('#help', async (ctx) => {
        ctx.reply('Команда админов уже бежит (и падает) на помощь');
    });

    bot.command('~+', async (ctx) => {
        ctx.reply('&#128071;', null, keyboards.main);
    });

    bot.command('~-', async (ctx) => {
        ctx.reply('&#128077;', null, keyboards.none);
    });

    bot.use((ctx,next) => {
        let text = 
            `Не могу такого сделать, пока ты не введешь группу\n\n` +
            `\n\nВот так\nГруппа <название группы>` +
            `\n\nНапример\nГруппа 382901-2`;
        if(!ctx.user.gid) return ctx.reply(text)
        next();
    });
    
    bot.command('сегодня', async (ctx) => {
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let info = await tt.today();
        let model = portal.makeViewModel(info);
        ctx.reply(editor.createMsg(model));
    })

    bot.command('завтра', async (ctx) => {
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let info = await tt.tommorow();
        let model = portal.makeViewModel(info);
        ctx.reply(editor.createMsg(model));
    })

    bot.command('неделя', async (ctx) => {
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let info = await tt.week();
        let model = portal.makeViewModel(info);
        ctx.reply(editor.createMsg(model));
    })

    bot.command('все', async (ctx) => {
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let info = await tt.week2();
        let model = portal.makeViewModel(info);
        let resp = editor.createMsg(model).split('<=>');

        ctx.reply(resp[0]);
        if(resp[1]) setTimeout(() => {ctx.reply(resp[1]);}, 2000);         
    })

    bot.command('когда', async (ctx) => {
        let s = special.whenEgorMode(ctx);
        if(s) return ctx.reply(s);
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let command = ctx.message.text.substring(6);
        command = command.trim();
        if(!command.length) return ctx.reply('Что-то не так с вводом команды &#128530;')
        let info = await tt.when(command);
        if(!(info && info.length)) return ctx.reply('Не нашли такую пару &#128532;')
        ctx.reply(editor.createWhenMsg(info));
    });

    bot.command('где', async (ctx) => {
        let s = special.whereEgorMode(ctx);
        if(s) return ctx.reply(s);
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let command = ctx.message.text.substring(4);
        command = command.trim();
        if(!command.length) return ctx.reply('Что-то не так с вводом команды &#128530;')
        let info = await tt.where(command);
        if(!info) return ctx.reply('Не нашли такую пару &#128532;')
        ctx.reply(editor.createWhereMsg(info));
    });

    bot.use((ctx,next) => {
        ctx.reply('Такой команды нет...');
    });

    bot.startPolling(() => { console.log(`OnLiNe ${config.vkgroup}`);  });

}