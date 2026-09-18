/* Regenerate public guides from the same disease membership used by the app. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx=vm.createContext({});
for(const file of ['exercises.js','disease-library.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
vm.runInContext('globalThis.content={library:EXERCISE_LIBRARY,diseases:DISEASE_LIBRARY,groups:EXERCISE_CHOICE_GROUPS,keys:getDiseaseExerciseKeys};',ctx);
const {library,diseases,groups,keys}=ctx.content;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cell=value=>String(value??'').replace(/\|/g,'／').replace(/\r?\n/g,' ');
let doc=`# 疾患別メニュー一覧（PT選択用）\n\n${Object.keys(diseases).length}領域・固有${Object.keys(library).length}種目の候補です。同じ運動を複数疾患で共有します。各疾患の候補を一律に全部行う処方ではありません。目的・症状・生活での負荷を確認して選びます。基本・標準・発展は編集上の目安で、検証済みの病期分類や安全判定ではありません。\n\n「主な運動候補」「補助的な運動候補」「症状・動作能力を確認して選択」は目的を整理する表示です。効果の優劣や自動的な適応を意味しません。指示量は担当PTが個別に設定します。\n\n## 同系統の選び方\n\n同系統を複数選ぶとPT画面に注意を表示します。併用は禁止せず、目的の違いと運動量の合計を確認します。既存の患者メニュー・種目IDは変更しません。\n\n| 同系統 | 選択時の考え方 |\n|---|---|\n`;
for(const group of Object.values(groups))doc+=`| ${cell(group.name)} | ${cell(group.note)} |\n`;
const galleryPath=path.join(root,'illustration-preview.html');
let gallery=fs.readFileSync(galleryPath,'utf8').split('<header>')[0];
gallery+=`<header><a href="./">← アプリへ</a><h1>運動イラスト一覧</h1><p>${Object.keys(diseases).length}領域で使う${Object.keys(library).length}種目の画像です。複数疾患で共通する運動は同じ画像を使用しています。画像をタップすると大きく開きます。</p></header>`;
for(const [key,disease] of Object.entries(diseases)){
  const exercises=keys(key).map(id=>library[id]);
  doc+=`\n## ${disease.name}（${exercises.length}候補）\n\n${disease.guidance}\n`;
  if(disease.prescriptionNote)doc+=`\n患者へ渡す共通注意：${disease.prescriptionNote}\n`;
  if(disease.sources?.length)doc+='\n疾患の適応・選定の参考：'+disease.sources.map(s=>`[${s.title}](${s.url})`).join('、')+'。\n';
  doc+='\n| 種目 | 目的・位置づけ | 同系統内の違い | 選択時の注意 |\n|---|---|---|---|\n';
  gallery+=`<section><h2>${esc(disease.name)}</h2><p>${exercises.length}種目の候補</p><div class="grid">`;
  for(const e of exercises){
    doc+=`| [${cell(e.name)}](${e.source}) | ${cell(e.purpose)}／${cell(e.clinicalRole)} | ${e.choiceGroup?cell(groups[e.choiceGroup].name+'：'+e.choiceVariant):'別の目的で選択'} | ${cell(e.selectionNote)} |\n`;
    gallery+=`<figure><a href="assets/exercises/${esc(e.image)}"><img src="assets/exercises/${esc(e.image)}" alt="${esc(e.name)}を行う同じ若い男性" loading="lazy" width="1536" height="1024"></a><figcaption>${esc(e.name)}<small>${esc(e.purpose)} ／ ${esc(e.difficulty)}</small></figcaption></figure>`;
  }
  const captions=exercises.filter(e=>e.imageCaption);
  if(captions.length){doc+='\n図の場面：\n\n';for(const e of captions)doc+=`- ${e.name}：${e.imageCaption}\n`;}
  gallery+='</div></section>';
}
doc+='\n## 根拠資料と調整例\n\n各リンクは動作の参考資料であり、説明・支持物・範囲を調整した種目を含みます。quad-settingはDorsetの静的四頭筋収縮を長座位・薄いタオルで行う調整例です。かかとを上げる短範囲膝伸展とは区別します。肩の筋力運動は一般的な肩の資料に基づく条件付き候補で、五十肩の全病期に適用しません。\n\n手首屈筋のストレッチは手掌側の柔軟性を目的とする補助候補です。外側上顆炎での伸筋群ストレッチとは別です。手首の重り運動は前腕を支持し、手首と手を机の端から出して行います。\n\n膝OAでは運動を個人に合わせることが推奨されます。候補数を固定する根拠ではありません。[NICE NG226](https://www.nice.org.uk/guidance/NG226/chapter/recommendations)。新しい図・手順は処方時にPTが実際の動作と照合してください。\n';
fs.writeFileSync(path.join(root,'MENU_GUIDE.md'),doc);
fs.writeFileSync(galleryPath,gallery+'</main></body></html>\n');
console.log('Updated menu guide and illustration gallery');
