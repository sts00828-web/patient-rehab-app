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
// Categories and difficulty are editorial selection aids, not validated clinical scores.
const EXERCISE_GROUPS = {mobility:'動かす・柔軟性',strength:'筋力・姿勢の保持',function:'立位・日常動作'};
const EXERCISE_SOURCES = {
  shoulder:'https://orthoinfo.aaos.org/globalassets/pdfs/2017-rehab_shoulder.pdf',
  frozen:'https://www.ouh.nhs.uk/media/xuqnlojh/86594shoulder.pdf',
  scapula:'https://www.cuh.nhs.uk/patient-information/scapular-stabilisation-exercises/',
  isometric:'https://msk-bexley.nhs.uk/conditions/shoulder-pain/rotator-cuff-tears',
  spine:'https://www.orthoinfo.org/recovery/spine-conditioning-program/',
  back:'https://www.cuh.nhs.uk/patient-information/back-mobility-exercises/',
  cat:'https://dynamichealth.nhs.uk/help-and-advice/lower-back-pain/',
  walking:'https://www.nhs.uk/conditions/back-pain/',
  knee:'https://roh.nhs.uk/services-information/therapy/exercises-for-osteoarthritis-of-the-knee',
  kneeStrength:'https://msk-bexley.nhs.uk/conditions/knee-pain/knee-osteoarthritis'
};
const additions = [
  ['table-slide','shoulder','机で手を滑らせる','mobility','基本','腕を支えながら前へ動かす','机・椅子・タオル','痛みの強い時期は小さな範囲から。机の高さを調整。',
    ['椅子に座り、机のタオルに両手を置きます。','体を軽く前に傾け、タオルを前へ滑らせます。','肩の力を抜いたまま、手前に戻します。'],'肩をすくめたり、痛みを我慢して遠くへ伸ばしたりしません。','frozen'],
  ['wall-slide','shoulder','壁で手を滑らせる','mobility','標準','腕を上げる動きの練習','壁・タオル','立位が安定し、腕を上げる負荷に耐えられる場合に。',
    ['壁に向かって立ち、タオルを挟んで両手を壁につけます。','楽な高さまで手をゆっくり滑らせます。','腰を反らさず、元の高さへ戻します。'],'高さを競わず、担当PTと決めた範囲で動かします。','frozen'],
  ['stick-external-rotation','shoulder','棒で腕を外に開く','mobility','標準','肩を外へ回す動きの練習','軽い棒','外旋制限と疼痛反応を確認。術後の外旋制限を優先。',
    ['脇を締めて肘を直角に曲げ、棒を両手で持ちます。','楽な側の手で棒を押し、反対の手を少し外へ動かします。','肘を脇につけたまま、ゆっくり戻します。'],'体をひねったり、肩の前に痛みが出るまで押したりしません。','shoulder'],
  ['scapular-setting','shoulder','肩甲骨を軽く寄せる','strength','基本','肩甲骨を動かす感覚の練習','椅子','首に力が入りやすい場合は、収縮を弱めて確認。',
    ['椅子に座り、両腕を楽に下ろします。','肩甲骨を少し後ろ・下へ動かすように力を入れます。','呼吸を続けて、力を抜きます。'],'胸を強く張らず、肩を無理に引き下げません。','scapula'],
  ['shoulder-isometric-external','shoulder','壁を外向きに軽く押す','strength','標準','肩を外へ回す筋肉に力を入れる','壁・タオル','動かさない軽い収縮での疼痛反応を確認して選択。',
    ['壁を横にして立ち、肘を脇につけて直角に曲げます。','手の外側と壁の間にタオルを挟み、軽く壁を押します。','腕を動かさずに力を入れ、ゆっくり緩めます。'],'全力で押さず、体を壁へ傾けません。','isometric'],
  ['shoulder-isometric-internal','shoulder','反対の手を内向きに軽く押す','strength','標準','肩を内へ回す筋肉に力を入れる','なし','反対の手で抵抗を調整できることを確認。',
    ['肘を脇につけて直角に曲げます。','反対の手で手首の内側を支え、お腹の方へ軽く押し合います。','肘と腕を動かさずに保ち、力を抜きます。'],'手首をひねらず、肩に痛みが出る強さでは行いません。','isometric'],
  ['band-row','shoulder','ゴムバンドを引く','strength','発展','肩まわりと背中の筋力練習','ゴムバンド・固定具','疼痛が落ち着き、抵抗運動が可能な場合に。固定具も確認。',
    ['腰の高さで固定したバンドを両手で持ちます。','肘を体の近くに保ち、少し後ろへ引きます。','肩をすくめず、ゆっくり戻します。'],'固定の緩みやゴムの傷を確認し、体を反らして引きません。','shoulder'],
  ['pelvic-tilt','lowback','骨盤を小さく傾ける','mobility','基本','腰・骨盤の動きの練習','マット','腰を丸める方向で症状が増えないことを確認。',
    ['あお向けで膝を立てます。','お尻を床につけたまま、腰と床の隙間を小さくします。','骨盤を元の位置に戻し、力を抜きます。'],'お尻を持ち上げず、息を止めません。','back'],
  ['knee-rolls','lowback','両膝を小さく左右へ倒す','mobility','基本','腰まわりの回旋の練習','マット','ひねりへの反応を確認。術後の回旋制限に注意。',
    ['あお向けで両膝を立て、そろえます。','肩を床につけたまま、膝を少し横へ倒します。','中央へ戻し、反対側も楽な範囲で行います。'],'脚へ広がる痛みやしびれが増すときは中止します。','back'],
  ['cat-camel','lowback','四つ這いで背中を丸めて戻す','mobility','標準','背骨・骨盤をゆっくり動かす','マット','手首・肩・膝への荷重が可能な場合に。',
    ['手を肩の下、膝を股関節の下について四つ這いになります。','背中をゆっくり丸めます。','楽な姿勢へ戻し、無理のない範囲で繰り返します。'],'大きく反らす必要はありません。首も無理に曲げません。','cat'],
  ['prone-on-elbows','lowback','うつ伏せで肘をつく','mobility','標準','腰を反らす方向の練習','マット','伸展方向で症状が悪化しないことをPTが確認した場合のみ。',
    ['うつ伏せになり、前腕を床につけます。','肘で支え、胸を軽く起こします。','骨盤と脚を床につけたまま保ち、ゆっくり下ろします。'],'脚の痛み・しびれが増える、または広がる場合は中止します。','back'],
  ['bird-dog','lowback','四つ這いで対角の手足を伸ばす','strength','発展','手足を動かしながら体幹を保つ','マット','四つ這いが安定し、片手片膝で支えられる場合に。',
    ['四つ這いになり、背中を楽な位置に保ちます。','片腕と反対の脚を、体と同じ高さへゆっくり伸ばします。','体をひねらずに戻し、左右を替えます。'],'高く上げるより、腰を反らさず安定させることを優先します。','spine'],
  ['kneeling-plank','lowback','膝をついたプランク','strength','発展','体幹を支える筋力練習','マット','肩・肘・膝への荷重と呼吸を保てることを確認。',
    ['うつ伏せから両肘と両膝を床につきます。','肘を肩の下に置き、お腹とお尻を床から持ち上げます。','肩・腰・膝をおおむね一直線に保ち、ゆっくり下ろします。'],'息を止めず、腰が落ちる前に休みます。','spine'],
  ['walking','lowback','平らな場所を歩く','function','基本','歩く活動を少しずつ続ける','歩きやすい靴','歩行耐容能・転倒リスク・休憩場所を確認し時間を設定。',
    ['段差の少ない、歩き慣れた場所を選びます。','楽な速度と歩幅で歩きます。','担当PTと決めた時間で休み、歩いた後の症状を確認します。'],'脚の痛み・しびれやふらつきが増える場合は、歩き続けません。','walking'],
  ['quad-setting','knee','太ももに力を入れて膝を押す','strength','基本','太ももの前に力を入れる練習','マット・薄いタオル','膝伸展時の痛みと伸展制限を確認。無理に押し切らない。',
    ['脚を伸ばして座り、膝の下に薄いタオルを置きます。','かかとを床につけたまま、膝を軽くタオルへ押します。','太ももに力を入れた後、ゆっくり緩めます。'],'膝を強く押し込まず、痛みのない力加減で行います。','kneeStrength'],
  ['straight-leg-raise','knee','膝を伸ばして脚を上げる','strength','標準','膝を伸ばしたまま脚を支える','マット','膝が曲がらず保持できること、腰痛が出ないことを確認。',
    ['あお向けになり、反対の膝を立てます。','運動する側の膝を伸ばしたまま、脚を少し上げます。','腰を反らさずに、ゆっくり下ろします。'],'膝が曲がってしまう場合は、高さや種目をPTと調整します。','kneeStrength'],
  ['seated-knee-extension','knee','椅子で膝を伸ばす','strength','基本','座って太ももの筋力を使う','椅子','座位が安定することと、伸ばす範囲の痛みを確認。',
    ['椅子に座り、太ももを座面にのせます。','片方の膝をゆっくり伸ばします。','太ももを座面から離さず、足を下ろします。'],'勢いをつけず、痛みのある角度まで伸ばしません。','kneeStrength'],
  ['heel-raise','knee','支えにつかまってかかと上げ','strength','標準','ふくらはぎの筋力練習','安定した台','両足立ちの安定性と足部の痛みを確認。',
    ['安定した台に両手を添え、両足で立ちます。','つま先を床につけたまま、両かかとを少し上げます。','体をまっすぐ保ち、ゆっくり下ろします。'],'台を確認し、片足だけで行う変更はPTと相談します。','knee'],
  ['mini-squat','knee','支えにつかまって浅くしゃがむ','function','標準','立位で脚に体重をかける練習','安定した台','荷重時痛・膝折れ・膝の向きを確認して深さを設定。',
    ['台に両手を添え、足を腰幅に開きます。','お尻を少し後ろへ引き、両膝を浅く曲げます。','足裏を床につけたまま、ゆっくり立ちます。'],'深くしゃがまず、膝が内側へ入らないようにします。','knee'],
  ['step-up','knee','手すりで支えて低い段を上がる','function','発展','段差を上がる動作の練習','低い踏み台・手すり','段の高さと昇降順序をPTが設定。膝折れや転倒リスクを確認。',
    ['手すりにつかまり、片足全体を低い段にのせます。','段の上の脚に体重を移し、反対の足を上げます。','手すりで支え、教わった順序でゆっくり下ります。'],'不安定な台は使わず、ふらつく場合は一人で行いません。','knee'],
  ['side-lying-hip-abduction','knee','横向きで上の脚を上げる','strength','標準','骨盤を支えるお尻の筋力練習','マット・枕','横向き姿勢と骨盤を保てることを確認。股関節術後の制限に注意。',
    ['横向きになり、下の膝を軽く曲げます。','上の膝を伸ばし、脚を少し持ち上げます。','つま先を前へ向けたまま、ゆっくり下ろします。'],'骨盤を後ろへ倒したり、脚を高く上げすぎたりしません。','kneeStrength']
];
for(const [id,region,name,category,difficulty,purpose,equipment,selectionNote,steps,caution,source] of additions){
  EXERCISE_LIBRARY[id]={name,region,image:id+'.png',params:'回数・時間・範囲はPTと設定',category,difficulty,purpose,equipment,selectionNote,steps,caution,source:EXERCISE_SOURCES[source]};
}
const existingMetadata = {
  pendulum:['mobility','基本','肩の力を抜いて腕を動かす','机','前傾姿勢が安全にとれることと疼痛反応を確認。'],
  'supine-flexion':['mobility','基本','反対の腕で支えて肩を動かす','マット','腕を上げる範囲を個別に設定。夜間痛・安静時痛が強い場合は負荷を見直す。'],
  crossover:['mobility','標準','肩の後ろを穏やかに伸ばす','なし','強い疼痛期は無理なストレッチを避け、肩前面の反応を確認。'],
  'abdominal-brace':['strength','基本','呼吸しながら腹部に力を入れる','マット','息こらえや過剰な力みがないことを確認。'],
  bridge:['strength','標準','お尻と体幹の筋力練習','マット','腰の伸展への反応と膝・首への負担を確認。'],
  'knee-to-chest':['mobility','基本','腰・股関節を曲げる練習','マット','屈曲で脚の痛みやしびれが増える場合は選択しない。'],
  'heel-slide':['mobility','基本','膝を曲げ伸ばしする練習','マット','腫れ・曲げたときの痛みに応じて範囲を設定。'],
  'short-arc-quad':['strength','基本','支えを使って膝を伸ばす','マット・丸めたタオル','伸展時の痛みと、膝をタオルに保てることを確認。'],
  'sit-to-stand':['function','標準','立ち座りの動作練習','安定した椅子','椅子の高さと手の支えを調整。膝折れや転倒リスクを確認。']
};
for(const [id,[category,difficulty,purpose,equipment,selectionNote]] of Object.entries(existingMetadata))Object.assign(EXERCISE_LIBRARY[id],{category,difficulty,purpose,equipment,selectionNote});
const DISEASE_LIBRARY = {
  shoulder:{name:'五十肩（肩関節周囲炎）',icon:'💪',desc:'可動域・肩まわりの筋力から選ぶ10種目',guidance:'疼痛・病期・可動域で選択します。強い疼痛期の無理なストレッチは避け、筋力運動は負荷への反応を確認してください。術後・外傷後の制限を優先します。'},
  lowback:{name:'腰痛',icon:'🌿',desc:'動き・体幹・歩行から選ぶ10種目',guidance:'原因と運動方向への反応を確認します。屈曲・伸展で脚の症状が悪化する種目は選択しません。新たな筋力低下や排尿・排便の異常は運動追加より診察を優先します。'},
  knee:{name:'変形性膝関節症（膝OA）',icon:'🦵',desc:'膝の動き・筋力・立位から選ぶ10種目',guidance:'腫れ・疼痛・膝折れ・転倒リスクに合わせ、範囲・負荷・支持物を調整してください。各10種目は候補であり、全種目を一律に処方するものではありません。'}
};
