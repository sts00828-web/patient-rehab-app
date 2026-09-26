const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../exercise-print.js'),'utf8');
const ctx=vm.createContext({URL});vm.runInContext(source,ctx);
const render=(count,extra={})=>{ctx.input={patientName:'架空患者',chartId:'00123',...extra};ctx.items=Array.from({length:count},(_,i)=>({name:'運動'+i,prescription:{repetitions:'5回',sets:'2セット',frequency:'1日1回'},dows:[1,4]}));return vm.runInContext("RehabPrint.documentHtml(input,items,items.map(()=>({image:'pelvic-tilt.png',steps:['腰と床の隙間を小さくする'],caution:'お尻を浮かせない'})),'https://example.test/app/')",ctx);};
test('one to six exercises split into sheets of at most three with only clear doses and steps',()=>{
  for(let n=1;n<=6;n++){const html=render(n);assert.equal((html.match(/class="sheet"/g)||[]).length,Math.ceil(n/3));assert.equal((html.match(/class="exercise"/g)||[]).length,n);assert.equal((html.match(/<span>回数<\/span><strong>5回<\/strong>/g)||[]).length,n);assert.equal((html.match(/<span>セット数<\/span><strong>2セット<\/strong>/g)||[]).length,n);assert.ok(!html.includes('月・木曜日'));assert.ok(!html.includes('頻度'));assert.ok(html.includes('https://example.test/app/assets/exercises/pelvic-tilt.png'));assert.ok(html.includes('<h3>やり方</h3>'));}
});
test('zero or more than six exercises are rejected rather than silently omitted',()=>{assert.throws(()=>render(0));assert.throws(()=>render(7));});
test('hold time is prominent only when it is prescribed',()=>{
  ctx.input={};ctx.items=[{name:'保持あり',prescription:{repetitions:'3回',sets:'2セット',hold:'10秒'}},{name:'保持なし',prescription:{repetitions:'5回',sets:'1セット',hold:'該当なし'}}];
  const html=vm.runInContext("RehabPrint.documentHtml(input,items,items.map(()=>({image:'pelvic-tilt.png',steps:['姿勢を整える']})),'https://example.test/app/')",ctx);
  assert.equal((html.match(/<span>保持時間<\/span>/g)||[]).length,1);assert.ok(html.includes('<strong>10秒</strong>'));assert.ok(!html.includes('<strong>該当なし</strong>'));
});
test('print layout gives more room to the illustration and keeps quantity type moderate',()=>{
  const html=render(1);assert.ok(html.includes('grid-template-columns:78mm 1fr'));assert.ok(html.includes('width:78mm;height:58mm'));assert.ok(html.includes('font-size:12.5pt'));
});
test('patient identity and unrelated prescription details are omitted',()=>{
  const html=render(1,{patientName:'印刷しない患者名',chartId:'SECRET-ID',diagnosis:'印刷しない診断名'});
  for(const text of ['印刷しない患者名','SECRET-ID','印刷しない診断名','開始日','患者ID'])assert.ok(!html.includes(text));
});

