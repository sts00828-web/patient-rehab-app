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
    caution:'始める前に椅子の高さと手の支え方を担当の理学療法士と確認してください。ふらつく場合は一人で行わないでください。',source:'https://roh.nhs.uk/services-information/therapy/exercises-for-osteoarthritis-of-the-knee'}
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
    ['手のひらを下にして前腕を机で支え、手首と手を端から出して指定の重りを持ちます。','反対の手で手首を起こしてから、支えを離します。','運動する側だけで重りをゆっくり下ろし、反対の手で持ち上げ直します。'],'重りに引かれて急に落とさないでください。肘の痛みが増す場合はいったん中止し、担当の理学療法士に負荷と再開方法を相談してください。','aaos'],
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
EXERCISE_LIBRARY['sit-to-stand'].imageCaption='腕を組む姿勢は一例です。腕を組む必要はありません。担当の理学療法士が指定した椅子の高さと手の支え方で行ってください。';
EXERCISE_LIBRARY['pelvic-tilt'].imageCaption='お尻を床につけたまま、腰と床の隙間をそっと小さくし、力を抜いて元に戻します。腰を強く反らしたり、お尻を持ち上げたりしません。';

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
    '腰を反らさず、顔を壁へ突き出しません。肩や手首の痛みが増える場合はいったん中止し、担当の理学療法士に負荷と再開方法を相談してください。','cuff']
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
  prescriptionNote:'診察・PT評価後の保存療法中に、指定された範囲と負荷で行います。術後・脱臼後の指示とは別です。運動後から翌日に痛みが明らかに増える場合はいったん中止し、担当の理学療法士に負荷と再開方法を相談してください。けがの後に急に腕が上がらない、脱力が進む、発熱・強い腫れ・赤みがある場合は運動を中止し受診してください。',
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

// Lumbar conditions: diagnosis and symptom response, not imaging alone, guide selection.
DISEASE_LIBRARY.lumbarSpinalStenosis={
  name:'腰部脊柱管狭窄症（保存療法・PT評価後）',icon:'🚶',desc:'症状反応と歩行能力を確認して選ぶ5候補',
  guidance:'診察で血管性の歩行障害などを鑑別し、医師・PTが運動を許可した保存療法中の候補です。術後、進行する筋力低下、排尿・排便の異常は対象外です。膝抱え・膝倒しは症状が増えない方向と範囲だけを選択します。立ち座りと横向きの脚上げは下肢機能に応じた補助運動です。歩行は症状を我慢する持久力試験にせず、休憩場所・補助具・一回の時間を個別に設定します。前かがみで楽になるとは限らず、画像上の狭窄だけで運動を追加しません。',
  prescriptionNote:'医師・PTが許可した保存療法中の運動です。術後には使いません。脚の痛み・しびれが増えたら中止し相談してください。歩行は指定時間内で症状が強くなる前に休み、補助具の指示を守ります。新たに尿が出にくい・尿や便が漏れる、股の間の感覚が鈍い、急な両脚の脱力があれば直ちに救急受診してください。進む筋力低下も早急に受診してください。',
  exerciseKeys:['knee-to-chest','knee-rolls','side-lying-hip-abduction','sit-to-stand','walking'],
  sources:[
    {title:'Bexley NHS：Spinal Stenosis（保存療法・運動方法の参考）',url:'https://msk-bexley.nhs.uk/conditions/back-pain/spinal-stenosis'},
    {title:'Dynamic Health NHS：Lumbar stenosis（運動方法の参考）',url:'https://dynamichealth.nhs.uk/help-and-advice/lower-back-pain/lumbar-stenosis/'}
  ]
};
DISEASE_LIBRARY.lumbarDiscHerniation={
  name:'腰椎椎間板ヘルニア（保存療法・PT評価後）',icon:'🌱',desc:'症状が安定し、反応を確認できた人の4候補',
  guidance:'医師・PTが保存療法で運動を許可し、進行する神経症状がない人の候補です。術後・急激な症状悪化は対象外です。ヘルニアという診断名だけで伸展運動を処方しません。うつ伏せで肘をつく運動は、院内で脚の症状が広がらず適切な反応が得られることをPTが確認した場合だけ選択し、範囲・保持時間を指定します。腹部の運動・四つ這いの手足上げは症状が落ち着き体幹練習を許可した段階、歩行は症状が増えない短時間から個別設定します。運動でヘルニアを押し戻すという説明はしません。',
  prescriptionNote:'医師・PTが許可した保存療法中の運動です。術後には使いません。指定範囲・時間を守り、脚の先へ痛みやしびれが広がる、新たな脱力が出る場合は中止して相談してください。腰を反らす運動は院内で確認した場合だけ行います。新たに尿が出にくい・尿や便が漏れる、股の間の感覚が鈍い、急な両脚の脱力があれば直ちに救急受診してください。進む筋力低下も早急に受診してください。',
  exerciseKeys:['prone-on-elbows','abdominal-brace','bird-dog','walking'],
  sources:[{title:'NHS：Slipped disc（活動・受診の目安。個別種目の直接検証ではありません）',url:'https://www.nhs.uk/conditions/slipped-disc/'}]
};

