/* Clinician-facing draft input aids, NOT validated doses or automatic prescriptions.
 * Load after exercises.js. Empty fields require patient-specific decisions.
 * dows: [] has the existing app meaning 'daily'; confirm schedule before saving.
 * Numerical suggestions are editorial starting drafts, not source quotations.
 */
const PRESCRIPTION_DEFAULTS = (() => {
  const rows = {
    'forearm-plank':['1回','20秒','','両前腕と両つま先で支える','保持中も呼吸。セット間は60秒休息を目安にPTが調整。'],
    'side-plank':['1回','20秒','','下側の前腕と足の外側で支える','側は下の支持側。セット間は60秒休息を目安に調整。'],
    'single-leg-plank':['1回','20秒','','両前腕と反対側のつま先で支える','側は浮かせる脚。腰を反らさず保持。'],
    'side-plank-leg-lift':['1回','20秒','','下側の前腕と足の外側で支える','側は下の支持側。上の脚は少しだけ離す。'],
    'split-squat':['10回','保持なし','','支え不要（院内で安定を確認）','側は前脚。深さ・追加重量・休息を個別設定。'],
    'single-leg-squat':['8回','保持なし','','支え不要（院内で安定を確認）','側は支持脚。膝の向き・深さ・追加重量を確認。'],
    'single-leg-heel-raise':['10回','保持なし','','安定した台に手を添える','側は支持脚。反動を使わず、ゆっくり下ろす。'],
    'floor-push-up':['10回','保持なし','','両手と両つま先で支える','左右は両側。深さと肩の荷重許可を確認。'],
    'lateral-hop-stick':['5回','着地で2秒静止','','支え不要（院内で着地を確認）','側は離地・着地する脚。距離・方向・休息を個別設定。'],
    'plank-shoulder-tap':['左右各5回','保持なし','','両つま先と片手で支える','側は動かす手。左右交互なら両側を指定。'],
    'ankle-pumps':['5往復','保持なし','重りなし・痛みのない小さい範囲','脚を前に伸ばして座り両手で上体を支える','固定・可動域の許可を確認。図は両側だが実施側は個別に指定。'],
    'supported-single-leg-stance':['3回','','','動かない台を手で支え、目を開けて行う','片脚荷重の許可、保持時間・手の支え方・見守りを個別指定。運動する側は床について支える脚。'],
    // repetitions, hold, load/range, support, clinician review note
    'pendulum':['5往復','保持なし','重りなし・小さく揺らす','動かない机に反対の手をつく','前傾姿勢の安定と揺らす方向を確認。'],
    'supine-flexion':['5回','保持なし','','あお向け・反対の腕で支える','肩を上げる許可範囲を入力。'],
    'crossover':['3回','10秒','軽く伸びる範囲','反対の手で上腕を支える','肩前面の痛み・強い疼痛期では再評価。'],
    'table-slide':['5回','保持なし','','椅子に座り机とタオルで両腕を支える','脱臼後等でも共有するため、開始許可と動かす範囲を個別入力。'],
    'wall-slide':['5回','保持なし','','壁とタオルで両手を支える','腕を上げる高さと立位の安定を確認。'],
    'stick-external-rotation':['3回','10秒','','軽い棒を両手で持ち肘を体側に保つ','外旋の許可範囲を入力。脱臼後・術後の指示を優先。'],
    'scapular-setting':['5回','5秒','','椅子に座り足裏を床につける','肩保護期にも共有するため収縮の許可・強さを確認。'],
    'shoulder-isometric-external':['5回','5秒','','壁と手の間にタオルを挟む','抵抗運動の開始許可と押す強さを入力。'],
    'shoulder-isometric-internal':['5回','5秒','','反対の手で手首の内側を支える','抵抗運動の開始許可と押す強さを入力。'],
    'band-row':['5回','保持なし','','','バンドの種類・強さ・固定位置と立位または座位を指定。'],
    'abdominal-brace':['5回','5秒','呼吸を続けられる軽い力','あお向け・両膝を立てる','息こらえと過剰な力みを確認。'],
    'bridge':['5回','3秒','重りなし・腰を反らさない高さ','あお向け・両足裏を床につける','伸展方向への反応と首・膝の負担を確認。'],
    'knee-to-chest':['3回','5秒','楽に曲げられる範囲','あお向け・両手で太ももの後ろを支える','腰の屈曲で脚症状が増えない場合に選択。'],
    'pelvic-tilt':['5回','保持なし','小さい範囲','あお向け・両膝を立てる','屈曲方向への反応を確認。'],
    'knee-rolls':['左右各5回','保持なし','肩が床から離れない小さい範囲','あお向け・両膝を立てる','術後の回旋制限を優先。両方向が可能か確認。'],
    'cat-camel':['5回','保持なし','無理に反らさず小さい範囲','マット上で両手・両膝をつく','手首・肩・膝への荷重が可能か確認。'],
    'prone-on-elbows':['','','','両前腕・骨盤・脚を床につける','伸展方向への反応を評価してから回数・保持・範囲を入力。'],
    'bird-dog':['左右各3回','3秒','','マット上で片手・反対側の膝をつく','四つ這いの安定と挙上範囲を確認。片側だけ行う場合は回数も修正。'],
    'kneeling-plank':['3回','5秒','','マット上で両肘・両膝をつく','支持負荷に耐えられるか確認。休憩時間も必要に応じ個別入力。'],
    'walking':['','該当なし','','','歩行時間・休憩・速度・補助具・見守りは個別評価して入力。'],
    'heel-slide':['5回','保持なし','重りなし・楽に曲げられる範囲','あお向け・かかとを床につける','腫れと曲げた時の症状を確認。'],
    'short-arc-quad':['5回','5秒','重りなし','あお向け・膝下に丸めたタオル','膝をタオルから離さず伸ばせるか確認。'],
    'sit-to-stand':['5回','保持なし','','','椅子の高さ・手の支え方・見守りを入力。腕組みは必須ではない。'],
    'quad-setting':['5回','5秒','重りなし・軽い力','脚を伸ばして座り膝下に薄いタオル','かかとを床に保ち、伸ばし切る痛みを確認。'],
    'straight-leg-raise':['5回','保持なし','重りなし・少し持ち上げる','あお向け・反対の膝を立てる','膝の曲がり・腰痛が出ない高さを確認。'],
    'seated-knee-extension':['5回','3秒','重りなし・楽に伸ばせる範囲','安定した椅子で太ももを座面にのせる','伸展時痛と座位の安定を確認。'],
    'heel-raise':['5回','保持なし','両足・重りなし','安定した台に両手を添える','立位安定と見守りの必要性を確認。片足へ自動変更しない。'],
    'mini-squat':['5回','保持なし','','安定した台に両手を添える','しゃがむ深さ・膝折れ・見守りの必要性を確認。'],
    'step-up':['5回','保持なし','','','段の高さ・昇降順序・手すり・見守りを入力。'],
    'side-lying-hip-abduction':['5回','保持なし','重りなし・骨盤が動かない高さ','横向き・頭を枕で支え下の膝を軽く曲げる','股関節術後の制限と横向き姿勢の可否を確認。'],
    'elbow-bend-straighten':['5回','保持なし','重りなし・楽に動かせる範囲','椅子に座り上腕を体側に置く','外傷や可動域制限がある場合は範囲を指定。'],
    'forearm-turn':['5往復','保持なし','重りなし・楽に動かせる範囲','肘・前腕を机で支える','手のひらを上・下・中央へ戻して1往復。'],
    'wrist-active-extension':['5回','保持なし','重りなし・小さい範囲','前腕を机にのせ手首を端から出す','手首を起こす動きの疼痛反応を確認。'],
    'wrist-extensor-stretch':['3回','10秒','軽く伸びる範囲','椅子に座り反対の手を手の甲に添える','肘の伸ばし具合を調整。外側の痛みが増す場合は選択しない。'],
    'wrist-flexor-stretch':['3回','10秒','軽く伸びる範囲','椅子に座り反対の手で手のひら側を支える','指先だけを引かない。肘内側の痛みやしびれを確認。'],
    'wrist-isometric-extension':['5回','5秒','','前腕を机で支え反対の手を手の甲に添える','押し合う強さを確認。手首筋力運動の重複負荷を調整。'],
    'wrist-eccentric-extension':['5回','保持なし','','前腕を机で支え上げる時だけ反対の手で補助','重さと下ろす速さを個別入力。'],
    'wrist-resisted-extension':['5回','保持なし','','前腕を机で支え手首を端から出す','重さ・範囲・速さを指定。他の手首筋力種目と負荷を合算。'],
    'gentle-ball-grip':['5回','3秒','','前腕を机で支え手首をまっすぐに保つ','ボールの硬さと握る強さを指定。日常の握る作業量も確認。'],
    'resisted-forearm-turn':['5往復','保持なし','','肘・前腕を机で支える','重さ・持つ位置・回す範囲を指定。上・下・中央で1往復。'],
    'neck-rotation':['各指定側3回','5秒','','安定した椅子で足裏を床につける','神経症状・めまいが増えない側と範囲を指定。'],
    'neck-retraction':['5回','保持なし','','安定した椅子で足裏を床につける','小さい後退運動の反応を確認して範囲を指定。'],
    'neck-side-bend':['各指定側3回','保持なし','','安定した椅子で足裏を床につける','神経症状・めまいが増えない側と範囲を指定。手で引かない。'],
    'neck-isometric-side':['','','','椅子に座り同じ側の手をこめかみに添える','等尺性収縮の許可後に強さ・回数・保持時間を個別入力。'],
    'shoulder-band-external':['5回','保持なし','','','バンドの種類・強さ・固定位置・外旋範囲と支持姿勢を指定。'],
    'wall-push-up':['5回','保持なし','','壁に両手をつく','壁と足の距離・肘を曲げる深さ・立位安定を確認。']
  };
  return Object.fromEntries(Object.entries(rows).map(([key,[repetitions,hold,load,support,note]]) => [key,{
    prescription:{side:'',repetitions,sets:'1セット',hold,frequency:'1日1回',load,support},
    dows:[],
    source:EXERCISE_LIBRARY[key].source,
    note:'入力用の編集案です。文献の標準用量ではありません。左右・実施日と患者への適合を確認してください。'+note
  }]));
})();

