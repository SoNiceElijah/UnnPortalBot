 
const yaml = require('yaml'); 
const fs = require('fs');
const vkBot = require('node-vk-bot-api')
const config = yaml.parse(fs.readFileSync('config.yaml','utf-8'));

const mongoose = require('mongoose');

const User = require('./user');
const portal = require('./portal');

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

    bot.command('группа', async (ctx) => {
        let gname = ctx.message.text.split(':')[1];
        if(!gname) return ctx.reply("Проверь правильность комманды\nгруппа : <название группы>")
        gname = gname.trim();
        let gid = await portal.getGroupIdByName(gname);
        if(!gid) return ctx.reply("Группа не найдена");
        ctx.user.gid = gid;
        ctx.user.gname = gname;
        await ctx.user.save();
        ctx.reply("Группа успешно изменена");
    })

    bot.use((ctx,next) => {
        if(!ctx.user.gid) return ctx.reply('Введи группу \nгруппа : <название группы>')
        next();
    });
    
    bot.command('сегодня', async (ctx) => {
        console.log(ctx);
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let info = await tt.today();
        ctx.reply(JSON.stringify(info));
    })

    bot.command('завтра', async (ctx) => {
        console.log(ctx);
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let info = await tt.tommorow();
        ctx.reply(JSON.stringify(info));
    })

    bot.command('неделя', async (ctx) => {
        console.log(ctx);
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let info = await tt.week();
        ctx.reply(JSON.stringify(info));
    })

    bot.command('2 недели', async (ctx) => {
        console.log(ctx);
        let tt = new portal.TTGroup(ctx.user.gid,ctx.message.date);
        let info = await tt.week2();
        ctx.reply(JSON.stringify(info));
    })

    bot.use((ctx,next) => {
        ctx.reply('Такой команды нет...');
    });

    bot.startPolling(() => { console.log(`OnLiNe ${config.vkgroup}`);  });

}