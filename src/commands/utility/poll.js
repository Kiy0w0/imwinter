const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a simple poll')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question for the poll')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Options separated by commas (e.g. Yes, No, Maybe)')
                .setRequired(true)),

    async execute(interaction) {
        const question = interaction.options.getString('question');
        const optionsString = interaction.options.getString('options');
        await handlePoll(interaction, question, optionsString);
    },

    async run(message, args) {
        // Simple parsing: !poll "Question" "Option1, Option2"
        // Or just !poll Question | Option1, Option2
        // Let's assume arguments are split by spaces, which is hard for multi-word questions.
        // Let's try to join and split by | or just take the first arg as question if quoted?
        // For simplicity in prefix: !poll Question goes here? | Yes, No

        const content = args.join(' ');
        const parts = content.split('|');

        if (parts.length < 2) {
            return message.reply('Usage: !poll Question? | Option1, Option2');
        }

        const question = parts[0].trim();
        const optionsString = parts[1].trim();

        await handlePoll(message, question, optionsString);
    }
};

async function handlePoll(context, question, optionsString) {
    const isInteraction = !!context.isCommand;

    const options = optionsString.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);

    if (options.length < 2) {
        const msg = 'Please provide at least 2 options separated by commas.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    if (options.length > 10) {
        const msg = 'Maximum 10 options allowed.';
        if (isInteraction) await context.reply({ content: msg, ephemeral: true });
        else await context.reply(msg);
        return;
    }

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    let description = '';
    options.forEach((opt, index) => {
        description += `${emojis[index]} ${opt}\n`;
    });

    const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`📊 ${question}`)
        .setDescription(description)
        .setFooter({ text: `Poll started by ${isInteraction ? context.user.username : context.author.username}` })
        .setTimestamp();

    let pollMessage;
    if (isInteraction) {
        pollMessage = await context.reply({ embeds: [embed], fetchReply: true });
    } else {
        pollMessage = await context.reply({ embeds: [embed] });
    }

    // React with emojis
    for (let i = 0; i < options.length; i++) {
        await pollMessage.react(emojis[i]);
    }
}
