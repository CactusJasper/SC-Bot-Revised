require('dotenv').config()
const { ChannelType } = require('discord.js');
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
let isChristmas = false;

client.on(Discord.Events.ClientReady, async () => {
    console.log(`SC Bot up and running.`);
    const channel = await client.channels.fetch('851504886854975492');
    const announcments = await client.channels.fetch('998476542046908498');
    if(!isChristmas) await channel.sendTyping();
    setInterval(async () => {
        if(new Date().toISOString().match('2022-12-25T00:00:00.000Z')) isChristmas = true;
        if(!isChristmas) await channel.sendTyping();
        if(isChristmas) await announcments.send(`@everyone Merry Christmas the time is ${new Date().toUTCString()}`);
    }, (1000 * 10) - 500);
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
    if(log !== undefined) logging.logMessage(message, log);
});

client.login(process.env.SC_DISCORD_TOKEN);

function removePunctuation(str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(/[&\/\\#,+\(\)$~%\.!^'"\;:*?\[\]<>{}]/g, '');
};