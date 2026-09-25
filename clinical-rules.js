/* Shared fail-closed rules for storage, sharing, printing and patient actions. */
(function(root,factory){const api=factory(typeof module!=='undefined'&&module.exports?require('./clinical-catalog.js'):root.ClinicalCatalog);if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ClinicalRules=api;})(globalThis,function(catalog){
  'use strict';
  const str=v=>typeof v==='string'?v.trim().slice(0,1000):'';
  const num=v=>Number.isFinite(v)&&v>0?v:null;
  const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v?v:null;
  const definition=ex=>{const id=(ex.exerciseKey||'').replace(/^v02_/,'');return Object.hasOwn(catalog.definitions,id)?catalog.definitions[id]:undefined;};
  const isSelectable=id=>Object.hasOwn(catalog.definitions,id)&&catalog.definitions[id].status!=='retired';
  const categoryById=id=>Object.hasOwn(catalog.categories,id)?catalog.categories[id]:undefined;
  const isNew=ex=>(ex.exerciseKey||'').startsWith('v02_');
  // Explicit authoring table: ranges use their lower endpoint as an editable proposal.
  // Neither patient permissions nor weekdays are inferred from these numbers.
  const dosePresets={
    R:{reps:5,sets:1,doseUnit:'回',sessionsPerDay:1,daysPerWeek:7},
    S:{reps:2,sets:1,doseUnit:'回',holdSeconds:10,sessionsPerDay:1,daysPerWeek:7},
    I:{reps:5,sets:1,doseUnit:'回',holdSeconds:5,sessionsPerDay:1,daysPerWeek:7},
    M:{reps:8,sets:1,doseUnit:'回',sessionsPerDay:1,daysPerWeek:2,restSeconds:60},
    B:{reps:3,sets:1,doseUnit:'回',holdSeconds:10,sessionsPerDay:1,daysPerWeek:3},
    C:{reps:5,sets:1,doseUnit:'回',holdSeconds:5,sessionsPerDay:1,daysPerWeek:3},
    W:{reps:5,sets:1,doseUnit:'分',sessionsPerDay:1,daysPerWeek:3},
    P:{sessionsPerDay:1,daysPerWeek:2}
  };
  const doseGroups={
    R:'S01 S02 S03 S04 S08 S19 S23 T02 T03 T04 T05 T15 T16 T17 T18 N02 N03 K02 E02 E03 A01 A02 A06',
    S:'S16 K01 E04', I:'S05 S06 S07 N06 N07 K03 E01 E05 A03 A04',
    M:'S09 S10 S11 S12 S13 S14 S15 S17 S20 S21 S22 S24 S25 T08 T13 T14 T19 K04 K05 K06 K07 K08 K09 K10 K12 K13 K14 K15 K16 K17 K18 K19 E06 E07 E08 E10 A05 A07',
    B:'K11 K24 A08 A09', C:'S18 S26 T01 T06 T07 T09 T10 T11 T12 T20 T21 T22 T23 N01 N04 N05 N08 N09 N10 K23 E09 A10',
    W:'K20 K21 K22',P:'P01 P02 P03 P04 P05 P06 P07 P08 P09 P10'
  };
  const dosePresetById=Object.fromEntries(Object.entries(doseGroups).flatMap(([preset,ids])=>ids.split(' ').map(id=>[id,preset])));
  const doseOverrides={
    S01:{reps:20,doseUnit:'秒',sets:2}, S08:{reps:5}, S18:{holdSeconds:null,amountBasis:'each_direction',doseDirections:'上・下・左・右'},
    S22:{reps:10,doseUnit:'秒',sets:2},S25:{reps:5},S26:{reps:3},
    T01:{reps:5,doseUnit:'呼吸',sets:2,holdSeconds:null},T06:{holdSeconds:null},T07:{holdSeconds:null},
    T09:{reps:3},T10:{holdSeconds:null},T11:{reps:3,holdSeconds:null},T12:{reps:3},T13:{reps:5},
    T19:{reps:10,doseUnit:'秒',sets:2},T20:{holdSeconds:null},T21:{reps:5,doseUnit:'呼吸',sets:2,holdSeconds:null},T22:{holdSeconds:null},T23:{holdSeconds:null},
    N01:{reps:5,doseUnit:'呼吸',sets:2,holdSeconds:null},N04:{holdSeconds:3},N08:{holdSeconds:null},N09:{reps:3},N10:{holdSeconds:null},
    K04:{reps:5},K06:{reps:5},K09:{reps:5},K10:{reps:5,doseUnit:'歩',sets:2,amountBasis:'each_direction',doseDirections:'左右'},K13:{reps:5},K14:{reps:5},K15:{reps:5},K16:{reps:5},K17:{reps:5,doseUnit:'歩',sets:2,amountBasis:'each_direction',doseDirections:'左右'},K18:{reps:5},
    K21:{reps:3},K22:{reps:1,sets:3,restSeconds:60},K23:{holdSeconds:null},K24:{reps:5,doseUnit:'歩',sets:2,holdSeconds:null,amountBasis:'round_trip'},
    E07:{reps:5},E08:{reps:5},A08:{reps:3,holdSeconds:null,amountBasis:'each_direction',doseDirections:'前・横・後ろ'},A09:{reps:5,holdSeconds:null},A10:{reps:10,holdSeconds:null},
    P01:{reps:5,doseUnit:'回',sets:2,restSeconds:60},P03:{reps:5,doseUnit:'回',sets:2,restSeconds:60},P04:{reps:5,doseUnit:'回',sets:2,restSeconds:60},
    P05:{reps:3,doseUnit:'回',sets:2,restSeconds:60},P06:{reps:3,doseUnit:'回',sets:2,holdSeconds:2,restSeconds:60},
    P07:{reps:3,doseUnit:'本',sets:1},P08:{reps:3,doseUnit:'回',sets:1},P09:{reps:1.5,doseUnit:'分',sets:3},P10:{reps:3,doseUnit:'回',sets:1}
  };
  function doseDraft(id){
    const d=catalog.definitions[id],preset=dosePresetById[id];if(!isSelectable(id)||!preset)return null;
    const details={E07:'下降は約3秒',P07:'距離・速度は個別計画で確定（距離案は5m程度）',P09:'1セットは歩行1分＋軽走30秒'};
    return {...dosePresets[preset],...doseOverrides[id],support:d.equipment,doseDetail:details[id]||''};
  }
  function normalize(raw){
    const r=raw&&typeof raw==='object'?raw:{},a=r.clinical||{},p=r.patient||{};
    return {version:str(r.version)||'0.2',categoryId:str(r.categoryId),revision:str(r.revision),
      clinical:{approved:a.approved===true,reviewer:str(a.reviewer),date:date(a.date)},
      patient:{confirmed:p.confirmed===true,reviewer:str(p.reviewer),date:date(p.date),patientId:str(p.patientId)},
      side:str(r.side),reps:num(r.reps),sets:num(r.sets),holdSeconds:num(r.holdSeconds),holdNotApplicable:r.holdNotApplicable===true,restSeconds:num(r.restSeconds),sessionsPerDay:num(r.sessionsPerDay),daysPerWeek:num(r.daysPerWeek),
      doseUnit:str(r.doseUnit),doseDetail:str(r.doseDetail),doseDirections:str(r.doseDirections),amountBasis:str(r.amountBasis),load:str(r.load),rom:str(r.rom),support:str(r.support),constraints:str(r.constraints),
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
    if(!isSelectable(d.id))return ['削除済みの運動は新規処方・再開できません'];
    if(!d.image)out.push(d.assetStatus);
    if(!r.clinical.approved||!r.clinical.reviewer||!r.clinical.date)out.push('本文・量の案・画像の臨床承認');
    if(!r.patient.confirmed||!r.patient.reviewer||!r.patient.date||!r.patient.patientId)out.push('担当PTの個別処方確認');
    if(!r.revision)out.push('処方版');
    if(r.version!=='0.2')out.push('未対応の仕様版');
    const category=categoryById(r.categoryId);
    if(!category||!Object.values(category.levels).some(ids=>ids.includes(d.id)))out.push('疾患と運動の対応');
    for(const k of ['side','reps','sets','sessionsPerDay','daysPerWeek','doseUnit','load','rom','support','constraints'])if(!r[k])out.push('個別値：'+k);
    if(!['right','left','bilateral','alternating','none'].includes(r.side))out.push('指定側の形式');
    if(!['回','歩','秒','分','呼吸','本'].includes(r.doseUnit)||!['total','per_side','each_side','each_direction','round_trip'].includes(r.amountBasis))out.push('量の単位・片側/合計の指定');
    if(r.amountBasis==='each_direction'&&!r.doseDirections)out.push('各方向の指定');
    if(r.amountBasis==='round_trip'&&r.doseUnit!=='歩')out.push('往復量の単位は歩');
    if(r.amountBasis!=='each_direction'&&(r.doseDirections||/各方向/.test(r.doseDetail)))out.push('各方向と量の基準の不一致');
    if(/往復/.test(r.doseDetail))out.push('往復量は片道の歩数と往復の基準で指定');
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
  function prescription(raw){const r=normalize(raw),basis={total:'合計',per_side:'指定側につき',each_side:'左右各',each_direction:`${r.doseDirections||'方向未指定'}の各方向`,round_trip:'往復'};return {side:({right:'右',left:'左',bilateral:'両側',alternating:'左右交互',none:'左右指定なし'})[r.side]||'',repetitions:r.reps&&r.doseUnit?(r.amountBasis==='round_trip'?`1セット＝片道${r.reps}${r.doseUnit}の往復（計${r.reps*2}${r.doseUnit}）`:`${r.reps}${r.doseUnit}（${basis[r.amountBasis]||'片側/合計未確認'}）`)+(r.doseDetail?'／'+r.doseDetail:''):'',sets:r.sets?`${r.sets}セット`:'',hold:r.holdSeconds?`${r.holdSeconds}秒`:r.holdNotApplicable?'保持なし（PT確認）':'',frequency:r.sessionsPerDay&&r.daysPerWeek?`1日${r.sessionsPerDay}回・週${r.daysPerWeek}日`:'',load:[r.load,r.rom].filter(Boolean).join('／'),support:r.support};}
  return {normalize,definition,isSelectable,isNew,requiredGates,issues,assertPrescribable,imagePath,prescription,doseDraft,dosePresetById,doseOverrides};
});
