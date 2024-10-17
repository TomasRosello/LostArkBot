const { SlashCommandBuilder } = require('discord.js');
const { join } = require('node:path');
const {joinVoiceChannel, VoiceConnectionStatus, createAudioPlayer, createAudioResource, AudioPlayerStatus} = require("@discordjs/voice");

module.exports = {
	data: new SlashCommandBuilder()
    .setName('beti')
    .setDescription('Beti')
    .addStringOption(option => option.setName("canal").setDescription("Canal beti.").setRequired(true).setChoices([
        {name: "Aldea Mokoko", value: '1053916629244850246'},
        {name: "Pinus", value: '1184183020295561216'},
        {name: "Sala Chill", value: '1037676536423252028'},
        {name: "AFK", value: '1084055805726302248'},
        {name: "Raid 1", value: '1053765206238572684'},
        {name: "Raid 2", value: '1157433699533598842'},
        {name: "Raid 3", value: '945354100139241472'},
        {name: "Raid 4", value: '1110231451984740402'},
        {name: "Sala Peque", value: '1087849470093443143'},
        {name: "Sala Grande", value: '1087849439533740172'},
        {name: "Sala Grande 2", value: '1230896603133644921'},
        {name: "Sala Pequqe 2", value: '1255982155478077570'},
        {name: "Otros juegos", value: '1001945092774449283'},
        {name: "Rincon de Pensar", value: '1084054693841490020'},
        {name: "Rincon de Llorar", value: '1295393618042945578'}
    ])),
	async execute(interaction, usuarios) {
    //const guild = interaction.guilds.cache.get("945349552804864110");
    if(interaction.user.id == '268092673120927745' || interaction.user.id == '279311042348318720' || interaction.user.id == '264131137272545290'){
        const vc = joinVoiceChannel({
            channelId: interaction.options.getString("canal"),
            guildId: "945349552804864110",
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });
        const player = createAudioPlayer();
        const reso = createAudioResource(join(__dirname, "../../beti.mp3"));
        player.play(reso, {volume: .25});
        vc.subscribe(player);
    }
	},
};