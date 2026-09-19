/* Therapist reference viewer. Never part of a patient prescription or share payload. */
const ExerciseEvidence = (() => {
  const guidelines = {
    ankleSprain: {title:'Ankle Stability and Movement Coordination Impairments: Lateral Ankle Ligament Sprains Revision',year:'2021',publisher:'APTA Orthopedics / JOSPT',url:'https://doi.org/10.2519/jospt.2021.0302',scope:'外側足関節捻挫・慢性足関節不安定症の評価と介入を扱います。内側・高位捻挫や術後へそのまま適用しません。個々の患者の荷重・運動開始許可を確認してください。'},
    shoulder: {title:'Shoulder Pain and Mobility Deficits: Adhesive Capsulitis',year:'2013',publisher:'APTA Orthopedics / JOSPT',url:'https://doi.org/10.2519/jospt.2013.0302',scope:'凍結肩の評価と介入を扱うガイドラインです。他の肩疾患や術後への適用は別に判断してください。'},
    lowback: {title:'Interventions for the Management of Acute and Chronic Low Back Pain: Revision 2021',year:'2021',publisher:'APTA Orthopedics / JOSPT',url:'https://doi.org/10.2519/jospt.2021.0304',scope:'急性・慢性腰痛の介入を扱います。患者の病態・症状に対応する推奨を原文で確認してください。'},
    knee: {title:'Osteoarthritis in over 16s: diagnosis and management (NG226)',year:'2022',publisher:'NICE',url:'https://www.nice.org.uk/guidance/ng226/chapter/Recommendations#therapeutic-exercise',scope:'1.3.1〜1.3.4：個人に合わせた筋力・有酸素運動などを扱います。このアプリの個別種目・回数を直接検証したものではありません。'},
    tennisElbow: {title:'Lateral Elbow Pain and Muscle Function Impairments',year:'2022',publisher:'APTA Orthopedics / JOSPT',url:'https://doi.org/10.2519/jospt.2022.0302',scope:'外側肘痛の評価と介入を扱います。病期・症状に適した負荷の選択は原文と患者評価に基づいて判断してください。'},
    cervicalSpondylosis: {title:'Neck Pain: Revision 2017',year:'2017',publisher:'APTA Orthopedics / JOSPT',url:'https://doi.org/10.2519/jospt.2017.0302',scope:'頸部痛の臨床分類に関する資料です。頸椎症という画像診断名だけで適用せず、神経症状などを含めて適用対象を確認してください。'}
  };
  const esc = value => String(value || '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link = (url,label) => {
    try { if(new URL(url).protocol !== 'https:')return '<p>参照URLが未登録です。</p>'; }
    catch { return '<p>参照URLが未登録です。</p>'; }
    return `<p><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a></p>`;
  };
  function html(ex,disease){
    const e=EXERCISE_LIBRARY[ex?.exerciseKey];
    const matches=e&&DISEASE_LIBRARY[disease]&&getDiseaseExerciseKeys(disease).includes(ex.exerciseKey);
    const g=matches&&(guidelines[disease]||guidelines[DISEASE_LIBRARY[disease]?.baseDisease]);
    const sources=matches?(DISEASE_LIBRARY[disease].sources||[]):[];
    return `<div class="evidence-content"><p class="hint">セラピスト向け参考情報。文献一覧は網羅的な検索結果ではありません。</p>
      <h3>運動方法の参考資料</h3>${e?`<p>${esc(e.name)}</p>${link(e.source,'運動マスターに登録された参考資料を開く')}<p class="hint">医療機関などの運動説明資料です。資料内の類似運動を参考としており、本アプリの説明・イラストとの完全一致や、この種目単独の有効性を保証するものではありません。</p>`:'<p>この独自種目には参考資料が登録されていません。</p>'}
      <h3>疾患・介入全体のガイドライン</h3>${g?`<p>${esc(DISEASE_LIBRARY[disease]?.name||disease)}</p><p><strong>${esc(g.title)}</strong><br>${esc(g.publisher)} ／ ${esc(g.year)}年</p><p>${esc(g.scope)}</p>${link(g.url,'ガイドライン原文・掲載ページを開く')}`:'<p>この処方区分に対応するガイドラインは未登録です。エビデンスがないという意味ではありません。</p>'}
      ${sources.length?`<h3>疾患別の追加参考資料</h3><p class="hint">疾患説明や運動方法の参考を含みます。個々の種目の効果を直接検証した研究とは区別してください。</p>${sources.map(s=>link(s.url,s.title)).join('')}`:''}
      <h3>処方量について</h3><p>アプリの標準回数・セット数・保持時間は入力補助用の初期値です。この数値自体を研究で検証した処方量として提示しているわけではありません。個々の患者の状態に合わせて調整してください。</p>
      <p class="hint">文献情報の登録日：2026-09-19。リンク先の閲覧にはインターネット接続が必要です。資料によっては英語・PDF・有料本文です。</p></div>`;
  }
  return {html,guidelines};
})();
function showExerciseEvidence(ex,disease){
  if(!requireStaff())return;
  modal('evidenceModal','エビデンス・参考資料',ExerciseEvidence.html(ex,disease));
}
function showTemplateEvidence(i){
  if(!requireStaff())return;
  const template=getAllTemplates()[selectedTemplate];
  if(template?.menu[i])showExerciseEvidence(template.menu[i],selectedTemplate);
}
