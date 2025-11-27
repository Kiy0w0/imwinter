const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused song'),

    async execute(interaction) {
        await handleResume(interaction);
    },

    async run(message, args) {
        await handleResume(message);
    }
};

async function handleResume(context) {
    const isInteraction = !!context.isCommand;
    const player = context.client.poru.players.get(context.guildId);

    if (!player) {
        const msg = 'No music is playing!';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    if (!player.isPaused) {
        const msg = 'Music is not paused.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    player.pause(false);

    const msg = '▶️ Music resumed.';
    if (isInteraction) await context.reply(msg);
    else await context.reply(msg);
}
