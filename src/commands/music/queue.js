const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the music queue'),

    async execute(interaction) {
        await handleQueue(interaction);
    },

    async run(message, args) {
        await handleQueue(message);
    }
};

async function handleQueue(context) {
    const isInteraction = !!context.isCommand;
    const player = context.client.poru.players.get(context.guildId);

    if (!player || player.queue.length === 0) {
        const msg = 'The queue is empty!';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    const queue = player.queue;
    const tracks = queue.slice(0, 10).map((track, i) => {
        return `${i + 1}. [${track.info.title}](${track.info.uri}) - \`Requested by: ${track.info.requester.tag}\``;
    }).join('\n');

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('🎶 Music Queue')
        .setDescription(`**Now Playing:** [${player.currentTrack.info.title}](${player.currentTrack.info.uri})\n\n${tracks}`)
        .setFooter({ text: `Total songs in queue: ${queue.length}` });

    if (queue.length > 10) {
        embed.addFields({ name: 'And more...', value: `...${queue.length - 10} more songs.` });
    }

    if (isInteraction) await context.reply({ embeds: [embed] });
    else await context.reply({ embeds: [embed] });
}
