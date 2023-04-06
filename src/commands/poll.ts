import { Command } from '@/types/Command';
import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import QuickChart from 'quickchart-js';

const Poll: Command = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('creates a poll'),
	run: async (interaction: CommandInteraction) => {
		const chart = new QuickChart();
		chart
			.setConfig({
				type: 'bar',
				data: {
					labels: ['Hello world', 'Foo bar'],
					datasets: [{ label: 'Foo', data: [1, 2] }],
				},
			})
			.setWidth(800)
			.setHeight(400);

		const chartEmbed = new EmbedBuilder()
			.setTitle('Latest Chart')
			.setDescription(`Here's a chart that I generated`)
			.setImage(chart.getUrl());

		await interaction.reply({
			embeds: [chartEmbed],
		});
	},
};

export default Poll;
