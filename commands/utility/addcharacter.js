const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addcharacter')
		.setDescription('Anade un personaje al usuario.')
		.addUserOption(option => option.setName("usuario").setDescription("Usuario en Discord").setRequired(true))
		.addStringOption(option => option.setName("character").setDescription("Personaje en Lost Ark").setRequired(true))
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
		await interaction.reply(`Añadiendo usuario`);
		usuarios = usuarios.map((user) => {
			if(user.userName == interaction.options.getUser("usuario").id){
				if(user.characters.filter((u) => u.name == interaction.options.getString("character"))==0){
					user.characters.push({
						name: interaction.options.getString("character"),
						guild: interaction.options.getString("guild")
					});
					interaction.editReply(`Usuario añadido`);
				}
				
				else{
					interaction.editReply(`Personaje ya existe.`);
				}
			}
		});
	},
};