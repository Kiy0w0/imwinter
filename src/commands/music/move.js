const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move a song in the queue')
        .addIntegerOption(option =>
            option.setName('from')
                .setDescription('Current position of the song')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('to')
                .setDescription('New position for the song')
                .setRequired(true)),

    async execute(interaction) {
        const from = interaction.options.getInteger('from');
        const to = interaction.options.getInteger('to');
        await handleMove(interaction, from, to);
    },

    async run(message, args) {
        const from = parseInt(args[0]);
        const to = parseInt(args[1]);
        if (isNaN(from) || isNaN(to)) return message.reply('Usage: !move <from> <to>');
        await handleMove(message, from, to);
    }
};

async function handleMove(context, from, to) {
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

    if (from < 1 || from > player.queue.length || to < 1 || to > player.queue.length) {
        const msg = `Invalid position! Please choose between 1 and ${player.queue.length}.`;
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    const track = player.queue[from - 1];
    player.queue.splice(from - 1, 1);
    player.queue.splice(to - 1, 0, track);

    const msg = `🚚 Moved **${track.info.title}** to position **${to}**.`;
    if (isInteraction) await context.reply(msg);
    else await context.reply(msg);
}
