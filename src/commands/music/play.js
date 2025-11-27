const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song using Lavalink')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name or URL')
                .setRequired(true)),

    async execute(interaction) {
        const query = interaction.options.getString('query');
        await handlePlay(interaction, query);
    },

    async run(message, args) {
        if (args.length === 0) return message.reply('Please provide a song name or URL.');
        const query = args.join(' ');
        await handlePlay(message, query);
    }
};

async function handlePlay(context, query) {
    const isInteraction = !!context.isCommand;
    const member = isInteraction ? context.member : context.member;

    if (!member.voice.channelId) {
        const msg = 'You must be in a voice channel to play music!';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    // Connect to voice channel
    const player = context.client.poru.createConnection({
        guildId: context.guildId,
        voiceChannel: member.voice.channelId,
        textChannel: context.channelId,
        deaf: true,
    });

    if (isInteraction) await context.deferReply();

    const res = await context.client.poru.resolve({ query: query, source: 'ytsearch' });

    if (res.loadType === 'LOAD_FAILED') {
        const msg = 'Failed to load track.';
        if (isInteraction) await context.editReply(msg);
        else await context.reply(msg);
        return;
    }

    if (res.loadType === 'NO_MATCHES') {
        const msg = 'No matches found!';
        if (isInteraction) await context.editReply(msg);
        else await context.reply(msg);
        return;
    }

    if (res.loadType === 'PLAYLIST_LOADED') {
        for (const track of res.tracks) {
            track.info.requester = isInteraction ? context.user : context.author;
            player.queue.add(track);
        }
        const msg = `Added playlist **${res.playlistInfo.name}** with ${res.tracks.length} tracks.`;
        if (isInteraction) await context.editReply(msg);
        else await context.reply(msg);
    } else {
        const track = res.tracks[0];
        track.info.requester = isInteraction ? context.user : context.author;
        player.queue.add(track);

        const msg = `Added to queue: **${track.info.title}**`;
        if (isInteraction) await context.editReply(msg);
        else await context.reply(msg);
    }

    if (!player.isPlaying && !player.isPaused) player.play();
}
