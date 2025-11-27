const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Manage your user profile')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View your profile')
                .addUserOption(option => option.setName('target').setDescription('The user to view')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setbio')
                .setDescription('Set your profile bio')
                .addStringOption(option => option.setName('bio').setDescription('Your new bio').setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'view') {
            const target = interaction.options.getUser('target') || interaction.user;
            await handleViewProfile(interaction, target);
        } else if (subcommand === 'setbio') {
            const bio = interaction.options.getString('bio');
            await handleSetBio(interaction, bio);
        }
    },

    async run(message, args) {
        if (args.length === 0 || args[0] === 'view') {
            const target = message.mentions.users.first() || message.author;
            await handleViewProfile(message, target);
        } else if (args[0] === 'setbio') {
            const bio = args.slice(1).join(' ');
            if (!bio) return message.reply('Please provide a bio.');
            await handleSetBio(message, bio);
        } else {
            message.reply('Usage: !profile [view|setbio] [args]');
        }
    }
};

async function handleViewProfile(context, targetUser) {
    const isInteraction = !!context.isCommand;
    if (isInteraction) await context.deferReply();

    try {
        const [user, created] = await User.findOrCreate({
            where: { userId: targetUser.id },
            defaults: { username: targetUser.username }
        });

        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle(`${targetUser.username}'s Profile`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: 'Bio', value: user.bio },
                { name: 'Balance', value: `$${user.balance}`, inline: true },
                { name: 'XP', value: `${user.xp}`, inline: true }
            )
            .setFooter({ text: 'Profile System via SQLite' });

        if (isInteraction) await context.editReply({ embeds: [embed] });
        else await context.reply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        const msg = 'Error fetching profile.';
        if (isInteraction) await context.editReply(msg);
        else await context.reply(msg);
    }
}

async function handleSetBio(context, newBio) {
    const isInteraction = !!context.isCommand;
    const userObj = isInteraction ? context.user : context.author;

    if (isInteraction) await context.deferReply({ ephemeral: true });

    try {
        const [user, created] = await User.findOrCreate({
            where: { userId: userObj.id },
            defaults: { username: userObj.username }
        });

        user.bio = newBio;
        await user.save();

        const msg = 'Bio updated successfully!';
        if (isInteraction) await context.editReply(msg);
        else await context.reply(msg);

    } catch (error) {
        console.error(error);
        const msg = 'Error updating bio.';
        if (isInteraction) await context.editReply(msg);
        else await context.reply(msg);
    }
}
