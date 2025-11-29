# Anime Discord Bot

A rich-feature Discord bot with Anime capabilities, supporting both Slash Commands (/) and Prefix Commands (!).

## Features

- **Anime Search**: Search for anime details using the Jikan API.
- **Random Anime**: Get a random anime recommendation.
- **Seamless Help**: Unified help command for both prefix and slash usage.
- **Dual Support**: Works with both `!` (prefix) and `/` (slash) commands.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Environment**:
    Rename or copy `.env` and fill in your details:
    ```env
    DISCORD_TOKEN=your_bot_token
    CLIENT_ID=your_client_id
    PREFIX=!
    ```

3.  **Run the Bot**:
    ```bash
    node index.js
    ```

## Commands

| Command | Slash | Prefix | Description |
| :--- | :--- | :--- | :--- |
| **Help** | `/help` | `!help` | Show available commands |
| **Bot Info** | `/botinfo` | `!botinfo` | Show bot statistics |
| **Invite** | `/invite` | `!invite` | Get bot invite link |
| **Anime Search** | `/anime search <query>` | `!anime search <query>` | Search for an anime |
| **Random Anime** | `/anime random` | `!anime random` | Get a random anime |
| **K-Pop Search** | `/kpop search <query>` | `!kpop search <query>` | Search iTunes for K-Pop |
| **K-Pop News** | `/kpop news` | `!kpop news` | Latest news from Soompi |
| **Avatar** | `/avatar [user]` | `!avatar [user]` | View user avatar |
| **Poll** | `/poll <q> <opts>` | `!poll <q> \| <opts>` | Create a poll |
| **Remind** | `/remind <time> <msg>` | `!remind <time> <msg>` | Set a reminder |
| **Weather** | `/weather <city>` | `!weather <city>` | Check weather |
| **Play Music** | `/play <query>` | `!play <query>` | Play music (Lavalink) |
| **Skip** | `/skip` | `!skip` | Skip song |
| **Stop** | `/stop` | `!stop` | Stop music |
| **Queue** | `/queue` | `!queue` | Show queue |
| **Loop** | `/loop <mode>` | `!loop <mode>` | Loop track/queue |
| **Pause** | `/pause` | `!pause` | Pause music |
| **Resume** | `/resume` | `!resume` | Resume music |
| **Now Playing** | `/nowplaying` | `!nowplaying` | Show current song |
| **Remove** | `/remove <pos>` | `!remove <pos>` | Remove song |
| **Move** | `/move <from> <to>` | `!move <from> <to>` | Move song |
| **Clear Queue** | `/clearqueue` | `!clearqueue` | Clear queue |
| **Volume** | `/volume <level>` | `!volume <level>` | Set volume (0-100) |
| **Kick** | `/kick <user>` | `!kick <user>` | Kick user |
| **Ban** | `/ban <user>` | `!ban <user>` | Ban user |
| **Timeout** | `/timeout <user> <time>` | `!timeout <user> <time>` | Timeout user |
| **Clear** | `/clear <amount>` | `!clear <amount>` | Delete messages |
| **Warn** | `/warn add/list` | `!warn add/list` | Manage warnings |

## Project Structure

- `index.js`: Main entry point and handler.
- `src/commands`: Command files.
- `src/events`: Event listeners.
