export interface MapDefinition { id: string; name: string; imageUrl: string }
const cdn = "https://cdn.ageofempires.com/aoe-forums/original/3X";
export const maps: MapDefinition[] = [
  ["arabia", "Arabia", "d/f/df5cb52c8ba6c606b646ebe175f57fd2f37fff68.png"],
  ["arena", "Arena", "5/b/5b047752879bf8009039bdd01dbfb4038eabf51a.png"],
  ["baltic", "Baltic", "7/2/72f0a15d9ae898624e6cef8574a4b6479837e463.png"],
  ["four-lakes", "Four Lakes", "b/f/bfe51ff0717c6b5cba8be2b9760818a7a6c9d013.png"],
  ["ghost-lake", "Ghost Lake", "2/b/2b7e89f99313dd9edde3811273d82d5f58179d8b.png"],
  ["golden-pit", "Golden Pit", "f/0/f08cac7e7b995cc496fc51940238ee6a2d5e87a4.png"],
  ["hideout", "Hideout", "d/e/de5fb9569c607089356cfb1de42089b1ac3a0fa0.png"],
  ["black-forest", "Black Forest", "3/4/344ad8c1553538b5ef2544b05af2366a355f2da1.png"],
  ["megarandom", "MegaRandom", "b/7/b72b0c7875a8e71e7bfc2c96901433209d7fca1f.png"],
  ["land-nomad", "Land Nomad", "0/9/094e5a4dea5038e4f8545e531faf94328a4506ba.png"],
  ["oasis", "Oasis", "1/0/10bbb8fa5d0a181f509798cc20b31af08f7d7a80.png"]
].map(([id, name, path]) => ({ id, name, imageUrl: `${cdn}/${path}` }));
