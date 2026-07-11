import {describe,expect,it} from "vitest";import {maps} from "../src/maps.js";import {availableMaps,castBan,createSession,finishVote} from "../src/vote.js";
describe("map voting",()=>{
  it("leaves three maps after distinct bans",()=>{const s=createSession("host",4,maps,()=>.5);s.candidates.slice(0,4).forEach((m,i)=>castBan(s,`p${i}`,m.id));expect(availableMaps(s)).toHaveLength(3)});
  it("allows one ban per user",()=>{const s=createSession("host",2,maps);castBan(s,"p",s.candidates[0].id);expect(()=>castBan(s,"p",s.candidates[1].id)).toThrow("already banned")});
  it("never selects a banned map",()=>{const s=createSession("host",2,maps,()=>.5),b=s.candidates[0];castBan(s,"p",b.id);expect(finishVote(s,()=>0).id).not.toBe(b.id)});
});
