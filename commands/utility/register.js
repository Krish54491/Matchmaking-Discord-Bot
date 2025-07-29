const { SlashCommandBuilder } = require('discord.js');
const db = require("../../db.js");
const {playerRoleId} = require('../../config.json');
const {judgeRoleId} = require('../../config.json');
function addPlayerToDb(username,id,callback){
  const sql = `
    INSERT INTO players (username,userid, rank, points, wins)
    VALUES (?, ?, 0, 0, 0)
  `;
  db.run(sql, [username, id], function (err) {
    if (err) {
      // If error code is SQLITE_CONSTRAINT, it's a uniqueness violation
      if (err.code === 'SQLITE_CONSTRAINT') {
        return callback(null, false); // Already registered
      }
      return callback(err);
    }
    callback(null, this.lastID);
  });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Registers you to the competition!'),
	async execute(interaction) {
    if (!interaction.member.roles.cache.has(playerRoleId) && !interaction.member.roles.cache.has(judgeRoleId)) {
            await interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
            return;
        }
      const id = interaction.user.id;
      const username = interaction.user.username;
        addPlayerToDb(username, id, async (err, added) => {
            if (err) {
              console.error(err);
              await interaction.reply('An unexpected error occurred while registering.');
            } else if (!added) {
              await interaction.reply('You are already registered!', { ephemeral: true });
            } else {
              await interaction.reply(`You are now registered, ${username}!`);
            }
        })
	},
};