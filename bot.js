require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config');
let logging = require('./modules/logging');

client.on('ready', () => {
    console.log(`SC Bot up and running.`);
});

client.on('message', (message) => {
    if(message.author.bot) return;
    if(message.channel.type == 'dm') return;
    if(message.guild.id !== (process.env.SC_SERVER_ID ?? config.server_id)) return;
    // Message Logging Module
    const log = client.channels.cache.find(channel => channel.id === (process.env.SC_LOGGING_CHANNEL ?? config.logging_channel));
    if(log !== undefined) logging.logMessage(message, log);

});


client.login(process.env.SC_DISCORD_TOKEN ?? config.discord_token);