// Shared lower-limb movements. No automatic progression or clearance for sport.
EXERCISE_LIBRARY['ankle-pumps']={
  name:'足首をゆっくり曲げ伸ばしする',region:'ankleSprain',image:'ankle-pumps.png',params:'回数・範囲はPTと設定',category:'mobility',difficulty:'基本',purpose:'足首の曲げ伸ばしを取り戻す',equipment:'マット',selectionNote:'固定を外して動かす許可と座位の安定を確認。足首を内外へひねらない。',clinicalRole:'症状・動作能力を確認して選択',
  steps:['脚を前に伸ばして座り、両手を後ろについて上体を支えます。','指定された側のかかとを床につけたまま、足先をすねの方へゆっくり起こします。','次に足先をゆっくり遠ざけ、楽な位置へ戻します。足首を横にひねりません。'],
  caution:'装具や固定は自己判断で外しません。痛み・腫れが増える場合は中止し相談してください。',imageCaption:'左図は足先を起こす場面、右図は遠ざける場面です。図は両側ですが、指定された側だけ動かします。指だけでなく足首から動かします。',source:'https://www.worcsacute.nhs.uk/leaflets/ankle-sprain/'
};
EXERCISE_LIBRARY['supported-single-leg-stance']={
  name:'台につかまって片脚で立つ',region:'ankleSprain',image:'supported-single-leg-stance.png',params:'時間・支え方はPTと設定',category:'function',difficulty:'標準',purpose:'片脚で体を支えるバランスを練習する',equipment:'動かない安定した台・滑りにくい靴',selectionNote:'片脚への全荷重が許可され、手で支えて安全に立てる場合だけ選択。見守りの要否を確認。',clinicalRole:'荷重許可・転倒リスクを確認して選択',
  steps:['動かない台のそばに立ち、指定された手の支え方で台をつかみます。','指定された運動側の足裏全体を床につけ、反対の足を少しだけ浮かせます。','目を開けたまま指定時間だけ保ち、浮かせた足をゆっくり床へ戻します。'],
  caution:'手を離す・目を閉じる・不安定な床で行う変更はしません。ぐらつき・痛みが出たら両足を床に戻して中止します。見守りを指示された場合は一人で行いません。',imageCaption:'運動する側は床について体を支える脚です。浮かせる脚とは逆です。図の左右に合わせず、PTが指定した側と手の支え方で行います。',source:'https://www.worcsacute.nhs.uk/leaflets/ankle-sprain/'
};
DISEASE_LIBRARY.ankleSprain={
  name:'足関節捻挫（外側・保存療法・PT評価後）',icon:'🦶',desc:'運動・荷重の許可を確認して選ぶ4候補',
  guidance:'外側靭帯の捻挫で、骨折・脱臼・高位捻挫などを除外し、医師・PTが保存療法で運動を許可した人の候補です。内側・高位捻挫、術後、強い不安定性はこの汎用メニューの対象外です。足首の曲げ伸ばしは可動域運動の許可後、かかと上げ・歩行は荷重許可後、片脚立ちは片脚への全荷重と支持下での安定を確認後に選択します。装具・松葉杖・開始時期は個別指示を優先。4候補だけで競技復帰の判定はできません。',
  prescriptionNote:'医師・PTが許可した外側の足首捻挫の保存療法用です。術後には使いません。装具・荷重・開始時期の指示を守り、走る・跳ぶ・ひねる動作を自己判断で再開しません。運動後から翌日に痛み・腫れが増える場合は中止し相談してください。片脚立ちは台で支え、見守りの指示を守ります。足先の冷たさ・色の変化・強いしびれ、変形、急な荷重不能は速やかに受診してください。',
  exerciseKeys:['ankle-pumps','heel-raise','supported-single-leg-stance','walking'],
  sources:[{title:'Worcestershire NHS：Ankle Sprain（段階別運動の参考）',url:'https://www.worcsacute.nhs.uk/leaflets/ankle-sprain/'}]
};
DISEASE_LIBRARY.meniscalInjury={
  name:'半月板損傷（保存療法・PT評価後）',icon:'🦵',desc:'腫れ・引っかかりと荷重を確認して選ぶ6候補',
  guidance:'医師が保存療法を選択し、PTが腫れ・可動域・荷重能力を評価した人の候補です。縫合・部分切除などの術後、膝がロックして動かない場合、荷重不能、強い不安定性や急激な腫れは対象外です。踵滑らせは指定された屈曲範囲だけ、膝押しと脚上げは伸展と筋制御に応じて選び負荷を合算します。ブリッジ・横向きの脚上げは補助、浅いスクワットは荷重許可と安定を確認後。深い屈曲・ひねり・ジャンプは含めません。断裂形態による制限を優先し、画像所見だけで一律処方しません。',
  prescriptionNote:'医師・PTが許可した保存療法中の運動です。半月板の縫合・切除など術後には使いません。指定された曲げる範囲・荷重を守り、深くしゃがむ・膝をひねる・跳ぶ動作を自己判断で追加しません。運動後から翌日に腫れ・痛みが増えたら中止して相談してください。膝が引っかかって動かない、急な強い腫れ、体重をかけられない場合は早急に受診してください。赤み・熱感・発熱がある場合も受診してください。',
  exerciseKeys:['heel-slide','quad-setting','straight-leg-raise','bridge','side-lying-hip-abduction','mini-squat'],
  sources:[{title:'Bexley NHS：Meniscal Tear in the Knee（保存療法と運動方法の参考）',url:'https://msk-bexley.nhs.uk/conditions/knee-pain/meniscal-tear-in-the-knee'},{title:'NHS：Meniscus tear（受診・治療の目安）',url:'https://www.nhs.uk/conditions/meniscus-tear/'}]
};

