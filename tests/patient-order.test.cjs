const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function selection(){
  const root=path.join(__dirname,'..'),ctx=vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(root,'exercises.js'),'utf8'),ctx);
  vm.runInContext(fs.readFileSync(path.join(root,'exercise-selection.js'),'utf8')+';globalThis.selection=ExerciseSelection;',ctx);
  return ctx.selection;
}

test('related plank progressions remain adjacent in a predictable order',()=>{
  const s=selection(),input=['walking','side-plank','bridge','forearm-plank','single-leg-plank'].map(exerciseKey=>({exerciseKey}));
  const keys=Array.from(s.ordered(input),item=>item.exerciseKey);
  const plank=keys.filter(key=>key.includes('plank'));
  assert.deepEqual(plank,['forearm-plank','side-plank','single-leg-plank']);
  assert.equal(keys.indexOf('side-plank'),keys.indexOf('forearm-plank')+1);
  assert.equal(keys.indexOf('single-leg-plank'),keys.indexOf('side-plank')+1);
});

test('ordering is stable for custom exercises with no catalogue position',()=>{
  const s=selection(),input=[{exerciseKey:'custom-a',id:'a'},{exerciseKey:'custom-b',id:'b'}];
  assert.deepEqual(Array.from(s.ordered(input),item=>item.id),['a','b']);
});
