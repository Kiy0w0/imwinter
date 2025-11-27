const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        await handleBan(interaction, target, reason);
    },

    async run(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('You do not have permission to use this command.');
        }

        const target = message.mentions.users.first();
        if (!target) return message.reply('Please mention a user to ban.');

        const reason = args.slice(1).join(' ') || 'No reason provided';
        await handleBan(message, target, reason);
    }
};

async function handleBan(context, targetUser, reason) {
    const isInteraction = !!context.isCommand;
    const guild = context.guild;
    const member = await guild.members.fetch(targetUser.id).catch(() => null);

    if (member && !member.bannable) {
        const msg = 'I cannot ban this user. They might have a higher role than me.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    try {
        await guild.members.ban(targetUser, { reason });
        const msg = `🔨 **${targetUser.tag}** has been banned.\nReason: ${reason}`;
        if (isInteraction) await context.reply(msg);
        else await context.reply(msg);
    } catch (error) {
        console.error(error);
        const msg = 'Failed to ban the user.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
    }
}
