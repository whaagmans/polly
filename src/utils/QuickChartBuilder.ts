import {
	CommandInteraction,
	EmbedBuilder,
	GuildEmoji,
	Message,
	ModalSubmitInteraction,
	PartialMessage,
	ReactionEmoji,
} from 'discord.js';
import QuickChart from 'quickchart-js';
import { ChartInfo } from '../types/ChartInfo';

export function generateVibrantColor() {
	return Math.floor(Math.random() * 155) + 100;
}

export async function assignRandomColors(
	bars: number,
	opacity: number
): Promise<string[]> {
	return Array.from(
		{ length: bars },
		() =>
			`rgba(${generateVibrantColor()}, ${generateVibrantColor()}, ${generateVibrantColor()}, ${opacity})`
	);
}
export async function sendErrorMessage(
	interaction: CommandInteraction | ModalSubmitInteraction,
	errorInformation?: string
): Promise<void> {
	const content = `Something went wrong${
		errorInformation ?? ` with ${errorInformation}`
	}, please try again`;
	await interaction.reply({
		content,
		ephemeral: true,
	});
}

export async function updatePoll(
	chart: QuickChart,
	chartInfo: ChartInfo,
	message: Message<boolean> | PartialMessage
) {
	const chartEmbed = new EmbedBuilder()
		.setTitle(chartInfo.title)
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

	message.edit({ embeds: [chartEmbed] });
}

export async function createPoll(
	chart: QuickChart,
	pollName: string,
	labels: string[],
	data: number[],
	colors: string[]
): Promise<QuickChart> {
	console.log(data);
	return chart
		.setConfig({
			type: 'horizontalBar',
			data: {
				labels,
				datasets: [
					{
						label: pollName,
						data,
						backgroundColor: colors,
					},
				],
			},
			options: {
				legend: {
					display: false,
				},
				scales: {
					yAxes: [
						{
							ticks: {
								fontColor: 'white',
								fontSize: 26,
							},
						},
					],
					xAxes: [
						{
							ticks: {
								beginAtZero: true,
								fontColor: 'white',
							},
						},
					],
				},
			},
		})
		.setWidth(800)
		.setHeight(400)
		.setBackgroundColor('rgba(32,34,37,0.95)');
}

export async function getIndexOfEmojiArray(
	emojiArr: string[],
	emoji: GuildEmoji | ReactionEmoji
) {
	if (!emoji.name) return -1;
	return emojiArr.indexOf(emoji.name);
}
