const { SlashCommandBuilder } = require('discord.js');
const db = require("../../db.js");

const judgeRoleId = "1361817820035289109";
module.exports = {
    data: new SlashCommandBuilder()
        .setName('declare-win')
        .setDescription('Declare a win for a match you judged in.')
        .addStringOption(option =>
            option.setName('winner')
                .setDescription('Username of the winner')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(judgeRoleId)) {
            await interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const winner = interaction.options.getString('winner');
        let sql = `
            SELECT points, rank FROM players WHERE username = ?
        `;
        let points, rank;
        db.run(sql, [winner], function (err, row) {
            if (err) {console.error(err);}
            points = row.points;
            rank = row.rank;
        });
        const newRank = (points + 30 >= 100) ? rank + 1 : rank;
        const newPoints = (points + 30 >= 100) ? points - 70 : points + 30;
        sql = `
            UPDATE players
            SET wins = wins + 1,
                points = ?,
                rank = ?
            WHERE username = ?
        `;
        db.run(sql, [newPoints, newRank, winner], function (err) {
            if (err) {
                console.error(err);
                interaction.reply({ content: '❌ An error occurred while updating the player.', ephemeral: true });
                return;
            }
            interaction.reply({ content: `✅ Declared ${winner} as the winner!`, ephemeral: true });
        });
    },
};