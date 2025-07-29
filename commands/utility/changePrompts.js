const { SlashCommandBuilder } = require('discord.js');
const adminConfig = require('../../adminConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changeprompts')
        .setDescription('Change the match prompts')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('The new prompt for the match')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Whether to add or remove a prompt')
                .setRequired(true)),
    async execute(interaction) {
        const newPrompt = interaction.options.getString('prompt');
        const actionType = interaction.options.getString('type');

        if (!newPrompt) {
            await interaction.reply({ content: 'Please provide a valid prompt.', ephemeral: true });
            return;
        }
        if( actionType !== 'add' && actionType !== 'remove') {
            await interaction.reply({ content: 'Please specify whether to add or remove a prompt.', ephemeral: true });
            return;
        }
        if (actionType === 'add') {
            adminConfig.prompts.push(newPrompt);
            await interaction.reply({ content: `Prompt added: ${newPrompt}`, ephemeral: true });
        } else if (actionType === 'remove') {
            const index = adminConfig.prompts.indexOf(newPrompt);
            if (index > -1) {
                adminConfig.prompts.splice(index, 1);
                await interaction.reply({ content: `Prompt removed: ${newPrompt}`, ephemeral: true });
            } else {
                await interaction.reply({ content: `Prompt not found: ${newPrompt}`, ephemeral: true });
            }
        }
    },
};