const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        // Check for bot mention
        if (message.content.match(new RegExp(`^<@!?${message.client.user.id}>( |)$`))) {
            const helpCommand = message.client.commands.get('help');
            if (helpCommand && helpCommand.run) {
                return await helpCommand.run(message, []);
            }
        }

        const prefix = message.client.prefix;
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = message.client.commands.get(commandName);

        if (!command) return;

        try {
            // Check if the command supports prefix usage
            if (command.run) {
                await command.run(message, args);
            } else {
                // Optional: Fallback to execute if compatible, or notify user
                // For now, we'll assume if run isn't there, it's slash-only
                // But we can try to be helpful
                await message.reply('This command is only available as a slash command (e.g. /' + commandName + ')');
            }
        } catch (error) {
            console.error(error);
            await message.reply('There was an error while executing this command!');
        }
    },
};
