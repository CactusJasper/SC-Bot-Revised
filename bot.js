require('dotenv').config();
const fs = require('fs');
const { ChannelType, codeBlock } = require('discord.js');
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
    client.user.setStatus(Discord.PresenceUpdateStatus.Idle);
    logCacheStats(true);
    // Log Cache Stats every 30 minutes
    setTimeout(logCacheStats, (1000 * 60) * 30);
});

client.on(Discord.Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'test') {
		const modal = new ModalBuilder()
			.setCustomId('unnTestModal')
			.setTitle('Testing Discord Modal Functionality');

		// TODO: Add components to modal...
        const testInput = new TextInputBuilder()
			.setCustomId('someRandomTestInput')
		    // The label is the prompt the user sees for this input
			.setLabel("A Random Test input it uses type short :)")
		    // Short means only a single line of text
			.setStyle(Discord.TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder().addComponents(testInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
	}
});

client.on(Discord.Events.MessageCreate, (message) => {
    if(message.author.bot) return;
    if(message.channel.type == ChannelType.DM) {
        const channel = client.channels.cache.find(channel => channel.id === message.channelId);
        moderation.dmModeration(message, channel);
        return;
    }
    if(message.guild.id !== process.env.SC_SERVER_ID) return;
    //moderation.clasifyMessage(message);
    //if(message.content === 'test') message.react('<:sadge:851788592221126656>');
    // Message Logging Module
    const log = client.channels.cache.find(channel => channel.id === process.env.SC_LOGGING_CHANNEL);
    const headerText = `[${message.channel.name}] Message by ${message.author.username}:`;
    const headerTextLength = headerText.length + codeBlock('').length;
    if(log !== undefined && message.content.length <= 2000 - headerTextLength) logging.logMessage(message, log);
    if(log !== undefined && message.content.length > 2000 - headerTextLength) logging.logLargeMessages(message, log);
});

client.login(process.env.SC_DISCORD_TOKEN);

function removePunctuation(str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(/[&\/\\#,+\(\)$~%\.!^'"\;:*?\[\]<>{}]/g, '');
};

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