// Advanced athlete movements. Doses are editable drafts, not return-to-sport tests.
(()=>{
  const fifa='https://doi.org/10.15857/ksep.2019.28.2.141';
  const strength='https://www.orthoinfo.org/staying-healthy/starting-a-strength-training-program/';
  const rows=[
    ['forearm-plank','プランク（膝をつかない）',2,'体幹をまっすぐ保つ力を鍛える','マット',
      ['うつ伏せから肘を肩の真下につき、両つま先を床につけます。','膝を床から離し、頭からかかとまでをまっすぐに保ちます。','呼吸を続けて指定時間保ち、膝を床について休みます。'],
      '腰を反らす・お尻を高く上げる・息を止める動作を避けます。姿勢が崩れる前に終了します。',fifa,'肘と両つま先で支えます。膝は床につけません。'],
    ['side-plank','サイドプランク（膝を伸ばす）',2,'体幹の横方向の支持力を鍛える','マット',
      ['指定された側を下にして横向きになり、肘を肩の真下に置きます。','両膝を伸ばして足を重ね、下側の前腕と足の外側で支えて腰を浮かせます。','胸と骨盤を正面に保ち、指定時間で腰をゆっくり床に戻します。'],
      '肩に痛みや抜けそうな感じがある場合は中止します。腰をねじらず、呼吸を続けます。',fifa,'運動する側は下になって支える側です。図と左右が違っても処方された側で行います。'],
    ['single-leg-plank','プランクで片脚を浮かせて保つ',3,'片脚を動かしても体幹を安定させる','マット',
      ['両前腕と両つま先で通常のプランクを作ります。','指定された脚を膝を伸ばしたまま少しだけ浮かせ、骨盤を水平に保ちます。','指定時間で足を戻し、膝をついて休みます。反対側は処方された場合だけ行います。'],
      '脚を高く上げて腰を反らしません。通常のプランクで安定できない場合は選択しません。',fifa,'運動する側は浮かせる脚です。腰の高さは変えません。'],
    ['side-plank-leg-lift','サイドプランクで上の脚を浮かせる',3,'体幹の横方向と股関節の支持力を鍛える','マット',
      ['指定された側を下にし、膝を伸ばしたサイドプランクを作ります。','上の脚を少し離し、胸と骨盤の向きを変えずに保ちます。','指定時間で上の脚を戻し、腰を床に下ろして休みます。'],
      '腰をねじる・骨盤が落ちる・肩がすくむ場合は終了します。脚を高く上げすぎません。',fifa,'運動する側は下の支持側です。浮かせるのは反対側の脚です。'],
    ['split-squat','足を前後に開いてしゃがむ（スプリットスクワット）',2,'片脚に比重を置いて下肢の筋力を鍛える','滑らない靴・平らな床',
      ['指定された脚を前にして足を前後に開き、後ろのかかとを上げます。','足の位置を変えず、前の膝をつま先と同じ向きに曲げて体を下げます。','前足の裏で床を押し、ゆっくり元の高さに戻ります。'],
      '深さはPTの指定まで。膝を内側に入れず、前のかかとを浮かせません。重りは指定された場合だけ使います。',strength,'運動する側は前の脚です。図の深さまで下げる必要はありません。'],
    ['single-leg-squat','片脚でしゃがむ（片脚スクワット）',3,'片脚で膝と骨盤を制御する力を鍛える','滑らない靴・平らな床',
      ['指定された脚で立ち、反対の足を少し前に浮かせます。','お尻を後ろへ引き、支持脚の膝を指定された深さまで曲げます。','かかとを床につけたままゆっくり立ち上がり、姿勢を整えます。'],
      '膝が内側に入る・骨盤が傾く・ぐらつく場合は中止します。深くしゃがむ競争にしません。',fifa,'運動する側は床について支える脚です。浮かせた脚ではありません。'],
    ['single-leg-heel-raise','片脚でかかとを上げ下げする',2,'片脚でのふくらはぎの筋力を鍛える','安定した台・滑らない靴',
      ['台に手を添え、指定された脚で立ち、反対の足を床から浮かせます。','支持脚の膝を伸ばしたままかかとを上げます。','反動をつけずゆっくりかかとを床へ戻します。'],
      '足首を外側へ倒さず、手で体を持ち上げません。段差の縁では行いません。',strength,'運動する側は床に接してかかとを上げる脚です。手の支え方はPTの指示に従います。'],
    ['floor-push-up','床で腕立て伏せ',2,'肩・腕と体幹の支持力を鍛える','滑らない床・マット',
      ['両手を肩の下につき、両つま先で支えて膝を床から離します。','体を一直線に保ち、肘を横へ広げすぎず指定の深さまで胸を下げます。','両手で床を押して戻ります。腰を反らさず呼吸を続けます。'],
      '肩・手首・肘の痛みや不安定感で中止。肩の荷重許可を確認し、胸を無理に深く下げません。',strength,'左は開始姿勢、右は下ろした姿勢です。動く深さは個別指示を優先します。'],
    ['lateral-hop-stick','片脚で横に跳び、止まる',3,'片脚着地で衝撃を吸収し姿勢を制御する','滑らない靴・障害物のない平らな床',
      ['指定された脚で立ち、膝と股関節を少し曲げます。','指定された横方向・距離へ小さく跳び、同じ脚で静かに着地します。','膝をつま先の方向に曲げて衝撃を吸収し、姿勢を止めてから次を行います。'],
      '跳躍と片脚着地を個別に許可された場合だけ。膝崩れ、痛み、不安定感で中止し、連続で跳びません。',fifa,'同じ脚で離地・着地します。距離と方向はPTが指定し、最初は院内で確認します。'],
    ['plank-shoulder-tap','腕立て姿勢で反対の肩に触れる',3,'片手支持でも肩と体幹を安定させる','滑らない床・マット',
      ['両手を肩の下につき、足を少し広げた腕立て姿勢を作ります。','指定された手を床から離し、反対の肩にゆっくり触れます。','骨盤の向きを保ちながら手を床に戻します。左右交互は指示された場合だけ行います。'],
      '片手荷重の許可後に選択。肩の不安定感・痛み、体の大きなねじれが出たら中止します。',strength,'運動する側は床から離す手です。支持する腕は反対側です。']
  ];
  for(const [key,name,athleteLevel,purpose,equipment,steps,caution,source,imageCaption] of rows){
    EXERCISE_LIBRARY[key]={name,region:'athleteAdvanced',image:key+'.png',params:'回数・時間・負荷はPTと確認',category:key==='lateral-hop-stick'?'function':'strength',difficulty:'発展',athleteLevel,purpose,equipment,steps,caution:caution+' 症状が増える場合は中止し、翌日の反応もPTへ伝えます。',source,imageCaption,clinicalRole:'負荷・フォーム・病期をPTが確認した後の強化候補',selectionNote:'動作を院内で確認し、許可された範囲・負荷だけを処方。段階は動作の目安で、競技復帰判定ではありません。'};
  }
})();

