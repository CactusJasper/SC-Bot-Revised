const { ConfessInteraction } = require('./interactions/confessInteraction');
const { TestInteraction } = require('./interactions/testInteraction');

exports.InteractionsHandler = async (interaction, client) => {
	switch(interaction.commandName) {
		case 'confess':
			await ConfessInteraction(interaction);
			return;
		case 'test':
			await TestInteraction(interaction);
			return;
	}
}