const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear messages from the channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to clear (1-100)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        await handleClear(interaction, amount);
    },

    async run(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('You do not have permission to use this command.');
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount)) return message.reply('Please provide a valid number.');

        await handleClear(message, amount);
    }
};

async function handleClear(context, amount) {
    const isInteraction = !!context.isCommand;

    if (amount < 1 || amount > 100) {
        const msg = 'Please provide a number between 1 and 100.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    const channel = isInteraction ? context.channel : context.channel;

    try {
        const deleted = await channel.bulkDelete(amount, true);
        const msg = `🧹 Successfully cleared ${deleted.size} messages.`;

        if (isInteraction) {
            await context.reply({ content: msg, ephemeral: true });
        } else {
            const reply = await context.channel.send(msg);
            setTimeout(() => reply.delete().catch(() => { }), 3000);
        }
    } catch (error) {
        console.error(error);
        const msg = 'Failed to delete messages. They might be older than 14 days.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
    }
}
