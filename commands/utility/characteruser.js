const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('characteruser')
		.setDescription('Lista los personajes de un usuario.')
		.addUserOption(option => option.setName("usuario").setDescription("Usuario en Discord").setRequired(true)),
	async execute(interaction, usuarios) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
        let listChars = "";
        usuarios.filter((user) => interaction.options.getUser("usuario").id == user.userName)[0].characters.map((ch) => listChars += `- ${ch.name} (${ch.guild})\n`);
		await interaction.reply(`Personajes de ${interaction.options.getUser("usuario").username}:
${listChars}`);
	},
};