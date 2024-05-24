const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('carta')
    .setDescription('Envía un aviso de que ha aparecido la carta.')
    .addStringOption(option => option.setName("carta").setDescription("Carta que ha aparecido.").setRequired(true).setChoices([
        {name: "Armel Delain", value: "Armel Delain"},
        {name: "Azena e Innana", value: "Azena e Innana"},
        {name: "Balthor", value: "Balthor"},
        {name: "Kharmine", value: "Kharmine"},
        {name: "Vairgrys", value: "Vairgrys"},
        {name: "Varkan", value: "Varkan"},
        {name: "Wei", value: "Wei"},
    ])),
	async execute(interaction, usuarios) {
        let current = Math.floor(Date.now() / 1000);
        let nextStamp = (21600 - (current % 21600)) % 21600 + current + 5400;
        switch(interaction.options.getString("carta")){
            case "Armel Delain":
                await interaction.reply(`**__Carta de Armel Delain__**
**Server:** Elpon
**Lugar:** Luterania Oriental
**Expira:** <t:${nextStamp}:R>
<@&957279366335832115>`);
            break;
            case "Azena e Innana":
                await interaction.reply(`**__Carta de Azena e Innana__**
**Server:** Elpon
**Lugar:** Rohendel
**Expira:** <t:${nextStamp}:R>
<@&957279366335832115>`);
            break;
            case "Balthor":
                await interaction.reply(`**__Carta de Balthor__**
**Server:** Elpon
**Lugar:** Yorn
**Expira:** <t:${nextStamp}:R>
<@&957279366335832115>`);
            break;
            case "Kharmine":
                await interaction.reply(`**__Carta de Kharmine__**
**Server:** Elpon
**Lugar:** Rethramis
**Expira:** <t:${nextStamp}:R>
<@&957279366335832115>`);
            break;
            case "Vairgrys":
                await interaction.reply(`**__Carta de Vairgrys__**
**Server:** Elpon
**Lugar:** Elgacia
**Expira:** <t:${nextStamp}:R>
<@&957279366335832115>`);
            break;
            case "Varkan":
                await interaction.reply(`**__Carta de Varkan__**
**Server:** Elpon
**Lugar:** Voldis
**Expira:** <t:${nextStamp}:R>
<@&957279366335832115>`);
            break;
            case "Wei":
                await interaction.reply(`**__Carta de Wei**
**Server:** Elpon
**Lugar:** Anikka
**Expira:** <t:${nextStamp}:R>
<@&957279366335832115>`);
            break;
        }
	},
};