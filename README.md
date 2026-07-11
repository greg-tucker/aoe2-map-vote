# AoE II: DE Map Vote Discord Bot

Starts with `players + 3` random maps, shows official map previews, gives each Discord user one ban, then randomly picks from the maps left. Distinct bans leave exactly three maps.

## Setup

Requires Node.js 22.12+.

1. In the Discord Developer Portal, open the application. Under **Bot**, create/reset its token.
2. Copy `.env.example` to `.env`; enter the application ID, token, and (for testing) your server ID.
3. On **Installation**, enable the `applications.commands` and `bot` scopes. Grant **View Channels**, **Send Messages**, **Embed Links**, and **Read Message History**.
4. Run `npm install`, then `npm run dev`.
5. In the test server, run `/mapvote players:4`.

For production use `npm run build` then `npm start`. Leave `DISCORD_GUILD_ID` empty for global command registration.

## Rules

- Supports 2–8 players and displays 5–11 map candidates.
- Each Discord user gets one ban. The vote resolves after the configured number of voters.
- Duplicate bans are allowed, so more than three maps may remain; the final draw still uses every non-banned map.
- The command invoker can finish early.
- One active vote is allowed per channel. Active votes are held in memory and reset with the bot.

The previews are from the official Age of Empires CDN and its [ranked map pool announcement](https://www.ageofempires.com/news/aoe2de-update-39284/). This is an unofficial community bot; game assets belong to their respective owners.
