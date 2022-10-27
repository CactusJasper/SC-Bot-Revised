require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();
let logging = require('./modules/logging');

client.on('ready', () => {
    console.log(`SC Bot up and running.`);
});

client.on('message', (message) => {
    if(message.author.bot) return;
    if(message.channel.type == 'dm') return;
    if(message.guild.id !== process.env.SC_SERVER_ID) return;
    // Message Logging Module
    const log = client.channels.cache.find(channel => channel.id === process.env.SC_LOGGING_CHANNEL);
    if(log !== undefined) logging.logMessage(message, log);
});

client.login(process.env.SC_DISCORD_TOKEN);