const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bmi')
		.setDescription('BMIを計算します')
        .addNumberOption(option =>
            option.setName('mass')
                .setDescription('体重(kg)')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('height')
                .setDescription('身長(cm)')
                .setRequired(true)),
	async execute(interaction) {
        const mass = interaction.options.getNumber('mass');
        const height = interaction.options.getNumber('height') * 0.01;
        const bmi = mass / (height*height);
		await interaction.reply(String(bmi));
	},
};