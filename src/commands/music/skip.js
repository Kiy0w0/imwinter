const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),

    async execute(interaction) {
        await handleSkip(interaction);
    },

    async run(message, args) {
        await handleSkip(message);
    }
};

async function handleSkip(context) {
    const isInteraction = !!context.isCommand;
    const player = context.client.poru.players.get(context.guildId);

    if (!player) {
        const msg = 'No music is playing!';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    player.skip(); // Stopping the current track automatically plays the next one in queue

    const msg = '⏭️ Skipped!';
    if (isInteraction) await context.reply(msg);
    else await context.reply(msg);
}
