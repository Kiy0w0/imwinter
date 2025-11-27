const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Check the weather for a specific location')
        .addStringOption(option =>
            option.setName('location')
                .setDescription('City or location name')
                .setRequired(true)),

    async execute(interaction) {
        const location = interaction.options.getString('location');
        await handleWeather(interaction, location);
    },

    async run(message, args) {
        if (args.length === 0) {
            return message.reply('Please provide a location.');
        }
        const location = args.join(' ');
        await handleWeather(message, location);
    }
};

async function handleWeather(context, location) {
    const isInteraction = !!context.isCommand;
    if (isInteraction) await context.deferReply();

    try {
        // Using wttr.in with JSON format
        const response = await axios.get(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
        const data = response.data;
        const current = data.current_condition[0];
        const area = data.nearest_area[0];

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle(`Weather in ${area.areaName[0].value}, ${area.country[0].value}`)
            .addFields(
                { name: 'Temperature', value: `${current.temp_C}°C / ${current.temp_F}°F`, inline: true },
                { name: 'Condition', value: current.weatherDesc[0].value, inline: true },
                { name: 'Humidity', value: `${current.humidity}%`, inline: true },
                { name: 'Wind', value: `${current.windspeedKmph} km/h`, inline: true },
                { name: 'Feels Like', value: `${current.FeelsLikeC}°C`, inline: true }
            )
            .setThumbnail(`https://wttr.in/${encodeURIComponent(location)}_0.png?m`) // wttr.in generates images too, but let's just use text or find an icon. 
            // Actually wttr doesn't provide easy icon URLs in JSON. We can skip thumbnail or use a static one based on condition if we want to be fancy.
            // Let's just use a generic weather icon or none.
            .setFooter({ text: 'Data provided by wttr.in' })
            .setTimestamp();

        if (isInteraction) await context.editReply({ embeds: [embed] });
        else await context.reply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        const msg = 'Could not fetch weather data. Please check the location name.';
        if (isInteraction) await context.editReply(msg);
        else await context.reply(msg);
    }
}
