const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Display information about the bot'),

    async execute(interaction) {
        await handleBotInfo(interaction);
    },

    async run(message, args) {
        await handleBotInfo(message);
    }
};

async function handleBotInfo(context) {
    const isInteraction = !!context.isCommand;
    const client = context.client;

    // Calculate Uptime
    const totalSeconds = (client.uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = Math.floor(totalSeconds % 60);
    const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    // Calculate total members (approx)
    const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('🤖 Bot Information')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
            { name: 'Name', value: client.user.tag, inline: true },
            { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
            { name: 'Total Members', value: `${totalMembers}`, inline: true },
            { name: 'Uptime', value: uptime, inline: true },
            { name: 'Node.js', value: process.version, inline: true },
            { name: 'Discord.js', value: `v${djsVersion}`, inline: true },
            { name: 'Memory Usage', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
            { name: 'Ping', value: `${client.ws.ping}ms`, inline: true }
        )
        .setFooter({ text: 'System Status' })
        .setTimestamp();

    if (isInteraction) {
        await context.reply({ embeds: [embed] });
    } else {
        await context.reply({ embeds: [embed] });
    }
}