// Athlete home exercise candidates, not complete return-to-sport protocols.
(()=>{
  const sportNote='競技の練習量も運動負荷に含めます。翌日に痛み・腫れ・不安定感が増えたら中止しPTへ相談してください。走る・跳ぶ・投げる・接触練習の再開は、このメニューの達成だけで判断せず医師・PTの許可を受けてください。';
  const rows=[
    ['shoulderImpingement','肩の腱板関連痛',['table-slide','scapular-setting','shoulder-isometric-external','shoulder-band-external','band-row','wall-push-up'],'バンド外旋と壁での支持は負荷再開を確認後。肩をすくめる代償、投球や頭上動作の翌日反応を評価。'],
    ['rotatorCuffTear','腱板断裂',['table-slide','scapular-setting','shoulder-isometric-external','band-row'],'抵抗運動は断裂の状態と残存筋力を評価し許可された範囲だけ。外傷後の急な脱力は運動より再診を優先。'],
    ['anteriorShoulderDislocation','前方脱臼後',['table-slide','scapular-setting','shoulder-isometric-external','shoulder-isometric-internal'],'整復後・骨傷なしの保存療法限定。外転外旋や接触練習への進行は別途評価し、この候補に追加しない。'],
    ['slapLesion','SLAP損傷',['table-slide','scapular-setting','shoulder-isometric-external','shoulder-band-external'],'投球量と引っかかりを確認。上腕二頭筋の負荷や投球プログラムは個別評価が必要。'],
    ['tennisElbow','テニス肘',['wrist-extensor-stretch','wrist-isometric-extension','wrist-eccentric-extension','wrist-resisted-extension','resisted-forearm-turn','gentle-ball-grip'],'手首の等尺性・遠心性・反復抵抗は段階違いとして選ぶ。ラケットや投球の握り込みも負荷に合算。'],
    ['ankleSprain','外側足関節捻挫',['ankle-pumps','heel-raise','supported-single-leg-stance','mini-squat','step-up'],'片脚立ち・浅いスクワット・段差は荷重許可と安定を確認後。疼痛、筋力、本人の自信、バランス、競技動作を復帰前に評価。'],
    ['meniscalInjury','半月板損傷',['heel-slide','quad-setting','straight-leg-raise','bridge','side-lying-hip-abduction','mini-squat','step-up'],'段差と浅いスクワットは荷重許可後、翌日の腫れと膝の制御を確認。深い屈曲・切り返し・ジャンプは別途評価。'],
    ['lowback','非特異的腰痛',['abdominal-brace','bridge','bird-dog','kneeling-plank','side-lying-hip-abduction','walking'],'腰椎分離症などの原因を除外した非特異的腰痛向け。四つ這い・膝プランクは症状安定後、体幹の制御を確認。'],
    ['lumbarDiscHerniation','腰椎椎間板ヘルニア',['abdominal-brace','bird-dog','walking'],'神経症状が安定し体幹・活動練習を許可された人向け。最大筋力・重量挙げ・接触への復帰は個別判断。']
  ];
  for(const [baseDisease,label,exerciseKeys,focus] of rows){
    const base=DISEASE_LIBRARY[baseDisease];
    DISEASE_LIBRARY['athlete_'+baseDisease]={...base,baseDisease,audience:'athlete',name:label+'（アスリート・保存療法）',icon:'🏃',desc:exerciseKeys.length+'候補／基礎〜復帰準備',exerciseKeys,
      guidance:base.guidance+' アスリート用の確認：'+focus+' 競技・ポジション・練習量・翌日の反応を評価。これは競技復帰プログラム全体ではありません。',
      prescriptionNote:base.prescriptionNote+' '+sportNote,
      selectionNote:focus};
  }
  const sources=[{title:'日本整形外科学会：腰椎分離症・分離すべり症',url:'https://www.joa.or.jp/public/sick/condition/spondiyolysis.html'},{title:'Sanford Health：分離症・すべり症の保存療法（2024年改訂・施設プロトコル）',url:'https://www.sanfordhealth.org/-/media/org/files/medical-professionals/resources-and-education/spondylolysis-non-operative-rehabilitation-guideline.pdf'}];
  const guidance='診断と病期（骨癒合を目指す段階か、慢性分離か）、装具、運動・荷重制限を医師に確認します。術後、進行するすべり・神経症状は対象外。骨癒合期に痛みがないことだけで練習を再開しません。腰を反らす・ひねる運動、ジャンプ・重量負荷は自己判断で行いません。初期から行える運動も一律ではなく、医師の許可を優先。週数で自動進行せず、競技復帰は診察と競技動作の評価で判断します。';
  const note='腰椎分離症の保存療法中に医師・PTが許可した運動だけ行います。術後には使いません。装具と運動休止の指示を守り、腰を反らす・ひねる・跳ぶ・重い物を持つ練習を自己判断で再開しません。腰痛が出たら中止して相談してください。新たな脚のしびれ・脱力は早急に受診し、尿が出ない・尿便が漏れる、股の間の感覚低下は直ちに救急受診してください。';
  DISEASE_LIBRARY.spondylolysisProtection={audience:'athlete',name:'腰椎分離症（保護期・運動許可後）',icon:'🏃',desc:'個別許可された基礎運動2候補',guidance,prescriptionNote:note,exerciseKeys:['abdominal-brace','side-lying-hip-abduction'],sources,selectionNote:'骨癒合を目指す期間の運動許可を確認。腰を動かさず保持できる範囲に限る。運動休止の指示があれば処方しない。'};
  DISEASE_LIBRARY.spondylolysisReload={audience:'athlete',name:'腰椎分離症（負荷再開許可後）',icon:'🏃',desc:'体幹・下肢の制御を整える6候補',guidance:guidance+' 医師が負荷再開を許可し、日常動作と基礎運動で症状が増えず腰の中間位を保てる場合だけ選択。',prescriptionNote:note+' 負荷再開の許可を受けた段階の運動です。完了しても競技復帰の許可にはなりません。',exerciseKeys:['abdominal-brace','bridge','bird-dog','kneeling-plank','side-lying-hip-abduction','mini-squat'],sources,selectionNote:'ブリッジ・手足上げ・膝プランクは腰が反らない範囲で選択。進行はフォーム・当日と翌日の症状反応を再評価して決める。'};
})();

