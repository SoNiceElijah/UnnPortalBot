const Markup = require('node-vk-bot-api/lib/markup');

const hello =  
    Markup.keyboard([
        [
            Markup.button('Команды', 'secondary'),
        ],
        [
            Markup.button('Информация', 'secondary'),
        ]
    ]).inline();

const info =  
    Markup.keyboard([
        [
            Markup.button('Информация', 'secondary'),
        ]
    ]).inline();

const commands =  
    Markup.keyboard([
        [
            Markup.button('Команды', 'secondary'),
        ]
    ]).inline();

const main =
    Markup.keyboard([
        [
            Markup.button('Сегодня', 'secondary'),
            Markup.button('Завтра', 'secondary'),
        ],
        [
            Markup.button('Неделя', 'secondary'),
            Markup.button('Все', 'secondary'),
        ]
    ]);

const none =  Markup.keyboard([]);

module.exports = {
    hello,
    info,
    commands,
    main,
    none
}