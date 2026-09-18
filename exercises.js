/* Clinician-selectable examples, not an automatic prescription. Original descriptions. */
const EXERCISE_LIBRARY = {
  pendulum: {name:'振り子体操', region:'shoulder', image:'pendulum.png', params:'回数・時間はPTと設定',
    steps:['机に片手をつき、上体を少し前に傾けます。','反対の腕を下に垂らし、小さくゆっくり揺らします。','肩の力を抜いて、楽な範囲で行います。'],
    caution:'腕を自力で大きく振らないでください。', source:'https://orthoinfo.aaos.org/globalassets/pdfs/2017-rehab_shoulder.pdf'},
  'supine-flexion': {name:'あお向けで腕を上げる',region:'shoulder',image:'supine-flexion.png',params:'回数・範囲はPTと設定',
    steps:['あお向けになり、両手を組みます。','楽な側の腕で支えながら、両手を頭の方向へ動かします。','無理に床へ近づけず、ゆっくり戻します。'],
    caution:'腰を反らせず、肩をすくめない範囲で。',source:'https://www.orthoinfo.org/diseases--conditions/frozen-shoulder'},
  crossover: {name:'腕を胸の前で支えるストレッチ',region:'shoulder',image:'crossover.png',params:'保持時間はPTと設定',
    steps:['片腕を胸の前に出します。','反対の手で肘の少し上を支えます。','肩をすくめず、軽く胸へ近づけて戻します。'],
    caution:'肩の前側が痛む場合は中止し、担当PTに相談してください。',source:'https://www.orthoinfo.org/diseases--conditions/frozen-shoulder'},
  'abdominal-brace': {name:'お腹に軽く力を入れる',region:'lowback',image:'abdominal-brace.png',params:'保持時間・回数はPTと設定',
    steps:['あお向けで両膝を立てます。','お腹に手を添え、息を吐きながら軽く力を入れます。','呼吸を続けてから力を抜きます。'],
    caution:'息を止めたり、上体を起こしたりしません。',source:'https://www.orthoinfo.org/recovery/spine-conditioning-program/'},
  bridge: {name:'ブリッジ（お尻上げ）',region:'lowback',image:'bridge.png',params:'高さ・回数はPTと設定',
    steps:['あお向けで膝を立て、足裏を床につけます。','お尻をゆっくり上げます。','腰を反らさない高さで止め、ゆっくり下ろします。'],
    caution:'首に体重をかけず、呼吸を続けます。',source:'https://www.orthoinfo.org/recovery/spine-conditioning-program/'},
  'knee-to-chest': {name:'片膝を胸に近づける',region:'lowback',image:'knee-to-chest.png',params:'範囲・保持時間はPTと設定',
    steps:['あお向けになり、片膝を曲げます。','太ももの後ろを両手で支えます。','楽な範囲で胸に近づけ、ゆっくり戻します。'],
    caution:'腰や脚の痛み・しびれが増す場合は行わないでください。',source:'https://www.orthoinfo.org/recovery/spine-conditioning-program/'},
  'heel-slide': {name:'かかとを滑らせて膝を曲げる',region:'knee',image:'heel-slide.png',params:'範囲・回数はPTと設定',
    steps:['あお向けになり、脚を楽に伸ばします。','かかとを床につけたまま、ゆっくり手前に滑らせます。','膝を楽な範囲で曲げ、伸ばして戻します。'],
    caution:'膝を無理に深く曲げないでください。',source:'https://roh.nhs.uk/services-information/therapy/exercises-for-osteoarthritis-of-the-knee'},
  'short-arc-quad': {name:'タオルを使った膝伸ばし',region:'knee',image:'short-arc-quad.png',params:'保持時間・回数はPTと設定',
    steps:['あお向けで、膝の下に丸めたタオルを置きます。','膝をタオルにつけたまま、かかとを少し上げて膝を伸ばします。','太ももの力を感じたら、ゆっくり下ろします。'],
    caution:'脚全体を持ち上げず、膝をタオルから離しません。',source:'https://roh.nhs.uk/services-information/therapy/exercises-for-osteoarthritis-of-the-knee'},
  'sit-to-stand': {name:'椅子からの立ち座り',region:'knee',image:'sit-to-stand.png',params:'椅子の高さ・回数はPTと設定',
    steps:['動かない椅子に座り、両足を床につけます。','体を少し前に傾け、ゆっくり立ち上がります。','椅子の位置を確かめ、ゆっくり座ります。'],
    caution:'ふらつく場合は一人で行わず、手の支え方をPTと確認してください。',source:'https://roh.nhs.uk/services-information/therapy/exercises-for-osteoarthritis-of-the-knee'}
};
const DISEASE_LIBRARY = {
  shoulder:{name:'五十肩（肩関節周囲炎）',icon:'💪',desc:'肩の状態に合わせて選ぶ3種目',guidance:'疼痛の強さ・病期・可動域を評価して選択してください。術後や外傷後の制限は個別指示を優先します。'},
  lowback:{name:'腰痛',icon:'🌿',desc:'体幹・動きの練習から選ぶ3種目',guidance:'腰痛の原因と運動方向への反応を確認してください。屈曲運動が合わない患者には片膝抱えを選択しないでください。'},
  knee:{name:'変形性膝関節症（膝OA）',icon:'🦵',desc:'膝の動き・筋力から選ぶ3種目',guidance:'腫れ・疼痛・転倒リスクに合わせ、範囲・負荷・支持物を調整してください。'}
};
