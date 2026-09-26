/* Display-only clinician selection guidance. Does not change prescriptions or stored IDs. */
const ExerciseSelection = (()=>{
  const groups={stretch:'ストレッチ',mobility:'関節を動かす運動',strength:'筋力トレーニング',function:'立位・日常動作',custom:'その他の種目'};
  const stretches=new Set(['crossover','knee-to-chest','wrist-extensor-stretch','wrist-flexor-stretch']);
  const resistance=new Set(['band-row','shoulder-band-external','wrist-eccentric-extension','wrist-resisted-extension','resisted-forearm-turn']);
  const masterOrder=new Map(Object.keys(EXERCISE_LIBRARY).map((key,index)=>[key,index]));
  // Related movements should stay together.  The first item keeps the family's
  // position in the catalogue; the remaining items follow it in progression order.
  const relatedFamilies=[
    ['kneeling-plank','forearm-plank','side-plank','single-leg-plank','side-plank-leg-lift','plank-shoulder-tap'],
    ['v02_T25','v02_T09','v02_T26','v02_T12'],
    ['abdominal-brace','pelvic-tilt','bridge','bird-dog'],
    ['shoulder-isometric-external','shoulder-band-external','shoulder-isometric-internal','band-row'],
    ['wrist-active-extension','wrist-isometric-extension','wrist-eccentric-extension','wrist-resisted-extension','wrist-extensor-stretch'],
    ['sit-to-stand','mini-squat','split-squat','single-leg-squat']
  ];
  const familyOrder=new Map();
  for(const keys of relatedFamilies){
    const anchor=Math.min(...keys.map(key=>masterOrder.get(key)??999));
    keys.forEach((key,index)=>familyOrder.set(key,{anchor,index}));
  }
  function category(key){return stretches.has(key)?'stretch':EXERCISE_LIBRARY[key]?.category||'custom';}
  function loadOrder(key){return resistance.has(key)?2:key==='gentle-ball-grip'?1:0;}
  function compare(a,b){
    const categories=Object.keys(groups),ak=a.exerciseKey,bk=b.exerciseKey;
    const af=familyOrder.get(ak),bf=familyOrder.get(bk),aa=af?.anchor??masterOrder.get(ak)??999,ba=bf?.anchor??masterOrder.get(bk)??999;
    return categories.indexOf(category(ak))-categories.indexOf(category(bk))||loadOrder(ak)-loadOrder(bk)||aa-ba||(af?.index??0)-(bf?.index??0)||(masterOrder.get(ak)??999)-(masterOrder.get(bk)??999);
  }
  function ordered(items){return [...items].map((item,index)=>({item,index})).sort((a,b)=>compare(a.item,b.item)||a.index-b.index).map(row=>row.item);}
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function summary(exercise){
    if(!exercise)return '';
    const group=EXERCISE_CHOICE_GROUPS[exercise.choiceGroup];
    return `<div class="selection-note"><p><strong>位置づけ：</strong>${esc(exercise.clinicalRole||'個別に確認')}</p>${group?`<p><strong>同系統：</strong>${esc(group.name)} ／ ${esc(exercise.choiceVariant)}</p><p>${esc(group.note)}</p>`:''}</div>`;
  }
  function overlaps(keys){
    const groups=new Map();
    for(const key of new Set(keys)){
      const e=EXERCISE_LIBRARY[key],group=e&&EXERCISE_CHOICE_GROUPS[e.choiceGroup];
      if(!group)continue;
      if(!groups.has(e.choiceGroup))groups.set(e.choiceGroup,{id:e.choiceGroup,...group,exercises:[]});
      groups.get(e.choiceGroup).exercises.push({key,name:e.name});
    }
    return [...groups.values()].filter(group=>group.exercises.length>1);
  }
  function warnings(keys){
    const groups=overlaps(keys);
    if(!groups.length)return '';
    return `<div class="notice"><strong>同系統の種目を選択しています</strong><p>併用を禁止するものではありません。目的の違いと負荷の合計を確認してください。</p>${groups.map(group=>`<p><strong>${esc(group.name)}：</strong>${group.exercises.map(e=>esc(e.name)).join('、')}<br>${esc(group.note)}</p>`).join('')}</div>`;
  }
  return {summary,overlaps,warnings,groups,category,compare,ordered};
})();
