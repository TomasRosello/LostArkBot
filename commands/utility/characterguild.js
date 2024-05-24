const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('characterguild')
		.setDescription('Lista los personajes de un gremio.')
		.addStringOption(option => option.setName("guild").setDescription("Gremio").setRequired(true).setChoices([
			{name: "Cocomokoko", value: "Cocomokoko"},
			{name: "Cocomokoko Jr", value: "Cocomokoko Jr"},
			{name: "Kokomococo", value: "Kokomococo"},
			{name: "Cocomokoko Chiquita", value: "Cocomokoko Chiquita"},
			{name: "Cocomokoko Kadan", value: "Cocomokoko Kadan"},
			{name: "Cocomokoko Wei", value: "Cocomokoko Wei"},
			{name: "La llorería", value: "La llorería"},
			
		])),
	async execute(interaction, usuarios) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
        let listChars = [];
		usuarios.map((usera) => {
			usera.characters.map((char) =>{
				if(char.guild == interaction.options.getString("guild")){
					let userName = interaction.client.users.cache.filter((user) => user.id === usera.userName);
					listChars.push(`- ${char.name} (${userName.get(usera.userName).username})`);
				}
			});
		});
		let strChars = "";
		listChars.map((lc) => {strChars += lc + '\n'});
		await interaction.reply(`Personajes de ${interaction.options.getString("guild")}:
${strChars}`);
	},
};