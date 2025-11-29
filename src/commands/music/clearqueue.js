const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearqueue')
        .setDescription('Clear the music queue'),

    async execute(interaction) {
        await handleClearQueue(interaction);
    },

    async run(message, args) {
        await handleClearQueue(message);
    }
};

async function handleClearQueue(context) {
    const isInteraction = !!context.isCommand;
    const player = context.client.poru.players.get(context.guildId);

    if (!player) {
        const msg = 'No music is playing!';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    if (player.queue.length === 0) {
        const msg = 'The queue is already empty!';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    player.queue.length = 0;

    const msg = '🗑️ Queue cleared!';
    if (isInteraction) await context.reply(msg);
    else await context.reply(msg);
}