// Editable clinic drafts. Level names are not FIFA levels or validated rehab doses.
function athleteDosePreset(key,level){
  if(![2,3].includes(level))return null;
  const e=EXERCISE_LIBRARY[key];if(!e||(e.category!=='strength'&&key!=='lateral-hop-stick'))return null;
  const staticKeys=['forearm-plank','side-plank','single-leg-plank','side-plank-leg-lift'];
  const resistance=['band-row','shoulder-band-external','wrist-eccentric-extension','wrist-resisted-extension','resisted-forearm-turn'];
  // Isometrics and low-load activation need specific durations, not generic dynamic repetitions.
  if(!e.athleteLevel&&!resistance.includes(key))return null;
  const p={sets:level===2?'2セット':'3セット',frequency:'実施日に1回'};
  if(staticKeys.includes(key)){p.repetitions='1回';p.hold=level===2?'20秒':'30秒';}
  else if(key==='lateral-hop-stick'){p.repetitions=level===2?'5回':'8回';p.hold='着地で2秒静止';}
  else if(key==='plank-shoulder-tap'){p.repetitions=level===2?'左右各5回':'左右各8回';p.hold='保持なし';}
  else{p.repetitions=level===2?'10回':'8回';p.hold='保持なし';}
  return {prescription:p,dows:[1,3,5]};
}
