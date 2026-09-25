/* Shared fail-closed rules for storage, sharing, printing and patient actions. */
(function(root,factory){const api=factory(typeof module!=='undefined'&&module.exports?require('./clinical-catalog.js'):root.ClinicalCatalog);if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ClinicalRules=api;})(globalThis,function(catalog){
  'use strict';
  const str=v=>typeof v==='string'?v.trim().slice(0,1000):'';
  const num=v=>Number.isFinite(v)&&v>0?v:null;
  const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v?v:null;
  const definition=ex=>{const id=(ex.exerciseKey||'').replace(/^v02_/,'');return Object.hasOwn(catalog.definitions,id)?catalog.definitions[id]:undefined;};
  const categoryById=id=>Object.hasOwn(catalog.categories,id)?catalog.categories[id]:undefined;
  const isNew=ex=>(ex.exerciseKey||'').startsWith('v02_');
  function normalize(raw){
    const r=raw&&typeof raw==='object'?raw:{},a=r.clinical||{},p=r.patient||{};
    return {version:str(r.version)||'0.2',categoryId:str(r.categoryId),revision:str(r.revision),
      clinical:{approved:a.approved===true,reviewer:str(a.reviewer),date:date(a.date)},
      patient:{confirmed:p.confirmed===true,reviewer:str(p.reviewer),date:date(p.date),patientId:str(p.patientId)},
      side:str(r.side),reps:num(r.reps),sets:num(r.sets),holdSeconds:num(r.holdSeconds),holdNotApplicable:r.holdNotApplicable===true,restSeconds:num(r.restSeconds),sessionsPerDay:num(r.sessionsPerDay),daysPerWeek:num(r.daysPerWeek),
      doseUnit:str(r.doseUnit),amountBasis:str(r.amountBasis),load:str(r.load),rom:str(r.rom),support:str(r.support),constraints:str(r.constraints),
      imageCompatible:r.imageCompatible===true,imageId:str(r.imageId),imageSha256:str(r.imageSha256),supervised:r.supervised===true,
      sportPlan:str(r.sportPlan),extraReason:str(r.extraReason),postoperative:typeof r.postoperative==='boolean'?r.postoperative:null,
      surgery:Object.fromEntries(['name','date','site','prohibited','rom','weightBearing','resistance','confirmedDate','instructor','protocol'].map(k=>[k,str(r.surgery?.[k])])),
      gates:Object.fromEntries(Object.entries(r.gates||{}).filter(([k])=>/^G[1-8]$/.test(k)).map(([k,v])=>[k,{status:['allowed','not_applicable','denied'].includes(v?.status)?v.status:'pending',details:str(v?.details)}]))};
  }
  function requiredGates(ex){
    const d=definition(ex),r=normalize(ex.clinicalV02),c=categoryById(r.categoryId);
    return [...new Set(((d?.gates||'')+' '+(c?.notes||'')).match(/G[1-8]/g)||[])];
  }
  function issues(ex){
    if(!isNew(ex))return [];
    const d=definition(ex),r=normalize(ex.clinicalV02),out=[];
    if(!d)return ['未対応の運動ID'];
    if(!d.image)out.push(d.assetStatus);
    if(!r.clinical.approved||!r.clinical.reviewer||!r.clinical.date)out.push('本文・量の案・画像の臨床承認');
    if(!r.patient.confirmed||!r.patient.reviewer||!r.patient.date||!r.patient.patientId)out.push('担当PTの個別処方確認');
    if(!r.revision)out.push('処方版');
    if(r.version!=='0.2')out.push('未対応の仕様版');
    const category=categoryById(r.categoryId);
    if(!category||!Object.values(category.levels).some(ids=>ids.includes(d.id)))out.push('疾患と運動の対応');
    for(const k of ['side','reps','sets','sessionsPerDay','daysPerWeek','doseUnit','load','rom','support','constraints'])if(!r[k])out.push('個別値：'+k);
    if(!['right','left','bilateral','alternating','none'].includes(r.side))out.push('指定側の形式');
    if(!['回','歩','分','呼吸'].includes(r.doseUnit)||!['total','per_side','each_side'].includes(r.amountBasis))out.push('量の単位・片側/合計の指定');
    if(!Array.isArray(ex.dows)||ex.dows.length!==r.daysPerWeek||ex.scheduleConfirmed!==true)out.push('実施曜日と週の頻度の確認');
    if(r.daysPerWeek>7||r.sessionsPerDay>24)out.push('頻度の範囲');
    if(!r.holdSeconds&&!r.holdNotApplicable)out.push('保持時間、または保持なしの明示確認');
    if(!Number.isInteger(r.sets)||!Number.isInteger(r.daysPerWeek)||!Number.isInteger(r.sessionsPerDay))out.push('セット・頻度は整数で指定');
    if(!r.imageCompatible||r.imageId!==d.image||r.imageSha256!==d.sha256||r.side==='left')out.push('指定側・支持・許可範囲と画像の整合（左専用画像未検証）');
    if(ex.mediaDisabled)out.push('画像非表示：初回指導の確認が必要');
    if(r.postoperative===null)out.push('保存療法／術後の確認');
    if(r.postoperative)for(const [k,v] of Object.entries(r.surgery))if(!v)out.push('術後指示：'+k);
    for(const g of requiredGates(ex)){
      const v=r.gates[g];
      const mandatory=(d.gates.split('+').includes(g))||(category?.notes.includes(g));
      if(!v?.details||!(v.status==='allowed'||(!mandatory&&v.status==='not_applicable')))out.push(g+'：'+catalog.gates[g]);
    }
    if(d.gates.includes('G7')&&(!r.supervised||!r.sportPlan||!r.restSeconds))out.push('監督下動作確認・競技量/速度/場所/休息の個別計画');
    return out;
  }
  function assertPrescribable(items,patientId){
    for(const ex of items){const errors=issues(ex);if(isNew(ex)&&patientId&&normalize(ex.clinicalV02).patient.patientId!==patientId)errors.push('別患者への処方確認は流用できません');if(errors.length)throw Error(ex.name+'：'+errors.join('、'));}
    if(items.length>6&&items.some(isNew)&&!items.filter(isNew).every(ex=>normalize(ex.clinicalV02).extraReason))throw Error('6種を超える処方の理由を入力してください。');
  }
  function imagePath(ex,preview=false){const d=definition(ex);return d&&d.image&&!ex.mediaDisabled&&(preview||issues(ex).length===0)?d.image:null;}
  function prescription(raw){const r=normalize(raw),basis={total:'合計',per_side:'指定側につき',each_side:'左右各'};return {side:({right:'右',left:'左',bilateral:'両側',alternating:'左右交互',none:'左右指定なし'})[r.side]||'',repetitions:r.reps&&r.doseUnit?`${r.reps}${r.doseUnit}（${basis[r.amountBasis]||'片側/合計未確認'}）`:'',sets:r.sets?`${r.sets}セット`:'',hold:r.holdSeconds?`${r.holdSeconds}秒`:r.holdNotApplicable?'保持なし（PT確認）':'',frequency:r.sessionsPerDay&&r.daysPerWeek?`1日${r.sessionsPerDay}回・週${r.daysPerWeek}日`:'',load:[r.load,r.rom].filter(Boolean).join('／'),support:r.support};}
  return {normalize,definition,isNew,requiredGates,issues,assertPrescribable,imagePath,prescription};
});
