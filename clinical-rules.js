/* Shared fail-closed rules for storage, sharing, printing and patient actions. */
(function(root,factory){const api=factory(typeof module!=='undefined'&&module.exports?require('./clinical-catalog.js'):root.ClinicalCatalog);if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ClinicalRules=api;})(globalThis,function(catalog){
  'use strict';
  const str=v=>typeof v==='string'?v.trim().slice(0,1000):'';
  const num=v=>Number.isFinite(v)&&v>0?v:null;
  const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v?v:null;
  const definition=ex=>{const id=(ex.exerciseKey||'').replace(/^v02_/,'');return Object.hasOwn(catalog.definitions,id)?catalog.definitions[id]:undefined;};
  const patientCautionOverrides={
    T11:'腰が反る前に止めてください。姿勢を保つのが難しい場合は、仰向けの足踏みに戻してください。',
    K04:'膝が曲がってしまう場合は、太ももに力を入れる運動や、椅子で膝を伸ばす運動に変更してください。腰痛が増す場合は中止してください。',
    E07:'手首を上げる運動の代わりに行います。両方を行う必要はありません。'
  };
  const patientStepOverrides={
    S17:['ゴムを両手で持ち、左手を固定します。右肘を体側に保ち、右手を外へ動かします。','担当者が選んだ強さのゴムを使います。'],
    N05:['仰向けで頭を支え、小さく「はい」とうなずきます。','同じ姿勢でもう一度小さくうなずき、その位置を短く保ちます。'],
    K12:['椅子に座り、右膝をゆっくり伸ばして戻します。','指定された足首の重りをつけて、膝をゆっくり伸ばし、戻します。'],
    E10:['前腕を机に置き、軽い重りを持って手首を上げ、ゆっくり下ろします。','担当者が決めた重さを使い、手首を上げてゆっくり下ろします。']
  };
  function patientText(value){
    let text=str(value);if(!text)return '';
    text=text.replace(/([STNKEAP]\d{2})/g,(match,id)=>catalog.definitions[id]?.name||match)
      .replace(/医師\s*[／/]\s*PT/g,'医師または理学療法士')
      .replace(/担当PT/g,'担当の理学療法士').replace(/\bPT\b/g,'理学療法士')
      .replace(/処方の指示/g,'画面に表示された指示').replace(/処方指定/g,'担当者が指定した内容')
      .replace(/未許可期不可/g,'担当者から許可されるまでは行わないでください')
      .replace(/要評価/g,'担当者への確認が必要です')
      .replace(/除外して/g,'ないことを確認して').replace(/除外し/g,'ないことを確認し').replace(/除外/g,'ないことを確認')
      .replace(/代替候補/g,'代わりの運動');
    return text;
  }
  function patientCaution(ex,legacyMedia){const d=isNew(ex)?definition(ex):legacyMedia;return patientText(patientCautionOverrides[d?.id]||d?.caution);}
  const isSelectable=id=>Object.hasOwn(catalog.definitions,id)&&catalog.definitions[id].status!=='retired';
  const categoryById=id=>Object.hasOwn(catalog.categories,id)?catalog.categories[id]:undefined;
  const isNew=ex=>(ex.exerciseKey||'').startsWith('v02_');
  // Explicit authoring table: ranges use their lower endpoint as an editable proposal.
  // Patient permissions are never inferred from these numbers.
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
    S:'S16 K01 E04', I:'S05 S06 S07 N06 N07 K03 E01 E05 A03 A04 N12',
    M:'S09 S10 S11 S12 S13 S14 S15 S17 S20 S21 S22 S24 S25 T08 T13 T14 T19 K04 K05 K06 K07 K08 K09 K10 K12 K13 K14 K15 K16 K17 K18 K19 E06 E07 E08 E10 A05 A07 S30 S37 K26 A11 A13',
    B:'K11 K24 A08 A09 A15', C:'S18 S26 T01 T06 T07 T09 T10 T11 T12 T20 T21 T22 T23 N01 N04 N05 N08 N09 N10 K23 E09 A10 T25 T26',
    W:'K20 K21 K22 K38',P:'P01 P02 P03 P04 P05 P06 P07 P08 P09 P10 P12 P13'
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
    P07:{reps:3,doseUnit:'本',sets:1},P08:{reps:3,doseUnit:'回',sets:1},P09:{reps:1.5,doseUnit:'分',sets:3},P10:{reps:3,doseUnit:'回',sets:1},
    // Selected additions are editable starting proposals, not clinical approvals.
    S30:{amountBasis:'per_side'},S37:{reps:5,amountBasis:'total'},
    N12:{daysPerWeek:5,restSeconds:10,amountBasis:'each_direction',doseDirections:'前・後ろ'},
    T25:{reps:3,holdSeconds:10,restSeconds:30,amountBasis:'total'},T26:{reps:3,holdSeconds:10,restSeconds:30,amountBasis:'total'},
    K26:{amountBasis:'per_side'},K38:{reps:3,sets:2,doseUnit:'分',restSeconds:0,amountBasis:'total'},
    A11:{amountBasis:'per_side'},A13:{amountBasis:'per_side'},A15:{reps:3,holdSeconds:null,restSeconds:30,amountBasis:'each_direction',doseDirections:'前・横・後ろ'},
    P12:{reps:6,sets:2,doseUnit:'回',restSeconds:60,amountBasis:'total'},
    P13:{reps:3,sets:2,doseUnit:'回',holdSeconds:2,restSeconds:60,amountBasis:'each_side'}
  };
  function doseDraft(id){
    const d=catalog.definitions[id],preset=dosePresetById[id];if(!isSelectable(id)||!preset)return null;
    const details={E07:'下降は約3秒',P07:'距離・速度は個別計画で確定（距離案は5m程度）',P09:'1セットは歩行1分＋軽走30秒',K38:'1セット＝早歩き1分＋普通歩き2分',P12:'片道の着地で1回。原則48時間程度あけ、競技練習の跳躍量と合算',P13:'距離・速度は担当者指定。原則48時間程度あけ、競技練習の跳躍量と合算'};
    return {...dosePresets[preset],...doseOverrides[id],support:d.equipment,doseDetail:details[id]||''};
  }
  function normalize(raw){
    const r=raw&&typeof raw==='object'?raw:{},a=r.clinical||{},p=r.patient||{};
    const doseNum=v=>r.mode==='simple'&&typeof v==='number'?v:num(v);
    return {...(r.mode==='simple'?{mode:'simple'}:{}),version:str(r.version)||'0.2',categoryId:str(r.categoryId),revision:str(r.revision),
      clinical:{approved:a.approved===true,reviewer:str(a.reviewer),date:date(a.date)},
      patient:{confirmed:p.confirmed===true,reviewer:str(p.reviewer),date:date(p.date),patientId:str(p.patientId)},
      side:str(r.side),reps:doseNum(r.reps),sets:doseNum(r.sets),holdSeconds:doseNum(r.holdSeconds),holdNotApplicable:r.holdNotApplicable===true,restSeconds:r.restSeconds===0?0:doseNum(r.restSeconds),sessionsPerDay:doseNum(r.sessionsPerDay),daysPerWeek:doseNum(r.daysPerWeek),
      doseUnit:str(r.doseUnit),doseDetail:str(r.doseDetail),doseDirections:str(r.doseDirections),amountBasis:str(r.amountBasis),load:str(r.load),rom:str(r.rom),support:str(r.support),constraints:str(r.constraints),
      imageCompatible:r.imageCompatible===true,imageId:str(r.imageId),imageSha256:str(r.imageSha256),supervised:r.supervised===true,
      sportPlan:str(r.sportPlan),extraReason:str(r.extraReason),postoperative:typeof r.postoperative==='boolean'?r.postoperative:null,
      surgery:Object.fromEntries(['name','date','site','prohibited','rom','weightBearing','resistance','confirmedDate','instructor','protocol'].map(k=>[k,str(r.surgery?.[k])])),
      gates:Object.fromEntries(Object.entries(r.gates||{}).filter(([k])=>/^G[1-8]$/.test(k)).map(([k,v])=>[k,{status:['allowed','not_applicable','denied'].includes(v?.status)?v.status:'pending',details:str(v?.details)}]))};
  }
  // Exceptions reflect explicit bilateral/alternating movements in the unchanged catalog text.
  const sideExceptions={
    bilateral:'S08 S12 S13 S14 S20 S22 T08 T14 T19 N08 N10 K06 K07 K08 A05 P01 P04 P06 S37 P12',
    alternating:'T05 T06 T07 T11 N02 K10 K17 K23 A10 P13',
    none:'T01 T02 T03 T10 T15 T17 T18 T21 N01 N04 N05 N09 K20 K21 K22 K24 P07 P08 P09 N12 T25 T26 K38'
  };
  function initialSide(id,affectedSide){return Object.keys(sideExceptions).find(side=>sideExceptions[side].split(' ').includes(id))||(['right','left','bilateral','none'].includes(affectedSide)?affectedSide:'');}
  // Only these catalog procedures use the right side as a unilateral example.
  // Bilateral/alternating procedures are deliberately excluded; source text stays intact.
  const rightExampleIds=new Set('S01 S02 S03 S04 S06 S07 S09 S10 S11 S15 S16 S17 S18 S19 S21 S24 S25 S26 T04 K01 K02 K04 K05 K09 K11 K12 K13 K15 K16 K18 K19 E01 E04 E05 E07 A04 A06 A07 A08 P05 S30 K26 A11 A13 A15'.split(' '));
  function patientSteps(ex,legacyMedia){
    const d=isNew(ex)?definition(ex):legacyMedia,steps=[...(patientStepOverrides[d?.id]||d?.steps||[])];
    if(!isNew(ex)||!rightExampleIds.has(d?.id))return steps.map(patientText);
    const side=ex.clinicalV02?.side;
    // One pass swaps both working and assisting sides, preserving words such as 左右.
    if(side==='left')return steps.map(step=>patientText(step.replace(/左右|右左|[左右]/g,word=>word==='右'?'左':word==='左'?'右':word)));
    if(side!=='right'&&steps.length)steps[0]='手順は右側を例に説明しています。実施側は処方の指示に従ってください。'+steps[0];
    return steps.map(patientText);
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
    if(r.mode!=='simple'&&(!r.clinical.approved||!r.clinical.reviewer||!r.clinical.date))out.push('本文・量の案・画像の臨床承認');
    if(r.mode!=='simple'&&(!r.patient.confirmed||!r.patient.reviewer||!r.patient.date||!r.patient.patientId))out.push('担当PTの個別処方確認');
    for(const k of ['reps','sets','holdSeconds','restSeconds','sessionsPerDay','daysPerWeek'])if(r[k]!==null&&(!Number.isFinite(r[k])||Math.abs(r[k])>Number.MAX_SAFE_INTEGER||(k==='restSeconds'?r[k]<0:r[k]<=0)))out.push('不正な数値：'+k);
    if(!r.revision)out.push('処方版');
    if(r.version!=='0.2')out.push('未対応の仕様版');
    const category=categoryById(r.categoryId);
    if(!category||!Object.values(category.levels).some(ids=>ids.includes(d.id)))out.push('疾患と運動の対応');
    for(const k of (r.mode==='simple'?['side','reps','sets','sessionsPerDay','daysPerWeek','doseUnit']:['side','reps','sets','sessionsPerDay','daysPerWeek','doseUnit','load','rom','support','constraints']))if(!r[k])out.push('個別値：'+k);
    if(!['right','left','bilateral','alternating','none'].includes(r.side))out.push('指定側の形式');
    if(!['回','歩','秒','分','呼吸','本'].includes(r.doseUnit)||!['total','per_side','each_side','each_direction','round_trip'].includes(r.amountBasis))out.push('量の単位・片側/合計の指定');
    if(r.amountBasis==='each_direction'&&!r.doseDirections)out.push('各方向の指定');
    if(r.amountBasis==='round_trip'&&r.doseUnit!=='歩')out.push('往復量の単位は歩');
    if(r.amountBasis!=='each_direction'&&(r.doseDirections||/各方向/.test(r.doseDetail)))out.push('各方向と量の基準の不一致');
    if(/往復/.test(r.doseDetail))out.push('往復量は片道の歩数と往復の基準で指定');
    if(r.daysPerWeek>7||r.sessionsPerDay>24)out.push('頻度の範囲');
    if(!Number.isInteger(r.sets)||!Number.isInteger(r.daysPerWeek)||!Number.isInteger(r.sessionsPerDay))out.push('セット・頻度は整数で指定');
    if(ex.scheduleMode==='flexible'){
      if(!Array.isArray(ex.dows)||ex.dows.length)out.push('曜日を指定しない運動に固定曜日は設定できません');
    }else if(!Array.isArray(ex.dows)||ex.dows.some(v=>!Number.isInteger(v)||v<0||v>6)||new Set(ex.dows).size!==ex.dows.length||ex.dows.length!==r.daysPerWeek||ex.scheduleConfirmed!==true)out.push('実施曜日と週の頻度の確認');
    if(r.mode!=='simple'&&!r.holdSeconds&&!r.holdNotApplicable)out.push('保持時間、または保持なしの明示確認');
    if(ex.mediaDisabled)out.push('画像非表示：初回指導の確認が必要');
    if(r.mode!=='simple'){
      if(!r.imageCompatible||r.imageId!==d.image||r.imageSha256!==d.sha256||r.side==='left')out.push('指定側・支持・許可範囲と画像の整合（左専用画像未検証）');
      if(r.postoperative===null)out.push('保存療法／術後の確認');
      if(r.postoperative)for(const [k,v] of Object.entries(r.surgery))if(!v)out.push('術後指示：'+k);
      for(const g of requiredGates(ex)){
        const v=r.gates[g];
        const mandatory=(d.gates.split('+').includes(g))||(category?.notes.includes(g));
        if(!v?.details||!(v.status==='allowed'||(!mandatory&&v.status==='not_applicable')))out.push(g+'：'+catalog.gates[g]);
      }
      if(d.gates.includes('G7')&&(!r.supervised||!r.sportPlan||!r.restSeconds))out.push('監督下動作確認・競技量/速度/場所/休息の個別計画');
    }
    return out;
  }
  function assertPrescribable(items,patientId){
    for(const ex of items){const errors=issues(ex);if(isNew(ex)&&patientId&&normalize(ex.clinicalV02).patient.patientId!==patientId)errors.push('別患者への処方確認は流用できません');if(errors.length)throw Error(ex.name+'：'+errors.join('、'));}
  }
  function imagePath(ex,preview=false){const d=definition(ex);return d&&d.image&&!ex.mediaDisabled&&(preview||issues(ex).length===0)?d.image:null;}
  function prescription(raw){const r=normalize(raw),basis={total:'合計',per_side:'指定側につき',each_side:'左右各',each_direction:`${r.doseDirections||'方向未指定'}の各方向`,round_trip:'往復'};return {side:({right:'右',left:'左',bilateral:'両側',alternating:'左右交互',none:'左右指定なし'})[r.side]||'',repetitions:r.reps&&r.doseUnit?(r.amountBasis==='round_trip'?`1セット＝片道${r.reps}${r.doseUnit}の往復（計${r.reps*2}${r.doseUnit}）`:`${r.reps}${r.doseUnit}（${basis[r.amountBasis]||'片側/合計未確認'}）`)+(r.doseDetail?'／'+r.doseDetail:''):'',sets:r.sets?`${r.sets}セット`:'',hold:r.holdSeconds?`${r.holdSeconds}秒`:r.mode==='simple'?'保持設定なし':r.holdNotApplicable?'保持なし（PT確認）':'',frequency:r.sessionsPerDay&&r.daysPerWeek?`1日${r.sessionsPerDay}回・週${r.daysPerWeek}日`:'',load:[r.load,r.rom].filter(Boolean).join('／'),support:r.support};}
  function weekdayDraft(days){return [...({1:[1],2:[1,4],3:[1,3,5],4:[1,2,4,6],5:[1,2,3,4,5],6:[1,2,3,4,5,6],7:[0,1,2,3,4,5,6]}[days]||[])];}
  function initialDose(id,saved){
    const draft=doseDraft(id);if(!draft)return null;
    const source=saved?.clinicalV02||{},clean=normalize(source);
    for(const k of ['reps','sets','holdSeconds','restSeconds','sessionsPerDay','daysPerWeek','doseUnit','doseDetail','doseDirections','amountBasis','support']){
      const v=clean[k];if(v===null||v===''||v===undefined)continue;
      if(['sets','sessionsPerDay','daysPerWeek'].includes(k)&&!Number.isInteger(v))continue;
      if(k==='daysPerWeek'&&v>7||k==='sessionsPerDay'&&v>24)continue;
      if(k==='doseUnit'&&!['回','秒','歩','分','呼吸','本'].includes(v))continue;
      if(k==='amountBasis'&&!['total','per_side','each_side','each_direction','round_trip'].includes(v))continue;
      draft[k]=v;
    }
    const days=saved?.dows,valid=Array.isArray(days)&&days.length>0&&days.every(d=>Number.isInteger(d)&&d>=0&&d<7)&&new Set(days).size===days.length;
    return {clinicalV02:draft,dows:valid?[...days]:weekdayDraft(draft.daysPerWeek)};
  }
  return {patientText,patientCaution,patientSteps,initialSide,normalize,definition,isSelectable,isNew,requiredGates,issues,assertPrescribable,imagePath,prescription,doseDraft,initialDose,weekdayDraft,dosePresetById,doseOverrides};
});
