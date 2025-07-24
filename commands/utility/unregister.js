const { SlashCommandBuilder } = require('discord.js');
const db = require("../../db.js");
function removePlayerFromQueue(username,callback){
    const sql = `
      DELETE FROM queue
      WHERE username = ?
    `;
    db.run(sql, [username], function (err) {
    if (err) {
        return callback(err);
    }
    if (this.changes === 0) {
        return callback(null, false);
    }
        callback(null, this.lastID);
    });
}
function removePlayerFromDb(username,callback){
    removePlayerFromQueue(username, async (err,deleted) =>{
        if(err) console.error(err);
    })
  const sql = `
    DELETE FROM players
    WHERE username = ?
  `;
  db.run(sql, [username], function (err) {
    if (err) return callback(err);
    if (this.changes === 0) {
      // No rows were deleted: user not found
      return callback(null, false);
    }
    callback(null, true);
  });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unregister')
		.setDescription('Removes you from the competition'),
	async execute(interaction) {
        const username = interaction.user.username;
        removePlayerFromDb(username, async (err, removed) => {
            if (err) {
              console.error(err);
              return await interaction.reply('There was an error unregistering you.');
            } else if(!removed){
                await interaction.reply(`You are not registered.`);
            } else {
                await interaction.reply(`You are unregistered, ${interaction.user.username}.`);
            }
        })
	},
};