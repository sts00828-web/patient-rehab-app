/* Display-only clinician selection guidance. Does not change prescriptions or stored IDs. */
const ExerciseSelection = (()=>{
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
  return {summary,overlaps,warnings};
})();
