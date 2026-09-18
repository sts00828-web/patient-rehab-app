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
    ['脚を伸ばして座り、膝の下に薄いタオルを置きます。','かかとを床につけたまま、太ももの前に軽く力を入れます。','膝裏で薄いタオルを軽く押して保ち、ゆっくり緩めます。'],'かかとを持ち上げる膝伸ばしとは別の運動です。膝を強く押し込みません。','kneeStrength'],
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
  knee:{name:'変形性膝関節症（膝OA）',icon:'🦵',desc:'膝の動き・筋力・立位から選ぶ10種目',guidance:'腫れ・疼痛・膝折れ・転倒リスクに合わせ、範囲・負荷・支持物を調整してください。各10種目は候補であり、全種目を一律に処方するものではありません。'},
  tennisElbow:{name:'上腕骨外側上顆炎（テニス肘）',icon:'🎾',desc:'肘・手首の動きと段階的な筋力練習10種目',guidance:'握る・持ち上げる作業量と運動後の症状を確認し、回数・重さ・頻度を個別に設定します。手首の筋力運動は段階違いの候補で、全種目を重ねて処方しません。赤み・熱感・腫れ、外傷後やしびれを伴う場合は診察・再評価を優先します。'}
};

const TENNIS_ELBOW_SOURCES = {
  mobility:'https://www.newcastle-hospitals.nhs.uk/services/newcastle-occupational-health-service/information-for-staff/physiotherapy/self-help-leaflets/tennis-elbow/',
  gentle:'https://www.rjah.nhs.uk/our-services/therapy/supported-self-care/tennis-elbow/',
  stages:'https://www.leicspart.nhs.uk/wp-content/uploads/2022/07/514-Tennis-Elbow.pdf',
  load:'https://msk-bexley.nhs.uk/conditions/elbow-pain/tennis-elbow',
  aaos:'https://orthoinfo.aaos.org/globalassets/pdfs/2022-therapeutic-exercise-program-for-epicondylitis.pdf'
};
const tennisElbowExercises = [
  ['elbow-bend-straighten','肘をゆっくり曲げ伸ばし','mobility','基本','肘の動きを保つ','椅子','動きの制限や外傷の有無を確認。痛い端まで伸ばし切らない。',
    ['椅子に座り、上腕を体の横に置きます。','力を抜いた手のまま、肘をゆっくり曲げます。','楽な範囲まで伸ばして戻します。'],'反動をつけず、痛みが増す範囲を避けます。','mobility'],
  ['forearm-turn','手のひらを上・下に返す','mobility','基本','前腕を回す動きの練習','机・タオル','まず重りなしで回旋への反応を確認。手首だけをひねらない。',
    ['肘を直角に曲げ、前腕を机で支えます。','手首をまっすぐ保ち、手のひらを上へ返します。','ゆっくり下へ返し、中央へ戻します。'],'肘や肩を大きく動かさず、楽な範囲で行います。','mobility'],
  ['wrist-active-extension','重りなしで手首を起こす','mobility','基本','手首を自分で動かす練習','机・タオル','手首を起こすだけで強く痛む場合は範囲や方法を見直す。',
    ['手のひらを下にして前腕を机に置き、手首を端から出します。','指の力を抜き、手首を少し上へ起こします。','前腕を机につけたまま、ゆっくり戻します。'],'大きく反らす必要はありません。重りは持ちません。','stages'],
  ['wrist-extensor-stretch','手首を下げて前腕の外側を伸ばす','mobility','標準','手首を起こす筋肉の柔軟性','椅子','伸張で外側の肘痛が増す場合は選択しない。肘の伸ばし具合を調整。',
    ['手のひらを下に向け、腕を前へ出します。','反対の手を手の甲に添え、手首を軽く下へ曲げます。','前腕が軽く伸びるところで保ち、ゆっくり緩めます。'],'強く押したり、痛みを我慢して伸ばしたりしません。','gentle'],
  ['wrist-flexor-stretch','手のひらを上にして前腕を伸ばす','mobility','標準','前腕の手のひら側の柔軟性','椅子','補助的な柔軟性の候補。手首や肘内側の痛み、しびれに注意。',
    ['腕を前へ出し、前腕を返して手のひらを上に向けます。','反対の手を指の付け根から手のひら側に添え、指先が下を向くよう手首を軽く反らします。','前腕の手のひら側が楽に伸びる範囲で保ち、ゆっくり戻します。'],'指先だけを強く引かず、しびれが出たら中止します。','aaos'],
  ['wrist-isometric-extension','手の甲で反対の手を軽く押す','strength','基本','手首を動かさずに力を入れる','机・タオル','軽い力での反応を評価。下ろす練習・重りの上げ下げとの負荷重複を調整。',
    ['手のひらを下にして前腕を机で支え、手首をまっすぐ保ちます。','反対の手を手の甲に当て、上へ起こすつもりで軽く押し合います。','手首を動かさずに保ち、ゆっくり力を抜きます。'],'強く押し合わず、呼吸を続けます。','gentle'],
  ['wrist-eccentric-extension','手首の重りをゆっくり下ろす','strength','標準','手首を下ろす動きで負荷をかける','机・タオル・軽い重り','重さ・下ろす速さをPTが設定。等尺性や上げ下げとの段階を選択。',
    ['手のひらを下にして前腕を机で支え、手首と手を端から出して指定の重りを持ちます。','反対の手で手首を起こしてから、支えを離します。','運動する側だけで重りをゆっくり下ろし、反対の手で持ち上げ直します。'],'重りに引かれて急に落とさず、肘の痛みが増す場合は負荷を下げます。','aaos'],
  ['wrist-resisted-extension','重りで手首を上げ下げする','strength','発展','手首を起こす筋肉の筋力練習','机・タオル・軽い重り','自分で上げ下げする負荷に耐えられる場合に。ほかの手首筋力種目との重複に注意。',
    ['手のひらを下にして前腕を机で支え、手首と手を端から出して指定の重りを持ちます。','前腕を動かさず、手首を少し上へ起こします。','手首をゆっくり下ろして戻します。'],'自己判断で重くせず、握り込みすぎないようにします。','stages'],
  ['gentle-ball-grip','柔らかいボールを軽く握る','strength','標準','握る力を少しずつ練習する','机・タオル・柔らかいボール','握力課題での症状を確認。仕事・家事で握る量も含めて負荷を調整。',
    ['前腕を机で支え、手首をまっすぐにします。','柔らかいボールを軽く握ります。','指定の時間で力を緩め、手を休めます。'],'全力で握らず、肘の痛みが増す強さでは行いません。','load'],
  ['resisted-forearm-turn','軽い重りで前腕を返す','strength','発展','前腕を回す筋力の練習','机・タオル・軽い重り','重りなしの回旋が可能な場合に。重さと回す範囲を指定。',
    ['肘を直角に曲げて前腕を机で支え、指定の軽い重りを持ちます。','手首をまっすぐに保ち、手のひらをゆっくり上・下へ返します。','中央へ戻し、力を緩めます。'],'重りの勢いでひねらず、肩や肘で代わりに動かしません。','load']
];
for(const [id,name,category,difficulty,purpose,equipment,selectionNote,steps,caution,source] of tennisElbowExercises){
  EXERCISE_LIBRARY[id]={name,region:'tennisElbow',image:id+'.png',params:'回数・時間・重さはPTと設定',category,difficulty,purpose,equipment,selectionNote,steps,caution,source:TENNIS_ELBOW_SOURCES[source]};
}
EXERCISE_LIBRARY['wrist-flexor-stretch'].image='wrist-flexor-stretch-v3.png';
EXERCISE_LIBRARY['kneeling-plank'].image='kneeling-plank-v2.png';
EXERCISE_LIBRARY['wrist-extensor-stretch'].image='wrist-extensor-stretch-v2.png';
EXERCISE_LIBRARY['forearm-turn'].image='forearm-turn-v2.png';

