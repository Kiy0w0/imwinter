const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show a list of all available commands'),

    async execute(interaction) {
        await sendHelpMenu(interaction);
    },

    async run(message, args) {
        await sendHelpMenu(message);
    }
};

async function sendHelpMenu(context) {
    const isInteraction = !!context.isCommand;
    const client = context.client;

    const embed = new EmbedBuilder()
        .setColor(0xFFB6C1) // Pastel Pink
        .setTitle('✨ Help Center')
        .setDescription(`Hello **${isInteraction ? context.user.username : context.author.username}**! 👋\nI am **${client.user.username}**, your personal assistant.\n\nSelect a category below to see available commands.`)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 512 }))
        .setImage('https://i.pinimg.com/736x/1f/43/f8/1f43f84a49783b7c21440730bd54852e.jpg') // Optional aesthetic banner
        .addFields(
            { name: '🔗 Links', value: '[Invite Me](https://discord.com/oauth2/authorize?client_id=' + client.user.id + '&permissions=8&scope=bot%20applications.commands) • [Support Server](https://discord.gg/)', inline: true }
        )
        .setFooter({ text: 'Made with 💖 by imwinter', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_category')
                .setPlaceholder('🌸 Choose a category...')
                .addOptions([
                    {
                        label: 'Home',
                        description: 'Back to the main menu',
                        value: 'home',
                        emoji: '🏠',
                    },
                    {
                        label: 'General',
                        description: 'Profile, Bot Info, Invite',
                        value: 'general',
                        emoji: '📜',
                    },
                    {
                        label: 'Music',
                        description: 'Play, Skip, Queue, Stop',
                        value: 'music',
                        emoji: '🎵',
                    },
                    {
                        label: 'Anime',
                        description: 'Search Anime, Random Anime',
                        value: 'anime',
                        emoji: '🌸',
                    },
                    {
                        label: 'K-Pop',
                        description: 'K-Pop Search, News',
                        value: 'kpop',
                        emoji: '🫰',
                    },
                    {
                        label: 'Moderation',
                        description: 'Kick, Ban, Warn, Clear',
                        value: 'moderation',
                        emoji: '🛡️',
                    },
                    {
                        label: 'Utility',
                        description: 'Weather, Poll, Remind, Avatar',
                        value: 'utility',
                        emoji: '🛠️',
                    },
                ]),
        );

    let reply;
    if (isInteraction) {
        reply = await context.reply({ embeds: [embed], components: [row], fetchReply: true });
    } else {
        reply = await context.reply({ embeds: [embed], components: [row] });
    }

    const filter = i => i.customId === 'help_category' && i.user.id === (isInteraction ? context.user.id : context.author.id);
    const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        const value = i.values[0];
        let newEmbed = new EmbedBuilder()
            .setColor(0xFFB6C1)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'Made with 💖 by imwinter', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        if (value === 'home') {
            newEmbed = embed;
        } else if (value === 'general') {
            newEmbed.setTitle('📜 General Commands')
                .setDescription('Basic commands for the bot.')
                .addFields(
                    { name: '`/help`', value: 'Show this menu', inline: true },
                    { name: '`/botinfo`', value: 'View bot statistics', inline: true },
                    { name: '`/invite`', value: 'Get bot invite link', inline: true },
                    { name: '`/profile`', value: 'View or edit user profile', inline: true },
                );
        } else if (value === 'music') {
            newEmbed.setTitle('🎵 Music Commands')
                .setDescription('Listen to high-quality music with Lavalink.')
                .addFields(
                    { name: '`/play <query>`', value: 'Play a song from YouTube/Spotify', inline: true },
                    { name: '`/stop`', value: 'Stop music & leave channel', inline: true },
                    { name: '`/skip`', value: 'Skip the current song', inline: true },
                    { name: '`/queue`', value: 'Show the music queue', inline: true },
                    { name: '`/loop <mode>`', value: 'Loop track/queue/off', inline: true },
                    { name: '`/pause`', value: 'Pause music', inline: true },
                    { name: '`/resume`', value: 'Resume music', inline: true },
                );
        } else if (value === 'anime') {
            newEmbed.setTitle('🌸 Anime Commands')
                .setDescription('Weeb stuff powered by Jikan API.')
                .addFields(
                    { name: '`/anime search <query>`', value: 'Search for an anime', inline: true },
                    { name: '`/anime random`', value: 'Get a random anime recommendation', inline: true },
                );
        } else if (value === 'kpop') {
            newEmbed.setTitle('🫰 K-Pop Commands')
                .setDescription('Stan your favorites!')
                .addFields(
                    { name: '`/kpop search <query>`', value: 'Search K-Pop songs/artists', inline: true },
                    { name: '`/kpop news`', value: 'Latest K-Pop news from Soompi', inline: true },
                );
        } else if (value === 'moderation') {
            newEmbed.setTitle('🛡️ Moderation Commands')
                .setDescription('Keep the server safe.')
                .addFields(
                    { name: '`/kick <user>`', value: 'Kick a member', inline: true },
                    { name: '`/ban <user>`', value: 'Ban a member', inline: true },
                    { name: '`/timeout <user> <time>`', value: 'Timeout a member', inline: true },
                    { name: '`/clear <amount>`', value: 'Delete messages', inline: true },
                    { name: '`/warn add <user>`', value: 'Warn a user', inline: true },
                    { name: '`/warn list <user>`', value: 'Check user warnings', inline: true },
                );
        } else if (value === 'utility') {
            newEmbed.setTitle('🛠️ Utility Commands')
                .setDescription('Useful tools for daily usage.')
                .addFields(
                    { name: '`/weather <city>`', value: 'Check weather forecast', inline: true },
                    { name: '`/poll <q> <opts>`', value: 'Create a voting poll', inline: true },
                    { name: '`/remind <time> <msg>`', value: 'Set a reminder', inline: true },
                    { name: '`/avatar [user]`', value: 'View user avatar', inline: true },
                );
        }

        await i.update({ embeds: [newEmbed], components: [row] });
    });

    collector.on('end', () => {
        const disabledRow = new ActionRowBuilder()
            .addComponents(
                row.components[0].setDisabled(true)
            );
        if (isInteraction) context.editReply({ components: [disabledRow] }).catch(() => { });
        else reply.edit({ components: [disabledRow] }).catch(() => { });
    });
}
