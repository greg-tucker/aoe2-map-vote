import "dotenv/config";
import {ActionRowBuilder,AttachmentBuilder,ButtonBuilder,ButtonStyle,Client,EmbedBuilder,Events,GatewayIntentBits,REST,Routes,SlashCommandBuilder,StringSelectMenuBuilder} from "discord.js";
import {maps,type MapDefinition} from "./maps.js";
import {availableMaps,castBan,createSession,finishVote,type VoteSession} from "./vote.js";
const token=process.env.DISCORD_TOKEN, clientId=process.env.DISCORD_CLIENT_ID;
if(!token||!clientId) throw new Error("DISCORD_TOKEN and DISCORD_CLIENT_ID are required. Copy .env.example to .env.");
const sessions=new Map<string,VoteSession>();
const command=new SlashCommandBuilder().setName("mapvote").setDescription("Start an AoE II: DE map-ban vote").addIntegerOption(o=>o.setName("players").setDescription("Number of players banning maps").setMinValue(2).setMaxValue(8).setRequired(true));
function controls(s:VoteSession,disabled=false){
  const select=new StringSelectMenuBuilder().setCustomId(`ban:${s.id}`).setPlaceholder("Choose your one map ban").setDisabled(disabled).addOptions(s.candidates.map(m=>({label:m.name,description:m.type,value:m.id,emoji:"❌"})));
  const finish=new ButtonBuilder().setCustomId(`finish:${s.id}`).setLabel("Finish early (host)").setStyle(ButtonStyle.Secondary).setDisabled(disabled);
  return [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select),new ActionRowBuilder<ButtonBuilder>().addComponents(finish)];
}
function status(s:VoteSession){const banned=new Set(s.votes.values());return new EmbedBuilder().setColor(s.winner?0xd4a72c:0x5b8c3a).setTitle(s.winner?`🏆 ${s.winner.name}`:"AoE II: DE Map Vote").setDescription(s.winner?`Randomly selected from ${availableMaps(s).length} non-banned maps.`:s.candidates.map(m=>`${banned.has(m.id)?"❌":"✅"} **${m.name}**`).join("\n")).addFields({name:"Bans",value:`${s.votes.size}/${s.playerCount}`,inline:true}).setFooter({text:s.winner?"Vote complete":"Each Discord user gets one ban"})}

const imageCache=new Map<string,Buffer>();
async function imageAttachment(map:MapDefinition){
  const name=`${map.id}.png`;let data=imageCache.get(map.id);
  if(!data){const url=map.imageUrl??await findWikiPreview(map);const response=await fetch(url);if(!response.ok)throw new Error(`Image download returned ${response.status}`);data=Buffer.from(await response.arrayBuffer());imageCache.set(map.id,data)}
  return new AttachmentBuilder(data,{name});
}
async function findWikiPreview(map:MapDefinition){
  const titles=encodeURIComponent(`${map.name}|${map.name} (map)`);const api=`https://ageofempires.fandom.com/api.php?action=query&generator=images&titles=${titles}&gimlimit=50&prop=imageinfo&iiprop=url&format=json`;
  const response=await fetch(api);if(!response.ok)throw new Error(`Preview lookup returned ${response.status}`);const json=await response.json() as {query?:{pages?:Record<string,{title:string,imageinfo?:Array<{url:string}>}>}};const images=Object.values(json.query?.pages??{});
  const key=map.name.toLowerCase().replace(/[^a-z0-9]/g,"");const ranked=images.map(image=>{const title=image.title.toLowerCase(),normalized=title.replace(/[^a-z0-9]/g,"");let score=normalized.includes(key)?50:0;if(title.includes("composite"))score+=100;if(title.includes("preview"))score+=40;if(title.includes(" map"))score+=10;if(/aoe3|aom|icon|resource|disambig/.test(title))score-=100;return {url:image.imageinfo?.[0]?.url,score}}).filter((item):item is {url:string,score:number}=>Boolean(item.url)).sort((a,b)=>b.score-a.score);
  if(!ranked[0]||ranked[0].score<40)throw new Error("No suitable preview found");return ranked[0].url;
}
async function previewBundle(selected:MapDefinition[]){
  const loaded=await Promise.all(selected.map(async map=>{try{return {map,file:await imageAttachment(map)}}catch(error){console.warn(`Could not load preview for ${map.name}:`,error);return {map}}}));
  return {embeds:loaded.map(({map,file})=>{const embed=new EmbedBuilder().setTitle(map.name).setDescription(`**Map type:** ${map.type}`).setColor(0x8b6f47);return file?embed.setImage(`attachment://${file.name}`):embed}),files:loaded.flatMap(({file})=>file?[file]:[])};
}
const rest=new REST({version:"10"}).setToken(token);const guildId=process.env.DISCORD_GUILD_ID;await rest.put(guildId?Routes.applicationGuildCommands(clientId,guildId):Routes.applicationCommands(clientId),{body:[command.toJSON()]});
const client=new Client({intents:[GatewayIntentBits.Guilds]});client.once(Events.ClientReady,c=>console.log(`Ready as ${c.user.tag}`));
client.on(Events.InteractionCreate,async interaction=>{try{
  if(interaction.isChatInputCommand()&&interaction.commandName==="mapvote"){
    if(!interaction.inGuild()||!interaction.channelId)return void interaction.reply({content:"Use this command in a server channel.",ephemeral:true});
    const key=`${interaction.guildId}:${interaction.channelId}`,existing=sessions.get(key);if(existing&&!existing.winner)return void interaction.reply({content:"There is already an active map vote in this channel.",ephemeral:true});
    const s=createSession(interaction.user.id,interaction.options.getInteger("players",true),maps);sessions.set(key,s);
    await interaction.deferReply();await interaction.editReply({embeds:[status(s)],components:controls(s)});const first=await previewBundle(s.candidates.slice(0,10));await interaction.followUp(first);if(s.candidates.length>10){const rest=await previewBundle(s.candidates.slice(10));await interaction.followUp(rest)}return;
  }
  if(!interaction.isStringSelectMenu()&&!interaction.isButton())return;const [action,id]=interaction.customId.split(":");const key=interaction.guildId&&interaction.channelId?`${interaction.guildId}:${interaction.channelId}`:"",s=sessions.get(key);
  if(!s||s.id!==id)return void interaction.reply({content:"This vote is no longer active.",ephemeral:true});
  if(action==="ban"&&interaction.isStringSelectMenu()){castBan(s,interaction.user.id,interaction.values[0]);if(s.votes.size>=s.playerCount)finishVote(s)}else if(action==="finish"&&interaction.isButton()){if(interaction.user.id!==s.hostId)return void interaction.reply({content:"Only the vote host can finish early.",ephemeral:true});finishVote(s)}
  if(s.winner){let file:AttachmentBuilder|undefined;try{file=await imageAttachment(s.winner)}catch(error){console.warn(`Could not load winning preview for ${s.winner.name}:`,error)}const embed=status(s);if(file)embed.setImage(`attachment://${file.name}`);await interaction.update({embeds:[embed],files:file?[file]:[],components:controls(s,true)})}else await interaction.update({embeds:[status(s)],components:controls(s)});
}catch(error){const message=error instanceof Error?error.message:"Something went wrong.";if(interaction.isRepliable()){if(interaction.replied||interaction.deferred)await interaction.followUp({content:message,ephemeral:true});else await interaction.reply({content:message,ephemeral:true})}}});
await client.login(token);
