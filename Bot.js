// what we're doing 
//  we have ranked graphic designing
// be able to register to the competition - Done
// be able to UNregister to the competition - Done
// create queues
// setup matches
// those matchs should have a timer(configurable)
// at the end of match be able to take in a png file (a picture) and send it to desigated judges
// grant points and change ranks if needed
// having a leaderboard system
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});
// When the client is ready, run this code (only once).
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);
let timer = 60 // in minutes
let queue = [];
const ranks = {bronze: 0, silver: 1, gold: 2, platinum: 3, diamond: 4, master: 5, grandmaster: 6};
let players = [];

// how a player is defined
//player = {
//    username: "",
//    rank: 0,
//    points: 0, // 1000 points or more means upgrade in rank
//    wins: 0,
//
//}


// database intial setup:
//const sqlite3 = require('sqlite3').verbose();
//const path = require('path');
//
//const dbPath = path.join(__dirname, 'data.db');
//const db = new sqlite3.Database(dbPath, (err) => {
//  if (err) {
//    console.error('❌ Could not connect to database', err);
//  } else {
//    console.log('✅ Connected to SQLite database');
//  }
//});
//
//module.exports = db;
//
//db.serialize(() => {
//  db.run(`
//    CREATE TABLE IF NOT EXISTS players (
//      id INTEGER PRIMARY KEY AUTOINCREMENT,
//      username TEXT UNIQUE NOT NULL,
//      rank INTEGER DEFAULT 0,
//      points INTEGER DEFAULT 0,
//      wins INTEGER DEFAULT 0
//    )
//  `, (err) => {
//    if (err) {
//      console.error('❌ Failed to create players table:', err.message);
//    } else {
//      console.log('✅ Players table ready');
//    }
//  });
//});
