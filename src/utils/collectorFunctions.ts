import { MessageReaction, ReactionCollector } from 'discord.js';

export async function handleStopCollectionReaction(
	reaction: MessageReaction,
	collector: ReactionCollector,
	userId: string
) {
	const users = await reaction.users.fetch();
	const user = users.filter((u) => !u.bot).first();
	if (!user || user.id !== userId) {
		await reaction.users.remove(user);
	} else {
		collector.stop();
	}
}
