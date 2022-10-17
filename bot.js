const Discord = require('discord.js');
const client = new Discord.Client();
let mongoose = require('mongoose');
const config = require('./config');
let logging = require('./modules/logging');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Connect to DB / Load Toxicity modules model / Start Web Server / Start Discord Bot Client
mongoose.connect(config.db_url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log(`Connected to Database Server`);
}).catch((err) => console.error(err));

client.on('message', (message) => {
    if(message.author.bot) return;
    if(message.channel.type == 'dm') return;
    if(message.guild.id !== config.server_id) return;
    // Message Logging Module
    const log = client.channels.cache.find(channel => channel.id === config.logging_channel);
    if(log !== undefined) logging.logMessage(message, log);

});
