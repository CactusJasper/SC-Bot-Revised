exports.TestInteraction = async (interaction) => {
	const modal = new Discord.ModalBuilder()
			.setCustomId('unnTestModal')
			.setTitle('Testing Discord Modal Functionality');

		// TODO: Add components to modal...
        const testInput = new Discord.TextInputBuilder()
			.setCustomId('someRandomTestInput')
		    // The label is the prompt the user sees for this input
			.setLabel("A Random Test input it uses type short :)")
		    // Short means only a single line of text
			.setStyle(Discord.TextInputStyle.Short);

        const firstActionRow = new Discord.ActionRowBuilder().addComponents(testInput);
        modal.addComponents(firstActionRow);

	await interaction.showModal(modal);
}