// Editorial relationships for clinician selection, not automatic prescriptions or clinical stages.
const EXERCISE_CHOICE_GROUPS = {
  'shoulder-elevation':{name:'腕を前へ上げる',note:'姿勢と支え方の違う候補です。痛み・可動域に合う方法を選び、重ねる場合は運動量を調整します。'},
  'scapular-control':{name:'肩甲骨まわりの運動',note:'軽い動作練習と抵抗運動で目的の一部が重なります。負荷への反応で選びます。'},
  'trunk-support':{name:'体幹を支える',note:'腹部の収縮練習と支持負荷の大きい練習です。姿勢を保てる範囲で選びます。'},
  'back-mobility':{name:'背中・骨盤を丸めて戻す',note:'姿勢の違う可動性の候補です。同方向で症状が増えないか確認します。'},
  'knee-quadriceps':{name:'太もも前の筋力',note:'力を入れて保つ・膝を伸ばす・膝を伸ばしたまま脚を上げる候補です。必要な方法を選び、同じ筋肉への負荷を合算します。'},
  'knee-supported-function':{name:'立ち座り・浅い屈伸',note:'両脚で体を上げ下げする近い課題です。椅子移乗の目標や支えの必要性で選びます。'},
  'wrist-extension-load':{name:'手首を起こす筋肉への負荷',note:'重りなし・等尺性・下ろす運動・上げ下げの候補です。全種類を必須にせず、仕事や家事も含め負荷を調整します。'},
  'forearm-rotation':{name:'前腕を上・下に返す',note:'同じ回旋動作の重りなし・重りありです。回旋への反応と必要な負荷で選びます。'}
};
const choiceVariants = {
  'shoulder-elevation':{'supine-flexion':'あお向け・反対腕の介助','table-slide':'座位・机で支持','wall-slide':'立位・壁で支持'},
  'scapular-control':{'scapular-setting':'軽い動きの練習','band-row':'バンドの抵抗を加える'},
  'trunk-support':{'abdominal-brace':'あお向けで腹部の収縮','kneeling-plank':'両肘・両膝で体を支持'},
  'back-mobility':{'pelvic-tilt':'あお向けで骨盤を動かす','cat-camel':'四つ這いで背中を動かす'},
  'knee-quadriceps':{'quad-setting':'かかとは床・力を入れて保つ','short-arc-quad':'膝下を支え、かかとだけを上げる','seated-knee-extension':'椅子で膝を伸ばす','straight-leg-raise':'膝を伸ばして脚全体を上げる'},
  'knee-supported-function':{'sit-to-stand':'椅子からの移乗','mini-squat':'台で支える浅い屈伸'},
  'wrist-extension-load':{'wrist-active-extension':'重りなしで動かす','wrist-isometric-extension':'動かさず軽く押し合う','wrist-eccentric-extension':'反対手で上げ、患側で下ろす','wrist-resisted-extension':'患側で上げ下げする'},
  'forearm-rotation':{'forearm-turn':'重りなし','resisted-forearm-turn':'指定の重りを加える'}
};
for(const [group,variants] of Object.entries(choiceVariants))for(const [id,variant] of Object.entries(variants))Object.assign(EXERCISE_LIBRARY[id],{choiceGroup:group,choiceVariant:variant});
for(const e of Object.values(EXERCISE_LIBRARY))e.clinicalRole='主な運動候補';
for(const id of ['pendulum','scapular-setting','walking','heel-raise','side-lying-hip-abduction','elbow-bend-straighten','forearm-turn','wrist-flexor-stretch'])EXERCISE_LIBRARY[id].clinicalRole='補助的な運動候補';
for(const id of ['shoulder-isometric-external','shoulder-isometric-internal','band-row','knee-to-chest','prone-on-elbows','bird-dog','kneeling-plank','wrist-active-extension','wrist-extensor-stretch','resisted-forearm-turn'])EXERCISE_LIBRARY[id].clinicalRole='症状・動作能力を確認して選択';
EXERCISE_LIBRARY['quad-setting'].source='https://www.mskdorset.nhs.uk/knee-pain/knee-pain-osteoarthritis-of-the-knee/';
EXERCISE_LIBRARY['quad-setting'].selectionNote='静的な太ももの収縮。原資料のあお向けで膝裏を床へ押す方法を、長座位・薄いタオルで調整した例です。かかとは床につけ、膝を無理に押し切りません。';
EXERCISE_LIBRARY['wrist-active-extension'].source=TENNIS_ELBOW_SOURCES.gentle;
EXERCISE_LIBRARY['wrist-resisted-extension'].source=TENNIS_ELBOW_SOURCES.load;
DISEASE_LIBRARY.knee.guidance+=' 太もも前の筋力4種と立ち座り・浅い屈伸2種は同系統の候補です。違いを確認して選び、負荷を合算します。';
EXERCISE_LIBRARY['wrist-eccentric-extension'].imageCaption='図は重りを下ろす場面です。上げるときは反対の手で補助し、下ろすときは補助を離します。';
EXERCISE_LIBRARY['resisted-forearm-turn'].imageCaption='図は開始姿勢の例です。肘・前腕を支え、手首をまっすぐ保って手のひらを上・下へ返します。';
EXERCISE_LIBRARY['shoulder-isometric-internal'].imageCaption='肘を脇につけたまま、運動する側の手首をお腹の方向へ押し、反対の手で受け止めます。腕が動かない程度の軽い力にします。';
EXERCISE_LIBRARY['wrist-flexor-stretch'].imageCaption='手のひらを上へ向けた姿勢から、指先を下へ向けるよう手首を反らした場面です。反対の手で手のひら側を支え、指先だけを引きません。';

