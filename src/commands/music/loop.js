const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set loop mode')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'NONE' },
                    { name: 'Track', value: 'TRACK' },
                    { name: 'Queue', value: 'QUEUE' }
                )),

    async execute(interaction) {
        const mode = interaction.options.getString('mode');
        await handleLoop(interaction, mode);
    },

    async run(message, args) {
        const mode = args[0]?.toUpperCase();
        if (!['NONE', 'TRACK', 'QUEUE', 'OFF'].includes(mode)) {
            return message.reply('Usage: !loop <off|track|queue>');
        }
        // Handle 'OFF' alias for prefix command
        const actualMode = mode === 'OFF' ? 'NONE' : mode;
        await handleLoop(message, actualMode);
    },
};

async function handleLoop(context, mode) {
    const isInteraction = !!context.isCommand;
    const player = context.client.poru.players.get(context.guildId);

    if (!player) {
        const msg = 'No music is playing!';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    player.setLoop(mode);

    let modeText = 'Off';
    if (mode === 'TRACK') modeText = 'Track';
    if (mode === 'QUEUE') modeText = 'Queue';

    const msg = `🔁 Loop mode set to: **${modeText}**`;
    if (isInteraction) await context.reply(msg);
    else await context.reply(msg);
}
