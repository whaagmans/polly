import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import CreatePollBuilderModal from '../modal/pollModal/CreatePollBuilderModal';
import PollBuilderResponse from '../modal/pollModal/PollBuilderResponse';
import { Command } from '../types/Command';
import { sendErrorMessage } from '../utils/QuickChartBuilder';

const Poll: Command = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('creates a poll')
		.addStringOption((option) =>
			option
				.setName('poll_name')
				.setDescription('Name of your poll')
				.setMaxLength(45)
				.setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName('poll_options_amount')
				.setDescription('How many options does your poll have?')
				.setMinValue(2)
				.setMaxValue(5)
				.setRequired(true)
		),
	run: async (interaction: CommandInteraction) => {
		if (!interaction.isChatInputCommand()) return;

		const rowAmount = interaction.options.getInteger('poll_options_amount');

		if (!rowAmount) {
			await sendErrorMessage(interaction);
			return;
		}
		const pollName = interaction.options.getString('poll_name');

		if (!pollName) {
			await sendErrorMessage(interaction);
			return;
		}

		const modal = CreatePollBuilderModal(pollName, +rowAmount);

		interaction.showModal(modal);

		const modalSubmitted = await interaction
			.awaitModalSubmit({
				time: 120000,
				filter: (i) => i.user.id === interaction.user.id,
			})
			.catch((err) => {
				console.error(err);
				return null;
			});

		if (modalSubmitted) {
			await PollBuilderResponse(modalSubmitted, pollName, interaction.user.id);
		}
	},
};

export default Poll;
