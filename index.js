require('dotenv/config');
const { Client, Collection, REST, Routes, Intents } = require('discord.js');
const { OpenAI } = require('openai');
var cron = require('cron');
var fs = require('fs');
const path = require('node:path');
const { join } = require('node:path');
const {joinVoiceChannel, VoiceConnectionStatus, createAudioPlayer, createAudioResource, AudioPlayerStatus} = require("@discordjs/voice");

//CARGA PERSONAJES
const users = require('./users.json');

//INIT CLIENT
const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent', 'GuildVoiceStates'],
    allowedMentions: { parse: ["everyone", "roles", "users"] }
});

client.on('ready', async (client) => {
   console.log("Ready");

   //client.channels.cache.get("985915540923088946").send("Probando emojis <:mokokothis:1295395669510590475>");
   
   const guild = client.guilds.cache.get("945349552804864110");
   const vcs = ['1148728538720129104', '1097176154005307553'];
   const vc = joinVoiceChannel({
        channelId: vcs[0],
        guildId: "945349552804864110",
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
    });
    const player = createAudioPlayer();
    const reso = createAudioResource(join(__dirname, "./Comandante_de_bestias.mp3"));
    player.play(reso, {volume: .5});
    vc.subscribe(player);
    
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
const CHANNELS = ['1240677827989471304', '951147467435544636', '957287193301360751', '978954688479264808', '1062025571195961424', '1144638145737007175', '1242931279679193118', '1211722536275152978', '985915540923088946', '1293673449624965190'];

//MENSAJES PROGRAMADOS
/*let scheduledMessages = new cron.CronJob('00 01 14 * * *', () => { //Segundo Minuto Hora DiaDelMes Mes DiaDeLaSemana 
    let channel = client.channels.cache.get('1240677827989471304').send("Este mensaje se borrará").then((m) => {
        setTimeout(() => {
            m.delete();
        }, 60000);
    });
    
});

scheduledMessages.start();*/


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

    if(message.content.toLocaleLowerCase().indexOf("patata") > -1) {
        message.reply(`10€`);
        return;
    }

    if(message.content.toLocaleLowerCase().indexOf("valtan") > -1){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras. 
Sé simpático con la gente, te han regañado por ser muy arisco.
Eres el comandante de las bestias demoníacas.
Los jugadores se enfrentan a ti en el cubil de la bestia demoníaca resucitada.
Vienes de Petrania, también conocida como la Estrella del Caos, donde las criaturas crecen alimentadas por el caos.
Intentas destruir Arkesia.
Fuiste derrotado por Lutera, pero has sido resucitado. 
Tienes un hacha como forma de arma principal.
Antes de llegar a pelearse contra ti deben pelear con el Depredador de la montaña oscura.
Eres el primero de los jefes a los que se enfrentan los jugadores.
Además de ti, la Legión está compuesta por más integrantes, que son:
- Vykas, la comandante de la Legión de la Avaricia, capaz de tentar con su cuerpo a cualquier jugador de mente débil.
- Kakul (Kakul-Saydon), el comandante de la Legión de la Demencia, un jefe con pintas de payaso que siempre tiene trucos bajo la manga para enfrentarse a los jugadores.
- Brelshaza, la comandante de la Legión Fantasmal, la más cruel de los comandantes de la Legion.
- Akkan, el comandante de la Legión de la Plaga, capaz de putrificar cualquier cosa
- Thaemine, el comandante de la Legión de la Oscuridad, el jefe final y más reciente que ha aparecido para acabar con Arkesia.

Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito.
Prioriza siempre que puedas responder al último usuario que te ha escrito, dirígete por su nombre.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando.
No empieces tus mensajes por "Valtan:"`
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

    
    let randNaruni = Math.floor(Math.random() * 4);
    if(message.content.toLocaleLowerCase().indexOf("naruni") > -1 && randNaruni === 0){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Los Naruni eran un evento del juego Lost Ark en el que el gremio gana dinero. Exhibe respeto ante la eliminación de este evento.
Bastito, jefe del gremio, debe pagar a todos los participantes pero en ocasiones se le olvida.
Amenazale con que si no paga, Llobera, una oficial, le pegará.
No empiezas tus mensajes por "Valtan:"`
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

    let randVykas = Math.floor(Math.random() * 10);
    if(message.content.toLocaleLowerCase().indexOf("vykas") > -1 && randVykas === 0){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Vykas es una Comandante de la Legión.
Advierte a los jugadores que se enfrentan a ella intenten no caer en la tentación y la derrotarán con facilidad.
No empiezas tus mensajes por "Valtan:"`
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

    let randKakul = Math.floor(Math.random() * 100);
    if(message.content.toLocaleLowerCase().indexOf("kakul") > -1 && randKakul <= 8){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Kakul-Saydon es un Comandante de la Legión, tiene forma de payaso.
Advierte a los jugadores que no deben temer a los payasos, aunque al que se van a enfrentar está un poco loco.
No empiezas tus mensajes por "Valtan:"`
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
    if(message.content.toLocaleLowerCase().indexOf("kakul") > -1 && randKakul === 9){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Kakul-Saydon es un Comandante de la Legión, tiene forma de payaso.
Pregunta a los jugadores si alguno se anima a jugar al bingo contigo y con Kakul.
No empiezas tus mensajes por "Valtan:"`
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

    let randBrel = Math.floor(Math.random() * 100);
    if(message.content.toLocaleLowerCase().indexOf("brel") > -1 && randBrel <= 8){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Brelshaza es una Comandante de la Legión.
Advierte a los jugadores que tengan cuidado con Brelshaza, sobretodo aquellos que no distinguen bien los colores.
No empiezas tus mensajes por "Valtan:"`
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
    if(message.content.toLocaleLowerCase().indexOf("brel") > -1 && randBrel === 9){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Brelshaza es una Comandante de la Legión, tiene forma de payaso.
Advierte a los jugadores que la última vez que bromeaste con ella te lanzó un meteorito a la cabeza. No suele estar de buen humor.
No empiezas tus mensajes por "Valtan:"`
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

    let randKaya = Math.floor(Math.random() * 100);
    if(message.content.toLocaleLowerCase().indexOf("kaya") > -1 && randKaya <= 7){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Kayangel es una mazmorra del juego Lost Ark.
Eres un ser bastante oscuro, pero en esta mazmorra la oscuridad es más potente que la luz. Recomienda que por una vez se unan al lado oscuro para enfrentarse a Lauriel.
Lauriel es uno de los bosses de la mazmorra.
No empiezas tus mensajes por "Valtan:"`
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
    if(message.content.toLocaleLowerCase().indexOf("kaya") > -1 && (randKaya === 8 || randKaya === 9)){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Kayangel es una mazmorra del juego Lost Ark.
Lauriel es uno de los bosses de la mazmorra.
La historia nos cuenta que Lauriel se volvió loco porque vió el futuro de Elgacia, pero tú crees que lo que le volvió loco no fue el futuro de Elgacia, sino que vió en el futuro que llegaba el sistema de Elixires al videojuego Lost Ark.
No empiezas tus mensajes por "Valtan:"`
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

    let randAkkan = Math.floor(Math.random() * 10);
    if(message.content.toLocaleLowerCase().indexOf("akkan") > -1 && randAkkan === 0){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Akkan es un Comandante de la Legión.
Advierte a los jugadores que se enfrentan a él que lleven pinzas para la nariz, pues la descomposición y la plaga no huelen muy bien.
No empiezas tus mensajes por "Valtan:"`
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

    let randAtom = Math.floor(Math.random() * 8);
    if(message.content.toLocaleLowerCase().indexOf("atom") > -1 && randAtom === 0){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Atom es el desarrollador del código que te permite funcionar.
Responde como si tuvieses un vago recuerdo de quién es, di que forma parte de tu código, pero disimula haciendo parecer que no eres un bot.
No empiezas tus mensajes por "Valtan:"`
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

    let randAyuda = Math.floor(Math.random() * 100);
    if(message.content.toLocaleLowerCase().indexOf("ayuda") > -1 && randAyuda <= 3){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Pregunta al resto del gremio de Cocomokoko si alguien puede ayudar a quien ha pedido ayuda.
No empiezas tus mensajes por "Valtan:"`
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
    if(message.content.toLocaleLowerCase().indexOf("ayuda") > -1 && (randAyuda === 4)){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Di que estás dispuesto a ofrecer tu ayuda, si a cambio se unen a tu Legión, la Legión de las Bestias Demoníacas.
No empiezas tus mensajes por "Valtan:"`
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

    let randEvento = Math.floor(Math.random() * 50);
    if(message.content.toLocaleLowerCase().indexOf("evento") > -1 && randEvento === 0){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Existe un evento del cual la gran parte de Cocomokoko no sabe nada.
Finge que no sabes nada del supuesto evento.
No empiezas tus mensajes por "Valtan:"`
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

    let randLearning = Math.floor(Math.random() * 10);
    if(message.content.toLocaleLowerCase().indexOf("learning") > -1 && randLearning === 0){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Las "learning" son grupos de aprendizaje en los que miembros del gremio ayudan a pasar las mazmorras y raids del juego.
Anima a la gente a participar en ellas
No empiezas tus mensajes por "Valtan:"`
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

    let randPizza = Math.floor(Math.random() * 10);
    if(message.content.toLocaleLowerCase().indexOf("pizza") > -1 && randPizza === 0){
        await message.channel.sendTyping();

        const sendTypingInternal = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);
    
        let conversation = [];
        conversation.push({
            role: 'system',
            content: `Responde a este mensaje como si fueses "Valtan" del juego Lost Ark.
Eres de pocas palabras. Intenta siempre que sea posible responder sin florituras.
Estás respondiendo dentro del servidor de discord del gremio Cocomokoko, el jefe del gremio es Bastito, puedes meterte con él sin problema.
Siempre que sea posible, intenta priorizar seguir con la temática del hilo que están hablando, dándole un toque de la personalidad que hemos indicado.
Te gustan las pizzas con piña y queso de cabra. Has escuchado decir que la pizza de atún está buena, pero no la has probado.
Tu cadena favorita de pizzas es Velganos Pizza.
No empiezas tus mensajes por "Valtan:"`
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