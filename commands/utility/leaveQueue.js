const { SlashCommandBuilder } = require('discord.js');
const db = require("../../db.js");

function getPlayerRank(id, callback){
    const sql = `SELECT rank FROM players WHERE userid = ?`;
    db.get(sql, [id], (err, row) => {
    if (err) return callback(err);

    if (row) {
      // User exists, return their rank
        callback(null, row.rank);
    } else {
      // User not found
        callback(null, null);
    }
  });
}

function removePlayerFromQueue(id,callback){
    getPlayerRank(id, (err,rank) => {
        if (err) return callback(err);
        const sql = `
          DELETE FROM queue
          WHERE username = ?
        `;
        db.run(sql, [id], function (err) {
        if(rank === null) return callback(null,null);
        if (err) {
            return callback(err);
        }
        if (this.changes === 0) {
            // No rows were deleted: user not found
            return callback(null, false);
        }
            callback(null, this.lastID);
        });
    })
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave-queue')
		.setDescription('Puts you out of queue.'),
	async execute(interaction) {
        const id = interaction.user.id;
        const username = interaction.user.username;
        removePlayerFromQueue(id, async (err, added) => {
            if (err) {
              console.error(err);
              await interaction.reply('An unexpected error occurred while unqueueing.');
            } else if (!added) {
              await interaction.reply('You are not in queue!');
            } else {
              await interaction.reply(`You are now unqueued, ${username}!`);
            }
        })
	},
};