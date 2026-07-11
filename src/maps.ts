export interface MapDefinition { id: string; name: string; type: string; imageUrl?: string }

const officialCdn = "https://cdn.ageofempires.com/aoe-forums/original/3X";
const officialImages: Record<string,string> = {
  arabia:`${officialCdn}/d/f/df5cb52c8ba6c606b646ebe175f57fd2f37fff68.png`,arena:`${officialCdn}/5/b/5b047752879bf8009039bdd01dbfb4038eabf51a.png`,baltic:`${officialCdn}/7/2/72f0a15d9ae898624e6cef8574a4b6479837e463.png`,"four-lakes":`${officialCdn}/b/f/bfe51ff0717c6b5cba8be2b9760818a7a6c9d013.png`,"ghost-lake":`${officialCdn}/2/b/2b7e89f99313dd9edde3811273d82d5f58179d8b.png`,"golden-pit":`${officialCdn}/f/0/f08cac7e7b995cc496fc51940238ee6a2d5e87a4.png`,hideout:`${officialCdn}/d/e/de5fb9569c607089356cfb1de42089b1ac3a0fa0.png`,"black-forest":`${officialCdn}/3/4/344ad8c1553538b5ef2544b05af2366a355f2da1.png`,megarandom:`${officialCdn}/b/7/b72b0c7875a8e71e7bfc2c96901433209d7fca1f.png`,"land-nomad":`${officialCdn}/0/9/094e5a4dea5038e4f8545e531faf94328a4506ba.png`,oasis:`${officialCdn}/1/0/10bbb8fa5d0a181f509798cc20b31af08f7d7a80.png`
};

const groups: Array<[string,string[]]> = [
  ["Open Land",["Acclivity","Acropolis","Aftermath","Arabia","Atacama","Bogland","Cenotes","Cliffbound","Crater","Eruption","Ghost Lake","Gold Rush","Golden Pit","Haboob","Karsts","Kilimanjaro","Land Madness","Lombardia","Lowland","Marketplace","Meadow","Morass","Mountain Dunes","Mountain Range","Mountain Ridge","Ravines","Runestones","Sacred Springs","Salt Marsh","Sandrift","Serengeti","Shrubland","Socotra","Valley","Wade","Wolf Hill"]],
  ["Nomad · Open Land",["African Clearing","Steppe"]],
  ["Nomad · Land",["Land Nomad","Mountain Pass"]],
  ["Migration · Open Land",["Seize The Mountain"]],
  ["Migration · Land",["Team Moats"]],
  ["Closed Land",["Amazon Tunnel","Arena","Black Forest","Fortress","Michi"]],
  ["Land",["Alpine Lakes","Border Dispute","Chaos Pit","Crownwood","Dorothea Quarry","Enclosed","Fortified Clearing","Glacis","Glade","Hengehold","Hideout","Hill Fort","Hollow Woodlands","Mongolia","Oasis","Ring Fortress","Yucatán"]],
  ["Open Hybrid",["Bog Islands","Coastal","Coastal Forest","Crossroads","Dunesprings","Four Lakes","Frigid Lake","Golden Swamp","Golden Stream","Hollow Woodlands","Isthmus","Kawasan","Mediterranean","River Divide","Scandinavia","Shoals","The Passage","Volcanic Island"]],
  ["Nomad · Hybrid",["Nomad","Water Nomad"]],
  ["Nomad · Migration · Hybrid",["Graupel","Nile Delta"]],
  ["Migration · Hybrid",["Hamburger"]],
  ["Closed Hybrid",["Mangrove Jungle"]],
  ["Hybrid",["Budapest","City of Lakes","Continental","Greenland","Highland","Rivers"]],
  ["Open Water",["Baltic"]],
  ["Migration · Water",["Migration","Pacific Islands"]],
  ["Closed Water",["Sandbank"]],
  ["Water",["Aquarena","Archipelago","Crater Lake","Islands","Northern Isles","Team Islands"]],
  ["Random",["MegaRandom"]]
];

function slug(name:string){return name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
const catalogue = groups.flatMap(([type,names])=>names.map(name=>{const id=slug(name);return {id,name,type,imageUrl:officialImages[id]}}));
export const maps: MapDefinition[] = [...new Map(catalogue.map(map=>[map.id,map])).values()];
