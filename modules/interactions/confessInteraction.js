const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

exports.ConfessInteraction = async (interaction) => {
	const modal = new ModalBuilder()
	.setCustomId('unnConfessModal')
	.setTitle('Annon Confess');

	const testInput = new TextInputBuilder()
		.setCustomId('confessInputText')
		.setLabel("What would you like to confess")
		.setStyle(TextInputStyle.Paragraph).setMaxLength(1750);

	const firstActionRow = new ActionRowBuilder().addComponents(testInput);
	modal.addComponents(firstActionRow);

	await interaction.showModal(modal);
}