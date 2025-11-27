const { SlashCommandBuilder, EmbedBuilder, OAuth2Scopes, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the invite link for the bot'),

    async execute(interaction) {
        await handleInvite(interaction);
    },

    async run(message, args) {
        await handleInvite(message);
    }
};

async function handleInvite(context) {
    const isInteraction = !!context.isCommand;
    const client = context.client;

    // Generate invite link with Administrator permissions (for ease of use)
    // You can adjust permissions as needed.
    const inviteLink = client.generateInvite({
        scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
        permissions: [
            PermissionFlagsBits.Administrator
        ],
    });

    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('💌 Invite Me!')
        .setDescription('Click the link below to invite me to your server:')
        .addFields({ name: 'Invite Link', value: `[Click Here](${inviteLink})` })
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: 'Thank you for using our bot!' });

    if (isInteraction) {
        await context.reply({ embeds: [embed], ephemeral: true });
    } else {
        await context.reply({ embeds: [embed] });
    }
}
