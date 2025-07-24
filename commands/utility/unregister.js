const { SlashCommandBuilder } = require('discord.js');
const db = require("../../db.js");
function removePlayerFromQueue(id,callback){
    const sql = `
      DELETE FROM queue
      WHERE userid = ?
    `;
    db.run(sql, [id], function (err) {
    if (err) {
        return callback(err);
    }
    if (this.changes === 0) {
        return callback(null, false);
    }
        callback(null, this.lastID);
    });
}
function removePlayerFromDb(id,callback){
    removePlayerFromQueue(id, async (err,deleted) =>{
        if(err) console.error(err);
    })
  const sql = `
    DELETE FROM players
    WHERE userid = ?
  `;
  db.run(sql, [id], function (err) {
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
        const id = interaction.user.id;
        const username = interaction.user.username;
        removePlayerFromDb(id, async (err, removed) => {
            if (err) {
              console.error(err);
              return await interaction.reply('There was an error unregistering you.');
            } else if(!removed){
                await interaction.reply(`You are not registered.`);
            } else {
                await interaction.reply(`You are unregistered, ${username}.`);
            }
        })
	},
};