// First neck/shoulder batch: conservative care selected after clinical assessment.
const NECK_SHOULDER_SOURCES = {
  neckRotation:'https://www.nhs.uk/live-well/exercise/sitting-exercises/',
  cervical:'https://msk-bexley.nhs.uk/conditions/neck-pain/cervical-spondylosis',
  neckSideBend:'https://www.csp.org.uk/conditions/neck-pain/video-exercises-neck-pain',
  cuff:'https://www.rjah.nhs.uk/our-services/therapy/supported-self-care/rotator-cuff-related-shoulder-pain/',
  shoulder:EXERCISE_SOURCES.shoulder
};
const neckShoulderAdditions = [
  ['neck-rotation','cervicalSpondylosis','椅子で顔をゆっくり左右へ向ける','mobility','基本','首を回す動きの練習','椅子',
    '脊髄症・進行する神経症状を除外し、回旋で腕の痛みやしびれ、めまいが増えない方向と範囲を確認。',
    ['椅子に座り、肩の力を抜いて正面を向きます。','あごを上げず、楽な範囲で顔を片側へゆっくり向けます。','正面へ戻し、PTに指定された側と範囲で繰り返します。'],
    '手で首をひねりません。新しいしびれ、腕へ広がる痛み、めまいが出たら中止して相談してください。','neckRotation'],
  ['neck-retraction','cervicalSpondylosis','あごを軽く後ろへ引く','mobility','基本','首を前へ突き出さず頭の位置を動かす','椅子',
    '小さい後退運動への症状反応を確認。しびれが増える場合は選ばず、首の変形を矯正する目的では用いない。',
    ['椅子に座り、肩の力を抜いて正面を向きます。','目線を水平に保ち、頭をわずかに後ろへ滑らせるようにあごを引きます。','呼吸を続け、ゆっくり力を抜いて元の位置へ戻します。'],
    '手であごを押し込まず、上を向いたり深くうつむいたりしません。腕の痛みやしびれが増えたら中止します。','cervical'],
  ['neck-side-bend','cervicalSpondylosis','首を小さく横へ傾ける','mobility','標準','首を横へ傾ける動きの練習','椅子',
    '側屈で腕へ症状が広がらない側と範囲をPTが指定。原資料の動きを小さい範囲に調整した例。',
    ['椅子に座り、両肩の力を抜いて正面を向きます。','顔を正面に向けたまま、耳を肩へ少し近づけるよう首を横へ傾けます。','ゆっくり中央へ戻し、PTに指定された側で行います。'],
    '手で頭を引かず、肩をすくめません。しびれや腕へ広がる痛み、めまいが出たら中止して相談します。','neckSideBend'],
  ['neck-isometric-side','cervicalSpondylosis','頭と手で横向きに軽く押し合う','strength','標準','首を動かさず軽く力を入れる','椅子',
    '首の等尺性収縮が許可された場合のみ。力の強さ・保持時間・実施側を指定し、腕を上げる負担も確認。',
    ['椅子に座り正面を向き、片手を同じ側のこめかみ付近へ添えます。','頭を横へ倒すつもりでごく軽く押し、手で受け止めます。','頭を動かさず呼吸を続けてから、ゆっくり力を抜きます。'],
    '全力で押さず、息を止めません。首や腕の痛み、しびれが増えたら中止します。','cervical'],
  ['shoulder-band-external','shoulderImpingement','ゴムバンドで腕を外へ開く','strength','発展','肩を外へ回す筋肉へ抵抗を加える','ゴムバンド・固定具',
    '外旋の抵抗運動が可能な場合。等尺性外旋との段階を選択し、固定具・抵抗・動かす範囲をPTが確認。',
    ['PTに指定された高さで固定したバンドを持ち、肘を脇につけて直角に曲げます。','肘を脇に保ち、手をゆっくり外へ開きます。','体をひねらず、ゆっくり元の位置へ戻します。'],
    'バンドの傷や固定の緩みを確認し、肩をすくめたり肘を横へ持ち上げたりしません。痛みが増す負荷は避けます。','shoulder'],
  ['wall-push-up','shoulderImpingement','壁に手をついて軽く腕立て','strength','発展','腕で支えながら肩まわりを使う','壁',
    '肩・手首への荷重と立位が安定する場合。壁と足の距離、肘を曲げる深さをPTが指定。',
    ['壁に向かって立ち、肩幅より少し広く両手を壁につけます。','体を一直線に保ち、肘を肩の高さより下で曲げて胸を壁へ近づけます。','壁を軽く押し、ゆっくり元の姿勢へ戻します。'],
    '腰を反らさず、顔を壁へ突き出しません。肩や手首の痛みが増える場合は負荷を下げて相談します。','cuff']
];
for(const [id,region,name,category,difficulty,purpose,equipment,selectionNote,steps,caution,source] of neckShoulderAdditions){
  EXERCISE_LIBRARY[id]={name,region,image:id+'.png',params:'回数・時間・範囲・負荷はPTと設定',category,difficulty,purpose,equipment,selectionNote,steps,caution,source:NECK_SHOULDER_SOURCES[source],clinicalRole:'症状・動作能力を確認して選択'};
}
EXERCISE_CHOICE_GROUPS['neck-mobility']={name:'首の可動性の練習',note:'回旋・側屈・頭の後退で動く方向が異なります。症状が増えない方向だけを選び、すべての方向を無理に行いません。'};
for(const [id,variant] of Object.entries({'neck-rotation':'顔を左右へ向ける','neck-side-bend':'耳を肩へ近づける','neck-retraction':'目線を水平に保ち頭を後ろへ動かす'}))Object.assign(EXERCISE_LIBRARY[id],{choiceGroup:'neck-mobility',choiceVariant:variant});
EXERCISE_CHOICE_GROUPS['shoulder-external-load']={name:'肩を外へ回す筋肉への負荷',note:'動かさず力を入れる方法とバンドに逆らって動かす方法です。症状に合わせた段階を選び、併用する場合は負荷を合算します。'};
Object.assign(EXERCISE_LIBRARY['shoulder-isometric-external'],{choiceGroup:'shoulder-external-load',choiceVariant:'壁で受け止め、動かさず力を入れる'});
Object.assign(EXERCISE_LIBRARY['shoulder-band-external'],{choiceGroup:'shoulder-external-load',choiceVariant:'バンドの抵抗で外へ動かす'});
EXERCISE_LIBRARY['neck-retraction'].imageCaption='図の矢印は動かす方向を示します。目線を水平に保ち、頭全体をわずかに後ろへ動かします。首を深く曲げたり、手であごを押したりしません。';
EXERCISE_LIBRARY['wall-push-up'].imageCaption='図は肘を軽く曲げた場面です。手と足の位置を変えず、体を一直線に保って肘を伸ばし、戻します。壁との距離と曲げる深さはPTに確認します。';
EXERCISE_LIBRARY['neck-isometric-side'].imageCaption='頭と手で軽く押し合い、頭の位置は正面のまま保ちます。手はこめかみに添え、首を引っ張らないでください。';
EXERCISE_LIBRARY['shoulder-band-external'].imageCaption='肘を脇につけた外旋です。肘を肩の高さまで上げる方法とは異なります。固定位置とバンドの強さはPTに確認します。';
DISEASE_LIBRARY.cervicalSpondylosis={
  name:'頚椎症（保存療法・PT評価後）',icon:'🌱',desc:'脊髄症を除外し、首の動き・補助運動から選ぶ7候補',
  guidance:'診察・PT評価後の保存療法用です。脊髄症またはその疑い、進行する神経症状、外傷直後・術後には使いません。手の不器用さ、歩行の変化、両手足のしびれ、新しい筋力低下は速やかに再評価し、急な歩行不能や排尿・排便の異常は緊急受診を優先します。首は症状が増えない小さな範囲で動かし、手で引っ張りません。肩甲骨運動・バンド引き・歩行は補助候補です。',
  prescriptionNote:'医師・PTが許可した保存療法中の運動です。首は小さな範囲で動かし、手で引っ張りません。新しいしびれ・腕へ広がる痛み・めまいが出たら中止して相談してください。手の不器用さ、歩行の変化、筋力低下は速やかに受診し、急な歩行不能や排尿・排便の異常は緊急受診してください。',
  exerciseKeys:['neck-rotation','neck-retraction','neck-side-bend','neck-isometric-side','scapular-setting','band-row','walking']
};
DISEASE_LIBRARY.shoulderImpingement={
  name:'肩インピンジメント（保存療法）',icon:'💪',desc:'腱板関連痛の動き・負荷を選ぶ8候補',
  guidance:'腱板関連痛・肩峰下痛に対する診察・PT評価後の保存療法用です。外傷後の急な挙上不能・脱力、脱臼、術後の保護期は別の指示を優先します。机・壁の挙上は支持の違い、等尺性・バンド外旋は負荷の違いとして選択。棒での外旋は可動域制限がある場合だけ、壁腕立ては肩と手首に荷重できる場合だけ選びます。仕事・家事の負荷も含め調整し、競技復帰の判定には使いません。',
  prescriptionNote:'診察・PT評価後の保存療法中に、指定された範囲と負荷で行います。術後・脱臼後の指示とは別です。運動後から翌日に痛みが明らかに増える場合は負荷を下げ相談してください。けがの後に急に腕が上がらない、脱力が進む、発熱・強い腫れ・赤みがある場合は運動を中止し受診してください。',
  exerciseKeys:['table-slide','wall-slide','stick-external-rotation','scapular-setting','shoulder-isometric-external','shoulder-band-external','band-row','wall-push-up']
};

