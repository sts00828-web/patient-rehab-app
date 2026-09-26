const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../bug-report.js'),'utf8');
function setup(clipboard){
  const nodes={};
  const context=vm.createContext({navigator:{userAgent:'Windows Chrome/120',clipboard},Date,
    $:id=>nodes[id],modal:()=>{for(const id of ['bugReportModal','bug-intent','bug-actual','bug-copy','bug-status','bug-fallback','bug-text','bug-select'])nodes[id]={value:'',textContent:'',isConnected:true,hidden:true,listeners:{},addEventListener(event,fn){this.listeners[event]=fn;},focus(){},select(){},setSelectionRange(a,b){this.selectionStart=a;this.selectionEnd=b;}};}});
  for(const key of ['localStorage','location','S','L'])Object.defineProperty(context,key,{get(){throw Error('Forbidden read: '+key);}});
  vm.runInContext(source,context);context.openBugReport();return {context,nodes};
}
test('exact allowlisted report, coarse environment, no raw navigator data',()=>{
  const {context}=setup();
  const report=context.buildBugReport('操作','結果',{userAgent:'SECRET Chrome/123 Windows',platform:'SECRET'},new Date('2026-09-25T00:00:00Z'));
  assert.equal(report,'【不具合報告】\nやろうとしたこと：\n操作\n\n実際に起きたこと：\n結果\n\nアプリ版：v56\n日時：2026-09-25T00:00:00.000Z（UTC）\n端末：PC / その他\nOS：Windows\nブラウザ：Chrome');
  assert.match(context.bugReportEnvironment({userAgent:'Macintosh Safari/1',platform:'MacIntel',maxTouchPoints:5}),/iOS \/ iPadOS/);
});
test('successful write copies literal input and keeps draft after reopening',async()=>{
  let copied;const {context,nodes}=setup({writeText:async t=>{copied=t;}});
  nodes['bug-intent'].value='<img src=x onerror=alert(1)>';
  nodes['bug-actual'].value='失敗';nodes['bug-intent'].listeners.input();
  await nodes['bug-copy'].listeners.click();
  assert.ok(copied.includes('<img src=x onerror=alert(1)>'));
  assert.match(nodes['bug-status'].textContent,/^コピーしました/);
  assert.equal(nodes['bug-fallback'].hidden,true);
  context.openBugReport();assert.equal(nodes['bug-intent'].value,'<img src=x onerror=alert(1)>');
});
for(const mode of ['rejected','unavailable'])test(mode+' exposes selectable literal report without false success',async()=>{
  const {nodes}=setup(mode==='rejected'?{writeText:async()=>{throw Error('denied');}}:undefined);
  nodes['bug-intent'].value='</textarea><script>alert(1)</script>';
  await nodes['bug-copy'].listeners.click();
  assert.match(nodes['bug-status'].textContent,/自動コピーできません/);
  assert.equal(nodes['bug-fallback'].hidden,false);
  assert.ok(nodes['bug-text'].value.includes(nodes['bug-intent'].value));
  assert.equal(nodes['bug-text'].selectionEnd,nodes['bug-text'].value.length);
  assert.equal(nodes['bug-copy'].disabled,false);
});
test('SW and report version / cached script agree',()=>{
  const sw=fs.readFileSync(require('node:path').join(__dirname,'../sw.js'),'utf8');
  assert.match(sw,/PREFIX \+ 'v56'/);assert.match(sw,/'\.\/bug-report.js'/);assert.match(source,/アプリ版：v56/);
});
