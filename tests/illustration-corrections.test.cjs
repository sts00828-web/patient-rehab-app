const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const catalog=require('../clinical-catalog.js');

const expected={
 E08:'62fa591b658e64577864f35bcd6728c44aebc096cfd5e0fc19e66e2c26640964',
 N12:'cd015a8121142b0cf7fc3e6c7ac894bd40b841b79c5c780923b07cf52a445215',
 P08:'3a2aceddf551a1d98c6333ecfd23410c931a856b5de9f89b88bc000a38d89f6b',
 P15:'fda5f3aaae7f3d1392c167c2533de8b5d07fffa460e3ec8551758f16dfa020dc',
 P26:'d62698be5ff1d1230ed6934190306981b623cd6564ee6a16099c3c78f5309563',
 T20:'2d8c7cf83e22ac01977877f8c83e3820c6cd398c5b5050b52148123a4d382b70'
};

test('four corrected illustrations match their catalog hashes',()=>{
 for(const [id,hash] of Object.entries(expected)){
  const d=catalog.definitions[id];
  assert.equal(d.image,`images/${id}.webp`);
  assert.equal(d.sha256,hash);
  const bytes=fs.readFileSync(path.join(__dirname,'..',d.image));
  assert.equal(bytes.subarray(0,4).toString('ascii'),'RIFF');assert.equal(bytes.subarray(8,12).toString('ascii'),'WEBP');
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
 assert.match(catalog.definitions.P15.imageCaption,/前脚と後脚.*左右の90\/90/);
 assert.match(catalog.definitions.P15.assetNotes,/股関節外旋.*股関節内旋.*左右反転/);
 assert.match(catalog.definitions.P26.imageCaption,/右肘.*左手.*右前腕.*マット側/);
 assert.match(catalog.definitions.P26.assetNotes,/右側臥位.*右肘90度.*左手.*内旋/);
});
