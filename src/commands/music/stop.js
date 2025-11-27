const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop music and leave channel'),

    async execute(interaction) {
        await handleStop(interaction);
    },

    async run(message, args) {
        await handleStop(message);
    }
};

async function handleStop(context) {
    const isInteraction = !!context.isCommand;
    const player = context.client.poru.players.get(context.guildId);

    if (!player) {
        const msg = 'No music is playing!';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    player.destroy();

    const msg = '⏹️ Stopped the music and left the channel.';
    if (isInteraction) await context.reply(msg);
    else await context.reply(msg);
}
