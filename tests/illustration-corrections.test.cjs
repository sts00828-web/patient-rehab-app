const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const catalog=require('../clinical-catalog.js');

const expected={
 E08:'6bb19ba6a6baae85411cc5ad22f71fee7edc0e9e6f948bbc8bc38729dabc0237',
 N12:'60ced3bc002ab036dc14796f1c57d779edfe41626f16701824d4cb42014c4aba',
 P08:'0b4b96ea25ff22efde3bd6975235aa8b0a5287f87c897371e7f0ac1140012499',
 T20:'7180afa3125aeec199d00ef1e63a73caeffc578eca33538df1509a7fb0a07942'
};

test('four corrected illustrations match their catalog hashes',()=>{
 for(const [id,hash] of Object.entries(expected)){
  const d=catalog.definitions[id];
  assert.equal(d.image,`images/${id}.png`);
  assert.equal(d.sha256,hash);
  const bytes=fs.readFileSync(path.join(__dirname,'..',d.image));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),hash);
  assert.equal(d.assetStatus,'生成画像・姿勢確認済み');
  assert.match(d.assetNotes,/共通人物/);
 }
});

test('T20 is identified and instructed as a Pallof press',()=>{
 const d=catalog.definitions.T20;
 assert.equal(d.name,'パロフプレス');
 assert.match(d.steps.join(''),/横・胸の高さ.*胸と骨盤を正面.*押し出して戻し.*左右/);
 assert.match(d.imageCaption,/胸と骨盤を正面.*前へ押し出/);
 assert.match(d.caution,/体を回さない/);
});

test('corrected captions state the intended visible motion',()=>{
 assert.match(catalog.definitions.E08.imageCaption,/肘を体側.*前腕/);
 assert.match(catalog.definitions.N12.imageCaption,/額と後頭部.*頭は動かさず/);
 assert.match(catalog.definitions.P08.imageCaption,/低速.*数歩.*緩やか/);
});
