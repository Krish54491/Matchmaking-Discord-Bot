const { SlashCommandBuilder } = require('discord.js');
const db = require("../../db.js");

function getPlayerRank(username, callback){
    const sql = `SELECT rank FROM players WHERE username = ?`;
    db.get(sql, [username], (err, row) => {
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

function addPlayerToDb(username,callback){
    getPlayerRank(username, (err,rank) => {
        if (err) return callback(err);
        if(rank === null) return callback(null,null);
        const sql = `
          INSERT INTO queue (username, rank)
          VALUES (?, ?)
        `;

        db.run(sql, [username,rank], function (err) {
          if (err) {
            // If error code is SQLITE_CONSTRAINT, it's a uniqueness violation
            if (err.code === 'SQLITE_CONSTRAINT') {
              return callback(null, false); // Already in queue
            }
            return callback(err);
          }
          callback(null, this.lastID);
        });
    })
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join-queue')
		.setDescription('Puts you into a queue for a match!(only people within one rank of each other can match)'),
	async execute(interaction) {
        const username = interaction.user.username;
        addPlayerToDb(username, async (err, added) => {
            if (err) {
              console.error(err);
              await interaction.reply('An unexpected error occurred while queueing.');
            } else if(added === null) {
              await interaction.reply('You are not registered! Go use "/register" first!');
            } else if (!added) {
              await interaction.reply('You are already in queue!');
            } else {
              await interaction.reply(`You are now searching for a match, ${username}!`);
            }
        })
	},
};