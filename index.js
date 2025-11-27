require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { Poru } = require('poru');
const sequelize = require('./src/database/db');
const User = require('./src/database/models/User'); // Load models to ensure they are registered
const Warning = require('./src/database/models/Warning');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates, // Required for Lavalink
    ],
});

// Lavalink Configuration
client.poru = new Poru(client, [{
    name: 'Public Node',
    host: 'lavalink.jirayu.net',
    port: 13592,
    password: 'youshallnotpass',
    secure: false
}], {
    library: 'discord.js',
    defaultPlatform: 'ytsearch',
});

// Poru Events
client.poru.on('nodeConnect', node => {
    console.log(`[Lavalink] Node ${node.name} Connected!`);
});

client.poru.on('nodeDisconnect', node => {
    console.log(`[Lavalink] Node ${node.name} Disconnected.`);
});

client.poru.on('trackStart', (player, track) => {
    const embed = {
        color: 0x00FF00,
        title: '🎶 Now Playing',
        description: `[${track.info.title}](${track.info.uri})`,
        footer: { text: `Requested by ${track.info.requester.tag}` }
    };
    const channel = client.channels.cache.get(player.textChannel);
    if (channel) channel.send({ embeds: [embed] });
});

client.poru.on('queueEnd', player => {
    const channel = client.channels.cache.get(player.textChannel);
    if (channel) channel.send('Queue finished! Leaving voice channel.');
    player.destroy();
});

client.commands = new Collection();
client.prefix = process.env.PREFIX || '!';

// Load Commands
const foldersPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const commands = [];

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Load Events
const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Deploy Slash Commands
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Note: This deploys globally. For faster dev, deploy to a specific guild.
        // But for a general bot, global is fine (takes up to 1 hour to update).
        // If CLIENT_ID is missing, this part will be skipped or error out gracefully if we check.
        if (process.env.CLIENT_ID) {
            if (process.env.GUILD_ID) {
                console.log(`Deploying commands to Guild: ${process.env.GUILD_ID} (Instant)`);
                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                    { body: commands },
                );
                console.log(`Successfully reloaded ${commands.length} application (/) commands for guild.`);
            } else {
                console.log('Deploying commands Globally (Up to 1 hour cache)');
                await rest.put(
                    Routes.applicationCommands(process.env.CLIENT_ID),
                    { body: commands },
                );
                console.log(`Successfully reloaded ${commands.length} application (/) commands globally.`);
            }
        } else {
            console.log('CLIENT_ID not found in .env, skipping slash command deployment.');
        }

    } catch (error) {
        console.error(error);
    }
})();

// Sync Database
sequelize.sync().then(() => {
    console.log('Database synced');
}).catch(err => {
    console.error('Error syncing database:', err);
});

client.login(process.env.DISCORD_TOKEN);
