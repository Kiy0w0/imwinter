const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Warning = require('../../database/models/Warning');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Manage user warnings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Warn a user')
                .addUserOption(option => option.setName('target').setDescription('User to warn').setRequired(true))
                .addStringOption(option => option.setName('reason').setDescription('Reason for warning').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List warnings for a user')
                .addUserOption(option => option.setName('target').setDescription('User to check').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getUser('target');

        if (subcommand === 'add') {
            const reason = interaction.options.getString('reason');
            await handleAddWarn(interaction, target, reason);
        } else if (subcommand === 'list') {
            await handleListWarns(interaction, target);
        }
    },

    async run(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('You do not have permission to use this command.');
        }

        const subcommand = args[0];
        const target = message.mentions.users.first();

        if (!target) return message.reply('Please mention a user.');

        if (subcommand === 'add') {
            const reason = args.slice(2).join(' ');
            if (!reason) return message.reply('Please provide a reason.');
            await handleAddWarn(message, target, reason);
        } else if (subcommand === 'list') {
            await handleListWarns(message, target);
        } else {
            message.reply('Usage: !warn add <user> <reason> OR !warn list <user>');
        }
    }
};

async function handleAddWarn(context, targetUser, reason) {
    const isInteraction = !!context.isCommand;
    const guildId = context.guildId;
    const moderatorId = isInteraction ? context.user.id : context.author.id;

    try {
        await Warning.create({
            userId: targetUser.id,
            guildId: guildId,
            moderatorId: moderatorId,
            reason: reason
        });

        const msg = `⚠️ **${targetUser.tag}** has been warned.\nReason: ${reason}`;

        // Try to DM the user
        try {
            await targetUser.send(`You have been warned in **${context.guild.name}**.\nReason: ${reason}`);
        } catch (e) {
            // Ignore if DM fails
        }

        if (isInteraction) await context.reply(msg);
        else await context.reply(msg);

    } catch (error) {
        console.error(error);
        const msg = 'Failed to add warning to database.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
    }
}

async function handleListWarns(context, targetUser) {
    const isInteraction = !!context.isCommand;
    const guildId = context.guildId;

    try {
        const warnings = await Warning.findAll({
            where: { userId: targetUser.id, guildId: guildId }
        });

        if (warnings.length === 0) {
            const msg = `**${targetUser.tag}** has no warnings.`;
            if (isInteraction) await context.reply(msg);
            else await context.reply(msg);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle(`Warnings for ${targetUser.tag}`)
            .setFooter({ text: `Total Warnings: ${warnings.length}` });

        warnings.forEach((warn, index) => {
            embed.addFields({
                name: `Warning #${index + 1} - <t:${Math.floor(warn.timestamp.getTime() / 1000)}:d>`,
                value: `**Reason:** ${warn.reason}\n**Mod:** <@${warn.moderatorId}>`
            });
        });

        if (isInteraction) await context.reply({ embeds: [embed] });
        else await context.reply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        const msg = 'Failed to fetch warnings.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
    }
}
