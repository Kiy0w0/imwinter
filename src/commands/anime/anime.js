const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Anime related commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search for an anime')
                .addStringOption(option =>
                    option.setName('query')
                        .setDescription('The anime to search for')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('random')
                .setDescription('Get a random anime recommendation')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'search') {
            const query = interaction.options.getString('query');
            await handleSearch(interaction, query);
        } else if (subcommand === 'random') {
            await handleRandom(interaction);
        }
    },

    async run(message, args) {
        if (args.length === 0) {
            return message.reply('Please provide a subcommand: search <query> or random');
        }

        const subcommand = args[0].toLowerCase();

        if (subcommand === 'search') {
            const query = args.slice(1).join(' ');
            if (!query) return message.reply('Please provide a search query.');
            await handleSearch(message, query);
        } else if (subcommand === 'random') {
            await handleRandom(message);
        } else {
            // Default to search if only one arg that isn't random?
            // Or just tell them.
            message.reply('Unknown subcommand. Use `search` or `random`.');
        }
    }
};

async function handleSearch(context, query) {
    // context can be interaction or message
    // We need to handle reply accordingly
    const isInteraction = !!context.isCommand;

    if (isInteraction) await context.deferReply();
    // For message, we can send a "typing" indicator or just wait.

    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
        const data = response.data.data[0];

        if (!data) {
            const msg = 'No anime found for that query.';
            if (isInteraction) await context.editReply(msg);
            else await context.reply(msg);
            return;
        }

        const embed = createAnimeEmbed(data);

        if (isInteraction) await context.editReply({ embeds: [embed] });
        else await context.reply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        const msg = 'Error fetching data from Jikan API.';
        if (isInteraction) await context.editReply(msg);
        else await context.reply(msg);
    }
}

async function handleRandom(context) {
    const isInteraction = !!context.isCommand;
    if (isInteraction) await context.deferReply();

    try {
        const response = await axios.get('https://api.jikan.moe/v4/random/anime');
        const data = response.data.data;

        const embed = createAnimeEmbed(data);

        if (isInteraction) await context.editReply({ embeds: [embed] });
        else await context.reply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        const msg = 'Error fetching data from Jikan API.';
        if (isInteraction) await context.editReply(msg);
        else await context.reply(msg);
    }
}

function createAnimeEmbed(anime) {
    const embed = new EmbedBuilder()
        .setTitle(anime.title)
        .setURL(anime.url)
        .setDescription(anime.synopsis ? (anime.synopsis.length > 400 ? anime.synopsis.substring(0, 397) + '...' : anime.synopsis) : 'No synopsis available.')
        .setColor(0xFF0055)
        .setImage(anime.images.jpg.large_image_url)
        .addFields(
            { name: 'Score', value: anime.score ? anime.score.toString() : 'N/A', inline: true },
            { name: 'Episodes', value: anime.episodes ? anime.episodes.toString() : '?', inline: true },
            { name: 'Type', value: anime.type || 'Unknown', inline: true },
            { name: 'Status', value: anime.status || 'Unknown', inline: true },
            { name: 'Rating', value: anime.rating || 'None', inline: true }
        )
        .setFooter({ text: 'Data provided by Jikan API' });

    return embed;
}
