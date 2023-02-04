const { HandleConfessModal } = require('./modals/confessModal');

exports.ModalHandleInteractions = async (interaction, client) => {
	switch(interaction.customId) {
		case 'unnConfessModal':
			await HandleConfessModal(interaction, client);
			return;
		case 'unnTestModal':
			await interaction.reply({ content: 'Modal Submitted successfully...' });
			return;
	}
}