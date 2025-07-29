const { SlashCommandBuilder } = require('discord.js');
const db = require("../../db.js");

const {judgeRoleId} = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('declare-win-lose')
        .setDescription('Declare a win for a match you judged in.')
        .addStringOption(option =>
            option.setName('winner')
                .setDescription('Username of the winner')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('loser')
                .setDescription('Username of the loser')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(judgeRoleId)) {
            await interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
            return;
        }
        const loser = interaction.options.getString('loser');
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
        let newRank;
        let newPoints;
        if(rank === 6){
            newRank = 6;
            newPoints = (points + 30 >= 100) ? 100 : points + 30;
        } else{
            newRank = (points + 30 >= 100) ? rank + 1 : rank;
            newPoints = (points + 30 >= 100) ? points - 70 : points + 30;
        }
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

        sql = `
            SELECT points, rank FROM players WHERE username = ?
        `;
        db.get(sql, [loser], function (err, row) {
            if (err) {console.error(err);}
            points = row.points;
            rank = row.rank;
        });
        if(rank === 0){
            newRank = 0;
            newPoints = (points - 30 <= 0) ? 0 : points - 30;
        } else {
            newRank = (points - 30 < 0) ? rank - 1 : rank;
            newPoints = (points - 30 <= 0) ? 0 : points - 30;
        }

        sql = `
            UPDATE players
            SET points = ?,
                rank = ?
            WHERE username = ?
        `;
        db.run(sql, [newPoints, newRank, loser], function (err) {
            if (err) {
                console.error(err);
                interaction.reply({ content: '❌ An error occurred while updating the player.', ephemeral: true });
                return;
            }
            interaction.reply({ content: `✅ Declared ${loser} as the loser!`, ephemeral: true });
        });
    },
};