// Second batch: reuse reviewed movements only where individually indicated.
DISEASE_LIBRARY.rotatorCuffTear={
  name:'腱板断裂（保存療法・PT評価後）',icon:'💪',desc:'断裂の状態・負荷の許可を確認して選ぶ6候補',
  guidance:'医師が保存療法を選択し、PTが断裂部位・残存筋力・痛みを評価した後の候補です。術後、外傷後に急に腕が上がらない場合、進行する脱力、強い安静時痛・夜間痛はこのメニューを使わず再評価を優先します。運動で切れた腱をつなぐことを目的にしません。机・あお向けの挙上は支持の違う代替です。等尺性外旋とバンド引きは抵抗運動の許可後だけ選びます。無症状・機能障害がなければ画像所見だけで運動を追加しません。',
  prescriptionNote:'医師・PTが許可した保存療法中の運動です。術後には使いません。支える腕も含め、指定された範囲・負荷で行います。けがの後に急に腕が上がらない、脱力が進む、強い夜間痛が続く場合は中止し早めに受診してください。赤み・熱感・発熱を伴う場合も受診してください。',
  exerciseKeys:['pendulum','table-slide','supine-flexion','scapular-setting','shoulder-isometric-external','band-row'],
  sources:[
    {title:'日本整形外科学会：肩腱板断裂',url:'https://www.joa.or.jp/public/sick/condition/rotator_cuff_tear.html'},
    {title:'AAOS：Rotator Cuff Tears',url:'https://www.orthoinfo.org/diseases--conditions/rotator-cuff-tears'},
    {title:'Kingston and Richmond NHS：Shoulder exercises for a rotator cuff tear',url:'https://www.kingstonandrichmond.nhs.uk/patients-and-families/patient-leaflets/shoulder-exercises-rotator-cuff-tear'},
    {title:'Bexley NHS：Rotator Cuff Tears（動作の参考）',url:'https://msk-bexley.nhs.uk/conditions/shoulder-pain/rotator-cuff-tears'}
  ]
};

