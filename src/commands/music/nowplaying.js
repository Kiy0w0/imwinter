const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the currently playing song'),

    async execute(interaction) {
        await handleNowPlaying(interaction);
    },

    async run(message, args) {
        await handleNowPlaying(message);
    }
};

async function handleNowPlaying(context) {
    const isInteraction = !!context.isCommand;
    const player = context.client.poru.players.get(context.guildId);

    if (!player || !player.currentTrack) {
        const msg = 'No music is playing!';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    const track = player.currentTrack;
    const duration = track.info.length;
    const position = player.position; // Poru player has position property

    // Progress bar logic
    const totalBars = 20;
    const progress = Math.round((position / duration) * totalBars);
    const empty = totalBars - progress;
    const bar = '▬'.repeat(progress) + '🔴' + '▬'.repeat(empty);

    // Format time
    const formatTime = (ms) => {
        const m = Math.floor(ms / 60000);
        const s = ((ms % 60000) / 1000).toFixed(0);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const embed = new EmbedBuilder()
        .setTitle('🎶 Now Playing')
        .setDescription(`[${track.info.title}](${track.info.uri})\n\n\`[${bar}]\`\n\n\`${formatTime(position)} / ${formatTime(duration)}\``)
        .setColor(0x0099FF)
        .setThumbnail(track.info.artworkUrl || track.info.image || null) // Try to get artwork if available
        .setFooter({ text: `Requested by ${track.info.requester.tag}` });

    if (isInteraction) await context.reply({ embeds: [embed] });
    else await context.reply({ embeds: [embed] });
}