const catalog=require('../clinical-catalog.js');
const escapeText=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function catalogPrint(kind,count){
  const ids=['S15','K10','K14','A08','P06','K06'];
  const media=[];
  ctx.items=ids.slice(0,count).map((id,i)=>{
    const modern=kind==='new'||(kind==='mixed'&&i%2===0);
    const d=catalog.definitions[id];
    media.push(modern?{...d,imagePath:d.image}:{image:'pelvic-tilt.png',steps:['腰と床の隙間を小さくする','ゆっくり戻す'],imageCaption:'旧図の説明',caution:'お尻を浮かせない'});
    return {name:modern?d.name:'旧運動'+i,prescription:{side:'両側',repetitions:'5回',sets:'2セット',hold:'保持なし',frequency:'1日1回',load:'重りなし・確認した範囲',support:'安定した椅子'},dows:[1,3,5],params:'息を止めずに行う',diseaseNote:'痛みが増したら中止',note:'担当者と確認した動作で実施',...(modern?{clinicalV02:{revision:'test-v1',patient:{date:'2026-09-25'},constraints:'痛みのない範囲',sportPlan:'監督下で実施',restSeconds:60}}:{})};
  });
  ctx.media=media;ctx.input={patientName:'架空患者',startDate:'2026-09-25'};
  const html=vm.runInContext("RehabPrint.documentHtml(input,items,media,'https://example.test/app/')",ctx);
  return {html,media,items:ctx.items};
}
for(const kind of ['new','old','mixed'])for(const count of [3,6])test(`${kind}: ${count} exercises keep only names, doses, methods and images in ${count/3} sheets`,()=>{
  const {html,media,items}=catalogPrint(kind,count);
  assert.ok(!html.includes('処方版：'));assert.ok(!html.includes('PT確認日：'));
  const sheets=html.split('<section class="sheet">').slice(1);
  assert.equal(sheets.length,count/3);
  for(const [i,sheet] of sheets.entries()){
    assert.equal((sheet.match(/<article /g)||[]).length,3);
    assert.ok(sheet.includes(`${i+1} / ${count/3}ページ`));
    for(let j=0;j<3;j++){
      const index=i*3+j,m=media[index],ex=items[index];
      const card=sheet.split('<article class="exercise">')[j+1].split('</article>')[0];
      for(const text of [ex.name,...m.steps,ex.prescription.repetitions,ex.prescription.sets].filter(Boolean))assert.ok(card.includes(escapeText(text)),text);
      for(const text of [m.imageCaption,m.caution,ex.params,ex.diseaseNote,ex.note,ex.prescription.side,ex.prescription.frequency,ex.prescription.load,ex.prescription.support].filter(Boolean))assert.ok(!card.includes(escapeText(text)),text);
      assert.ok(card.includes(m.imagePath||'assets/exercises/'+m.image));
      if(ex.clinicalV02)for(const text of ['痛みのない範囲','監督下で実施','セット間休息：60秒'])assert.ok(!card.includes(text));
    }
  }
});
test('every method step survives while captions stay out of the simple print',()=>{
  const {html}=catalogPrint('new',6);
  for(const id of ['S15','K10','K14','A08','P06']){
    assert.ok(catalog.definitions[id].imageCaption);
    assert.ok(!html.includes(escapeText(catalog.definitions[id].imageCaption)));
    for(const step of catalog.definitions[id].steps)assert.ok(html.includes(escapeText(step)));
  }
});
test('print readiness blocks missing images and overflow, including after compact spacing',async()=>{
  const html=render(3),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  for(const scenario of ['valid','missing','overflow','compact']){
    let compact=false,invalid=true,printed=0;
    const card={clientHeight:291,get scrollHeight(){return scenario==='overflow'?600:scenario==='compact'&&!compact?310:280;},classList:{remove(){compact=false;},add(){compact=true;}}};
    const status={},button={},img={complete:true,naturalWidth:scenario==='missing'?0:600};
    const document={fonts:{ready:Promise.resolve()},images:[img],querySelectorAll:()=>[card],getElementById:id=>id==='print'?button:status,body:{classList:{toggle(name,value){invalid=value;}}}};
    const sandbox=vm.createContext({document,window:{print(){printed++;}}});vm.runInContext(script,sandbox);
    const valid=await vm.runInContext('ready()',sandbox);
    assert.equal(valid,['valid','compact'].includes(scenario));assert.equal(invalid,!valid);assert.equal(button.disabled,!valid);
    await button.onclick();assert.equal(printed,valid?1:0);
    if(scenario==='overflow')assert.match(status.textContent,/文章を省略せず/);
    if(scenario==='missing')assert.match(status.textContent,/画像を読み込めません/);
  }
});
