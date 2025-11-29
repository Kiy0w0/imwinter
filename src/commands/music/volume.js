const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Set the music volume')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (0-100)')
                .setRequired(true)),

    async execute(interaction) {
        const level = interaction.options.getInteger('level');
        await handleVolume(interaction, level);
    },

    async run(message, args) {
        const level = parseInt(args[0]);
        if (isNaN(level)) return message.reply('Please provide a valid number (0-100).');
        await handleVolume(message, level);
    },
};

async function handleVolume(context, level) {
    const isInteraction = !!context.isCommand;
    const player = context.client.poru.players.get(context.guildId);

    if (!player) {
        const msg = 'No music is playing!';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    if (level < 0 || level > 100) {
        const msg = 'Please choose a volume between 0 and 100.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    player.setVolume(level);

    const msg = `🔊 Volume set to **${level}%**.`;
    if (isInteraction) await context.reply(msg);
    else await context.reply(msg);
}
