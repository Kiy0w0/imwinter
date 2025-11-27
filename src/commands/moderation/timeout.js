const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration (e.g. 1m, 1h, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for timeout'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        await handleTimeout(interaction, target, duration, reason);
    },

    async run(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('You do not have permission to use this command.');
        }

        const target = message.mentions.users.first();
        if (!target) return message.reply('Please mention a user to timeout.');

        const duration = args[1];
        if (!duration) return message.reply('Please provide a duration (e.g. 1m, 1h).');

        const reason = args.slice(2).join(' ') || 'No reason provided';
        await handleTimeout(message, target, duration, reason);
    }
};

async function handleTimeout(context, targetUser, durationStr, reason) {
    const isInteraction = !!context.isCommand;
    const guild = context.guild;
    const member = await guild.members.fetch(targetUser.id).catch(() => null);

    if (!member) {
        const msg = 'User not found in this server.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    if (!member.moderatable) {
        const msg = 'I cannot timeout this user. They might have a higher role than me.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    const durationMs = ms(durationStr);
    if (!durationMs || durationMs > 28 * 24 * 60 * 60 * 1000) { // Max 28 days
        const msg = 'Invalid duration. Max duration is 28 days.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    try {
        await member.timeout(durationMs, reason);
        const msg = `🤐 **${targetUser.tag}** has been timed out for **${durationStr}**.\nReason: ${reason}`;
        if (isInteraction) await context.reply(msg);
        else await context.reply(msg);
    } catch (error) {
        console.error(error);
        const msg = 'Failed to timeout the user.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
    }
}