DISEASE_LIBRARY.cervicalDiscHerniation={
  name:'頚椎椎間板ヘルニア（保存療法・PT評価後）',icon:'🌱',desc:'脊髄症を除外し、症状が安定した人の4候補',
  guidance:'脊髄症を除外し、症状が落ち着いて医師・PTが運動を許可した保存療法中の候補です。脊髄症またはその疑い、進行する筋力低下、外傷直後・術後には使いません。回旋・頭の後退は腕や手へ症状が広がらない方向と範囲だけを選びます。肩甲骨運動・歩行は補助で、歩行やバランスに異常があれば歩行練習より診察を優先します。首の強い伸展、手で引くストレッチ、自己牽引を行いません。運動が不要と判断された場合は処方しません。',
  prescriptionNote:'医師・PTが許可した保存療法中の運動です。術後には使いません。指定された小さな範囲で行い、首を手で引っ張りません。新しいしびれ、腕・手へ広がる痛み、めまいが出たら中止して相談してください。手の不器用さ、歩行の変化、筋力低下は速やかに受診し、急な歩行不能や排尿・排便の異常は緊急受診してください。',
  exerciseKeys:['neck-rotation','neck-retraction','scapular-setting','walking'],
  sources:[
    {title:'AAOS：Cervical Radiculopathy',url:'https://www.orthoinfo.org/diseases--conditions/cervical-radiculopathy-pinched-nerve/'},
    {title:'Bexley NHS：Cervical Radiculopathy',url:'https://msk-bexley.nhs.uk/conditions/neck-pain/cervical-radiculopathy'},
    {title:'Dynamic Health NHS：Cervical myelopathy and radiculopathy',url:'https://dynamichealth.nhs.uk/help-and-advice/neck-pain/cervical-myelopathy-and-radiculopathy/'},
    {title:'Norfolk NHS：Cervical Radiculopathy',url:'https://www.norfolkandwaveneycommunityhealth.nhs.uk/msk/self-help/neck/cervical-radiculopathy/'}
  ]
};

