const { SlashCommandBuilder } = require('@discordjs/builders');
const { addGuild, removeGuild } = require('../eew/eew');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eew')
		.setDescription('緊急地震速報の設定')
        .addBooleanOption(option => 
                option.setName('notify').setDescription('緊急地震速報を通知するか').setRequired(true)),
	async execute(interaction) {
        if (interaction.guild) {
            if (interaction.options.getBoolean('notify')) {
                addGuild(interaction.guild);
                interaction.reply('緊急地震速報を有効にしました．');
            } else {
                removeGuild(interaction.guild);
                interaction.reply('緊急地震速報を無効にしました．');
            }
        }
	},
};