require('dotenv/config');
const { Client } = require('discord.js');
const { OpenAI } = require('openai');
var cron = require('cron');

//INIT CLIENT
const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent']
});

client.on('ready', (client) => {
   console.log("Ready");    
});

//VARIABLES 
const IGNORE_PREFIX = "!";
const CHANNELS = ['1211722536275152978', '1240677827989471304']; //0 Server Atom, 1 Coco

//MENSAJES PROGRAMADOS
let scheduledMessages = new cron.CronJob('00 47 17 * * *', () => {
    let channel = client.channels.cache.get(CHANNELS[0]).send("Este mensaje se lanza a las 17:47");
});

scheduledMessages.start();


//INIT OPENAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
});

//RESPONDER MENSAJES
client.on('messageCreate', async (message) => {
    if(message.author.bot) return;
    if(message.content.startsWith(IGNORE_PREFIX)) return;
    if(!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) return;

    if(message.content.toLocaleLowerCase().indexOf("fascito") > -1){
        const reply = {
            content: '',
            stickers: client.guilds.cache.get("945349552804864110").stickers.cache.filter((s) => s.id === "1212099138221514862")
        }
        message.reply(reply);
        return;
    }

    await message.channel.sendTyping();

    const sendTypingInternal = setInterval(() => {
        message.channel.sendTyping();
    }, 5000);

    let conversation = [];
    conversation.push({
        role: 'system',
        content: 'Responde a este mensaje como si fueses "Valtan, Comandante de la Legión" del juego Lost Ark.'
    });

    let prevMessages = await message.channel.messages.fetch({ limit : 10 });
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
        if(msg.author.bot && msg.author.id !== client.user.id) return;
        if(msg.content.startsWith(IGNORE_PREFIX)) return;

        const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

        if(msg.author.id === client.user.id) {
            conversation.push({
                role: 'assistant',
                name: username,
                content: msg.content
            });

            return;
        }

        conversation.push({
            role: 'user',
            name: username,
            content: msg.content
        });
    });

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: conversation
    }).catch((error) => console.error('Open AI Error:\n', error));

    clearInterval(sendTypingInternal);

    if(!response) {
        message.reply("Estoy teniendo algún problema con el internet por Arkesia. Intenta contactar de nuevo en unos instantes.");
        return;
    }

    const responseMessage = response.choices[0].message.content;
    const chunkSizeLimit = 2000;

    for( let i = 0; i < responseMessage.length; i += chunkSizeLimit){
        const chunk = responseMessage.substring(i, i + chunkSizeLimit);

        await message.reply(chunk);
    }
});

//CARGAR BOT
client.login(process.env.TOKEN);