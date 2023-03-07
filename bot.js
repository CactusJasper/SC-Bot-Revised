require('dotenv').config();
const fs = require('fs');
let mongoose = require('mongoose');
const { codeBlock } = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [
        'Guilds',
        'GuildMembers',
        'GuildBans',
        'GuildEmojisAndStickers',
        'GuildIntegrations',
        'GuildWebhooks',
        'GuildInvites',
        'GuildVoiceStates',
        'GuildPresences',
        'GuildMessages',
        'GuildMessageReactions',
        'GuildMessageTyping',
        'DirectMessages',
        'DirectMessageReactions',
        'DirectMessageTyping',
        'MessageContent',
        'GuildScheduledEvents',
        'AutoModerationConfiguration',
        'AutoModerationExecution'
    ],
    partials: [
        'CHANNEL',
        'MESSAGE'
    ],
    sweepers: {
        ...Discord.Options.DefaultSweeperSettings,
        messages: {
            interval: 3600,
            lifetime: 1800
        }
    },
    presence: 'Just your friendly neighbourhood watch'
});
let logging = require('./modules/logging');
let moderation = require('./modules/moderation');
const { ModalHandleInteractions } = require('./modules/modalHandler');
const { InteractionsHandler } = require('./modules/interactionHandler');
const { REST, Routes } = require('discord.js');

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.SC_DISCORD_TOKEN);

// Connect to DB / Load Toxicity modules model / Start Web Server / Start Discord Bot Client
mongoose.connect(process.env.DB_CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log(`Connected to Database Server`);
}).catch((err) => console.error(err));
let db = mongoose.connection;

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.SC_SERVER_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

client.on(Discord.Events.ClientReady, async () => {
    debugLog(`SC Bot started at (${new Date().toUTCString()}) and is running.\n`);
    client.user.setPresence({ 
        activities: [
            {
                name: 'your friendly neighbourhood watch',
                type: Discord.ActivityType.Watching
            }
        ],
        status: Discord.PresenceUpdateStatus.DoNotDisturb
    });
    client.user.setStatus(Discord.PresenceUpdateStatus.DoNotDisturb);
    logCacheStats(true);
    // Log Cache Stats every 30 minutes
    setInterval(() => logCacheStats(), (1000 * 60) * 30);
});

client.on(Discord.Events.InteractionCreate, async interaction => {
	try {
		if(interaction.isButton() && interaction.customId === 'approveConfession') {
			if(!canApprove(interaction.member.id)) {
				interaction.reply({ content: 'You are not authorised to approve confessions...', ephemeral: true });
				return;
			}

			interaction.reply({ content: 'Confession Approved...', ephemeral: true });
			await interaction.message.delete();
			const confessionChannel = client.channels.cache.find(channel => channel.id === process.env.CONFESSION_CHANNEL_ID);
			if(confessionChannel) confessionChannel.send(interaction.message.content);
			return;
		}

		if(interaction.isButton() && interaction.customId === 'declineConfession') {
			if(!canApprove(interaction.member.id)) {
				interaction.reply({ content: 'You are not authorised to decline confessions...', ephemeral: true });
				return;
			}

			interaction.reply({ content: 'Confession Declined...', ephemeral: true });
			await interaction.message.delete();
			return;
		}

		if(interaction.isModalSubmit()) {
			await ModalHandleInteractions(interaction, client);
			return;
		}

		if(interaction.isChatInputCommand()) {
			await InteractionsHandler(interaction, client);
			return;
		}
	} catch(err) {
		debugLog(`\nError Occured: ${err}`);
	}
});

function canApprove(memberId) {
	switch(memberId) {
		case '228618507955208192': // Wolfy
			return true;
		case '217387293571284992': // Jasper
			return true;
		case '707375823484616795': // Jack
			return true;
		default:
			return false;
	}
}

client.on(Discord.Events.MessageCreate, (message) => {
    if(message.author.bot) return;
    if(message.channel.type == Discord.ChannelType.DM) {
        const channel = client.channels.cache.find(channel => channel.id === message.channelId);
        moderation.dmModeration(message, channel);
        return;
    }
    if(message.guild.id !== process.env.SC_SERVER_ID) return;
    // Message Logging Module
    const log = client.channels.cache.find(channel => channel.id === process.env.SC_LOGGING_CHANNEL);
    const headerText = `[${message.channel.name}] Message by ${message.author.username}:`;
    const headerTextLength = headerText.length + codeBlock('').length;
    if(log !== undefined && message.content.length <= 2000 - headerTextLength) logging.logMessage(message, log);
    if(log !== undefined && message.content.length > 2000 - headerTextLength) logging.logLargeMessages(message, log);
});

client.login(process.env.SC_DISCORD_TOKEN);

// TODO: Add logging to a file
function logCacheStats(minimal = false) {
    let statMessage = `Cache Stats ${minimal ? 'at bot startup' : 'at ' + new Date().toUTCString()}`;
    statMessage += `\nUser Cache size: ${client.users.cache.size} Users`;
    statMessage += `\nChannel Cache size: ${client.channels.cache.size} Channels`;

    if(!minimal) {
        let messageCacheSize = 0;
        client.guilds.cache.find((guild) => guild.id === process.env.SC_SERVER_ID).channels.cache.forEach((channel) => {
            if(channel.isTextBased())
                messageCacheSize += channel.messages.cache.size;
        });
        statMessage += `\nMessage Cache size: ${messageCacheSize}`;
    }
    statMessage += '\n';

    debugLog(statMessage);
}

function debugLog(message) {
    if(!message) return;
    console.log(message);
    if(!fs.existsSync('./debugLog.unn')) {
        fs.writeFileSync('./debugLog.unn', message);
        return;
    }
    
    fs.appendFileSync('./debugLog.unn', `\n${message}`);
}
