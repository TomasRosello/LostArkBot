require('dotenv/config');
const { Client, Collection, REST, Routes } = require('discord.js');
const { OpenAI } = require('openai');
var cron = require('cron');
var fs = require('fs');
const path = require('node:path');

//CARGA PERSONAJES
const users = require('./users.json');

//INIT CLIENT
const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent']
});

client.on('ready', async (client) => {
   console.log("Ready");    

   const guild = client.guilds.cache.get("945349552804864110");
    let res = await guild.members.fetch();
    res.forEach((member) => {
        let userName = member.user.id;
        if(users.filter((u) => u.userName === userName).length == 0){
            users.push({userName: userName, characters: []});
        }
    });
    fs.writeFile("users.json", JSON.stringify(users), function(err) {
        if (err) {
            console.log(err);
        }
    });

    client.commands = new Collection();

    const commands = [];
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    const rest = new REST().setToken(process.env.TOKEN);
    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(
                //Routes.applicationCommands("1240659333931601961"),
                Routes.applicationGuildCommands("1240659333931601961", "945349552804864110"),
                { body: commands },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();
});

//COMANDOS

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, users);
        fs.writeFile("users.json", JSON.stringify(users), function(err) {
            if (err) {
                console.log(err);
            }
        });
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

//VARIABLES 
const IGNORE_PREFIX = "!";
const CHANNELS = ['1240677827989471304', '951147467435544636', '957287193301360751', '978954688479264808', '1062025571195961424', '1144638145737007175', '1242931279679193118'];

//MENSAJES PROGRAMADOS
let scheduledMessages = new cron.CronJob('00 47 17 * * *', () => { //Segundo Minuto Hora DiaDelMes Mes DiaDeLaSemana 
    //let channel = client.channels.cache.get(CHANNELS[0]).send("Este mensaje se lanza a las 17:47");
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

    let rand = Math.floor(Math.random() * 20);
    console.log(rand);

    if(message.content.toLocaleLowerCase().indexOf("valtan") > -1 || rand === 0){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan, Comandante de la Legión" del juego Lost Ark. Eres un jefe enemigo de los jugadores que interactuan contigo. 
Tienes un hacha y junto a los otros Comandantes de la Legion (Vykas, Kakul-Saydon, Brelshaza, Akkan y Thaemine) quieres destruir Arkesia.`
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
    }
});

//CARGAR BOT
client.login(process.env.TOKEN);