const { SlashCommandBuilder } = require('@discordjs/builders');
const { generate_scramble, solve_scramble } = require('../cube/cube');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cube')
		.setDescription('ルービックキューブに関するコマンド')
        .addSubcommand(subcommand => 
            subcommand.setName('scramble')
                .setDescription('Generate a random scramble'))
        .addSubcommand(subcommand => 
            subcommand.setName('solve')
                .setDescription('Solve a scrambled cube')
                .addStringOption(option => 
                    option.setName('scramble')
                        .setDescription('A scramble for cube state')
                        .setRequired(true))),
	async execute(interaction) {
        if(interaction.options.getSubcommand() == 'scramble') {
            await interaction.reply(`\`${generate_scramble()}\``);
        } else if (interaction.options.getSubcommand() == 'solve') {
            const scramble = interaction.options.getString('scramble');
            const solution = solve_scramble(scramble);
            if (solution) {
                await interaction.reply(`Given scramble is \`${scramble}\`\n`
                                      + `Solution is \`${solution}\``);
            } else {
                await interaction.reply(`Scramble is invaild.`);
            }
        }
	},
};