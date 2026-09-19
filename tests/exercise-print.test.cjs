const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../exercise-print.js'),'utf8');
const ctx=vm.createContext({URL});vm.runInContext(source,ctx);
const render=(count,extra={})=>{ctx.input={patientName:'架空患者',chartId:'00123',...extra};ctx.items=Array.from({length:count},(_,i)=>({name:'運動'+i,prescription:{repetitions:'5回',sets:'2セット',frequency:'1日1回'},dows:[1,4]}));return vm.runInContext("RehabPrint.documentHtml(input,items,items.map(()=>({image:'pelvic-tilt.png',steps:['腰と床の隙間を小さくする'],caution:'お尻を浮かせない'})),'https://example.test/app/')",ctx);};
test('one to six exercises split into sheets of at most three with all doses and steps',()=>{
  for(let n=1;n<=6;n++){const html=render(n);assert.equal((html.match(/class="sheet"/g)||[]).length,Math.ceil(n/3));assert.equal((html.match(/class="exercise"/g)||[]).length,n);assert.equal((html.match(/回数：5回/g)||[]).length,n);assert.equal((html.match(/セット：2セット/g)||[]).length,n);assert.ok(html.includes('月・木曜日'));assert.ok(html.includes('https://example.test/app/assets/exercises/pelvic-tilt.png'));}
});
test('zero or more than six exercises are rejected rather than silently omitted',()=>{assert.throws(()=>render(0));assert.throws(()=>render(7));});
test('patient text is escaped and blank identities do not acquire fabricated IDs',()=>{
  const html=render(1,{patientName:'</script><script>alert(1)</script>',chartId:''});assert.ok(!html.includes('<script>alert(1)</script>'));assert.ok(html.includes('&lt;/script&gt;'));assert.ok(!html.includes('患者ID：'));
  assert.ok(render(1,{patientName:'',chartId:''}).includes('お名前：________________'));
});
