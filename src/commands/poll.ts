import { Command } from '@/types/Command';
import {
	Collection,
	CommandInteraction,
	EmbedBuilder,
	GuildEmoji,
	Message,
	MessageReaction,
	PartialMessage,
	ReactionEmoji,
	SlashCommandBuilder,
	User,
} from 'discord.js';
import QuickChart from 'quickchart-js';

function generateVibrantColor() {
	return Math.floor(Math.random() * 155) + 100;
}

async function assignRandomColors(
	bars: number,
	opacity: number
): Promise<string[]> {
	return Array.from(
		{ length: bars },
		() =>
			`rgba(${generateVibrantColor()}, ${generateVibrantColor()}, ${generateVibrantColor()}, ${opacity})`
	);
}

async function updatePoll(
	chart: QuickChart,
	pollName: string,
	labels: string[],
	data: number[],
	message: Message<boolean> | PartialMessage,
	colors: string[],
	title = 'Latest Chart',
	description = `Here's a chart that was generated for the poll`
) {
	const chartEmbed = new EmbedBuilder()
		.setTitle(title)
		.setDescription(description)
		.setImage(
			(await createPoll(chart, pollName, labels, data, colors)).getUrl()
		);

	message.edit({ embeds: [chartEmbed] });
}

async function createPoll(
	chart: QuickChart,
	pollName: string,
	labels: string[],
	data: number[],
	colors: string[]
): Promise<QuickChart> {
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
		})
		.setWidth(800)
		.setHeight(400)
		.setBackgroundColor('rgba(32,34,37,0.95)');
}

async function getIndexOfEmojiArray(
	emojiArr: string[],
	emoji: GuildEmoji | ReactionEmoji
) {
	if (!emoji.name) return -1;
	return emojiArr.indexOf(emoji.name);
}

const Poll: Command = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('creates a poll')
		.addStringOption((option) =>
			option
				.setName('poll_name')
				.setDescription('Name of your poll')
				.setRequired(true)
		),
	run: async (interaction: CommandInteraction) => {
		if (!interaction.isChatInputCommand()) return;
		const chart = new QuickChart();

		const emojiArr: string[] = ['1️⃣', '2️⃣', '3️⃣', '❌'];

		const labels = ['option 1', 'option 2', 'option 3'];
		const data = [0, 0, 0];
		const colors: string[] = await assignRandomColors(data.length, 0.95);

		const pollName = interaction.options.getString('poll_name');
		if (!pollName) {
			await interaction.reply({
				content: 'Something went wrong, no poll name received',
				ephemeral: true,
			});
			return;
		}

		const chartEmbed = new EmbedBuilder()
			.setTitle('Latest Chart')
			.setDescription(`Here's a chart that I generated`)
			.setImage(
				(await createPoll(chart, pollName, labels, data, colors)).getUrl()
			);

		const message = await interaction.reply({
			embeds: [chartEmbed],
			fetchReply: true,
		});
		for (const emoji of emojiArr) {
			message.react(emoji);
		}

		const filter = (reaction: MessageReaction, user: User) =>
			user.id !== message.author.id;

		const collector = message.createReactionCollector({
			filter,
			dispose: true,
		});

		collector.on('collect', async (reaction: MessageReaction) => {
			if (!reaction.emoji.name) return;
			const emojiIndex = await getIndexOfEmojiArray(emojiArr, reaction.emoji);

			if (emojiIndex === emojiArr.length - 1) {
				collector.stop();
			}

			if (emojiIndex >= 0) {
				data[emojiIndex]++;
				updatePoll(chart, pollName, labels, data, reaction.message, colors);
			}
		});

		collector.on('remove', async (reaction: MessageReaction) => {
			if (!reaction.emoji.name) return;
			const emojiIndex = await getIndexOfEmojiArray(emojiArr, reaction.emoji);
			if (emojiIndex >= 0) {
				data[emojiIndex]--;
				updatePoll(chart, pollName, labels, data, reaction.message, colors);
			}
		});

		collector.on('end', (collected: Collection<string, MessageReaction>) => {
			const title = `Results of ${pollName}`;
			const description = `Poll results are based on ${
				collected.size - 1 //size minus the finish reaction
			} votes`;

			const reaction = collected.find((item) => item.message != null);
			if (!reaction) return;

			console.log(`Collected ${collected.size} reactions`);
			updatePoll(
				chart,
				pollName,
				labels,
				data,
				reaction.message,
				colors,
				title,
				description
			);
		});
	},
};

export default Poll;
