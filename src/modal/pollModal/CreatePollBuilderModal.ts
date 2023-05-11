import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

const CreatePollBuilderModal = (title: string, totalRows: number) => {
	const modal = new ModalBuilder()
		.setCustomId('PollBuilderModals')
		.setTitle(title);

	const rows: ActionRowBuilder<TextInputBuilder>[] = [];

	for (let row = 1; row < totalRows + 1; row++) {
		const textInputRow = new TextInputBuilder()
			.setCustomId(`inputOption${row}`)
			.setLabel(`Option ${row}`)
			.setPlaceholder(`Write option ${row} here.`)
			.setStyle(TextInputStyle.Short)
			.setRequired(true);
		const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
			textInputRow
		);
		rows.push(actionRow);
	}

	return modal.addComponents(...rows);
};

export default CreatePollBuilderModal;
