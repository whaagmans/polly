import { ModalSubmitInteraction } from 'discord.js';

export interface Modal {
	name: string;
	run: (interaction: ModalSubmitInteraction) => Promise<void>;
}
