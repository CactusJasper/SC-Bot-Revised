const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('confess')
		.setDescription('A command to confess...'),
	async execute(interaction) {},
};