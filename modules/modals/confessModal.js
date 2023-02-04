const { ActionRowBuilder, ButtonStyle, ButtonBuilder, codeBlock } = require('discord.js');

exports.HandleConfessModal = async (interaction, client) => {
	interaction.reply({ content: 'Thankyou for your confession it will be anonymously posted shortly...', ephemeral: true });
	const approvalChannel = client.channels.cache.find(channel => channel.id === process.env.CONFESSION_APPROVAL_CHANNEL_ID);
	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('approveConfession')
				.setLabel('Approve')
				.setStyle(ButtonStyle.Success),
		).addComponents(
			new ButtonBuilder()
				.setCustomId('declineConfession')
				.setLabel('Decline')
				.setStyle(ButtonStyle.Danger),
		);
	if(approvalChannel) {
		const msg = await approvalChannel.send(codeBlock(`Confession: ${interaction.fields.fields.first().value}`));
		msg.edit({ components: [row] });
	}
}