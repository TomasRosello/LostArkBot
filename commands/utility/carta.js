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
    ])).addStringOption(option => option.setName("server").setDescription("Servidor en el que está.").setRequired(true).setChoices([
        {name: "Elpon", value: "Elpon"},
        {name: "Gienah", value: "Gienah"},
        {name: "Arcturus", value: "Arcturus"},
        {name: "Ortuus", value: "Ortuus"},
        {name: "Ratik", value: "Ratik"},
    ])),
	async execute(interaction, usuarios) {
        let current = Math.floor(Date.now() / 1000);
        let nextStamp;
        if(current % 21600 <= 5400){
            nextStamp = (21600 - (current % 21600)) % 21600 + current + 5400;
        }
        else{
            nextStamp = (21600 - (current % 21600)) % 21600 + current + 5400;
        }
        switch(interaction.options.getString("carta")){
            case "Armel Delain":
                await interaction.reply(`**__Carta de Armel Delain__**
**Server:** ${interaction.options.getString("server")}
**Lugar:** Luterania Oriental
**Expira:** <t:${nextStamp}:R>
${interaction.options.getString("server") == "Elpon"? "<@&957279366335832115>" : interaction.options.getString("server") == "Ratik"? "<@&1270405585640099892>" : interaction.options.getString("server") == "Gienah"? "<@&1291067382608957501>" : interaction.options.getString("server") == "Arcturus"? "<@&1291065875239014441>" : "<@&1291067397008003083>"}`);
            break;
            case "Azena e Innana":
                await interaction.reply(`**__Carta de Azena e Innana__**
**Server:** ${interaction.options.getString("server")}
**Lugar:** Rohendel
**Expira:** <t:${nextStamp}:R>
${interaction.options.getString("server") == "Elpon"? "<@&957279366335832115>" : interaction.options.getString("server") == "Ratik"? "<@&1270405585640099892>" : interaction.options.getString("server") == "Gienah"? "<@&1291067382608957501>" : interaction.options.getString("server") == "Arcturus"? "<@&1291065875239014441>" : "<@&1291067397008003083>"}`);
            break;
            case "Balthor":
                await interaction.reply(`**__Carta de Balthor__**
**Server:** ${interaction.options.getString("server")}
**Lugar:** Yorn
**Expira:** <t:${nextStamp}:R>
${interaction.options.getString("server") == "Elpon"? "<@&957279366335832115>" : interaction.options.getString("server") == "Ratik"? "<@&1270405585640099892>" : interaction.options.getString("server") == "Gienah"? "<@&1291067382608957501>" : interaction.options.getString("server") == "Arcturus"? "<@&1291065875239014441>" : "<@&1291067397008003083>"}`);
            break;
            case "Kharmine":
                await interaction.reply(`**__Carta de Kharmine__**
**Server:** ${interaction.options.getString("server")}
**Lugar:** Rethramis
**Expira:** <t:${nextStamp}:R>
${interaction.options.getString("server") == "Elpon"? "<@&957279366335832115>" : interaction.options.getString("server") == "Ratik"? "<@&1270405585640099892>" : interaction.options.getString("server") == "Gienah"? "<@&1291067382608957501>" : interaction.options.getString("server") == "Arcturus"? "<@&1291065875239014441>" : "<@&1291067397008003083>"}`);
            break;
            case "Vairgrys":
                await interaction.reply(`**__Carta de Vairgrys__**
**Server:** ${interaction.options.getString("server")}
**Lugar:** Elgacia
**Expira:** <t:${nextStamp}:R>
${interaction.options.getString("server") == "Elpon"? "<@&957279366335832115>" : interaction.options.getString("server") == "Ratik"? "<@&1270405585640099892>" : interaction.options.getString("server") == "Gienah"? "<@&1291067382608957501>" : interaction.options.getString("server") == "Arcturus"? "<@&1291065875239014441>" : "<@&1291067397008003083>"}`);
            break;
            case "Varkan":
                await interaction.reply(`**__Carta de Varkan__**
**Server:** ${interaction.options.getString("server")}
**Lugar:** Voldis
**Expira:** <t:${nextStamp}:R>
${interaction.options.getString("server") == "Elpon"? "<@&957279366335832115>" : interaction.options.getString("server") == "Ratik"? "<@&1270405585640099892>" : interaction.options.getString("server") == "Gienah"? "<@&1291067382608957501>" : interaction.options.getString("server") == "Arcturus"? "<@&1291065875239014441>" : "<@&1291067397008003083>"}`);
            break;
            case "Wei":
                await interaction.reply(`**__Carta de Wei__**
**Server:** ${interaction.options.getString("server")}
**Lugar:** Anikka
**Expira:** <t:${nextStamp}:R>
${interaction.options.getString("server") == "Elpon"? "<@&957279366335832115>" : interaction.options.getString("server") == "Ratik"? "<@&1270405585640099892>" : interaction.options.getString("server") == "Gienah"? "<@&1291067382608957501>" : interaction.options.getString("server") == "Arcturus"? "<@&1291065875239014441>" : "<@&1291067397008003083>"}`);
            break;
        }
	},
};