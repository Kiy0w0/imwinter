const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kpop')
        .setDescription('K-Pop related commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search for K-Pop artists or songs on iTunes')
                .addStringOption(option =>
                    option.setName('query')
                        .setDescription('Artist or song name')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('news')
                .setDescription('Get the latest K-Pop news from Soompi')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'search') {
            const query = interaction.options.getString('query');
            await handleSearch(interaction, query);
        } else if (subcommand === 'news') {
            await handleNews(interaction);
        }
    },

    async run(message, args) {
        if (args.length === 0) {
            return message.reply('Please provide a subcommand: search <query> or news');
        }

        const subcommand = args[0].toLowerCase();

        if (subcommand === 'search') {
            const query = args.slice(1).join(' ');
            if (!query) return message.reply('Please provide a search query.');
            await handleSearch(message, query);
        } else if (subcommand === 'news') {
            await handleNews(message);
        } else {
            message.reply('Unknown subcommand. Use `search` or `news`.');
        }
    }
};

async function handleSearch(context, query) {
    const isInteraction = !!context.isCommand;
    if (isInteraction) await context.deferReply();

    try {
        // Search iTunes for K-Pop (filtering by term, but iTunes doesn't strictly enforce genre in search param easily without post-filtering)
        // We'll search and then try to filter or just show results.
        // Adding "kpop" to the query helps.
        const searchQuery = `${query} kpop`;
        const response = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=music&limit=5`);

        const results = response.data.results;

        if (results.length === 0) {
            const msg = 'No results found on iTunes.';
            if (isInteraction) await context.editReply(msg);
            else await context.reply(msg);
            return;
        }

        // Take the first result for the main embed, or list them?
        // Let's show the top result in detail.
        const topResult = results[0];

        const embed = new EmbedBuilder()
            .setColor(0xFF007F) // Hot Pink
            .setTitle(topResult.trackName || topResult.collectionName || topResult.artistName)
            .setURL(topResult.trackViewUrl || topResult.collectionViewUrl || topResult.artistViewUrl)
            .setThumbnail(topResult.artworkUrl100)
            .addFields(
                { name: 'Artist', value: topResult.artistName, inline: true },
                { name: 'Album', value: topResult.collectionName || 'N/A', inline: true },
                { name: 'Genre', value: topResult.primaryGenreName, inline: true },
                { name: 'Release Date', value: new Date(topResult.releaseDate).toDateString(), inline: true }
            )
            .setFooter({ text: 'Data provided by iTunes API' });

        if (isInteraction) await context.editReply({ embeds: [embed] });
        else await context.reply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        const msg = 'Error fetching data from iTunes.';
        if (isInteraction) await context.editReply(msg);
        else await context.reply(msg);
    }
}

async function handleNews(context) {
    const isInteraction = !!context.isCommand;
    if (isInteraction) await context.deferReply();

    try {
        const feed = await parser.parseURL('https://www.soompi.com/feed');

        // Get top 3 items
        const items = feed.items.slice(0, 3);

        if (items.length === 0) {
            const msg = 'No news found.';
            if (isInteraction) await context.editReply(msg);
            else await context.reply(msg);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0xFF007F)
            .setTitle('Latest K-Pop News (Soompi)')
            .setURL('https://www.soompi.com')
            .setTimestamp();

        items.forEach(item => {
            // Clean up snippet if needed, or just use title/link
            embed.addFields({
                name: item.title,
                value: `[Read more](${item.link})\n${item.pubDate.substring(0, 16)}`
            });
        });

        if (isInteraction) await context.editReply({ embeds: [embed] });
        else await context.reply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        const msg = 'Error fetching news.';
        if (isInteraction) await context.editReply(msg);
        else await context.reply(msg);
    }
}
