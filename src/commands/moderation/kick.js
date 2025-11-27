const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        await handleKick(interaction, target, reason);
    },

    async run(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return message.reply('You do not have permission to use this command.');
        }

        const target = message.mentions.users.first();
        if (!target) return message.reply('Please mention a user to kick.');

        const reason = args.slice(1).join(' ') || 'No reason provided';
        await handleKick(message, target, reason);
    }
};

async function handleKick(context, targetUser, reason) {
    const isInteraction = !!context.isCommand;
    const guild = context.guild;
    const member = await guild.members.fetch(targetUser.id).catch(() => null);

    if (!member) {
        const msg = 'User not found in this server.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    if (!member.kickable) {
        const msg = 'I cannot kick this user. They might have a higher role than me.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    try {
        await member.kick(reason);
        const msg = `👢 **${targetUser.tag}** has been kicked.\nReason: ${reason}`;
        if (isInteraction) await context.reply(msg);
        else await context.reply(msg);
    } catch (error) {
        console.error(error);
        const msg = 'Failed to kick the user.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
    }
}
