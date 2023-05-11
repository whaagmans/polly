import { Client, CommandInteraction, Events, Interaction } from 'discord.js';
import { Commands } from '../Commands';

const interactionCreate = (client: Client): void => {
	client.on(Events.InteractionCreate, async (interaction: Interaction) => {
		if (interaction.isCommand() || interaction.isContextMenuCommand()) {
			await handleSlashCommand(interaction);
		}
	});
};

const handleSlashCommand = async (
	interaction: CommandInteraction
): Promise<void> => {
	const slashCommand = Commands.find(
		(command) => command.data.name === interaction.commandName
	);
	if (!slashCommand) {
		interaction.followUp({ content: 'an error has occurred', ephemeral: true });
		return;
	}

	slashCommand.run(interaction);
};

export default interactionCreate;
