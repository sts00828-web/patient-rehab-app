/* Disease membership is independent of an exercise's original region. */
function getDiseaseExerciseKeys(key) {
  const disease=DISEASE_LIBRARY[key];
  if(!disease)throw Error('疾患候補が見つかりません。');
  const keys=disease.exerciseKeys===undefined
    ? Object.keys(EXERCISE_LIBRARY).filter(id=>EXERCISE_LIBRARY[id].region===key)
    : disease.exerciseKeys;
  if(!Array.isArray(keys)||!keys.length||keys.length>60||new Set(keys).size!==keys.length||keys.some(id=>!Object.hasOwn(EXERCISE_LIBRARY,id)))throw Error('疾患の運動候補が不正です。');
  return [...keys];
}
function getDiseaseExerciseMenu(key) {
  const disease=DISEASE_LIBRARY[key];
  return getDiseaseExerciseKeys(key).map(exerciseKey=>{
    const exercise=EXERCISE_LIBRARY[exerciseKey];
    const note=[exercise.caution,disease.prescriptionNote].filter(Boolean).join('\n');
    // Core limits notes to 500 characters. Never silently lose a disease restriction.
    if(note.length>500)throw Error('疾患の注意文は種目の注意と合わせて500文字以内にしてください。');
    return {name:exercise.name,params:exercise.params,note,exerciseKey,dows:[]};
  });
}
