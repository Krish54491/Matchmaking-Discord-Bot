const { SlashCommandBuilder } = require('discord.js');
const db = require("../../db.js");
function removePlayerToDb(username,callback){
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
    callback(null, this.changes);
  });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unregister')
		.setDescription('Removes you from the competition'),
	async execute(interaction) {
        removePlayerToDb(interaction.user.username, async (err, removed) => {
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