// Individual clearance is required; these are not postoperative protocols.
DISEASE_LIBRARY.anteriorShoulderDislocation={
  name:'肩関節前方脱臼後（整復後・運動許可済み）',icon:'💪',desc:'骨折・骨傷なしの保存療法に限定する4候補',
  guidance:'前方脱臼が整復され、骨折・骨傷がないことを確認し、医師・PTが保存療法で運動を許可した人の候補です。開始日・装具・範囲・負荷は個別指示を優先します。未整復、方向不明・後方・下方脱臼、再脱臼を繰り返す状態、神経・血管障害、術後には使いません。肩を横へ開いたまま大きく外へ回す姿勢を避け、机の運動も指定範囲内にします。内旋・外旋は肘を体側に置いた軽い等尺性運動で、腕を外へ開くストレッチとは異なります。競技復帰の判定には使いません。',
  prescriptionNote:'前方脱臼の整復後、骨折・骨傷がなく医師・PTが許可した保存療法中の運動です。術後には使いません。装具・開始日・範囲・負荷の指示を守り、肩を横へ開いたまま大きく外へ回しません。抜けそうな感じや痛みが増したら中止して相談してください。変形や再脱臼、手の冷たさ・色の変化、強いしびれ・脱力は速やかに受診し、自分で戻しません。',
  exerciseKeys:['table-slide','scapular-setting','shoulder-isometric-external','shoulder-isometric-internal'],
  sources:[
    {title:'AAOS：Shoulder Dislocation',url:'https://www.orthoinfo.org/diseases--conditions/dislocated-shoulder'},
    {title:'Leeds NHS：Anterior shoulder dislocation without bony injury',url:'https://www.leedsth.nhs.uk/patients/resources/anterior-shoulder-dislocation-without-bony-injury/'},
    {title:'Bexley NHS：Shoulder Instability（動作の参考）',url:'https://msk-bexley.nhs.uk/conditions/shoulder-pain/shoulder-instability'}
  ]
};
DISEASE_LIBRARY.slapLesion={
  name:'SLAP損傷（保存療法・PT評価後）',icon:'💪',desc:'症状と負荷を確認して選ぶ基礎運動4候補',
  guidance:'診察で症状と損傷の関係を確認し、医師・PTが保存療法で運動を許可した人の基礎候補です。画像所見だけで処方せず、術後、脱臼後の保護期、強い不安定感や急な脱力がある場合には使いません。机の運動は可動域制限がある場合だけ選び、外旋の等尺性とバンドは負荷の段階として選びます。引っかかりや痛みを我慢して反復しません。後方の硬さへのストレッチ、上腕二頭筋への負荷、投球復帰は別途評価・指導が必要で、この4候補のみでは完結しません。',
  prescriptionNote:'医師・PTが許可した保存療法中に、指定範囲・負荷で行う基礎運動です。術後には使いません。痛み・引っかかり・抜けそうな感じが増す場合は中止して相談してください。投球、懸垂、重い物を頭上へ持ち上げる動作は自己判断で再開しません。急な脱力、腕が上がらない、変形、強い腫れ・赤み・発熱は受診してください。',
  exerciseKeys:['table-slide','scapular-setting','shoulder-isometric-external','shoulder-band-external'],
  sources:[
    {title:'AAOS：SLAP Tears',url:'https://www.orthoinfo.org/diseases--conditions/slap-tears'},
    {title:'NATA：SLAP損傷の評価・治療・復帰基準に関する声明（2018）',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC5894372/'},
    {title:'AAOS：肩の運動（一般動作の参考）',url:'https://orthoinfo.aaos.org/globalassets/pdfs/2017-rehab_shoulder.pdf'}
  ]
};
