import "dotenv/config";
import {ActionRowBuilder,ButtonBuilder,ButtonStyle,Client,EmbedBuilder,Events,GatewayIntentBits,REST,Routes,SlashCommandBuilder,StringSelectMenuBuilder} from "discord.js";
import {maps,type MapDefinition} from "./maps.js";
import {availableMaps,castBan,createSession,finishVote,type VoteSession} from "./vote.js";
const token=process.env.DISCORD_TOKEN, clientId=process.env.DISCORD_CLIENT_ID;
if(!token||!clientId) throw new Error("DISCORD_TOKEN and DISCORD_CLIENT_ID are required. Copy .env.example to .env.");
const sessions=new Map<string,VoteSession>();
const command=new SlashCommandBuilder().setName("mapvote").setDescription("Start an AoE II: DE map-ban vote").addIntegerOption(o=>o.setName("players").setDescription("Number of players banning maps").setMinValue(2).setMaxValue(8).setRequired(true));
function controls(s:VoteSession,disabled=false){
  const select=new StringSelectMenuBuilder().setCustomId(`ban:${s.id}`).setPlaceholder("Choose your one map ban").setDisabled(disabled).addOptions(s.candidates.map(m=>({label:m.name,value:m.id,emoji:"❌"})));
  const finish=new ButtonBuilder().setCustomId(`finish:${s.id}`).setLabel("Finish early (host)").setStyle(ButtonStyle.Secondary).setDisabled(disabled);
  return [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select),new ActionRowBuilder<ButtonBuilder>().addComponents(finish)];
}
function status(s:VoteSession){const banned=new Set(s.votes.values());return new EmbedBuilder().setColor(s.winner?0xd4a72c:0x5b8c3a).setTitle(s.winner?`🏆 ${s.winner.name}`:"AoE II: DE Map Vote").setDescription(s.winner?`Randomly selected from ${availableMaps(s).length} non-banned maps.`:s.candidates.map(m=>`${banned.has(m.id)?"❌":"✅"} **${m.name}**`).join("\n")).addFields({name:"Bans",value:`${s.votes.size}/${s.playerCount}`,inline:true}).setFooter({text:s.winner?"Vote complete":"Each Discord user gets one ban"}).setImage(s.winner?.imageUrl??null)}
function preview(m:MapDefinition){return new EmbedBuilder().setTitle(m.name).setColor(0x8b6f47).setImage(m.imageUrl)}
const rest=new REST({version:"10"}).setToken(token);const guildId=process.env.DISCORD_GUILD_ID;await rest.put(guildId?Routes.applicationGuildCommands(clientId,guildId):Routes.applicationCommands(clientId),{body:[command.toJSON()]});
const client=new Client({intents:[GatewayIntentBits.Guilds]});client.once(Events.ClientReady,c=>console.log(`Ready as ${c.user.tag}`));
client.on(Events.InteractionCreate,async interaction=>{try{
  if(interaction.isChatInputCommand()&&interaction.commandName==="mapvote"){
    if(!interaction.inGuild()||!interaction.channelId)return void interaction.reply({content:"Use this command in a server channel.",ephemeral:true});
    const key=`${interaction.guildId}:${interaction.channelId}`,existing=sessions.get(key);if(existing&&!existing.winner)return void interaction.reply({content:"There is already an active map vote in this channel.",ephemeral:true});
    const s=createSession(interaction.user.id,interaction.options.getInteger("players",true),maps);sessions.set(key,s);
    await interaction.reply({embeds:[status(s),...s.candidates.slice(0,9).map(preview)],components:controls(s)});if(s.candidates.length>9)await interaction.followUp({embeds:s.candidates.slice(9).map(preview)});return;
  }
  if(!interaction.isStringSelectMenu()&&!interaction.isButton())return;const [action,id]=interaction.customId.split(":");const key=interaction.guildId&&interaction.channelId?`${interaction.guildId}:${interaction.channelId}`:"",s=sessions.get(key);
  if(!s||s.id!==id)return void interaction.reply({content:"This vote is no longer active.",ephemeral:true});
  if(action==="ban"&&interaction.isStringSelectMenu()){castBan(s,interaction.user.id,interaction.values[0]);if(s.votes.size>=s.playerCount)finishVote(s)}else if(action==="finish"&&interaction.isButton()){if(interaction.user.id!==s.hostId)return void interaction.reply({content:"Only the vote host can finish early.",ephemeral:true});finishVote(s)}
  await interaction.update({embeds:[status(s)],components:controls(s,Boolean(s.winner))});
}catch(error){const message=error instanceof Error?error.message:"Something went wrong.";if(interaction.isRepliable()){if(interaction.replied||interaction.deferred)await interaction.followUp({content:message,ephemeral:true});else await interaction.reply({content:message,ephemeral:true})}}});
await client.login(token);
