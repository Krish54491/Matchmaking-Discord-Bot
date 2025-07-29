const { SlashCommandBuilder } = require('discord.js');
const timerConfig = require('../../adminConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changetimer')
        .setDescription('Change the match timer (in minutes)')
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('The new timer duration in minutes')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(judgeRoleId)) {
            await interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
            return;
        }
        const newTimer = interaction.options.getInteger('minutes');
        if (newTimer < 1) {
            await interaction.reply({ content: 'Please provide a time greater than 0', ephemeral: true });
            return;
        }
        timerConfig.timer = newTimer;
        await interaction.reply({ content: `Timer updated to ${newTimer} minutes.`, ephemeral: true });
    },
};