// The clinic authorizes standard planks after corset fitting, subject to individual clearance.
(()=>{
  const additions={
    shoulderImpingement:['floor-push-up','plank-shoulder-tap'],
    rotatorCuffTear:['shoulder-band-external','floor-push-up','plank-shoulder-tap'],
    anteriorShoulderDislocation:['shoulder-band-external','band-row','floor-push-up','plank-shoulder-tap'],
    slapLesion:['band-row','floor-push-up','plank-shoulder-tap'],
    tennisElbow:[],
    ankleSprain:['single-leg-heel-raise','split-squat','single-leg-squat','lateral-hop-stick'],
    meniscalInjury:['split-squat','single-leg-squat','lateral-hop-stick'],
    lowback:['forearm-plank','side-plank','single-leg-plank','side-plank-leg-lift','split-squat','single-leg-squat'],
    lumbarDiscHerniation:['forearm-plank','side-plank','single-leg-plank','side-plank-leg-lift']
  };
  const progress='強化・発展は各動作への負荷許可後に選択。フォームと当日・翌日の症状を確認し、重量・回数・速度を同時に増やしません。練習と自主トレの合計負荷を調整します。';
  for(const [base,keys] of Object.entries(additions)){
    const d=DISEASE_LIBRARY['athlete_'+base];
    d.exerciseKeys=[...new Set([...d.exerciseKeys.filter(k=>k!=='kneeling-plank'),...keys])];
    d.selectionNote=d.selectionNote.replace('四つ這い・膝プランク','四つ這い・通常プランク');
    d.guidance+=' '+progress;
    d.guidance+=' 強化候補を追加しています。'+(keys.includes('floor-push-up')?'床での腕立ては両手荷重、肩タッチは片手荷重を許可し院内で安定を確認した後だけ選択します。':'')+(keys.includes('lateral-hop-stick')?'跳躍は、跳躍許可と片脚着地の制御を個別に確認した場合だけです。':'');
    d.desc=d.exerciseKeys.length+'候補／基礎・強化・発展';
    if(['ankleSprain','meniscalInjury','lowback','lumbarDiscHerniation'].includes(base))d.sources=[...(d.sources||[]),{title:'FIFA 11+を用いた大学男子選手の試験（2019）：段階構成の参考・傷害治療の検証ではありません',url:'https://doi.org/10.15857/ksep.2019.28.2.141'}];
  }
  const clinic='院内方針：コルセット装着後、医師・PTが許可し腰の中間位を保てる場合は、膝をつかないプランクと膝を伸ばしたサイドプランクを選択できます。装具だけで自動的に許可せず、装着方法と種目別の可否を確認します。';
  for(const key of ['spondylolysisProtection','spondylolysisReload']){
    const d=DISEASE_LIBRARY[key];
    d.exerciseKeys=d.exerciseKeys.filter(k=>k!=='kneeling-plank');
    d.exerciseKeys.push('forearm-plank','side-plank');
    d.guidance+=' '+clinic;
    d.selectionNote='装具装着後、種目ごとの許可を確認。腰を反らさず、痛みや姿勢の崩れで中止。';
    d.prescriptionNote+=' プランク・サイドプランクはコルセット装着後、医師・PTが許可した場合だけ行います。図に装具がなくても装着指示を守ってください。';
  }
  DISEASE_LIBRARY.spondylolysisProtection.desc='装具装着・個別許可後の4候補';
  const reload=DISEASE_LIBRARY.spondylolysisReload;
  reload.exerciseKeys.push('single-leg-plank','side-plank-leg-lift','split-squat','single-leg-squat');
  reload.desc=reload.exerciseKeys.length+'候補／強化・発展';
  reload.guidance+=' 片脚支持・脚挙上は再評価と種目別の許可後。跳躍・重量挙げの再開は別途判断。';
  EXERCISE_CHOICE_GROUPS['athlete-plank']={name:'前面の体幹支持',note:'通常版と片脚版は進行の選択肢です。両方を足す前に総負荷を確認してください。'};
  EXERCISE_CHOICE_GROUPS['athlete-side-plank']={name:'側面の体幹支持',note:'脚挙上は支持を保てる場合の発展です。自動的に追加しません。'};
  for(const [group,keys] of [['athlete-plank',['forearm-plank','single-leg-plank']],['athlete-side-plank',['side-plank','side-plank-leg-lift']]])for(const key of keys){EXERCISE_LIBRARY[key].choiceGroup=group;EXERCISE_LIBRARY[key].choiceVariant=EXERCISE_LIBRARY[key].name;}
})();
