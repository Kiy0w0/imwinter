const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a song from the queue')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('The position of the song to remove')
                .setRequired(true)),

    async execute(interaction) {
        const position = interaction.options.getInteger('position');
        await handleRemove(interaction, position);
    },

    async run(message, args) {
        const position = parseInt(args[0]);
        if (isNaN(position)) return message.reply('Please provide a valid number.');
        await handleRemove(message, position);
    }
};

async function handleRemove(context, position) {
    const isInteraction = !!context.isCommand;
    const player = context.client.poru.players.get(context.guildId);

    if (!player) {
        const msg = 'No music is playing!';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    if (player.queue.length === 0) {
        const msg = 'The queue is empty!';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    if (position < 1 || position > player.queue.length) {
        const msg = `Invalid position! Please choose between 1 and ${player.queue.length}.`;
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    const removed = player.queue[position - 1];
    player.queue.splice(position - 1, 1);

    const msg = `🗑️ Removed **${removed.info.title}** from the queue.`;
    if (isInteraction) await context.reply(msg);
    else await context.reply(msg);
}
