const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get the avatar of a user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to get the avatar of')),

    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        await sendAvatar(interaction, user);
    },

    async run(message, args) {
        const user = message.mentions.users.first() || message.author;
        await sendAvatar(message, user);
    }
};

async function sendAvatar(context, user) {
    const isInteraction = !!context.isCommand;

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`${user.username}'s Avatar`)
        .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setFooter({ text: `Requested by ${isInteraction ? context.user.username : context.author.username}` });

    if (isInteraction) {
        await context.reply({ embeds: [embed] });
    } else {
        await context.reply({ embeds: [embed] });
    }
}
