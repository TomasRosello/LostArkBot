const { SlashCommandBuilder } = require('discord.js');
const { OpenAI } = require('openai');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('sorteo')
    .setDescription('Participa en el sorteo de 10k de Oro.'),
async execute(interaction, usuarios) {
    let numero = (Math.floor(Math.random() * 100)+1);
    //A BASTITO DALE NUMEROS MALOS
    interaction.reply(`${interaction.user.username} ha sacado un ${numero}`);
},
};