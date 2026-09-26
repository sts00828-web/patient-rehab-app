/* Reviewed reference index, separate from generated catalog and patient payloads.
 * Explicit IDs only: never infer evidence from an exercise name or body region.
 * "method" means a related movement in an educational handout, NOT efficacy evidence.
 */
const ClinicalEvidence = (() => {
  const checked = '2026-09-26';
  const sources = {
    shoulder:{title:'Rotator Cuff and Shoulder Conditioning Program',publisher:'AAOS / OrthoInfo',url:'https://www.orthoinfo.org/recovery/rotator-cuff-and-shoulder-conditioning-program/'},
    frozen:{title:'Frozen Shoulder',publisher:'AAOS / OrthoInfo',url:'https://www.orthoinfo.org/diseases--conditions/frozen-shoulder'},
    spine:{title:'Spine Conditioning Program',publisher:'AAOS / OrthoInfo',url:'https://www.orthoinfo.org/recovery/spine-conditioning-program/'},
    back:{title:'Back mobility exercises',publisher:'Cambridge University Hospitals NHS',year:'2024',url:'https://www.cuh.nhs.uk/patient-information/back-mobility-exercises/'},
    neck:{title:'Neck exercises and advice',publisher:'Cambridge University Hospitals NHS',url:'https://www.cuh.nhs.uk/patient-information/neck-exercises-and-advice/'},
    knee:{title:'Knee Conditioning Program',publisher:'AAOS / OrthoInfo',url:'https://www.orthoinfo.org/recovery/knee-conditioning-program/'},
    kneeOA:{title:'Exercises for Osteoarthritis of the Knee',publisher:'Royal Orthopaedic Hospital NHS',url:'https://roh.nhs.uk/services-information/therapy/exercises-for-osteoarthritis-of-the-knee'},
    ankle:{title:'Foot and Ankle Conditioning Program',publisher:'AAOS / OrthoInfo',url:'https://www.orthoinfo.org/recovery/foot-and-ankle-conditioning-program/'},
    elbow:{title:'Therapeutic Exercise Program for Epicondylitis',publisher:'AAOS / OrthoInfo',url:'https://www.orthoinfo.org/recovery/epicondylitis-therapeutic-exercise-program/'},
    tennis:{title:'Tennis Elbow',publisher:'Bexley MSK / NHS',url:'https://msk-bexley.nhs.uk/conditions/elbow-pain/tennis-elbow'},
    balance:{title:'Balance exercises',publisher:'NHS',url:'https://www.nhs.uk/live-well/exercise/balance-exercises/'},
    falls:{title:'Strength and balance exercise programme for falls prevention',publisher:'South Tees Hospitals NHS',url:'https://www.southtees.nhs.uk/resources/strength-and-balance-exercise-programme-for-falls-prevention/'},
    breathing:{title:'Breathing exercises for stress',publisher:'NHS',url:'https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/'},
    strength:{title:'How to improve your strength and flexibility',publisher:'NHS',url:'https://www.nhs.uk/live-well/exercise/how-to-improve-strength-flexibility/'},
    fifa:{title:'Effect of FIFA 11+ Training Program on Soccer-Specific Physical Performance and Functional Movement in Collegiate Male Soccer Players: A Randomized Controlled Trial',publisher:'Hwang J, Kim J. Exercise Science 28(2):141–149',year:'2019',url:'https://ksep-es.org/journal/view.php?doi=10.15857/ksep.2019.28.2.141'}
  };
  const entries = {};
  function add(ids,source,kind,section){
    for(const id of ids.split(' '))entries[id]={source,kind,section};
  }
  // Background only: these sources do not establish the exact app movement.
  add('S02 S05 S06 S07 S08 S11 S13 S14 S15 S18 S19 S20 S22 S26','shoulder','background','肩周囲の可動性・筋力運動の一般資料。この種目と同じ姿勢・用具・動作の掲載は未確認です。');
  add('T04 T06 T10 T11 T13 T14 T19 T20 T22 T23','spine','background','体幹の筋力・安定性運動の一般資料。この種目そのものの手順・有効性は未確認です。');
  add('N04 N05 N06 N07 N08 N09 N10','neck','background','頸部の運動・生活上の助言。この種目と同じ姿勢・抵抗・保持方法の掲載は未確認です。');
  add('K01 K13 K14 K15 K17 K18 K19 K20 K22','knee','background','膝周囲の運動プログラムの一般資料。この種目そのものの手順・有効性は未確認です。');
  add('E01 E02 E03 E04 E07','elbow','background','前腕のストレッチ・筋力運動の資料案内。この種目と同じ抵抗・収縮方法の対応は未確認です。');
  add('A02 A03 A04 A05 A06 A07 A08','ankle','background','足・足関節の可動性、筋力、バランスの一般資料。この種目と同じ手順の掲載は未確認です。');
  add('P01 P02 P03 P10','strength','background','筋力・柔軟性の一般資料。投球・パス・素振りの手順や競技復帰の許可を裏付けるものではありません。');
  add('P04 P05 P06 P07 P08 P09','fifa','background','健康な大学男子サッカー選手20名の複合プログラムの研究です（Table 2）。跳躍・走行・方向転換の段階構成の参考であり、傷害治療や本種目単独の効果・用量の検証ではありません。');
  // Similar movement references. Position, load and dose remain patient-specific.
  add('S01','shoulder','method','1：振り子運動');
  add('S03','frozen','method','治療の項：仰向けでの介助挙上');
  add('S04','shoulder','method','4：棒を使う他動外旋（資料とアプリで姿勢が異なります）');
  add('S09','shoulder','method','17：側臥位での肩外旋');
  add('S10 S17','shoulder','method','9：抵抗を使う肩外旋');
  add('S12 S21','shoulder','method','6：ローイング（S21は支持・用具を変えた類似動作）');
  add('S16','shoulder','method','2：腕を胸の前で支えるストレッチ');
  add('S23 S24','shoulder','method','10：肘屈曲（S23は無負荷の曲げ伸ばし）');
  add('S25','shoulder','method','7：腕を挙げた位置での肩外旋');
  add('T01 N01','breathing','method','楽な姿勢で無理なく呼吸する方法。頸部・腰部疾患への効果の研究ではありません。');
  add('T02','back','method','7：骨盤の前後運動');
  add('T03','spine','method','2：四つ這いで背中を動かす運動（動かす範囲は個別指示を優先）');
  add('T05','spine','method','3：座位の体幹回旋（資料は床座位、アプリは椅子座位）');
  add('T07','spine','method','6：四つ這いの対角挙上');
  add('T08','spine','method','9：ブリッジ');
  add('T09 T12','spine','method','8：横支えとその段階変更');
  add('T15 T18','back','method','4：座位姿勢の屈曲・伸展（胸椎のみの運動や疾患別の適応を直接検証したものではありません）');
  add('T16','spine','method','5：膝を胸へ寄せる運動');
  add('T17','back','method','2a・2b：うつ伏せでの上体起こし');
  add('T21','back','method','5：呼吸を続けた腹部の筋収縮');
  add('N02 N03','neck','method','可動性運動：頸部の回旋・側屈');
  add('K02','kneeOA','method','膝の屈曲・伸展の可動域運動');
  add('K03','kneeOA','background','大腿四頭筋の運動を含む一般資料。掲載は膝伸展運動で、本種目の等尺性収縮とは異なります。');
  add('K04','knee','method','8：膝を伸ばした脚上げ');
  add('K05 K12','knee','method','7：椅子座位での膝伸展（負荷は個別指示）');
  add('K06','falls','method','椅子からの立ち座り');
  add('K07','knee','method','4：浅いスクワット');
  add('K08 K16','ankle','method','5：両脚・片脚のかかと上げ');
  add('K09','balance','method','段への昇降');
  add('K10','balance','method','横歩き');
  add('K11','ankle','method','10：片脚立ち（アプリの支持条件を優先）');
  add('K21','kneeOA','method','その他の運動：自転車（室内自転車の設定や用量は個別指定）');
  add('K23','falls','background','立位バランスの一般資料。重心移動の個別手順の対応は未確認です。');
  add('K24','balance','method','踵とつま先を近づけた歩行');
  add('E05 E09','tennis','method','等尺性の握力運動（用具・手首の位置は個別指示）');
  add('E06 E10','tennis','method','手首の伸展・屈曲の筋力運動');
  add('E08','tennis','method','重りを使う前腕の回旋（アプリは棒を使用）');
  add('A01','ankle','method','9：足首の背屈・底屈（資料は抵抗あり、アプリは無負荷）');
  add('A09','falls','background','歩行・バランス練習の一般資料。障害物の高さや跨ぎ方の対応は未確認です。');
  add('A10','falls','method','支持物を使う立位の足踏み');
  // Only categories with a matching guideline; do not transfer frozen-shoulder
  // evidence to all shoulder diagnoses, or knee OA evidence to meniscus injuries.
  const categoryGuidelines={G01:'shoulder',G02:'lowback',G03:'knee',G04:'tennisElbow',G05:'cervicalSpondylosis',G13:'ankleSprain',A05:'tennisElbow',A06:'ankleSprain',A08:'lowback'};
  function lookup(ex){
    const key=ex?.exerciseKey;
    if(typeof key!=='string'||!key.startsWith('v02_'))return null;
    const id=key.slice(4),catalog=typeof ClinicalCatalog==='undefined'?null:ClinicalCatalog;
    if(!catalog||!Object.hasOwn(catalog.definitions,id))return null;
    const definition=catalog.definitions[id],entry=entries[id];
    return {definition,entry,source:entry?sources[entry.source]:null};
  }
  function category(ex,requested){
    const result=lookup(ex);if(!result)return null;
    const id=ex.clinicalV02?.categoryId||requested;
    const c=Object.hasOwn(ClinicalCatalog.categories,id||'')?ClinicalCatalog.categories[id]:null;
    return c&&Object.values(c.levels).some(ids=>ids.includes(result.definition.id))?c:null;
  }
  return {checked,sources,entries,categoryGuidelines,lookup,category};
})();
