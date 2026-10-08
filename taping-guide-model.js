/* Pure viewing state. No storage, patient records, or application mutations. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TapingGuideModel=api;})(globalThis,function(){
 'use strict';
 const own=(o,k)=>!!o&&Object.prototype.hasOwnProperty.call(o,k);
 function keys(step){return [...new Set([...(Array.isArray(step?.illustration)?step.illustration:[step?.illustration]),...(step?.alternateIllustrations||[])])].filter(x=>typeof x==='string'&&x);}
 function group(step){if(step.optionGroup)return step.optionGroup;if(!step.optional)return null;if(/^medial-2-/.test(step.id))return 'second-medial-lock';return step.id;}
 function groups(p){const result=new Map((p.optionGroups||[]).map(x=>[x.id,{...x,dependsOn:x.dependsOn||[]}]));for(const s of p.steps||[]){const id=group(s);if(id&&!result.has(id))result.set(id,{id,label:s.phase,dependsOn:id==='closeout-shin-5'?['closeout-shin-4']:[]});}return [...result.values()];}
 function choicesIssue(p,choices){if(!Array.isArray(choices))return '担当者による任意工程の選択を確認してください。';const gs=groups(p),allowed=new Set(gs.map(x=>x.id)),selected=new Set(choices);if(choices.some(x=>!allowed.has(x)))return '任意工程の指定がこのガイドと一致しません。';if(gs.some(g=>selected.has(g.id)&&g.dependsOn.some(id=>!selected.has(id))))return '任意工程の順序を担当者と確認してください。';return '';}
 function selectedSteps(p,choices){if(choicesIssue(p,choices))return [];const set=new Set(choices),variantKey=[...set].sort().join('|');let selected=p.steps.filter(s=>!group(s)||set.has(group(s)));if(Array.isArray(p.branchManifest)){const matches=p.branchManifest.filter(b=>Array.isArray(b.groups)&&[...b.groups].sort().join('|')===variantKey);if(matches.length!==1)return [];const branch=matches[0],byId=new Map(p.steps.map(s=>[s.id,s]));if(!Array.isArray(branch.stepIds)||!branch.stepIds.length||new Set(branch.stepIds).size!==branch.stepIds.length||branch.stepIds.some(id=>!byId.has(id)))return [];selected=branch.stepIds.map(id=>byId.get(id));}return selected.map(s=>{if(s.optionSensitive){const variant=s.variants?.[variantKey];return variant?{...s,...variant}:{...s,illustration:null,alternateIllustrations:[],variantMissing:true};}return s;});}
 function reviewIssue(p){
  if(!p||p.reviewStatus!=='verified'||!Array.isArray(p.steps)||!p.steps.length)return '工程図の確認が未完了です。担当者の対面指導を優先してください。';
  const ids=new Set();for(const s of p.steps){const ks=keys(s);if(!s.id||ids.has(s.id)||!s.action||!s.phase||!ks.length)return '工程データの確認が未完了です。';ids.add(s.id);for(const variant of [s,...Object.values(s.variants||{})]){const variantKeys=keys(variant);if(!variantKeys.length)return '工程図の確認が未完了です。';for(const k of variantKeys){if(!own(p.illustrations,k))return '工程図の確認が未完了です。';const a=p.illustrations[k];if(!a||a.reviewStatus!=='verified'||typeof a.image!=='string'||!/^images\/[a-zA-Z0-9_./-]+\.webp$/.test(a.image)||a.image.split('/').includes('..')||!a.view)return '工程図の確認が未完了です。';}}}
  return '';
 }
 function patientIssue(p,ex,patientId){const issue=reviewIssue(p);if(issue)return issue;if(typeof patientId!=='string'||!patientId.trim()||ex?.clinicalV02?.patient?.patientId!==patientId)return 'この方への処方を確認してください。';if(ex.clinicalV02?.side!=='right')return 'この工程図は右足専用です。左足へ読み替えず担当者に確認してください。';return '';}
 function signature(p,ex,patientId){return JSON.stringify([p.version,patientId,ex]);}
 function createSession(p,choices,{index=0}={}){
  const issue=choicesIssue(p,choices);if(issue)throw Error(issue);const steps=selectedSteps(p,choices);if(!steps.length)throw Error('対象工程がありません。');
  let at=Number.isInteger(index)&&index>=0&&index<steps.length?index:0,view=0,epoch=0,disposed=false;const seen=new Map();
  const step=()=>steps[at],viewKeys=()=>keys(step());
  const ready=()=>viewKeys().length>0&&viewKeys().every(k=>seen.get(step().id)?.has(k));
  function ticket(){const key=viewKeys()[view];seen.get(step().id)?.delete(key);return {epoch:++epoch,stepId:step().id,key};}
  function accept(t,ok){if(disposed||t.epoch!==epoch||t.stepId!==step().id||t.key!==viewKeys()[view])return false;let set=seen.get(t.stepId);if(!set){set=new Set();seen.set(t.stepId,set);}if(ok)set.add(t.key);else set.delete(t.key);return true;}
  return {steps,step,viewKeys,ready,ticket,accept,get index(){return at;},get viewIndex(){return view;},get currentKey(){return viewKeys()[view];},
   acceptVisible(t,key,ok){if(disposed||t.epoch!==epoch||t.stepId!==step().id||t.key!==viewKeys()[view]||!viewKeys().includes(key))return false;let set=seen.get(t.stepId);if(!set){set=new Set();seen.set(t.stepId,set);}if(ok)set.add(key);else set.delete(key);return true;},
   move(delta){if(disposed||![-1,1].includes(delta)||(delta===1&&!ready()))return false;const n=at+delta;if(n<0||n>=steps.length)return false;at=n;view=0;epoch++;return true;},
   jump(n,{staff=false}={}){if(disposed||!staff||!Number.isInteger(n)||n<0||n>=steps.length)return false;at=n;view=0;epoch++;return true;},
   switchView(n){if(disposed||!Number.isInteger(n)||n<0||n>=viewKeys().length)return false;view=n;epoch++;return true;},
   resetCurrent(){seen.delete(step().id);epoch++;},dispose(){disposed=true;epoch++;}
  };
 }
 return {keys,group,groups,choicesIssue,selectedSteps,reviewIssue,patientIssue,signature,createSession};
});
