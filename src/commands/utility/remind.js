const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Set a reminder')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time until reminder (e.g. 10m, 1h)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to remind you about')
                .setRequired(true)),

    async execute(interaction) {
        const time = interaction.options.getString('time');
        const message = interaction.options.getString('message');
        await handleRemind(interaction, time, message);
    },

    async run(message, args) {
        if (args.length < 2) {
            return message.reply('Usage: !remind <time> <message>');
        }

        const time = args[0];
        const msgContent = args.slice(1).join(' ');

        await handleRemind(message, time, msgContent);
    }
};

async function handleRemind(context, time, message) {
    const isInteraction = !!context.isCommand;
    const user = isInteraction ? context.user : context.author;

    const msTime = ms(time);

    if (!msTime) {
        const msg = 'Invalid time format. Use 10s, 5m, 1h, etc.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('⏰ Reminder Set')
        .setDescription(`I will remind you in **${time}**: ${message}`)
        .setFooter({ text: 'Note: Reminders are lost if the bot restarts.' });

    if (isInteraction) await context.reply({ embeds: [embed] });
    else await context.reply({ embeds: [embed] });

    setTimeout(async () => {
        const reminderEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('⏰ Reminder!')
            .setDescription(`You asked me to remind you: **${message}**`)
            .setTimestamp();

        try {
            await user.send({ embeds: [reminderEmbed] });
        } catch (error) {
            // If DM fails (blocked, etc.), try to send in the channel if possible
            if (!isInteraction && context.channel) {
                context.channel.send({ content: `${user}`, embeds: [reminderEmbed] }).catch(console.error);
            } else if (isInteraction && context.channel) {
                context.channel.send({ content: `${user}`, embeds: [reminderEmbed] }).catch(console.error);
            }
        }
    }, msTime);
}
