import type { MapDefinition } from "./maps.js";
export interface VoteSession { id: string; hostId: string; playerCount: number; candidates: MapDefinition[]; votes: Map<string,string>; winner?: MapDefinition }
export function shuffled<T>(values: readonly T[], random=Math.random) { const a=[...values]; for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]} return a }
export function createSession(hostId:string, playerCount:number, pool:readonly MapDefinition[], random=Math.random):VoteSession {
  if(!Number.isInteger(playerCount)||playerCount<2||playerCount>8) throw new Error("Player count must be between 2 and 8.");
  if(pool.length<playerCount+3) throw new Error(`The map pool needs at least ${playerCount+3} maps.`);
  return {id:crypto.randomUUID(),hostId,playerCount,candidates:shuffled(pool,random).slice(0,playerCount+3),votes:new Map()};
}
export function availableMaps(s:VoteSession){const banned=new Set(s.votes.values()); return s.candidates.filter(m=>!banned.has(m.id))}
export function castBan(s:VoteSession,userId:string,mapId:string){if(s.winner)throw new Error("This vote has finished.");if(s.votes.has(userId))throw new Error("You have already banned a map.");if(!s.candidates.some(m=>m.id===mapId))throw new Error("That map is not in this vote.");s.votes.set(userId,mapId)}
export function finishVote(s:VoteSession,random=Math.random){if(s.winner)return s.winner;const a=availableMaps(s);if(!a.length)throw new Error("Every candidate was banned.");return s.winner=a[Math.floor(random()*a.length)]}
