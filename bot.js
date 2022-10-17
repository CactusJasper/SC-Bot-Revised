const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config');
let logging = require('./modules/logging');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (message) => {
    if(message.author.bot) return;
    if(message.channel.type == 'dm') return;
    if(message.guild.id !== config.server_id) return;
    // Message Logging Module
    const log = client.channels.cache.find(channel => channel.id === config.logging_channel);
    if(log !== undefined) logging.logMessage(message, log);

});


client.login(config.discord_token);