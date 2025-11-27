const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song'),

    async execute(interaction) {
        await handlePause(interaction);
    },

    async run(message, args) {
        await handlePause(message);
    }
};

async function handlePause(context) {
    const isInteraction = !!context.isCommand;
    const player = context.client.poru.players.get(context.guildId);

    if (!player) {
        const msg = 'No music is playing!';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    if (player.isPaused) {
        const msg = 'Music is already paused. Use `/resume` to resume.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    player.pause(true);

    const msg = '⏸️ Music paused.';
    if (isInteraction) await context.reply(msg);
    else await context.reply(msg);
}
