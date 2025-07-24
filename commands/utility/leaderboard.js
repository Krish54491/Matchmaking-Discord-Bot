const { SlashCommandBuilder } = require('discord.js');
const db = require("../../db.js");

function getLeaderboard(callback) {
    const sql = `
        SELECT username, rank, points, wins
        FROM players
        ORDER BY rank DESC, points DESC
        LIMIT 10
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching leaderboard:', err);
            callback(err);
        } else {
            callback(null, rows);
        }
    });
}
module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the current leaderboard'),
	async execute(interaction) {
        getLeaderboard((err, leaderboard) => {
            if (err) {
                return interaction.reply({ content: 'An error occurred while fetching the leaderboard.', ephemeral: true });
            }
            if (leaderboard.length === 0) {
                return interaction.reply({ content: 'The leaderboard is currently empty.', ephemeral: true });
            }
            const leaderboardMessage = leaderboard.map((player, index) => {
                return `${index + 1}. ${player.username} - Rank: ${player.rank}, Points: ${player.points}, Wins: ${player.wins}`;
            }).join('\n');

            interaction.reply({ content: `**Leaderboard:**\n${leaderboardMessage}`, ephemeral: true });
        });
	},
};