// what we're doing 
//  we have ranked graphic designing
// be able to register to the competition - Done
// be able to UNregister to the competition - Done
// create queues - Done
// setup matches - Done
// those matchs should have a timer(configurable)
// at the end of match be able to take in a png file (a picture) and send it to desigated judges - scrapped
// grant points and change ranks if needed
// having a leaderboard system


const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token } = require('./config.json');
const db = require('./db.js');
const { match } = require('node:assert');
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const teamNames = [ // the prompts
    "Swift",
    "Redshyft",
    "Tenshi",
    "Pulse",
    "Nixus",
];
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
const ranks = {bronze: 0, silver: 1, gold: 2, platinum: 3, diamond: 4, master: 5, grandmaster: 6};
function findMatchingPlayers(callback) {
  const sql = `
    SELECT rank, GROUP_CONCAT(userid) as users, COUNT(*) as count
    FROM queue
    GROUP BY rank
    HAVING count >= 2
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
}
// how a player is defined
//player = {
//    username: "",
//    rank: 0,
//    points: 0, // 100 points or more means upgrade in rank
//    wins: 0,
//
//}
async function createMatchChannel(guild, player1, player2, judgeRoleId) {
    // Create a new text channel for the match
    const username1 = player1 ? player1.user.username : player1;
    const username2 = player2 ? player2.user.username : player2;
    const channel = await guild.channels.create({
        name: `match-${username1}-vs-${username2}`,
        type: 0, // 0 = GUILD_TEXT
        permissionOverwrites: [
            {
                id: guild.id, // @everyone
                deny: ['ViewChannel'],
            },
            {
                id: judgeRoleId, // Judge role
                allow: ['ViewChannel', 'SendMessages'],
            },
            {
                id: player1, // Player 1 user ID
                allow: ['ViewChannel', 'SendMessages'],
            },
            {
                id: player2, // Player 2 user ID
                allow: ['ViewChannel', 'SendMessages'],
            },
        ],
    });
    return channel;
}
async function timerOutput(matchChannel){
    let timeLeft = timer * 60; // Convert minutes to seconds
    const interval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(interval);
            matchChannel.send('Time is up! Please submit your designs.');
        } else if (timeLeft % 600 === 0) { // Every 10 minutes
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            matchChannel.send(`Time left: ${minutes}m ${seconds}s`);
        }
        timeLeft--;
    }, 1000);
      
}
const announcementChannelId = "1397780307461017620";
async function checkAndStartMatches() {
    findMatchingPlayers(async (err, matches) => {
        const guild = client.guilds.cache.first();
        const channel = guild.channels.cache.get(announcementChannelId);
        if (err) {
            if (channel) await channel.send('Error checking queue for matches.');
            return;
        }
        for (const match of matches){
            const players = match.users.split(",");
            if(players.length >= 2){
                const [player1, player2] = players;
                const judgeRoleId = '1361817820035289109'; // Replace with your Judge role ID
                const member1 = guild.members.cache.get(player1);
                const member2 = guild.members.cache.get(player2);
                if (member1 && member2) {
                    const matchChannel = await createMatchChannel(guild, member1, member2, judgeRoleId);
                    if (matchChannel) {
                        await matchChannel.send(`Match started between <@${player1}> and <@${player2}> (Rank: ${match.rank})!`);
                        await matchChannel.send(`Your prompt is: ${teamNames[Math.floor(Math.random() * teamNames.length)]}`);
                        await timerOutput(matchChannel);
                    }
                } else {
                    if(!player1){
                        db.run('DELETE FROM queue WHERE userid IN (?)', [player1], (err) => {
                            if (err) console.error('Error removing players from queue:', err);
                        });
                    }
                    if(!player2){
                        db.run('DELETE FROM queue WHERE userid IN (?)', [player2], (err) => {
                            if (err) console.error('Error removing players from queue:', err);
                        });
                    }
                    console.log(`a player is not found ${player1} and ${player2}`);
                    return;
                }
                db.run('DELETE FROM queue WHERE userid IN (?, ?)', [player1, player2], (err) => {
                if (err) console.error('Error removing players from queue:', err);
            }); 
            }
        }
    });
}
setInterval(checkAndStartMatches, 5000);

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
//      userid TEXT UNIQUE NOT NULL,
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
//