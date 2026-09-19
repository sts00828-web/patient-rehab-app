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
    const diseaseNote=disease.prescriptionNote||'';
    // Keep disease restrictions separate from the clinician's individual instructions.
    // Exercise cautions are displayed directly from the library, without copying them.
    if(diseaseNote.length>500)throw Error('疾患の注意文は500文字以内にしてください。');
    return {name:exercise.name,params:exercise.params,note:disease.selectionNote||'',diseaseNote,exerciseKey,dows:[]};
  });
}
