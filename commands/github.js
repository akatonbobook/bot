const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('github')
		.setDescription('このbotのgithubページを表示します.'),
	async execute(interaction) {
		await interaction.reply('https://github.com/akatonbobook/bot');
	},
};