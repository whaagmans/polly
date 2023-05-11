import {
	Collection,
	EmbedBuilder,
	MessageReaction,
	ModalSubmitInteraction,
	TextInputComponent,
	User,
} from 'discord.js';
import QuickChart from 'quickchart-js';
import { ChartInfo } from '../../types/ChartInfo';
import { handleStopCollectionReaction } from '../../utils/collectorFunctions';
import { getIndexesOfBiggestNumbersInArray } from '../../utils/helperFunctions';
import {
	assignRandomColors,
	createPoll,
	getIndexOfEmojiArray,
	sendErrorMessage,
	updatePoll,
} from '../../utils/QuickChartBuilder';

function getAllLabelsFromIndexes(indexes: number[], labels: string[]) {
	if (indexes.length === 0) return [];
	const winnerLabels: string[] = [];
	for (const index of indexes) {
		winnerLabels.push(labels[index]);
	}
	return winnerLabels;
}

function getAllModalFieldsAsString(
	fieldCollection: Collection<string, TextInputComponent>
): string[] {
	const modalData = Array.from(fieldCollection.values()).map(
		(data) => data.value
	);
	return modalData;
}

function createWinnerDescription(winningLabels: string[]) {
	if (winningLabels.length === 0) return 'There are no winners';
	let winners =
		winningLabels.length === 1 ? 'The winner is ' : 'The winners are ';
	for (let i = 0; i < winningLabels.length; i++) {
		if (i === 0) {
			winners += `**${winningLabels[i]}**`;
		} else if (i === winningLabels.length - 1) {
			winners += ` and **${winningLabels[i]}**`;
		} else {
			winners += `, **${winningLabels[i]}**`;
		}
	}
	return winners;
}

const PollBuilderResponse = async (
	interaction: ModalSubmitInteraction,
	pollName: string,
	userId: string
): Promise<void> => {
	const chart = new QuickChart();

	const emojiArr: string[] = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
	const stopEmoji = '❌';
	const labels: string[] = getAllModalFieldsAsString(interaction.fields.fields);

	const startData = new Array(labels.length).fill(0);

	const colors: string[] = await assignRandomColors(labels.length, 0.95);

	if (!pollName) {
		await sendErrorMessage(interaction);
		return;
	}

	const chartInfo = new ChartInfo(pollName, labels, startData, colors, userId);

	const chartEmbed = new EmbedBuilder()
		.setTitle(chartInfo.pollName)
		.setDescription(chartInfo.description)
		.addFields(chartInfo.fields)
		.setImage(
			(
				await createPoll(
					chart,
					chartInfo.pollName,
					chartInfo.chartLabels,
					chartInfo.data,
					chartInfo.colors
				)
			).getUrl()
		);

	const message = await interaction.reply({
		embeds: [chartEmbed],
		fetchReply: true,
	});

	// React with emotes based on the amount of labels in the array.
	for (let i = 0; i < labels.length; i++) {
		await message.react(emojiArr[i]);
	}
	await message.react(stopEmoji);

	const filter = (reaction: MessageReaction, user: User) =>
		user.id !== message.author.id;

	const collector = message.createReactionCollector({
		filter,
		dispose: true,
	});

	collector.on('collect', async (reaction: MessageReaction) => {
		if (!reaction.emoji.name) return;
		const emojiIndex = await getIndexOfEmojiArray(emojiArr, reaction.emoji);

		if (reaction.emoji.name === '❌') {
			await handleStopCollectionReaction(
				reaction,
				collector,
				chartInfo.createdByUser
			);
		}
		chartInfo.totalVotes++;
		chartInfo.description = `${chartInfo.totalVotes} votes`;

		if (emojiIndex >= 0) {
			chartInfo.data[emojiIndex]++;
			updatePoll(chart, chartInfo, reaction.message);
		}
	});

	collector.on('remove', async (reaction: MessageReaction) => {
		if (!reaction.emoji.name) return;
		const emojiIndex = await getIndexOfEmojiArray(emojiArr, reaction.emoji);
		if (emojiIndex >= 0) {
			chartInfo.totalVotes--;
			chartInfo.description = `${chartInfo.totalVotes} votes`;

			chartInfo.data[emojiIndex]--;
			updatePoll(chart, chartInfo, reaction.message);
		}
	});

	collector.on('end', (collected: Collection<string, MessageReaction>) => {
		let winnerIndexes = getIndexesOfBiggestNumbersInArray(chartInfo.data);
		// If 0 was the biggest number then there were no votes, set array empty for createWinnerDescription
		winnerIndexes = chartInfo.data[winnerIndexes[0]] > 0 ? winnerIndexes : [];
		const winningLabels: string[] = getAllLabelsFromIndexes(
			winnerIndexes,
			chartInfo.labels
		);

		const winnerDescription = createWinnerDescription(winningLabels);

		if (!winnerDescription) {
			sendErrorMessage(interaction, 'finding the winner or winners');
			return;
		}

		const votesDescription = `Poll results are based on ${
			collected.size - 1 //size minus the finish reaction
		} votes`;

		chartInfo.title = `Results of ${pollName}`;
		chartInfo.description = `${winnerDescription} \n ${votesDescription}`;

		const reaction = collected.find((item) => item.message != null);
		if (!reaction) return;

		updatePoll(chart, chartInfo, reaction.message);
	});
};

export default PollBuilderResponse;
