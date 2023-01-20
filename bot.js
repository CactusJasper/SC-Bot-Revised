require('dotenv').config()
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
    ]
});
let logging = require('./modules/logging');
let moderation = require('./modules/moderation');

client.on(Discord.Events.ClientReady, async () => {
    console.log(`SC Bot up and running.`);
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